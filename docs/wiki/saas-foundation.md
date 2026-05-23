# SaaS Foundation

HUDForge is being turned from a landing/demo app into a functional SaaS.

## What a functional HUDForge SaaS needs

A user should be able to:

1. Sign in
2. Describe a Roblox UI
3. Get a structured UI plan/spec
4. Generate real image assets
5. Preview the UI in the browser
6. Export files usable in Roblox Studio
7. Spend credits when generation costs money
8. See previous projects/history
9. Pay for more usage later

## Current foundation status

Done:

- Auth-protected app routes exist.
- Supabase is linked to the project.
- Persistent generation database tables exist.
- Credit ledger tables exist.
- Real FAL image generation works with the local key.
- Missing FAL key now fails visibly instead of silently using mocks.
- Export payload includes Roblox Studio import instructions.

Still needed:

- Full authenticated end-to-end app smoke test against live Supabase.
- OpenRouter/Gemini optimizer for better prompt/spec generation.
- ZIP export instead of JSON payload only.
- Lemon Squeezy checkout and webhook.
- Better analytics/funnel tracking.
- Production auth hardening and rate limiting.

## Why this matters

The SaaS cannot charge users until generation, credits, persistence, and export are reliable. These are the core activation and conversion loop.
