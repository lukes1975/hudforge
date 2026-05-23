'use client'

import { useEffect, useState } from 'react'
import type { HudforgeAnalyticsSummary } from '../../lib/analytics'

export default function AlertPanel() {
  const [summary, setSummary] = useState<HudforgeAnalyticsSummary | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function loadSummary() {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch('/api/analytics/summary', { cache: 'no-store' })
        if (!response.ok) throw new Error(`Analytics request failed with status ${response.status}`)
        const payload = (await response.json()) as HudforgeAnalyticsSummary
        if (!cancelled) setSummary(payload)
      } catch (loadError) {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : 'Failed to load analytics')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadSummary()
    return () => {
      cancelled = true
    }
  }, [])

  const blockers = summary?.health.blockers ?? []

  return (
    <div className="h-full rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-white">Product Health</h3>
          <div className="text-sm text-slate-400">Durable analytics from HUDForge usage events</div>
        </div>
      </div>

      {loading ? <div className="py-8 text-center text-slate-400">Loading analytics...</div> : null}
      {error ? <div className="rounded-lg border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-100">{error}</div> : null}

      {summary ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Metric label="Generations" value={summary.generation.total.toString()} />
            <Metric label="Exports" value={summary.generation.exported.toString()} />
            <Metric label="Export rate" value={`${Math.round(summary.generation.export_rate * 100)}%`} />
            <Metric label="Credit spend" value={summary.credits.spent.toString()} />
          </div>

          <div>
            <h4 className="mb-2 text-sm font-semibold text-slate-200">Blockers</h4>
            {blockers.length === 0 ? (
              <div className="rounded-lg border border-green-400/20 bg-green-400/10 p-3 text-sm text-green-100">No analytics blockers detected yet.</div>
            ) : (
              <div className="space-y-2">
                {blockers.map((blocker) => (
                  <div key={blocker} className="rounded-lg border border-amber-300/20 bg-amber-300/10 p-3 text-sm text-amber-100">
                    {blocker}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-3">
      <div className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-cyan-100">{value}</div>
    </div>
  )
}
