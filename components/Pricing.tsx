export function Pricing() {
  const tiers = [
    {
      name: 'Starter',
      price: '$9',
      description: 'Perfect for solo developers',
      features: ['50 generations/month', 'PNG + Luau export', 'Basic templates']
    },
    {
      name: 'Pro',
      price: '$19',
      description: 'For serious creators',
      features: ['500 generations/month', 'Priority generation', 'Advanced styles', 'Version history'],
      popular: true
    },
    {
      name: 'Studio',
      price: '$49',
      description: 'For development teams',
      features: ['Unlimited generations', 'Team collaboration', 'Custom styles', 'Priority support', 'API access']
    }
  ]

  return (
    <div className="py-24 px-6 lg:px-8 bg-gray-900">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl mb-4">
            Early Access Pricing
          </h2>
          <p className="text-xl text-gray-400">
            Founding members lock in these rates forever
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {tiers.map((tier, idx) => (
            <div
              key={idx}
              className={`relative p-8 rounded-2xl border ${
                tier.popular
                  ? 'border-blue-500 bg-gradient-to-br from-blue-900/20 to-purple-900/20'
                  : 'border-gray-800 bg-gray-900/50'
              } hover:border-blue-500/50 transition-all duration-300`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-sm font-semibold text-white">
                  Most Popular
                </div>
              )}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                <div className="mb-2">
                  <span className="text-4xl font-bold text-white">{tier.price}</span>
                  <span className="text-gray-400">/month</span>
                </div>
                <p className="text-gray-400 text-sm">{tier.description}</p>
              </div>
              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, featureIdx) => (
                  <li key={featureIdx} className="flex items-start">
                    <span className="text-blue-400 mr-2">✓</span>
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <p className="text-gray-500">
            Final pricing TBD • Join waitlist for early access discount
          </p>
        </div>
      </div>
    </div>
  )
}
