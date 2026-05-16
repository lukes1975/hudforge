'use client'

import { useState } from 'react'

export function Waitlist() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          source: 'landing_page',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to join waitlist')
      }

      setStatus('success')
      setEmail('')
    } catch (error) {
      console.error('Waitlist error:', error)
      setStatus('error')
    }
  }

  return (
    <section id="waitlist" className="relative overflow-hidden px-6 py-24 lg:px-8">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_24%_16%,rgba(111,120,255,0.09),transparent_22%),radial-gradient(circle_at_82%_76%,rgba(118,185,0,0.08),transparent_18%)]" />
      <div className="section-shell grid items-center gap-8 rounded-[2rem] border border-white/8 bg-[rgba(255,255,255,0.02)] p-6 lg:grid-cols-[1.02fr_0.98fr] lg:p-8">
        <div className="max-w-2xl">
          <span className="section-kicker">Private beta</span>
          <h2 className="mt-5 text-3xl font-medium tracking-[-0.045em] text-white sm:text-5xl">
            Join the waitlist for founding access and Roblox-first UI workflows.
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-300">
            HUDForge is being built for developers who want to move faster without sacrificing game feel. Early builders get
            founder pricing, launch updates, and a direct line into the roadmap.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {['Founder pricing lock-in', 'Early access to new features', 'Built for Roblox builders only'].map((item) => (
              <div key={item} className="rounded-[1.25rem] border border-white/8 bg-black/28 px-4 py-4 text-sm text-slate-200">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="hud-frame rounded-[1.8rem] p-6 lg:p-7">
          <div className="mb-6 border-b border-white/8 pb-5">
            <h3 className="text-2xl font-semibold tracking-[-0.03em] text-white">Get on the list</h3>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Be first in line when HUDForge opens early access. No spam, just launch updates and product invites.
            </p>
          </div>

          {status === 'success' ? (
            <div className="rounded-[1.2rem] border border-lime-400/24 bg-lime-400/10 p-6">
              <p className="text-lg font-semibold text-lime-100">You’re in. Founding access request received.</p>
              <p className="mt-2 text-sm text-lime-50/80">We’ll email you as soon as the next invite batch is ready.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-200">Email address</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@studio.dev"
                  required
                  className="w-full rounded-xl border border-white/10 bg-black/35 px-4 py-4 text-white placeholder:text-slate-500 transition-all duration-300 focus:border-indigo-300/40 focus:outline-none focus:ring-2 focus:ring-indigo-300/20"
                />
              </label>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="primary-cta w-full px-6 text-base font-semibold disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === 'loading' ? 'Joining…' : 'Join waitlist'}
              </button>
            </form>
          )}

          {status === 'error' && <p className="mt-4 text-sm text-red-300">Something went wrong. Please try again in a moment.</p>}

          <div className="mt-6 flex flex-wrap gap-3 text-xs text-slate-400">
            <span className="rounded-full border border-white/10 px-3 py-1">Private beta</span>
            <span className="rounded-full border border-white/10 px-3 py-1">Founder pricing</span>
            <span className="rounded-full border border-white/10 px-3 py-1">Roblox-first</span>
          </div>
        </div>
      </div>
    </section>
  )
}
