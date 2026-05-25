# HUDForge: Paid Launch Production Fix Prompts (v2)

> **Purpose:** Sequential prompts for Cursor Composer to reach **paid launch** readiness. Feed one prompt at a time, in order.
>
> **Progress:** Prompts **1–19 are DONE** in your repo. Next: production promotion (see `docs/plans/2026-05-26-001-feat-paid-launch-may-31-plan.md` U5).
>
> **After each prompt:** `npm run type-check && npm run test:run && npm run build`

---

## Product direction (v2 — read before every prompt)

| Decision | Choice |
|----------|--------|
| Launch goal | **Paid users**, not beta/waitlist |
| Image assets | **FAL.ai only** — remove all Replicate |
| Legacy public generate | **Delete** routes + pages (Prompt 1 only auth-gated them — Prompt 9 finishes removal) |
| Waitlist | **Remove** entirely |
| Dashboard analytics | **Remove** funnel/metrics from user dashboard |
| Authenticated IA | **No separate `/generate` page** — workbench lives on `/dashboard` |
| Optimizer LLM | **DeepSeek via OpenRouter** (`deepseek/deepseek-chat` free tier) |
| Team / Studio plan | **Catalog only** — do not build workspace/seats yet |
| Pro launch price | **$49/mo** (can raise to $59 later) |

### Target pricing (USD)

**Subscriptions**

| Plan | Price | Credits/mo | Launch notes |
|------|-------|------------|--------------|
| Free | $0 | 25 (trial) | Sign-up grant only |
| Starter | **$19/mo** | ~250 | PNG export, basic Luau, limited saved projects, standard queue, reduced style consistency |
| Pro (Popular) | **$49/mo** | ~1000 | Faster queue, premium styles, project history, better export controls, future plugin access |
| Dev | **$200/mo** | TBD | Show on pricing page only — checkout can be disabled or “Contact us” |
| Team | **$1500/mo** | — | **Do not build** — omit from checkout |

**Credit top-ups (one-time)**

| Pack | Price | Credits |
|------|-------|---------|
| Small | **$9** | 250 |
| Medium | **$29** | 1000 |
| Large | **$69** | 3000 |

**Credit costs (keep unless changed in code):** optimize = 1 credit, asset bundle (5 PNGs) = 5 credits.

---

## System context (paste once at session start)

```
You are working on HUDForge — a Roblox UI generation SaaS for PAID launch.

STACK:
- Next.js 16.2.6 App Router (proxy.ts = Clerk middleware, NOT middleware.ts)
- React 19, TypeScript 5 strict, Tailwind CSS 4 (@tailwindcss/postcss, no tailwind.config)
- @clerk/nextjs ^7.3.5 — auth
- @supabase/supabase-js ^2.105.4 — server-only via SUPABASE_SERVICE_ROLE_KEY
- Vitest ^4.1.6 — unit tests in test/
- Vercel Pro — 60s serverless function timeout
- Lemon Squeezy — checkout + webhook (HMAC, idempotent credit grants)
- OpenRouter — optimizer (DeepSeek)
- FAL.ai — PNG game UI assets (flux/dev or configured FAL_MODEL)

CORE FILES:
- lib/hudforge-generation.ts — generation pipeline, billing plans, credits, FAL submit/poll, OpenRouter optimizer, Lemon Squeezy
- lib/hudforge-auth.ts — getHudforgeUserId(), E2E bypass (non-production only)
- lib/hudforge-api.ts — requireHudforgeUser(), hudforgeError(), hudforgeJson()
- lib/fetch-utils.ts — resilientFetch (retries/timeouts) [added Prompt 5]
- proxy.ts — Clerk route protection
- components/app/AppShell.tsx — authenticated shell + sidebar nav
- components/generator/GenerationWorkbench.tsx — main generation UI
- components/app/BillingPanel.tsx — billing UI

GENERATION PIPELINE (authenticated APIs only):
1. POST /api/generate/optimize — DeepSeek via OpenRouter → OptimizedGenerationSpec
2. POST /api/generate/assets — submit FAL jobs (fast)
3. POST /api/generate/assets/poll — poll FAL once per request (client loops)
4. POST /api/generate/export — ZIP + MainUI.lua

PERSISTENCE:
- Production REQUIRES SUPABASE_SERVICE_ROLE_KEY (throws if missing — Prompt 2)
- Atomic credit debit via Postgres RPC debit_credits (Prompt 3)

AUTHENTICATED ROUTES (proxy.ts):
/dashboard, /projects, /settings, /billing
/api/generate/* (optimize, assets, poll, export — NOT legacy root /api/generate)
/api/generations, /api/settings, /api/billing/status, /api/billing/checkout

PUBLIC MARKETING:
/, /pricing, /how-it-works, /templates, /blog, /documentation, /contact, /legal, /sign-in, /sign-up

RULES:
- Never expose server secrets via NEXT_PUBLIC_*
- /api/billing/webhook is public (HMAC verified) — must stay out of Clerk protect()
- Be specific in every change: name exact files, routes, env vars, and acceptance criteria
- Match existing code style; minimal scope per prompt
- Run type-check + test:run + build before finishing
```

