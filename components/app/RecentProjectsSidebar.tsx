import Link from 'next/link'
import { formatGenerationStatus, formatGenerationTimestamp } from '@/lib/hudforge-client'
import type { Generation } from '@/lib/hudforge-generation'

export function RecentProjectsSidebar({ generations }: { generations: Generation[] }) {
  return (
    <aside className="rune-card p-5 xl:sticky xl:top-6 xl:self-start">
      <p className="section-kicker">Recent</p>
      <h2 className="mt-2 text-lg font-semibold tracking-[-0.03em] text-white">Projects</h2>
      <p className="mt-2 text-sm leading-6 text-slate-400">Your last three generations from the workspace.</p>

      {generations.length === 0 ? (
        <p className="mt-5 text-sm leading-6 text-slate-500">Create your first UI below — exports will show up here and in Projects.</p>
      ) : (
        <ul className="mt-5 grid gap-3">
          {generations.map((generation) => (
            <li key={generation.id} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
              <p className="line-clamp-1 text-sm font-medium text-white">{generation.title}</p>
              <p className="mt-1 text-xs text-slate-500">{formatGenerationStatus(generation.status)} · {formatGenerationTimestamp(generation.updated_at)}</p>
            </li>
          ))}
        </ul>
      )}

      <Link href="/dashboard?new=1" className="forge-button forge-button--primary mt-5 w-full justify-center">
        New UI pack
      </Link>

      <Link href="/projects" className="forge-button forge-button--secondary mt-3 w-full justify-center">
        View all projects
      </Link>
    </aside>
  )
}
