# oodHUDForge: Paid Launch Production Fix Prompts

> **Purpose:** A sequential series of prompts for Cursor Composer 2.5 to fix all production blockers for a paid launch. Feed them one at a time, in order. Each prompt includes the system context the AI needs.
>
> **Do NOT skip prompts.** Later prompts assume earlier work is done.
>
> **After each prompt:** Verify with `npm run type-check && npm run test:run && npm run build`

---

## System Context (paste this ONCE at session start)

```
You are working on HUDForge — a Roblox UI generation SaaS product.

STACK:
- Next.js 16.2.6 (App Router, proxy.ts instead of middleware.ts for Clerk)
- React 19.2.4
- TypeScript 5 (strict mode)
- Tailwind CSS 4 (via @tailwindcss/postcss, no tailwind.config — uses CSS @theme)
- @clerk/nextjs ^7.3.5 (auth, session, proxy.ts route protection)
- @supabase/supabase-js ^2.105.4 (server-only via service role key)
- Vitest ^4.1.6 (test runner, node environment)
- Vercel deployment (Pro plan = 60s function timeout)
- Lemon Squeezy (payment processor — fully implemented, needs env config)

ARCHITECTURE:
- app/ — Next.js App Router pages and API routes
- lib/hudforge-generation.ts — THE core file (694 lines): generation pipeline, billing, credits, rate limits, repository pattern, FAL/OpenRouter providers
- lib/hudforge-auth.ts — Clerk user resolution + E2E bypass
- lib/hudforge-api.ts — API error helpers (hudforgeError, hudforgeJson, requireHudforgeUser)
- lib/analytics.ts — Supabase analytics summary
- lib/generation.ts — LEGACY Replicate generation (separate from main pipeline)
- proxy.ts — Clerk middleware (protected route matcher)
- components/app/ — Authenticated UI (AppShell, GenerationWorkbench, BillingPanel, etc.)
- supabase/migrations/ — Schema for waitlist, generations, credits, subscriptions
- test/ — 11 Vitest test files covering lib layer

PERSISTENCE PATTERN:
- HudforgeRepository interface with two implementations:
  - supabaseHudforgeRepository() — used when SUPABASE_SERVICE_ROLE_KEY is set
  - memoryHudforgeRepository() — fallback (loses data on cold start)
- Module-level singleton: const defaultRepository = process.env.SUPABASE_SERVICE_ROLE_KEY ? supabaseHudforgeRepository() : memoryHudforgeRepository()

GENERATION PIPELINE (3 sequential stages, each a separate API call):
1. POST /api/generate/optimize — OpenRouter (Gemini 2.5 Flash) → OptimizedGenerationSpec
2. POST /api/generate/assets — FAL (flux/dev) × 5 assets sequentially → AssetBundle
3. POST /api/generate/export — CPU-only ZIP build → ExportPackagePayload

BILLING (fully implemented in code):
- Credit ledger: initial 25 free, optimize costs 1, assets cost 5
- Plans: Free (£0/25 credits), Starter (£10/mo/150 credits), Pro (£30/mo/600 credits)
- Lemon Squeezy: checkout URL generation, webhook (HMAC + idempotent), subscription state machine
- API routes: /api/billing/status, /api/billing/checkout, /api/billing/webhook

BRANCH POLICY:
- main = production, develop = preview
- CI runs on main only (.github/workflows/quality-tests.yml)

SAFETY:
- Never expose SUPABASE_SERVICE_ROLE_KEY or other server secrets to frontend
- Never use NEXT_PUBLIC_ for server secrets
- proxy.ts protects: /dashboard, /generate, /projects, /settings, /billing, and all /api/generate/* (optimize/assets/export), /api/generations, /api/usage/event, /api/settings, /api/billing/status
- Legacy /api/generate and /api/generate/[id] are NOT protected (public)
```

---

## PROMPT 1: Kill the Unauthenticated Cost Risk

