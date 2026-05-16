export function PainPoints() {
  const painPoints = [
    {
      emoji: '🕹️',
      title: 'Game UI still takes too long',
      description:
        'You can move gameplay fast, but the HUD, menus, and inventory polish still eat sprint time with endless back-and-forth.',
    },
    {
      emoji: '🧱',
      title: 'Generic asset packs flatten the vibe',
      description:
        'Most premade UI looks detached from the world. Your interface should feel like part of the game, not a layer pasted on top.',
    },
    {
      emoji: '💸',
      title: 'Hiring UI help adds friction',
      description:
        'Small teams cannot keep paying designers every time they need a new state, panel, or menu variation.',
    },
  ]

  return (
    <section className="relative overflow-hidden px-6 py-24 lg:px-8">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.08),transparent_26%),radial-gradient(circle_at_80%_80%,rgba(168,85,247,0.08),transparent_24%)]" />
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <p className="mb-4 text-sm uppercase tracking-[0.34em] text-cyan-200/70">Why HUDForge exists</p>
          <h2 className="mx-auto max-w-3xl text-3xl font-black tracking-tight text-white sm:text-5xl">
            Roblox builders are still forced to choose between speed and polish.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            HUDForge compresses the slowest part of the UI loop so you can ship faster, iterate visually, and keep the game feeling premium.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {painPoints.map((point, index) => (
            <article
              key={point.title}
              className="hud-frame rounded-3xl p-8 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/35"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="mb-5 text-4xl">{point.emoji}</div>
              <h3 className="mb-3 text-xl font-semibold text-white">{point.title}</h3>
              <p className="leading-7 text-slate-300">{point.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
