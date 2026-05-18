import Link from 'next/link'
import { BrandMark } from '@/components/BrandMark'
import { navItems } from '@/lib/marketing-content'

const resourceLinks = [
  { label: 'Documentation', href: '/documentation' },
  { label: 'Links', href: '/links' },
  { label: 'Press Kit', href: '/press-kit/hudforge-press-kit.zip' },
  { label: 'Contact', href: '/contact' },
  { label: 'Sign In', href: '/sign-in' },
  { label: 'Dashboard', href: '/dashboard' },
]

export function MarketingFooter() {
  return (
    <footer className="border-t border-white/10 px-5 py-12 sm:px-6 lg:px-8">
      <div className="section-shell grid gap-10 lg:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <Link href="/" className="forge-brand" aria-label="HUDForge home">
            <BrandMark />
            <span>
              <span className="forge-brand__name">HUDForge</span>
              <span className="forge-brand__meta">Roblox UI Forge</span>
            </span>
          </Link>
          <p className="mt-5 max-w-md text-sm leading-7 text-slate-400">
            Cyber-fantasy UI workflows for Roblox creators who need premium HUD direction, template systems, and export-ready production notes.
          </p>
        </div>
        <nav aria-label="Product links">
          <h2 className="text-sm font-semibold text-white">Product</h2>
          <div className="mt-4 grid gap-3 text-sm">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="premium-link">
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
        <nav aria-label="Resource links">
          <h2 className="text-sm font-semibold text-white">Resources</h2>
          <div className="mt-4 grid gap-3 text-sm">
            {resourceLinks.map((item) => (
              <Link key={item.href} href={item.href} className="premium-link">
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      </div>
      <div className="section-shell mt-10 flex flex-col gap-3 border-t border-white/8 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <p>© 2026 HUDForge. Built for Roblox UI teams.</p>
        <p>Private beta content is locally sourced from typed marketing records.</p>
      </div>
    </footer>
  )
}
