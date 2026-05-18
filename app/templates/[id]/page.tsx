import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CTASection } from '@/components/marketing/CTASection'
import { MarketingShell } from '@/components/marketing/MarketingShell'
import { TemplateCard } from '@/components/marketing/TemplateCard'
import { getTemplate, templates } from '@/lib/marketing-content'

type TemplateDetailProps = {
  params: Promise<{ id: string }>
}

export async function generateStaticParams() {
  return templates.map((template) => ({ id: template.id }))
}

export async function generateMetadata({ params }: TemplateDetailProps): Promise<Metadata> {
  const { id } = await params
  const template = getTemplate(id)

  if (!template) {
    return { title: 'Template Not Found | HUDForge' }
  }

  return {
    title: `${template.title} | HUDForge Templates`,
    description: template.summary,
  }
}

export default async function TemplateDetailPage({ params }: TemplateDetailProps) {
  const { id } = await params
  const template = getTemplate(id)

  if (!template) {
    notFound()
  }

  const related = templates.filter((item) => item.id !== template.id).slice(0, 3)

  return (
    <MarketingShell>
      <main>
        <section className="px-5 pb-12 pt-10 sm:px-6 lg:px-8">
          <div className="section-shell">
            <Link href="/templates" className="premium-link text-sm">
              Back to templates
            </Link>
            <div className="mt-6 grid gap-8 lg:grid-cols-[0.86fr_1.14fr]">
              <div className="rune-card p-6">
                <p className="section-kicker">{template.eyebrow}</p>
                <h1 className="display-title mt-5 text-5xl text-white sm:text-6xl">{template.title}</h1>
                <p className="mt-5 text-lg leading-8 text-slate-300">{template.description}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {template.tags.map((tag) => (
                    <span key={tag} className="tag-chip">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {template.metrics.map((metric) => (
                    <div key={metric.label} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                      <p className="text-2xl font-semibold text-white">{metric.value}</p>
                      <p className="mt-1 text-xs text-slate-500">{metric.label}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative min-h-[420px] overflow-hidden rounded-[1.5rem] border border-white/10">
                <Image src={template.image} alt="" fill priority sizes="(min-width: 1024px) 56vw, 100vw" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
              </div>
            </div>
          </div>
        </section>

        <section className="px-5 py-12 sm:px-6 lg:px-8">
          <div className="section-shell grid gap-5 lg:grid-cols-3">
            <article className="rune-card p-6">
              <h2 className="text-2xl font-semibold text-white">Use Cases</h2>
              <ul className="mt-5 grid gap-3 text-sm text-slate-300">
                {template.useCases.map((item) => (
                  <li key={item}>+ {item}</li>
                ))}
              </ul>
            </article>
            <article className="rune-card p-6">
              <h2 className="text-2xl font-semibold text-white">Export Stack</h2>
              <ul className="mt-5 grid gap-3 text-sm text-slate-300">
                {template.exports.map((item) => (
                  <li key={item}>+ {item}</li>
                ))}
              </ul>
            </article>
            <article className="rune-card p-6">
              <h2 className="text-2xl font-semibold text-white">Prompt Seed</h2>
              <p className="mt-5 text-sm leading-7 text-slate-400">{template.prompt}</p>
            </article>
          </div>
        </section>

        <section className="px-5 py-12 sm:px-6 lg:px-8">
          <div className="section-shell">
            <h2 className="section-title text-4xl font-semibold text-white">Related templates</h2>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {related.map((item) => (
                <TemplateCard key={item.id} template={item} />
              ))}
            </div>
          </div>
        </section>
        <CTASection source={`template_${template.id}`} />
      </main>
    </MarketingShell>
  )
}
