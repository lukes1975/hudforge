import type { Metadata } from 'next'
import { CTASection } from '@/components/marketing/CTASection'
import { MarketingShell } from '@/components/marketing/MarketingShell'
import { PageHero } from '@/components/marketing/PageHero'
import { faqs, workflowSteps } from '@/lib/marketing-content'

export const metadata: Metadata = {
  title: 'How It Works | HUDForge',
  description: 'See how HUDForge turns Roblox UI prompts, templates, and export notes into a faster production workflow.',
}

export default function HowItWorksPage() {
  return (
    <MarketingShell>
      <main>
        <PageHero
          eyebrow="Workflow"
          title="A focused path from genre brief to Roblox-ready UI direction."
          copy="HUDForge keeps the creative loop practical: choose a proven pattern, describe the game fantasy, refine the interface, and export the handoff stack."
          primary={{ label: 'Explore Templates', href: '/templates' }}
          secondary={{ label: 'Read Docs', href: '/documentation' }}
        >
          <div className="rune-card p-5">
            <p className="data-label">Output stack</p>
            <div className="mt-4 grid gap-3 text-sm text-slate-300">
              {['Prompt brief', 'Visual system', 'PNG direction', 'Luau notes'].map((item) => (
                <div key={item} className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </PageHero>

        <section className="px-5 py-12 sm:px-6 lg:px-8">
          <div className="section-shell grid gap-5 lg:grid-cols-4">
            {workflowSteps.map((step, index) => (
              <article key={step.title} className="rune-card p-6">
                <span className="text-sm font-semibold text-cyan-200">0{index + 1}</span>
                <h2 className="mt-4 text-2xl font-semibold text-white">{step.title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-400">{step.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="px-5 py-12 sm:px-6 lg:px-8">
          <div className="section-shell grid gap-5 lg:grid-cols-[1fr_1fr]">
            <div className="rune-card p-6 sm:p-8">
              <p className="section-kicker">Export discipline</p>
              <h2 className="section-title mt-4 text-4xl font-semibold text-white">Designed for the handoff, not just the preview.</h2>
              <p className="mt-5 text-base leading-7 text-slate-400">
                The workflow treats every screen as a system of frames, states, counters, chips, and responsive constraints. That keeps the art direction useful when it moves into Roblox Studio.
              </p>
            </div>
            <div className="grid gap-4">
              {['Screen role and player action', 'Panel anatomy and state inventory', 'Theme palette and rarity language', 'Studio rebuild notes'].map((item) => (
                <div key={item} className="rune-card px-5 py-4 text-sm text-slate-300">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-12 sm:px-6 lg:px-8">
          <div className="section-shell grid gap-4 md:grid-cols-3">
            {faqs.map((faq) => (
              <article key={faq.question} className="rune-card p-6">
                <h2 className="text-xl font-semibold text-white">{faq.question}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-400">{faq.answer}</p>
              </article>
            ))}
          </div>
        </section>
        <CTASection source="how_it_works_page" />
      </main>
    </MarketingShell>
  )
}
