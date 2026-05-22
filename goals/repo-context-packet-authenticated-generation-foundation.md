# Repo Context Packet — Authenticated Generation Foundation

Generated before implementation from live repo inspection.

## 1. Detected framework, routing, auth, package manager

- Framework: Next.js 16.2.6, App Router, React 19.2.4, TypeScript strict mode.
- Routing: `app/` directory with Next.js 16 `proxy.ts` convention. Next docs in `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md` confirm `proxy.ts` replaces middleware and may default-export a proxy function.
- Auth provider: Clerk via `@clerk/nextjs` and `@clerk/nextjs/server`.
- Auth protection currently lives in root `proxy.ts` and only protects `/dashboard(.*)`.
- Database/provider setup: Supabase client exists in `lib/supabase.ts`; linked project ref is `dauhewahzjrvrszemclj` (`hudforge-waitlist-live`). Existing Supabase client throws if public env vars are missing, which is a risk for mock-safe app routes/components importing it.
- AI/image provider currently uses Replicate in `lib/generation.ts`, with a mock SVG data URL fallback if `REPLICATE_API_TOKEN` is missing. The new brief asks for Gemini/free LLM abstraction first and FAL/FLUX abstraction for assets, both with deterministic mocks.
- Package manager: npm, lockfile present (`package-lock.json`).

## 2. Existing route map

Public routes:
- `/` -> `app/page.tsx`
- `/templates` -> `app/templates/page.tsx`
- `/templates/[id]` -> `app/templates/[id]/page.tsx`
- `/how-it-works` -> `app/how-it-works/page.tsx`
- `/pricing` -> `app/pricing/page.tsx`
- `/blog` -> `app/blog/page.tsx`
- `/blog/[slug]` -> `app/blog/[slug]/page.tsx`
- `/documentation` -> `app/documentation/page.tsx`
- `/contact` -> `app/contact/page.tsx`
- `/legal` -> `app/legal/page.tsx`
- `/legal/[slug]` -> `app/legal/[slug]/page.tsx`
- `/links` -> `app/links/page.tsx`
- `/sign-in/[[...sign-in]]` -> Clerk sign-in page
- `/sign-up/[[...sign-up]]` -> Clerk sign-up page

Authenticated/product routes currently present:
- `/dashboard` -> `app/dashboard/page.tsx`
- `/generate` -> `app/generate/page.tsx` (currently uses marketing shell, not protected app shell)

Missing required routes:
- `/projects` or `/history`
- `/settings`
- `/billing`

## 3. Existing API/service map

Existing API routes:
- `POST /api/waitlist` -> Supabase waitlist insert, server-side service role.
- `POST /api/generate` -> current Replicate/mock single-step generation.
- `GET /api/generate/[id]` -> current Replicate/mock polling.
- `POST /api/generate-hero-assets` -> marketing hero asset route.

Missing required API routes from brief:
- `POST /api/generate/optimize`
- `POST /api/generate/assets`
- `POST /api/generate/export`
- `GET /api/generations`
- `POST /api/usage/event`
- `GET /api/billing/status`
- `GET /api/settings`
- `POST /api/settings`

Existing services:
- `lib/generation.ts`: Replicate + deterministic mock image + Luau snippets, but status model is Replicate-style (`queued`, `processing`, `succeeded`, etc.), not brief state machine.
- `lib/generation-workbench.ts`: helper options/filename/regeneration helpers.
- `lib/prompts.ts`: prompt analysis and image prompt building for existing generator.
- `lib/analytics.ts` and `lib/dashboard.ts`: Supabase-backed dashboard/metrics helpers.
- `lib/fal.ts`: present but not yet inspected deeply; candidate for asset abstraction if compatible.

## 4. Existing UI/component conventions

- Styling: Tailwind CSS v4 with global design tokens in `app/globals.css`.
- Public marketing layout uses `components/marketing/MarketingShell.tsx` and marketing components.
- Dashboard components live under `components/dashboard/` and currently focus on revenue/funnel/retention analytics, not generation activation.
- Existing generator UI lives at `components/generator/GenerationWorkbench.tsx`; it is client-heavy and calls `/api/generate`, then polls `/api/generate/[id]`.
- Visual direction: dark premium SaaS/game-dev aesthetic already in landing/dashboard/generator styles (`rune-card`, `forge-button`, gradients, cyan/violet accents).

## 5. Existing env/database/provider setup

- `.env.local.example` includes Supabase, Replicate, Clerk, Lemon Squeezy, Resend.
- Local `.env.local` exists but must not be printed.
- Supabase linked metadata exists under `supabase/.temp/`.
- Existing migrations:
  - `supabase/migrations/20250514150300_analytics_tables.sql`
  - `supabase/migrations/20250522120000_waitlist_table.sql`
- No authenticated generation tables are confirmed. Build should use typed mock services first and avoid remote DB migration unless explicitly approved.

## 6. Existing scripts

From `package.json`:
- `npm run dev` -> `next dev`
- `npm run build` -> `next build`
- `npm run start` -> `next start`
- `npm run lint` -> `eslint`
- `npm run test` -> `vitest`
- `npm run test:ui` -> `vitest --ui`
- `npm run test:run` -> `vitest run`
- `npm run type-check` -> `tsc --noEmit`

## 7. Risks and likely breakpoints

