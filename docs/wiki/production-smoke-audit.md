# Production Smoke Audit

Date: 2026-05-23

## Scope

Checked production custom domain, latest available Vercel preview URL, and local authenticated dev smoke after the SaaS generation/billing work landed on `develop`.

## Production custom domain

Base URL:

```txt
https://www.hudforge.app
```

Observed:

| Route | Status |
| --- | ---: |
| `/` | 200 |
| `/pricing` | 200 |
| `/templates` | 200 |
| `/documentation` | 200 |
| `/dashboard` | 200 |
| `/generate` | 404 |
| `/billing` | 404 |
| `/settings` | 404 |
| `/api/billing/status` | 404 |
| `/api/generations` | 404 |

Conclusion:

- Production custom domain is still serving an older `main` deployment.
- The authenticated SaaS app/API work exists on `develop`, but is not on production yet.
- Do not use production custom domain for creator activation tests until `develop` is promoted/merged to `main`.

## Vercel preview

Sample preview checked:

```txt
https://hudforge-b8c9rdv50-tpjosholadejo-gmailcoms-projects.vercel.app
```

Observed:

- App/API routes exist.
- Requests returned `401` across public and app routes, indicating deployment-level protection/auth rather than missing routes.

Conclusion:

- Preview confirms the newer app route surface exists.
- Preview is not currently usable for unauthenticated public smoke without handling Vercel preview protection.

## Local authenticated smoke

Command shape:

```bash
HUD_FORGE_E2E_AUTH_BYPASS=1 npm run dev
```

With header:

```txt
x-hudforge-e2e-user: activation-smoke
```

Observed:

| Route | Status | Notes |
| --- | ---: | --- |
| `/dashboard` | 200 | App shell reachable |
| `/generate` | 200 | Generate + ZIP copy present |
| `/billing` | 200 | Checkout/billing copy present |
| `/settings` | 200 | App settings reachable |
| `/api/billing/status` | 200 | Returns `unknown_mock` when Lemon env is absent |
| `/api/generations` | 200 | Returns empty generation history for new test user |

Conclusion:

- Local `develop` app surface is reachable with the production-disabled E2E bypass.
- Lemon Squeezy env absence is handled safely; checkout remains disabled.

## Branch state

At audit time:

```txt
main    -> 6b0ffe9 fix: lazy-load Clerk auth paths
develop -> c3d846f feat: add lemon squeezy billing flow
```

`develop` is 17 commits ahead of `main`.

## Recommended next action

Before creator-facing distribution, Luke should explicitly approve promoting `develop` to production by merging/pushing to `main`.

Do not add Lemon Squeezy env vars yet unless Luke explicitly asks.
