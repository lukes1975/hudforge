# HUDForge

Roblox UI workflow platform. Generate structured UI specs, PNG asset bundles, browser previews, deterministic Luau, and downloadable ZIP exports from simple prompts.

## Setup

```bash
npm install
npm run dev
```

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in values for the providers you want live locally. The authenticated generation pipeline runs in mock-safe mode when provider keys are missing.

### Clerk (auth)

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

### Supabase (authenticated persistence)

```env
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

Generation data, credits, subscriptions, and usage events persist through the service-role repository in `lib/hudforge-generation.ts`. A public anon key is not required for the current app runtime.

### Generation providers

```env
OPENROUTER_API_KEY=
OPENROUTER_MODEL=deepseek/deepseek-chat
FAL_KEY=
FAL_MODEL=fal-ai/flux/dev
NEXT_PUBLIC_SITE_URL=https://www.hudforge.app
```

- **OpenRouter / DeepSeek** — prompt optimization into structured Roblox UI specs
- **FAL** — transparent PNG asset generation for the authenticated pipeline

### Lemon Squeezy (billing)

```env
LEMON_SQUEEZY_API_KEY=
LEMON_SQUEEZY_STORE_ID=
LEMON_SQUEEZY_STARTER_VARIANT_ID=
LEMON_SQUEEZY_PRO_VARIANT_ID=
LEMON_SQUEEZY_DEV_VARIANT_ID=
LEMON_SQUEEZY_TOPUP_250_VARIANT_ID=
LEMON_SQUEEZY_TOPUP_1000_VARIANT_ID=
LEMON_SQUEEZY_TOPUP_3000_VARIANT_ID=
LEMON_SQUEEZY_WEBHOOK_SECRET=
```

### Sentry (production error monitoring)

```env
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=
```

Optional for local source map uploads during build:

```env
SENTRY_ORG=
SENTRY_PROJECT=hudforge
```

## Authenticated app routes

- `/dashboard` — generation workbench (legacy `/generate` redirects here)
- `/projects` — generation history
- `/settings` — generation defaults
- `/billing` — plans, credit top-ups, subscription portal

## Generation APIs

- `POST /api/generate/optimize`
- `POST /api/generate/assets`
- `POST /api/generate/assets/poll`
- `GET /api/generate/assets/status`
- `POST /api/generate/export`
- `GET /api/generations`
- `GET /api/settings` / `POST /api/settings`
- `GET /api/billing/status`
- `POST /api/billing/checkout`
- `POST /api/billing/topup`
- `GET /api/billing/portal`
- `POST /api/billing/webhook`

Export returns a downloadable ZIP with `manifest.json`, `layout.json`, `code/MainUI.lua`, `assets/assets.json`, and `README_IMPORT.md`.

## Marketing routes

Public marketing pages use typed local content in `lib/marketing-content.ts`:

- `/`, `/templates`, `/how-it-works`, `/pricing`, `/blog`, `/documentation`, `/contact`, `/legal`

Primary CTAs route to `/sign-up`. Signed-in users work from `/dashboard`.

## Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS v4
- **Auth:** Clerk
- **Database:** Supabase (service role)
- **Payments:** Lemon Squeezy
- **AI:** OpenRouter (DeepSeek optimizer) + FAL (PNG assets)
- **Monitoring:** Sentry
- **Deployment:** Vercel

## Development

```bash
npm run dev
npm run type-check
npm run lint
npm run test:run
npm run build
```

## Deployment

Deploy to Vercel:

```bash
vercel
```

Or push to GitHub and connect via the Vercel dashboard. Set production env vars from the checklist in `docs/ops/paid-launch-fix-prompts.md` or your deployment runbook.

## License

MIT
