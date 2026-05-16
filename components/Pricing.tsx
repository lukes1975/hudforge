export function Pricing() {
  const tiers = [
    {
      name: 'Starter',
      price: '$9',
      description: 'For solo creators and small experiments',
      features: ['50 generations/month', 'PNG + Luau export', 'Basic styles'],
    },
    {
      name: 'Pro',
      price: '$19',
      description: 'For serious Roblox builders shipping live UI',
      features: ['500 generations/month', 'Priority generation', 'Advanced styles', 'Version history'],
      popular: true,
    },
    {
      name: 'Studio',
      price: '$49',
      description: 'For teams that need more output and consistency',
      features: ['Unlimited generations', 'Team collaboration', 'Custom styles', 'Priority support', 'API access'],
    },
  ]

  return (
    <section className="relative overflow-hidden px-6 py-24 lg:px-8">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(250,204,21,0.07),transparent_24%),radial-gradient(circle_at_80%_0%,rgba(34,211,238,0.08),transparent_20%)]" />
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <p className="mb-4 text-sm uppercase tracking-[0.34em] text-amber-200/80">Founder pricing</p>
          <h2 className="mb-4 text-3xl font-black tracking-tight text-white sm:text-5xl">
            Early access pricing designed to reward the first builders in.
          </h2>
          <p className="mx-auto max-w-3xl text-lg leading-8 text-slate-300">
            These tiers help shape the launch. Waitlist members lock in the best starting rate before public release.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {tiers.map((tier) => (
            <article
              key={tier.name}
              className={`relative rounded-3xl p-8 transition-all duration-300 hover:-translate-y-1 ${
                tier.popular ? 'hud-frame border-cyan-300/30 shadow-[0_24px_80px_rgba(34,211,238,0.1)]' : 'hud-frame'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-cyan-400 via-violet-500 to-amber-400 px-4 py-1 text-sm font-semibold text-slate-950">
                  Most Popular
                </div>
              )}

              <div className="mb-6 text-center">
                <h3 className="mb-2 text-2xl font-bold text-white">{tier.name}</h3>
                <div className="mb-2">
                  <span className="text-4xl font-black text-white">{tier.price}</span>
                  <span className="text-slate-400">/month</span>
                </div>
                <p className="text-sm text-slate-300">{tier.description}</p>
              </div>

              <ul className="space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-slate-300">
                    <span className="mt-0.5 text-cyan-300">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="mt-12 text-center text-sm text-slate-400">
          Final launch pricing will be locked once the waitlist feedback loop is complete.
        </div>
      </div>
    </section>
  )
}
