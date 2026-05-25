# Authenticated Generation Foundation

HUDForge's authenticated app is centered on the Roblox UI generation loop: prompt, optimized spec, asset bundle, preview, export, and history.

## Routes

Public marketing routes stay public. Clerk proxy protection covers `/dashboard`, `/projects`, `/settings`, `/billing`, and the authenticated generation/support APIs.

The primary product surface is `/dashboard`. Legacy `/generate` redirects to `/dashboard`. `/projects`, `/settings`, and `/billing` support history, preferences, and paid-conversion readiness.

## APIs

- `POST /api/generate/optimize` creates a deterministic Roblox UI layout spec from a prompt.
- `POST /api/generate/assets` debits credits and submits FAL jobs for the fixed 5-asset bundle.
- `POST /api/generate/assets/poll` polls pending FAL jobs once per request (client orchestrates retries).
- `GET /api/generate/assets/status` returns durable generation progress from the repository.
- `POST /api/generate/export` creates a downloadable ZIP export package.
- `GET /api/generations` returns persisted generation history for the signed-in user when Supabase is configured.
- `POST /api/usage/event` records typed usage events through the repository layer.
- `GET+POST /api/settings` returns and updates generation defaults through the repository layer.
- `GET /api/billing/status` returns Lemon Squeezy-ready mock billing status.

Legacy public Replicate routes (`POST /api/generate`, `GET /api/generate/[id]`) have been removed.

## Shared Types

Shared generation, layout, asset, export, usage, settings, and billing types live in `lib/hudforge-generation.ts`. The required generation statuses are:

`idle`, `optimizing`, `optimized`, `generating_assets`, `assets_ready`, `preview_ready`, `exporting`, `exported`, `failed`.

## Persistence + Credits

The authenticated generation flow now has a Supabase-backed repository path. The migration `supabase/migrations/20260523093000_hudforge_generation_persistence.sql` creates:

- `hudforge_profiles`
- `hudforge_generations`
- `hudforge_user_settings`
- `hudforge_usage_events`
- `hudforge_credit_ledger`
- `hudforge_subscriptions`

Clerk user IDs are stored as text `user_id` values; direct browser table access remains blocked by RLS and app access goes through authenticated server route handlers using `SUPABASE_SERVICE_ROLE_KEY`.

Credits are enforced before generation work:

- initial free grant: 25 credits
- prompt/spec optimization: 1 credit
- FAL asset bundle generation: 5 credits
- failed asset generation refunds the 5-credit asset debit and marks the generation failed

Cost controls are enforced before provider calls:

- optimizer: 12 requests per user per hour by default
- asset bundles: 4 bundles per user per hour by default
- optimizer usage events and credit debits include estimated provider cost metadata
- asset bundle usage events and credit debits include estimated FAL bundle cost metadata

## Provider Strategy

Prompt/spec generation uses OpenRouter (Gemini 2.5 Flash) when configured, with deterministic local structure as fallback. Asset generation is no longer silently mocked in the authenticated flow:

- `OPENROUTER_API_KEY` + `OPENROUTER_MODEL=google/gemini-2.5-flash` enables the real prompt optimizer path.
- `GEMINI_API_KEY` can also enable direct Gemini optimizer work.
- `FAL_KEY` is required for `/api/generate/assets`; missing keys return a visible `fal_not_configured` error.
- Lemon Squeezy checkout route creates paid checkout sessions when env vars are configured.
- Lemon Squeezy webhook route verifies HMAC signatures, persists paid subscription state, and grants plan credits idempotently.

Unit tests use an injected in-memory repository and fake FAL provider. Production/default route execution uses Supabase when `SUPABASE_SERVICE_ROLE_KEY` is present.

## Export Package

Exports now use a dependency-free ZIP archive. The package includes:

- `manifest.json`
- `layout.json`
- `code/MainUI.lua`
- `assets/assets.json`
- `README_IMPORT.md`

`code/MainUI.lua` is generated deterministically from the shared layout spec so tests can validate structure without external providers.

## Required ops step

The migration has been created locally but has not been pushed to the linked Supabase project in this commit. Apply it with `supabase db push` after approval because it changes the live database schema.
