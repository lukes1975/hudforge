import { Waitlist } from '@/components/Waitlist'
import { Features } from '@/components/Features'
import { Showcase } from '@/components/Showcase'
import { PainPoints } from '@/components/PainPoints'
import { Pricing } from '@/components/Pricing'

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-transparent">
      <section className="relative isolate overflow-hidden px-6 pt-16 lg:px-8">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[38rem] w-[38rem] -translate-x-1/2 rounded-full bg-cyan-500/20 blur-3xl animate-glow" />
          <div className="absolute right-[10%] top-24 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl animate-float" />
          <div className="absolute left-[8%] bottom-10 h-64 w-64 rounded-full bg-blue-500/15 blur-3xl animate-float" />
        </div>

        <div className="mx-auto grid max-w-7xl items-center gap-14 py-24 lg:grid-cols-[1.05fr_0.95fr] lg:py-32">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-cyan-400/25 bg-white/5 px-4 py-2 text-sm text-cyan-100">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-glow" />
              Private beta for Roblox builders who ship
            </div>

            <h1 className="text-5xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl">
              Build Roblox UI that feels like it belongs in a live game.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
              HUDForge turns prompts into transparent PNGs, clean Luau hierarchies, and polished UI directions in seconds — so you can iterate faster without losing the look.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              <a
                href="#waitlist"
                className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-cyan-500/15 transition-transform duration-300 hover:scale-[1.02]"
              >
                Join the waitlist
              </a>
              <a
                href="#showcase"
                className="inline-flex items-center justify-center rounded-2xl border border-white/12 bg-white/5 px-8 py-4 text-base font-semibold text-white transition-colors duration-300 hover:bg-white/10"
              >
                See example UI
              </a>
            </div>

            <div className="mt-10 flex flex-wrap gap-3 text-sm text-slate-300">
              {['Transparent PNGs', 'Clean Luau hierarchy', 'Roblox-first styling', 'Founder pricing'].map((item) => (
                <span key={item} className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="glass-panel relative overflow-hidden rounded-[2rem] p-6 shadow-2xl">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent shimmer" />

              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">HUDForge preview</p>
                  <h2 className="mt-2 text-xl font-semibold text-white">Prompt → Preview → Export</h2>
                </div>
                <div className="rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200">
                  Live workflow
                </div>
              </div>

              <div className="mt-6 grid gap-4">
                <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-4">
                  <p className="mb-2 text-xs uppercase tracking-[0.28em] text-cyan-200/70">Game UI prompt</p>
                  <p className="text-sm text-slate-200">
                    Create a fantasy health bar with red glow, gold trim, and a dramatic damage flash.
                  </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-500/20 via-blue-500/10 to-purple-500/20 p-5">
                  <div className="flex items-center justify-between text-sm text-slate-200">
                    <span>Generated HUD mock</span>
                    <span>512 × 512</span>
                  </div>
                  <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>HP</span>
                      <span>84%</span>
                    </div>
                    <div className="mt-2 h-4 rounded-full bg-white/10">
                      <div className="h-4 w-[84%] rounded-full bg-gradient-to-r from-red-500 to-orange-400" />
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-3">
                      {['Q', 'E', 'R'].map((item) => (
                        <div key={item} className="flex h-14 items-center justify-center rounded-xl border border-white/10 bg-white/8 text-lg font-bold text-white">
                          {item}
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
                      <div className="text-xs uppercase tracking-[0.25em] text-slate-500">{label}</div>
                      <div className="mt-2 text-base font-semibold text-white">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PainPoints />
      <Features />
      <Showcase />
      <Pricing />
      <Waitlist />

      <footer className="border-t border-white/10 px-6 py-10 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-slate-500 md:flex-row">
          <p>© 2026 HUDForge. Built for Roblox developers.</p>
          <div className="flex gap-6">
            <a href="#waitlist" className="transition-colors hover:text-slate-200">Waitlist</a>
            <a href="#showcase" className="transition-colors hover:text-slate-200">Showcase</a>
            <a href="https://github.com/lukes1975/hudforge" className="transition-colors hover:text-slate-200">GitHub</a>
          </div>
        </div>
      </footer>
    </main>
  )
}
