import { hudforgeError, hudforgeJson, requireHudforgeUser } from '@/lib/hudforge-api'
import { submitAssetsForGeneration } from '@/lib/hudforge-generation'

export async function POST(request: Request) {
  try {
    const userId = await requireHudforgeUser()
    const body = (await request.json()) as { generation_id?: unknown; generationId?: unknown }
    const generationId = typeof body.generation_id === 'string' ? body.generation_id : typeof body.generationId === 'string' ? body.generationId : ''
    const generation = await submitAssetsForGeneration(userId, generationId)
    const requestIds = (generation.asset_bundle?.jobs ?? []).map((job) => job.request_id).filter((id): id is string => Boolean(id))
    const isGenerating = generation.status === 'generating_assets' && (generation.asset_bundle?.jobs?.some((job) => job.status === 'pending') ?? false)

    return hudforgeJson({
      generation,
      generation_id: generation.id,
      status: isGenerating ? 'assets_generating' : generation.asset_bundle?.status ?? generation.status,
      queue_tier: generation.asset_bundle?.queue_tier ?? 'standard',
      request_ids: requestIds,
      assets: generation.asset_bundle?.assets ?? [],
      errors: generation.asset_bundle?.errors ?? [],
      asset_bundle: generation.asset_bundle,
    })
  } catch (error) {
    return hudforgeError(error, 'Asset generation failed')
  }
}