- Current git state is dirty and branch `develop` is ahead of `origin/develop` by 1. Existing uncommitted work already touches dashboard, auth pages, proxy, generation, marketing, and generator files. Changes must integrate, not blindly overwrite.
- `lib/supabase.ts` throws on missing env. Any route/component importing dashboard analytics may crash if env missing; mock-safe product pages should avoid importing Supabase-dependent modules directly.
- Clerk protection only covers `/dashboard`; brief requires `/generate`, `/projects` or `/history`, `/settings`, and `/billing` protected too.
- Current `/generate` is public and marketing-shell-based; it must move into an authenticated app shell without breaking public landing routes.
- Current status machine is Replicate-style; the brief requires `idle -> optimizing -> optimized -> generating_assets -> assets_ready -> preview_ready -> exporting -> exported -> failed`.
- Current export is just Luau copy/download, not a concrete package payload containing `manifest.json`, `layout.json`, and `code/MainUI.lua`.
- Adding ZIP dependency would violate “no random dependencies”; implement JSON payload / browser-generated package first unless package tooling already exists.
- Next.js 16 docs confirm `proxy.ts` behavior; keep using proxy instead of deprecated middleware.

## 8. Exact files/areas planned for modification

Primary modifications:
- `proxy.ts` — protect all authenticated SaaS routes.
- `app/dashboard/page.tsx` — replace/reshape dashboard into generation-oriented activation dashboard.
- `app/generate/page.tsx` and `components/generator/GenerationWorkbench.tsx` — authenticated generation flow with state machine, preview, export panel.
- New app shell components under `components/app/` or equivalent.
- New routes:
  - `app/projects/page.tsx`
  - `app/settings/page.tsx`
  - `app/billing/page.tsx`
- New API routes:
  - `app/api/generate/optimize/route.ts`
  - `app/api/generate/assets/route.ts`
  - `app/api/generate/export/route.ts`
  - `app/api/generations/route.ts`
  - `app/api/usage/event/route.ts`
  - `app/api/billing/status/route.ts`
  - `app/api/settings/route.ts`
- New shared/service files under `lib/`:
  - shared types for generation, layout, assets, billing, usage, settings
  - prompt optimizer provider/mock
  - asset provider/mock
  - Luau exporter
  - export package builder
  - mock persistence/history/settings/billing/usage services
- Tests under `test/` for shared types/helpers/export/state machine/API service functions.
- Documentation:
  - `README.md`
  - `.env.local.example`
  - `docs/architecture-authenticated-generation.md` or equivalent

## Internal architecture plan

- Route map: protect `/dashboard`, `/generate`, `/projects`, `/settings`, `/billing`, and optional `/account` via `proxy.ts`; leave marketing routes public.
- Protected route strategy: Clerk `proxy.ts` route matcher for authenticated SaaS pages plus explicit server-side auth where already used where practical. API routes remain mock-safe but avoid exposing secrets; user-specific persistence is mocked until DB schema exists.
- App shell: reusable dark SaaS shell with sidebar nav, mobile top nav, top bar, account menu/sign-out, credits indicator, and page header slots.
- API route structure: implement exact brief routes using Next App Router route handlers. Keep `POST /api/generate` legacy route intact if possible for compatibility, but new UI should use staged routes.
- Provider abstractions: `lib/generation-providers.ts` or equivalent with Gemini/free LLM optimizer stub if `GEMINI_API_KEY` exists, deterministic mock otherwise; asset provider checks `FAL_KEY`, returns mock assets if absent. Do not hardcode provider logic in components.
- Shared types: centralize in `lib/hudforge-types.ts` or `lib/types/generation.ts` to prevent drift.
- Mock fallback: deterministic structured spec and SVG/data-url asset placeholders so `/generate` works without external keys.
- Data persistence: use in-memory typed store/mock seed data for generation history/settings/billing until Supabase tables are introduced. Do not push production DB migrations in this scoped build.
- Usage/billing/settings services: typed services returning mock/ready-for-integration structures. Billing clearly states Lemon Squeezy not active unless env exists.
- Export pipeline: deterministic converter from `LuaSpec` to Luau. Export route returns `json_payload` package with files: `manifest.json`, `layout.json`, `code/MainUI.lua`, and `assets/assets.json`; no fake button.
- Error/loading/empty states: client state machine preserves last prompt/spec/assets/error and exposes retry/inspection.
- Verification plan: run `npm run type-check`, `npm run test:run`, `npm run build`; if feasible start `npm run dev` background and verify key routes/API with HTTP.

## Concise task list

A. Inspection — complete.
B. Repo Context Packet — complete in this file.
C. Architecture — use the architecture plan above.
D. App shell/routes — build protected shell, extend proxy, add `/projects`, `/settings`, `/billing`.
E. Dashboard — replace analytics-first dashboard with generation activation dashboard while preserving metrics intent as secondary where useful.
F. Generate workflow — implement staged client flow with required selectors/status/preview/export/retry.
G. Backend/API services — add required route handlers.
H. Provider abstractions — Gemini/free LLM optional, FAL optional, deterministic mocks required.
I. Export pipeline — deterministic Luau + package payload.
J. Settings — mock/read/write preferences.
K. Billing — Lemon Squeezy-ready mock billing status and plan cards.
L. Projects/history — generation history from mock/in-memory service.
M. Usage/analytics — no-op/mock event wrapper and route.
N. Testing — add/update tests and run checks.
O. Documentation — update README, env example, architecture/limitations notes.
