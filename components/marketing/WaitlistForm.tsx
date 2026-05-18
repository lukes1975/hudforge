'use client'

import type { FormEvent } from 'react'
import { useState } from 'react'

type WaitlistFormProps = {
  source?: string
  compact?: boolean
}

export function WaitlistForm({ source = 'marketing_redesign', compact = false }: WaitlistFormProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('loading')

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source }),
      })

      if (!response.ok) {
        throw new Error('Waitlist request failed')
      }

      setEmail('')
      setStatus('success')
    } catch (error) {
      console.error('Waitlist error:', error)
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="rune-card border-cyan-300/30 bg-cyan-300/10 p-5">
        <p className="font-semibold text-cyan-50">You are on the list.</p>
        <p className="mt-2 text-sm leading-6 text-cyan-50/80">We will send beta access details when the next invite wave opens.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={compact ? 'grid gap-3 sm:grid-cols-[1fr_auto]' : 'grid gap-4'} aria-label="Join the HUDForge waitlist">
      <label className="sr-only" htmlFor={`waitlist-email-${source}`}>
        Email address
      </label>
      <input
        id={`waitlist-email-${source}`}
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="creator@studio.dev"
        required
        className="min-h-12 rounded-xl border border-white/12 bg-black/30 px-4 text-base text-white outline-none transition focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/20"
      />
      <button type="submit" disabled={status === 'loading'} className="forge-button forge-button--primary disabled:cursor-not-allowed disabled:opacity-60">
        {status === 'loading' ? 'Joining...' : 'Join Waitlist'}
      </button>
      {status === 'error' ? <p className="text-sm text-red-200 sm:col-span-2">Something went wrong. Please try again in a moment.</p> : null}
    </form>
  )
}
