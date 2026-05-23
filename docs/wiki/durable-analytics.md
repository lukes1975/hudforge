# Durable Analytics

HUDForge analytics now use the current SaaS tables instead of the deleted legacy analytics schema.

## Source tables

Analytics reads from:

- `waitlist`
- `hudforge_profiles`
- `hudforge_generations`
- `hudforge_usage_events`
- `hudforge_credit_ledger`
- `hudforge_subscriptions`

It does not use the old generic tables like `mrr_snapshots`, `user_sessions`, `subscriptions`, `plans`, or alert tables.

## What the summary tracks

The 30-day analytics summary includes:

- waitlist signups
- signed-up users
- users who generated a UI
- users who exported
- active paid users
- generation counts by status
- export rate
- generation success rate
- usage event counts
- credits granted/spent/refunded
- provider failure count
- product blockers

## Where it lives

- Core logic: `lib/analytics.ts`
- Dashboard wrapper: `lib/dashboard.ts`
- API route: `app/api/analytics/summary/route.ts`
- Dashboard UI: `app/dashboard/page.tsx`
- Legacy alert panel cleanup: `components/dashboard/AlertPanel.tsx`
- Tests: `test/hudforge-analytics.test.ts`

## Why this matters

This gives HUDForge a real product health view from durable app data.

It supports the SaaS loop:

```txt
waitlist → signup → generate → export → pay
```

That is more useful right now than complex MRR dashboards before billing is live.

## Current limitation

Billing is not live yet, so paid users will stay at zero until Lemon Squeezy webhook writes to `hudforge_subscriptions` and `hudforge_credit_ledger`.
