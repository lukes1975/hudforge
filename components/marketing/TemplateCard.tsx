import Image from 'next/image'
import Link from 'next/link'
import type { Template } from '@/lib/marketing-content'

export function TemplateCard({ template }: { template: Template }) {
  return (
    <Link href={`/templates/${template.id}`} className="rune-card group block overflow-hidden p-3 transition hover:-translate-y-1 hover:border-cyan-300/30">
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-white/10 bg-slate-950">
        <Image src={template.image} alt="" fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover opacity-80 transition duration-500 group-hover:scale-105 group-hover:opacity-95" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
        <span className="absolute left-4 top-4 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs font-medium text-cyan-50">{template.eyebrow}</span>
      </div>
      <div className="p-3">
        <h2 className="mt-2 text-xl font-semibold text-white">{template.title}</h2>
        <p className="mt-3 text-sm leading-6 text-slate-400">{template.summary}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {template.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="tag-chip">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  )
}
