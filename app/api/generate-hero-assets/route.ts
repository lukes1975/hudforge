import { NextRequest, NextResponse } from 'next/server'
import { generateHeroAsset } from '@/lib/fal'

function isAssetRouteEnabled() {
  return process.env.NODE_ENV !== 'production'
}

export async function POST(request: NextRequest) {
  try {
    if (!isAssetRouteEnabled()) {
      return NextResponse.json({ error: 'Hero asset generation is disabled in production' }, { status: 403 })
    }

    const body = await request.json().catch(() => null)

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const payload = body as {
      prompt?: string
      assetName?: string
      model?: string
    }

    if (!payload.prompt || !payload.assetName) {
      return NextResponse.json({ error: 'prompt and assetName are required' }, { status: 400 })
    }

    const asset = await generateHeroAsset({
      prompt: payload.prompt,
      assetName: payload.assetName,
      model: payload.model,
    })

    return NextResponse.json({ success: true, asset })
  } catch (error) {
    console.error('Hero asset generation failed', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during hero asset generation',
      },
      { status: 500 }
    )
  }
}
