import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BlogCard } from '@/components/marketing/BlogCard'
import { CTASection } from '@/components/marketing/CTASection'
import { MarketingShell } from '@/components/marketing/MarketingShell'
import { blogPosts, getBlogPost } from '@/lib/marketing-content'

type BlogDetailProps = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: BlogDetailProps): Promise<Metadata> {
  const { slug } = await params
  const post = getBlogPost(slug)

  if (!post) {
    return { title: 'Post Not Found | HUDForge' }
  }

  return {
    title: `${post.title} | HUDForge Blog`,
    description: post.excerpt,
  }
}

export default async function BlogDetailPage({ params }: BlogDetailProps) {
  const { slug } = await params
  const post = getBlogPost(slug)

  if (!post) {
    notFound()
  }

  const related = blogPosts.filter((item) => item.slug !== post.slug).slice(0, 2)

  return (
    <MarketingShell>
      <main>
        <article className="px-5 pb-12 pt-10 sm:px-6 lg:px-8">
          <div className="section-shell">
            <Link href="/blog" className="premium-link text-sm">
              Back to blog
            </Link>
            <header className="mt-6 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rune-card p-6 sm:p-8">
                <p className="section-kicker">{post.category}</p>
                <h1 className="display-title mt-5 text-5xl text-white sm:text-6xl">{post.title}</h1>
                <p className="mt-5 text-lg leading-8 text-slate-300">{post.excerpt}</p>
                <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-400">
                  <span>{post.author}</span>
                  <time dateTime={post.date}>{post.date}</time>
                  <span>{post.readTime}</span>
                </div>
              </div>
              <div className="relative min-h-[380px] overflow-hidden rounded-[1.5rem] border border-white/10">
                <Image src={post.hero} alt="" fill priority sizes="(min-width: 1024px) 54vw, 100vw" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
              </div>
            </header>

            <div className="mx-auto mt-12 grid max-w-5xl gap-8 lg:grid-cols-[1fr_18rem]">
              <div className="grid gap-8">
                {post.sections.map((section) => (
                  <section key={section.heading} className="rune-card p-6 sm:p-8">
                    <h2 className="text-3xl font-semibold text-white">{section.heading}</h2>
                    <p className="mt-4 text-base leading-8 text-slate-300">{section.body}</p>
                  </section>
                ))}
              </div>
              <aside className="rune-card h-fit p-6">
                <p className="data-label">Key takeaway</p>
                <p className="mt-4 text-sm leading-7 text-slate-300">{post.takeaway}</p>
              </aside>
            </div>
          </div>
        </article>

        <section className="px-5 py-12 sm:px-6 lg:px-8">
          <div className="section-shell">
            <h2 className="section-title text-4xl font-semibold text-white">Related posts</h2>
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              {related.map((item) => (
                <BlogCard key={item.slug} post={item} />
              ))}
            </div>
          </div>
        </section>
        <CTASection source={`blog_${post.slug}`} />
      </main>
    </MarketingShell>
  )
}
