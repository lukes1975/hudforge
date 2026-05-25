'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'
import { ErrorHomeLink, ErrorStateCard } from '@/components/app/ErrorStateCard'

export default function Error({
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
    <ErrorStateCard
      kicker="Something went wrong"
      title="We hit an unexpected error"
      description="HUDForge saved your session where possible. Try again, or return home while we investigate."
      digest={error.digest}
      onRetry={reset}
    >
      <ErrorHomeLink />
    </ErrorStateCard>
  )
}
