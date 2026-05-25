import Link from 'next/link'

export function CTASection({ source = 'cta_section' }: { source?: string }) {
  void source

  return (
    <section className="px-5 py-16 sm:px-6 lg:px-8">
      <div className="section-shell rune-card cta-panel grid items-center gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:p-10">
        <div>
          <p className="section-kicker">Get started</p>
          <h2 className="section-title mt-4 text-4xl font-semibold text-white sm:text-5xl">Forge Roblox UI that looks ready before the first sprint ends.</h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
            Create an account for founder pricing, template access, and product updates focused on Roblox creators.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
          <Link href="/sign-up" className="forge-button forge-button--primary">
            Get started
          </Link>
          <Link href="/pricing" className="forge-button forge-button--secondary">
            View pricing
          </Link>
        </div>
      </div>
    </section>
  )
}
