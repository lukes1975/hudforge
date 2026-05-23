# HUDForge Wiki Change Log

Simple record of meaningful changes.

## 2026-05-23 — Removed legacy Supabase tables

Changed:

- Deleted old generic analytics/billing tables from Supabase.
- Kept only `waitlist` and the six `hudforge_*` SaaS tables.
- Deleted old analytics functions that depended on the removed tables.

Deleted tables:

- `alert_definitions`
- `alert_triggers`
- `churn_events`
- `cohort_retention`
- `feature_events`
- `mrr_snapshots`
- `plans`
- `revenue_events`
- `subscriptions`
- `user_cohorts`
- `user_sessions`
- `users`

Why it matters:

- The database is simpler and less confusing.
- Future billing/analytics work should use the `hudforge_*` tables instead of old generic tables.
- This reduces the chance of wiring new SaaS code to stale schemas.

Verification:

- Kept tables returned `200` through Supabase REST.
- Deleted tables returned `404` through Supabase REST.
- Schema dump showed only `waitlist`, six `hudforge_*` tables, and `hudforge_touch_updated_at` function remain.

Follow-up:

- Replace/remove stale code paths that import the old analytics helpers before using dashboard analytics in production.

## 2026-05-23 — Supabase generation foundation live

Changed:

- Created live Supabase tables for HUDForge generation persistence.
- Added credit ledger foundation.
- Added user settings and usage event storage.
- Verified table access through Supabase REST.
- Verified insert/delete smoke test.

Why it matters:

- HUDForge can now persist SaaS data instead of relying on temporary memory.
- This unlocks saved projects, credits, billing integration, usage tracking, and real app smoke tests.

Verification:

- Six tables returned `200` through Supabase REST.
- Smoke insert/delete passed.
- Repo checks passed: lint, type-check, tests.

Follow-up:

- Run full authenticated generation flow against the live DB.

## 2026-05-23 — FAL generation verified

Changed:

- Confirmed FAL key exists locally.
- Ran a real FAL image generation smoke test.
- Updated app config to support both `FAL_MODEL` and `FAL_IMAGE_MODEL`.

Why it matters:

- HUDForge can generate real UI assets.
- The app no longer depends on mock asset output for authenticated generation.

Verification:

- FAL queue submit succeeded.
- Polling returned a real image URL.

Follow-up:

- Test FAL through the full authenticated app API flow.
