export function ProofSignals() {
  const signals = [
    {
      label: 'Early feedback',
      quote:
        'The direction feels much closer to a shipped game menu than a generic AI mockup. It makes it easier to pitch the UI internally.',
      meta: 'Private beta conversation · anonymous Roblox builder',
    },
    {
      label: 'Builder priority',
      quote:
        'The strongest part is the speed from prompt to something you can actually review with a team, instead of starting from a blank canvas.',
      meta: 'Founding access notes · anonymous UI lead',
    },
    {
      label: 'Workflow proof signal',
      quote:
        'It reduces the boring setup work and keeps the visual tone consistent across HUD, menus, and inventory screens.',
      meta: 'Prototype feedback · anonymous game developer',
    },
  ]

  const stats = [
    ['Built for', 'Roblox-first UI'],
    ['Focus', 'Cinematic HUD polish'],
    ['Status', 'Private beta signals'],
  ]

  return (
    <section className="relative overflow-hidden px-6 py-24 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm uppercase tracking-[0.34em] text-emerald-300/80">Early feedback / proof signals</p>
            <h2 className="text-3xl font-black tracking-tight text-white sm:text-5xl">
              A social-proof block that stays honest about what’s real.
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-300 sm:text-lg">
              These are anonymous signals from early conversations and private beta feedback — not fabricated named testimonials.
              They’re here to show product direction, not pretend the launch is bigger than it is.
            </p>
          </div>

          <div className="hud-frame rounded-3xl p-4">
            <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-1 lg:grid-cols-3">
              {stats.map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3">
                  <div className="text-[11px] uppercase tracking-[0.28em] text-slate-400">{label}</div>
                  <div className="mt-1 text-sm font-semibold text-white">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {signals.map((signal, index) => (
            <article
              key={signal.label}
              className="hud-frame group relative overflow-hidden rounded-[1.75rem] p-[1px] transition-transform duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${index * 140}ms` }}
            >
              <div className="relative h-full rounded-[1.7rem] bg-slate-950/80 p-6">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent shimmer" />
                <div className="flex items-center justify-between gap-4">
                  <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-100">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 animate-glow" />
                    {signal.label}
                  </div>
                  <span className="text-[11px] uppercase tracking-[0.26em] text-slate-500">Anonymous</span>
                </div>

                <p className="mt-5 text-lg leading-8 text-slate-100 sm:text-xl">“{signal.quote}”</p>

                <div className="mt-6 border-t border-white/8 pt-4 text-sm text-slate-400">{signal.meta}</div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
