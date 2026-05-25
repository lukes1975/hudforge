import { SignOutButton } from '@clerk/nextjs'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { AppNavLinks } from '@/components/app/AppNavLinks'
import { SidebarCreditsCard } from '@/components/app/SidebarCreditsCard'
import { getHudforgeAuthState } from '@/lib/hudforge-auth'

export async function AppShell({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  const authState = await getHudforgeAuthState()

  if (!authState.userId) {
    redirect('/sign-in')
  }

  return (
    <div className="min-h-screen bg-[color:var(--background)] text-white">
      <div className="mx-auto grid min-h-screen w-full max-w-[1500px] lg:grid-cols-[248px_1fr]">
        <aside className="hidden border-r border-white/10 bg-black/18 px-5 py-6 lg:block">
          <Link href="/dashboard" className="text-lg font-semibold tracking-[-0.03em] text-white">
            HUDForge
          </Link>
          <AppNavLinks variant="sidebar" />
          <SidebarCreditsCard />
        </aside>

        <div className="min-w-0">
          <header className="border-b border-white/10 bg-slate-950/45 px-5 py-5 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="section-kicker">Workspace</p>
                <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">{title}</h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">{description}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <AppNavLinks variant="mobile" />
                {authState.mode === 'local-e2e-bypass' ? (
                  <span className="rounded-lg border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-100">Local E2E auth</span>
                ) : (
                  <SignOutButton>
                    <button className="forge-button forge-button--secondary">Sign out</button>
                  </SignOutButton>
                )}
              </div>
            </div>
          </header>
          <main className="px-5 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  )
}
