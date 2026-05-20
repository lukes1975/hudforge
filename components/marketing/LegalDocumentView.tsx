import Link from 'next/link'
import type { ReactNode } from 'react'
import type { LegalBlock, LegalDocumentMeta } from '@/lib/legal-content'

function renderInline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^\)]+\))/g).filter(Boolean)

  return parts.map((part, index) => {
    const boldMatch = part.match(/^\*\*(.+)\*\*$/)
    if (boldMatch) {
      return (
        <strong key={`${part}-${index}`} className="font-semibold text-white">
          {boldMatch[1]}
        </strong>
      )
    }

    const linkMatch = part.match(/^\[([^\]]+)\]\(([^\)]+)\)$/)
    if (linkMatch) {
      const [, label, href] = linkMatch
      const isExternal = href.startsWith('http://') || href.startsWith('https://')

      if (isExternal) {
        return (
          <a
            key={`${href}-${index}`}
            href={href}
            target="_blank"
            rel="noreferrer"
            className="text-cyan-200 underline decoration-cyan-300/40 underline-offset-4 hover:text-cyan-100"
          >
            {label}
          </a>
        )
      }

      return (
        <Link key={`${href}-${index}`} href={href} className="text-cyan-200 underline decoration-cyan-300/40 underline-offset-4 hover:text-cyan-100">
          {label}
        </Link>
      )
    }

    return part
  })
}

export function LegalDocumentView({
  document,
  blocks,
}: {
  document: LegalDocumentMeta
  blocks: LegalBlock[]
}) {
  return (
    <article className="legal-doc rune-card p-6 sm:p-8 lg:p-10">
      <div className="mb-8 border-b border-white/8 pb-6">
        <p className="section-kicker">Legal</p>
        <h1 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">{document.title}</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">{document.description}</p>
      </div>

      <div className="legal-prose">
        {blocks.map((block, index) => {
          switch (block.type) {
            case 'heading': {
              if (block.level === 1) {
                return (
                  <h1 key={`${block.type}-${index}`} className="text-3xl font-semibold text-white sm:text-4xl">
                    {renderInline(block.text)}
                  </h1>
                )
              }

              if (block.level === 2) {
                return (
                  <h2 key={`${block.type}-${index}`} className="mt-10 text-2xl font-semibold text-white sm:text-3xl">
                    {renderInline(block.text)}
                  </h2>
                )
              }

              return (
                <h3 key={`${block.type}-${index}`} className="mt-8 text-xl font-semibold text-white sm:text-2xl">
                  {renderInline(block.text)}
                </h3>
              )
            }
            case 'paragraph':
              return (
                <p key={`${block.type}-${index}`} className="text-base leading-8 text-slate-300">
                  {renderInline(block.text)}
                </p>
              )
            case 'blockquote':
              return (
                <blockquote key={`${block.type}-${index}`} className="border-l-2 border-cyan-300/40 bg-cyan-300/8 px-5 py-4 text-sm leading-7 text-slate-200">
                  {renderInline(block.text)}
                </blockquote>
              )
            case 'list':
              return (
                <ul key={`${block.type}-${index}`} className="grid gap-3 pl-5 text-base leading-8 text-slate-300">
                  {block.items.map((item, itemIndex) => (
                    <li key={`${item}-${itemIndex}`} className="list-disc marker:text-cyan-200">
                      {renderInline(item)}
                    </li>
                  ))}
                </ul>
              )
            case 'rule':
              return <hr key={`${block.type}-${index}`} className="border-white/8" />
            default:
              return null
          }
        })}
      </div>
    </article>
  )
}
