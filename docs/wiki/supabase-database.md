# Supabase Database

Supabase stores the durable SaaS data for HUDForge.

## Linked project

- Project name: `hudforge-waitlist-live`
- Project ref: `dauhewahzjrvrszemclj`

## Tables kept in the live database

The live database is now intentionally small. It keeps only:

- `waitlist`
- `hudforge_profiles`
- `hudforge_generations`
- `hudforge_user_settings`
- `hudforge_usage_events`
- `hudforge_credit_ledger`
- `hudforge_subscriptions`

Old generic analytics/billing tables were removed because HUDForge now uses the `hudforge_*` SaaS model.


## What each table is for

### `hudforge_profiles`

Stores one row per app user. Uses Clerk user IDs.

### `hudforge_generations`

Stores each generated UI project, including prompt, status, optimized spec, asset bundle, export package, and errors.

### `hudforge_user_settings`

Stores user defaults such as export format, mobile-first preference, default UI type, and default style.

### `hudforge_usage_events`

Stores product events for analytics and debugging.

### `hudforge_credit_ledger`

Stores credit grants, debits, and refunds. This is the foundation for paid usage.

### `hudforge_subscriptions`

Stores billing/subscription state for future Lemon Squeezy integration.

## Security model

Row Level Security is enabled.

The browser should not directly access these tables yet because HUDForge uses Clerk user IDs, not Supabase Auth user IDs.

The Next.js server routes access Supabase using `SUPABASE_SERVICE_ROLE_KEY`.

## Migration note

The first migration attempt failed because `uuid_generate_v4()` was unavailable. The schema now uses Supabase-safe `gen_random_uuid()` from `pgcrypto`.

## Verification already completed

- All six tables returned `200` through Supabase REST.
- Insert/delete smoke test passed:
  - profile insert
  - generation insert
  - credit ledger insert
  - settings insert
  - usage event insert
  - cascade cleanup
