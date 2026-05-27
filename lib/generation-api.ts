import type { ExportPackagePayload, Generation } from './hudforge-generation'

export type GenerationApiSuccess = {
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

export type GenerationApiFailure = {
  success: false
  error: { code: string; message: string }
}

export const EXPECTED_ASSET_COUNT = 5
const ASSET_POLL_INTERVAL_STANDARD_MS = 4000
const ASSET_POLL_INTERVAL_PRIORITY_MS = 2000
const ASSET_POLL_TIMEOUT_MS = 120000

export async function postGenerationStep(url: string, body: unknown, idempotencyKey?: string): Promise<GenerationApiSuccess> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (idempotencyKey) headers['X-Idempotency-Key'] = idempotencyKey

  const response = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) })
  const payload = (await response.json()) as GenerationApiSuccess | GenerationApiFailure
  if (!response.ok || !payload.success) {
    // #region agent log
    fetch('http://127.0.0.1:7710/ingest/fb111c52-3d44-48a0-9eb3-c3ee65ff13e1',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'1a730f'},body:JSON.stringify({sessionId:'1a730f',location:'generation-api.ts:postGenerationStep',message:'api step failed',data:{url,httpStatus:response.status,errorCode:payload.success?undefined:payload.error.code,errorMessage:payload.success?'Request failed':payload.error.message},timestamp:Date.now(),hypothesisId:'H1,H2,H5'})}).catch(()=>{});
    // #endregion
    throw new Error(payload.success ? 'Request failed' : payload.error.message)
  }
  return payload
}

export async function pollAssetGeneration(
  generationId: string,
  queueTier: 'standard' | 'priority',
  onProgress?: (completed: number, total: number) => void,
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
    const payload = (await response.json()) as GenerationApiSuccess | GenerationApiFailure
    if (!response.ok || !payload.success) throw new Error(payload.success ? 'Asset polling failed' : payload.error.message)

    lastGeneration = payload.generation
    const completedCount = payload.completed?.length ?? payload.generation.asset_bundle?.assets.length ?? 0
    onProgress?.(completedCount, EXPECTED_ASSET_COUNT)

    if (payload.done) {
      if (payload.failed?.length) {
        // #region agent log
        fetch('http://127.0.0.1:7710/ingest/fb111c52-3d44-48a0-9eb3-c3ee65ff13e1',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'1a730f'},body:JSON.stringify({sessionId:'1a730f',location:'generation-api.ts:pollAssetGeneration',message:'poll done with failures',data:{generationId,failedAssets:payload.failed,generationError:payload.generation.error},timestamp:Date.now(),hypothesisId:'H4'})}).catch(()=>{});
        // #endregion
        throw new Error(payload.generation.error ?? `Asset generation failed for ${payload.failed.map((item) => item.name).join(', ')}`)
      }
      return payload.generation
    }

    await new Promise((resolve) => window.setTimeout(resolve, pollIntervalMs))
  }

  // #region agent log
  fetch('http://127.0.0.1:7710/ingest/fb111c52-3d44-48a0-9eb3-c3ee65ff13e1',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'1a730f'},body:JSON.stringify({sessionId:'1a730f',location:'generation-api.ts:pollAssetGeneration',message:'poll client timeout',data:{generationId,queueTier,lastStatus:lastGeneration?.status,lastError:lastGeneration?.error,completedAssets:lastGeneration?.asset_bundle?.assets.length??0},timestamp:Date.now(),hypothesisId:'H3'})}).catch(()=>{});
  // #endregion
  throw new Error(lastGeneration?.error ?? 'Asset generation timed out after 120 seconds')
}