```
CONTEXT: There is a legacy Replicate-based generation API at:
- app/api/generate/route.ts (POST — creates Replicate predictions)
- app/api/generate/[id]/route.ts (GET — polls prediction status)

These routes are NOT in proxy.ts protected route matcher. They use only an in-memory IP-based rate limiter (8/min) that resets on every Vercel cold start. If REPLICATE_API_TOKEN is set in production, anyone can trigger paid image generation at our cost.

The REAL product pipeline uses /api/generate/optimize, /api/generate/assets, /api/generate/export (all Clerk-protected).

TASK:
1. In proxy.ts, add '/api/generate' (exact, not prefix — we don't want to double-match the already-protected sub-routes) to the isProtectedRoute matcher. Actually, looking at this more carefully — the sub-routes /api/generate/optimize, /api/generate/assets, /api/generate/export are already matched. The issue is that '/api/generate' exact POST and '/api/generate/[id]' GET are not.

   Better approach: Add these two specific routes to the protected list:
   - '/api/generate' (without (.*)  — just the root)
   
   Wait — the existing pattern '/api/generate/optimize(.*)' etc already handle sub-routes. The problem is /api/generate itself and /api/generate/[id].
   
   Simplest fix: Change the existing sub-route entries to a single '/api/generate(.*)' which covers everything. BUT this also covers /api/generate/optimize etc which are already there. So just replace all the /api/generate/* entries with one '/api/generate(.*)' entry.

2. In app/api/generate/route.ts, add requireHudforgeUser() call at the top of the POST handler (defense in depth). Import from '@/lib/hudforge-api'.

3. In app/api/generate/[id]/route.ts, add requireHudforgeUser() call at the top of the GET handler.

4. Remove the in-memory rate limiter from app/api/generate/route.ts since credit-based limits from the authenticated pipeline will apply. Keep the route functional but auth-gated.

5. Run: npm run type-check && npm run test:run

IMPORTANT: Do NOT delete these routes. They may still serve a purpose for authenticated users. Just gate them behind auth.
```

---

## PROMPT 2: Make Persistence Fail Loudly in Production

```
CONTEXT: In lib/hudforge-generation.ts line 200:
const defaultRepository = process.env.SUPABASE_SERVICE_ROLE_KEY ? supabaseHudforgeRepository() : memoryHudforgeRepository()

If SUPABASE_SERVICE_ROLE_KEY is missing in production (Vercel), the app silently falls back to in-memory storage. Generations, credits, settings — all lost on cold start. No error, no warning. Users lose their work.

TASK:
1. In lib/hudforge-generation.ts, modify the defaultRepository initialization:
   - If NODE_ENV === 'production' AND SUPABASE_SERVICE_ROLE_KEY is missing, throw an error at module load: "SUPABASE_SERVICE_ROLE_KEY is required in production. Cannot use in-memory repository."
   - Keep the memory fallback ONLY for development/test environments.

2. Update the test setup (test/setup.ts or individual test files) if needed — tests use memoryHudforgeRepository explicitly via createRepositoryBackedHudforgeService(), so they should not be affected by this guard on the default repository. Verify tests still pass.

3. Similarly, in app/api/billing/webhook/route.ts, the handler calls supabaseHudforgeRepository() directly (not defaultRepository). This is correct — webhooks must always use durable storage. No change needed there, just noting it.

4. Run: npm run type-check && npm run test:run
```

---

## PROMPT 3: Fix the Credit Race Condition with Atomic Debit

