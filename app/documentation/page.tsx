import type { Metadata } from 'next'
import Link from 'next/link'
import { CTASection } from '@/components/marketing/CTASection'
import { MarketingShell } from '@/components/marketing/MarketingShell'
import { PageHero } from '@/components/marketing/PageHero'
import { docsCategories } from '@/lib/marketing-content'

export const metadata: Metadata = {
  title: 'Documentation | HUDForge',
  description: 'HUDForge documentation for quick starts, prompt systems, Roblox handoff, and beta operations.',
}

export default function DocumentationPage() {
  return (
    <MarketingShell>
      <main>
        <PageHero
          eyebrow="Documentation"
          title="The operating manual for the Roblox UI forge."
          copy="Start with the essentials: write a useful brief, select a template, understand the output stack, and move the direction into Roblox Studio."
          primary={{ label: 'Start with Templates', href: '/templates' }}
          secondary={{ label: 'Contact Support', href: '/contact' }}
        />

        <section className="px-5 py-12 sm:px-6 lg:px-8">
          <div className="section-shell grid gap-5 md:grid-cols-2">
            {docsCategories.map((category) => (
              <article key={category.title} className="rune-card p-6">
                <h2 className="text-2xl font-semibold text-white">{category.title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-400">{category.copy}</p>
                <div className="mt-6 grid gap-2">
                  {category.links.map((link) => (
                    <Link key={link} href="/contact#waitlist" className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300 transition hover:border-cyan-300/30 hover:text-white">
                      {link}
                    </Link>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="px-5 py-12 sm:px-6 lg:px-8">
          <div className="section-shell rune-card p-6 sm:p-8">
            <p className="section-kicker">Quick start checklist</p>
            <div className="mt-6 grid gap-4 md:grid-cols-4">
              {['Choose a screen job', 'Pick a template', 'Write state requirements', 'Export production notes'].map((item, index) => (
                <div key={item} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <span className="text-sm font-semibold text-cyan-200">0{index + 1}</span>
                  <p className="mt-3 text-sm text-slate-300">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <CTASection source="documentation_page" />
      </main>
    </MarketingShell>
  )
}
