export function Features() {
  const features = [
    {
      name: 'Transparent PNG exports',
      description: 'Generate clean, isolated UI assets with alpha backgrounds that drop straight into Roblox Studio.',
      icon: '🎯',
    },
    {
      name: 'Structured Luau hierarchy',
      description: 'Get clean, exportable UI trees with the right parent-child relationships, ordering, and layout intent.',
      icon: '📐',
    },
    {
      name: 'Live Roblox-style preview',
      description: 'Preview panels in a game-like presentation before exporting so teams can approve faster.',
      icon: '👁️',
    },
    {
      name: 'One-click Studio handoff',
      description: 'Move from prompt to usable asset package without rebuilding the same interface twice.',
      icon: '⚡',
    },
    {
      name: 'Cohesive style system',
      description: 'Keep every button, menu, and HUD element visually aligned across your entire experience.',
      icon: '🎨',
    },
    {
      name: 'Versioned iterations',
      description: 'Save variations, compare them, and roll back quickly when a new direction does not land.',
      icon: '🔄',
    },
  ]

  return (
    <section className="relative overflow-hidden px-6 py-24 lg:px-8">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(2,6,23,0),rgba(15,23,42,0.4),rgba(2,6,23,0))]" />
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <p className="mb-4 text-sm uppercase tracking-[0.34em] text-violet-200/75">What HUDForge ships</p>
          <h2 className="mb-4 text-3xl font-black tracking-tight text-white sm:text-5xl">
            A full UI workflow, not just image generation.
          </h2>
          <p className="mx-auto max-w-3xl text-lg leading-8 text-slate-300">
            HUDForge is built for creators who want to move from idea to polished Roblox UI without losing hours in design tools or manual rework.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <article
              key={feature.name}
              className="hud-frame rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-violet-300/35"
              style={{ animationDelay: `${index * 90}ms` }}
            >
              <div className="mb-4 text-4xl">{feature.icon}</div>
              <h3 className="mb-2 text-lg font-semibold text-white">{feature.name}</h3>
              <p className="text-sm leading-6 text-slate-300">{feature.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