```
CONTEXT: In lib/hudforge-generation.ts, the debitCredits function has a TOCTOU race condition:

async function debitCredits(repository, userId, amount, reason, generationId, metadata) {
  const balance = await repository.getCreditBalance(userId)  // Step 1: read
  if (balance < amount) throw ...                             // Step 2: check
  await repository.addCreditLedgerEntry(userId, -amount, ...) // Step 3: write
}

Two concurrent requests can both read sufficient balance and both debit, driving the user negative. This is a real risk because:
- Users can have multiple tabs open
- Double-click on "Generate" button
- Network retries

TASK:
1. Create a new Supabase migration file: supabase/migrations/20260525_atomic_credit_debit.sql

   Create a Postgres function that atomically checks and debits:
   ```sql
   CREATE OR REPLACE FUNCTION debit_credits(
     p_user_id TEXT,
     p_amount INTEGER,
     p_reason TEXT,
     p_generation_id TEXT DEFAULT NULL,
     p_metadata JSONB DEFAULT '{}'::jsonb
   ) RETURNS TABLE(new_balance INTEGER, entry_id UUID) AS $$
   DECLARE
     v_balance INTEGER;
     v_new_balance INTEGER;
     v_entry_id UUID;
   BEGIN
     -- Lock the user's ledger rows to prevent concurrent debits
     SELECT COALESCE(SUM(delta), 0) INTO v_balance
     FROM hudforge_credit_ledger
     WHERE user_id = p_user_id
     FOR UPDATE;
     
     IF v_balance < p_amount THEN
       RAISE EXCEPTION 'insufficient_credits: required %, available %', p_amount, v_balance;
     END IF;
     
     v_new_balance := v_balance - p_amount;
     
     INSERT INTO hudforge_credit_ledger (user_id, delta, balance_after, reason, generation_id, metadata)
     VALUES (p_user_id, -p_amount, v_new_balance, p_reason, p_generation_id, p_metadata)
     RETURNING id INTO v_entry_id;
     
     RETURN QUERY SELECT v_new_balance, v_entry_id;
   END;
   $$ LANGUAGE plpgsql;
```

1. In lib/hudforge-generation.ts, update the supabaseHudforgeRepository implementation:
  - Add a new method `atomicDebit(userId, amount, reason, generationId?, metadata?)` that calls the RPC function via supabase.rpc('debit_credits', {...})
  - Update the HudforgeRepository interface to include this method (optional for backward compat with memory repo)
2. Update the debitCredits function to use repository.atomicDebit() when available (supabase), falling back to the current check-then-write for memory repo (acceptable in dev/test since there's no real concurrency).
3. Run: npm run type-check && npm run test:run

```

---

## PROMPT 4: Fix FAL Asset Generation Timeout (Critical Path)

```

CONTEXT: The asset generation stage calls FAL 5 times sequentially, each polling up to 90×2s = 180s. Total worst case: 15 minutes. Vercel Pro function timeout is 60 seconds.

Current flow:

1. POST /api/generate/assets receives request
2. Calls generateFalAssetsForSpec() which loops through 5 assets sequentially
3. Each asset: POST to fal queue → poll response_url up to 180s
4. If Vercel kills the function at 60s: catch block never runs, no credit refund, generation stuck

This is the #1 production blocker. Real FAL Flux/dev generations take 15-45s per image.

SOLUTION APPROACH: Split into submit + poll pattern with client-side orchestration.

TASK:

1. Create a new API route: app/api/generate/assets/status/route.ts (GET)
  - Accepts query param: generation_id
  - Returns current generation status + any completed assets from the repository
  - Protected by requireHudforgeUser()
2. Modify app/api/generate/assets/route.ts to use a two-phase approach:
  Phase A — Submit all FAL jobs (fast, <10s):
  - Debit credits upfront (atomic via Prompt 3)
  - Submit all 5 FAL queue requests (just the POST, don't wait for results)
  - Store the FAL request_ids/response_urls in the generation record metadata
  - Return immediately with { status: 'assets_generating', request_ids: [...] }
   Phase B — New route: app/api/generate/assets/poll/route.ts (POST)
  - Accepts: generation_id
  - Reads stored FAL response_urls from generation metadata
  - Polls each one ONCE (single attempt, no loop)
  - Returns: { completed: [...], pending: [...], failed: [...] }
  - Client calls this repeatedly (every 3s) until all complete or timeout
3. Update components/app/GenerationWorkbench.tsx client-side:
  - After calling /api/generate/assets, if response is { status: 'assets_generating' }:
  - Start polling /api/generate/assets/poll every 3 seconds
  - Show progress (e.g., "3/5 assets ready...")
  - After all 5 complete or 120s client timeout, proceed to export
  - On failure/timeout: show error, credits are already handled server-side
4. Add refund logic: In the poll route, if a FAL asset fails (non-retryable), mark it failed in the generation record. Add a separate endpoint or logic that refunds credits when all polling is done and some assets failed.
5. Add AbortController with 15s timeout to all FAL fetch calls (both submit and poll).
6. Run: npm run type-check && npm run test:run

NOTES:

- This keeps each server function well under 60s
- Client does the orchestration (retry/poll)
- Credits are debited atomically at submit time
- Refunds happen if assets fail
- The generation record tracks progress durably in Supabase

```

