import Link from 'next/link'
import { WaitlistForm } from '@/components/marketing/WaitlistForm'

export function CTASection({ source = 'cta_section' }: { source?: string }) {
  return (
    <section className="px-5 py-16 sm:px-6 lg:px-8">
      <div className="section-shell rune-card cta-panel grid items-center gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_0.88fr] lg:p-10">
        <div>
          <p className="section-kicker">Private beta</p>
          <h2 className="section-title mt-4 text-4xl font-semibold text-white sm:text-5xl">Forge Roblox UI that looks ready before the first sprint ends.</h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
            Join the waitlist for founder pricing, early template access, and product updates focused on Roblox creators.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/templates" className="forge-button forge-button--secondary">
              Explore Templates
            </Link>
            <Link href="/documentation" className="forge-button forge-button--secondary">
              Read Docs
            </Link>
          </div>
        </div>
        <WaitlistForm source={source} />
      </div>
    </section>
  )
}
