'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import type { ExportPackagePayload, Generation, HudforgeProject } from '@/lib/hudforge-generation'
import { buildGenerationExportSummary, formatGenerationStatus, formatGenerationStyle, formatGenerationTimestamp, formatUiType } from '@/lib/hudforge-client'

type GenerationsResponse = {
  success: boolean
  generations?: Generation[]
  error?: { message: string }
}

type ProjectsResponse = {
  success: boolean
  projects?: HudforgeProject[]
  error?: { message: string }
}

type ExportResponse = {
  success: boolean
  generation?: Generation
  exportPackage?: ExportPackagePayload
  export_package?: ExportPackagePayload
  error?: { message: string }
}

export function ProjectsPanel() {
  const [generations, setGenerations] = useState<Generation[]>([])
  const [projects, setProjects] = useState<HudforgeProject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [exportingId, setExportingId] = useState<string | null>(null)

  const stats = useMemo(() => {
    const exported = generations.filter((generation) => generation.export_package).length
    const assetsReady = generations.filter((generation) => generation.asset_bundle).length
    const lockedProjects = projects.filter((project) => project.style_profile).length
    return { total: generations.length, exported, assetsReady, lockedProjects }
  }, [generations, projects])

  useEffect(() => {
    let active = true

    async function loadData() {
      setLoading(true)
      setError(null)
      try {
        const [generationsPayload, projectsPayload] = await Promise.all([
          fetchJson<GenerationsResponse>('/api/generations'),
          fetchJson<ProjectsResponse>('/api/projects'),
        ])
        if (!generationsPayload.success) throw new Error(generationsPayload.error?.message ?? 'Failed to load generations')
        if (!projectsPayload.success) throw new Error(projectsPayload.error?.message ?? 'Failed to load projects')
        if (active) {
          setGenerations(generationsPayload.generations ?? [])
          setProjects(projectsPayload.projects ?? [])
        }
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Failed to load project data')
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadData()
    return () => {
      active = false
    }
  }, [])

  async function exportAgain(generationId: string) {
    setExportingId(generationId)
    setError(null)
    try {
      const payload = await fetchJson<ExportResponse>('/api/generate/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ generation_id: generationId }),
      })
      if (!payload.success || !payload.generation) throw new Error(payload.error?.message ?? 'Export failed')
      setGenerations((current) => current.map((generation) => (generation.id === generationId ? payload.generation as Generation : generation)))
    } catch (exportError) {
      setError(exportError instanceof Error ? exportError.message : 'Export failed')
    } finally {
      setExportingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-4">
        <StatCard label="Generations" value={String(stats.total)} detail="Loaded from GET /api/generations" />
        <StatCard label="Assets ready" value={String(stats.assetsReady)} detail="Mock or provider bundles attached" />
        <StatCard label="Exports" value={String(stats.exported)} detail="Package payloads available" />
        <StatCard label="Style locks" value={String(stats.lockedProjects)} detail="Locked projects from GET /api/projects" />
      </section>

      {projects.filter((project) => project.style_profile).length > 0 ? (
        <section className="rune-card p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="section-kicker">Style lock</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">Locked UI projects</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">Reuse these projects from the dashboard to generate additional screens with the same palette and art direction.</p>
            </div>
            <Link href="/dashboard" className="forge-button forge-button--primary">Generate in project</Link>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {projects.filter((project) => project.style_profile).map((project) => {
              const profile = project.style_profile!
              const projectGenerations = generations.filter((generation) => generation.project_id === project.id)
              return (
                <article key={project.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold tracking-[-0.03em] text-white">{project.name}</h3>
                      <p className="mt-2 text-sm text-slate-400">{formatGenerationStyle(profile.style)} · {projectGenerations.length} generation{projectGenerations.length === 1 ? '' : 's'}</p>
                    </div>
                    <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-1 text-xs font-semibold text-emerald-100">Locked</span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {[profile.palette.primary, profile.palette.secondary, profile.palette.accent, profile.palette.background].map((color) => (
                      <span key={color} className="inline-flex items-center gap-2 rounded-full border border-white/10 px-2.5 py-1 text-xs text-slate-300">
                        <span className="h-3 w-3 rounded-full border border-white/20" style={{ backgroundColor: color }} />
                        {color}
                      </span>
                    ))}
                  </div>
                  <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-400">{profile.art_direction}</p>
                  <p className="mt-3 font-mono text-xs text-slate-500">Locked {formatGenerationTimestamp(project.locked_at ?? project.updated_at)} · {project.id}</p>
                </article>
              )
            })}
          </div>
        </section>
      ) : null}

      <section className="rune-card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="section-kicker">History</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">Generation history</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">Live client surface backed by the existing authenticated history API. In this build the service is mock-safe server memory.</p>
          </div>
          <Link href="/dashboard" className="forge-button forge-button--primary">New generation</Link>
        </div>

        {loading ? <PanelMessage title="Loading generations" detail="Fetching /api/generations..." /> : null}
        {error ? <PanelMessage tone="error" title="History request failed" detail={error} /> : null}
        {!loading && !error && generations.length === 0 ? (
          <PanelMessage title="No saved generations yet" detail="Create your first UI from the dashboard. Optimized specs, assets, and exports will appear here after the API records them." action={<Link href="/dashboard" className="forge-button forge-button--secondary">Create first UI</Link>} />
        ) : null}

        {generations.length > 0 ? (
          <div className="mt-6 grid gap-4">
            {generations.map((generation) => {
              const exportFileCount = generation.export_package?.files.length ?? 0
              return (
                <article key={generation.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-2.5 py-1 text-xs font-semibold text-cyan-100">{formatGenerationStatus(generation.status)}</span>
                        <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-slate-300">{formatUiType(generation.ui_type)}</span>
                        <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-slate-300">{formatGenerationStyle(generation.style)}</span>
                      </div>
                      <h3 className="mt-4 text-xl font-semibold tracking-[-0.03em] text-white">{generation.title}</h3>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">{generation.prompt}</p>
                      <p className="mt-3 font-mono text-xs text-slate-500">Updated {formatGenerationTimestamp(generation.updated_at)} · {generation.id}</p>
                    </div>
                    <div className="grid gap-2 text-sm text-slate-300 lg:min-w-56">
                      <span>{generation.asset_bundle?.assets.length ?? 0} assets</span>
                      <span>{buildGenerationExportSummary(exportFileCount, Boolean(generation.export_package))}</span>
                      <button type="button" onClick={() => void exportAgain(generation.id)} disabled={exportingId === generation.id} className="forge-button forge-button--secondary justify-center">
                        {exportingId === generation.id ? 'Exporting...' : 'Export again'}
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        ) : null}
      </section>
    </div>
  )
}

function StatCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <article className="rune-card p-5">
      <p className="section-kicker">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-400">{detail}</p>
    </article>
  )
}

function PanelMessage({ title, detail, tone = 'default', action }: { title: string; detail: string; tone?: 'default' | 'error'; action?: ReactNode }) {
  return (
    <div className={`mt-6 rounded-xl border p-5 ${tone === 'error' ? 'border-red-400/30 bg-red-500/10' : 'border-white/10 bg-white/[0.03]'}`}>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-400">{detail}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init)
  const payload = (await response.json()) as T
  if (!response.ok) {
    const maybeError = payload as { error?: { message?: string } }
    throw new Error(maybeError.error?.message ?? `Request failed with ${response.status}`)
  }
  return payload
}
