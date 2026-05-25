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

describe('HUDForge idempotency and usage counting', () => {
  it('does not double-debit optimize requests with the same idempotency key', async () => {
    const repo = memoryHudforgeRepository({ initialCredits: 25 })
    const service = createRepositoryBackedHudforgeService(repo, {
      optimizerProvider: async ({ generation_id, prompt, ui_type, style, user_settings }) => ({
        ...optimizePromptForRobloxUi({ prompt, ui_type, style, user_settings }),
        generation_id,
      }),
    })
    const userId = 'idempotent_user'
    const input = { prompt: 'Neon shop UI', ui_type: 'shop_ui' as const, style: 'neon' as const, idempotency_key: 'opt-key-1' }

    const first = await service.createOptimizedGeneration(userId, input)
    const second = await service.createOptimizedGeneration(userId, input)

    expect(second.id).toBe(first.id)
    expect(await repo.getCreditBalance(userId)).toBe(24)

    const ledger = await repo.listCreditLedger(userId)
    expect(ledger.filter((entry) => entry.reason === 'generation_optimize' && entry.delta < 0)).toHaveLength(1)
  })

  it('does not double-debit asset submission when assets are already ready', async () => {
    const repo = memoryHudforgeRepository({ initialCredits: 25 })
    const service = createRepositoryBackedHudforgeService(repo, { assetProvider: fakeFalAssetProvider })
    const userId = 'asset_idempotent_user'

    const optimized = await service.createOptimizedGeneration(userId, { prompt: 'Inventory UI', ui_type: 'inventory', style: 'cartoon' })
    await service.createAssetsForGeneration(userId, optimized.id)
    const resubmitted = await service.submitAssetsForGeneration(userId, optimized.id)

    expect(resubmitted.status).toBe('assets_ready')
    expect(await repo.getCreditBalance(userId)).toBe(19)

    const ledger = await repo.listCreditLedger(userId)
    expect(ledger.filter((entry) => entry.reason === 'asset_generation' && entry.delta < 0)).toHaveLength(1)
  })

  it('counts recent usage events without loading the full event history', async () => {
    const repo = memoryHudforgeRepository({ initialCredits: 25 })
    const userId = 'count_user'
    const now = Date.now()

    await repo.recordUsageEvent(userId, { name: 'prompt_optimized', metadata: { stage: 'optimizer' } })
    await repo.recordUsageEvent(userId, { name: 'assets_generated', metadata: { stage: 'assets' } })

    const sinceIso = new Date(now - 60_000).toISOString()
    const optimizeCount = await repo.countRecentUsageEvents(userId, 'prompt_optimized', sinceIso)
    const assetCount = await repo.countRecentUsageEvents(userId, 'assets_generated', sinceIso)
    const futureCount = await repo.countRecentUsageEvents(userId, 'prompt_optimized', new Date(now + 60_000).toISOString())

    expect(optimizeCount).toBe(1)
    expect(assetCount).toBe(1)
    expect(futureCount).toBe(0)
  })
})
