import { describe, expect, it, vi } from 'vitest'
import {
  createOpenRouterOptimizer,
  createRepositoryBackedHudforgeService,
  HudforgeServiceError,
  memoryHudforgeRepository,
  parseOpenRouterOptimizedSpec,
  type OptimizedGenerationSpec,
} from '../lib/hudforge-generation'

const validPayload = {
  intent_summary: 'Premium Roblox shop UI for a simulator with readable mobile layout.',
  layout_spec: {
    canvas: { target: 'mobile', width: 390, height: 844, safe_area: true },
    nodes: [
      {
        id: 'main_frame',
        type: 'Frame',
        name: 'MainFrame',
        asset_ref: 'main_frame',
        position: { x_scale: 0.5, x_offset: -175, y_scale: 0.5, y_offset: -245 },
        size: { x_scale: 0, x_offset: 350, y_scale: 0, y_offset: 490 },
        z_index: 2,
        text: null,
        children: [],
      },
    ],
  },
  image_prompts: {
    main_frame: { prompt: 'Transparent premium Roblox shop main frame', negative_prompt: 'watermark, unreadable text', transparent: true, intended_use: 'panel' },
    primary_button: { prompt: 'Primary Roblox buy button with no baked text', negative_prompt: 'text, watermark', transparent: true, intended_use: 'button' },
    secondary_button: { prompt: 'Secondary close button with no baked text', negative_prompt: 'text, watermark', transparent: true, intended_use: 'button' },
    currency_icon: { prompt: 'Roblox coin currency icon transparent', negative_prompt: 'text, watermark', transparent: true, intended_use: 'icon' },
    background_panel: { prompt: 'Soft Roblox shop background panel', negative_prompt: 'watermark', transparent: false, intended_use: 'background' },
  },
}

describe('OpenRouter DeepSeek optimizer', () => {
  it('parses model JSON and normalizes it into the required HUDForge spec shape', () => {
    const spec = parseOpenRouterOptimizedSpec(JSON.stringify(validPayload), {
      generation_id: 'gen_openrouter_test',
      prompt: 'premium simulator shop',
      ui_type: 'shop_ui',
      style: 'premium',
      mobile_first: true,
    })

    expect(spec.generation_id).toBe('gen_openrouter_test')
    expect(spec.ui_type).toBe('shop_ui')
    expect(spec.style).toBe('premium')
    expect(spec.asset_list).toEqual(['main_frame', 'primary_button', 'secondary_button', 'currency_icon', 'background_panel'])
    expect(Object.keys(spec.image_prompts)).toEqual(['main_frame', 'primary_button', 'secondary_button', 'currency_icon', 'background_panel'])
    expect(spec.lua_spec.root_instances.some((instance) => instance.name === 'MainFrame')).toBe(true)
    expect(spec.constraints).toEqual({
      mobile_friendly: true,
      roblox_native: true,
      transparent_assets_preferred: true,
      deterministic_export_required: true,
    })
  })

  it('rejects invalid provider JSON instead of silently accepting a bad spec', () => {
    expect(() =>
      parseOpenRouterOptimizedSpec('{"layout_spec":{"nodes":[]},"image_prompts":{}}', {
        generation_id: 'gen_bad',
        prompt: 'bad',
        ui_type: 'hud',
        style: 'neon',
        mobile_first: true,
      })
    ).toThrow(HudforgeServiceError)
  })

  it('calls OpenRouter chat completions with DeepSeek and a detailed system prompt', async () => {
    const fetchImpl = vi.fn(async () =>
      new Response(
        JSON.stringify({
          choices: [{ message: { content: `Here is the JSON:\n\`\`\`json\n${JSON.stringify(validPayload)}\n\`\`\`` } }],
          usage: { total_tokens: 1234 },
        }),
        { status: 200, headers: { 'content-type': 'application/json' } }
      )
    )
    const optimizer = createOpenRouterOptimizer({ apiKey: 'test-openrouter-key', fetchImpl })

    const spec = await optimizer({
      generation_id: 'gen_provider',
      prompt: 'premium simulator shop',
      ui_type: 'shop_ui',
      style: 'premium',
      user_settings: { default_export_format: 'zip', mobile_first: true, default_ui_type: 'shop_ui', default_style: 'premium', save_history: true },
    })

    expect(fetchImpl).toHaveBeenCalledWith(
      'https://openrouter.ai/api/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer test-openrouter-key' }),
      })
    )
    const calls = fetchImpl.mock.calls as unknown as Array<[string, RequestInit]>
    const body = JSON.parse(calls[0][1].body as string)
    expect(body.model).toBe('deepseek/deepseek-chat')
    expect(body.response_format).toEqual({ type: 'json_object' })
    expect(body.messages[0].role).toBe('system')
    expect(body.messages[0].content.length).toBeGreaterThanOrEqual(800)
    expect(body.messages[0].content).toContain('Roblox game-world UI')
    expect(body.messages[0].content).toContain('main_frame')
    const userPayload = JSON.parse(body.messages[1].content)
    expect(userPayload.output_skeleton).toBeDefined()
    expect(userPayload.export_constraints).toContain('HUDForge generates Luau deterministically server-side — do NOT output lua_spec or any Luau code.')
    expect(spec.generation_id).toBe('gen_provider')
  })

  it('respects OPENROUTER_MODEL override when passed explicitly', async () => {
    const fetchImpl = vi.fn(async () =>
      new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify(validPayload) } }] }), { status: 200 })
    )
    const optimizer = createOpenRouterOptimizer({ apiKey: 'test-key', model: 'custom/model-id', fetchImpl })
    await optimizer({
      generation_id: 'gen_override',
      prompt: 'neon hud',
      ui_type: 'hud',
      style: 'neon',
      user_settings: { default_export_format: 'zip', mobile_first: true, default_ui_type: 'hud', default_style: 'neon', save_history: true },
    })
    const calls = fetchImpl.mock.calls as unknown as Array<[string, RequestInit]>
    const body = JSON.parse(calls[0][1].body as string)
    expect(body.model).toBe('custom/model-id')
  })

  it('lets the generation service use an injected real optimizer provider', async () => {
    const optimizerProvider = vi.fn(async (input): Promise<OptimizedGenerationSpec> =>
      parseOpenRouterOptimizedSpec(JSON.stringify(validPayload), {
        generation_id: input.generation_id,
        prompt: input.prompt,
        ui_type: input.ui_type,
        style: input.style,
        mobile_first: input.user_settings.mobile_first,
      })
    )
    const service = createRepositoryBackedHudforgeService(memoryHudforgeRepository(), { optimizerProvider })

    const generation = await service.createOptimizedGeneration('user_openrouter', {
      prompt: 'premium simulator shop',
      ui_type: 'shop_ui',
      style: 'premium',
    })

    expect(optimizerProvider).toHaveBeenCalledOnce()
    expect(generation.optimized_spec?.intent_summary).toContain('Premium Roblox shop UI')
    expect(generation.status).toBe('optimized')
  })
})
