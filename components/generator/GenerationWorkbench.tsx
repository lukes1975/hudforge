'use client'

import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import type { ExportPackagePayload, Generation, GenerationStatus, UiType } from '@/lib/hudforge-generation'
import { generationStyleOptions, generatorSamplePrompts, generationUiTypeOptions } from '@/lib/generation-workbench'

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

export function GenerationWorkbench() {
  const [prompt, setPrompt] = useState('Create a neon anime simulator shop UI with coins, gems, buy buttons, and a close button. Make it mobile-friendly.')
  const [uiType, setUiType] = useState<UiType>('shop_ui')
  const [style, setStyle] = useState<(typeof generationStyleOptions)[number]['value']>('neon')
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
  const canGenerate = GENERATE_IDLE_STATUSES.includes(status) && !isSubmitting

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
    return () => {
      cancelled = true
    }
  }, [])

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
            <select value={style} onChange={(event) => setStyle(event.target.value as (typeof generationStyleOptions)[number]['value'])} className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-sm text-white focus:border-cyan-400/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/20">
              {generationStyleOptions.map((option) => <option key={option.value} value={option.value} className="bg-slate-950 text-white">{option.label}</option>)}
            </select>
          </label>
        </div>

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

          <div className="mt-6 rounded-lg border border-white/10 bg-slate-950/80 p-4">
            <div className="relative mx-auto min-h-[500px] max-w-[390px] overflow-hidden rounded-[2rem] border border-white/10 bg-[#090A1A] shadow-2xl">
              <div className="absolute inset-x-16 top-3 h-1.5 rounded-full bg-white/20" />
              <div className="absolute left-1/2 top-1/2 w-[88%] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/15 bg-[#15122B] p-5 shadow-2xl">
                <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Roblox ScreenGui</p>
                    <p className="mt-2 text-xl font-semibold text-white">{generation?.title ?? 'Main UI'}</p>
                  </div>
                  <div className="grid h-12 w-12 place-items-center rounded-lg bg-fuchsia-400/80 text-sm font-bold text-white">$</div>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {(previewAssets.length ? previewAssets : [{ id: 'empty-1', type: 'panel', name: 'Panel' }, { id: 'empty-2', type: 'button', name: 'Button' }, { id: 'empty-3', type: 'icon', name: 'Icon' }]).slice(0, 3).map((asset) => (
                    <div key={asset.id} className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{asset.type}</p>
                      <p className="mt-2 text-sm font-medium text-white">{asset.name}</p>
                    </div>
                  ))}
                </div>
                <button type="button" className="mt-5 w-full rounded-lg bg-fuchsia-300 px-4 py-3 text-sm font-semibold text-slate-950">{uiType === 'shop_ui' ? 'Buy Item' : 'Primary Action'}</button>
              </div>
            </div>
          </div>
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
