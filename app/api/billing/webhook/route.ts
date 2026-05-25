import { hudforgeError, hudforgeJson } from '@/lib/hudforge-api'
import { handleLemonSqueezyWebhook, supabaseHudforgeRepository } from '@/lib/hudforge-generation'

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-signature')
    const result = await handleLemonSqueezyWebhook(supabaseHudforgeRepository(), body, signature)
    return hudforgeJson({ webhook: result })
  } catch (error) {
    return hudforgeError(error, 'Failed to process Lemon Squeezy webhook', {
      tags: { route: 'billing/webhook' },
      level: 'error',
    })
  }
}
