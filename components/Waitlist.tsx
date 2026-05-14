'use client'

import { useState } from 'react'

export function Waitlist() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    
    // TODO: Integrate with Supabase
    // For now, simulate API call
    setTimeout(() => {
      console.log('Waitlist signup:', email)
      setStatus('success')
      setEmail('')
    }, 1000)
  }

  return (
    <div id="waitlist" className="py-24 px-6 lg:px-8 bg-gradient-to-b from-black to-gray-900">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl mb-6">
          Join the Waitlist
        </h2>
        <p className="text-xl text-gray-400 mb-12">
          Be among the first to ship professional Roblox UI with AI. Early access members get founding pricing.
        </p>
        
        {status === 'success' ? (
          <div className="p-6 bg-green-500/10 border border-green-500/50 rounded-lg">
            <p className="text-green-400 text-lg font-semibold">✓ You're on the list! Check your email soon.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="flex-1 px-6 py-4 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-semibold text-white hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
            >
              {status === 'loading' ? 'Joining...' : 'Get Early Access'}
            </button>
          </form>
        )}

        {status === 'error' && (
          <p className="mt-4 text-red-400">Something went wrong. Please try again.</p>
        )}
      </div>
    </div>
  )
}
