import { describe, expect, it, vi } from 'vitest'
import {
  assertGenerationStatus,
  createRepositoryBackedHudforgeService,
  DEFAULT_RATE_LIMITS,
  exportLayoutToLuau,
  generateMockAssets,
  generationStatuses,
  getQueueTierForUser,
  getRateLimitsForUser,
  memoryHudforgeRepository,
  optimizePromptForRobloxUi,
  parseFalResultToAsset,
  PRIORITY_RATE_LIMITS,
  submitAllFalJobs,
  type AssetBundle,
  type HudforgeSubscription,
  type OptimizedGenerationSpec,
} from '../lib/hudforge-generation'

function fakeFalAssetProvider(spec: OptimizedGenerationSpec): Promise<AssetBundle> {
  return Promise.resolve({
    generation_id: spec.generation_id,
    status: 'assets_ready',
    assets: Object.entries(spec.image_prompts).map(([name, imagePrompt]) => ({
      id: `${name}_fake`,
      name,
      type: imagePrompt.intended_use,
      url: `https://assets.example.test/${name}.png`,
      width: 1024,
      height: 1024,
      transparent: imagePrompt.transparent,
      provider: 'fal',
      prompt_used: imagePrompt.prompt,
      content_type: 'image/png',
    })),
    errors: [],
  })
}

function activeProSubscription(userId: string): HudforgeSubscription {
  const now = new Date().toISOString()
  return {
    id: `sub_${userId}`,
    user_id: userId,
    state: 'active_paid',
    plan_id: 'pro',
    cancel_at_period_end: false,
    created_at: now,
    updated_at: now,
  }
}

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

  it('builds the full optimize assets export lifecycle', async () => {
    const service = createRepositoryBackedHudforgeService(memoryHudforgeRepository(), { assetProvider: fakeFalAssetProvider })
    const userId = 'user_test'
    const optimized = await service.createOptimizedGeneration(userId, { prompt: 'Shop UI for an anime simulator', ui_type: 'shop_ui', style: 'anime' })
    const withAssets = await service.createAssetsForGeneration(userId, optimized.id)
    const exported = await service.createExportForGeneration(userId, optimized.id)

    expect(optimized.status).toBe('optimized')
    expect(withAssets.status).toBe('assets_ready')
    expect(withAssets.asset_bundle?.status).toBe('assets_ready')
    expect(exported.status).toBe('exported')
    expect(exported.export_package?.package.format).toBe('zip')
    expect(exported.export_package?.package.files.map((file) => file.path)).toEqual([
      'manifest.json',
      'layout.json',
      'code/MainUI.lua',
      'assets/assets.json',
      'README_IMPORT.md',
    ])
    expect(exported.export_package?.files.find((file) => file.path === 'code/MainUI.lua')?.content).toContain('ScreenGui')
  })

  it('normalizes settings using brief-compatible names', async () => {
    const service = createRepositoryBackedHudforgeService(memoryHudforgeRepository())
    const settings = await service.updateSettings('user_settings', {
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

  it('assigns priority queue tier to active pro subscribers', async () => {
    const repo = memoryHudforgeRepository()
    await repo.upsertSubscription(activeProSubscription('pro_user'))
    expect(await getQueueTierForUser(repo, 'pro_user')).toBe('priority')
    expect(await getRateLimitsForUser(repo, 'pro_user')).toEqual(PRIORITY_RATE_LIMITS)
  })

  it('assigns standard queue tier to free users', async () => {
    const repo = memoryHudforgeRepository()
    expect(await getQueueTierForUser(repo, 'free_user')).toBe('standard')
    expect(await getRateLimitsForUser(repo, 'free_user')).toEqual(DEFAULT_RATE_LIMITS)
  })

  it('parses FAL PNG assets with transparent metadata', () => {
    const spec = optimizePromptForRobloxUi({ prompt: 'Neon shop UI', ui_type: 'shop_ui', style: 'neon' })
    const asset = parseFalResultToAsset({ images: [{ url: 'https://fal.media/files/panel.png', content_type: 'image/png' }] }, spec, 'main_frame')
    expect(asset?.url).toContain('.png')
    expect(asset?.content_type).toBe('image/png')
    expect(asset?.transparent).toBe(true)
  })

  it('requests PNG output and submits sequentially for standard queue', async () => {
    const originalKey = process.env.FAL_KEY
    process.env.FAL_KEY = 'test-fal-key'
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({ request_id: 'req_1', response_url: 'https://fal.run/poll/1' }), { status: 200 }))
    const spec = optimizePromptForRobloxUi({ prompt: 'Standard queue shop UI', ui_type: 'shop_ui', style: 'neon' })

    vi.useFakeTimers()
    const promise = submitAllFalJobs(spec, { queueTier: 'standard', fetchImpl })
    await vi.runAllTimersAsync()
    const jobs = await promise
    vi.useRealTimers()

    expect(jobs).toHaveLength(5)
    expect(fetchImpl).toHaveBeenCalledTimes(5)
    const calls = fetchImpl.mock.calls as unknown as Array<[string, RequestInit]>
    const firstBody = JSON.parse(String(calls[0][1].body))
    expect(firstBody.output_format).toBe('png')

    if (originalKey) process.env.FAL_KEY = originalKey
    else delete process.env.FAL_KEY
  })

  it('submits FAL jobs in parallel for priority queue', async () => {
    const originalKey = process.env.FAL_KEY
    process.env.FAL_KEY = 'test-fal-key'
    let inFlight = 0
    let maxInFlight = 0
    const fetchImpl = vi.fn(async () => {
      inFlight += 1
      maxInFlight = Math.max(maxInFlight, inFlight)
      await Promise.resolve()
      inFlight -= 1
      return new Response(JSON.stringify({ request_id: 'req_1', response_url: 'https://fal.run/poll/1' }), { status: 200 })
    })
    const spec = optimizePromptForRobloxUi({ prompt: 'Priority queue shop UI', ui_type: 'shop_ui', style: 'premium' })

    await submitAllFalJobs(spec, { queueTier: 'priority', fetchImpl })

    expect(fetchImpl).toHaveBeenCalledTimes(5)
    expect(maxInFlight).toBeGreaterThan(1)

    if (originalKey) process.env.FAL_KEY = originalKey
    else delete process.env.FAL_KEY
  })
})
