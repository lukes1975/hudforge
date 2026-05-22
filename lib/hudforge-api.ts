import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { HudforgeServiceError } from './hudforge-generation'

export async function requireHudforgeUser() {
  const { userId } = await auth()
  if (!userId) {
    throw new HudforgeServiceError('Authentication required', 401, 'unauthorized')
  }
  return userId
}

export function hudforgeJson(data: Record<string, unknown>, status = 200) {
  return NextResponse.json({ success: true, ...data }, { status })
}

export function hudforgeError(error: unknown, fallbackMessage: string) {
  if (error instanceof HudforgeServiceError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      },
      { status: error.status }
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
