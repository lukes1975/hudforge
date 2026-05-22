import { describe, expect, it } from 'vitest'
import {
  assertGenerationStatus,
  createAssetsForGeneration,
  createExportForGeneration,
  createOptimizedGeneration,
  exportLayoutToLuau,
  generateMockAssets,
  generationStatuses,
  optimizePromptForRobloxUi,
  updateSettings,
} from '../lib/hudforge-generation'

describe('authenticated generation foundation', () => {
  it('exposes the required staged statuses in order', () => {
    expect(generationStatuses).toEqual([
      'idle',
      'optimizing',
      'optimized',
      'generating_assets',
      'assets_ready',
      'preview_ready',
      'exporting',
      'exported',
      'failed',
    ])
    expect(() => assertGenerationStatus('preview_ready')).not.toThrow()
    expect(() => assertGenerationStatus('succeeded')).toThrow(/Unsupported/)
  })

  it('optimizes the MVP prompt into the required structured JSON shape', () => {
    const spec = optimizePromptForRobloxUi({
      prompt: 'Create a neon anime simulator shop UI with coins, gems, buy buttons, and a close button. Make it mobile-friendly.',
      ui_type: 'shop_ui',
      style: 'neon',
      user_settings: { default_export_format: 'zip', mobile_first: true },
    })

    expect(spec.ui_type).toBe('shop_ui')
    expect(spec.style).toBe('neon')
    expect(spec.asset_list).toEqual(['main_frame', 'primary_button', 'secondary_button', 'currency_icon', 'background_panel'])
    expect(spec.layout_spec.canvas).toEqual({ target: 'mobile', width: 390, height: 844, safe_area: true })
    expect(spec.layout_spec.nodes.some((node) => node.id === 'main_frame')).toBe(true)
    expect(spec.image_prompts.primary_button.transparent).toBe(true)
    expect(spec.lua_spec.screen_gui_name).toBe('HUDForgeGeneratedUI')
    expect(spec.constraints).toMatchObject({ mobile_friendly: true, roblox_native: true, deterministic_export_required: true })
  })

  it('creates deterministic mock assets for the required asset bundle shape', () => {
    const spec = optimizePromptForRobloxUi({ prompt: 'Inventory for mobile players', ui_type: 'inventory', style: 'minimal' })
    const assets = generateMockAssets(spec)

    expect(assets.map((asset) => asset.name)).toEqual(['main_frame', 'primary_button', 'secondary_button', 'currency_icon', 'background_panel'])
    expect(assets.every((asset) => asset.provider === 'mock')).toBe(true)
    expect(assets[0].url).toMatch(/^data:image\/svg\+xml/)
  })

  it('exports deterministic MainUI.lua from LuaSpec', () => {
    const spec = optimizePromptForRobloxUi({ prompt: 'Sci-fi HUD with coins and XP', ui_type: 'hud', style: 'sci_fi' })
    const luau = exportLayoutToLuau(spec)

    expect(luau).toContain('local ScreenGui = Instance.new("ScreenGui")')
    expect(luau).toContain('ScreenGui.Name = "HUDForgeGeneratedUI"')
    expect(luau).toContain('Instance.new("TextButton")')
    expect(luau).toContain('return ScreenGui')
  })

  it('builds the full optimize assets export lifecycle', () => {
    const userId = 'user_test'
    const optimized = createOptimizedGeneration(userId, { prompt: 'Shop UI for an anime simulator', ui_type: 'shop_ui', style: 'anime' })
    const withAssets = createAssetsForGeneration(userId, optimized.id)
    const exported = createExportForGeneration(userId, optimized.id)

    expect(optimized.status).toBe('optimized')
    expect(withAssets.status).toBe('assets_ready')
    expect(withAssets.asset_bundle?.status).toBe('assets_ready')
    expect(exported.status).toBe('exported')
    expect(exported.export_package?.package.format).toBe('json_payload')
    expect(exported.export_package?.package.files.map((file) => file.path)).toEqual([
      'manifest.json',
      'layout.json',
      'code/MainUI.lua',
      'assets/assets.json',
    ])
    expect(exported.export_package?.files.find((file) => file.path === 'code/MainUI.lua')?.content).toContain('ScreenGui')
  })

  it('normalizes settings using brief-compatible names', () => {
    const settings = updateSettings('user_settings', {
      default_style: 'sci_fi',
      default_ui_type: 'reward_screen',
      default_export_format: 'manifest',
      mobile_first: false,
      save_history: false,
    })

    expect(settings).toEqual({
      default_export_format: 'manifest',
      mobile_first: false,
      default_ui_type: 'reward_screen',
      default_style: 'sci_fi',
      save_history: false,
    })
  })
})
