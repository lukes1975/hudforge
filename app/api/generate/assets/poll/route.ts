import { hudforgeError, hudforgeJson, requireHudforgeUser } from '@/lib/hudforge-api'
import { pollAssetsForGeneration } from '@/lib/hudforge-generation'

export async function POST(request: Request) {
  try {
    const userId = await requireHudforgeUser()
    const body = (await request.json()) as { generation_id?: unknown; generationId?: unknown }
    const generationId = typeof body.generation_id === 'string' ? body.generation_id : typeof body.generationId === 'string' ? body.generationId : ''
    const result = await pollAssetsForGeneration(userId, generationId)

    return hudforgeJson({
      generation: result.generation,
      generation_id: result.generation.id,
      status: result.done ? result.generation.asset_bundle?.status ?? result.generation.status : 'assets_generating',
      completed: result.completed,
      pending: result.pending,
      failed: result.failed,
      done: result.done,
      assets: result.generation.asset_bundle?.assets ?? result.completed,
      errors: result.generation.asset_bundle?.errors ?? [],
      asset_bundle: result.generation.asset_bundle,
    })
  } catch (error) {
    return hudforgeError(error, 'Asset polling failed')
  }
}
