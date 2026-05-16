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
    <section className="py-24 px-6 lg:px-8 bg-slate-950/70">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <p className="text-sm uppercase tracking-[0.3em] text-pink-300/80 mb-4">Founder pricing</p>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-5xl mb-4">
            Early access pricing designed to reward the first builders in.
          </h2>
          <p className="text-lg text-slate-300 max-w-3xl mx-auto">
            These tiers are being used to shape the launch. Waitlist members lock in the best starting rate before public release.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {tiers.map((tier) => (
            <article
              key={tier.name}
              className={`relative rounded-3xl p-8 transition-transform duration-300 hover:-translate-y-1 ${
                tier.popular
                  ? 'glass-panel border-cyan-400/40 shadow-cyan-500/10'
                  : 'glass-panel'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 px-4 py-1 text-sm font-semibold text-white">
                  Most Popular
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                <div className="mb-2">
                  <span className="text-4xl font-bold text-white">{tier.price}</span>
                  <span className="text-slate-400">/month</span>
                </div>
                <p className="text-slate-300 text-sm">{tier.description}</p>
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
