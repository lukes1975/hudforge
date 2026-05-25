import { NextRequest, NextResponse } from 'next/server'
import { hudforgeError, requireHudforgeUser } from '@/lib/hudforge-api'
import { ApiError, createGeneration, validateGenerateRequest } from '@/lib/generation'

export async function POST(req: NextRequest) {
  try {
    await requireHudforgeUser()
    const body = await req.json().catch(() => {
      throw new ApiError('Invalid JSON body', 400, 'invalid_json')
    })
    const { prompt, style } = validateGenerateRequest(body)

    const generation = await createGeneration(prompt, style)

    return NextResponse.json(
      {
        success: true,
        generation,
      },
      { status: 202 }
    )
  } catch (error) {
    if (error instanceof ApiError) {
      return handleApiError(error, 'Generation failed')
    }
    return hudforgeError(error, 'Generation failed')
  }
}

function handleApiError(error: unknown, fallbackMessage: string) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      },
      {
        status: error.status,
        headers: error.retryAfter ? { 'Retry-After': String(error.retryAfter) } : undefined,
      }
    )
  }

  console.error(fallbackMessage, error)
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'internal_error',
        message: fallbackMessage,
      },
    },
    { status: 500 }
  )
}
