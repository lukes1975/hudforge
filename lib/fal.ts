import 'server-only'

import { mkdir, writeFile } from 'node:fs/promises'
import * as path from 'node:path'

const DEFAULT_FAL_MODEL = 'fal-ai/flux/dev'
const DEFAULT_OUTPUT_DIR = path.join(process.cwd(), 'public', 'generated', 'hero')
const ALLOWED_FAL_MODELS = new Set([DEFAULT_FAL_MODEL])

type HeroAssetRequest = {
  prompt: string
  assetName: string
  model?: string
}

type FalQueueResponse = {
  request_id?: string
  response_url?: string
  status_url?: string
  error?: string
}

type FalResultResponse = {
  images?: Array<{ url?: string; content_type?: string }>
  image?: { url?: string; content_type?: string }
  data?: { images?: Array<{ url?: string; content_type?: string }> }
}

function getFalKey() {
  const falKey = process.env.FAL_KEY

  if (!falKey) {
    throw new Error('Missing FAL_KEY. Add it to .env.local for offline Day 1 asset generation.')
  }

  return falKey
}

export async function generateHeroAsset({ prompt, assetName, model = DEFAULT_FAL_MODEL }: HeroAssetRequest) {
  const falKey = getFalKey()
  const safeModel = getAllowedModel(model)
  const safeAssetName = sanitizeAssetName(assetName)

  if (!safeAssetName) {
    throw new Error('assetName must contain at least one letter or number')
  }

  const submitResponse = await fetch(`https://queue.fal.run/${safeModel}`, {
    method: 'POST',
    headers: {
      Authorization: `Key ${falKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      image_size: 'landscape_16_9',
      num_images: 1,
      sync_mode: true,
    }),
  })

  if (!submitResponse.ok) {
    throw new Error(`fal.ai request failed with status ${submitResponse.status}`)
  }

  const payload = (await submitResponse.json()) as FalQueueResponse & FalResultResponse
  const imageUrl =
    payload.images?.[0]?.url ?? payload.data?.images?.[0]?.url ?? payload.image?.url ?? payload.response_url ?? undefined

  if (!imageUrl) {
    throw new Error('fal.ai returned no image URL for generated asset')
  }

  const imageResponse = await fetch(imageUrl)
  if (!imageResponse.ok) {
    throw new Error(`Failed to download generated asset from fal.ai (${imageResponse.status})`)
  }

  const arrayBuffer = await imageResponse.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const outputDir = DEFAULT_OUTPUT_DIR
  const fileName = `${safeAssetName}.png`
  const absolutePath = path.join(outputDir, fileName)

  await mkdir(outputDir, { recursive: true })
  await writeFile(absolutePath, buffer)

  return {
    assetName: safeAssetName,
    fileName,
    publicPath: `/generated/hero/${fileName}`,
    absolutePath,
    model: safeModel,
    sourceUrl: imageUrl,
  }
}

function getAllowedModel(model: string) {
  if (!ALLOWED_FAL_MODELS.has(model)) {
    throw new Error(`Unsupported fal.ai model: ${model}`)
  }

  return model
}

function sanitizeAssetName(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
