export function Features() {
  const features = [
    {
      name: 'Transparent PNGs',
      description: 'Perfect alpha channels. Drop directly into ImageLabel components.',
      icon: '🎯'
    },
    {
      name: 'Structured Luau',
      description: 'Clean hierarchies with proper LayoutOrder, ZIndex, and parent-child relationships.',
      icon: '📐'
    },
    {
      name: 'Live Preview',
      description: 'See your UI in a Roblox-accurate viewport before exporting.',
      icon: '👁️'
    },
    {
      name: 'One-Click Export',
      description: 'Download ready-to-use .rbxm models. Import straight into Studio.',
      icon: '⚡'
    },
    {
      name: 'Style Consistency',
      description: 'Generate matching UI elements. Cohesive design across your entire game.',
      icon: '🎨'
    },
    {
      name: 'Version Control',
      description: 'Iterate on designs. Save variations. Roll back when needed.',
      icon: '🔄'
    }
  ]

  return (
    <div className="py-24 px-6 lg:px-8 bg-black">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl mb-4">
            Everything You Need
          </h2>
          <p className="text-xl text-gray-400">
            Professional Roblox UI workflow, end to end
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="p-6 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl border border-gray-800 hover:border-blue-500/50 transition-all duration-300"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.name}</h3>
              <p className="text-gray-400 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
