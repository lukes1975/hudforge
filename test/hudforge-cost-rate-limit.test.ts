import { describe, expect, it } from 'vitest'
import {
  createRepositoryBackedHudforgeService,
  memoryHudforgeRepository,
  optimizePromptForRobloxUi,
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

describe('HUDForge provider cost tracking and rate limits', () => {
  it('records estimated provider costs in usage metadata and credit ledger metadata', async () => {
    const repo = memoryHudforgeRepository({ initialCredits: 25 })
    const service = createRepositoryBackedHudforgeService(repo, { assetProvider: fakeFalAssetProvider })
    const userId = 'cost_user'

    const optimized = await service.createOptimizedGeneration(userId, { prompt: 'Premium pet simulator shop UI', ui_type: 'shop_ui', style: 'premium' })
    await service.createAssetsForGeneration(userId, optimized.id)

    const usage = await repo.listUsageEvents(userId)
    const optimizeCostEvent = usage.find((event) => event.name === 'prompt_optimized')
    const assetCostEvent = usage.find((event) => event.name === 'assets_generated')
    expect(optimizeCostEvent?.metadata).toMatchObject({ provider: 'openrouter_or_mock', cost_stage: 'optimizer', estimated_cost_usd: 0.001 })
    expect(assetCostEvent?.metadata).toMatchObject({ provider: 'fal', cost_stage: 'asset_bundle', estimated_cost_usd: 0.125, asset_count: 5 })

    const ledger = await repo.listCreditLedger(userId)
    expect(ledger.find((entry) => entry.reason === 'generation_optimize')?.metadata).toMatchObject({ estimated_cost_usd: 0.001 })
    expect(ledger.find((entry) => entry.reason === 'asset_generation')?.metadata).toMatchObject({ estimated_cost_usd: 0.125, asset_count: 5 })
  })

  it('rate-limits optimize before calling the optimizer provider', async () => {
    const repo = memoryHudforgeRepository({ initialCredits: 25 })
    let optimizerCalls = 0
    const service = createRepositoryBackedHudforgeService(repo, {
      rateLimits: { optimizePerHour: 1 },
      optimizerProvider: async ({ generation_id, prompt, ui_type, style, user_settings }) => {
        optimizerCalls += 1
        return { ...optimizePromptForRobloxUi({ prompt, ui_type, style, user_settings }), generation_id }
      },
    })

    await service.createOptimizedGeneration('rate_user', { prompt: 'First shop UI', ui_type: 'shop_ui', style: 'neon' })
    await expect(service.createOptimizedGeneration('rate_user', { prompt: 'Second shop UI', ui_type: 'shop_ui', style: 'neon' })).rejects.toMatchObject({
      code: 'rate_limited',
      status: 429,
      details: { limit: 1, window_seconds: 3600, stage: 'optimizer' },
    })
    expect(optimizerCalls).toBe(1)

    const usage = await repo.listUsageEvents('rate_user')
    expect(usage.some((event) => event.name === 'generation_rate_limited' && event.metadata?.stage === 'optimizer')).toBe(true)
  })

  it('rate-limits asset bundles before debiting credits or calling FAL', async () => {
    const repo = memoryHudforgeRepository({ initialCredits: 25 })
    let assetCalls = 0
    const service = createRepositoryBackedHudforgeService(repo, {
      rateLimits: { assetBundlesPerHour: 0 },
      assetProvider: async (spec) => {
        assetCalls += 1
        return fakeFalAssetProvider(spec)
      },
    })

    const optimized = await service.createOptimizedGeneration('asset_rate_user', { prompt: 'Inventory UI', ui_type: 'inventory', style: 'cartoon' })
    await expect(service.createAssetsForGeneration('asset_rate_user', optimized.id)).rejects.toMatchObject({ code: 'rate_limited', status: 429 })
    expect(assetCalls).toBe(0)

    const ledger = await repo.listCreditLedger('asset_rate_user')
    expect(ledger.some((entry) => entry.reason === 'asset_generation')).toBe(false)
  })
})
