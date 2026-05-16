export function Showcase() {
  const proofs = [
    {
      title: 'Prompt composer',
      subtitle: 'Describe tone, states, and readability goals in one structured input surface.',
      tag: 'Input layer',
      layout: 'prompt',
    },
    {
      title: 'PNG asset previews',
      subtitle: 'Generate isolated UI assets that feel ready for a Roblox production pipeline.',
      tag: 'Asset output',
      layout: 'png',
    },
    {
      title: 'Luau hierarchy export',
      subtitle: 'Keep structure, naming, and component relationships implementation-friendly.',
      tag: 'Engineering output',
      layout: 'luau',
    },
    {
      title: 'Studio workflow handoff',
      subtitle: 'Make the product feel closer to a real Roblox tooling workflow than a concept mockup.',
      tag: 'Handoff',
      layout: 'studio',
    },
    {
      title: 'Component generation previews',
      subtitle: 'Preview consistent button, panel, and HUD variations before implementation.',
      tag: 'System design',
      layout: 'components',
    },
  ]

  return (
    <section id="showcase" className="relative overflow-hidden px-6 py-24 lg:px-8">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(0,209,255,0.07),transparent_24%),radial-gradient(circle_at_76%_72%,rgba(124,92,255,0.06),transparent_20%)]" />
      <div className="section-shell">
        <div className="max-w-3xl">
          <span className="section-kicker">Product proof</span>
          <h2 className="section-title mt-5 text-3xl font-semibold text-white sm:text-5xl">
            Make the product feel real, usable, and production-oriented.
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-300">
            The site should sell a Roblox UI workflow platform, not a vague AI concept. These proof blocks make the product feel
            closer to infrastructure, exports, and implementation reality.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {proofs.map((proof) => (
            <article key={proof.title} className="overflow-hidden rounded-[1.55rem] border border-white/8 bg-[rgba(11,16,32,0.94)] shadow-[0_18px_50px_rgba(2,6,23,0.28)]">
              <div className="border-b border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-5">
                <div className="flex items-center justify-between gap-4">
                  <span className="rounded-full border border-white/8 bg-black/20 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-slate-300">
                    {proof.tag}
                  </span>
                  <span className="data-label">Preview</span>
                </div>

                <div className="mt-4 h-56 rounded-[1.1rem] border border-white/10 bg-[#060816] p-4">
                  {proof.layout === 'prompt' && (
                    <div className="flex h-full flex-col justify-between rounded-[1rem] border border-white/8 bg-white/[0.03] p-4">
                      <div className="flex items-center justify-between text-sm text-white/90">
                        <span>Prompt composer</span>
                        <span className="rounded-full border border-cyan-400/18 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-100">Draft</span>
                      </div>
                      <div className="rounded-[0.9rem] border border-white/8 bg-black/20 p-3 text-sm leading-6 text-slate-200">
                        Inventory panel with rarity states, quick actions, and high readability on dark fantasy environments.
                      </div>
                      <div className="flex flex-wrap gap-2 text-[11px] text-slate-400">
                        {['Inventory', 'Readable', 'Cinematic', 'Studio-ready'].map((chip) => (
                          <span key={chip} className="rounded-full border border-white/8 px-3 py-1">
                            {chip}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {proof.layout === 'png' && (
                    <div className="grid h-full grid-cols-3 gap-3 rounded-[1rem] border border-white/8 bg-white/[0.03] p-4">
                      {Array.from({ length: 6 }).map((_, index) => (
                        <div key={index} className="rounded-[0.9rem] border border-dashed border-cyan-400/20 bg-[linear-gradient(180deg,rgba(0,209,255,0.08),rgba(255,255,255,0.02))] p-2">
                          <div className="h-full rounded-[0.75rem] border border-white/8 bg-black/18" />
                        </div>
                      ))}
                    </div>
                  )}

                  {proof.layout === 'luau' && (
                    <div className="h-full rounded-[1rem] border border-white/8 bg-white/[0.03] p-4 font-mono text-[12px] leading-6 text-slate-300">
                      <div>ScreenGui</div>
                      <div className="pl-4">└─ InventoryScreen</div>
                      <div className="pl-8">├─ HeaderBar</div>
                      <div className="pl-8">├─ ItemGrid</div>
                      <div className="pl-8">├─ DetailPanel</div>
                      <div className="pl-8">└─ ActionRow</div>
                    </div>
                  )}

                  {proof.layout === 'studio' && (
                    <div className="grid h-full gap-3 rounded-[1rem] border border-white/8 bg-white/[0.03] p-4">
                      <div className="rounded-[0.9rem] border border-white/8 bg-black/20 px-3 py-2 text-sm text-slate-200">Explorer structure</div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-[0.9rem] border border-white/8 bg-black/20 p-3 text-[11px] text-slate-400">
                          Layer naming
                          <div className="mt-2 text-sm text-slate-200">Preserved</div>
                        </div>
                        <div className="rounded-[0.9rem] border border-white/8 bg-black/20 p-3 text-[11px] text-slate-400">
                          Insert time
                          <div className="mt-2 text-sm text-slate-200">Reduced</div>
                        </div>
                      </div>
                      <div className="rounded-[0.9rem] border border-cyan-400/16 bg-cyan-400/8 px-3 py-3 text-sm text-cyan-50">
                        Optimized for faster Studio implementation.
                      </div>
                    </div>
                  )}

                  {proof.layout === 'components' && (
                    <div className="grid h-full gap-3 rounded-[1rem] border border-white/8 bg-white/[0.03] p-4">
                      <div className="grid grid-cols-2 gap-3">
                        {['Primary Button', 'Secondary Button', 'Panel Header', 'Ability Slot'].map((item) => (
                          <div key={item} className="rounded-[0.9rem] border border-white/8 bg-black/20 p-3">
                            <div className="text-[11px] text-slate-400">{item}</div>
                            <div className="mt-3 h-8 rounded-lg border border-cyan-400/18 bg-white/[0.03]" />
                          </div>
                        ))}
                      </div>
                      <div className="rounded-[0.9rem] border border-white/8 bg-black/20 px-3 py-3 text-sm text-slate-200">
                        Consistent component generation across HUD, menus, and overlays.
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-5">
                <h3 className="text-[1.1rem] font-semibold tracking-[-0.03em] text-white">{proof.title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-300">{proof.subtitle}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
