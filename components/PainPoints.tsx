export function PainPoints() {
  const painPoints = [
    {
      id: '01',
      title: 'Game UI still takes too long',
      description:
        'You can move gameplay fast, but the HUD, menus, and inventory polish still eat sprint time with endless back-and-forth.',
    },
    {
      id: '02',
      title: 'Generic asset packs flatten the vibe',
      description:
        'Most premade UI looks detached from the world. Your interface should feel like part of the game, not a layer pasted on top.',
    },
    {
      id: '03',
      title: 'Hiring UI help adds friction',
      description: 'Small teams cannot keep paying designers every time they need a new state, panel, or menu variation.',
    },
  ]

  return (
    <section id="why" className="relative overflow-hidden px-6 py-24 lg:px-8">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_18%,rgba(111,120,255,0.08),transparent_24%),radial-gradient(circle_at_84%_72%,rgba(118,185,0,0.06),transparent_18%)]" />
      <div className="section-shell grid gap-12 lg:grid-cols-[0.78fr_1.22fr]">
        <div className="max-w-xl">
          <span className="section-kicker">Why HUDForge exists</span>
          <h2 className="mt-5 max-w-lg text-3xl font-medium tracking-[-0.045em] text-white sm:text-5xl">
            Roblox builders still have to choose between shipping fast and looking expensive.
          </h2>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-300">
            HUDForge compresses the slowest part of the UI loop so you can iterate visually, preserve game feel, and stop
            losing sprint time to polish debt.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
          {painPoints.map((point) => (
            <article key={point.title} className="hud-frame rounded-[1.75rem] p-6 lg:p-7">
              <div className="flex items-center justify-between gap-4">
                <span className="data-label">{point.id}</span>
                <span className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-slate-500">
                  Pain point
                </span>
              </div>
              <h3 className="mt-8 text-[1.28rem] font-semibold tracking-[-0.03em] text-white">{point.title}</h3>
              <p className="mt-4 leading-7 text-slate-300">{point.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
