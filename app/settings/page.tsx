import { AppShell } from '@/components/app/AppShell'

export default function SettingsPage() {
  return (
    <AppShell title="Settings" description="Workspace defaults for generation style, device target, and export behavior.">
      <section className="rune-card p-6">
        <p className="section-kicker">Defaults</p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {[
            ['Default style', 'Futuristic'],
            ['Default device', 'Desktop'],
            ['Export format', 'json_payload'],
            ['History saving', 'Enabled'],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">{label}</p>
              <p className="mt-2 text-lg font-semibold text-white">{value}</p>
            </div>
          ))}
        </div>
        <p className="mt-5 text-sm leading-6 text-slate-400">
          GET and POST /api/settings are implemented for the client settings surface; durable storage can be swapped in after the database schema is approved.
        </p>
      </section>
    </AppShell>
  )
}
