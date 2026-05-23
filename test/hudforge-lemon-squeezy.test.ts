import { createHmac } from 'node:crypto'
import { describe, expect, it, vi } from 'vitest'
import {
  createLemonSqueezyCheckout,
  createRepositoryBackedHudforgeService,
  handleLemonSqueezyWebhook,
  memoryHudforgeRepository,
  verifyLemonSqueezySignature,
} from '../lib/hudforge-generation'

function signedBody(body: string, secret: string) {
  return createHmac('sha256', secret).update(body).digest('hex')
}

describe('Lemon Squeezy billing integration', () => {
  it('creates a checkout URL with user and plan custom data', async () => {
    const fetchImpl = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body))
      expect(body.data.attributes.checkout_data.custom.user_id).toBe('checkout_user')
      expect(body.data.attributes.checkout_data.custom.plan_id).toBe('starter')
      expect(body.data.relationships.store.data.id).toBe('store_123')
      expect(body.data.relationships.variant.data.id).toBe('variant_starter')
      return new Response(JSON.stringify({ data: { attributes: { url: 'https://checkout.lemonsqueezy.com/buy/test' } } }), { status: 201 })
    })

    const result = await createLemonSqueezyCheckout('checkout_user', 'starter', {
      apiKey: 'ls_test_key',
      storeId: 'store_123',
      variantIds: { starter: 'variant_starter', pro: 'variant_pro' },
      siteUrl: 'https://www.hudforge.app',
      fetchImpl,
    })

    expect(result).toEqual({ checkout_url: 'https://checkout.lemonsqueezy.com/buy/test', plan_id: 'starter' })
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })

  it('verifies Lemon Squeezy webhook HMAC signatures', async () => {
    const body = JSON.stringify({ meta: { event_name: 'subscription_created' } })
    const signature = signedBody(body, 'webhook_secret')

    await expect(verifyLemonSqueezySignature(body, signature, 'webhook_secret')).resolves.toBe(true)
    await expect(verifyLemonSqueezySignature(body, 'bad_signature', 'webhook_secret')).rejects.toMatchObject({ code: 'invalid_webhook_signature', status: 401 })
  })

  it('grants paid credits from a valid webhook exactly once', async () => {
    const repo = memoryHudforgeRepository({ initialCredits: 25 })
    const service = createRepositoryBackedHudforgeService(repo)
    const body = JSON.stringify({
      meta: {
        event_name: 'subscription_created',
        custom_data: { user_id: 'paid_user', plan_id: 'starter' },
      },
      data: {
        id: 'sub_123',
        attributes: {
          status: 'active',
          customer_id: 987,
          variant_id: 654,
          renews_at: '2026-06-23T00:00:00Z',
        },
      },
    })
    const signature = signedBody(body, 'webhook_secret')

    const first = await handleLemonSqueezyWebhook(repo, body, signature, 'webhook_secret')
    const second = await handleLemonSqueezyWebhook(repo, body, signature, 'webhook_secret')

    expect(first).toMatchObject({ processed: true, user_id: 'paid_user', plan_id: 'starter', credits_granted: 150 })
    expect(second).toMatchObject({ processed: false, duplicate: true })

    const billing = await service.getBillingStatus('paid_user')
    expect(billing.state).toBe('active_paid')
    expect(billing.current_plan.id).toBe('starter')
    expect(billing.credits_remaining).toBe(175)

    const grants = (await repo.listCreditLedger('paid_user')).filter((entry) => entry.metadata?.lemon_squeezy_event_id === 'sub_123:subscription_created')
    expect(grants).toHaveLength(1)
    expect(grants[0].delta).toBe(150)
  })
})
