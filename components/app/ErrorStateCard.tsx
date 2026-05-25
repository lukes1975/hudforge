'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'

export function ErrorStateCard({
  kicker,
  title,
  description,
  digest,
  onRetry,
  retryLabel = 'Try again',
  children,
}: {
  kicker: string
  title: string
  description: string
  digest?: string
  onRetry?: () => void
  retryLabel?: string
  children?: ReactNode
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-5 py-16">
      <section className="rune-card max-w-lg p-8 text-center">
        <p className="section-kicker">{kicker}</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">{title}</h1>
        <p className="mt-3 text-sm leading-7 text-slate-400">{description}</p>
        {digest ? <p className="mt-3 font-mono text-xs text-slate-500">Ref: {digest}</p> : null}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {onRetry ? (
            <button type="button" onClick={onRetry} className="forge-button forge-button--primary">
              {retryLabel}
            </button>
          ) : null}
          {children}
        </div>
      </section>
    </div>
  )
}

export function ErrorHomeLink() {
  return (
    <Link href="/" className="forge-button forge-button--secondary">
      Back to home
    </Link>
  )
}
