import type { Metadata } from 'next'
import Link from 'next/link'
import { MarketingShell } from '@/components/marketing/MarketingShell'
import { PageHero } from '@/components/marketing/PageHero'
import { getLegalDocuments } from '@/lib/legal-content'

export const metadata: Metadata = {
  title: 'Legal | HUDForge',
  description: 'Terms, privacy, billing, acceptable use, and compliance information for HUDForge.',
}

export default function LegalIndexPage() {
  const documents = getLegalDocuments()

  return (
    <MarketingShell>
      <main>
        <PageHero
          eyebrow="Legal"
          title="Policies for accounts, billing, and AI output."
          copy="Review the policies that govern HUDForge subscriptions, credits, privacy, refunds, and acceptable use."
          primary={{ label: 'Contact HUDForge', href: '/contact' }}
          secondary={{ label: 'View Pricing', href: '/pricing' }}
        >
          <div className="rune-card p-5">
            <p className="data-label">Last updated</p>
            <p className="mt-4 text-sm leading-7 text-slate-300">May 2026 — USD pricing, Lemon Squeezy billing, and AI generation workflows.</p>
          </div>
        </PageHero>

        <section className="px-5 pb-16 sm:px-6 lg:px-8 lg:pb-20">
          <div className="section-shell grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {documents.map((document) => (
              <Link
                key={document.slug}
                href={`/legal/${document.slug}`}
                className="rune-card group flex h-full flex-col p-6 transition hover:-translate-y-1 hover:border-cyan-300/30"
              >
                <p className="data-label">Policy</p>
                <h2 className="mt-4 text-2xl font-semibold text-white">{document.title}</h2>
                <p className="mt-3 flex-1 text-sm leading-7 text-slate-400">{document.description}</p>
                <span className="premium-link mt-6 inline-flex text-sm font-semibold">Open document</span>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </MarketingShell>
  )
}
