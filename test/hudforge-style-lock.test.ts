import { describe, expect, it } from 'vitest'
import {
  buildStyleProfileFromSpec,
  applyStyleProfileToOptimizedSpec,
  assertGenerationCanBeStyleLocked,
  STYLE_PALETTES,
} from '../lib/style-lock'
import {
  createRepositoryBackedHudforgeService,
  HudforgeServiceError,
  memoryHudforgeRepository,
  optimizePromptForRobloxUi,
  type OptimizerProviderInput,
} from '../lib/hudforge-generation'

describe('HUDForge style lock', () => {
  it('builds a style profile with palette and prompt suffix from an optimized spec', () => {
    const spec = optimizePromptForRobloxUi({ prompt: 'Neon shop UI', ui_type: 'shop_ui', style: 'neon' })
    const profile = buildStyleProfileFromSpec(spec, 'gen_test123', { premiumTier: false })

    expect(profile.style).toBe('neon')
    expect(profile.palette).toEqual(STYLE_PALETTES.neon)
    expect(profile.image_prompt_suffix).toContain('Locked HUDForge style')
    expect(profile.image_prompt_suffix).toContain(STYLE_PALETTES.neon.primary)
    expect(profile.locked_from_generation_id).toBe('gen_test123')
  })

  it('applies locked suffix to all five image prompts', () => {
    const spec = optimizePromptForRobloxUi({ prompt: 'Inventory UI', ui_type: 'inventory', style: 'cartoon' })
    const profile = buildStyleProfileFromSpec(spec, spec.generation_id, { premiumTier: true })
    const locked = applyStyleProfileToOptimizedSpec(spec, profile)

    expect(locked.style).toBe('cartoon')
    expect(locked.style_profile?.premium_tier).toBe(true)
    for (const prompt of Object.values(locked.image_prompts)) {
      expect(prompt.prompt).toContain(profile.image_prompt_suffix)
    }
  })

  it('rejects style lock on failed generations', () => {
    expect(() => assertGenerationCanBeStyleLocked('failed')).toThrow(/preview/)
    expect(() => assertGenerationCanBeStyleLocked('optimized')).toThrow(/preview/)
    expect(() => assertGenerationCanBeStyleLocked('preview_ready')).not.toThrow()
  })

  it('injects locked style when generating with project_id', async () => {
    let optimizerInput: OptimizerProviderInput | undefined
    const repo = memoryHudforgeRepository({ initialCredits: 50 })
    const service = createRepositoryBackedHudforgeService(repo, {
      optimizerProvider: async (input) => {
        optimizerInput = input
        return optimizePromptForRobloxUi({
          prompt: input.prompt,
          ui_type: input.ui_type,
          style: input.style,
          user_settings: input.user_settings,
        })
      },
    })
    const userId = 'style_lock_user'
    const first = await service.createOptimizedGeneration(userId, { prompt: 'Neon shop UI', ui_type: 'shop_ui', style: 'neon' })
    await repo.upsertGeneration({ ...first, status: 'preview_ready' })

    const { project } = await service.lockStyleForGeneration(userId, { generation_id: first.id, name: 'Neon Shop Kit' })
    expect(project.style_profile?.style).toBe('neon')

    const second = await service.createOptimizedGeneration(userId, {
      prompt: 'Inventory screen for same game',
      ui_type: 'inventory',
      style: 'cartoon',
      project_id: project.id,
    })

    expect(optimizerInput?.style_profile?.palette.primary).toBe(STYLE_PALETTES.neon.primary)
    expect(second.project_id).toBe(project.id)
    expect(second.style).toBe('neon')
    for (const prompt of Object.values(second.optimized_spec!.image_prompts)) {
      expect(prompt.prompt).toContain('Locked HUDForge style')
    }
  })

  it('behaves like today when project_id is omitted', async () => {
    const repo = memoryHudforgeRepository({ initialCredits: 25 })
    const service = createRepositoryBackedHudforgeService(repo, {
      optimizerProvider: async ({ generation_id, prompt, ui_type, style, user_settings }) => ({
        ...optimizePromptForRobloxUi({ prompt, ui_type, style, user_settings }),
        generation_id,
      }),
    })
    const generation = await service.createOptimizedGeneration('plain_user', { prompt: 'HUD overlay', ui_type: 'hud', style: 'minimal' })

    expect(generation.project_id).toBeNull()
    for (const prompt of Object.values(generation.optimized_spec!.image_prompts)) {
      expect(prompt.prompt).not.toContain('Locked HUDForge style')
    }
  })

  it('returns a clear error when locking a failed generation', async () => {
    const repo = memoryHudforgeRepository({ initialCredits: 25 })
    const service = createRepositoryBackedHudforgeService(repo)
    const userId = 'failed_lock_user'
    const generation = await service.createOptimizedGeneration(userId, { prompt: 'Broken UI', ui_type: 'shop_ui', style: 'neon' })
    await repo.upsertGeneration({ ...generation, status: 'failed', error: 'Asset generation failed' })

    await expect(service.lockStyleForGeneration(userId, { generation_id: generation.id })).rejects.toMatchObject({
      code: 'style_lock_not_allowed',
    } satisfies Partial<HudforgeServiceError>)
  })
})
