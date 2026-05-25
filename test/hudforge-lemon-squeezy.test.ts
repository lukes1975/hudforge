import { createHmac } from 'node:crypto'
import { describe, expect, it, vi } from 'vitest'
import {
  createLemonSqueezyCheckout,
  createRepositoryBackedHudforgeService,
  getLemonSqueezyCustomerPortalUrl,
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
      variantIds: { starter: 'variant_starter', pro: 'variant_pro', dev: 'variant_dev' },
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

  it('syncs subscription_created without granting monthly credits', async () => {
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

    expect(first).toMatchObject({ processed: true, user_id: 'paid_user', plan_id: 'starter', credits_granted: 0 })
    expect(second).toMatchObject({ processed: false, duplicate: true })

    const billing = await service.getBillingStatus('paid_user')
    expect(billing.state).toBe('active_paid')
    expect(billing.current_plan.id).toBe('starter')
    expect(billing.credits_remaining).toBe(25)

    const grants = (await repo.listCreditLedger('paid_user')).filter((entry) => entry.metadata?.lemon_squeezy_event_id === 'sub_123:subscription_created')
    expect(grants).toHaveLength(0)
  })

  it('grants 1000 pro credits from subscription_payment_success exactly once', async () => {
    const repo = memoryHudforgeRepository({ initialCredits: 25 })
    const service = createRepositoryBackedHudforgeService(repo)
    const body = JSON.stringify({
      meta: {
        event_name: 'subscription_payment_success',
        custom_data: { user_id: 'pro_user', plan_id: 'pro' },
      },
      data: {
        id: 'sub_456',
        attributes: {
          status: 'active',
          customer_id: 111,
          variant_id: 222,
          renews_at: '2026-07-23T00:00:00Z',
        },
      },
    })
    const signature = signedBody(body, 'webhook_secret')

    const first = await handleLemonSqueezyWebhook(repo, body, signature, 'webhook_secret')
    const second = await handleLemonSqueezyWebhook(repo, body, signature, 'webhook_secret')

    expect(first).toMatchObject({ processed: true, user_id: 'pro_user', plan_id: 'pro', credits_granted: 1000 })
    expect(second).toMatchObject({ processed: false, duplicate: true, credits_granted: 0 })

    const billing = await service.getBillingStatus('pro_user')
    expect(billing.state).toBe('active_paid')
    expect(billing.current_plan.id).toBe('pro')
    expect(billing.credits_remaining).toBe(1025)

    const grants = (await repo.listCreditLedger('pro_user')).filter((entry) => entry.metadata?.lemon_squeezy_event_id === 'sub_456:subscription_payment_success')
    expect(grants).toHaveLength(1)
    expect(grants[0].delta).toBe(1000)
  })

  it('grants 250 starter credits on subscription_payment_success renewal', async () => {
    const repo = memoryHudforgeRepository({ initialCredits: 25 })
    const body = JSON.stringify({
      meta: {
        event_name: 'subscription_payment_success',
        custom_data: { user_id: 'renewal_user', plan_id: 'starter' },
      },
      data: {
        id: 'sub_renewal',
        attributes: {
          status: 'active',
          customer_id: 333,
          variant_id: 444,
          renews_at: '2026-08-23T00:00:00Z',
        },
      },
    })
    const signature = signedBody(body, 'webhook_secret')

    const result = await handleLemonSqueezyWebhook(repo, body, signature, 'webhook_secret')
    expect(result).toMatchObject({ processed: true, credits_granted: 250 })
    expect(await repo.getCreditBalance('renewal_user')).toBe(275)
  })

  it('syncs subscription_updated without granting credits', async () => {
    const repo = memoryHudforgeRepository({ initialCredits: 25 })
    const service = createRepositoryBackedHudforgeService(repo)

    const createdBody = JSON.stringify({
      meta: { event_name: 'subscription_created', custom_data: { user_id: 'update_user', plan_id: 'starter' } },
      data: { id: 'sub_update', attributes: { status: 'active', customer_id: 77, variant_id: 88, renews_at: '2026-07-01T00:00:00Z' } },
    })
    await handleLemonSqueezyWebhook(repo, createdBody, signedBody(createdBody, 'webhook_secret'), 'webhook_secret')

    const updatedBody = JSON.stringify({
      meta: { event_name: 'subscription_updated', custom_data: { user_id: 'update_user', plan_id: 'pro' } },
      data: { id: 'sub_update', attributes: { status: 'active', customer_id: 77, variant_id: 999, renews_at: '2026-08-01T00:00:00Z' } },
    })
    const result = await handleLemonSqueezyWebhook(repo, updatedBody, signedBody(updatedBody, 'webhook_secret'), 'webhook_secret')

    expect(result).toMatchObject({ processed: true, plan_id: 'pro', credits_granted: 0 })
    const billing = await service.getBillingStatus('update_user')
    expect(billing.current_plan.id).toBe('pro')
    expect(billing.credits_remaining).toBe(25)
  })

  it('grants top-up credits from order webhook', async () => {
    const repo = memoryHudforgeRepository({ initialCredits: 25 })
    const service = createRepositoryBackedHudforgeService(repo)
    const body = JSON.stringify({
      meta: {
        event_name: 'order_created',
        custom_data: { user_id: 'topup_user', plan_id: 'topup', topup_id: 'topup_1000', credits: 1000 },
      },
      data: {
        id: 'order_789',
        attributes: { status: 'paid' },
      },
    })
    const signature = signedBody(body, 'webhook_secret')

    const first = await handleLemonSqueezyWebhook(repo, body, signature, 'webhook_secret')
    const second = await handleLemonSqueezyWebhook(repo, body, signature, 'webhook_secret')

    expect(first).toMatchObject({ processed: true, user_id: 'topup_user', plan_id: 'topup', credits_granted: 1000 })
    expect(second).toMatchObject({ processed: false, duplicate: true })

    const billing = await service.getBillingStatus('topup_user')
    expect(billing.credits_remaining).toBe(1025)
  })

  it('handles subscription_cancelled without clawing back credits', async () => {
    const repo = memoryHudforgeRepository({ initialCredits: 25 })
    const service = createRepositoryBackedHudforgeService(repo)

    const activateBody = JSON.stringify({
      meta: { event_name: 'subscription_payment_success', custom_data: { user_id: 'cancel_user', plan_id: 'starter' } },
      data: { id: 'sub_cancel_shared', attributes: { status: 'active', customer_id: 55, variant_id: 66, renews_at: '2026-07-01T00:00:00Z' } },
    })
    await handleLemonSqueezyWebhook(repo, activateBody, signedBody(activateBody, 'webhook_secret'), 'webhook_secret')

    const cancelBody = JSON.stringify({
      meta: { event_name: 'subscription_cancelled', custom_data: { user_id: 'cancel_user', plan_id: 'starter' } },
      data: { id: 'sub_cancel_shared', attributes: { status: 'cancelled', customer_id: 55, variant_id: 66, cancelled: true } },
    })
    const result = await handleLemonSqueezyWebhook(repo, cancelBody, signedBody(cancelBody, 'webhook_secret'), 'webhook_secret')

    expect(result).toMatchObject({ processed: true, credits_granted: 0 })
    const billing = await service.getBillingStatus('cancel_user')
    expect(billing.state).toBe('canceled')
    expect(billing.credits_remaining).toBe(275)

    const subscriptions = await repo.listSubscriptions('cancel_user')
    expect(subscriptions[0]?.cancel_at_period_end).toBe(true)
  })

  it('returns a signed customer portal URL from Lemon Squeezy', async () => {
    const repo = memoryHudforgeRepository({ initialCredits: 25 })
    const now = new Date().toISOString()
    await repo.upsertSubscription({
      id: 'sub_portal',
      user_id: 'portal_user',
      state: 'active_paid',
      lemon_squeezy_customer_id: 'cust_123',
      lemon_squeezy_subscription_id: 'sub_123',
      lemon_squeezy_variant_id: 'variant_starter',
      plan_id: 'starter',
      cancel_at_period_end: false,
      created_at: now,
      updated_at: now,
    })

    const fetchImpl = vi.fn(async (url: string | URL | Request) => {
      expect(String(url)).toBe('https://api.lemonsqueezy.com/v1/subscriptions/sub_123')
      return new Response(JSON.stringify({ data: { attributes: { urls: { customer_portal: 'https://store.lemonsqueezy.com/billing?signed=1' } } } }), { status: 200 })
    })

    const result = await getLemonSqueezyCustomerPortalUrl(repo, 'portal_user', { apiKey: 'ls_test_key', fetchImpl })
    expect(result).toEqual({ portal_url: 'https://store.lemonsqueezy.com/billing?signed=1' })
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })
})
