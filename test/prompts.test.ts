import { describe, it, expect, vi, beforeEach } from 'vitest'
import { analyzeRobloxPrompt, buildRobloxImagePrompt, getUiTypePhrase } from '../lib/prompts'

describe('Prompt Analysis', () => {
  describe('UI Type Detection', () => {
    it('should detect health bar from prompt', () => {
      const analysis = analyzeRobloxPrompt('Create a health bar for my game')
      expect(analysis.uiType).toBe('healthBar')
    })

    it('should detect inventory from prompt', () => {
      const analysis = analyzeRobloxPrompt('Make an inventory panel')
      expect(analysis.uiType).toBe('inventory')
    })

    it('should detect shop from prompt', () => {
      const analysis = analyzeRobloxPrompt('Design a shop UI')
      expect(analysis.uiType).toBe('shop')
    })

    it('should detect leaderboard from prompt', () => {
      const analysis = analyzeRobloxPrompt('Build a leaderboard')
      expect(analysis.uiType).toBe('leaderboard')
    })

    it('should detect dialog from prompt', () => {
      const analysis = analyzeRobloxPrompt('Create a dialog box')
      expect(analysis.uiType).toBe('dialog')
    })

    it('should detect menu from prompt', () => {
      const analysis = analyzeRobloxPrompt('Make a menu')
      expect(analysis.uiType).toBe('menu')
    })

    it('should detect button from prompt', () => {
      const analysis = analyzeRobloxPrompt('Design a button')
      expect(analysis.uiType).toBe('button')
    })

    it('should default to hud for generic prompts', () => {
      const analysis = analyzeRobloxPrompt('Create a UI element')
      expect(analysis.uiType).toBe('hud')
    })
  })

  describe('Style Detection', () => {
    it('should detect fantasy style', () => {
      const analysis = analyzeRobloxPrompt('fantasy health bar')
      expect(analysis.style).toBe('fantasy')
    })

    it('should detect sci-fi style', () => {
      const analysis = analyzeRobloxPrompt('sci-fi inventory')
      expect(analysis.style).toBe('sciFi')
    })

    it('should detect cartoon style', () => {
      const analysis = analyzeRobloxPrompt('cartoon shop')
      expect(analysis.style).toBe('cartoon')
    })

    it('should detect minimal style', () => {
      const analysis = analyzeRobloxPrompt('minimal button')
      expect(analysis.style).toBe('minimal')
    })

    it('should detect neon style', () => {
      const analysis = analyzeRobloxPrompt('neon leaderboard')
      expect(analysis.style).toBe('neon')
    })

    it('should detect medieval style', () => {
      const analysis = analyzeRobloxPrompt('medieval dialog')
      expect(analysis.style).toBe('medieval')
    })

    it('should use default style when none specified', () => {
      const analysis = analyzeRobloxPrompt('simple button')
      expect(analysis.style).toBe('minimal')
    })

    it('should respect requested style parameter', () => {
      const analysis = analyzeRobloxPrompt('health bar', 'fantasy')
      expect(analysis.style).toBe('fantasy')
    })

    it('should normalize style names', () => {
      const analysis = analyzeRobloxPrompt('health bar', 'cyberpunk')
      expect(analysis.style).toBe('sciFi')
    })
  })

  describe('Token Extraction', () => {
    it('should extract tokens from prompt', () => {
      const analysis = analyzeRobloxPrompt('health bar with red color')
      expect(analysis.tokens).toContain('health')
      expect(analysis.tokens).toContain('bar')
      expect(analysis.tokens).toContain('red')
      expect(analysis.tokens).toContain('color')
    })

    it('should handle empty prompts', () => {
      const analysis = analyzeRobloxPrompt('')
      expect(analysis.tokens).toEqual([])
    })

    it('should handle special characters', () => {
      const analysis = analyzeRobloxPrompt('health-bar (with special) characters!')
      expect(analysis.tokens).toContain('health')
      expect(analysis.tokens).toContain('bar')
      expect(analysis.tokens).toContain('with')
      expect(analysis.tokens).toContain('special')
    })
  })
})

describe('Image Prompt Building', () => {
  it('should build proper image prompt for health bar', () => {
    const prompt = buildRobloxImagePrompt('health bar', 'fantasy')
    expect(prompt).toContain('Game UI element')
    expect(prompt).toContain('health bar HUD widget')
    expect(prompt).toContain('fantasy style with gold trim')
  })

  it('should include transparency requirement', () => {
    const prompt = buildRobloxImagePrompt('button')
    expect(prompt).toContain('Transparent PNG')
    expect(prompt).toContain('alpha background')
    expect(prompt).toContain('no scene')
    expect(prompt).toContain('no characters')
  })

  it('should warn about tiny text', () => {
    const prompt = buildRobloxImagePrompt('dialog box')
    expect(prompt).toContain('Do not include tiny unreadable text')
  })

  it('should include game-ready requirements', () => {
    const prompt = buildRobloxImagePrompt('inventory')
    expect(prompt).toMatch(/Crisp vector.?like edges/i)
    expect(prompt).toMatch(/game.?ready mobile proportions/i)
  })

  it('should include user request in prompt', () => {
    const prompt = buildRobloxImagePrompt('red health bar', 'sciFi')
    expect(prompt).toContain('User request: "red health bar"')
  })
})

describe('UI Type Phrase Generation', () => {
  it('should generate descriptive phrases for each UI type', () => {
    expect(getUiTypePhrase('button')).toContain('call‑to‑action button')
    expect(getUiTypePhrase('healthBar')).toContain('health bar HUD widget')
    expect(getUiTypePhrase('inventory')).toContain('inventory grid panel')
    expect(getUiTypePhrase('shop')).toContain('shop panel')
    expect(getUiTypePhrase('leaderboard')).toContain('leaderboard panel')
    expect(getUiTypePhrase('dialog')).toContain('dialogue panel')
    expect(getUiTypePhrase('menu')).toContain('menu panel')
    expect(getUiTypePhrase('hud')).toContain('HUD panel')
  })
})