---

## Completed prompts (1–8) — reference + retro-fixes

### ✅ PROMPT 1 — Unauthenticated cost risk (DONE)

**What was done:** Legacy `/api/generate` auth-gated via proxy + `requireHudforgeUser()`.

**Retro-fix required (Prompt 9):** User wants **full removal**, not auth-gating. Do not skip Prompt 9.

---

### ✅ PROMPT 2 — Persistence fail loudly (DONE)

Production throws if `SUPABASE_SERVICE_ROLE_KEY` missing. No action needed.

---

### ✅ PROMPT 3 — Atomic credit debit (DONE)

Postgres `debit_credits` RPC + `repository.atomicDebit()`. No action needed.

---

### ✅ PROMPT 4 — FAL timeout / client poll (DONE)

Submit + poll pattern:
- `POST /api/generate/assets` — submit jobs
- `POST /api/generate/assets/poll` — single poll pass
- `GET /api/generate/assets/status` — status read

Client polling wired in `GenerationWorkbench.tsx`. Verify in Prompt 14.

---

### ✅ PROMPT 5 — Retry + timeout (DONE)

`lib/fetch-utils.ts` + `resilientFetch` on OpenRouter/FAL calls.

---

### ✅ PROMPT 6 — Security headers (DONE)

CSP, HSTS, X-Frame-Options, etc. in `next.config.ts`.

---

### ✅ PROMPT 7 — Sentry (DONE)

`@sentry/nextjs` + configs + capture in `hudforgeError()`.

---

### ✅ PROMPT 8 — CI pipeline (DONE)

Triggers on main + develop; runs type-check, lint, test:run, build; removed broken image-quality/performance jobs.

---

## PROMPT 9: Remove legacy Replicate + public generate stack

```
CONTEXT:
Prompt 1 auth-gated the legacy Replicate API. For paid launch we use ONLY the authenticated FAL pipeline. Replicate is dead code and a maintenance/security liability.

FILES TO DELETE:
- app/api/generate/route.ts          (legacy Replicate POST — NOT optimize/assets/export)
- app/api/generate/[id]/route.ts     (legacy Replicate polling)
- lib/generation.ts                  (Replicate client, in-memory mock store, IP rate limiter)
- app/generate/page.tsx              (standalone generate page — workbench moves to dashboard in Prompt 11)

FILES TO UPDATE:
- proxy.ts — remove any matcher entries that only existed for legacy root /api/generate/[id]. Keep:
  '/api/generate/optimize(.*)', '/api/generate/assets(.*)', '/api/generate/export(.*)', '/api/generate/assets/poll(.*)', '/api/generate/assets/status(.*)'
- package.json — remove "replicate" dependency
- test/setup.ts — remove REPLICATE_API_TOKEN / REPLICATE_MODEL mocks
- .env.local.example — remove REPLICATE_API_TOKEN, REPLICATE_MODEL, REPLICATE_WEBHOOK_URL and any Replicate comments
- docs referencing Replicate — update or remove mentions in README, docs/architecture-authenticated-generation.md

SEARCH AND FIX:
- Grep for: replicate, Replicate, REPLICATE_, lib/generation, /api/generate/route (without optimize/assets/export)
- Update any marketing/docs copy that mentions Replicate
- Remove imports of lib/generation from anywhere

REDIRECT:
- app/generate/page.tsx → before delete, add app/generate/page.tsx that redirect('/dashboard') OR delete and add redirect in next.config.ts from /generate → /dashboard

ACCEPTANCE CRITERIA:
- npm run type-check && npm run test:run && npm run build pass
- No "replicate" in package.json dependencies
- GET/POST /api/generate (root) and /api/generate/[id] return 404
- /generate redirects to /dashboard
- Authenticated pipeline /api/generate/optimize|assets|export still works
```

