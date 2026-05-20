import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { LegalDocumentView } from '@/components/marketing/LegalDocumentView'
import { MarketingShell } from '@/components/marketing/MarketingShell'
import { getLegalDocument, getLegalDocumentMeta, getLegalDocuments } from '@/lib/legal-content'

export async function generateStaticParams() {
  return getLegalDocuments().map((document) => ({ slug: document.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const document = getLegalDocumentMeta(slug)

  if (!document) {
    return {
      title: 'Legal | HUDForge',
    }
  }

  return {
    title: `${document.title} | HUDForge`,
    description: document.description,
  }
}

export default async function LegalDocumentPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const document = await getLegalDocument(slug)

  if (!document) {
    notFound()
  }

  return (
    <MarketingShell>
      <main className="px-5 pb-16 pt-10 sm:px-6 lg:px-8 lg:pb-20">
        <div className="section-shell">
          <LegalDocumentView document={document} blocks={document.blocks} />
        </div>
      </main>
    </MarketingShell>
  )
}
