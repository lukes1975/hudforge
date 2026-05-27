import { describe, expect, it } from 'vitest'
import {
  MAX_UI_TYPE_SELECTIONS,
  buildGenerationSelectionMetadata,
  buildSelectedUiTypesPromptAugmentation,
  getViralWorkspaceUiTypes,
  resolvePrimaryBackendUiType,
  toggleWorkspaceUiTypeSelection,
} from '../lib/ui-type-registry'

describe('ui-type-registry', () => {
  it('exposes eight viral chips', () => {
    expect(getViralWorkspaceUiTypes()).toHaveLength(8)
  })

  it('caps multi-select at three types', () => {
    const selected = toggleWorkspaceUiTypeSelection([], 'shop_ui')
    const second = toggleWorkspaceUiTypeSelection(selected, 'inventory')
    const third = toggleWorkspaceUiTypeSelection(second, 'energy_bar')
    const blocked = toggleWorkspaceUiTypeSelection(third, 'rebirth')

    expect(third).toHaveLength(3)
    expect(blocked).toHaveLength(3)
    expect(blocked).toEqual(third)
    expect(MAX_UI_TYPE_SELECTIONS).toBe(3)
  })

  it('maps the first selected chip to the primary backend type', () => {
    expect(resolvePrimaryBackendUiType(['energy_bar', 'shop_ui'])).toBe('hud')
    expect(resolvePrimaryBackendUiType(['shop_ui', 'energy_bar'])).toBe('shop_ui')
  })

  it('builds prompt augmentation and metadata for one pack', () => {
    const selected = ['shop_ui', 'inventory', 'energy_bar'] as const
    const metadata = buildGenerationSelectionMetadata([...selected])

    expect(metadata.primary_backend_ui_type).toBe('shop_ui')
    expect(metadata.hero_ui_type).toBe('shop_ui')
    expect(metadata.hero_asset_name).toBe('main_frame')
    expect(metadata.selected_ui_types).toEqual([...selected])
    expect(buildSelectedUiTypesPromptAugmentation([...selected])).toContain('Shop UI')
    expect(buildSelectedUiTypesPromptAugmentation([...selected])).toContain('Energy Bar')
  })
})
