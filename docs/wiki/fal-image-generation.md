# FAL Image Generation

FAL is used to generate real UI image assets.

## Current status

Real FAL generation has been tested successfully from the HUDForge environment.

Verified:

- `FAL_KEY` exists locally.
- FAL queue submit works.
- FAL polling works.
- FAL returned a real image URL from `v3b.fal.media`.

## Config

HUDForge now supports both names:

```txt
FAL_MODEL
FAL_IMAGE_MODEL
```

Priority:

```txt
FAL_MODEL → FAL_IMAGE_MODEL → fal-ai/flux/dev
```

This matters because Hermes/provider tooling was using `FAL_IMAGE_MODEL`, while the app originally only read `FAL_MODEL`.

## Production rule

Authenticated asset generation should not silently fall back to mock images.

If `FAL_KEY` is missing, the app should fail visibly with a provider configuration error.

This is intentional. For a SaaS, fake success is worse than a clear failure.

## Current model seen in local env

The environment has used:

```txt
fal-ai/flux/schnell
```

Secrets are never written into this wiki.
