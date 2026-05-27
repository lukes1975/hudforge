import { AppShell } from '@/components/app/AppShell'
import { RecentProjectsSidebar } from '@/components/app/RecentProjectsSidebar'
import { DashboardWorkspace } from '@/components/workspace/DashboardWorkspace'
import { getHudforgeUserId } from '@/lib/hudforge-auth'
import { listGenerations } from '@/lib/hudforge-generation'

export default async function DashboardPage() {
  const userId = await getHudforgeUserId()
  const allGenerations = userId ? (await listGenerations(userId).catch(() => [])) : []
  const recentGenerations = allGenerations.slice(0, 3)
  const hasGenerations = allGenerations.length > 0

  return (
    <AppShell title="Create Roblox UI" description="Describe your interface, generate assets, preview the package, and export to Roblox Studio — all from here.">
      {hasGenerations ? (
        <>
          <details className="rune-card mb-6 p-4 sm:p-5">
            <summary className="cursor-pointer text-sm font-medium text-slate-200">How it works</summary>
            <ol className="mt-4 grid gap-2 text-sm leading-6 text-slate-400 sm:grid-cols-2">
              <li>1. Optimize your prompt into a structured Roblox UI spec.</li>
              <li>2. Generate transparent PNG assets via the provider pipeline.</li>
              <li>3. Preview layout, hierarchy, and asset roles in browser.</li>
              <li>4. Export a ZIP with MainUI.lua and import guide.</li>
            </ol>
          </details>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
            <div className="min-w-0">
              <DashboardWorkspace generationCount={allGenerations.length} />
            </div>
            <RecentProjectsSidebar generations={recentGenerations} />
          </div>
        </>
      ) : (
        <DashboardWorkspace generationCount={0} />
      )}
    </AppShell>
  )
}
