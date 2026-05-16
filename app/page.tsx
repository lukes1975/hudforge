import { Features } from '@/components/Features'
import { Header } from '@/components/Header'
import { Hero } from '@/components/Hero'
import { PainPoints } from '@/components/PainPoints'
import { Pricing } from '@/components/Pricing'
import { ProofSignals } from '@/components/ProofSignals'
import { Showcase } from '@/components/Showcase'
import { Waitlist } from '@/components/Waitlist'

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-transparent text-white">
      <Header />
      <Hero />
      <PainPoints />
      <section id="features">
        <Features />
      </section>
      <ProofSignals />
      <Showcase />
      <Pricing />
      <Waitlist />

      <footer className="border-t border-white/8 px-6 py-10 lg:px-8">
        <div className="section-shell flex flex-col items-center justify-between gap-4 text-sm text-slate-500 md:flex-row">
          <p>© 2026 HUDForge. Built for Roblox developers who care about game feel.</p>
          <div className="flex flex-wrap items-center gap-6">
            <a href="#features" className="premium-link">
              Features
            </a>
            <a href="#workflow" className="premium-link">
              Workflow
            </a>
            <a href="#showcase" className="premium-link">
              Examples
            </a>
            <a href="#pricing" className="premium-link">
              Pricing
            </a>
          </div>
        </div>
      </footer>
    </main>
  )
}
