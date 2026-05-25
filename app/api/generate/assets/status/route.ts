import { hudforgeError, hudforgeJson, requireHudforgeUser } from '@/lib/hudforge-api'
import { getAssetGenerationStatus } from '@/lib/hudforge-generation'

export async function GET(request: Request) {
  try {
    const userId = await requireHudforgeUser()
    const generationId = new URL(request.url).searchParams.get('generation_id') ?? ''
    const generation = await getAssetGenerationStatus(userId, generationId)
    const pendingJobs = generation.asset_bundle?.jobs?.filter((job) => job.status === 'pending') ?? []
    const isGenerating = generation.status === 'generating_assets' && pendingJobs.length > 0

    return hudforgeJson({
      generation,
      generation_id: generation.id,
      status: isGenerating ? 'assets_generating' : generation.asset_bundle?.status ?? generation.status,
      assets: generation.asset_bundle?.assets ?? [],
      pending: pendingJobs,
      errors: generation.asset_bundle?.errors ?? [],
      asset_bundle: generation.asset_bundle,
    })
  } catch (error) {
    return hudforgeError(error, 'Failed to fetch asset generation status')
  }
}
