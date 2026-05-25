import { describe, expect, it } from 'vitest'
import {
  buildPromptDownloadFilename,
  buildRegenerationPrompt,
  generationStyleOptions,
  generationUiTypeOptions,
  isTerminalGenerationStatus,
  generatorSamplePrompts,
} from '../lib/generation-workbench'

describe('generation workbench helpers', () => {
  it('exposes the required MVP sample prompt first', () => {
    expect(generatorSamplePrompts[0]).toBe('Create a neon anime simulator shop UI with coins, gems, buy buttons, and a close button. Make it mobile-friendly.')
    expect(generatorSamplePrompts).toHaveLength(4)
  })

  it('exposes the required UI types used by the workbench', () => {
    expect(generationUiTypeOptions.map((option) => option.value)).toEqual(['shop_ui', 'hud', 'inventory', 'main_menu', 'reward_screen'])
  })

  it('exposes the required generator styles used by the workbench', () => {
    expect(generationStyleOptions.map((option) => option.value)).toEqual(['neon', 'cartoon', 'sci_fi', 'anime', 'minimal', 'premium'])
  })

  it('builds a stable export filename from the prompt and style', () => {
    expect(buildPromptDownloadFilename('Build a neon shop UI!', 'neon')).toBe('hudforge-neon-shop-ui-neon.luau')
    expect(buildPromptDownloadFilename('  ', 'premium')).toBe('hudforge-generation.luau')
  })

  it('turns edit notes into a refined regeneration prompt', () => {
    expect(buildRegenerationPrompt('Create a futuristic shop UI', 'make it mobile-first and add bigger buy buttons')).toBe(
      'Create a futuristic shop UI\n\nRefine this generation with these edits: make it mobile-first and add bigger buy buttons',
    )
    expect(buildRegenerationPrompt('Create a futuristic shop UI', '   ')).toBe('Create a futuristic shop UI')
  })

  it('knows when a generation status is terminal', () => {
    expect(isTerminalGenerationStatus('exported')).toBe(true)
    expect(isTerminalGenerationStatus('failed')).toBe(true)
    expect(isTerminalGenerationStatus('optimizing')).toBe(false)
    expect(isTerminalGenerationStatus('generating_assets')).toBe(false)
  })
})
