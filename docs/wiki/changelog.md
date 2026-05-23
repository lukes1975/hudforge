# HUDForge Wiki Change Log

Simple record of meaningful changes.

## 2026-05-23 — ZIP export and Roblox import guide added

Changed:

- Replaced `json_payload` export as the primary package format with a real dependency-free ZIP archive.
- Export packages now include `manifest.json`, `layout.json`, `code/MainUI.lua`, `assets/assets.json`, and `README_IMPORT.md`.
- Added ZIP base64 download payload, filename, and byte size.
- Updated the Generate page download button to download the ZIP directly.
- Polished the Roblox Studio import guide with concrete upload/replacement steps.

Why it matters:

- A downloadable ZIP feels like a real SaaS output instead of an internal API response.
- Roblox creators can now inspect files, copy Luau, and follow import steps without guessing.
- This improves activation before the later Roblox Studio plugin exists.

Verification:

- Added ZIP export tests.
- Targeted export tests passed.
- Local API smoke returned `package.format = "zip"`, `.zip` filename, base64 ZIP URL, 5 files, and byte size.

Follow-up:

- Add cost tracking next, then Lemon Squeezy checkout/webhooks.

## 2026-05-23 — Real OpenRouter/Gemini optimizer added

Changed:

- Added OpenRouter Gemini 2.5 Flash optimizer provider.
- Wired the generation service to use the real optimizer when `OPENROUTER_API_KEY` is configured.
- Added strict JSON parsing and normalization for provider output.
- Kept deterministic backend generation for Luau/export structure so raw LLM text is not used as executable code.
- Added local smoke script for OpenRouter optimizer.

Why it matters:

- Prompt optimization is no longer just deterministic mock logic when the provider key exists.
- HUDForge can interpret Roblox UI prompts with a real LLM while preserving a safe fixed 5-asset generation bundle.
- The provider integration is cost-controlled and schema-validated before FAL asset generation.

Verification:

- Added OpenRouter optimizer tests.
- Live OpenRouter smoke passed with 5 asset prompts, mobile canvas, and generated Lua instance tree.

Follow-up:

- Surface provider/cost metadata in durable analytics after cost tracking is added.

## 2026-05-23 — Durable analytics moved to HUDForge SaaS tables

Changed:

- Replaced stale analytics helpers that referenced deleted legacy tables.
- Added a durable analytics summary from `waitlist` and `hudforge_*` tables.
- Added `/api/analytics/summary` for authenticated analytics reads.
- Updated `/dashboard` to show 30-day funnel and generation/credit metrics.
- Reworked the old alert panel into a product-health panel backed by the new summary.

Why it matters:

- The dashboard now reflects the actual SaaS loop instead of fake/legacy MRR tables.
- Analytics now measures what matters before billing is live: waitlist, signup, generation, export, credits, failures, and paid state readiness.
- This avoids accidentally rebuilding on deleted/stale database tables.

Verification:

- Added tests for analytics summary math and legacy-table avoidance.
- Full gate passed: lint, type-check, tests, build.
- Local authenticated smoke passed for `/dashboard` and `/api/analytics/summary` using E2E auth bypass.

Follow-up:

- When Lemon Squeezy is implemented, write subscription/payment events into `hudforge_subscriptions` and `hudforge_credit_ledger` so paid conversion metrics become real.

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
