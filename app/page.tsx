import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { BlogCard } from '@/components/marketing/BlogCard'
import { CTASection } from '@/components/marketing/CTASection'
import { MarketingShell } from '@/components/marketing/MarketingShell'
import { TemplateCard } from '@/components/marketing/TemplateCard'
import { WaitlistForm } from '@/components/marketing/WaitlistForm'
import { blogPosts, features, pricingPlans, templates, workflowSteps } from '@/lib/marketing-content'

export const metadata: Metadata = {
  title: 'HUDForge | Cyber-Fantasy Roblox UI Workflows',
  description: 'Build premium Roblox HUDs, menus, template systems, and export-ready UI direction with HUDForge.',
}

export default function Home() {
  return (
    <MarketingShell>
      <main>
        <section className="home-hero px-5 pb-16 pt-8 sm:px-6 lg:px-8">
          <div className="section-shell hero-panel grid min-h-[calc(100vh-8rem)] items-center gap-10 overflow-hidden rounded-[2rem] border border-white/10 p-6 sm:p-8 lg:grid-cols-[0.92fr_1.08fr] lg:p-10">
            <div className="relative z-10">
              <p className="section-kicker">Roblox UI Forge</p>
              <h1 className="display-title mt-5 max-w-4xl text-6xl text-white sm:text-7xl lg:text-8xl">Build game-ready HUDs instantly.</h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
                HUDForge turns cyber-fantasy direction, Roblox UI patterns, and export notes into a faster workflow for builders who care about game feel.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/generate" className="forge-button forge-button--primary">
                  Generate UI
                </Link>
                <Link href="/templates" className="forge-button forge-button--secondary">
                  Explore Templates
                </Link>
              </div>
              <div className="mt-8 grid gap-3 text-sm text-slate-300 sm:grid-cols-3">
                {['Roblox-first templates', 'Transparent asset direction', 'Luau hierarchy notes'].map((item) => (
                  <div key={item} className="rune-card px-4 py-3">
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="relative min-h-[420px]">
              <Image src="/generated/marketing/world-hero-fantasy.png" alt="" fill priority sizes="(min-width: 1024px) 52vw, 100vw" className="rounded-[1.5rem] object-cover opacity-80 shadow-2xl shadow-cyan-950/30" />
              <div className="absolute inset-0 rounded-[1.5rem] bg-gradient-to-t from-slate-950 via-slate-950/10 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 rune-card p-4 backdrop-blur-xl sm:left-auto sm:w-80">
                <p className="data-label">Live forge stack</p>
                <div className="mt-4 grid gap-3">
                  {['Quest tracker', 'Inventory grid', 'Shop CTA states'].map((item) => (
                    <div key={item} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm">
                      <span>{item}</span>
                      <span className="text-cyan-200">Ready</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-5 py-14 sm:px-6 lg:px-8">
          <div className="section-shell grid gap-4 md:grid-cols-3">
            {features.map((feature) => (
              <article key={feature.title} className="rune-card p-6">
                <p className="data-label">Feature</p>
                <h2 className="mt-4 text-2xl font-semibold text-white">{feature.title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-400">{feature.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="px-5 py-14 sm:px-6 lg:px-8">
          <div className="section-shell">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <p className="section-kicker">Template arsenal</p>
                <h2 className="section-title mt-4 text-4xl font-semibold text-white sm:text-5xl">Start from a game-world interface system.</h2>
              </div>
              <Link href="/templates" className="forge-button forge-button--secondary">
                View Gallery
              </Link>
            </div>
            <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {templates.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-14 sm:px-6 lg:px-8">
          <div className="section-shell grid gap-8 lg:grid-cols-[0.78fr_1fr]">
            <div>
              <p className="section-kicker">Workflow</p>
              <h2 className="section-title mt-4 text-4xl font-semibold text-white sm:text-5xl">From prompt to production handoff.</h2>
              <p className="mt-5 text-base leading-7 text-slate-400">A focused path for creators who want useful UI direction without adding backend complexity to their workflow.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {workflowSteps.map((step, index) => (
                <article key={step.title} className="rune-card p-5">
                  <span className="text-sm font-semibold text-cyan-200">0{index + 1}</span>
                  <h3 className="mt-3 text-xl font-semibold text-white">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{step.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-14 sm:px-6 lg:px-8">
          <div className="section-shell grid gap-5 lg:grid-cols-3">
            {pricingPlans.map((plan) => (
              <article key={plan.name} className={`rune-card p-6 ${plan.featured ? 'active-frame' : ''}`}>
                <p className="data-label">{plan.featured ? 'Most popular' : 'Plan'}</p>
                <h2 className="mt-4 text-3xl font-semibold text-white">{plan.name}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-400">{plan.description}</p>
                <p className="mt-6 text-4xl font-semibold text-white">{plan.price}</p>
                <p className="mt-1 text-sm text-slate-500">{plan.cadence}</p>
                <ul className="mt-6 grid gap-3 text-sm text-slate-300">
                  {plan.features.slice(0, 4).map((feature) => (
                    <li key={feature}>+ {feature}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="px-5 py-14 sm:px-6 lg:px-8">
          <div className="section-shell">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <p className="section-kicker">Field notes</p>
                <h2 className="section-title mt-4 text-4xl font-semibold text-white sm:text-5xl">Conversion-focused Roblox UI thinking.</h2>
              </div>
              <Link href="/blog" className="forge-button forge-button--secondary">
                Read Blog
              </Link>
            </div>
            <div className="mt-8 grid gap-5 lg:grid-cols-3">
              {blogPosts.map((post) => (
                <BlogCard key={post.slug} post={post} />
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-14 sm:px-6 lg:px-8">
          <div className="section-shell rune-card grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_0.85fr] lg:p-10">
            <div>
              <p className="section-kicker">Founding access</p>
              <h2 className="section-title mt-4 text-4xl font-semibold text-white sm:text-5xl">Reserve your place in the forge queue.</h2>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400">The same waitlist API powers this redesigned frontend, preserving the existing Supabase-backed capture path.</p>
            </div>
            <WaitlistForm source="home_page" />
          </div>
        </section>

        <CTASection source="home_bottom_cta" />
      </main>
    </MarketingShell>
  )
}
