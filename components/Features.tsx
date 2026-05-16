export function Features() {
  const features = [
    {
      name: 'Transparent PNG exports',
      description: 'Generate clean, isolated UI assets with alpha backgrounds that drop straight into Roblox Studio.',
      type: 'Asset output',
    },
    {
      name: 'Structured Luau hierarchy',
      description: 'Get clean, exportable UI trees with the right parent-child relationships, ordering, and layout intent.',
      type: 'System output',
    },
    {
      name: 'Live Roblox-style preview',
      description: 'Preview panels in a game-like presentation before exporting so teams can approve faster.',
      type: 'Review surface',
    },
    {
      name: 'One-click Studio handoff',
      description: 'Move from prompt to usable asset package without rebuilding the same interface twice.',
      type: 'Handoff',
    },
    {
      name: 'Cohesive style system',
      description: 'Keep every button, menu, and HUD element visually aligned across your entire experience.',
      type: 'Direction',
    },
    {
      name: 'Versioned iterations',
      description: 'Save variations, compare them, and roll back quickly when a new direction does not land.',
      type: 'Workflow memory',
    },
  ]

  const workflow = [
    ['Input', 'Prompt with game tone, readability goals, and layout state'],
    ['Render', 'Generate UI treatments that feel integrated with the world'],
    ['Package', 'Export image assets and structured Luau for real production use'],
  ]

  return (
    <section className="relative overflow-hidden px-6 py-24 lg:px-8">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(255,255,255,0),rgba(255,255,255,0.015),rgba(255,255,255,0))]" />
      <div className="section-shell">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="max-w-xl">
            <span className="section-kicker">What HUDForge ships</span>
            <h2 className="mt-5 text-3xl font-medium tracking-[-0.045em] text-white sm:text-5xl">
              A complete UI workflow, not just another image generator.
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-300">
              The product should read like a dark-mode SaaS tool for serious builders, but the output should still feel rooted in
              premium game UI.
            </p>

            <div className="hud-frame mt-8 rounded-[1.8rem] p-5 lg:p-6">
              <div className="flex items-center justify-between gap-4 border-b border-white/8 pb-4">
                <div>
                  <div className="data-label">Workflow architecture</div>
                  <div className="mt-2 text-lg font-semibold tracking-[-0.03em] text-white">Designed for speed without flattening taste</div>
                </div>
                <div className="rounded-full border border-indigo-300/15 bg-indigo-400/10 px-3 py-1 text-xs text-indigo-100">Private beta scope</div>
              </div>

              <div className="mt-5 space-y-3">
                {workflow.map(([label, value], index) => (
                  <div key={label} className="rounded-[1.15rem] border border-white/8 bg-black/28 px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="data-label">0{index + 1}</span>
                      <span className="text-sm font-medium text-white">{label}</span>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-slate-300">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature) => (
              <article key={feature.name} className="hud-frame rounded-[1.65rem] p-5 lg:p-6">
                <span className="rounded-full border border-lime-400/16 bg-lime-400/8 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-lime-100">
                  {feature.type}
                </span>
                <h3 className="mt-6 text-[1.15rem] font-semibold tracking-[-0.03em] text-white">{feature.name}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
