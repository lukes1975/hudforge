import Link from 'next/link'
import type { ReactNode } from 'react'

type PageHeroProps = {
  eyebrow: string
  title: string
  copy: string
  primary?: { label: string; href: string }
  secondary?: { label: string; href: string }
  children?: ReactNode
}

export function PageHero({ eyebrow, title, copy, primary, secondary, children }: PageHeroProps) {
  return (
    <section className="px-5 pb-14 pt-10 sm:px-6 lg:px-8 lg:pb-20">
      <div className="section-shell">
        <div className="rune-card hero-panel grid items-center gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_0.82fr] lg:p-10">
          <div>
            <p className="section-kicker">{eyebrow}</p>
            <h1 className="display-title mt-5 max-w-4xl text-5xl text-white sm:text-6xl lg:text-7xl">{title}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">{copy}</p>
            {primary || secondary ? (
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                {primary ? (
                  <Link href={primary.href} className="forge-button forge-button--primary">
                    {primary.label}
                  </Link>
                ) : null}
                {secondary ? (
                  <Link href={secondary.href} className="forge-button forge-button--secondary">
                    {secondary.label}
                  </Link>
                ) : null}
              </div>
            ) : null}
          </div>
          <div>{children}</div>
        </div>
      </div>
    </section>
  )
}
