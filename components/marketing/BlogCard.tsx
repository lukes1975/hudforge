import Image from 'next/image'
import Link from 'next/link'
import type { BlogPost } from '@/lib/marketing-content'

export function BlogCard({ post, featured = false }: { post: BlogPost; featured?: boolean }) {
  return (
    <article className={`rune-card overflow-hidden ${featured ? 'grid gap-0 lg:grid-cols-[0.92fr_1fr]' : ''}`}>
      <Link href={`/blog/${post.slug}`} className="relative block aspect-[16/10] overflow-hidden bg-slate-950">
        <Image src={post.hero} alt="" fill sizes={featured ? '(min-width: 1024px) 45vw, 100vw' : '(min-width: 1024px) 33vw, 100vw'} className="object-cover opacity-80 transition duration-500 hover:scale-105 hover:opacity-95" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 to-transparent" />
      </Link>
      <div className="p-6">
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
          <span className="tag-chip">{post.category}</span>
          <time dateTime={post.date}>{post.date}</time>
          <span>{post.readTime}</span>
        </div>
        <h2 className={`${featured ? 'text-3xl' : 'text-2xl'} mt-4 font-semibold text-white`}>
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </h2>
        <p className="mt-3 text-sm leading-7 text-slate-400">{post.excerpt}</p>
        <Link href={`/blog/${post.slug}`} className="premium-link mt-5 inline-flex text-sm font-semibold">
          Read article
        </Link>
      </div>
    </article>
  )
}
