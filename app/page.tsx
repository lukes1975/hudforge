import { Waitlist } from '@/components/Waitlist'
import { Features } from '@/components/Features'
import { Showcase } from '@/components/Showcase'
import { PainPoints } from '@/components/PainPoints'
import { Pricing } from '@/components/Pricing'
import { ProofSignals } from '@/components/ProofSignals'

const heroTags = ['Transparent PNGs', 'Clean Luau hierarchy', 'Roblox-first motion', 'Founder pricing']

const heroStats = [
  ['Prompt → Preview', 'Fast turnaround loop'],
  ['HUD language', 'Cinematic, readable, gamey'],
  ['Export path', 'Studio-ready handoff'],
]

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-transparent text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.18),_transparent_22%),radial-gradient(circle_at_80%_14%,_rgba(139,92,246,0.18),_transparent_20%),radial-gradient(circle_at_20%_22%,_rgba(16,185,129,0.14),_transparent_18%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:72px_72px] opacity-20 [mask-image:radial-gradient(circle_at_center,black,transparent_82%)]" />
        <div className="absolute left-1/2 top-[-8rem] h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-cyan-500/12 blur-3xl animate-hero-float" />
        <div className="absolute right-[4%] top-20 h-72 w-72 rounded-full bg-violet-500/14 blur-3xl animate-hero-drift" />
        <div className="absolute left-[6%] bottom-10 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl animate-hero-drift-slow" />
      </div>

      <section className="relative isolate overflow-hidden px-6 pt-16 lg:px-8">
        <div className="mx-auto grid max-w-7xl items-center gap-14 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:py-28">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-cyan-400/20 bg-cyan-400/8 px-4 py-2 text-sm text-cyan-100 shadow-[0_0_0_1px_rgba(34,211,238,0.08)] backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-emerald-300 animate-glow" />
              Private beta for Roblox builders who care about feel
            </div>

            <h1 className="max-w-4xl text-5xl font-black tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">
              <span className="block">Build Roblox UI like</span>
              <span className="block bg-gradient-to-r from-cyan-200 via-white to-violet-200 bg-clip-text text-transparent">
                it belongs in a AAA lobby.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
              HUDForge turns prompts into transparent PNGs, structured Luau hierarchies, and cinematic UI directions — so your
              menus, HUDs, and inventories stay cohesive without dragging the sprint into design limbo.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              <a
                href="#waitlist"
                className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-400 via-violet-500 to-amber-400 px-8 py-4 text-base font-semibold text-slate-950 shadow-[0_18px_60px_rgba(34,211,238,0.24)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_80px_rgba(168,85,247,0.24)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                Join the waitlist
              </a>
              <a
                href="#showcase"
                className="inline-flex items-center justify-center rounded-2xl border border-white/12 bg-white/5 px-8 py-4 text-base font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-300/40 hover:bg-white/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                See the UI system
              </a>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {heroTags.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/10 bg-slate-950/40 px-4 py-2 text-sm text-slate-200 backdrop-blur-sm"
                >
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {heroStats.map(([label, value]) => (
                <div key={label} className="hud-frame rounded-2xl px-4 py-4">
                  <div className="text-[11px] uppercase tracking-[0.28em] text-slate-400">{label}</div>
                  <div className="mt-2 text-sm font-semibold text-white">{value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-2xl lg:max-w-none">
            <div className="absolute -left-8 top-10 hidden rounded-full border border-cyan-300/20 bg-slate-950/80 px-4 py-2 text-xs uppercase tracking-[0.28em] text-cyan-100 shadow-xl shadow-cyan-500/10 backdrop-blur-md lg:block animate-hero-float">
              Motion polished
            </div>
            <div className="absolute -right-4 top-16 hidden rounded-full border border-amber-300/20 bg-slate-950/80 px-4 py-2 text-xs uppercase tracking-[0.28em] text-amber-100 shadow-xl shadow-amber-500/10 backdrop-blur-md lg:block animate-hero-drift-slow">
              Gamey by design
            </div>

            <div className="hud-frame relative overflow-hidden rounded-[2.25rem] p-6 shadow-[0_28px_100px_rgba(0,0,0,0.45)]">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent shimmer" />
              <div className="absolute -left-24 top-8 h-48 w-48 rounded-full bg-cyan-400/20 blur-3xl animate-hero-float" />
              <div className="absolute -right-16 top-0 h-56 w-56 rounded-full bg-violet-500/18 blur-3xl animate-hero-drift" />

              <div className="relative grid gap-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.32em] text-slate-400">HUDForge command deck</p>
                    <h2 className="mt-2 text-xl font-semibold text-white">Prompt → preview → export</h2>
                  </div>
                  <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-100">
                    Live preview
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
                  <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/85 p-4 shadow-inner shadow-black/20">
                    <p className="mb-2 text-xs uppercase tracking-[0.28em] text-cyan-200/70">Game UI prompt</p>
                    <p className="text-sm leading-7 text-slate-200">
                      Create a fantasy health bar with gold trim, electric cyan accents, and a dramatic damage flash.
                    </p>
                    <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>Style state</span>
                        <span>Reactive / Premium / Readable</span>
                      </div>
                      <div className="mt-3 h-3 rounded-full bg-white/10">
                        <div className="h-3 w-[84%] rounded-full bg-gradient-to-r from-rose-500 via-amber-400 to-cyan-400 shadow-[0_0_20px_rgba(56,189,248,0.35)]" />
                      </div>
                      <div className="mt-4 grid grid-cols-3 gap-3">
                        {['Q', 'E', 'R'].map((item) => (
                          <div
                            key={item}
                            className="flex h-14 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-lg font-bold text-white transition-transform duration-300 group-hover:scale-[1.02]"
                          >
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    <div className="rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-cyan-500/16 via-violet-500/10 to-emerald-500/10 p-4">
                      <div className="flex items-center justify-between text-sm text-slate-200">
                        <span>Generated HUD mock</span>
                        <span className="text-slate-400">512 × 512</span>
                      </div>
                      <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/75 p-4">
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span>HP</span>
                          <span>84%</span>
                        </div>
                        <div className="mt-2 h-4 rounded-full bg-white/10">
                          <div className="h-4 w-[84%] rounded-full bg-gradient-to-r from-rose-500 via-orange-400 to-amber-300 shadow-[0_0_30px_rgba(251,146,60,0.35)]" />
                        </div>
                        <div className="mt-4 grid grid-cols-3 gap-3">
                          {[
                            ['Cooldown', '18s'],
                            ['Ammo', '24'],
                            ['Focus', 'Ready'],
                          ].map(([label, value]) => (
                            <div key={label} className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-center">
                              <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500">{label}</div>
                              <div className="mt-2 text-sm font-semibold text-white">{value}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-sm">
                      {[
                        ['PNG', 'Ready'],
                        ['Luau', 'Structured'],
                        ['Export', '1 click'],
                      ].map(([label, value]) => (
                        <div key={label} className="rounded-2xl border border-white/10 bg-slate-950/80 p-4 text-center">
                          <div className="text-[11px] uppercase tracking-[0.28em] text-slate-500">{label}</div>
                          <div className="mt-2 text-base font-semibold text-white">{value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PainPoints />
      <Features />
      <ProofSignals />
      <Showcase />
      <Pricing />
      <Waitlist />

      <footer className="border-t border-white/10 px-6 py-10 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-slate-500 md:flex-row">
          <p>© 2026 HUDForge. Built for Roblox developers.</p>
          <div className="flex gap-6">
            <a href="#waitlist" className="transition-colors hover:text-slate-200">
              Waitlist
            </a>
            <a href="#showcase" className="transition-colors hover:text-slate-200">
              Showcase
            </a>
            <a href="https://github.com/lukes1975/hudforge" className="transition-colors hover:text-slate-200">
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </main>
  )
}
