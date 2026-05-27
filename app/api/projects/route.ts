import { hudforgeError, hudforgeJson, requireHudforgeUser } from '@/lib/hudforge-api'
import { listProjects } from '@/lib/hudforge-generation'

export async function GET() {
  try {
    const userId = await requireHudforgeUser()
    return hudforgeJson({ projects: await listProjects(userId) })
  } catch (error) {
    return hudforgeError(error, 'Failed to list projects')
  }
}
