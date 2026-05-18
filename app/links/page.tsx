import type { Metadata } from 'next'
import Link from 'next/link'
import { CTASection } from '@/components/marketing/CTASection'
import { MarketingShell } from '@/components/marketing/MarketingShell'
import { PageHero } from '@/components/marketing/PageHero'

const launchChannels = [
  {
    name: 'X / Twitter',
    handle: '@hudforgeapp',
    status: 'Pending activation',
    purpose: 'Short-form launch clips, build-in-public updates, and waitlist CTAs.',
    action: 'Activate with setup guide',
  },
  {
    name: 'LinkedIn',
    handle: 'HUDForge',
    status: 'Pending activation',
    purpose: 'Credibility, founder updates, and studio-facing launch posts.',
    action: 'Activate company page',
  },
  {
    name: 'Discord',
    handle: 'HUDForge server',
    status: 'Pending activation',
    purpose: 'Private beta community, feedback capture, and creator support.',
    action: 'Create server and upload brand kit',
  },
  {
    name: 'YouTube',
    handle: '@hudforgeapp',
    status: 'Pending activation',
    purpose: 'Prompt-to-HUD demos, Shorts, and Studio workflow teardowns.',
    action: 'Claim handle and upload header',
  },
  {
    name: 'GitHub',
    handle: 'lukes1975/hudforge',
    status: 'Live repo',
    purpose: 'Developer credibility, roadmap proof, and technical backlinks.',
    action: 'Keep README and screenshots current',
  },
  {
    name: 'Roblox DevForum',
    handle: 'Founder account',
    status: 'Pending activation',
    purpose: 'Direct creator feedback and launch discovery inside the Roblox ecosystem.',
    action: 'Post launch thread',
  },
]

export const metadata: Metadata = {
  title: 'Links | HUDForge',
  description: 'Launch channels, community touchpoints, and distribution surfaces for HUDForge.',
}

export default function LinksPage() {
  return (
    <MarketingShell>
      <main>
        <PageHero
          eyebrow="Distribution"
          title="The launch map for every HUDForge touchpoint."
          copy="Use this page as the public hub for launch channels, founder updates, and community surfaces. Until accounts are activated, the waitlist and docs remain the primary CTA."
          primary={{ label: 'Join Waitlist', href: '/contact#waitlist' }}
          secondary={{ label: 'Download Press Kit', href: '/press-kit/hudforge-press-kit.zip' }}
        />

        <section className="px-5 py-12 sm:px-6 lg:px-8">
          <div className="section-shell grid gap-5 lg:grid-cols-2">
            {launchChannels.map((channel) => (
              <article key={channel.name} className="rune-card p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="data-label">{channel.status}</p>
                    <h2 className="mt-3 text-2xl font-semibold text-white">{channel.name}</h2>
                  </div>
                  <span className="tag-chip">{channel.handle}</span>
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-400">{channel.purpose}</p>
                <p className="mt-6 text-sm font-semibold text-cyan-100">{channel.action}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="px-5 py-12 sm:px-6 lg:px-8">
          <div className="section-shell rune-card grid gap-5 p-6 sm:p-8 lg:grid-cols-[1fr_0.85fr]">
            <div>
              <p className="section-kicker">Brand downloads</p>
              <h2 className="section-title mt-4 text-4xl font-semibold text-white sm:text-5xl">Everything needed to talk about HUDForge consistently.</h2>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400">The press kit includes logos, launch banners, social headers, screenshots, and a one-page product overview.</p>
            </div>
            <div className="grid gap-3">
              <Link href="/press-kit/hudforge-overview.pdf" className="forge-button forge-button--secondary">View overview PDF</Link>
              <Link href="/press-kit/hudforge-press-kit.zip" className="forge-button forge-button--primary">Download press kit ZIP</Link>
              <Link href="/documentation" className="premium-link text-sm">Read product docs</Link>
            </div>
          </div>
        </section>
        <CTASection source="links_page" />
      </main>
    </MarketingShell>
  )
}
