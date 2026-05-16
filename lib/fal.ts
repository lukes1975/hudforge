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

type FalImageResult = { url?: string; content_type?: string }

type FalResultResponse = {
  images?: FalImageResult[]
  image?: FalImageResult
  data?: { images?: FalImageResult[] }
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
    }),
  })

  if (!submitResponse.ok) {
    throw new Error(`fal.ai request failed with status ${submitResponse.status}`)
  }

  const queuePayload = (await submitResponse.json()) as FalQueueResponse
  const responseUrl = queuePayload.response_url

  if (!responseUrl) {
    throw new Error('fal.ai did not return a response URL')
  }

  const result = await waitForFalResult(responseUrl, falKey)
  const image = getFirstImage(result)

  if (!image?.url) {
    throw new Error('fal.ai returned no image URL for generated asset')
  }

  const imageResponse = await fetch(image.url, {
    headers: {
      Authorization: `Key ${falKey}`,
    },
  })

  if (!imageResponse.ok) {
    throw new Error(`Failed to download generated asset from fal.ai (${imageResponse.status})`)
  }

  const arrayBuffer = await imageResponse.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const outputDir = DEFAULT_OUTPUT_DIR
  const extension = extensionFromContentType(imageResponse.headers.get('content-type') ?? image.content_type)
  const fileName = `${safeAssetName}.${extension}`
  const absolutePath = path.join(outputDir, fileName)

  await mkdir(outputDir, { recursive: true })
  await writeFile(absolutePath, buffer)

  return {
    assetName: safeAssetName,
    fileName,
    publicPath: `/generated/hero/${fileName}`,
    absolutePath,
    model: safeModel,
    sourceUrl: image.url,
  }
}

async function waitForFalResult(responseUrl: string, falKey: string) {
  for (let attempt = 0; attempt < 90; attempt += 1) {
    if (attempt > 0) {
      await new Promise((resolve) => setTimeout(resolve, 2000))
    }

    const response = await fetch(responseUrl, {
      headers: {
        Authorization: `Key ${falKey}`,
      },
    })

    if (response.ok) {
      return (await response.json()) as FalResultResponse
    }

    const body = await response.text()
    if (response.status === 400 && body.toLowerCase().includes('still in progress')) {
      continue
    }

    throw new Error(`fal.ai polling failed with status ${response.status}`)
  }

  throw new Error('Timed out waiting for fal.ai asset generation')
}

function getFirstImage(payload: FalResultResponse) {
  return payload.images?.[0] ?? payload.data?.images?.[0] ?? payload.image
}

function extensionFromContentType(contentType?: string) {
  if (!contentType) {
    return 'jpg'
  }

  if (contentType.includes('png')) {
    return 'png'
  }

  if (contentType.includes('webp')) {
    return 'webp'
  }

  if (contentType.includes('jpeg') || contentType.includes('jpg')) {
    return 'jpg'
  }

  return 'jpg'
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
