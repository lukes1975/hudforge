import type { Metadata } from 'next'
import { BlogCard } from '@/components/marketing/BlogCard'
import { CTASection } from '@/components/marketing/CTASection'
import { MarketingShell } from '@/components/marketing/MarketingShell'
import { PageHero } from '@/components/marketing/PageHero'
import { blogPosts } from '@/lib/marketing-content'

export const metadata: Metadata = {
  title: 'Blog | HUDForge',
  description: 'HUDForge notes on Roblox UI polish, activation, prompt writing, templates, and creator workflows.',
}

export default function BlogPage() {
  const [featured, ...posts] = blogPosts

  return (
    <MarketingShell>
      <main>
        <PageHero
          eyebrow="Field notes"
          title="Roblox UI strategy for creators who ship."
          copy="Design, workflow, and conversion notes from the HUDForge beta buildout."
          primary={{ label: 'Read Documentation', href: '/documentation' }}
          secondary={{ label: 'Explore Templates', href: '/templates' }}
        />
        <section className="px-5 py-12 sm:px-6 lg:px-8">
          <div className="section-shell grid gap-6">
            <BlogCard post={featured} featured />
            <div className="grid gap-5 md:grid-cols-2">
              {posts.map((post) => (
                <BlogCard key={post.slug} post={post} />
              ))}
            </div>
          </div>
        </section>
        <CTASection source="blog_index" />
      </main>
    </MarketingShell>
  )
}
