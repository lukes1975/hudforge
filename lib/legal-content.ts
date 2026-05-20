import fs from 'node:fs/promises'
import path from 'node:path'

export type LegalDocumentMeta = {
  slug: string
  title: string
  description: string
  fileName: string
}

export type LegalBlock =
  | { type: 'heading'; level: 1 | 2 | 3; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'blockquote'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'rule' }

const legalDocuments: LegalDocumentMeta[] = [
  {
    slug: 'terms',
    title: 'Terms of Service',
    description: 'The terms governing use of HUDForge, including subscriptions, AI output, and account responsibilities.',
    fileName: 'terms.md',
  },
  {
    slug: 'privacy',
    title: 'Privacy Policy',
    description: 'How HUDForge collects, uses, stores, and shares personal data across accounts, billing, analytics, and AI workflows.',
    fileName: 'privacy.md',
  },
  {
    slug: 'cookies',
    title: 'Cookie Policy',
    description: 'How HUDForge uses cookies and similar technologies for authentication, analytics, and site functionality.',
    fileName: 'cookies.md',
  },
  {
    slug: 'acceptable-use',
    title: 'Acceptable Use Policy',
    description: 'The rules that prohibit abusive, unlawful, unsafe, or infringing use of HUDForge.',
    fileName: 'acceptable-use.md',
  },
  {
    slug: 'refunds',
    title: 'Refund Policy',
    description: 'HUDForge refund expectations for subscriptions, billing errors, and cancellation handling.',
    fileName: 'refunds.md',
  },
  {
    slug: 'ai-disclaimer',
    title: 'AI Output Disclaimer',
    description: 'The limits, risks, and user responsibilities that apply to HUDForge-generated output.',
    fileName: 'ai-disclaimer.md',
  },
  {
    slug: 'dmca',
    title: 'Copyright / DMCA Policy',
    description: 'How HUDForge handles copyright complaints, counter-notices, and repeat infringement.',
    fileName: 'dmca.md',
  },
  {
    slug: 'compliance',
    title: 'Contact & Compliance',
    description: 'HUDForge public compliance contact details, launch-readiness notes, and legal integration guidance.',
    fileName: 'compliance.md',
  },
]

const legalDirectory = path.join(process.cwd(), 'legal')

export function getLegalDocuments(): LegalDocumentMeta[] {
  return legalDocuments
}

export function getLegalDocumentMeta(slug: string): LegalDocumentMeta | undefined {
  return legalDocuments.find((document) => document.slug === slug)
}

export async function getLegalDocument(slug: string): Promise<(LegalDocumentMeta & { content: string; blocks: LegalBlock[] }) | null> {
  const meta = getLegalDocumentMeta(slug)
  if (!meta) {
    return null
  }

  const filePath = path.join(legalDirectory, meta.fileName)
  const content = await fs.readFile(filePath, 'utf8')

  return {
    ...meta,
    content,
    blocks: parseMarkdown(content),
  }
}

function parseMarkdown(markdown: string): LegalBlock[] {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  const blocks: LegalBlock[] = []
  let index = 0

  while (index < lines.length) {
    const currentLine = lines[index]?.trim() ?? ''

    if (!currentLine) {
      index += 1
      continue
    }

    if (currentLine === '---') {
      blocks.push({ type: 'rule' })
      index += 1
      continue
    }

    if (currentLine.startsWith('### ')) {
      blocks.push({ type: 'heading', level: 3, text: currentLine.slice(4).trim() })
      index += 1
      continue
    }

    if (currentLine.startsWith('## ')) {
      blocks.push({ type: 'heading', level: 2, text: currentLine.slice(3).trim() })
      index += 1
      continue
    }

    if (currentLine.startsWith('# ')) {
      blocks.push({ type: 'heading', level: 1, text: currentLine.slice(2).trim() })
      index += 1
      continue
    }

    if (currentLine.startsWith('>')) {
      const quoteLines: string[] = []

      while (index < lines.length) {
        const quoteLine = lines[index]?.trim() ?? ''
        if (!quoteLine.startsWith('>')) {
          break
        }

        quoteLines.push(quoteLine.replace(/^>\s?/, '').trim())
        index += 1
      }

      blocks.push({ type: 'blockquote', text: quoteLines.join(' ') })
      continue
    }

    if (currentLine.startsWith('- ')) {
      const items: string[] = []

      while (index < lines.length) {
        const listLine = lines[index]?.trim() ?? ''
        if (!listLine.startsWith('- ')) {
          break
        }

        items.push(listLine.slice(2).trim())
        index += 1
      }

      blocks.push({ type: 'list', items })
      continue
    }

    const paragraphLines: string[] = []

    while (index < lines.length) {
      const paragraphLine = lines[index]?.trim() ?? ''
      if (!paragraphLine) {
        break
      }

      if (
        paragraphLine === '---' ||
        paragraphLine.startsWith('# ') ||
        paragraphLine.startsWith('## ') ||
        paragraphLine.startsWith('### ') ||
        paragraphLine.startsWith('>') ||
        paragraphLine.startsWith('- ')
      ) {
        break
      }

      paragraphLines.push(paragraphLine)
      index += 1
    }

    blocks.push({ type: 'paragraph', text: paragraphLines.join(' ') })
  }

  return blocks
}
