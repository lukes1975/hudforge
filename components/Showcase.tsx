export function Showcase() {
  const examples = [
    {
      title: 'Combat HUD',
      subtitle: 'Boss fight-ready health and ability layout',
      tag: 'Combat readability',
      layout: 'combat',
    },
    {
      title: 'Inventory Panel',
      subtitle: 'Item grid with rarity states and quick actions',
      tag: 'Collection UX',
      layout: 'inventory',
    },
    {
      title: 'Action Button',
      subtitle: 'Clear affordance, strong hover states, fast tap feedback',
      tag: 'Primary interaction',
      layout: 'button',
    },
    {
      title: 'Skill Cooldown',
      subtitle: 'Readable ability state for active combat',
      tag: 'Moment-to-moment UI',
      layout: 'skill',
    },
    {
      title: 'Dialogue Box',
      subtitle: 'NPC conversation with choices and story tone',
      tag: 'Narrative surface',
      layout: 'dialog',
    },
  ]

  return (
    <section id="showcase" className="relative overflow-hidden px-6 py-24 lg:px-8">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(111,120,255,0.08),transparent_24%),radial-gradient(circle_at_76%_72%,rgba(118,185,0,0.06),transparent_20%)]" />
      <div className="section-shell">
        <div className="max-w-3xl">
          <span className="section-kicker">Example iteration</span>
          <h2 className="mt-5 text-3xl font-medium tracking-[-0.045em] text-white sm:text-5xl">
            Built to feel like a real game interface, not a generic mockup.
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-300">
            HUDForge should make Roblox developers feel like they already have a premium UI team behind them, with output that
            respects gameplay readability and world tone.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {examples.map((example) => (
            <article key={example.title} className="overflow-hidden rounded-[1.8rem] border border-white/8 bg-[rgba(11,12,15,0.94)] shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
              <div className="border-b border-white/8 bg-[linear-gradient(180deg,rgba(111,120,255,0.08),rgba(255,255,255,0.02))] p-5">
                <div className="flex items-center justify-between gap-4">
                  <span className="rounded-full border border-white/8 bg-black/20 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-slate-300">
                    {example.tag}
                  </span>
                  <span className="data-label">Preview</span>
                </div>

                <div className="mt-4 h-56 rounded-[1.4rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(0,0,0,0.18))] p-4">
                  {example.layout === 'combat' && (
                    <div className="flex h-full flex-col justify-between rounded-[1.1rem] border border-white/10 bg-black/28 p-4">
                      <div className="flex items-center justify-between text-sm text-white/90">
                        <span>HUDForge / Combat</span>
                        <span className="rounded-full border border-lime-400/20 bg-lime-400/10 px-3 py-1 text-xs text-lime-100">LIVE</span>
                      </div>
                      <div className="space-y-3">
                        <div className="h-4 w-full rounded-full bg-white/8">
                          <div className="h-4 w-[84%] rounded-full bg-gradient-to-r from-rose-500 via-orange-400 to-amber-300" />
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          {['Q', 'E', 'R'].map((slot) => (
                            <div key={slot} className="flex h-14 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-lg font-semibold text-white">
                              {slot}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {example.layout === 'inventory' && (
                    <div className="flex h-full flex-col gap-4 rounded-[1.1rem] border border-white/10 bg-black/28 p-4">
                      <div className="flex items-center justify-between text-sm text-white/90">
                        <span>Inventory</span>
                        <span className="rounded-full border border-indigo-300/16 bg-indigo-400/10 px-3 py-1 text-indigo-100">12 items</span>
                      </div>
                      <div className="grid grid-cols-4 gap-3">
                        {Array.from({ length: 8 }).map((_, index) => (
                          <div key={index} className="flex aspect-square items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/55">
                            ◼
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {example.layout === 'button' && (
                    <div className="flex h-full items-center justify-center rounded-[1.1rem] border border-white/10 bg-black/28 p-4">
                      <button className="rounded-xl border border-lime-400/26 bg-lime-400/10 px-8 py-4 text-lg font-semibold text-white shadow-[0_16px_40px_rgba(118,185,0,0.12)]">
                        Play Now
                      </button>
                    </div>
                  )}

                  {example.layout === 'skill' && (
                    <div className="flex h-full flex-col justify-between rounded-[1.1rem] border border-white/10 bg-black/28 p-4">
                      <div className="flex items-center justify-between text-sm text-white/90">
                        <span>Skill Cooldown</span>
                        <span>18s</span>
                      </div>
                      <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border-[10px] border-white/10 border-t-white/80 text-2xl font-bold text-white">
                        64%
                      </div>
                    </div>
                  )}

                  {example.layout === 'dialog' && (
                    <div className="flex h-full flex-col justify-between rounded-[1.1rem] border border-white/10 bg-black/28 p-4">
                      <div className="rounded-[1rem] border border-white/8 bg-white/[0.03] p-3 text-sm leading-6 text-white/90">
                        “You made it this far. Choose carefully.”
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-center text-white">Accept</div>
                        <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-center text-white">Decline</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-5">
                <h3 className="text-[1.18rem] font-semibold tracking-[-0.03em] text-white">{example.title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-300">{example.subtitle}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 text-sm text-slate-400">
          Concept visuals for now. The goal is to make every generated UI feel like it belongs in a shipped Roblox experience.
        </div>
      </div>
    </section>
  )
}
