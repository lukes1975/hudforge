import { describe, expect, it, vi } from 'vitest'

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(async () => ({ userId: null })),
}))

vi.mock('next/headers', () => ({
  headers: vi.fn(async () => new Headers()),
}))

describe('local E2E auth bypass safety', () => {
  it('is disabled unless the explicit local env flag is set', async () => {
    vi.resetModules()
    vi.stubEnv('HUD_FORGE_E2E_AUTH_BYPASS', undefined)
    vi.stubEnv('NODE_ENV', 'development')
    const { getE2EAuthBypassUserId, isE2EAuthBypassEnabled } = await import('../lib/hudforge-auth')

    expect(isE2EAuthBypassEnabled()).toBe(false)
    expect(getE2EAuthBypassUserId('local-e2e-user')).toBeNull()
  })

  it('never enables in production even with the flag present', async () => {
    vi.resetModules()
    vi.stubEnv('HUD_FORGE_E2E_AUTH_BYPASS', '1')
    vi.stubEnv('NODE_ENV', 'production')
    const { getE2EAuthBypassUserId, isE2EAuthBypassEnabled } = await import('../lib/hudforge-auth')

    expect(isE2EAuthBypassEnabled()).toBe(false)
    expect(getE2EAuthBypassUserId('local-e2e-user')).toBeNull()
  })

  it('accepts only a safe test user header when local bypass is enabled', async () => {
    vi.resetModules()
    vi.stubEnv('HUD_FORGE_E2E_AUTH_BYPASS', '1')
    vi.stubEnv('NODE_ENV', 'test')
    const { getE2EAuthBypassHeaderName, getE2EAuthBypassUserId } = await import('../lib/hudforge-auth')

    expect(getE2EAuthBypassHeaderName()).toBe('x-hudforge-e2e-user')
    expect(getE2EAuthBypassUserId('local-e2e-user')).toBe('local-e2e-user')
    expect(getE2EAuthBypassUserId('bad user')).toBeNull()
    expect(getE2EAuthBypassUserId('../../admin')).toBeNull()
  })
})
