import Image from 'next/image'
import { HeroOverlayCard } from '@/components/HeroOverlayCard'

const inventoryItems = ['Blade', 'Potion', 'Rune', 'Gem']
const statusItems = [
  ['Health', '84%'],
  ['Armor', '62'],
  ['Energy', '3/5'],
] as const
const exportItems = ['PNG bundle', 'Luau hierarchy', 'Studio naming']

export function HeroVisualCluster() {
  return (
    <div className="hero-cluster">
      <div className="hero-cluster__orbit hero-cluster__orbit--outer" />
      <div className="hero-cluster__orbit hero-cluster__orbit--inner" />
      <div className="hero-cluster__noise" />

      <div className="hero-core">
        <div className="hero-core__halo hero-core__halo--cyan" />
        <div className="hero-core__halo hero-core__halo--violet" />
        <div className="hero-core__portal">
          <Image
            src="/generated/hero/hero-ui-preview.jpg"
            alt=""
            fill
            priority
            sizes="(max-width: 767px) 90vw, (max-width: 1279px) 70vw, 520px"
            className="hero-core__image"
          />
          <div className="hero-core__scrim" />
          <div className="hero-core__ring hero-core__ring--primary" />
          <div className="hero-core__ring hero-core__ring--secondary" />
          <div className="hero-core__grid" />
        </div>
        <div className="hero-core__caption">Cinematic Roblox UI forge</div>
      </div>

      <HeroOverlayCard title="Prompt Input" eyebrow="Describe" tone="cyan" className="hero-card hero-card--prompt">
        <p>Create a premium shop UI with cyan-violet energy trim, readable pricing tiers, and a clean Roblox-native layout.</p>
      </HeroOverlayCard>

      <HeroOverlayCard title="Inventory System" eyebrow="Generated panel" tone="slate" className="hero-card hero-card--inventory">
        <div className="hero-mini-grid">
          {inventoryItems.map((item) => (
            <div key={item} className="hero-mini-grid__tile">
              <span className="hero-mini-grid__icon" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </HeroOverlayCard>

      <HeroOverlayCard title="Quest Tracker" eyebrow="UI overlay" tone="violet" className="hero-card hero-card--quest">
        <div className="hero-quest-list">
          <div className="hero-quest-list__item hero-quest-list__item--done">Dock complete</div>
          <div className="hero-quest-list__item">Forge reward screen</div>
          <div className="hero-quest-list__item">Ship export package</div>
        </div>
      </HeroOverlayCard>

      <HeroOverlayCard title="Health / Status HUD" eyebrow="Combat layer" tone="cyan" className="hero-card hero-card--status">
        <div className="hero-status-list">
          {statusItems.map(([label, value]) => (
            <div key={label} className="hero-status-list__row">
              <span>{label}</span>
              <span>{value}</span>
            </div>
          ))}
          <div className="hero-status-list__bar">
            <span className="hero-status-list__bar-fill" />
          </div>
        </div>
      </HeroOverlayCard>

      <HeroOverlayCard title="Luau Export" eyebrow="Ship to Studio" tone="slate" className="hero-card hero-card--export">
        <div className="hero-export-tree">
          <div>ScreenGui</div>
          <div className="pl-4">└─ ShopHud</div>
          <div className="pl-8">├─ ProductGrid</div>
          <div className="pl-8">└─ BuyButton</div>
        </div>
        <div className="hero-export-tags">
          {exportItems.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </HeroOverlayCard>
    </div>
  )
}
