'use client'

import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import type { ExportPackagePayload, Generation, GenerationStatus, HudforgeProject, UiType } from '@/lib/hudforge-generation'
import { generationStyleOptions, generatorSamplePrompts, generationUiTypeOptions } from '@/lib/generation-workbench'
import { GenerationPreview } from '@/components/generator/GenerationPreview'

type ApiSuccess = {
  success: true
  generation: Generation
  status?: string
  queue_tier?: 'standard' | 'priority'
  completed?: Array<{ id: string; name: string }>
  failed?: Array<{ name: string; error: string }>
  done?: boolean
  exportPackage?: ExportPackagePayload
  export_package?: ExportPackagePayload
  generations?: Generation[]
  projects?: HudforgeProject[]
  project?: HudforgeProject
}

type ApiFailure = {
  success: false
  error: { code: string; message: string }
}

const statusCopy: Record<GenerationStatus, string> = {
  idle: 'Idle',
  optimizing: 'Optimizing',
  optimized: 'Optimized',
  generating_assets: 'Generating assets',
  assets_ready: 'Assets ready',
  preview_ready: 'Preview ready',
  exporting: 'Exporting',
  exported: 'Exported',
  failed: 'Failed',
}

const orderedStatuses: GenerationStatus[] = ['idle', 'optimizing', 'optimized', 'generating_assets', 'assets_ready', 'preview_ready', 'exporting', 'exported']

const RESUMABLE_STATUSES: GenerationStatus[] = ['optimized', 'generating_assets']
const GENERATE_IDLE_STATUSES: GenerationStatus[] = ['idle', 'assets_ready', 'preview_ready', 'exported', 'failed']

const LOCKABLE_STATUSES: GenerationStatus[] = ['assets_ready', 'preview_ready', 'exported']

