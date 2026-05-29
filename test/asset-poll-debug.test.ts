import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  createRepositoryBackedHudforgeService,
  memoryHudforgeRepository,
  optimizePromptForRobloxUi,
} from '../lib/hudforge-generation'

describe('asset poll debug flow', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    delete process.env.FAL_KEY
  })

  it('completes submit and poll cycle with mocked fal queue', async () => {
    process.env.FAL_KEY = 'test-fal-key'
    const pollCounts = new Map<string, number>()

    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input)

        if (url.includes('queue.fal.run')) {
          const body = JSON.parse(String(init?.body ?? '{}')) as { prompt?: string }
          const slug = body.prompt?.slice(0, 24) ?? 'asset'
          const responseUrl = `https://fal.test/poll/${encodeURIComponent(slug)}`
          return new Response(JSON.stringify({ request_id: `req_${slug}`, response_url: responseUrl }), { status: 200 })
        }

        if (url.includes('fal.test/poll/')) {
          const count = pollCounts.get(url) ?? 0
          pollCounts.set(url, count + 1)
          if (count < 1) {
            return new Response('still in progress', { status: 400 })
          }
          return new Response(
            JSON.stringify({ images: [{ url: 'https://fal.media/files/panel.png', content_type: 'image/png' }] }),
            { status: 200 },
          )
        }

        return new Response('unexpected fetch', { status: 500 })
      }),
    )

    const repo = memoryHudforgeRepository({ initialCredits: 50 })
    const service = createRepositoryBackedHudforgeService(repo, {
      optimizerProvider: async ({ generation_id, prompt, ui_type, style, user_settings }) => ({
        ...optimizePromptForRobloxUi({ prompt, ui_type, style, user_settings }),
        generation_id,
      }),
    })

    const userId = 'asset_poll_debug_user'
    const optimized = await service.createOptimizedGeneration(userId, {
      prompt: 'Neon debug shop UI',
      ui_type: 'shop_ui',
      style: 'neon',
    })

    const submitted = await service.submitAssetsForGeneration(userId, optimized.id)
    expect(submitted.status).toBe('generating_assets')
    expect(submitted.asset_bundle?.jobs).toHaveLength(5)

    let result = await service.pollAssetsForGeneration(userId, optimized.id)
    let attempts = 0
    while (!result.done && attempts < 10) {
      result = await service.pollAssetsForGeneration(userId, optimized.id)
      attempts += 1
    }

    expect(result.done).toBe(true)
    expect(result.failed).toHaveLength(0)
    expect(result.generation.status).toBe('assets_ready')
    expect(result.completed).toHaveLength(5)
  })
})
