import { describe, expect, it } from 'vitest'
import {
  getRitualMacroStepState,
  getRitualStatusLine,
  parseAssetProgressRatio,
  truncatePromptEcho,
} from '../lib/generation-ritual'

describe('generation-ritual', () => {
  it('maps asset progress to a ratio', () => {
    expect(parseAssetProgressRatio('Asset 3/5 ready')).toBe(0.6)
    expect(parseAssetProgressRatio(null)).toBeNull()
  })

  it('marks macro steps done and active', () => {
    expect(getRitualMacroStepState('generating_assets', 'optimize')).toBe('done')
    expect(getRitualMacroStepState('generating_assets', 'assets')).toBe('active')
    expect(getRitualMacroStepState('preview_ready', 'preview')).toBe('done')
  })

  it('builds readable status lines', () => {
    expect(getRitualStatusLine('optimizing', 'Shop UI, Inventory', 'Neon shop')).toContain('Optimizing')
    expect(truncatePromptEcho('x'.repeat(140)).endsWith('…')).toBe(true)
  })
})