---

## PROMPT 10: Remove waitlist system entirely

```
CONTEXT:
HUDForge is launching for paid sign-up, not waitlist capture. Remove waitlist from marketing, API, components, and dashboard metrics.

DELETE:
- app/api/waitlist/route.ts
- components/marketing/WaitlistForm.tsx
- components/Waitlist.tsx (legacy root component if unused)

UPDATE — remove waitlist UI and CTAs:
- app/page.tsx — remove WaitlistForm, waitlist sections
- app/pricing/page.tsx — replace waitlist CTAs with Sign up / Get started → /sign-up
- app/contact/page.tsx — remove waitlist form
- lib/marketing-content.ts — remove waitlist copy, CTAs, and funnel references
- components/marketing/CTASection.tsx — CTA → /sign-up or /pricing
- components/marketing/MarketingHeader.tsx — nav: Sign in + Get started (not Join waitlist)
- components/Hero.tsx, components/Pricing.tsx — if still imported anywhere, remove waitlist buttons

UPDATE — dashboard (temporary; full analytics removal in Prompt 11):
- app/dashboard/page.tsx — remove "Waitlist" MetricCard and any waitlist funnel stage display

DO NOT DROP:
- supabase/migrations/20250522120000_waitlist_table.sql (historical migration — do not delete applied migrations)
- Optional: leave waitlist table in DB unused, or add a new migration to drop table only if product owner wants — default: leave table, remove app code only

TESTS:
- Remove or update any test asserting waitlist API behavior
- Grep "waitlist" across repo; only migration/docs history should remain

ACCEPTANCE CRITERIA:
- No /api/waitlist route
- Landing + pricing drive to /sign-up
- npm run build passes
- No WaitlistForm imports in app/ or components/marketing/
```

---

## PROMPT 11: SaaS dashboard layout — merge generate into dashboard

```
CONTEXT:
Authenticated app should feel like a SaaS product: sidebar with icons, dashboard as home + primary workbench. No separate /generate nav item or page.

TARGET INFORMATION ARCHITECTURE:
Sidebar (desktop) + compact nav (mobile):
- Dashboard  (/dashboard)  — home + GenerationWorkbench embedded
- Projects   (/projects)   — generation history
- Settings   (/settings)   — user defaults
- Billing    (/billing)    — plans + credits + top-ups

Remove from nav: Generate (/generate)

TASK 1 — AppShell (components/app/AppShell.tsx):
- Update navItems to ONLY: Dashboard, Projects, Settings, Billing (remove Generate)
- Add simple inline SVG icons per item (16–20px, currentColor, no new icon library required):
  - Dashboard: grid/layout icon
  - Projects: folder/layers icon
  - Settings: gear icon
  - Billing: credit card icon
- Replace hardcoded "25" free credits sidebar card:
  - Fetch real balance from GET /api/billing/status (client component wrapper or server fetch passed as prop)
  - Show credits_remaining and current plan name
- Highlight active nav item using usePathname() — extract a small client NavLinks component if needed

TASK 2 — Dashboard page (app/dashboard/page.tsx):
- REMOVE entirely:
  - getDashboardData() / analytics funnel sections
  - MetricCards: Waitlist, Generated, Exported, Credits spent
  - "Readiness" hardcoded badges (Supabase Live, etc.)
  - "30-day SaaS funnel" section
  - activationSteps marketing cards (optional: keep ONE compact "How it works" collapsible, not 4 cards)
- ADD:
  - Import and render <GenerationWorkbench /> as the primary content (full width below a short page header)
  - Short header: "Create Roblox UI" + one-line description
  - Optional right column (desktop): recent projects snippet (last 3 from /api/generations) with link to /projects

TASK 3 — Remove /generate as standalone experience:
- Ensure app/generate/page.tsx redirects to /dashboard (from Prompt 9)
- Grep for href="/generate" in authenticated components — change to /dashboard
- Update app/dashboard/page.tsx old copy "Start with /generate" → "Create below" or similar

TASK 4 — lib/dashboard.ts:
- If only used for analytics, delete file OR strip to minimal helper for recent projects
- Remove unused analytics imports from dashboard page

ACCEPTANCE CRITERIA:
- Signed-in user lands on /dashboard and can run full optimize → assets → export without visiting /generate
- Sidebar has 4 items with icons; no Generate link
- No analytics charts or funnel metrics on dashboard
- npm run build passes
```