---

## PROMPT 5: Add Retry + Timeout to External Calls

```

CONTEXT: Neither OpenRouter nor FAL calls have retry logic or timeouts. The legacy lib/generation.ts has a retryTransient() helper with exponential backoff that we should port.

Current state:

- OpenRouter call: single fetch(), no timeout, no retry
- FAL submit: single fetch(), no timeout, no retry
- FAL poll: has a loop but no AbortController timeout per request
- Supabase calls: no timeout

TASK:

1. Create lib/fetch-utils.ts with:
  - resilientFetch(url, options, config): A wrapper around fetch that adds:
    - AbortController with configurable timeout (default 30s for AI calls, 10s for polls)
    - Retry with exponential backoff for transient errors (429, 500, 502, 503, 504)
    - Max retries configurable (default 2)
    - Backoff: 1s, 3s (with jitter)
    - Respects Retry-After header if present
    - Returns the Response or throws after retries exhausted
     Interface:
2. Update lib/hudforge-generation.ts:
  - Replace the raw fetch() in createOpenRouterOptimizerProvider with resilientFetch(url, opts, { timeoutMs: 30000, maxRetries: 2 })
  - Replace the FAL submit fetch with resilientFetch(url, opts, { timeoutMs: 15000, maxRetries: 1 })
  - Replace the FAL poll fetch with resilientFetch(url, opts, { timeoutMs: 10000, maxRetries: 0 })
3. Write a test file: test/fetch-utils.test.ts
  - Test timeout behavior (mock with delayed response)
  - Test retry on 429/503
  - Test no retry on 400/401/403
  - Test Retry-After header respect
4. Run: npm run type-check && npm run test:run

```

---

## PROMPT 6: Add Security Headers