export function GenerationWorkbench() {
  const [prompt, setPrompt] = useState('Create a neon anime simulator shop UI with coins, gems, buy buttons, and a close button. Make it mobile-friendly.')
  const [uiType, setUiType] = useState<UiType>('shop_ui')
  const [style, setStyle] = useState<(typeof generationStyleOptions)[number]['value']>('neon')
  const [projectId, setProjectId] = useState<string>('')
  const [projects, setProjects] = useState<HudforgeProject[]>([])
  const [lockName, setLockName] = useState('')
  const [isLockingStyle, setIsLockingStyle] = useState(false)
  const [lockMessage, setLockMessage] = useState<string | null>(null)
  const [status, setStatus] = useState<GenerationStatus>('idle')
  const [generation, setGeneration] = useState<Generation | null>(null)
  const [assetProgress, setAssetProgress] = useState<string | null>(null)
  const [queueTier, setQueueTier] = useState<'standard' | 'priority' | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [downloaded, setDownloaded] = useState(false)
  const [recoverableGeneration, setRecoverableGeneration] = useState<Generation | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const idempotencyKeyRef = useRef<string | null>(null)

  const exportPackage = generation?.export_package
  const mainLuau = useMemo(() => exportPackage?.files.find((file) => file.path === 'code/MainUI.lua')?.content, [exportPackage])
  const previewAssets = generation?.asset_bundle?.assets ?? []
  const optimizedSpec = generation?.optimized_spec
  const selectedProject = useMemo(() => projects.find((project) => project.id === projectId) ?? null, [projects, projectId])
  const lockedStyleActive = Boolean(selectedProject?.style_profile)
  const canLockStyle = Boolean(generation && LOCKABLE_STATUSES.includes(status))
  const isPreviewGenerating = status === 'optimizing' || status === 'optimized' || status === 'generating_assets'
  const canGenerate = GENERATE_IDLE_STATUSES.includes(status) && !isSubmitting

  useEffect(() => {
    if (!selectedProject?.style_profile) return
    setStyle(selectedProject.style_profile.style)
  }, [selectedProject])

  useEffect(() => {
    let cancelled = false

    async function checkRecoverableGeneration() {
      try {
        const response = await fetch('/api/generations')
        const payload = (await response.json()) as ApiSuccess | ApiFailure
        if (!response.ok || !payload.success || cancelled) return

        const latest = payload.generations?.[0]
        if (latest && RESUMABLE_STATUSES.includes(latest.status)) {
          setRecoverableGeneration(latest)
        }
      } catch {
        // Recovery is best-effort on mount.
      }
    }

    void checkRecoverableGeneration()
    void loadProjects()
    return () => {
      cancelled = true
    }
  }, [])

  async function loadProjects() {
    try {
      const response = await fetch('/api/projects')
      const payload = (await response.json()) as ApiSuccess | ApiFailure
      if (!response.ok || !payload.success) return
      setProjects(payload.projects ?? [])
    } catch {
      // Project list is best-effort on mount.
    }
  }

  async function runAssetStage(generationId: string, idempotencyKey: string) {
    setStatus('generating_assets')
    const assets = await postGenerationStep('/api/generate/assets', { generation_id: generationId }, idempotencyKey)
    const tier = assets.queue_tier ?? assets.generation.asset_bundle?.queue_tier ?? 'standard'
    setQueueTier(tier)

    const finalGeneration =
      assets.status === 'assets_generating' || assets.generation.status === 'generating_assets'
        ? await pollAssetGeneration(generationId, tier, (completed, total) => {
            setAssetProgress(`Asset ${completed}/${total} ready`)
          })
        : assets.generation

    if (finalGeneration.status === 'failed') {
      throw new Error(finalGeneration.error ?? 'Asset generation failed')
    }

    setGeneration({ ...finalGeneration, status: 'preview_ready' })
    setStatus('assets_ready')
    setAssetProgress(null)
    setQueueTier(null)
    window.setTimeout(() => setStatus('preview_ready'), 180)
  }

  async function handleGenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting || !canGenerate) return

    setIsSubmitting(true)
    setErrorMessage(null)
    setDownloaded(false)
    setAssetProgress(null)
    setQueueTier(null)
    setRecoverableGeneration(null)

    const idempotencyKey = crypto.randomUUID()
    idempotencyKeyRef.current = idempotencyKey

    try {
      setStatus('optimizing')
      const optimized = await postGenerationStep(
        '/api/generate/optimize',
        {
          prompt,
          ui_type: uiType,
          style,
          project_id: projectId || undefined,
          user_settings: { default_export_format: 'zip', mobile_first: true },
        },
        idempotencyKey
      )
      setGeneration(optimized.generation)
      setStatus('optimized')
      await runAssetStage(optimized.generation.id, idempotencyKey)
    } catch (error) {
      setStatus('failed')
      setAssetProgress(null)
      setQueueTier(null)
      setErrorMessage(error instanceof Error ? error.message : 'Generation failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleResumeGeneration() {
    if (!recoverableGeneration || isSubmitting) return

    setIsSubmitting(true)
    setErrorMessage(null)
    setDownloaded(false)
    setAssetProgress(null)
    setQueueTier(null)

    const resumed = recoverableGeneration
    setRecoverableGeneration(null)
    setGeneration(resumed)
    setPrompt(resumed.prompt)
    setUiType(resumed.ui_type)
    setStyle(resumed.style)
    setStatus(resumed.status)

    const idempotencyKey = typeof resumed.metadata?.idempotency_key === 'string' ? resumed.metadata.idempotency_key : crypto.randomUUID()
    idempotencyKeyRef.current = idempotencyKey

    try {
      if (resumed.status === 'optimized') {
        await runAssetStage(resumed.id, idempotencyKey)
        return
      }

      if (resumed.status === 'generating_assets') {
        const tier = resumed.asset_bundle?.queue_tier ?? 'standard'
        setQueueTier(tier)
        const finalGeneration = await pollAssetGeneration(resumed.id, tier, (completed, total) => {
          setAssetProgress(`Asset ${completed}/${total} ready`)
        })

        if (finalGeneration.status === 'failed') {
          throw new Error(finalGeneration.error ?? 'Asset generation failed')
        }

        setGeneration({ ...finalGeneration, status: 'preview_ready' })
        setStatus('assets_ready')
        setAssetProgress(null)
        setQueueTier(null)
        window.setTimeout(() => setStatus('preview_ready'), 180)
      }
    } catch (error) {
      setStatus('failed')
      setAssetProgress(null)
      setQueueTier(null)
      setErrorMessage(error instanceof Error ? error.message : 'Generation failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleLockStyle() {
    if (!generation || !canLockStyle || isLockingStyle) return

    setIsLockingStyle(true)
    setLockMessage(null)
    setErrorMessage(null)

    try {
      const response = await fetch('/api/projects/lock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          generation_id: generation.id,
          name: lockName.trim() || `${generation.title} Style Kit`,
        }),
      })
      const payload = (await response.json()) as ApiSuccess | ApiFailure
      if (!response.ok || !payload.success) throw new Error(payload.success ? 'Style lock failed' : payload.error.message)

      const project = payload.project
      if (project) {
        setProjects((current) => {
          const without = current.filter((item) => item.id !== project.id)
          return [project, ...without]
        })
        setProjectId(project.id)
        setLockName(project.name)
      }
      if (payload.generation) setGeneration(payload.generation)
      setLockMessage(`Locked ${project?.style_profile?.style.replace('_', ' ') ?? 'style'} for ${project?.name ?? 'this project'}.`)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Style lock failed')
    } finally {
      setIsLockingStyle(false)
    }
  }

  async function handleExport() {
    if (!generation) return
    setErrorMessage(null)
    setDownloaded(false)

    try {
      setStatus('exporting')
      const exported = await postGenerationStep('/api/generate/export', { generation_id: generation.id })
      setGeneration(exported.generation)
      setStatus('exported')
    } catch (error) {
      setStatus('failed')
      setErrorMessage(error instanceof Error ? error.message : 'Export failed')
    }
  }

  function downloadExportPackage() {
    if (!exportPackage?.download_url) return
    const anchor = document.createElement('a')
    anchor.href = exportPackage.download_url
    anchor.download = exportPackage.filename
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    setDownloaded(true)
  }

  function resetFlow() {
    setStatus('idle')
    setGeneration(null)
    setErrorMessage(null)
    setAssetProgress(null)
    setQueueTier(null)
    setDownloaded(false)
    setRecoverableGeneration(null)
    setLockMessage(null)
    idempotencyKeyRef.current = null
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <form onSubmit={handleGenerate} className="rune-card space-y-6 p-5 sm:p-6">
        {recoverableGeneration ? (
          <div className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-50">
            <p className="font-medium">Resume generation?</p>
            <p className="mt-1 text-amber-100/90">
              {recoverableGeneration.title} is {statusCopy[recoverableGeneration.status].toLowerCase()}. Continue where you left off without starting over.
            </p>
            <button type="button" onClick={() => void handleResumeGeneration()} className="forge-button forge-button--secondary mt-3">
              Resume generation
            </button>
          </div>
        ) : null}

        <div>
          <p className="section-kicker">Prompt</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">Generate a Roblox-shaped UI package.</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">Mock-safe staged generation: optimized spec, assets, preview, and export payload work without provider keys.</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {generatorSamplePrompts.map((samplePrompt) => (
            <button key={samplePrompt} type="button" onClick={() => setPrompt(samplePrompt)} className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-3 text-left text-sm leading-5 text-slate-200 transition hover:border-cyan-400/30 hover:bg-white/[0.06]">
              {samplePrompt}
            </button>
          ))}
        </div>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-200">Prompt</span>
          <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} rows={7} className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-4 text-sm leading-7 text-white placeholder:text-slate-500 focus:border-cyan-400/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/20" placeholder="Shop UI for an anime simulator with gems, featured pets, and mobile-friendly buy buttons" />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-200">UI type</span>
            <select value={uiType} onChange={(event) => setUiType(event.target.value as UiType)} className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-sm text-white focus:border-cyan-400/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/20">
              {generationUiTypeOptions.map((option) => <option key={option.value} value={option.value} className="bg-slate-950 text-white">{option.label}</option>)}
            </select>
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-200">Style</span>
            <select value={style} onChange={(event) => setStyle(event.target.value as (typeof generationStyleOptions)[number]['value'])} disabled={lockedStyleActive} className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-sm text-white focus:border-cyan-400/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-60">
              {generationStyleOptions.map((option) => <option key={option.value} value={option.value} className="bg-slate-950 text-white">{option.label}</option>)}
            </select>
          </label>
        </div>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-200">Style-locked project</span>
          <select value={projectId} onChange={(event) => setProjectId(event.target.value)} className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-sm text-white focus:border-cyan-400/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/20">
            <option value="" className="bg-slate-950 text-white">No project — generate freely</option>
            {projects.filter((project) => project.style_profile).map((project) => (
              <option key={project.id} value={project.id} className="bg-slate-950 text-white">
                {project.name} ({project.style_profile?.style.replace('_', ' ')})
              </option>
            ))}
          </select>
          {lockedStyleActive && selectedProject?.style_profile ? (
            <p className="text-xs leading-5 text-cyan-100/90">
              Locked palette {selectedProject.style_profile.palette.primary} / {selectedProject.style_profile.palette.secondary}. New generations inherit this art direction.
            </p>
          ) : (
            <p className="text-xs leading-5 text-slate-500">Lock style after preview or export to keep palette and art direction consistent across screens.</p>
          )}
        </label>

        <div className="grid gap-2">
          {orderedStatuses.map((item) => {
            const active = item === status
            const done = orderedStatuses.indexOf(item) < orderedStatuses.indexOf(status)
            return (
              <div key={item} className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${active ? 'border-cyan-400/40 bg-cyan-400/10 text-cyan-100' : done ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-100' : 'border-white/10 bg-white/[0.02] text-slate-400'}`}>
                <span>{statusCopy[item]}</span>
                <span className="font-mono text-xs">{done ? 'done' : active ? 'active' : 'waiting'}</span>
              </div>
            )
          })}
          {status === 'generating_assets' && queueTier ? (
            <div className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-slate-300">
              {queueTier === 'priority' ? 'Priority queue' : 'Standard queue'}
            </div>
          ) : null}
          {status === 'generating_assets' && assetProgress ? <div className="rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-sm text-cyan-100">{assetProgress}</div> : null}
          {status === 'failed' ? <div className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-100">Failed — {errorMessage ?? 'inspect request output and retry'}</div> : null}
        </div>

        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={!canGenerate} className="forge-button forge-button--primary">{!canGenerate ? 'Working...' : 'Generate'}</button>
          <button type="button" onClick={resetFlow} className="forge-button forge-button--secondary">Reset / retry</button>
        </div>
      </form>

      <div className="grid gap-6">
        <section className="rune-card p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="section-kicker">Preview</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">{generation?.title ?? 'Mobile preview waits for assets'}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">{optimizedSpec?.intent_summary ?? 'Run the staged flow to create a structured Roblox UI spec.'}</p>
            </div>
            <span className="w-fit rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">{statusCopy[status]}</span>
          </div>

          <GenerationPreview
            layoutSpec={optimizedSpec?.layout_spec}
            assets={previewAssets}
            title={generation?.title}
            isGenerating={isPreviewGenerating}
          />
        </section>

        <section className="rune-card p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="section-kicker">Style lock</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">Keep the same game UI kit</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">After preview or export, lock palette and art direction so inventory, HUD, and menu screens stay visually coherent.</p>
            </div>
            <button type="button" disabled={!canLockStyle || isLockingStyle} onClick={() => void handleLockStyle()} className="forge-button forge-button--secondary">
              {isLockingStyle ? 'Locking...' : 'Lock style'}
            </button>
          </div>

          <label className="mt-5 block space-y-2">
            <span className="text-sm font-medium text-slate-200">Project name</span>
            <input value={lockName} onChange={(event) => setLockName(event.target.value)} placeholder={generation ? `${generation.title} Style Kit` : 'My game UI kit'} className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/20" />
          </label>

          {lockMessage ? <div className="mt-4 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-100">{lockMessage}</div> : null}
          {!canLockStyle ? <p className="mt-4 text-sm text-slate-500">Generate through preview before locking style.</p> : null}
        </section>

        <section className="rune-card p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="section-kicker">Export</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">ZIP package</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">Downloads a real .zip with manifest.json, layout.json, code/MainUI.lua, assets/assets.json, and a Roblox Studio import guide.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button type="button" disabled={!generation || status === 'exporting'} onClick={handleExport} className="forge-button forge-button--secondary">{status === 'exporting' ? 'Exporting...' : 'Build export'}</button>
              <button type="button" disabled={!exportPackage?.download_url} onClick={downloadExportPackage} className="forge-button forge-button--primary">{downloaded ? 'Downloaded' : 'Download ZIP'}</button>
            </div>
          </div>

          <div className="mt-5 rounded-lg border border-white/10 bg-slate-950/85 p-4">
            <div className="flex flex-wrap gap-2 border-b border-white/10 pb-3 text-xs text-slate-400">
              {(exportPackage?.files.map((file) => file.path) ?? ['manifest.json', 'layout.json', 'code/MainUI.lua']).map((path) => <span key={path} className="rounded-full border border-white/10 px-2 py-1">{path}</span>)}
            </div>
            <pre className="mt-4 max-h-80 overflow-auto whitespace-pre-wrap text-xs leading-6 text-slate-200">{mainLuau ?? 'Export after preview_ready to inspect deterministic Luau.'}</pre>
          </div>
        </section>
      </div>
    </div>
  )
}

