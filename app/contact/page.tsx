import type { Metadata } from 'next'
import { CTASection } from '@/components/marketing/CTASection'
import { MarketingShell } from '@/components/marketing/MarketingShell'
import { PageHero } from '@/components/marketing/PageHero'
import { WaitlistForm } from '@/components/marketing/WaitlistForm'
import { contactChannels } from '@/lib/marketing-content'

export const metadata: Metadata = {
  title: 'Contact | HUDForge',
  description: 'Contact HUDForge for private beta access, Roblox creator support, and studio partnerships.',
}

export default function ContactPage() {
  return (
    <MarketingShell>
      <main>
        <PageHero
          eyebrow="Contact"
          title="Get beta access, studio support, or creator help."
          copy="HUDForge is focused on Roblox UI workflows. Use the waitlist for access requests, or route studio and support questions through the contact channels below."
          primary={{ label: 'Join Waitlist', href: '#waitlist' }}
          secondary={{ label: 'View Pricing', href: '/pricing' }}
        />

        <section className="px-5 py-12 sm:px-6 lg:px-8">
          <div className="section-shell grid gap-5 md:grid-cols-3">
            {contactChannels.map((channel) => (
              <article key={channel.title} className="rune-card p-6">
                <h2 className="text-2xl font-semibold text-white">{channel.title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-400">{channel.copy}</p>
                <p className="mt-6 text-sm font-semibold text-cyan-100">{channel.action}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="waitlist" className="px-5 py-12 sm:px-6 lg:px-8">
          <div className="section-shell rune-card grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_0.85fr] lg:p-10">
            <div>
              <p className="section-kicker">Private beta</p>
              <h2 className="section-title mt-4 text-4xl font-semibold text-white sm:text-5xl">Join the founding creator queue.</h2>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400">
                The waitlist form posts to the existing HUDForge waitlist API and does not expose server-side secrets to the frontend.
              </p>
            </div>
            <WaitlistForm source="contact_page" />
          </div>
        </section>
        <CTASection source="contact_bottom_cta" />
      </main>
    </MarketingShell>
  )
}
