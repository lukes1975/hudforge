import { Waitlist } from '@/components/Waitlist'
import { Features } from '@/components/Features'
import { Showcase } from '@/components/Showcase'
import { PainPoints } from '@/components/PainPoints'
import { Pricing } from '@/components/Pricing'
import { ProofSignals } from '@/components/ProofSignals'

const navItems = [
  ['Why it exists', '#why'],
  ['Workflow', '#workflow'],
  ['Showcase', '#showcase'],
  ['Pricing', '#pricing'],
]

const heroTags = ['Transparent PNGs', 'Clean Luau hierarchy', 'Roblox-first motion', 'Founder pricing']

const heroStats = [
  ['Output surface', 'UI image + Luau structure'],
  ['Design posture', 'AAA lobby polish, Roblox readable'],
  ['Review loop', 'Prompt → preview → export'],
  ['Team fit', 'Solo dev to studio art direction'],
]

const workflowCards = [
  ['Prompt', 'Describe the world, tone, and game state'],
  ['Preview', 'Review a UI treatment that feels shippable'],
  ['Export', 'Hand off structured assets without rebuild work'],
]

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-transparent text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(111,120,255,0.16),_transparent_24%),radial-gradient(circle_at_82%_12%,_rgba(118,185,0,0.08),_transparent_16%)]" />
        <div className="absolute left-[8%] top-24 h-64 w-64 rounded-full bg-indigo-500/12 blur-3xl animate-hero-drift" />
        <div className="absolute right-[8%] top-16 h-72 w-72 rounded-full bg-lime-500/8 blur-3xl animate-hero-float" />
        <div className="absolute bottom-0 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-cyan-500/6 blur-3xl animate-hero-drift-slow" />
      </div>

      <header className="sticky top-0 z-40 border-b border-white/6 bg-[rgba(7,8,10,0.82)] backdrop-blur-xl">
        <div className="section-shell flex items-center justify-between px-6 py-4 lg:px-8">
          <a href="#top" className="flex items-center gap-3 text-sm font-medium text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] font-mono text-[12px] tracking-[0.24em] text-lime-300">
              HF
            </span>
            <span className="text-[15px] font-semibold tracking-[-0.02em]">HUDForge</span>
          </a>

          <nav className="hidden items-center gap-6 md:flex">
            {navItems.map(([label, href]) => (
              <a key={href} href={href} className="premium-link text-sm">
                {label}
              </a>
            ))}
          </nav>

          <a href="#waitlist" className="primary-cta px-4 text-sm font-semibold">
            Join private beta
          </a>
        </div>
      </header>

      <section id="top" className="relative isolate overflow-hidden px-6 pb-18 pt-14 lg:px-8 lg:pb-24 lg:pt-18">
        <div className="section-shell grid items-center gap-12 lg:grid-cols-[minmax(0,1.02fr)_minmax(420px,0.98fr)]">
          <div className="max-w-3xl">
            <div className="eyebrow-pill">Private beta for Roblox builders who care about feel</div>

            <h1 className="display-title mt-8 max-w-5xl text-5xl text-white sm:text-6xl lg:text-[5.25rem]">
              Build Roblox UI with the discipline of a premium product team.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 sm:text-[1.125rem]">
              HUDForge turns prompts into transparent PNGs, structured Luau hierarchies, and cinematic UI directions so
              menus, HUDs, and inventories stay cohesive without dragging the sprint into design limbo.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              <a href="#waitlist" className="primary-cta px-6 text-base font-semibold">
                Join the waitlist
              </a>
              <a href="#showcase" className="secondary-cta px-6 text-base font-semibold">
                See the UI system
              </a>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {heroTags.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/8 bg-white/[0.02] px-4 py-2 text-sm text-slate-200"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-5 top-10 hidden rounded-full border border-lime-400/20 bg-black/55 px-4 py-2 text-[11px] uppercase tracking-[0.26em] text-lime-200 lg:block">
              Motion polished
            </div>
            <div className="absolute -right-3 top-6 hidden rounded-full border border-indigo-300/18 bg-black/55 px-4 py-2 text-[11px] uppercase tracking-[0.26em] text-indigo-100 lg:block">
              Gaming-forward
            </div>

            <div className="hud-frame overflow-hidden rounded-[2rem] p-5 lg:p-6">
              <div className="flex items-start justify-between gap-4 border-b border-white/8 pb-4">
                <div>
                  <p className="data-label">HUDForge command deck</p>
                  <h2 className="mt-2 text-[1.35rem] font-semibold tracking-[-0.03em] text-white">Prompt → preview → export</h2>
                </div>
                <div className="rounded-full border border-lime-400/18 bg-lime-400/10 px-3 py-1 text-xs text-lime-100">Live preview</div>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-[1.02fr_0.98fr]">
                <div className="rounded-[1.5rem] border border-white/8 bg-black/35 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="data-label">Game UI prompt</p>
                    <span className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-slate-400">
                      Fantasy raid HUD
                    </span>
                  </div>

                  <p className="mt-4 text-sm leading-7 text-slate-200">
                    Create a fantasy health bar with gold trim, electric cyan accents, and a dramatic damage flash that still
                    reads clearly during combat.
                  </p>

                  <div className="mt-5 rounded-[1.25rem] border border-white/8 bg-white/[0.02] p-4">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Style state</span>
                      <span>Reactive / Premium / Readable</span>
                    </div>
                    <div className="mt-3 h-2.5 rounded-full bg-white/8">
                      <div className="h-2.5 w-[84%] rounded-full bg-gradient-to-r from-amber-300 via-orange-400 to-cyan-400" />
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-3">
                      {['Q', 'E', 'R'].map((key) => (
                        <div
                          key={key}
                          className="flex h-14 items-center justify-center rounded-xl border border-white/8 bg-white/[0.03] text-lg font-semibold text-white"
                        >
                          {key}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="rounded-[1.5rem] border border-white/8 bg-[linear-gradient(180deg,rgba(111,120,255,0.13),rgba(118,185,0,0.05))] p-4">
                    <div className="flex items-center justify-between text-sm text-slate-200">
                      <span>Generated HUD mock</span>
                      <span className="text-slate-500">512 × 512</span>
                    </div>
                    <div className="mt-4 rounded-[1.25rem] border border-white/8 bg-black/40 p-4">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>HP</span>
                        <span>84%</span>
                      </div>
                      <div className="mt-2 h-4 rounded-full bg-white/8">
                        <div className="h-4 w-[84%] rounded-full bg-gradient-to-r from-rose-500 via-amber-400 to-orange-300" />
                      </div>

                      <div className="mt-4 grid grid-cols-3 gap-3">
                        {[
                          ['Cooldown', '18s'],
                          ['Ammo', '24'],
                          ['Focus', 'Ready'],
                        ].map(([label, value]) => (
                          <div key={label} className="rounded-xl border border-white/8 bg-white/[0.03] px-3 py-3 text-center">
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
                      <div key={label} className="rounded-2xl border border-white/8 bg-black/35 p-4 text-center">
                        <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500">{label}</div>
                        <div className="mt-2 text-base font-semibold text-white">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="section-shell mt-8 px-0 lg:mt-10">
          <div className="grid gap-4 rounded-[1.75rem] border border-white/8 bg-[rgba(255,255,255,0.02)] p-4 md:grid-cols-2 xl:grid-cols-4 xl:p-5">
            {heroStats.map(([label, value]) => (
              <div key={label} className="rounded-[1.25rem] border border-white/6 bg-black/28 px-4 py-4">
                <div className="data-label">{label}</div>
                <div className="mt-2 text-sm font-medium text-slate-100 sm:text-[15px]">{value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="workflow" className="px-6 pb-8 lg:px-8">
        <div className="section-shell grid gap-5 rounded-[2rem] border border-white/8 bg-[rgba(255,255,255,0.02)] p-5 lg:grid-cols-3 lg:p-6">
          {workflowCards.map(([label, value], index) => (
            <div key={label} className="rounded-[1.4rem] border border-white/8 bg-black/28 p-5">
              <div className="flex items-center justify-between gap-4">
                <span className="data-label">0{index + 1}</span>
                <span className="text-[11px] uppercase tracking-[0.26em] text-slate-500">{label}</span>
              </div>
              <p className="mt-4 text-base leading-7 text-slate-200">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <PainPoints />
      <Features />
      <ProofSignals />
      <Showcase />
      <Pricing />
      <Waitlist />

      <footer className="border-t border-white/8 px-6 py-10 lg:px-8">
        <div className="section-shell flex flex-col items-center justify-between gap-4 text-sm text-slate-500 md:flex-row">
          <p>© 2026 HUDForge. Built for Roblox developers who care about game feel.</p>
          <div className="flex flex-wrap items-center gap-6">
            <a href="#why" className="premium-link">
              Why HUDForge
            </a>
            <a href="#showcase" className="premium-link">
              Showcase
            </a>
            <a href="#waitlist" className="premium-link">
              Waitlist
            </a>
            <a href="https://github.com/lukes1975/hudforge" className="premium-link">
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </main>
  )
}
