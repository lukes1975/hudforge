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
      quote: 'It reduces the boring setup work and keeps the visual tone consistent across HUD, menus, and inventory screens.',
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
      <div className="section-shell">
        <div className="grid gap-8 lg:grid-cols-[0.84fr_1.16fr]">
          <div className="max-w-xl">
            <span className="section-kicker">Early feedback / proof signals</span>
            <h2 className="mt-5 text-3xl font-medium tracking-[-0.045em] text-white sm:text-5xl">
              Social proof that feels honest instead of inflated.
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-300">
              These are anonymous signals from early conversations and private beta feedback. The page should read as credible and
              premium without pretending there is public traction that does not exist yet.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {stats.map(([label, value]) => (
              <div key={label} className="rounded-[1.4rem] border border-white/8 bg-white/[0.02] px-5 py-5">
                <div className="data-label">{label}</div>
                <div className="mt-3 text-base font-medium text-white">{value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {signals.map((signal) => (
            <article key={signal.label} className="hud-frame rounded-[1.8rem] p-6 lg:p-7">
              <div className="flex items-center justify-between gap-4">
                <div className="rounded-full border border-indigo-300/18 bg-indigo-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-indigo-100">
                  {signal.label}
                </div>
                <span className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Anonymous</span>
              </div>

              <p className="mt-6 text-lg leading-8 text-slate-100 sm:text-[1.25rem]">“{signal.quote}”</p>
              <div className="mt-6 border-t border-white/8 pt-4 text-sm text-slate-400">{signal.meta}</div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
