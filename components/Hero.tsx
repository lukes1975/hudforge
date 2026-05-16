import { HeroVisualCluster } from '@/components/HeroVisualCluster'

const heroTags = ['Private beta', 'Roblox-native workflow', 'Generated HUD systems', 'Studio-ready export']
const workflowSteps = ['Describe', 'Generate', 'Preview', 'Export', 'Ship']
const proofStats = [
  ['UI outputs', 'HUDs, menus, inventory, rewards'],
  ['Export surfaces', 'Transparent PNGs + Luau hierarchy'],
  ['Core promise', 'Cleaner Roblox UI with less rebuild work'],
] as const

export function Hero() {
  return (
    <section id="top" className="hero-scene">
      <div aria-hidden="true" className="hero-scene__atmosphere">
        <div className="hero-scene__toplight" />
        <div className="hero-scene__fog hero-scene__fog--cyan" />
        <div className="hero-scene__fog hero-scene__fog--violet" />
        <div className="hero-scene__scanline" />
        <div className="hero-scene__vignette" />
      </div>

      <div className="hero-shell">
        <div className="hero-grid">
          <div className="hero-copy">
            <div className="eyebrow-pill">Private beta for serious Roblox builders</div>

            <div className="hero-copy__stack">
              <p className="hero-motto">Build Your World</p>
              <h1 className="display-title display-title--hero">
                Enter the future of Roblox UI creation.
              </h1>
              <p className="hero-subheadline">
                HUDForge turns plain-language briefs into cinematic Roblox UI systems you can preview, refine, export, and ship
                without losing the feel of the game.
              </p>
            </div>

            <div className="hero-cta-row">
              <a href="#waitlist" className="primary-cta px-6 text-base font-semibold">
                Join Private Beta
              </a>
              <a href="#showcase" className="secondary-cta px-6 text-base font-semibold">
                See Generated UI
              </a>
            </div>

            <div className="hero-tag-row">
              {heroTags.map((tag) => (
                <span key={tag} className="hero-tag-row__item">
                  {tag}
                </span>
              ))}
            </div>

            <div className="hero-proof-grid">
              {proofStats.map(([label, value]) => (
                <div key={label} className="hero-proof-grid__card">
                  <div className="data-label">{label}</div>
                  <div className="hero-proof-grid__value">{value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-visual">
            <HeroVisualCluster />
          </div>
        </div>

        <div id="workflow" className="workflow-strip">
          <div className="workflow-strip__label">Workflow</div>
          <div className="workflow-strip__steps">
            {workflowSteps.map((step, index) => (
              <div key={step} className="workflow-strip__step">
                <span className="workflow-strip__index">0{index + 1}</span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
