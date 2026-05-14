export function Showcase() {
  const examples = [
    {
      title: 'Health Bar',
      description: 'Animated gradient with damage feedback',
      placeholder: 'bg-gradient-to-r from-red-500 to-red-700'
    },
    {
      title: 'Inventory Panel',
      description: 'Grid layout with hover states',
      placeholder: 'bg-gradient-to-br from-blue-500 to-purple-700'
    },
    {
      title: 'Action Button',
      description: 'Responsive with pressed/hover animations',
      placeholder: 'bg-gradient-to-r from-green-500 to-emerald-700'
    },
    {
      title: 'Skill Cooldown',
      description: 'Radial timer with icon overlay',
      placeholder: 'bg-gradient-to-br from-yellow-500 to-orange-700'
    },
    {
      title: 'Chat Bubble',
      description: 'Dynamic sizing with tail pointer',
      placeholder: 'bg-gradient-to-r from-purple-500 to-pink-700'
    }
  ]

  return (
    <div id="showcase" className="py-24 px-6 lg:px-8 bg-gradient-to-b from-gray-900 to-black">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl mb-4">
            Built for Real Games
          </h2>
          <p className="text-xl text-gray-400">
            From simple buttons to complex HUD systems
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {examples.map((example, idx) => (
            <div
              key={idx}
              className="group relative overflow-hidden rounded-2xl border border-gray-800 hover:border-blue-500 transition-all duration-300"
            >
              <div className={`aspect-video ${example.placeholder} opacity-60 group-hover:opacity-80 transition-opacity duration-300`}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white/50 text-6xl">🎮</div>
                </div>
              </div>
              <div className="p-6 bg-gray-900/95">
                <h3 className="text-lg font-semibold text-white mb-1">{example.title}</h3>
                <p className="text-sm text-gray-400">{example.description}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            Real examples coming soon • Currently in private beta
          </p>
        </div>
      </div>
    </div>
  )
}
