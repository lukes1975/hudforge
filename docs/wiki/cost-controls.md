# Cost Controls and Rate Limits

HUDForge now records provider cost estimates and enforces basic per-user rate limits before expensive provider calls.

## Why this exists

The product cannot offer expensive unlimited generation before payment and credits are fully live. Cost tracking protects margin and makes billing decisions measurable instead of guessed.

## Current estimates

These are conservative internal estimates used for metadata and dashboards, not user-facing billing amounts.

| Stage | Provider path | Estimated cost |
| --- | --- | ---: |
| Prompt optimizer | OpenRouter Gemini / deterministic local fallback | `$0.001` per optimization |
| Asset bundle | FAL image generation, fixed 5 assets | `$0.125` per bundle |

The FAL estimate assumes `$0.025` per generated asset × 5 required assets.

## Rate limits

Default service-level limits:

| Stage | Limit |
| --- | ---: |
| Optimizer | 12 per user per hour |
| Asset bundle generation | 4 bundles per user per hour |

Rate limiting happens before credit debit and before provider calls.

## What gets recorded

Usage events now include cost metadata:

```json
{
  "provider": "openrouter_or_mock",
  "cost_stage": "optimizer",
  "estimated_cost_usd": 0.001
}
```

```json
{
  "provider": "fal",
  "cost_stage": "asset_bundle",
  "estimated_cost_usd": 0.125,
  "asset_count": 5
}
```

Credit ledger debits also receive matching metadata so cost can be reconciled against credit consumption.

## Rate limit errors

Rate-limited requests return:

```json
{
  "success": false,
  "error": {
    "code": "rate_limited",
    "message": "Rate limit reached for optimizer. Try again later.",
    "details": {
      "stage": "optimizer",
      "limit": 12,
      "used": 12,
      "window_seconds": 3600
    }
  }
}
```

## Current limitation

This uses the existing `hudforge_usage_events.metadata` JSON column and does not require a schema migration. Later, if finance reporting needs stronger guarantees, add a dedicated provider cost ledger table.

## Next billing step

Connect Lemon Squeezy plans/webhooks after this. Cost metadata now gives the minimum protection needed to prevent margin-blind generation usage.
