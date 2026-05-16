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

      if (!response.ok) throw new Error('Failed to join waitlist')

      setStatus('success')
      setEmail('')
    } catch (error) {
      console.error('Waitlist error:', error)
      setStatus('error')
    }
  }

  return (
    <section id="waitlist" className="py-24 px-6 lg:px-8 bg-gradient-to-b from-slate-950 to-black">
      <div className="mx-auto max-w-5xl">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-blue-300/80 mb-4">Private beta</p>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">
              Join the waitlist for founding access and Roblox-first UI workflows.
            </h2>
            <p className="mt-6 text-lg text-slate-300 leading-8 max-w-2xl">
              HUDForge is being built for developers who want to move faster without sacrificing the look and feel of the game.
              Early builders will get founder pricing, launch updates, and a direct line into the product roadmap.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                'Founder pricing lock-in',
                'Early access to new features',
                'Built for Roblox builders only',
              ].map((item) => (
                <div key={item} className="glass-panel rounded-2xl px-4 py-3 text-sm text-slate-200">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-3xl p-8">
            <div className="mb-6">
              <h3 className="text-2xl font-semibold text-white">Get on the list</h3>
              <p className="mt-2 text-slate-300">
                Be first in line when HUDForge opens early access. No spam — just launch updates and product invites.
              </p>
            </div>

            {status === 'success' ? (
              <div className="rounded-2xl border border-emerald-400/40 bg-emerald-500/10 p-6">
                <p className="text-emerald-300 text-lg font-semibold">You’re in. Founding access request received.</p>
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
                    className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-5 py-4 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                  />
                </label>

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 px-6 py-4 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:scale-[1.01] hover:shadow-cyan-500/25 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {status === 'loading' ? 'Joining…' : 'Join waitlist'}
                </button>
              </form>
            )}

            {status === 'error' && (
              <p className="mt-4 text-sm text-red-300">
                Something went wrong. Please try again in a moment.
              </p>
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
