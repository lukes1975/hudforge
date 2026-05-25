import type { Metadata } from 'next'
import Link from 'next/link'
import { CTASection } from '@/components/marketing/CTASection'
import { MarketingShell } from '@/components/marketing/MarketingShell'
import { PageHero } from '@/components/marketing/PageHero'
import { contactChannels } from '@/lib/marketing-content'

export const metadata: Metadata = {
  title: 'Contact | HUDForge',
  description: 'Contact HUDForge for Roblox creator support and studio partnerships.',
}

export default function ContactPage() {
  return (
    <MarketingShell>
      <main>
        <PageHero
          eyebrow="Contact"
          title="Get support or talk to the studio team."
          copy="HUDForge is focused on Roblox UI workflows. Route studio and support questions through the contact channels below, or create an account to start generating."
          primary={{ label: 'Get started', href: '/sign-up' }}
          secondary={{ label: 'View Pricing', href: '/pricing' }}
        />

        <section className="px-5 py-12 sm:px-6 lg:px-8">
          <div className="section-shell grid gap-5 md:grid-cols-3">
            {contactChannels.map((channel) => (
              <article key={channel.title} className="rune-card p-6">
                <h2 className="text-2xl font-semibold text-white">{channel.title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-400">{channel.copy}</p>
                {channel.href ? (
                  <Link href={channel.href} className="mt-6 inline-block text-sm font-semibold text-cyan-100">
                    {channel.action}
                  </Link>
                ) : (
                  <p className="mt-6 text-sm font-semibold text-cyan-100">{channel.action}</p>
                )}
              </article>
            ))}
          </div>
        </section>
        <CTASection source="contact_bottom_cta" />
      </main>
    </MarketingShell>
  )
}
