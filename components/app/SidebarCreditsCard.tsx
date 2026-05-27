'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { BillingStatus } from '@/lib/hudforge-generation'

type BillingResponse = {
  success: boolean
  billing?: BillingStatus
  error?: { message: string }
}

export function SidebarCreditsCard({ collapsed = false }: { collapsed?: boolean }) {
  const [billing, setBilling] = useState<BillingStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadBilling() {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch('/api/billing/status')
        const payload = (await response.json()) as BillingResponse
        if (!response.ok || !payload.success || !payload.billing) {
          throw new Error(payload.error?.message ?? 'Failed to load billing')
        }
        if (active) setBilling(payload.billing)
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Failed to load billing')
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadBilling()
    return () => {
      active = false
    }
  }, [])

  if (collapsed) {
    return (
      <Link
        href="/billing"
        className="app-sidebar-credits app-sidebar-credits--collapsed"
        title={billing ? `${billing.credits_remaining} credits · ${billing.current_plan.name}` : 'Billing'}
      >
        <span className="app-sidebar-credits__value">{loading ? '…' : (billing?.credits_remaining ?? '—')}</span>
      </Link>
    )
  }

  return (
    <div className="app-sidebar-credits">
      <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">Credits</p>
      {loading ? (
        <p className="mt-2 text-sm text-slate-400">Loading balance...</p>
      ) : error || !billing ? (
        <p className="mt-2 text-sm text-slate-400">{error ?? 'Balance unavailable'}</p>
      ) : (
        <>
          <p className="mt-2 text-2xl font-semibold text-white">{billing.credits_remaining}</p>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            {billing.current_plan.name} plan
          </p>
        </>
      )}
      <Link href="/billing" className="mt-3 inline-block text-xs font-medium text-cyan-100 hover:text-white">
        Manage billing →
      </Link>
    </div>
  )
}
