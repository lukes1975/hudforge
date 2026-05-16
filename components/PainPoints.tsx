export function PainPoints() {
  const painPoints = [
    {
      emoji: '🕹️',
      title: 'Game UI still takes too long',
      description:
        'You can build gameplay fast, but the HUD, menus, and inventories still eat your sprint with endless polishing.',
    },
    {
      emoji: '🧱',
      title: 'Generic asset packs kill the vibe',
      description:
        'Most premade UI looks like it came from a different game. Your interface should match your world, not fight it.',
    },
    {
      emoji: '💸',
      title: 'Hiring UI help is expensive',
      description:
        'Small teams cannot keep paying designers every time they need a new panel, button state, or HUD variation.',
    },
  ]

  return (
    <section className="py-24 px-6 lg:px-8 bg-black/35">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <p className="text-sm uppercase tracking-[0.3em] text-blue-300/80 mb-4">Why HUDForge exists</p>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-5xl max-w-3xl mx-auto">
            Roblox builders are forced to choose between speed and polish.
          </h2>
          <p className="mt-5 text-lg text-slate-300 max-w-2xl mx-auto">
            HUDForge removes the slowest part of the UI loop so you can ship faster, iterate visually, and keep the game feeling premium.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {painPoints.map((point) => (
            <article
              key={point.title}
              className="glass-panel rounded-3xl p-8 transition-transform duration-300 hover:-translate-y-1 hover:border-blue-400/40"
            >
              <div className="text-4xl mb-5">{point.emoji}</div>
              <h3 className="text-xl font-semibold text-white mb-3">{point.title}</h3>
              <p className="text-slate-300 leading-7">{point.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
