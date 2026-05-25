import { hudforgeError, hudforgeJson, requireHudforgeUser } from '@/lib/hudforge-api'
import { createLemonSqueezyTopUpCheckout, HudforgeServiceError, type CreditTopUpId } from '@/lib/hudforge-generation'

export async function POST(req: Request) {
  try {
    const userId = await requireHudforgeUser()
    const body = (await req.json()) as { topup_id?: string }
    const topupId = body.topup_id as CreditTopUpId | undefined
    if (!topupId) throw new HudforgeServiceError('topup_id is required', 400, 'missing_topup_id')
    const result = await createLemonSqueezyTopUpCheckout(userId, topupId)
    return hudforgeJson({ success: true, checkout: result })
  } catch (error) {
    return hudforgeError(error, 'Failed to create top-up checkout')
  }
}
