import { hudforgeError, hudforgeJson, requireHudforgeUser } from '@/lib/hudforge-api'
import { listGenerations } from '@/lib/hudforge-generation'

export async function GET() {
  try {
    const userId = await requireHudforgeUser()
    return hudforgeJson({ generations: await listGenerations(userId) })
  } catch (error) {
    return hudforgeError(error, 'Failed to list generations')
  }
}
