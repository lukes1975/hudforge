export function PainPoints() {
  const painPoints = [
    {
      emoji: '🕐',
      title: 'Manual Design is Slow',
      description: 'Hours wasted pixel-pushing in Photoshop when you should be building gameplay.'
    },
    {
      emoji: '📦',
      title: 'Generic Templates Look Bad',
      description: 'Asset packs are overused. Your game deserves custom UI that stands out.'
    },
    {
      emoji: '💸',
      title: 'Hiring Designers is Expensive',
      description: "Professional UI artists charge hundreds per asset. Small teams can't afford it."
    }
  ]

  return (
    <div className="py-24 px-6 lg:px-8 bg-gray-900/50">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-3xl font-bold tracking-tight text-center text-white sm:text-5xl mb-16">
          The Problem Every Roblox Developer Faces
        </h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {painPoints.map((point, idx) => (
            <div 
              key={idx}
              className="p-8 bg-gradient-to-br from-red-900/20 to-gray-900 rounded-2xl border border-red-900/30 hover:border-red-500/50 transition-all duration-300"
            >
              <div className="text-5xl mb-4">{point.emoji}</div>
              <h3 className="text-xl font-semibold text-white mb-3">{point.title}</h3>
              <p className="text-gray-400">{point.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
