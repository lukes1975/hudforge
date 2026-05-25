import * as Sentry from '@sentry/nextjs'
import type { Scope } from '@sentry/core'
import { NextResponse } from 'next/server'
import { getHudforgeUserId } from './hudforge-auth'
import { HudforgeServiceError } from './hudforge-generation'

export async function requireHudforgeUser() {
  const userId = await getHudforgeUserId()
  if (!userId) {
    throw new HudforgeServiceError('Authentication required', 401, 'unauthorized')
  }
  return userId
}

export function hudforgeJson(data: Record<string, unknown>, status = 200) {
  return NextResponse.json({ success: true, ...data }, { status })
}

export interface HudforgeErrorSentryContext {
  tags?: Record<string, string>
  level?: Sentry.SeverityLevel
}

async function reportHudforgeErrorToSentry(
  error: unknown,
  fallbackMessage: string,
  sentryContext?: HudforgeErrorSentryContext
) {
  if (!process.env.SENTRY_DSN) return

  await import('../sentry.server.config')

  const userId = await getHudforgeUserId().catch(() => null)
  if (userId) {
    Sentry.setUser({ id: userId })
  }

  Sentry.withScope((scope: Scope) => {
    if (sentryContext?.tags) {
      for (const [key, value] of Object.entries(sentryContext.tags)) {
        scope.setTag(key, value)
      }
    }
    if (sentryContext?.level) {
      scope.setLevel(sentryContext.level)
    }
    scope.setExtra('fallbackMessage', fallbackMessage)

    if (error instanceof Error) {
      Sentry.captureException(error)
      return
    }

    Sentry.captureMessage(fallbackMessage, {
      level: sentryContext?.level ?? 'error',
      extra: { error },
    })
  })
}

export function hudforgeError(
  error: unknown,
  fallbackMessage: string,
  sentryContext?: HudforgeErrorSentryContext
) {
  if (error instanceof HudforgeServiceError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      },
      { status: error.status }
    )
  }

  console.error(fallbackMessage, error)
  void reportHudforgeErrorToSentry(error, fallbackMessage, sentryContext)

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
