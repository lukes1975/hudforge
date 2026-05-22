# Authenticated Generation Foundation

HUDForge's authenticated app is centered on the Roblox UI generation loop: prompt, optimized spec, asset bundle, preview, export, and history.

## Routes

Public marketing routes stay public. Clerk proxy protection covers `/dashboard`, `/generate`, `/projects`, `/settings`, `/billing`, and the authenticated generation/support APIs.

The primary product route is `/generate`. `/dashboard` points users into that loop, while `/projects`, `/settings`, and `/billing` support history, preferences, and paid-conversion readiness.

## APIs

- `POST /api/generate/optimize` creates a deterministic Roblox UI layout spec from a prompt.
- `POST /api/generate/assets` attaches deterministic SVG mock assets.
- `POST /api/generate/export` creates a `json_payload` export package.
- `GET /api/generations` returns mock in-memory history for the signed-in user.
- `POST /api/usage/event` records typed usage events in memory.
- `GET+POST /api/settings` returns and updates mock generation defaults.
- `GET /api/billing/status` returns Lemon Squeezy-ready mock billing status.

## Shared Types

Shared generation, layout, asset, export, usage, settings, and billing types live in `lib/hudforge-generation.ts`. The required generation statuses are:

`idle`, `optimizing`, `optimized`, `generating_assets`, `assets_ready`, `preview_ready`, `exporting`, `exported`, `failed`.

## Provider Strategy

The foundation is mock-safe. It reads only the presence of optional provider keys and never requires them:

- `GEMINI_API_KEY` can later enable a real prompt optimizer.
- `FAL_KEY` can later enable real asset generation.
- Lemon Squeezy keys can later enable checkout/status.

Until durable tables are added, generation history, settings, billing usage, and usage events use typed in-memory services. This keeps local development and previews from depending on production secrets or migrations.

## Export Package

Exports use `json_payload` rather than a ZIP dependency. The package includes:

- `manifest.json`
- `layout.json`
- `code/MainUI.lua`
- `assets/assets.json`

`code/MainUI.lua` is generated deterministically from the shared layout spec so tests can validate structure without external providers.
