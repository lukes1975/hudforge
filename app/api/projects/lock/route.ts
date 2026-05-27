import { hudforgeError, hudforgeJson, requireHudforgeUser } from '@/lib/hudforge-api'
import { lockStyleForGeneration, type LockStyleInput } from '@/lib/hudforge-generation'

export async function POST(request: Request) {
  try {
    const userId = await requireHudforgeUser()
    const body = (await request.json()) as LockStyleInput
    const result = await lockStyleForGeneration(userId, body)
    return hudforgeJson(result, 201)
  } catch (error) {
    return hudforgeError(error, 'Failed to lock style')
  }
}
