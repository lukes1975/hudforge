import { Waitlist } from '@/components/Waitlist'
import { Features } from '@/components/Features'
import { Showcase } from '@/components/Showcase'
import { PainPoints } from '@/components/PainPoints'
import { Pricing } from '@/components/Pricing'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 blur-3xl" />
        <div className="relative px-6 pt-14 lg:px-8">
          <div className="mx-auto max-w-5xl py-32 sm:py-48">
            <div className="text-center">
              <h1 className="text-5xl font-bold tracking-tight text-white sm:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                Ship Professional Roblox UI in Minutes, Not Hours
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-300 max-w-2xl mx-auto">
                Transform simple prompts into production-ready transparent PNGs and clean Luau code. 
                AI-powered workflow built for serious Roblox developers.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <a
                  href="#waitlist"
                  className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-4 text-lg font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                >
                  Join Waitlist
                </a>
                <a href="#showcase" className="text-lg font-semibold leading-6 text-gray-300 hover:text-white transition-colors">
                  View Examples <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pain Points Section */}
      <PainPoints />

      {/* Solution Section */}
      <div className="py-24 px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-5xl mb-6">
              Your AI-Powered UI Workflow
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              HUD Forge generates production-ready transparent PNGs with structured Luau hierarchies. 
              From prompt to Roblox Studio in seconds.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="relative p-8 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700 hover:border-blue-500 transition-all duration-300">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold text-white mb-2">Instant Generation</h3>
              <p className="text-gray-400">Type your UI request. Get professional assets in seconds.</p>
            </div>
            <div className="relative p-8 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700 hover:border-purple-500 transition-all duration-300">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-xl font-semibold text-white mb-2">Production Quality</h3>
              <p className="text-gray-400">Transparent PNGs with clean Luau hierarchies. Ready to ship.</p>
            </div>
            <div className="relative p-8 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700 hover:border-pink-500 transition-all duration-300">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-semibold text-white mb-2">One-Click Import</h3>
              <p className="text-gray-400">Export directly to Roblox Studio. Live preview included.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <Features />

      {/* Showcase Section */}
      <Showcase />

      {/* Pricing Teaser */}
      <Pricing />

      {/* Waitlist Section */}
      <Waitlist />

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500">© 2026 HUD Forge. Built for Roblox developers.</p>
            <div className="flex gap-6">
              <a href="#" className="text-gray-500 hover:text-gray-300 transition-colors">Twitter</a>
              <a href="#" className="text-gray-500 hover:text-gray-300 transition-colors">Discord</a>
              <a href="#" className="text-gray-500 hover:text-gray-300 transition-colors">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
