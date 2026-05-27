import { redirect } from 'next/navigation'
import { Suspense, type ReactNode } from 'react'
import { SignOutButton } from '@clerk/nextjs'
import { AppNavLinks } from '@/components/app/AppNavLinks'
import { AppSidebar } from '@/components/app/AppSidebar'
import { getHudforgeAuthState } from '@/lib/hudforge-auth'

export async function AppShell({
  title,
  description,
  compact = false,
  children,
}: {
  title: string
  description?: string
  compact?: boolean
  children: ReactNode
}) {
  const authState = await getHudforgeAuthState()

  if (!authState.userId) {
    redirect('/sign-in')
  }

  return (
    <div className="min-h-screen bg-[color:var(--background)] text-white">
      <div className="app-shell-layout mx-auto flex min-h-screen w-full max-w-[1500px]">
        <AppSidebar />

        <div className="min-w-0 flex-1">
          <header
            className={`border-b border-white/10 bg-slate-950/45 px-4 sm:px-5 lg:px-6 ${compact ? 'py-2.5' : 'py-3.5 sm:py-4'}`}
          >
            <div className={`flex items-center justify-between gap-3 ${compact ? '' : 'flex-col xl:flex-row xl:items-center xl:gap-4'}`}>
              <div className="min-w-0">
                {!compact ? <p className="section-kicker">Workspace</p> : null}
                <h1
                  className={`font-semibold tracking-[-0.04em] text-white ${compact ? 'truncate text-lg sm:text-xl' : 'mt-2 text-xl sm:text-2xl'}`}
                >
                  {title}
                </h1>
                {description && !compact ? (
                  <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-400 sm:text-sm sm:leading-6">{description}</p>
                ) : null}
              </div>
              <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                <Suspense fallback={null}>
                  <AppNavLinks variant="mobile" />
                </Suspense>
                {authState.mode === 'local-e2e-bypass' ? (
                  <span className="rounded-lg border border-amber-300/30 bg-amber-300/10 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-100">
                    Local E2E auth
                  </span>
                ) : (
                  <SignOutButton>
                    <button className="forge-button forge-button--secondary forge-button--small">Sign out</button>
                  </SignOutButton>
                )}
              </div>
            </div>
          </header>
          <main className={`px-4 sm:px-5 lg:px-6 ${compact ? 'py-3 sm:py-4' : 'py-5 sm:py-6'}`}>{children}</main>
        </div>
      </div>
    </div>
  )
}