---

## PROMPT 12: New pricing, plans, and credit top-ups (Lemon Squeezy)

```
CONTEXT:
Replace old GBP plans (Starter £10/150, Pro £30/600) with USD paid-launch catalog. Team/Studio features are NOT built — only Starter + Pro + top-ups need working checkout.

UPDATE lib/hudforge-generation.ts:

1. Extend BillingPlanId:
   type BillingPlanId = 'free' | 'starter' | 'pro' | 'dev'
   (Do NOT add 'team' to checkout yet)

2. Replace billingPlans:
   free:    $0,   25 credits,  cta: 'Current plan'
   starter: $19/mo, 250 credits, features metadata for UI
   pro:     $49/mo, 1000 credits, mark popular: true in metadata or separate export
   dev:     $200/mo, credits TBD (e.g. 2500), checkout disabled unless LEMON_SQUEEZY_DEV_VARIANT_ID set

3. Add CreditTopUpProduct type + catalog:
   topup_250:  $9,  250 credits
   topup_1000: $29, 1000 credits
   topup_3000: $69, 3000 credits

4. Change price fields from price_gbp_monthly to price_usd_monthly (update all references, tests, BillingPanel, marketing)

5. createLemonSqueezyCheckout(userId, planId):
   - Map starter → LEMON_SQUEEZY_STARTER_VARIANT_ID
   - Map pro → LEMON_SQUEEZY_PRO_VARIANT_ID
   - Map dev → LEMON_SQUEEZY_DEV_VARIANT_ID (optional)
   - free → throw checkout_not_required

6. Add createLemonSqueezyTopUpCheckout(userId, topUpId):
   - Map to LEMON_SQUEEZY_TOPUP_250_VARIANT_ID, _1000_, _3000_
   - Pass custom_data: { user_id, plan_id: 'topup', topup_id, credits: N }

7. handleLemonSqueezyWebhook:
   - subscription_created / subscription_payment_success → grant plan credits (250 starter, 1000 pro) with idempotency
   - order_created / order_paid (one-time) → if custom_data.topup_id, grant matching credits
   - subscription_cancelled → state canceled (do not claw back spent credits)

8. Plan entitlements (store in plan metadata, enforce later — at minimum expose in BillingStatus):
   starter: { queue: 'standard', style_tier: 'basic', max_saved_projects: 10, png_export: true, luau_export: 'basic' }
   pro:     { queue: 'priority', style_tier: 'premium', max_saved_projects: 100, png_export: true, luau_export: 'full' }

NEW API ROUTE:
- app/api/billing/topup/route.ts — POST { topup_id } → createLemonSqueezyTopUpCheckout
- Add '/api/billing/topup(.*)' to proxy.ts protected routes

UPDATE components/app/BillingPanel.tsx:
- Show Starter $19, Pro $49 (badge "Popular"), Dev $200 as "Coming soon" or disabled checkout
- Section "Buy credits" with three top-up cards ($9 / $29 / $69)
- Wire Upgrade + Buy buttons to /api/billing/checkout and /api/billing/topup

UPDATE lib/marketing-content.ts + app/pricing/page.tsx:
- Public pricing page matches exact USD numbers and feature bullets from product direction
- Remove waitlist CTAs (Prompt 10)
- CTA: Start free → /sign-up, Upgrade → /sign-up then /billing

UPDATE .env.local.example:
LEMON_SQUEEZY_STARTER_VARIANT_ID=
LEMON_SQUEEZY_PRO_VARIANT_ID=
LEMON_SQUEEZY_DEV_VARIANT_ID=
LEMON_SQUEEZY_TOPUP_250_VARIANT_ID=
LEMON_SQUEEZY_TOPUP_1000_VARIANT_ID=
LEMON_SQUEEZY_TOPUP_3000_VARIANT_ID=

UPDATE test/hudforge-lemon-squeezy.test.ts for new credit amounts and top-up webhook case.

ACCEPTANCE CRITERIA:
- billingPlans reflect USD pricing above
- Billing page shows subscriptions + top-ups
- Webhook grants 250/1000 on subscription events; top-up grants correct credits
- No £ or GBP in user-facing billing UI
- npm run test:run passes
```