```

CONTEXT: next.config.ts is minimal — no security headers. For a paid product handling checkout redirects (Lemon Squeezy → our app → back), this is a security gap.

Current next.config.ts:
import * as path from 'node:path'
import type { NextConfig } from 'next'
const nextConfig: NextConfig = { turbopack: { root: path.join(__dirname) } }
export default nextConfig

TASK:

1. Update next.config.ts to add security headers via the headers() config:
  ```typescript
   const securityHeaders = [
     { key: 'X-DNS-Prefetch-Control', value: 'on' },
     { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
     { key: 'X-Frame-Options', value: 'DENY' },
     { key: 'X-Content-Type-Options', value: 'nosniff' },
     { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
     { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
   ]
  ```
   Add a Content-Security-Policy that:
  - Allows scripts from 'self', clerk.com (Clerk JS), and [www.googletagmanager.com](http://www.googletagmanager.com) (GA4)
  - Allows styles from 'self' and 'unsafe-inline' (Tailwind)
  - Allows images from 'self', data:, blob:, *.fal.ai (generated assets), img.clerk.com
  - Allows connect to 'self', *.clerk.com, *.supabase.co, api.lemonsqueezy.com, openrouter.ai, fal.ai
  - Allows frame from 'self' and *.lemonsqueezy.com (checkout overlay if used)
  - Default-src 'self'
2. Also add to next.config.ts the `images` config if not present, allowing fal.ai domains for Next Image optimization (even if not currently used, it's forward-looking):
  ```typescript
   images: {
     remotePatterns: [
       { protocol: 'https', hostname: '*.fal.ai' },
     ],
   },
  ```
3. Run: npm run build (headers config is validated at build time)

```

---

## PROMPT 7: Add Error Monitoring (Sentry)

```

CONTEXT: The entire app uses console.error for error logging. On Vercel serverless, these logs are ephemeral (72h retention, no alerting, no grouping). For a paid product where users are spending credits and money, we need real error tracking.

TASK:

1. Install Sentry:
  npm install @sentry/nextjs
2. Create sentry.client.config.ts in project root:
  - Initialize with DSN from env: NEXT_PUBLIC_SENTRY_DSN
  - Set tracesSampleRate: 0.1 (10% of transactions)
  - Set replaysSessionSampleRate: 0 (no replay needed yet)
  - Set environment from NEXT_PUBLIC_VERCEL_ENV || 'development'
3. Create sentry.server.config.ts in project root:
  - Initialize with DSN from env: SENTRY_DSN (server-side, not public)
  - Set tracesSampleRate: 0.2
4. Create sentry.edge.config.ts in project root:
  - Same as server but for edge runtime (proxy.ts runs at edge)
5. Update next.config.ts:
  - Wrap with withSentryConfig from @sentry/nextjs
  - Set: org, project, silent: true, widenClientFileUpload: true, disableLogger: true
6. Update lib/hudforge-api.ts:
  - In the hudforgeError() function, add Sentry.captureException(error) before returning the JSON response
  - Add user context: Sentry.setUser({ id: userId }) when available
7. Update app/api/billing/webhook/route.ts:
  - Wrap the handler in a try/catch that reports to Sentry on failure (webhook failures are critical — lost revenue events)
8. Add NEXT_PUBLIC_SENTRY_DSN and SENTRY_DSN to .env.local.example with a comment
9. Run: npm run type-check && npm run build

NOTE: Don't worry about the instrumentation.ts file for now — basic Sentry without it still captures errors. We can add performance instrumentation later.

```

---

## PROMPT 8: Fix CI Pipeline

```

CONTEXT: .github/workflows/quality-tests.yml has multiple issues:

1. Only triggers on main (not develop)
2. References test/image-quality.test.ts and test/performance.test.ts which DON'T EXIST
3. Doesn't run `npm run build` (misses Next.js build errors)
4. Uploads coverage/ and test-results.xml that are never generated
5. Prompt test step is redundant (covered by the *.test.ts glob)

TASK:

1. Update .github/workflows/quality-tests.yml:
  Triggers:
  - push: branches [main, develop]
  - pull_request: branches [main, develop]
   Quality job steps:
  1. Checkout
  2. Setup Node 20 with npm cache
  3. npm ci
  4. npm run type-check
  5. npm run lint
  6. npm run test:run (all tests, no specific file targeting)
  7. npm run build (env: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_placeholder — just needs to be present for build to succeed, Clerk gracefully handles invalid keys at runtime)
    move:
    The redundant "Run prompt analysis tests" step
    The image-quality job entirely (test file doesn't exist, needs real API key)
    The performance job entirely (test file doesn't exist)
    The artifact upload step (coverage isn't generated without @vitest/coverage-istanbul)
2. Fix the one failing test in test/hudforge-analytics.test.ts:
  - Line 53 uses hardcoded path '/home/herm/hudforge/lib/analytics.ts'
  - Replace with a relative path using path.resolve or import.meta.url:
    ```typescript
    import { resolve } from 'path'
    const source = readFileSync(resolve(__dirname, '../lib/analytics.ts'), 'utf8')
    ```
  - Or use: resolve(process.cwd(), 'lib/analytics.ts')
3. Run: npm run type-check && npm run test:run

```

---

## PROMPT 9: Fix Dashboard Readiness to Show Real Status

```

CONTEXT: app/dashboard/page.tsx has hardcoded readiness badges:
['Supabase persistence', 'Live'],
['Credit ledger', 'Live'],
['FAL assets', 'Real provider'],
['Billing provider', 'Next'],

These lie to operators. Whether Supabase or FAL is actually configured depends on env vars.

TASK:

1. Create a server function in lib/hudforge-generation.ts (or a new lib/system-status.ts):
  ```typescript
   export function getSystemReadiness(): Array<{ label: string; status: 'live' | 'degraded' | 'not_configured'; detail?: string }> {
     return [
       {
         label: 'Supabase persistence',
         status: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'live' : 'not_configured',
         detail: process.env.SUPABASE_SERVICE_ROLE_KEY ? undefined : 'Using in-memory (data will be lost)',
       },
       {
         label: 'Credit ledger',
         status: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'live' : 'degraded',
         detail: process.env.SUPABASE_SERVICE_ROLE_KEY ? undefined : 'Ephemeral — resets on restart',
       },
       {
         label: 'FAL assets',
         status: process.env.FAL_KEY ? 'live' : 'not_configured',
         detail: process.env.FAL_KEY ? undefined : 'Asset generation will fail',
       },
       {
         label: 'AI optimizer',
         status: process.env.OPENROUTER_API_KEY ? 'live' : 'degraded',
         detail: process.env.OPENROUTER_API_KEY ? undefined : 'Using deterministic fallback',
       },
       {
         label: 'Billing provider',
         status: isLemonSqueezyConfigured() ? 'live' : 'not_configured',
         detail: isLemonSqueezyConfigured() ? 'Lemon Squeezy' : 'Checkout disabled',
       },
     ]
   }
  ```
   (isLemonSqueezyConfigured already exists — it checks LEMON_SQUEEZY_API_KEY && STORE_ID)
2. Update app/dashboard/page.tsx:
  - Import getSystemReadiness
  - Call it in the server component
  - Replace the hardcoded array with the real status
  - Style: 'live' = green/cyan, 'degraded' = yellow/amber, 'not_configured' = red/rose
3. Run: npm run type-check && npm run build

```

---

## PROMPT 10: Add Client-Side Generation Recovery

```

CONTEXT: If a user refreshes during asset generation, the client resets to idle. There's no mechanism to detect or resume an in-progress generation. Credits are lost from the user's perspective.

The /api/generations endpoint already returns the user's generation history. We just need to check for in-progress generations on component mount.

TASK:

1. In components/app/GenerationWorkbench.tsx, add an effect that runs on mount:
  - Fetch GET /api/generations
  - Look for any generation with status 'optimized' or 'assets_generating' (meaning assets were started but not completed)
  - If found, show a recovery banner: "You have a generation in progress. Resume?" with a button
  - On resume: set the workbench state to match the generation's current stage and begin polling /api/generate/assets/poll (from Prompt 4) or show the completed spec for re-trying assets
2. Also add a simple client-side guard against double-submit:
  - Disable the generate button while any stage is in progress
  - Add a useRef flag: isSubmitting. Set true on submit, false on complete/error
  - If the form somehow fires while isSubmitting is true, return early
3. Run: npm run type-check && npm run build

```

---

## PROMPT 11: Add Rate Limiting to Waitlist + Optimize Rate Limiter Performance

```

CONTEXT: 

1. POST /api/waitlist has NO rate limiting. An attacker can fill the waitlist table with junk.
2. The authenticated rate limiter in lib/hudforge-generation.ts loads ALL usage events for a user and filters in JS. For heavy users this is O(n) on every request.

TASK:

1. Add IP-based rate limiting to app/api/waitlist/route.ts:
  - Simple approach: Use a Map<string, { count: number, resetAt: number }> (acceptable for waitlist — it's not credit-sensitive)
  - Limit: 3 submissions per IP per hour
  - On limit exceeded: return 429 with Retry-After header
  - This is fine as in-memory for waitlist since it's a low-stakes endpoint
2. Optimize the rate limiter in lib/hudforge-generation.ts enforceRateLimit function:
  - In supabaseHudforgeRepository, update the listUsageEvents implementation (or add a new method countRecentEvents(userId, eventName, since)):
  - Use a Supabase query with .gte('created_at', since.toISOString()) filter instead of loading all events
  - The enforceRateLimit function should call this filtered method instead of loading everything
3. Add a test for the waitlist rate limiter behavior.
4. Run: npm run type-check && npm run test:run

```

---

## PROMPT 12: Billing Polish for Paid Launch

```

CONTEXT: The Lemon Squeezy billing integration is code-complete for initial checkout + webhook credit grant. But for a real paid product, we need a few more things:

Current gaps:

1. No subscription renewal credit top-up (webhook only handles subscription_created)
2. No cancel/manage UI for existing subscribers
3. /api/billing/checkout is protected by proxy.ts but not listed explicitly (it's covered by '/billing(.*)' page pattern but the API route /api/billing/checkout needs to be in the API protection list)

TASK:

1. In proxy.ts, verify that /api/billing/checkout is protected. Looking at the matcher: '/api/billing/status(.*)' is listed. Add '/api/billing/checkout(.*)' to the protected routes list (it's an authenticated endpoint that creates checkout URLs per-user).
  NOTE: /api/billing/webhook must NOT be protected (it receives unsigned Lemon Squeezy callbacks). It's currently not in the list — confirm this stays that way.
2. In lib/hudforge-generation.ts handleLemonSqueezyWebhook function:
  - Verify it handles these Lemon Squeezy events:
    - subscription_created → grant credits ✓ (already done)
    - subscription_updated → update subscription state
    - subscription_cancelled → update state to 'canceled'
    - subscription_payment_success → THIS IS THE RENEWAL EVENT. Add credit top-up logic: grant plan credits (150 for starter, 600 for pro) on each successful payment, with idempotency check
  - If subscription_payment_success handling is missing, add it
3. Add a customer portal / manage subscription link:
  - Lemon Squeezy provides a customer portal URL via their API
  - Create: lib/hudforge-generation.ts → getLemonSqueezyCustomerPortalUrl(userId)
  - It should look up the user's lemon_squeezy_customer_id from hudforge_subscriptions, then construct the portal URL (or call the LS API)
  - Expose via: app/api/billing/portal/route.ts (GET, authenticated)
  - In components/app/BillingPanel.tsx, add a "Manage subscription" button that opens the portal URL in a new tab (only shown when user has an active subscription)
4. Add the new API route to proxy.ts protected list: '/api/billing/portal(.*)'
5. Run: npm run type-check && npm run test:run

```

---

## PROMPT 13: Add Request Idempotency to Generation Endpoints

```

CONTEXT: The optimize and assets endpoints have no idempotency. If a client retries (network error, timeout, double-click), it creates duplicate generations and charges credits twice.

TASK:

1. Add an idempotency key pattern:
  - Client sends header: X-Idempotency-Key (a UUID generated client-side per user action)
  - Server checks if a generation with that idempotency key already exists for this user
  - If yes: return the existing result (no new generation, no credit charge)
  - If no: proceed normally, store the key in generation metadata
2. Implementation:
  In lib/hudforge-generation.ts:
  - Add 'idempotency_key' as an optional field on the generation record (store in metadata JSONB)
  - In createOptimizedGeneration: before creating a new generation, check if one exists with this key
  - In createAssetsForGeneration: before debiting credits, check if assets already exist for this generation_id
   In the API routes (app/api/generate/optimize/route.ts and app/api/generate/assets/route.ts):
  - Read X-Idempotency-Key header
  - Pass it to the service function
   In components/app/GenerationWorkbench.tsx:
  - Generate a crypto.randomUUID() for each user-initiated generation action
  - Send it as X-Idempotency-Key header with the fetch call
  - Regenerate on each new user action (not on retries — same key for retries)
3. Write a test: verify that calling optimize twice with the same idempotency key returns the same generation and only debits credits once.
4. Run: npm run type-check && npm run test:run

```

---

## PROMPT 14: Add Error Boundary + Proper Error Pages

```

CONTEXT: The root layout has no error boundary. Unhandled errors crash the entire React tree with no recovery. For a paid product, this is unacceptable.

TASK:

1. Create app/error.tsx (App Router error boundary):
  - 'use client' component
  - Shows a friendly error message: "Something went wrong"
  - Includes a "Try again" button that calls reset()
  - Reports the error to Sentry (if installed from Prompt 7): Sentry.captureException(error)
  - Styled consistently with the app (dark theme, rune-card pattern)
2. Create app/not-found.tsx:
  - Shows a friendly 404 page
  - Link back to home
  - Styled consistently
3. Create app/generate/error.tsx (generation-specific error boundary):
  - More specific messaging: "Generation encountered an error"
  - Shows the error message if it's a known HudforgeServiceError type
  - "Return to dashboard" button
  - Reports to Sentry
4. Create app/global-error.tsx (catches errors in root layout itself):
  - Minimal HTML (no layout dependencies — layout itself may be broken)
  - Reports to Sentry
  - "Reload" button
5. Run: npm run type-check && npm run build

```

---

## PROMPT 15: Final Cleanup + Production Checklist Verification

```

CONTEXT: Clean up dead code and verify everything builds for production.

TASK:

1. Delete or empty these unused files:
  - components/ClerkProviderWrapper.tsx (empty, untracked, unused)
  - lib/supabase.ts (throws on import if env missing, never imported anywhere — dead code)
2. In app/layout.tsx: remove any import of lib/supabase.ts if present (it shouldn't be, but verify)
3. Clean up the git-tracked 'promt2' file in repo root (it's untracked per git status — just noting it, don't delete without user confirmation)
4. Verify the full production build succeeds:
  - npm run type-check (expect: clean pass, ignore .next/dev/types errors from stale cache)
  - npm run lint
  - npm run test:run (expect: all tests pass)
  - npm run build (with env stubs if needed: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_x)
5. List any remaining console.error calls that should be replaced with Sentry.captureException (from Prompt 7). Don't fix now — just list for awareness.
6. Output a final checklist of Vercel environment variables needed for paid production:
  REQUIRED:
  - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  - CLERK_SECRET_KEY
  - NEXT_PUBLIC_SUPABASE_URL
  - SUPABASE_SERVICE_ROLE_KEY
  - FAL_KEY
  - OPENROUTER_API_KEY
  - LEMON_SQUEEZY_API_KEY
  - LEMON_SQUEEZY_STORE_ID
  - LEMON_SQUEEZY_STARTER_VARIANT_ID
  - LEMON_SQUEEZY_PRO_VARIANT_ID
  - LEMON_SQUEEZY_WEBHOOK_SECRET
  - SENTRY_DSN
  - NEXT_PUBLIC_SENTRY_DSN
   RECOMMENDED:
  - NEXT_PUBLIC_GA_MEASUREMENT_ID
  - NEXT_PUBLIC_SITE_URL

```

---

## Post-Prompt Verification Sequence

After completing all 15 prompts, run this full verification:

```bash
npm run type-check
npm run lint
npm run test:run
npm run build
```

Then manually test:

1. Sign up flow (Clerk)
2. Generate → Optimize → Assets → Export (full loop)
3. Credit deduction shows correctly
4. Billing page shows real status
5. Checkout button opens Lemon Squeezy (if env configured)
6. Webhook test via Lemon Squeezy dashboard
7. Refresh during generation → recovery banner appears

---

## Environment Setup for Lemon Squeezy (Manual Steps)

These are NOT code changes — do them in dashboards:

1. **Lemon Squeezy Dashboard:**
  - Create store
  - Create Product: "HUDForge Starter" (£10/mo) → note variant_id
  - Create Product: "HUDForge Pro" (£30/mo) → note variant_id
  - Webhooks → Add endpoint: `https://www.hudforge.app/api/billing/webhook`
  - Events to send: subscription_created, subscription_updated, subscription_cancelled, subscription_payment_success
  - Copy signing secret
2. **Vercel Dashboard:**
  - Add all env vars from the checklist above
  - Set for Production + Preview environments
3. **Supabase Dashboard:**
  - Confirm migrations applied: `supabase db push` from local
  - Verify tables exist: hudforge_profiles, hudforge_generations, hudforge_credit_ledger, hudforge_subscriptions, hudforge_user_settings, hudforge_usage_events
4. **Sentry Dashboard:**
  - Create project (Next.js)
  - Copy DSN

