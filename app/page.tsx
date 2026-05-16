import { Waitlist } from '@/components/Waitlist'
import { Features } from '@/components/Features'
import { Showcase } from '@/components/Showcase'
import { PainPoints } from '@/components/PainPoints'
import { Pricing } from '@/components/Pricing'
import { ProofSignals } from '@/components/ProofSignals'

const navItems = [
  ['Why it exists', '#why'],
  ['Workflow', '#workflow'],
  ['Product proof', '#showcase'],
  ['Pricing', '#pricing'],
]

const heroTags = ['Transparent PNGs', 'Structured Luau', 'Roblox-native workflow', 'Founder pricing']

const heroStats = [
  ['Output surface', 'PNG assets, components, and Luau structure'],
  ['Core value', 'Faster implementation with less repetitive Studio work'],
  ['Review loop', 'Prompt → preview → export'],
  ['Positioning', 'Roblox UI production workflow platform'],
]

const workflowCards = [
  ['Prompt', 'Describe the game state, tone, and readability goal instead of rebuilding screens from scratch.'],
  ['Generate', 'Review UI concepts, assets, and component directions in one controlled product surface.'],
  ['Export', 'Move into PNG assets, Luau hierarchy, and Studio-ready implementation faster.'],
]

function HudForgeMark() {
  return (
    <svg aria-hidden="true" className="brand-mark h-9 w-9" viewBox="0 0 40 40" fill="none">
      <rect x="5" y="5" width="30" height="30" rx="9" stroke="rgba(148,163,184,0.32)" />
      <path d="M13 12V28" stroke="#00D1FF" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M13 20H22" stroke="#00D1FF" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M22 12V28" stroke="#E2E8F0" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M22 12H28" stroke="#7C5CFF" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M22 20H27" stroke="#7C5CFF" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-transparent text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(0,209,255,0.1),_transparent_24%),radial-gradient(circle_at_82%_12%,_rgba(124,92,255,0.08),_transparent_18%)]" />
        <div className="absolute left-[12%] top-24 h-60 w-60 rounded-full bg-cyan-400/8 blur-3xl animate-hero-drift" />
        <div className="absolute right-[10%] top-16 h-72 w-72 rounded-full bg-violet-500/8 blur-3xl animate-hero-float" />
        <div className="absolute bottom-0 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-cyan-500/5 blur-3xl animate-hero-drift-slow" />
      </div>

      <header className="sticky top-0 z-40 border-b border-white/6 bg-[rgba(6,8,22,0.82)] backdrop-blur-xl">
        <div className="section-shell flex items-center justify-between px-6 py-4 lg:px-8">
          <a href="#top" className="flex items-center gap-3 text-sm font-medium text-white">
            <HudForgeMark />
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
        <div className="section-shell grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(460px,1fr)]">
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
            <div className="absolute -left-5 top-10 hidden rounded-full border border-cyan-400/16 bg-black/45 px-4 py-2 text-[11px] uppercase tracking-[0.26em] text-cyan-100 lg:block">
              Workflow acceleration
            </div>
            <div className="absolute -right-3 top-6 hidden rounded-full border border-violet-300/18 bg-black/45 px-4 py-2 text-[11px] uppercase tracking-[0.26em] text-violet-100 lg:block">
              Roblox-native tooling
            </div>

            <div className="hud-frame active-frame overflow-hidden rounded-[1.9rem] p-5 lg:p-6">
              <div className="flex items-start justify-between gap-4 border-b border-white/8 pb-4">
                <div>
                  <p className="data-label">HUDForge command deck</p>
                  <h2 className="mt-2 text-[1.35rem] font-semibold tracking-[-0.03em] text-white">Prompt → preview → export</h2>
                </div>
                <div className="rounded-full border border-cyan-400/18 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-100">Live preview</div>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-[1.02fr_0.98fr]">
                <div className="rounded-[1.4rem] border border-white/8 bg-black/28 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="data-label">Prompt input</p>
                    <span className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-slate-400">
                      Combat HUD brief
                    </span>
                  </div>

                  <div className="mt-4 rounded-[1rem] border border-white/8 bg-[#060816] px-4 py-3 text-sm leading-7 text-slate-200">
                    Create a fantasy health bar with gold trim, electric cyan accents, and a dramatic damage flash that still reads
                    clearly during combat.
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {[
                      ['Output', 'Transparent PNG asset set'],
                      ['Style system', 'Readable · Premium · Cohesive'],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-[1rem] border border-white/8 bg-white/[0.02] px-4 py-4">
                        <div className="data-label">{label}</div>
                        <div className="mt-2 text-sm text-slate-200">{value}</div>
                      </div>
                    ))}
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

                <div className="grid gap-4">
                  <div className="rounded-[1.4rem] border border-cyan-400/14 bg-[linear-gradient(180deg,rgba(0,209,255,0.08),rgba(255,255,255,0.02))] p-4">
                    <div className="flex items-center justify-between text-sm text-slate-200">
                      <span>Generated UI preview</span>
                      <span className="text-slate-500">512 × 512</span>
                    </div>
                    <div className="mt-4 rounded-[1.15rem] border border-white/8 bg-[#0b1020] p-4">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>HP</span>
                        <span>84%</span>
                      </div>
                      <div className="mt-2 h-4 rounded-full bg-white/8">
                        <div className="h-4 w-[84%] rounded-full bg-gradient-to-r from-cyan-400 via-cyan-300 to-violet-400 shadow-[0_0_18px_rgba(0,209,255,0.18)]" />
                      </div>

                      <div className="mt-4 grid grid-cols-3 gap-3">
                        {[
                          ['PNG', 'Ready'],
                          ['Layers', '12 parts'],
                          ['States', 'Hover / active'],
                        ].map(([label, value]) => (
                          <div key={label} className="rounded-xl border border-white/8 bg-white/[0.03] px-3 py-3 text-center">
                            <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500">{label}</div>
                            <div className="mt-2 text-sm font-semibold text-white">{value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-[1.2rem] border border-white/8 bg-black/28 p-4">
                      <div className="data-label">Luau hierarchy</div>
                      <div className="mt-3 space-y-1 font-mono text-[12px] text-slate-300">
                        <div>ScreenGui</div>
                        <div className="pl-4">└─ CombatHUD</div>
                        <div className="pl-8">├─ HealthBar</div>
                        <div className="pl-8">└─ AbilityTray</div>
                      </div>
                    </div>
                    <div className="rounded-[1.2rem] border border-white/8 bg-black/28 p-4">
                      <div className="data-label">Studio handoff</div>
                      <div className="mt-3 space-y-2 text-sm text-slate-300">
                        <div className="rounded-lg border border-white/8 bg-white/[0.03] px-3 py-2">Explorer-ready structure</div>
                        <div className="rounded-lg border border-white/8 bg-white/[0.03] px-3 py-2">Asset naming preserved</div>
                        <div className="rounded-lg border border-white/8 bg-white/[0.03] px-3 py-2">Reduced rebuild time</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="section-shell mt-8 px-0 lg:mt-10">
          <div className="grid gap-4 rounded-[1.6rem] border border-white/8 bg-[rgba(255,255,255,0.02)] p-4 md:grid-cols-2 xl:grid-cols-4 xl:p-5">
            {heroStats.map(([label, value]) => (
              <div key={label} className="rounded-[1.1rem] border border-white/6 bg-[#0b1020]/70 px-4 py-4">
                <div className="data-label">{label}</div>
                <div className="mt-2 text-sm font-medium text-slate-100 sm:text-[15px]">{value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="workflow" className="px-6 pb-8 lg:px-8">
        <div className="section-shell grid gap-5 rounded-[1.8rem] border border-white/8 bg-[rgba(255,255,255,0.02)] p-5 lg:grid-cols-[0.92fr_1.08fr] lg:p-6">
          <div className="rounded-[1.5rem] border border-white/8 bg-[#0b1020]/68 p-5">
            <span className="section-kicker">Workflow surface</span>
            <h3 className="section-title mt-5 text-2xl font-semibold text-white sm:text-[2rem]">
              Productized around faster Roblox UI implementation.
            </h3>
            <p className="mt-4 text-base leading-7 text-slate-300">
              HUDForge should read like developer infrastructure: a controlled interface that removes repetitive UI setup work,
              keeps exports organized, and helps teams ship polished interfaces with less Studio friction.
            </p>

            <div className="mt-6 space-y-3">
              {workflowCards.map(([label, value], index) => (
                <div key={label} className="rounded-[1.1rem] border border-white/8 bg-black/24 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="data-label">0{index + 1}</span>
                    <span className="text-[11px] uppercase tracking-[0.26em] text-slate-500">{label}</span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-200">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.5rem] border border-white/8 bg-[#060816]/72 p-5">
              <div className="data-label">PNG asset previews</div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {['HUD frame', 'Button state', 'Cooldown ring', 'Inventory tile', 'Dialog panel', 'Tooltip shell'].map((item) => (
                  <div key={item} className="rounded-[1rem] border border-white/8 bg-white/[0.03] p-3">
                    <div className="h-16 rounded-lg border border-dashed border-cyan-400/20 bg-[linear-gradient(180deg,rgba(0,209,255,0.08),rgba(255,255,255,0.02))]" />
                    <div className="mt-2 text-[11px] text-slate-400">{item}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-white/8 bg-[#060816]/72 p-5">
              <div className="data-label">Luau export example</div>
              <div className="mt-4 rounded-[1rem] border border-white/8 bg-black/24 p-4 font-mono text-[12px] leading-6 text-slate-300">
                <div>ScreenGui</div>
                <div className="pl-4">└─ MainHud</div>
                <div className="pl-8">├─ TopBar</div>
                <div className="pl-8">├─ HealthFrame</div>
                <div className="pl-8">├─ AbilityTray</div>
                <div className="pl-8">└─ NotificationStack</div>
              </div>
              <div className="mt-4 rounded-[1rem] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
                Exported structure preserves layout intent, naming, and implementation clarity.
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

      <footer className="border-t border-white/8 px-6 py-10 lg:px-8">
        <div className="section-shell flex flex-col items-center justify-between gap-4 text-sm text-slate-500 md:flex-row">
          <p>© 2026 HUDForge. Built for Roblox developers who care about game feel.</p>
          <div className="flex flex-wrap items-center gap-6">
            <a href="#why" className="premium-link">
              Why HUDForge
            </a>
            <a href="#showcase" className="premium-link">
              Product proof
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