---

## PROMPT 13: DeepSeek optimizer + strong game-UI system prompt

```
CONTEXT:
Default optimizer model is still google/gemini-2.5-flash. Paid launch uses DeepSeek free tier on OpenRouter for cost control. System prompt must produce visually strong, clean, coherent Roblox game-world UI specs.

TASK 1 — Default model (lib/hudforge-generation.ts):
- In createOpenRouterGeminiOptimizer (consider rename to createOpenRouterOptimizer):
  const model = options.model ?? process.env.OPENROUTER_MODEL ?? 'deepseek/deepseek-chat'
- Update ProviderStatus type: llm: 'openrouter_deepseek' | 'mock' (replace openrouter_gemini where displayed)
- Update getProviderStatus() accordingly

TASK 2 — Replace buildOptimizerSystemPrompt() with a detailed prompt. Requirements:
- Role: HUDForge Roblox UI production optimizer
- Output: ONLY valid JSON matching OptimizedGenerationSpec shape
- Visual direction for image_prompts:
  - Clean readable silhouettes, strong contrast, game-world UI (not web SaaS, not photorealistic)
  - Coherent kit: frame, primary/secondary buttons, currency icon, background panel share palette and style
  - PNG-style transparent assets where intended; no baked text except abstract iconography
  - Negative prompts: watermark, blurry, photorealistic, cluttered, illegible micro-text, random characters
- Layout: mobile-safe Roblox ScreenGui, deterministic export-friendly node tree
- Five assets exactly: main_frame, primary_button, secondary_button, currency_icon, background_panel
- Respect user ui_type and style from input

TASK 3 — Enhance buildOptimizerUserPrompt():
- Include example JSON skeleton (keys only, not full content) so DeepSeek stays structured
- Pass export constraints: deterministic Luau will be generated server-side — LLM must not invent Lua

TASK 4 — Env + docs:
- .env.local.example: OPENROUTER_MODEL=deepseek/deepseek-chat
- test/hudforge-openrouter-optimizer.test.ts — update default model expectation in mocks

TASK 5 — Fallback:
- If OPENROUTER_API_KEY missing, keep deterministic buildOptimizedSpec() fallback
- Log/metadata should say provider: 'mock' not 'deepseek'

ACCEPTANCE CRITERIA:
- With OPENROUTER_API_KEY set, optimize calls use deepseek/deepseek-chat unless OPENROUTER_MODEL overrides
- System prompt is ≥800 chars of specific Roblox UI guidance (not one sentence)
- Tests pass without live API calls
```

---

## PROMPT 14: PNG asset pipeline + plan-based queue priority

