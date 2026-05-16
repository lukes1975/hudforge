export function Features() {
  const features = [
    {
      name: 'Transparent PNG exports',
      description: 'Generate clean, isolated UI assets with alpha backgrounds that can drop straight into Roblox Studio.',
      type: 'Asset output',
    },
    {
      name: 'Structured Luau hierarchy',
      description: 'Export organized UI trees with clearer parent-child relationships, layout intent, and implementation structure.',
      type: 'Engineering output',
    },
    {
      name: 'Live Roblox-style preview',
      description: 'Review UI treatments in a product surface that feels closer to a real game implementation workflow.',
      type: 'Review surface',
    },
    {
      name: 'Reduced Studio rebuild work',
      description: 'Move from direction to implementation faster instead of recreating the same panel, state, and layout logic by hand.',
      type: 'Velocity',
    },
    {
      name: 'Consistent UI systems',
      description: 'Keep menus, HUDs, buttons, overlays, and panels aligned across the entire experience.',
      type: 'System design',
    },
    {
      name: 'Fast iteration loops',
      description: 'Generate, compare, and refine variations without losing the production-ready structure underneath.',
      type: 'Workflow memory',
    },
  ]

  const workflow = [
    ['Input', 'Prompt with game tone, state logic, readability constraints, and component goals.'],
    ['Preview', 'Review generated UI directions, assets, and hierarchy inside a single workflow surface.'],
    ['Implement', 'Export assets and Luau structure that reduce repetitive Roblox Studio setup work.'],
  ]

  return (
    <section className="relative overflow-hidden px-6 py-24 lg:px-8">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(255,255,255,0),rgba(255,255,255,0.015),rgba(255,255,255,0))]" />
      <div className="section-shell">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="max-w-xl">
            <span className="section-kicker">What HUDForge ships</span>
            <h2 className="section-title mt-5 text-3xl font-semibold text-white sm:text-5xl">
              A complete Roblox UI workflow, not a generic AI art tool.
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-300">
              The product should feel like premium developer tooling: controlled, fast, structured, and clearly focused on shipping
              implementation-ready UI systems.
            </p>

            <div className="hud-frame mt-8 rounded-[1.6rem] p-5 lg:p-6">
              <div className="flex items-center justify-between gap-4 border-b border-white/8 pb-4">
                <div>
                  <div className="data-label">Workflow architecture</div>
                  <div className="mt-2 text-lg font-semibold tracking-[-0.03em] text-white">Designed to accelerate output without flattening quality</div>
                </div>
                <div className="rounded-full border border-cyan-400/18 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-100">Production-oriented</div>
              </div>

              <div className="mt-5 space-y-3">
                {workflow.map(([label, value], index) => (
                  <div key={label} className="rounded-[1.05rem] border border-white/8 bg-black/28 px-4 py-4">
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
              <article key={feature.name} className="hud-frame rounded-[1.45rem] p-5 lg:p-6">
                <span className="rounded-full border border-cyan-400/14 bg-cyan-400/8 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-cyan-100">
                  {feature.type}
                </span>
                <h3 className="mt-6 text-[1.1rem] font-semibold tracking-[-0.03em] text-white">{feature.name}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
