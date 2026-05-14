import { NextRequest, NextResponse } from 'next/server'
import { ApiError, checkRateLimit, createGeneration, validateGenerateRequest } from '@/lib/generation'

export async function POST(req: NextRequest) {
  try {
    const rateLimit = checkRateLimit(getRateLimitKey(req))
    const body = await req.json().catch(() => {
      throw new ApiError('Invalid JSON body', 400, 'invalid_json')
    })
    const { prompt, style } = validateGenerateRequest(body)

    // TODO: Replace this local limiter with account-aware credits before launch.
    // TODO: Deduct credits only after the provider accepts the prediction.
    const generation = await createGeneration(prompt, style)

    return NextResponse.json(
      {
        success: true,
        generation,
      },
      {
        status: 202,
        headers: {
          'X-RateLimit-Remaining': String(rateLimit.remaining),
          'X-RateLimit-Reset': String(Math.ceil(rateLimit.resetAt / 1000)),
        },
      }
    )
  } catch (error) {
    return handleApiError(error, 'Generation failed')
  }
}

function getRateLimitKey(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'anonymous'
  )
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