```
CONTEXT:
FAL generates PNG game UI assets via submit/poll (Prompt 4). Ensure PNG output, proper error messages, and queue behavior tied to plan tier (standard vs priority).

TASK 1 — FAL PNG output (lib/hudforge-generation.ts):
- In submitAllFalJobs / buildFalAssetPrompt:
  - Request PNG output explicitly if FAL API supports format param for fal-ai/flux/dev
  - Ensure buildFalAssetPrompt emphasizes: transparent PNG, isolated UI element, crisp edges, game HUD asset
- GeneratedAsset: confirm url points to PNG; transparent flag respected in export zip

TASK 2 — Plan-based queue (lib/hudforge-generation.ts):
- Add getQueueTierForUser(userId): 'standard' | 'priority'
  - pro/active_paid → priority
  - starter/free → standard
- In submitAssetsForGeneration:
  - standard: submit FAL jobs sequentially with 200ms gap (reduce burst)
  - priority: submit with Promise.all (parallel submit) — poll still client-driven
- Expose queue_tier in API responses from /api/generate/assets submit endpoint

TASK 3 — Client (GenerationWorkbench.tsx):
- Show queue label: "Standard queue" or "Priority queue" during asset generation
- Poll interval: standard 4s, priority 2s (client-side)
- Progress: "Asset 3/5 ready" from poll response

TASK 4 — Rate limits by plan (enforceRateLimit):
- starter/free: keep DEFAULT_RATE_LIMITS (optimize 12/hr, assets 4/hr)
- pro: higher limits (e.g. optimize 30/hr, assets 12/hr) — constants in hudforge-generation.ts

TASK 5 — Tests:
- test/hudforge-generation.test.ts — queue tier selection
- Mock FAL; no live API required

ACCEPTANCE CRITERIA:
- Asset bundle returns PNG URLs
- Pro users get priority queue behavior visible in UI
- Each server poll/submit handler completes in <15s
- npm run test:run passes
```

---

## PROMPT 15: Legal pages + marketing compliance copy

```
CONTEXT:
Legal markdown exists under legal/ and renders via app/legal/[slug]/page.tsx. app/legal/page.tsx warns policies need finalization. Update for paid SaaS: subscriptions, credits, AI output, Lemon Squeezy billing.

TASK 1 — Update legal markdown files (legal/*.md):
- terms.md — subscription plans, credit usage, acceptable use, account termination, limit of liability
- privacy.md — Clerk auth, Supabase storage, FAL/OpenRouter processing, Lemon Squeezy payments, Sentry errors; remove waitlist-specific collection language
- refunds.md — monthly subscriptions, credit top-ups non-refundable except billing errors, cancellation at period end
- ai-disclaimer.md — generated UI/assets are starting points; user responsible for Roblox compliance
- acceptable-use.md — no abuse of generation APIs, no circumventing credits
- cookies.md — Clerk session, optional GA4
- pricing references: USD, Starter $19, Pro $49, top-ups $9/$29/$69

TASK 2 — app/legal/page.tsx:
- Remove "needs finalization before launch" warning banner OR replace with "Last updated: [month year]"
- Ensure all 7 docs listed with descriptions

TASK 3 — Marketing footer (components/marketing/MarketingHeader.tsx or shared footer):
- Links: Terms, Privacy, Refunds, AI Disclaimer
- app/page.tsx footer section — same legal links

TASK 4 — app/pricing/page.tsx:
- Footnote: "Prices in USD. Billed via Lemon Squeezy. See Refund Policy."

DO NOT invent a lawyer-approved document — use clear plain English suitable for indie SaaS launch; mark "Last updated" dates.

ACCEPTANCE CRITERIA:
- All legal routes render without placeholder warnings
- No waitlist mentioned in legal docs
- Pricing page and legal docs agree on USD amounts
- npm run build passes
```

---

## PROMPT 16: Client recovery, idempotency, rate limiter performance

