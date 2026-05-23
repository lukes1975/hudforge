# OpenRouter Gemini Optimizer

HUDForge now has a real prompt optimizer path through OpenRouter using Gemini 2.5 Flash.

## What it does

The optimizer turns a user prompt into structured HUDForge generation data:

- intent summary
- Roblox-friendly layout spec
- fixed 5-asset prompt bundle
- deterministic Luau instance spec
- constraints for mobile/Roblox/export safety

## Provider

Default model:

```txt
google/gemini-2.5-flash
```

Environment variables:

```txt
OPENROUTER_API_KEY
OPENROUTER_MODEL optional, defaults to google/gemini-2.5-flash
```

## Real-or-fail behavior

If `OPENROUTER_API_KEY` exists, HUDForge uses the real OpenRouter optimizer.

If no key exists in local/dev, the service still has a deterministic optimizer fallback so tests and basic development keep working. The provider status reports this as `mock`.

## Schema handling

LLM output is not trusted directly.

HUDForge validates and normalizes the provider JSON into the required internal shape:

```txt
main_frame
primary_button
secondary_button
currency_icon
background_panel
```

The parser tolerates harmless Gemini drift like:

- fenced JSON
- wrapper objects like `spec`
- camelCase keys
- `node_id` inside image prompt arrays
- weak/missing layout nodes, where deterministic HUDForge layout fallback is safer

But it still fails if the provider does not return usable image prompts for the fixed asset bundle.

## Files

- `lib/hudforge-generation.ts`
- `test/hudforge-openrouter-optimizer.test.ts`
- `test/openrouter-smoke.local.ts`

## Smoke test

A live OpenRouter smoke passed with:

- provider: OpenRouter
- model: `google/gemini-2.5-flash`
- 5 asset prompts returned
- layout normalized to mobile canvas
- Luau instance tree generated

## Why this matters

This removes the biggest mock from the generation loop before billing.

HUDForge can now use a real LLM to interpret Roblox UI prompts while still generating export code deterministically in backend code.
