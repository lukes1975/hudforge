import { hudforgeError, hudforgeJson, requireHudforgeUser } from '@/lib/hudforge-api'
import { createOptimizedGeneration } from '@/lib/hudforge-generation'

export async function POST(request: Request) {
  try {
    const userId = await requireHudforgeUser()
    const body = await request.json()
    const generation = await createOptimizedGeneration(userId, body)
    return hudforgeJson(
      {
        generation,
        optimized_spec: generation.optimized_spec,
        generation_id: generation.id,
        ui_type: generation.ui_type,
        style: generation.style,
        status: generation.status,
      },
      201
    )
  } catch (error) {
    return hudforgeError(error, 'Prompt optimization failed')
  }
}
