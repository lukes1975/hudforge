import Link from 'next/link'
import { AppShell } from '@/components/app/AppShell'

const activationSteps = [
  { label: 'Optimize prompt', detail: 'Turn a plain Roblox UI request into a structured spec.' },
  { label: 'Generate assets', detail: 'Create deterministic mock assets today, provider assets later.' },
  { label: 'Preview package', detail: 'Inspect layout, palette, hierarchy, and asset roles in browser.' },
  { label: 'Export Luau', detail: 'Download json_payload with manifest, layout, assets, and MainUI.lua.' },
]

export default function DashboardPage() {
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
              ['Mock-safe providers', 'Ready'],
              ['json_payload export', 'Ready'],
              ['Clerk app routes', 'Protected'],
              ['Billing provider', 'Mock mode'],
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
    </AppShell>
  )
}
