import { auth } from '@clerk/nextjs/server'
import { SignOutButton } from '@clerk/nextjs'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/generate', label: 'Generate' },
  { href: '/projects', label: 'Projects' },
  { href: '/settings', label: 'Settings' },
  { href: '/billing', label: 'Billing' },
]

export async function AppShell({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  return (
    <div className="min-h-screen bg-[color:var(--background)] text-white">
      <div className="mx-auto grid min-h-screen w-full max-w-[1500px] lg:grid-cols-[248px_1fr]">
        <aside className="hidden border-r border-white/10 bg-black/18 px-5 py-6 lg:block">
          <Link href="/dashboard" className="text-lg font-semibold tracking-[-0.03em] text-white">
            HUDForge
          </Link>
          <nav className="mt-8 grid gap-2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:bg-white/[0.06] hover:text-white">
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-8 rounded-lg border border-cyan-400/20 bg-cyan-400/10 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">Free credits</p>
            <p className="mt-2 text-2xl font-semibold">25</p>
            <p className="mt-1 text-xs leading-5 text-slate-400">Mock-safe generation credits for local workflow testing.</p>
          </div>
        </aside>

        <div className="min-w-0">
          <header className="border-b border-white/10 bg-slate-950/45 px-5 py-5 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="section-kicker">Authenticated workspace</p>
                <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">{title}</h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">{description}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <nav className="flex flex-wrap gap-2 lg:hidden">
                  {navItems.map((item) => (
                    <Link key={item.href} href={item.href} className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300">
                      {item.label}
                    </Link>
                  ))}
                </nav>
                <SignOutButton>
                  <button className="forge-button forge-button--secondary">Sign out</button>
                </SignOutButton>
              </div>
            </div>
          </header>
          <main className="px-5 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  )
}
