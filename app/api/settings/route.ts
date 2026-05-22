import { hudforgeError, hudforgeJson, requireHudforgeUser } from '@/lib/hudforge-api'
import { getSettings, updateSettings } from '@/lib/hudforge-generation'

export async function GET() {
  try {
    const userId = await requireHudforgeUser()
    return hudforgeJson({ settings: getSettings(userId) })
  } catch (error) {
    return hudforgeError(error, 'Failed to read settings')
  }
}

export async function POST(request: Request) {
  try {
    const userId = await requireHudforgeUser()
    const body = await request.json()
    return hudforgeJson({ settings: updateSettings(userId, body) })
  } catch (error) {
    return hudforgeError(error, 'Failed to update settings')
  }
}
