import { describe, expect, it } from 'vitest'
import {
  createRepositoryBackedHudforgeService,
  createZipArchive,
  listZipEntries,
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

describe('HUDForge ZIP export package', () => {
  it('builds a real ZIP archive containing the required Roblox import files', () => {
    const spec = optimizePromptForRobloxUi({ prompt: 'Premium simulator shop UI', ui_type: 'shop_ui', style: 'premium' })
    const archive = createZipArchive([
      { path: 'manifest.json', content: JSON.stringify({ product: 'HUDForge' }) },
      { path: 'layout.json', content: JSON.stringify(spec.layout_spec) },
      { path: 'code/MainUI.lua', content: 'return ScreenGui\n' },
      { path: 'assets/assets.json', content: JSON.stringify({ assets: [] }) },
      { path: 'README_IMPORT.md', content: '# HUDForge Roblox Studio Import\n' },
    ])

    expect(archive[0]).toBe(0x50)
    expect(archive[1]).toBe(0x4b)
    expect(listZipEntries(archive)).toEqual([
      'manifest.json',
      'layout.json',
      'code/MainUI.lua',
      'assets/assets.json',
      'README_IMPORT.md',
    ])
  })

  it('exports generation packages as zip with base64 download payload and polished import guide', async () => {
    const service = createRepositoryBackedHudforgeService(memoryHudforgeRepository(), { assetProvider: fakeFalAssetProvider })
    const optimized = await service.createOptimizedGeneration('zip_user', { prompt: 'Premium simulator shop UI', ui_type: 'shop_ui', style: 'premium' })
    await service.createAssetsForGeneration('zip_user', optimized.id)
    const exported = await service.createExportForGeneration('zip_user', optimized.id)
    const exportPackage = exported.export_package

    expect(exportPackage?.package.format).toBe('zip')
    expect(exportPackage?.filename).toMatch(/\.zip$/)
    expect(exportPackage?.download_url).toMatch(/^data:application\/zip;base64,/)
    expect(exportPackage?.zip_base64?.length).toBeGreaterThan(100)
    expect(exportPackage?.limitations).toEqual([
      'Upload generated image URLs to Roblox Creator Hub or Asset Manager, then replace rbxassetid://0 placeholders with the uploaded asset IDs.',
    ])

    const zip = Buffer.from(exportPackage?.zip_base64 ?? '', 'base64')
    expect(listZipEntries(zip)).toEqual([
      'manifest.json',
      'layout.json',
      'code/MainUI.lua',
      'assets/assets.json',
      'README_IMPORT.md',
    ])

    const readme = exportPackage?.files.find((file) => file.path === 'README_IMPORT.md')?.content ?? ''
    expect(readme).toContain('Roblox Studio quick import')
    expect(readme).toContain('Replace every rbxassetid://0 placeholder')
    expect(readme).toContain('Players.LocalPlayer.PlayerGui')
  })
})
