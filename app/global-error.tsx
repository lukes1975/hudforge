'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'
import { ErrorHomeLink, ErrorStateCard } from '@/components/app/ErrorStateCard'
import './globals.css'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="en">
      <body className="min-h-full bg-[color:var(--background)] text-white antialiased">
        <ErrorStateCard
          kicker="Critical error"
          title="HUDForge could not load"
          description="A root layout failure blocked the app from rendering. Try again or return home."
          digest={error.digest}
          onRetry={reset}
        >
          <ErrorHomeLink />
        </ErrorStateCard>
      </body>
    </html>
  )
}
