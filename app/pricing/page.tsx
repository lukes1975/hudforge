import type { Metadata } from 'next'
import Link from 'next/link'
import { CTASection } from '@/components/marketing/CTASection'
import { MarketingShell } from '@/components/marketing/MarketingShell'
import { PageHero } from '@/components/marketing/PageHero'
import { faqs, pricingPlans } from '@/lib/marketing-content'

export const metadata: Metadata = {
  title: 'Pricing | HUDForge',
  description: 'Simple USD pricing for Roblox UI creators. Free to start, upgrade when ready.',
}

export default function PricingPage() {
  return (
    <MarketingShell>
      <main>
        <PageHero
          eyebrow="Pricing"
          title="Simple pricing for Roblox UI creators."
          copy="Start free with 25 credits, then upgrade when HUDForge becomes part of your weekly production loop."
          primary={{ label: 'Start free', href: '/sign-up' }}
          secondary={{ label: 'Contact us', href: '/contact' }}
        >
          <div className="rune-card p-5">
            <p className="data-label">Credit top-ups available</p>
            <p className="mt-4 text-sm leading-7 text-slate-300">Need more credits without changing plan? Buy one-time top-ups from $9.</p>
          </div>
        </PageHero>

        <section className="px-5 py-12 sm:px-6 lg:px-8">
          <div className="section-shell grid gap-5 lg:grid-cols-3">
            {pricingPlans.map((plan) => (
              <article key={plan.name} className={`rune-card flex flex-col p-6 ${plan.featured ? 'active-frame' : ''}`}>
                <p className="data-label">{plan.featured ? 'Most popular' : 'Plan'}</p>
                <h2 className="mt-4 text-3xl font-semibold text-white">{plan.name}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-400">{plan.description}</p>
                <div className="mt-7">
                  <span className="text-5xl font-semibold text-white">{plan.price}</span>
                  <span className="ml-2 text-sm text-slate-500">{plan.cadence}</span>
                </div>
                <ul className="mt-7 grid gap-3 text-sm text-slate-300">
                  {plan.features.map((feature) => (
                    <li key={feature}>+ {feature}</li>
                  ))}
                </ul>
                <Link href="/sign-up" className={`forge-button mt-8 ${plan.featured ? 'forge-button--primary' : 'forge-button--secondary'}`}>
                  {plan.cta}
                </Link>
              </article>
            ))}
          </div>
          <div className="section-shell mt-6">
            <div className="rune-card border-white/10 bg-white/[0.03] p-5 text-sm leading-7 text-slate-300">
              <p className="font-semibold text-white">Billing note</p>
              <p className="mt-3">
                Prices in USD. Billed via Lemon Squeezy. See our{' '}
                <Link href="/legal/refunds" className="premium-link">
                  Refund Policy
                </Link>
                . Before purchasing, review our{' '}
                <Link href="/legal/terms" className="premium-link">
                  Terms of Service
                </Link>
                ,{' '}
                <Link href="/legal/privacy" className="premium-link">
                  Privacy Policy
                </Link>
                , and{' '}
                <Link href="/legal/ai-disclaimer" className="premium-link">
                  AI Output Disclaimer
                </Link>
                .
              </p>
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
        <CTASection source="pricing_page" />
      </main>
    </MarketingShell>
  )
}
