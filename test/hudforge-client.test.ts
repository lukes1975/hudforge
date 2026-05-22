import { describe, expect, it } from 'vitest'
import {
  buildGenerationExportSummary,
  formatBillingState,
  formatGenerationStatus,
  formatGenerationStyle,
  formatGenerationTimestamp,
  formatUiType,
} from '../lib/hudforge-client'

describe('hudforge client formatting helpers', () => {
  it('formats generation metadata for live app cards', () => {
    expect(formatUiType('shop_ui')).toBe('Shop UI')
    expect(formatGenerationStyle('sci_fi')).toBe('Sci-fi')
    expect(formatGenerationStatus('assets_ready')).toBe('Assets ready')
  })

  it('formats billing state and export summaries', () => {
    expect(formatBillingState('unknown_mock')).toBe('Mock mode')
    expect(buildGenerationExportSummary(4, true)).toBe('4 package files ready')
    expect(buildGenerationExportSummary(0, false)).toBe('No export package yet')
  })

  it('handles valid and invalid generation timestamps', () => {
    expect(formatGenerationTimestamp('not-a-date')).toBe('Unknown date')
    expect(formatGenerationTimestamp('2026-05-22T12:30:00.000Z')).toContain('2026')
  })
})
