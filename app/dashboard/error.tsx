'use client'

import * as Sentry from '@sentry/nextjs'
import Link from 'next/link'
import { useEffect } from 'react'
import { ErrorStateCard } from '@/components/app/ErrorStateCard'

export default function DashboardError({
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
      kicker="Generation workspace"
      title="Generation failed"
      description="The dashboard could not load your workspace. Retry the page or open your saved projects to recover recent work."
      digest={error.digest}
      onRetry={reset}
    >
      <Link href="/projects" className="forge-button forge-button--secondary">
        View projects
      </Link>
    </ErrorStateCard>
  )
}
