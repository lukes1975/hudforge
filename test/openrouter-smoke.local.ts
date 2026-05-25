import { readFileSync, existsSync } from 'node:fs'
import { createOpenRouterOptimizer } from '../lib/hudforge-generation'

function loadEnv(path: string) {
  if (!existsSync(path)) return
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*(?:export\s+)?([A-Z0-9_]+)\s*=\s*["']?([^"'\n#]+)/)
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].trim()
  }
}

loadEnv('/home/herm/.hermes/.env')
loadEnv('.env.local')

async function main() {
  if (!process.env.OPENROUTER_API_KEY) {
    console.log(JSON.stringify({ skipped: true, reason: 'OPENROUTER_API_KEY missing' }))
    return
  }

  const optimizer = createOpenRouterOptimizer({ apiKey: process.env.OPENROUTER_API_KEY })
  const spec = await optimizer({
    generation_id: `gen_smoke_${Date.now()}`,
    prompt: 'Create a clean premium Roblox simulator shop UI with coin balance, buy button, close button, and mobile safe layout.',
    ui_type: 'shop_ui',
    style: 'premium',
    user_settings: {
      default_export_format: 'zip',
      mobile_first: true,
      default_ui_type: 'shop_ui',
      default_style: 'premium',
      save_history: true,
    },
  })

  console.log(JSON.stringify({
    ok: true,
    provider: 'openrouter',
    model: process.env.OPENROUTER_MODEL ?? 'deepseek/deepseek-chat',
    generation_id: spec.generation_id,
    asset_count: Object.keys(spec.image_prompts).length,
    node_count: spec.layout_spec.nodes.length,
    lua_instances: spec.lua_spec.root_instances.length,
    canvas: spec.layout_spec.canvas,
  }, null, 2))
}

main().catch((error) => {
  console.error(JSON.stringify({ ok: false, message: error instanceof Error ? error.message : String(error) }))
  process.exit(1)
})