```
CONTEXT:
Combine reliability work: resume interrupted generations, prevent double-charge, fix O(n) rate limit queries. Waitlist rate limiting is N/A (waitlist removed).

TASK 1 — Generation recovery (components/generator/GenerationWorkbench.tsx):
- On mount: GET /api/generations
- If latest generation has status optimized | assets_generating: show banner "Resume generation?" 
- Resume: restore generation_id + spec, start poll loop against /api/generate/assets/poll

TASK 2 — Double-submit guard:
- useRef isSubmitting + disable primary button while status !== idle/complete/failed
- crypto.randomUUID() per new generation → header X-Idempotency-Key on optimize + assets requests

TASK 3 — Server idempotency (lib/hudforge-generation.ts):
- Store idempotency_key in generation.metadata
- createOptimizedGeneration: if same user + key exists, return existing generation (no second debit)
- submitAssetsForGeneration: if assets_ready, return without debiting again

TASK 4 — Rate limiter performance (supabaseHudforgeRepository):
- Add countRecentUsageEvents(userId, eventName, sinceIso) with Supabase .gte('created_at', since)
- enforceRateLimit uses count method instead of loading all events

TASK 5 — Tests for idempotency + countRecentUsageEvents

ACCEPTANCE CRITERIA:
- Duplicate optimize with same idempotency key does not double-debit
- Refresh mid-generation shows recovery banner
- npm run test:run passes
```

---

## PROMPT 17: Billing lifecycle — renewals, portal, top-up E2E

```
CONTEXT:
Prompt 12 added top-ups and new plans. Finish subscription lifecycle for paid launch.

TASK 1 — proxy.ts protected routes (verify/add):
- /api/billing/checkout(.*)
- /api/billing/topup(.*)
- /api/billing/portal(.*)
- NOT /api/billing/webhook

TASK 2 — handleLemonSqueezyWebhook (lib/hudforge-generation.ts):
- subscription_payment_success → grant monthly credits (250 or 1000) with idempotency via lemon event id in ledger metadata
- subscription_updated → sync state + plan_id
- subscription_cancelled → state canceled, cancel_at_period_end
- One-time order paid → top-up credits per Prompt 12

TASK 3 — Customer portal:
- getLemonSqueezyCustomerPortalUrl(userId) — lookup lemon_squeezy_customer_id from hudforge_subscriptions
- app/api/billing/portal/route.ts GET → { portal_url }
- BillingPanel: "Manage subscription" button when state is active_paid or trial

TASK 4 — AppShell credits card:
- Server-side or client fetch from /api/billing/status on load
- Display credits_remaining + plan name (replace any remaining hardcoded "25")

ACCEPTANCE CRITERIA:
- Webhook test events grant credits once per event id
- Active subscriber sees Manage subscription link
- npm run test:run passes
```

---

## PROMPT 18: Error boundaries + SaaS error pages

```
CONTEXT:
Paid users need graceful failures, not white screens.

CREATE:
- app/error.tsx — global error boundary, dark theme, Try again, Sentry.captureException
- app/not-found.tsx — 404 with link home
- app/global-error.tsx — root layout failures
- app/dashboard/error.tsx — "Generation failed" + link to /projects (NOT /generate)

REMOVE or skip:
- app/generate/error.tsx — /generate redirects to dashboard; use dashboard error boundary instead

ACCEPTANCE CRITERIA:
- npm run build passes
- Error boundaries use existing rune-card / forge-button styles
```

---

## PROMPT 19: Final cleanup + production verification

