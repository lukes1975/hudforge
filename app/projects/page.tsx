import { AppShell } from '@/components/app/AppShell'

export default function ProjectsPage() {
  return (
    <AppShell title="Projects" description="Recent generation history and export state. This foundation uses local mock persistence until a production schema is introduced.">
      <section className="rune-card p-6">
        <p className="section-kicker">History</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">Saved generations appear after you run /generate.</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
          The backing API is available at GET /api/generations. Server memory is intentionally mock-safe for this scoped build.
        </p>
      </section>
    </AppShell>
  )
}
