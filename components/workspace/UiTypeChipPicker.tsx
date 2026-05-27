'use client'

import { useMemo, useState } from 'react'
import {
  MAX_UI_TYPE_SELECTIONS,
  getOverflowWorkspaceUiTypes,
  getViralWorkspaceUiTypes,
  getWorkspaceUiTypeDefinition,
  toggleWorkspaceUiTypeSelection,
  type WorkspaceUiTypeId,
} from '@/lib/ui-type-registry'
import { UiTypeChip } from '@/components/workspace/UiTypeChip'

type UiTypeChipPickerProps = {
  value: WorkspaceUiTypeId[]
  onChange: (next: WorkspaceUiTypeId[]) => void
  maxSelections?: number
  motion?: boolean
  showHelperText?: boolean
  className?: string
}

export function UiTypeChipPicker({
  value,
  onChange,
  maxSelections = MAX_UI_TYPE_SELECTIONS,
  motion = false,
  showHelperText = true,
  className = '',
}: UiTypeChipPickerProps) {
  const [overflowOpen, setOverflowOpen] = useState(false)
  const viralTypes = useMemo(() => getViralWorkspaceUiTypes(), [])
  const overflowTypes = useMemo(() => getOverflowWorkspaceUiTypes(), [])
  const atLimit = value.length >= maxSelections

  function handleToggle(id: WorkspaceUiTypeId) {
    onChange(toggleWorkspaceUiTypeSelection(value, id, maxSelections))
  }

  return (
    <div className={`space-y-3 ${className}`.trim()}>
      <div className="flex flex-wrap gap-2">
        {viralTypes.map((definition) => {
          const selected = value.includes(definition.id)
          const disabled = !selected && atLimit

          return (
            <UiTypeChip
              key={definition.id}
              label={definition.label}
              selected={selected}
              disabled={disabled}
              motion={motion}
              onClick={() => handleToggle(definition.id)}
            />
          )
        })}

        <div className="relative">
          <UiTypeChip
            label="···"
            selected={overflowOpen}
            motion={motion}
            aria-haspopup="menu"
            aria-expanded={overflowOpen}
            onClick={() => setOverflowOpen((open) => !open)}
          />

          {overflowOpen ? (
            <div className="workspace-overflow-menu" role="menu" aria-label="More UI types">
              <p className="workspace-overflow-menu__title">More Roblox UI types</p>
              <div className="workspace-overflow-menu__grid">
                {overflowTypes.map((definition) => {
                  const selected = value.includes(definition.id)
                  const disabled = !selected && atLimit

                  return (
                    <UiTypeChip
                      key={definition.id}
                      label={definition.label}
                      selected={selected}
                      disabled={disabled}
                      size="sm"
                      onClick={() => handleToggle(definition.id)}
                    />
                  )
                })}
              </div>
              <button type="button" className="workspace-overflow-menu__close" onClick={() => setOverflowOpen(false)}>
                Done
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {showHelperText ? (
        <p className="text-xs leading-5 text-slate-400">
          Select up to {maxSelections} UI types for one export pack.
          {value.length > 0 ? (
            <>
              {' '}
              Selected: {value.map((id) => getWorkspaceUiTypeDefinition(id).label).join(', ')}.
            </>
          ) : (
            <> Pick viral simulator patterns like Shop, Currency HUD, or Rebirth.</>
          )}
        </p>
      ) : null}
    </div>
  )
}
