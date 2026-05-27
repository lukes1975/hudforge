'use client'

import type { GenerationStatus, GenerationStyle } from '@/lib/hudforge-generation'
import {
  getRitualMacroStepState,
  getRitualStatusLine,
  parseAssetProgressRatio,
  ritualMacroSteps,
  truncatePromptEcho,
} from '@/lib/generation-ritual'
import { formatWorkspaceUiTypeLabels, type WorkspaceUiTypeId } from '@/lib/ui-type-registry'
import { GenerationRitualBackground } from '@/components/workspace/GenerationRitualBackground'

export type GenerationRitualProps = {
  prompt: string
  selectedUiTypes: WorkspaceUiTypeId[]
  style: GenerationStyle
  status: GenerationStatus
  assetProgress?: string | null
  queueTier?: 'standard' | 'priority' | null
  errorMessage?: string | null
  onRetry?: () => void
}

export function GenerationRitual({
  prompt,
  selectedUiTypes,
  style,
  status,
  assetProgress = null,
  queueTier = null,
  errorMessage = null,
  onRetry,
}: GenerationRitualProps) {
  const selectedLabels = formatWorkspaceUiTypeLabels(selectedUiTypes)
  const statusLine = getRitualStatusLine(status, selectedLabels, prompt)
  const progressRatio = parseAssetProgressRatio(assetProgress)
  const failed = status === 'failed'

  return (
    <div className="generation-ritual" role="dialog" aria-modal="true" aria-labelledby="generation-ritual-title">
      <GenerationRitualBackground />

      <div className="generation-ritual__content">
        <div className="generation-ritual__orb" aria-hidden="true" />

        <div className="generation-ritual__panel">
          <p className="section-kicker">Generation ritual</p>
          <h2 id="generation-ritual-title" className="generation-ritual__title">
            {statusLine}
          </h2>

          {assetProgress ? (
            <div className="generation-ritual__progress-wrap" aria-live="polite">
              <div className="generation-ritual__progress-track">
                <div
                  className="generation-ritual__progress-fill"
                  style={{ width: `${Math.round((progressRatio ?? 0.35) * 100)}%` }}
                />
              </div>
              <p className="generation-ritual__progress-label">{assetProgress}</p>
            </div>
          ) : null}

          <ol className="generation-ritual__steps" aria-label="Generation progress">
            {ritualMacroSteps.map((step) => {
              const stepState = getRitualMacroStepState(status, step.id)
              return (
                <li key={step.id} className={`generation-ritual__step generation-ritual__step--${stepState}`}>
                  <span className="generation-ritual__step-dot" aria-hidden="true" />
                  <span>{step.label}</span>
                </li>
              )
            })}
          </ol>

          <div className="generation-ritual__meta">
            {selectedUiTypes.length > 0 ? (
              <p className="generation-ritual__chips">{selectedLabels}</p>
            ) : null}
            <p className="generation-ritual__prompt-echo">{truncatePromptEcho(prompt)}</p>
            <p className="generation-ritual__style-echo">Style: {style.replace('_', ' ')}</p>
            {queueTier ? (
              <p className="generation-ritual__queue">{queueTier === 'priority' ? 'Priority queue' : 'Standard queue'}</p>
            ) : null}
          </div>

          {failed ? (
            <div className="generation-ritual__error" role="alert">
              <p>{errorMessage ?? 'Generation failed. Try again with a shorter prompt or fewer UI types.'}</p>
              {onRetry ? (
                <button type="button" className="forge-button forge-button--secondary mt-3" onClick={onRetry}>
                  Retry
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
