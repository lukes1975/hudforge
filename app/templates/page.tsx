import type { Metadata } from 'next'
import { CTASection } from '@/components/marketing/CTASection'
import { MarketingShell } from '@/components/marketing/MarketingShell'
import { PageHero } from '@/components/marketing/PageHero'
import { TemplateCard } from '@/components/marketing/TemplateCard'
import { templates } from '@/lib/marketing-content'

export const metadata: Metadata = {
  title: 'Templates | HUDForge',
  description: 'Browse HUDForge Roblox UI templates for inventories, quest boards, faction dashboards, and shops.',
}

export default function TemplatesPage() {
  const genres = Array.from(new Set(templates.map((template) => template.genre)))

  return (
    <MarketingShell>
      <main>
        <PageHero
          eyebrow="Template gallery"
          title="Fantasy interface systems for Roblox builders."
          copy="Browse starter HUD patterns that encode layout, theme, export intent, and Roblox production constraints."
          primary={{ label: 'Join Waitlist', href: '/contact#waitlist' }}
          secondary={{ label: 'How It Works', href: '/how-it-works' }}
        >
          <div className="rune-card p-5">
            <p className="data-label">Static filters</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {genres.map((genre) => (
                <span key={genre} className="tag-chip">
                  {genre}
                </span>
              ))}
            </div>
          </div>
        </PageHero>
        <section className="px-5 py-12 sm:px-6 lg:px-8">
          <div className="section-shell grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {templates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        </section>
        <CTASection source="templates_page" />
      </main>
    </MarketingShell>
  )
}
