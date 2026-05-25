import { hudforgeError, hudforgeJson, requireHudforgeUser } from '@/lib/hudforge-api'
import { getLemonSqueezyCustomerPortalUrlForUser } from '@/lib/hudforge-generation'

export async function GET() {
  try {
    const userId = await requireHudforgeUser()
    const portal = await getLemonSqueezyCustomerPortalUrlForUser(userId)
    return hudforgeJson({ portal_url: portal.portal_url })
  } catch (error) {
    return hudforgeError(error, 'Failed to load customer portal')
  }
}
