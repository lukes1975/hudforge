import { hudforgeError, hudforgeJson, requireHudforgeUser } from '@/lib/hudforge-api'
import { createLemonSqueezyCheckout, type BillingPlanId } from '@/lib/hudforge-generation'

export async function POST(request: Request) {
  try {
    const userId = await requireHudforgeUser()
    const body = (await request.json()) as { plan_id?: unknown; planId?: unknown }
    const planId = normalizePlanId(body.plan_id ?? body.planId)
    const checkout = await createLemonSqueezyCheckout(userId, planId)
    return hudforgeJson({ checkout })
  } catch (error) {
    return hudforgeError(error, 'Failed to create checkout')
  }
}

function normalizePlanId(value: unknown): Exclude<BillingPlanId, 'free'> {
  return value === 'pro' ? 'pro' : 'starter'
}
