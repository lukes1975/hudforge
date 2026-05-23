# Lemon Squeezy Billing

HUDForge now has the server-side billing path needed for paid conversion.

## What exists

Routes:

```txt
POST /api/billing/checkout
POST /api/billing/webhook
GET  /api/billing/status
```

Checkout route:

- Requires authenticated HUDForge user.
- Accepts `plan_id: "starter" | "pro"`.
- Creates a Lemon Squeezy checkout through the REST API.
- Sends custom checkout data:
  - `user_id`
  - `plan_id`
- Returns the Lemon Squeezy checkout URL.

Webhook route:

- Public route for Lemon Squeezy.
- Verifies `x-signature` using HMAC SHA-256 and `LEMON_SQUEEZY_WEBHOOK_SECRET`.
- Reads `meta.custom_data.user_id` and `meta.custom_data.plan_id`.
- Upserts the user's subscription state.
- Grants plan credits once per Lemon event.
- Rejects duplicate webhook processing by checking credit ledger metadata.

## Plans

| Plan | Price | Monthly credits |
| --- | ---: | ---: |
| Free | £0 | 25 |
| Starter | £10/mo | 150 |
| Pro | £30/mo | 600 |

## Required env vars

```txt
LEMON_SQUEEZY_API_KEY
LEMON_SQUEEZY_STORE_ID
LEMON_SQUEEZY_STARTER_VARIANT_ID
LEMON_SQUEEZY_PRO_VARIANT_ID
LEMON_SQUEEZY_WEBHOOK_SECRET
NEXT_PUBLIC_SITE_URL
```

`NEXT_PUBLIC_SITE_URL` is used for checkout redirect URLs.

## Webhook idempotency

Credit grants write ledger metadata:

```json
{
  "source": "lemon_squeezy",
  "lemon_squeezy_event_id": "sub_123:subscription_created",
  "plan_id": "starter",
  "event_name": "subscription_created"
}
```

If the same event arrives again, HUDForge returns `duplicate: true` and does not grant credits twice.

## Billing UI

The `/billing` page now:

- Shows current billing state.
- Enables upgrade buttons only when Lemon Squeezy env is configured.
- Calls `/api/billing/checkout` and redirects the browser to the returned checkout URL.

## Important limitation

This code is ready, but real checkout cannot be live until Luke configures Lemon Squeezy product/variant IDs and webhook secret in Vercel.

No secrets are committed.
