import { hudforgeError, hudforgeJson, requireHudforgeUser } from '@/lib/hudforge-api'
import { getBillingStatus } from '@/lib/hudforge-generation'

export async function GET() {
  try {
    const userId = await requireHudforgeUser()
    return hudforgeJson({ billing: getBillingStatus(userId) })
  } catch (error) {
    return hudforgeError(error, 'Failed to load billing status')
  }
}