async function postGenerationStep(url: string, body: unknown, idempotencyKey?: string): Promise<ApiSuccess> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (idempotencyKey) headers['X-Idempotency-Key'] = idempotencyKey

  const response = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) })
  const payload = (await response.json()) as ApiSuccess | ApiFailure
  if (!response.ok || !payload.success) throw new Error(payload.success ? 'Request failed' : payload.error.message)
  return payload
}

const ASSET_POLL_INTERVAL_STANDARD_MS = 4000
const ASSET_POLL_INTERVAL_PRIORITY_MS = 2000
const ASSET_POLL_TIMEOUT_MS = 120000
const EXPECTED_ASSET_COUNT = 5

async function pollAssetGeneration(
  generationId: string,
  queueTier: 'standard' | 'priority',
  onProgress?: (completed: number, total: number) => void
): Promise<Generation> {
  const pollIntervalMs = queueTier === 'priority' ? ASSET_POLL_INTERVAL_PRIORITY_MS : ASSET_POLL_INTERVAL_STANDARD_MS
  const deadline = Date.now() + ASSET_POLL_TIMEOUT_MS
  let lastGeneration: Generation | null = null

  while (Date.now() < deadline) {
    const response = await fetch('/api/generate/assets/poll', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ generation_id: generationId }),
    })
    const payload = (await response.json()) as ApiSuccess | ApiFailure
    if (!response.ok || !payload.success) throw new Error(payload.success ? 'Asset polling failed' : payload.error.message)

    lastGeneration = payload.generation
    const completedCount = payload.completed?.length ?? payload.generation.asset_bundle?.assets.length ?? 0
    onProgress?.(completedCount, EXPECTED_ASSET_COUNT)

    if (payload.done) {
      if (payload.failed?.length) {
        throw new Error(payload.generation.error ?? `Asset generation failed for ${payload.failed.map((item) => item.name).join(', ')}`)
      }
      return payload.generation
    }

    await new Promise((resolve) => window.setTimeout(resolve, pollIntervalMs))
  }

  throw new Error(lastGeneration?.error ?? 'Asset generation timed out after 120 seconds')
}