```
CONTEXT:
Last pass before paid launch.

DELETE dead code:
- components/ClerkProviderWrapper.tsx (empty)
- lib/supabase.ts (unused anon client that throws)
- components/dashboard/MRRMetricsDashboard.tsx, FunnelMetricsDashboard.tsx, RetentionMetricsDashboard.tsx if unused
- lib/analytics.ts — ONLY delete if zero imports remain after dashboard cleanup; if still used server-side for ops, keep file but ensure no user-facing analytics

VERIFY grep clean:
- replicate, REPLICATE_, waitlist, WaitlistForm → no app/runtime references
- href="/generate" → should only appear in redirects or tests, not primary nav

UPDATE:
- README.md — remove Replicate/waitlist setup; document DeepSeek + FAL + Lemon Squeezy env vars
- .env.local.example — final var list (no Replicate)

RUN:
npm run type-check
npm run lint
npm run test:run
npm run build

OUTPUT checklist of required Vercel Production env vars:

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Supabase
NEXT_PUBLIC_SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY

# Generation
OPENROUTER_API_KEY
OPENROUTER_MODEL=deepseek/deepseek-chat
FAL_KEY
FAL_MODEL=fal-ai/flux/dev
NEXT_PUBLIC_SITE_URL=https://www.hudforge.app

# Lemon Squeezy
LEMON_SQUEEZY_API_KEY
LEMON_SQUEEZY_STORE_ID
LEMON_SQUEEZY_STARTER_VARIANT_ID
LEMON_SQUEEZY_PRO_VARIANT_ID
LEMON_SQUEEZY_TOPUP_250_VARIANT_ID
LEMON_SQUEEZY_TOPUP_1000_VARIANT_ID
LEMON_SQUEEZY_TOPUP_3000_VARIANT_ID
LEMON_SQUEEZY_WEBHOOK_SECRET

# Sentry
SENTRY_DSN
NEXT_PUBLIC_SENTRY_DSN
```

---

## Manual setup (parallel with Prompts 12–17)

### Lemon Squeezy products (Test mode first)

| Product | Price | Env var |
|---------|-------|---------|
| Starter monthly | $19 | LEMON_SQUEEZY_STARTER_VARIANT_ID |
| Pro monthly | $49 | LEMON_SQUEEZY_PRO_VARIANT_ID |
| Top-up 250 | $9 | LEMON_SQUEEZY_TOPUP_250_VARIANT_ID |
| Top-up 1000 | $29 | LEMON_SQUEEZY_TOPUP_1000_VARIANT_ID |
| Top-up 3000 | $69 | LEMON_SQUEEZY_TOPUP_3000_VARIANT_ID |

Webhook URL: `https://www.hudforge.app/api/billing/webhook`  
Events: subscription_*, order_* / payment success (verify exact names in LS dashboard)

### OpenRouter

- Model: `deepseek/deepseek-chat` (confirm slug at openrouter.ai/models)
- Set `OPENROUTER_API_KEY` on Vercel Preview + Production

### QA before going Live on Lemon Squeezy

| # | Test | Pass |
|---|------|------|
| 1 | Sign up → lands on /dashboard with workbench | ☐ |
| 2 | Full optimize → assets → export on dashboard | ☐ |
| 3 | Starter checkout (test) → +250 credits | ☐ |
| 4 | Pro checkout (test) → +1000 credits | ☐ |
| 5 | Top-up $9 (test) → +250 credits | ☐ |
| 6 | Webhook replay → no duplicate credits | ☐ |
| 7 | /api/generate (legacy) → 404 | ☐ |
| 8 | No waitlist on homepage | ☐ |
| 9 | Legal pages load, USD pricing consistent | ☐ |

---

## Prompt map (quick reference)

| # | Status | Topic |
|---|--------|-------|
| 1 | ✅ Done | Auth-gate legacy generate (→ retro-fix in 9) |
| 2 | ✅ Done | Supabase required in prod |
| 3 | ✅ Done | Atomic credit debit |
| 4 | ✅ Done | FAL submit/poll |
| 5 | ✅ Done | resilientFetch |
| 6 | ✅ Done | Security headers |
| 7 | ✅ Done | Sentry |
| 8 | ✅ Done | CI fix |
| **9** | ✅ Done | Remove Replicate + legacy generate |
| 10 | ✅ Done | Remove waitlist |
| 11 | ✅ Done | Dashboard = workbench, SaaS nav |
| 12 | ✅ Done | USD pricing + top-ups |
| 13 | ✅ Done | DeepSeek optimizer |
| 14 | ✅ Done | PNG + queue tiers |
| 15 | ✅ Done | Legal + marketing |
| 16 | ✅ Done | Recovery + idempotency |
| 17 | ✅ Done | Billing lifecycle |
| 18 | ✅ Done | Error boundaries |
| 19 | ✅ Done | Final cleanup |
