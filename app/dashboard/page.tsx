import Link from 'next/link'
import { AppShell } from '@/components/app/AppShell'
import { getDashboardData } from '@/lib/dashboard'

const activationSteps = [
  { label: 'Optimize prompt', detail: 'Turn a plain Roblox UI request into a structured spec.' },
  { label: 'Generate assets', detail: 'Create real FAL assets and fail visibly if the provider is not configured.' },
  { label: 'Preview package', detail: 'Inspect layout, palette, hierarchy, and asset roles in browser.' },
  { label: 'Export Luau', detail: 'Export manifest, layout, assets, import guide, and MainUI.lua.' },
]

export default async function DashboardPage() {
  const dashboard = await getDashboardData().catch((error) => ({
    analytics: null,
    lastUpdated: new Date().toISOString(),
    error: error instanceof Error ? error.message : 'Failed to load analytics',
  }))
  const analytics = dashboard.analytics

  return (
    <AppShell
      title="Dashboard"
      description="A generation-focused workspace for getting from Roblox UI prompt to previewable package quickly."
    >
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rune-card p-6">
          <p className="section-kicker">Primary loop</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">Start with /generate.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
            HUDForge is centered on the Roblox UI generation loop: prompt, optimized spec, assets, preview, and export.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/generate" className="forge-button forge-button--primary">
              Generate UI
            </Link>
            <Link href="/projects" className="forge-button forge-button--secondary">
              View projects
            </Link>
          </div>
        </section>

        <section className="rune-card p-6">
          <p className="section-kicker">Readiness</p>
          <div className="mt-4 grid gap-3">
            {[
              ['Supabase persistence', 'Live'],
              ['Credit ledger', 'Live'],
              ['FAL assets', 'Real provider'],
              ['Billing provider', 'Next'],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-3 text-sm">
                <span className="text-slate-300">{label}</span>
                <span className="font-medium text-cyan-100">{value}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {activationSteps.map((step, index) => (
          <article key={step.label} className="rune-card p-5">
            <span className="font-mono text-xs text-cyan-200">0{index + 1}</span>
            <h3 className="mt-3 text-lg font-semibold text-white">{step.label}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">{step.detail}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Waitlist" value={analytics?.funnel.find((stage) => stage.stage === 'waitlist')?.count ?? '—'} />
        <MetricCard label="Generated" value={analytics?.generation.total ?? '—'} />
        <MetricCard label="Exported" value={analytics?.generation.exported ?? '—'} />
        <MetricCard label="Credits spent" value={analytics?.credits.spent ?? '—'} />
      </section>

      <section className="mt-6 rune-card p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="section-kicker">Durable analytics</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">30-day SaaS funnel</h2>
          </div>
          <p className="text-xs text-slate-500">Updated {new Date(dashboard.lastUpdated).toLocaleString()}</p>
        </div>

        {'error' in dashboard && dashboard.error ? (
          <div className="mt-5 rounded-lg border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-100">{dashboard.error}</div>
        ) : null}

        {analytics ? (
          <div className="mt-5 grid gap-3 md:grid-cols-5">
            {analytics.funnel.map((stage) => (
              <div key={stage.stage} className="rounded-xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{stage.stage.replace('_', ' ')}</p>
                <p className="mt-3 text-3xl font-semibold text-white">{stage.count}</p>
                <p className="mt-2 text-xs text-slate-400">
                  {stage.conversion_rate === null ? 'entry stage' : `${Math.round(stage.conversion_rate * 100)}% from previous`}
                </p>
              </div>
            ))}
          </div>
        ) : null}
      </section>
    </AppShell>
  )
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rune-card p-5">
      <p className="section-kicker">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
    </div>
  )
}
