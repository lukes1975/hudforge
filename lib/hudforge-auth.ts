import { auth } from '@clerk/nextjs/server'
import { headers } from 'next/headers'

const E2E_BYPASS_HEADER = 'x-hudforge-e2e-user'
const E2E_BYPASS_USER = 'local-e2e-user'

export function isE2EAuthBypassEnabled() {
  return process.env.HUD_FORGE_E2E_AUTH_BYPASS === '1' && process.env.NODE_ENV !== 'production'
}

export function getE2EAuthBypassUserId(headerValue?: string | null) {
  if (!isE2EAuthBypassEnabled()) return null
  if (!headerValue) return null
  const userId = headerValue.trim()
  if (!/^[a-zA-Z0-9_-]{3,64}$/.test(userId)) return null
  return userId
}

export function getE2EAuthBypassHeaderName() {
  return E2E_BYPASS_HEADER
}

export async function getHudforgeUserId() {
  const requestHeaders = await headers()
  const bypassUserId = getE2EAuthBypassUserId(requestHeaders.get(E2E_BYPASS_HEADER))
  if (bypassUserId) return bypassUserId

  const { userId } = await auth()
  return userId
}

export async function getHudforgeAuthState() {
  const requestHeaders = await headers()
  const bypassUserId = getE2EAuthBypassUserId(requestHeaders.get(E2E_BYPASS_HEADER))
  if (bypassUserId) {
    return { userId: bypassUserId, mode: 'local-e2e-bypass' as const }
  }

  const { userId } = await auth()
  return { userId, mode: 'clerk' as const }
}

export const localE2EUserId = E2E_BYPASS_USER
