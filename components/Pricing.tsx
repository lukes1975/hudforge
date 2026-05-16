export function Pricing() {
  const tiers = [
    {
      name: 'Starter',
      price: '$9',
      description: 'For solo creators validating ideas and early UI systems',
      features: ['50 generations / month', 'PNG + Luau export', 'Founding-rate access'],
    },
    {
      name: 'Pro',
      price: '$19',
      description: 'For serious Roblox builders shipping live UI workflows',
      features: ['500 generations / month', 'Priority generation', 'Advanced styles', 'Version history'],
      popular: true,
    },
    {
      name: 'Studio',
      price: '$49',
      description: 'For teams that need stronger consistency and more output',
      features: ['Unlimited generations', 'Team collaboration', 'Custom styles', 'Priority support', 'API access'],
    },
  ]

  return (
    <section id="pricing" className="relative overflow-hidden px-6 py-24 lg:px-8">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(0,209,255,0.06),transparent_22%),radial-gradient(circle_at_82%_0%,rgba(124,92,255,0.08),transparent_18%)]" />
      <div className="section-shell">
        <div className="max-w-3xl">
          <span className="section-kicker">Founder pricing</span>
          <h2 className="section-title mt-5 text-3xl font-semibold text-white sm:text-5xl">
            Early access pricing that rewards the first builders in.
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-300">
            These tiers help shape the launch. Waitlist members lock in a stronger starting rate before public release.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {tiers.map((tier) => (
            <article
              key={tier.name}
              className={`relative rounded-[1.6rem] border p-7 ${
                tier.popular
                  ? 'border-cyan-400/24 bg-[linear-gradient(180deg,rgba(0,209,255,0.08),rgba(255,255,255,0.02))] shadow-[0_18px_48px_rgba(0,209,255,0.08)]'
                  : 'border-white/8 bg-[rgba(255,255,255,0.02)]'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-6 rounded-full border border-cyan-400/24 bg-cyan-400/12 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-cyan-100">
                  Most popular
                </div>
              )}

              <div className="border-b border-white/8 pb-6">
                <div className="data-label">{tier.name}</div>
                <div className="mt-4 flex items-end gap-2">
                  <span className="text-5xl font-semibold tracking-[-0.05em] text-white">{tier.price}</span>
                  <span className="pb-1 text-slate-500">/month</span>
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-300">{tier.description}</p>
              </div>

              <ul className="mt-6 space-y-4">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-slate-200">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-cyan-400" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="mt-10 text-sm text-slate-400">Final launch pricing will lock once the waitlist feedback loop is complete.</div>
      </div>
    </section>
  )
}
