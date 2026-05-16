export function Showcase() {
  const examples = [
    {
      title: 'Combat HUD',
      subtitle: 'Boss fight-ready health and ability layout',
      accent: 'from-rose-500/80 via-red-500/70 to-orange-500/80',
      layout: 'combat',
    },
    {
      title: 'Inventory Panel',
      subtitle: 'Item grid with rarity states and quick actions',
      accent: 'from-cyan-500/80 via-blue-500/70 to-indigo-500/80',
      layout: 'inventory',
    },
    {
      title: 'Action Button',
      subtitle: 'Clear affordance, strong hover states, fast tap feedback',
      accent: 'from-emerald-500/80 via-green-500/70 to-lime-500/80',
      layout: 'button',
    },
    {
      title: 'Skill Cooldown',
      subtitle: 'Readable ability state for active combat',
      accent: 'from-amber-500/80 via-yellow-500/70 to-orange-500/80',
      layout: 'skill',
    },
    {
      title: 'Dialogue Box',
      subtitle: 'NPC conversation with choices and story tone',
      accent: 'from-fuchsia-500/80 via-pink-500/70 to-purple-500/80',
      layout: 'dialog',
    },
  ]

  return (
    <section id="showcase" className="py-24 px-6 lg:px-8 bg-gradient-to-b from-black to-slate-950">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-300/80 mb-4">Example iteration</p>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-5xl mb-4">
            Built to look like a real game interface.
          </h2>
          <p className="text-lg text-slate-300 max-w-3xl mx-auto">
            HUDForge should make Roblox developers feel like they already have a premium UI team behind them.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {examples.map((example) => (
            <article
              key={example.title}
              className="group overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-950/85 shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/40"
            >
              <div className={`h-56 bg-gradient-to-br ${example.accent} p-5`}>
                {example.layout === 'combat' && (
                  <div className="flex h-full flex-col justify-between rounded-2xl border border-white/20 bg-slate-950/55 p-4 backdrop-blur-sm">
                    <div className="flex items-center justify-between text-white/90 text-sm">
                      <span>HUDForge / Combat</span>
                      <span className="rounded-full bg-white/10 px-3 py-1">LIVE</span>
                    </div>
                    <div className="space-y-3">
                      <div className="h-4 w-full rounded-full bg-white/10">
                        <div className="h-4 w-[84%] rounded-full bg-gradient-to-r from-red-400 to-orange-400" />
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {['Q', 'E', 'R'].map((slot) => (
                          <div key={slot} className="flex h-14 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-xl font-bold text-white">
                            {slot}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {example.layout === 'inventory' && (
                  <div className="flex h-full flex-col gap-4 rounded-2xl border border-white/20 bg-slate-950/55 p-4 backdrop-blur-sm">
                    <div className="flex items-center justify-between text-white/90 text-sm">
                      <span>Inventory</span>
                      <span className="rounded-full bg-cyan-400/20 px-3 py-1 text-cyan-100">12 ITEMS</span>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      {Array.from({ length: 8 }).map((_, index) => (
                        <div key={index} className="flex aspect-square items-center justify-center rounded-xl border border-white/15 bg-white/8 text-white/60">
                          ◼
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {example.layout === 'button' && (
                  <div className="flex h-full items-center justify-center rounded-2xl border border-white/20 bg-slate-950/55 p-4 backdrop-blur-sm">
                    <button className="rounded-2xl bg-white/15 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-transform duration-300 group-hover:scale-105">
                      Play Now
                    </button>
                  </div>
                )}

                {example.layout === 'skill' && (
                  <div className="flex h-full flex-col justify-between rounded-2xl border border-white/20 bg-slate-950/55 p-4 backdrop-blur-sm">
                    <div className="flex items-center justify-between text-white/90 text-sm">
                      <span>Skill Cooldown</span>
                      <span>18s</span>
                    </div>
                    <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border-8 border-white/10 border-t-white/70 text-2xl font-bold text-white">
                      64%
                    </div>
                  </div>
                )}

                {example.layout === 'dialog' && (
                  <div className="flex h-full flex-col justify-between rounded-2xl border border-white/20 bg-slate-950/55 p-4 backdrop-blur-sm">
                    <div className="rounded-2xl bg-black/30 p-3 text-sm text-white/90">
                      “You made it this far. Choose carefully.”
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-center text-white">Accept</div>
                      <div className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-center text-white">Decline</div>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-1">{example.title}</h3>
                <p className="text-sm text-slate-300">{example.subtitle}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 text-center text-sm text-slate-400">
          Concept visuals for now — the goal is to make every generated UI feel like it belongs in a shipped Roblox experience.
        </div>
      </div>
    </section>
  )
}
