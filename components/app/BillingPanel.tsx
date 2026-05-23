'use client'

import { useEffect, useState } from 'react'
import type { BillingStatus } from '@/lib/hudforge-generation'
import { formatBillingState } from '@/lib/hudforge-client'

type BillingResponse = {
  success: boolean
  billing?: BillingStatus
  error?: { message: string }
}

type CheckoutResponse = {
  success: boolean
  checkout?: { checkout_url: string; plan_id: string }
  error?: { message: string }
}

const planCards = [
  { id: 'free', name: 'Free', price: '£0', detail: 'Validate the workflow with starter generation credits.', highlight: 'Current foundation plan' },
  { id: 'starter', name: 'Starter', price: '£10/mo', detail: '150 credits/month for solo Roblox creators testing real UI exports.', highlight: 'Live checkout when configured' },
  { id: 'pro', name: 'Pro', price: '£30/mo', detail: '600 credits/month for high-volume creators and small teams.', highlight: 'Best margin path' },
]

export function BillingPanel() {
  const [billing, setBilling] = useState<BillingStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [checkoutPlan, setCheckoutPlan] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadBilling() {
      setLoading(true)
      setError(null)
      try {
        const payload = await fetchJson<BillingResponse>('/api/billing/status')
        if (!payload.success || !payload.billing) throw new Error(payload.error?.message ?? 'Failed to load billing')
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

  async function startCheckout(planId: string) {
    setError(null)
    setCheckoutPlan(planId)
    try {
      const payload = await fetchJson<CheckoutResponse>('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_id: planId }),
      })
      if (!payload.success || !payload.checkout?.checkout_url) throw new Error(payload.error?.message ?? 'Checkout unavailable')
      window.location.assign(payload.checkout.checkout_url)
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : 'Checkout unavailable')
      setCheckoutPlan(null)
    }
  }

  if (loading) {
    return <StatusCard title="Loading billing" detail="Fetching GET /api/billing/status..." />
  }

  if (error || !billing) {
    return <StatusCard tone="error" title="Billing unavailable" detail={error ?? 'The billing API did not return a status.'} />
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-4">
        <MetricCard label="State" value={formatBillingState(billing.state)} detail={`Provider: ${billing.provider}`} />
        <MetricCard label="Plan" value={billing.current_plan.name} detail={`${billing.current_plan.credits} credits included`} />
        <MetricCard label="Credits left" value={String(billing.credits_remaining)} detail={`${billing.credits_used} used of ${billing.credits_included}`} />
        <MetricCard label="Checkout" value={billing.checkout_ready ? 'Ready' : 'Mock'} detail={billing.customer_portal_ready ? 'Portal available' : 'Needs Lemon Squeezy env'} />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {planCards.map((plan) => (
          <article key={plan.name} className={`rune-card p-6 ${plan.name === billing.current_plan.name ? 'border-cyan-400/35' : ''}`}>
            <p className="section-kicker">{plan.highlight}</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">{plan.name}</h2>
            <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-cyan-100">{plan.price}</p>
            <p className="mt-3 text-sm leading-6 text-slate-400">{plan.detail}</p>
            <button type="button" disabled={!billing.checkout_ready || plan.id === billing.current_plan.id || checkoutPlan === plan.id} onClick={() => void startCheckout(plan.id)} className="forge-button forge-button--secondary mt-5 w-full justify-center">
              {plan.id === billing.current_plan.id ? billing.current_plan.cta : checkoutPlan === plan.id ? 'Opening checkout...' : billing.checkout_ready ? 'Upgrade' : 'Checkout not configured'}
            </button>
          </article>
        ))}
      </section>

      <section className="rune-card p-6">
        <p className="section-kicker">Integration status</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">Lemon Squeezy-ready, not claiming live billing.</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
          This page reads billing status, opens Lemon Squeezy checkout when credentials are configured, and credits accounts from signed Lemon Squeezy webhooks.
        </p>
      </section>
    </div>
  )
}

function MetricCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <article className="rune-card p-5">
      <p className="section-kicker">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-400">{detail}</p>
    </article>
  )
}

function StatusCard({ title, detail, tone = 'default' }: { title: string; detail: string; tone?: 'default' | 'error' }) {
  return (
    <section className={`rune-card p-6 ${tone === 'error' ? 'border-red-400/30' : ''}`}>
      <p className="section-kicker">Billing</p>
      <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-slate-400">{detail}</p>
    </section>
  )
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init)
  const payload = (await response.json()) as T
  if (!response.ok) {
    const maybeError = payload as { error?: { message?: string } }
    throw new Error(maybeError.error?.message ?? `Request failed with ${response.status}`)
  }
  return payload
}
