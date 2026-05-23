import { hudforgeError, hudforgeJson, requireHudforgeUser } from '@/lib/hudforge-api'
import { createAssetsForGeneration } from '@/lib/hudforge-generation'

export async function POST(request: Request) {
  try {
    const userId = await requireHudforgeUser()
    const body = (await request.json()) as { generation_id?: unknown; generationId?: unknown }
    const generationId = typeof body.generation_id === 'string' ? body.generation_id : typeof body.generationId === 'string' ? body.generationId : ''
    const generation = await createAssetsForGeneration(userId, generationId)
    return hudforgeJson({
      generation,
      generation_id: generation.id,
      status: generation.asset_bundle?.status ?? generation.status,
      assets: generation.asset_bundle?.assets ?? [],
      errors: generation.asset_bundle?.errors ?? [],
      asset_bundle: generation.asset_bundle,
    })
  } catch (error) {
    return hudforgeError(error, 'Asset generation failed')
  }
}
