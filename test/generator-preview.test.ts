import { describe, expect, it } from 'vitest'
import {
  buildAssetUrlMap,
  buildPreviewRenderableNodes,
  countPreviewImageNodes,
  layoutBoxToPercent,
  resolvePreviewAssetUrl,
} from '../lib/generation-preview'
import { generateMockAssets, optimizePromptForRobloxUi } from '../lib/hudforge-generation'

describe('generation preview helpers', () => {
  it('maps asset names to urls', () => {
    const map = buildAssetUrlMap([
      { id: '1', name: 'main_frame', type: 'panel', url: 'https://example.com/frame.png', width: 512, height: 512, transparent: true, provider: 'mock', prompt_used: 'frame' },
      { id: '2', name: 'primary_button', type: 'button', url: 'https://example.com/button.png', width: 512, height: 512, transparent: true, provider: 'mock', prompt_used: 'button' },
    ])

    expect(map.get('main_frame')).toBe('https://example.com/frame.png')
    expect(map.get('primary_button')).toBe('https://example.com/button.png')
  })

  it('converts layout vectors to percentage box for centered main frame', () => {
    const box = layoutBoxToPercent(
      { x_scale: 0.5, x_offset: -175, y_scale: 0.5, y_offset: -245 },
      { x_scale: 0, x_offset: 350, y_scale: 0, y_offset: 490 },
      390,
      844,
    )

    expect(box.left).toBe(`${(20 / 390) * 100}%`)
    expect(box.top).toBe(`${(177 / 844) * 100}%`)
    expect(box.width).toBe(`${(350 / 390) * 100}%`)
    expect(box.height).toBe(`${(490 / 844) * 100}%`)
  })

  it('renders preview nodes with asset urls for full mock bundle', () => {
    const spec = optimizePromptForRobloxUi({
      prompt: 'Neon shop UI',
      ui_type: 'shop_ui',
      style: 'neon',
      user_settings: { default_export_format: 'zip', mobile_first: true, default_ui_type: 'shop_ui', default_style: 'neon', save_history: true },
    })
    const assets = generateMockAssets(spec)
    const nodes = buildPreviewRenderableNodes(spec.layout_spec, assets)
    const counts = countPreviewImageNodes(nodes)

    expect(counts.total).toBeGreaterThanOrEqual(4)
    expect(counts.withUrl).toBeGreaterThanOrEqual(2)
    expect(nodes.some((node) => node.assetRef === 'main_frame' && node.assetUrl)).toBe(true)
    expect(nodes.some((node) => node.assetRef === 'primary_button' && node.assetUrl)).toBe(true)
  })

  it('shows missing asset placeholders when urls are absent', () => {
    const spec = optimizePromptForRobloxUi({
      prompt: 'Inventory UI',
      ui_type: 'inventory',
      style: 'premium',
      user_settings: { default_export_format: 'zip', mobile_first: true, default_ui_type: 'inventory', default_style: 'premium', save_history: true },
    })
    const partialAssets = generateMockAssets(spec).slice(0, 3)
    const nodes = buildPreviewRenderableNodes(spec.layout_spec, partialAssets)
    const counts = countPreviewImageNodes(nodes)

    expect(counts.withUrl).toBeLessThan(counts.total)
    expect(nodes.some((node) => node.missingAsset)).toBe(true)
  })

  it('returns null for empty asset urls without throwing', () => {
    expect(resolvePreviewAssetUrl('main_frame', buildAssetUrlMap([{ id: '1', name: 'main_frame', type: 'panel', url: '', width: 1, height: 1, transparent: true, provider: 'mock', prompt_used: '' }]))).toBeNull()
  })
})
