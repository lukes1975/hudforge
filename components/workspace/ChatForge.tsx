'use client'

import { FormEvent, useId, useState } from 'react'
import { generationStyleOptions } from '@/lib/generation-workbench'
import type { GenerationStyle } from '@/lib/hudforge-generation'
import type { WorkspaceUiTypeId } from '@/lib/ui-type-registry'
import { FloatingMotionChips } from '@/components/workspace/FloatingMotionChips'
import { UiTypeChipPicker } from '@/components/workspace/UiTypeChipPicker'

export type ChatForgeProps = {
  variant: 'light' | 'dark'
  onSubmit: (payload: { prompt: string; selectedUiTypes: WorkspaceUiTypeId[]; style: GenerationStyle }) => void
  isSubmitting?: boolean
  creditsLabel?: string
}

export function ChatForge({
  variant,
  onSubmit,
  isSubmitting = false,
  creditsLabel = 'Roblox-first · ZIP export',
}: ChatForgeProps) {
  const formId = useId()
  const promptId = `${formId}-prompt`
  const styleId = `${formId}-style`
  const [prompt, setPrompt] = useState('')
  const [selectedUiTypes, setSelectedUiTypes] = useState<WorkspaceUiTypeId[]>([])
  const [style, setStyle] = useState<GenerationStyle>('neon')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = prompt.trim()
    if (!trimmed || isSubmitting) return
    onSubmit({ prompt: trimmed, selectedUiTypes, style })
  }

  return (
    <section
      className={`chat-forge chat-forge--${variant}`}
      aria-labelledby={`${formId}-headline`}
    >
      <div className="chat-forge__orb" aria-hidden="true" />
      <div className="chat-forge__grid" aria-hidden="true" />

      <div className="chat-forge__stage">
        <h2 id={`${formId}-headline`} className="chat-forge__headline">
          Describe a UI. Preview it. Export to Roblox.
        </h2>
        <FloatingMotionChips />
      </div>

      <form className="chat-forge__panel" onSubmit={handleSubmit} aria-busy={isSubmitting}>
        <label htmlFor={promptId} className="chat-forge__label">
          Describe your Roblox UI
        </label>
        <textarea
          id={promptId}
          name="prompt"
          className="chat-forge__prompt"
          rows={4}
          placeholder="Neon simulator shop with coins, gems, buy buttons, and a close button…"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          disabled={isSubmitting}
          required
        />

        <fieldset className="chat-forge__fieldset">
          <legend className="chat-forge__legend">UI types (up to 3)</legend>
          <UiTypeChipPicker
            value={selectedUiTypes}
            onChange={setSelectedUiTypes}
            showHelperText={false}
            className="chat-forge__chip-picker"
          />
        </fieldset>

        <div className="chat-forge__controls">
          <div className="chat-forge__style-field">
            <label htmlFor={styleId} className="chat-forge__label">
              Style
            </label>
            <select
              id={styleId}
              name="style"
              className="chat-forge__select"
              value={style}
              onChange={(event) => setStyle(event.target.value as GenerationStyle)}
              disabled={isSubmitting}
            >
              {generationStyleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="chat-forge__submit forge-button forge-button--primary"
            disabled={isSubmitting || !prompt.trim()}
          >
            {isSubmitting ? 'Generating…' : 'Generate UI pack'}
          </button>
        </div>

        <p className="chat-forge__footer">{creditsLabel}</p>
      </form>
    </section>
  )
}
