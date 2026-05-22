import { hudforgeError, hudforgeJson, requireHudforgeUser } from '@/lib/hudforge-api'
import { recordUsageEvent, type HudforgeUsageEvent } from '@/lib/hudforge-generation'

export async function POST(request: Request) {
  try {
    const userId = await requireHudforgeUser()
    const body = (await request.json()) as HudforgeUsageEvent
    recordUsageEvent(userId, body)
    return hudforgeJson({ accepted: true }, 202)
  } catch (error) {
    return hudforgeError(error, 'Failed to record usage event')
  }
}
