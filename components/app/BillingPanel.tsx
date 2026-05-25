'use client'

import { useEffect, useState } from 'react'
import type { BillingStatus, CreditTopUpId } from '@/lib/hudforge-generation'
import { formatBillingState } from '@/lib/hudforge-client'

type BillingResponse = {
  success: boolean
  billing?: BillingStatus
  error?: { message: string }
}

type CheckoutResponse = {
  success: boolean
  checkout?: { checkout_url: string; plan_id?: string; topup_id?: string }
  error?: { message: string }
}

const planCards = [
  { id: 'free', name: 'Free', price: '$0', credits: '25 credits', features: ['5 generations', 'PNG export', 'Community support'], highlight: 'Current plan' },
  { id: 'starter', name: 'Starter', price: '$19/mo', credits: '250 credits/mo', features: ['50 generations', 'PNG + basic Luau export', '10 saved projects', 'Standard queue'], highlight: 'For solo creators' },
  { id: 'pro', name: 'Pro', price: '$49/mo', credits: '1,000 credits/mo', features: ['200 generations', 'Full Luau export', '100 saved projects', 'Priority queue', 'Premium styles'], highlight: 'Most popular', popular: true },
  { id: 'dev', name: 'Dev', price: '$200/mo', credits: '2,500 credits/mo', features: ['500 generations', 'Full Luau export', '100 saved projects', 'Priority queue', 'Premium styles'], highlight: 'Coming soon', disabled: true },
]

const topUpCards = [
  { id: 'topup_250' as CreditTopUpId, credits: '250', price: '$9' },
  { id: 'topup_1000' as CreditTopUpId, credits: '1,000', price: '$29' },
  { id: 'topup_3000' as CreditTopUpId, credits: '3,000', price: '$69' },
]

export function BillingPanel() {
  const [billing, setBilling] = useState<BillingStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [checkoutPlan, setCheckoutPlan] = useState<string | null>(null)
  const [checkoutTopUp, setCheckoutTopUp] = useState<string | null>(null)
  const [openingPortal, setOpeningPortal] = useState(false)

  const canManageSubscription = billing?.state === 'active_paid' || billing?.state === 'trial'

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

  async function startTopUp(topUpId: CreditTopUpId) {
    setError(null)
    setCheckoutTopUp(topUpId)
    try {
      const payload = await fetchJson<CheckoutResponse>('/api/billing/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topup_id: topUpId }),
      })
      if (!payload.success || !payload.checkout?.checkout_url) throw new Error(payload.error?.message ?? 'Top-up checkout unavailable')
      window.location.assign(payload.checkout.checkout_url)
    } catch (topUpError) {
      setError(topUpError instanceof Error ? topUpError.message : 'Top-up checkout unavailable')
      setCheckoutTopUp(null)
    }
  }

  async function openCustomerPortal() {
    setError(null)
    setOpeningPortal(true)
    try {
      const payload = await fetchJson<{ success: boolean; portal_url?: string; error?: { message: string } }>('/api/billing/portal')
      if (!payload.success || !payload.portal_url) throw new Error(payload.error?.message ?? 'Customer portal unavailable')
      window.location.assign(payload.portal_url)
    } catch (portalError) {
      setError(portalError instanceof Error ? portalError.message : 'Customer portal unavailable')
      setOpeningPortal(false)
    }
  }

  if (loading) {
    return <StatusCard title="Loading billing" detail="Fetching billing status..." />
  }

  if (error || !billing) {
    return <StatusCard tone="error" title="Billing unavailable" detail={error ?? 'The billing API did not return a status.'} />
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-4">
        <MetricCard label="State" value={formatBillingState(billing.state)} detail={`Provider: ${billing.provider}`} />
        <MetricCard label="Plan" value={billing.current_plan.name} detail={`${billing.current_plan.credits} credits included`} />
        <MetricCard label="Credits left" value={String(billing.credits_remaining)} detail={`${billing.credits_used} used of ${billing.credits_included}`} />
        <MetricCard label="Checkout" value={billing.checkout_ready ? 'Ready' : 'Mock'} detail={billing.customer_portal_ready ? 'Portal available' : 'Needs Lemon Squeezy env'} />
      </section>

      {canManageSubscription && billing.customer_portal_ready ? (
        <section className="rune-card p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="section-kicker">Subscription</p>
              <h2 className="mt-2 text-xl font-semibold text-white">Manage your {billing.current_plan.name} plan</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">Update payment method, change plan, or cancel through the Lemon Squeezy customer portal.</p>
            </div>
            <button
              type="button"
              disabled={openingPortal}
              onClick={() => void openCustomerPortal()}
              className="forge-button forge-button--secondary"
            >
              {openingPortal ? 'Opening portal...' : 'Manage subscription'}
            </button>
          </div>
        </section>
      ) : null}

      <section>
        <h2 className="text-lg font-semibold text-white mb-4">Subscription plans</h2>
        <div className="grid gap-6 lg:grid-cols-4">
          {planCards.map((plan) => (
            <article key={plan.id} className={`rune-card p-6 relative ${plan.popular ? 'border-cyan-400/50 ring-1 ring-cyan-400/20' : ''} ${plan.id === billing.current_plan.id ? 'border-cyan-400/35' : ''}`}>
              {plan.popular && <span className="absolute -top-3 left-4 bg-cyan-500 text-black text-xs font-bold px-2.5 py-0.5 rounded-full">Popular</span>}
              <p className="section-kicker">{plan.highlight}</p>
              <h3 className="mt-3 text-2xl font-semibold text-white">{plan.name}</h3>
              <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-cyan-100">{plan.price}</p>
              <p className="mt-1 text-sm text-slate-400">{plan.credits}</p>
              <ul className="mt-4 space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="text-sm text-slate-300 flex items-start gap-2">
                    <span className="text-cyan-400 mt-0.5">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                disabled={plan.disabled || !billing.checkout_ready || plan.id === billing.current_plan.id || plan.id === 'free' || checkoutPlan === plan.id}
                onClick={() => void startCheckout(plan.id)}
                className="forge-button forge-button--secondary mt-5 w-full justify-center"
              >
                {plan.disabled ? 'Coming soon' : plan.id === billing.current_plan.id ? 'Current plan' : checkoutPlan === plan.id ? 'Opening checkout...' : billing.checkout_ready ? 'Upgrade' : 'Checkout not configured'}
              </button>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white mb-4">Buy credits</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {topUpCards.map((topUp) => (
            <article key={topUp.id} className="rune-card p-6">
              <p className="text-2xl font-semibold text-white">{topUp.credits} credits</p>
              <p className="mt-1 text-3xl font-semibold tracking-[-0.04em] text-cyan-100">{topUp.price}</p>
              <p className="mt-2 text-sm text-slate-400">One-time purchase, no expiry</p>
              <button
                type="button"
                disabled={!billing.checkout_ready || checkoutTopUp === topUp.id}
                onClick={() => void startTopUp(topUp.id)}
                className="forge-button forge-button--secondary mt-5 w-full justify-center"
              >
                {checkoutTopUp === topUp.id ? 'Opening checkout...' : billing.checkout_ready ? 'Buy credits' : 'Checkout not configured'}
              </button>
            </article>
          ))}
        </div>
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
