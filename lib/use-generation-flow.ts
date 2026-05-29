'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { Generation, GenerationStatus, GenerationStyle, UiType } from './hudforge-generation'
import { pollAssetGeneration, postGenerationStep } from './generation-api'
import { agentDebugLog } from './agent-debug-log'

const RESUMABLE_STATUSES: GenerationStatus[] = ['optimized', 'generating_assets']

export type RunGenerationInput = {
  prompt: string
  uiType: UiType
  style: GenerationStyle
  projectId?: string
}

type UseGenerationFlowOptions = {
  checkRecoverable?: boolean
}

export function useGenerationFlow(options: UseGenerationFlowOptions = {}) {
  const { checkRecoverable = false } = options
  const [status, setStatus] = useState<GenerationStatus>('idle')
  const [generation, setGeneration] = useState<Generation | null>(null)
  const [assetProgress, setAssetProgress] = useState<string | null>(null)
  const [queueTier, setQueueTier] = useState<'standard' | 'priority' | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [recoverableGeneration, setRecoverableGeneration] = useState<Generation | null>(null)
  const idempotencyKeyRef = useRef<string | null>(null)

  useEffect(() => {
    if (!checkRecoverable) return

    let cancelled = false

    async function loadRecoverable() {
      try {
        const response = await fetch('/api/generations')
        const payload = (await response.json()) as { success: boolean; generations?: Generation[] }
        if (!response.ok || !payload.success || cancelled) return

        const latest = payload.generations?.[0]
        if (latest && RESUMABLE_STATUSES.includes(latest.status)) {
          setRecoverableGeneration(latest)
        }
      } catch {
        // Best-effort recovery probe.
      }
    }

    void loadRecoverable()
    return () => {
      cancelled = true
    }
  }, [checkRecoverable])

  const runAssetStage = useCallback(async (generationId: string, idempotencyKey: string) => {
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
  }, [])

  const runGeneration = useCallback(
    async (input: RunGenerationInput) => {
      if (isSubmitting) return

      setIsSubmitting(true)
      setErrorMessage(null)
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
            prompt: input.prompt,
            ui_type: input.uiType,
            style: input.style,
            project_id: input.projectId || undefined,
            user_settings: { default_export_format: 'zip', mobile_first: true },
          },
          idempotencyKey,
        )
        setGeneration(optimized.generation)
        setStatus('optimized')
        await runAssetStage(optimized.generation.id, idempotencyKey)
      } catch (error) {
        // #region agent log
        agentDebugLog({ location: 'use-generation-flow.ts:runGeneration', message: 'generation flow failed', data: { stage: 'runGeneration', errorMessage: error instanceof Error ? error.message : String(error), generationId: generation?.id, statusBeforeFail: status }, hypothesisId: 'H1,H2,H3,H4,H5' })
        // #endregion
        setStatus('failed')
        setAssetProgress(null)
        setQueueTier(null)
        setErrorMessage(error instanceof Error ? error.message : 'Generation failed')
      } finally {
        setIsSubmitting(false)
      }
    },
    [isSubmitting, runAssetStage],
  )

  const resumeGeneration = useCallback(
    async (resumed: Generation) => {
      if (isSubmitting) return

      setIsSubmitting(true)
      setErrorMessage(null)
      setAssetProgress(null)
      setQueueTier(null)
      setRecoverableGeneration(null)
      setGeneration(resumed)
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
        // #region agent log
        agentDebugLog({ location: 'use-generation-flow.ts:resumeGeneration', message: 'generation flow failed', data: { stage: 'resumeGeneration', errorMessage: error instanceof Error ? error.message : String(error), generationId: resumed.id, resumedStatus: resumed.status }, hypothesisId: 'H1,H2,H3,H4,H5' })
        // #endregion
        setStatus('failed')
        setAssetProgress(null)
        setQueueTier(null)
        setErrorMessage(error instanceof Error ? error.message : 'Generation failed')
      } finally {
        setIsSubmitting(false)
      }
    },
    [isSubmitting, runAssetStage],
  )

  const reset = useCallback(() => {
    setStatus('idle')
    setGeneration(null)
    setErrorMessage(null)
    setAssetProgress(null)
    setQueueTier(null)
    setRecoverableGeneration(null)
    idempotencyKeyRef.current = null
  }, [])

  return {
    status,
    generation,
    assetProgress,
    queueTier,
    errorMessage,
    isSubmitting,
    recoverableGeneration,
    runGeneration,
    resumeGeneration,
    reset,
    setStatus,
    setGeneration,
    setErrorMessage,
  }
}
