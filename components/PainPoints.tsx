export function PainPoints() {
  const painPoints = [
    {
      id: '01',
      title: 'UI implementation still steals sprint time',
      description:
        'Gameplay can move quickly, but HUD structure, menu states, and inventory polish still create too much manual setup work in Studio.',
    },
    {
      id: '02',
      title: 'Visual consistency breaks across surfaces',
      description:
        'Buttons, trays, panels, and overlays often drift stylistically as a game expands. That fragmentation makes the product feel cheaper than the gameplay deserves.',
    },
    {
      id: '03',
      title: 'Roblox teams keep rebuilding repeatable UI work',
      description:
        'Small teams should not need a fresh design and implementation loop every time they need a new state, panel, or component variation.',
    },
  ]

  return (
    <section id="why" className="relative overflow-hidden px-6 py-24 lg:px-8">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_18%,rgba(0,209,255,0.06),transparent_24%),radial-gradient(circle_at_84%_72%,rgba(124,92,255,0.06),transparent_18%)]" />
      <div className="section-shell grid gap-12 lg:grid-cols-[0.78fr_1.22fr]">
        <div className="max-w-xl">
          <span className="section-kicker">Why HUDForge exists</span>
          <h2 className="section-title mt-5 max-w-lg text-3xl font-semibold text-white sm:text-5xl">
            Roblox builders still have to choose between shipping fast and looking polished.
          </h2>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-300">
            HUDForge compresses the slowest part of the UI workflow so teams can move faster, maintain consistency, and reduce
            repetitive Studio implementation work.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
          {painPoints.map((point) => (
            <article key={point.title} className="hud-frame rounded-[1.5rem] p-6 lg:p-7">
              <div className="flex items-center justify-between gap-4">
                <span className="data-label">{point.id}</span>
                <span className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-slate-500">
                  Workflow friction
                </span>
              </div>
              <h3 className="mt-8 text-[1.25rem] font-semibold tracking-[-0.03em] text-white">{point.title}</h3>
              <p className="mt-4 leading-7 text-slate-300">{point.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
