import { NextRequest, NextResponse } from 'next/server'
import { ApiError, getGeneration } from '@/lib/generation'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const generation = await getGeneration(id)

    return NextResponse.json({
      success: true,
      generation,
    })
  } catch (error) {
    return handleApiError(error, 'Failed to fetch generation')
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
