import { describe, expect, it } from 'vitest'
import {
  createAssetsForGeneration,
  createExportForGeneration,
  createOptimizedGeneration,
  createRepositoryBackedHudforgeService,
  HudforgeServiceError,
  memoryHudforgeRepository,
  type AssetBundle,
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
    })),
    errors: [],
  })
}

describe('persistent generation service and credit gate', () => {
  it('persists the optimize assets export lifecycle through a repository', async () => {
    const repo = memoryHudforgeRepository()
    const service = createRepositoryBackedHudforgeService(repo, { assetProvider: fakeFalAssetProvider })
    const userId = 'persist_user'

    const optimized = await service.createOptimizedGeneration(userId, {
      prompt: 'Create a neon anime simulator shop UI with coins, gems, buy buttons, and a close button. Make it mobile-friendly.',
      ui_type: 'shop_ui',
      style: 'neon',
    })
    const withAssets = await service.createAssetsForGeneration(userId, optimized.id)
    const exported = await service.createExportForGeneration(userId, optimized.id)
    const history = await service.listGenerations(userId)

    expect(withAssets.asset_bundle?.assets).toHaveLength(5)
    expect(withAssets.asset_bundle?.assets.every((asset) => asset.provider === 'fal')).toBe(true)
    expect(exported.export_package?.files.find((file) => file.path === 'code/MainUI.lua')?.content).toContain('ScreenGui')
    expect(history.map((generation) => generation.id)).toContain(optimized.id)
  })

  it('requires credit before generation and records ledger debit', async () => {
    const repo = memoryHudforgeRepository({ initialCredits: 1 })
    const service = createRepositoryBackedHudforgeService(repo, { assetProvider: fakeFalAssetProvider })
    const userId = 'credit_user'

    await service.createOptimizedGeneration(userId, { prompt: 'Inventory UI for pets', ui_type: 'inventory', style: 'cartoon' })
    await expect(service.createOptimizedGeneration(userId, { prompt: 'Second inventory UI', ui_type: 'inventory', style: 'cartoon' })).rejects.toMatchObject({ code: 'insufficient_credits' })

    const ledger = await repo.listCreditLedger(userId)
    expect(ledger.some((entry) => entry.reason === 'initial_free_grant' && entry.delta === 1)).toBe(true)
    expect(ledger.some((entry) => entry.reason === 'generation_optimize' && entry.delta === -1)).toBe(true)
  })

  it('does not silently mock assets when FAL is unavailable', async () => {
    const repo = memoryHudforgeRepository({ initialCredits: 10 })
    const service = createRepositoryBackedHudforgeService(repo)
    const optimized = await service.createOptimizedGeneration('fal_user', { prompt: 'Shop UI', ui_type: 'shop_ui', style: 'premium' })

    await expect(service.createAssetsForGeneration('fal_user', optimized.id)).rejects.toMatchObject({ code: 'fal_not_configured' })
  })
})

// Backwards-compatible exported helpers should use the same async service surface.
describe('default exported helper surface', () => {
  it('exposes async generation helpers', async () => {
    await expect(createOptimizedGeneration('surface_user', { prompt: 'HUD with coins', ui_type: 'hud', style: 'minimal' })).resolves.toMatchObject({ status: 'optimized' })
    const optimized = await createOptimizedGeneration('surface_user_2', { prompt: 'Reward UI', ui_type: 'reward_screen', style: 'anime' })
    await expect(createAssetsForGeneration('surface_user_2', optimized.id)).rejects.toBeInstanceOf(HudforgeServiceError)
    await expect(createExportForGeneration('surface_user_2', optimized.id)).resolves.toMatchObject({ status: 'exported' })
  })
})
