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
    <section className="py-24 px-6 lg:px-8 bg-black">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <p className="text-sm uppercase tracking-[0.3em] text-purple-300/80 mb-4">What HUDForge ships</p>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-5xl mb-4">
            A full UI workflow, not just image generation.
          </h2>
          <p className="text-lg text-slate-300 max-w-3xl mx-auto">
            HUDForge is built for creators who want to move from idea to polished Roblox UI without losing hours in design tools or manual rework.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.name}
              className="glass-panel rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-purple-400/40"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.name}</h3>
              <p className="text-slate-300 text-sm leading-6">{feature.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
