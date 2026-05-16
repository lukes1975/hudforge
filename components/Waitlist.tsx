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
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_15%,rgba(34,211,238,0.09),transparent_22%),radial-gradient(circle_at_80%_70%,rgba(245,158,11,0.08),transparent_18%)]" />
      <div className="mx-auto max-w-5xl">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="mb-4 text-sm uppercase tracking-[0.34em] text-cyan-200/70">Private beta</p>
            <h2 className="text-3xl font-black tracking-tight text-white sm:text-5xl">
              Join the waitlist for founding access and Roblox-first UI workflows.
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              HUDForge is being built for developers who want to move faster without sacrificing the look and feel of the game.
              Early builders will get founder pricing, launch updates, and a direct line into the product roadmap.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {['Founder pricing lock-in', 'Early access to new features', 'Built for Roblox builders only'].map((item) => (
                <div key={item} className="hud-frame rounded-2xl px-4 py-3 text-sm text-slate-200">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="hud-frame rounded-3xl p-8">
            <div className="mb-6">
              <h3 className="text-2xl font-semibold text-white">Get on the list</h3>
              <p className="mt-2 text-slate-300">
                Be first in line when HUDForge opens early access. No spam — just launch updates and product invites.
              </p>
            </div>

            {status === 'success' ? (
              <div className="rounded-2xl border border-emerald-400/40 bg-emerald-400/10 p-6">
                <p className="text-lg font-semibold text-emerald-200">You’re in. Founding access request received.</p>
                <p className="mt-2 text-sm text-emerald-100/80">We’ll email you as soon as the next invite batch is ready.</p>
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
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-5 py-4 text-white placeholder:text-slate-500 transition-all duration-300 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-300/25"
                  />
                </label>

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full rounded-2xl bg-gradient-to-r from-cyan-400 via-violet-500 to-amber-400 px-6 py-4 text-base font-semibold text-slate-950 shadow-[0_18px_60px_rgba(34,211,238,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_70px_rgba(168,85,247,0.18)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {status === 'loading' ? 'Joining…' : 'Join waitlist'}
                </button>
              </form>
            )}

            {status === 'error' && (
              <p className="mt-4 text-sm text-red-300">Something went wrong. Please try again in a moment.</p>
            )}

            <div className="mt-6 flex flex-wrap gap-3 text-xs text-slate-400">
              <span className="rounded-full border border-slate-700 px-3 py-1">Private beta</span>
              <span className="rounded-full border border-slate-700 px-3 py-1">Founder pricing</span>
              <span className="rounded-full border border-slate-700 px-3 py-1">Roblox-first</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
