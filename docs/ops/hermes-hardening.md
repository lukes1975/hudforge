# Hermes VPS Hardening for HUDForge

## Purpose
This document records the HUDForge-specific Hermes hardening assets created on the VPS, the commands to inspect them, and the current verified infrastructure facts.

## Hardening directory
All VPS-side hardening assets live here:

```bash
~/hermes-hardening/
├── checks/
├── logs/
├── notes/
└── scripts/
```

## Created scripts

### 1. `~/hermes-hardening/scripts/system-baseline.sh`
Checks and prints:
- timestamp
- OS / hostname / current user / shell / working directory
- Python + pip
- Node + npm
- Git
- Hermes version and config summary
- Hermes auth list
- Hermes gateway status
- Hermes memory status
- systemd unit status

Run:

```bash
~/hermes-hardening/scripts/system-baseline.sh
```

Saved baseline log:

```bash
~/hermes-hardening/logs/system-baseline.txt
```

### 2. `~/hermes-hardening/scripts/check-providers.sh`
Read-only presence check for:
- `FAL_KEY`
- `FAL_IMAGE_MODEL`
- `OPENROUTER_API_KEY`
- `GITHUB_TOKEN`
- `SUPABASE_ACCESS_TOKEN`
- `VERCEL_TOKEN`

It reports only `present` / `missing` and never prints secret values.

Run:

```bash
~/hermes-hardening/scripts/check-providers.sh
```

### 3. `~/hermes-hardening/scripts/test-fal-image.py`
Python test script that:
- imports `fal_client`
- reads `FAL_IMAGE_MODEL`
- submits a Roblox cyberpunk shop UI image generation request
- prints structured JSON status/results

Run with Hermes venv Python:

```bash
/home/herm/.hermes/hermes-agent/venv/bin/python ~/hermes-hardening/scripts/test-fal-image.py
```

If `FAL_IMAGE_MODEL` is missing, the script exits safely with a JSON error.

### 4. `~/hermes-hardening/scripts/check-gateway.sh`
Read-only gateway diagnostics for:
- `hermes gateway status`
- `hermes status --all`
- systemd service status
- recent `~/.hermes/logs/gateway.log`
- `journalctl` logs
- listening TCP ports

Run:

```bash
~/hermes-hardening/scripts/check-gateway.sh
```

## Verified environment facts

### Hermes install
- Hermes source/project path: `/home/herm/.hermes/hermes-agent`
- Hermes venv path: `/home/herm/.hermes/hermes-agent/venv`
- Hermes version at baseline: `v0.13.0 (2026.5.7)`

### Venv hardening
The Hermes venv initially had no pip module available. `ensurepip` was run inside the Hermes venv only, then these packages were installed/upgraded inside the same venv:
- `pip`
- `setuptools`
- `wheel`
- `fal-client`
- `requests`
- `python-dotenv`
- `pillow`

### Important follow-up caveat
Upgrading the Hermes venv introduced package drift relative to Hermes pinned deps:
- `requests` is now newer than Hermes' pinned version
- `python-dotenv` is now newer than Hermes' pinned version

This did **not** use system Python, but it means future Hermes stability checks should watch for regressions tied to dependency pin mismatch.

### Hermes gateway
- Gateway service is running under systemd system service
- Current service name: `hermes-gateway.service`
- Gateway logs are at: `~/.hermes/logs/gateway.log`

### Auxiliary vision warning discovered
Baseline/gateway inspection showed a warning:

```text
WARNING agent.auxiliary_client: resolve_provider_client: unknown provider 'openai'
```

Even though `hermes config` displayed auxiliary vision as `provider=openai, model=openai/gpt-5.4-mini`, the running gateway emitted an unknown-provider warning. Treat this as a configuration/runtime mismatch until re-verified after a clean gateway refresh.

### Provider presence snapshot during hardening
Final saved output from `~/hermes-hardening/logs/provider-status.txt`:
- `FAL_KEY` = missing in Hermes VPS shell/.env context
- `FAL_IMAGE_MODEL` = missing in Hermes VPS shell/.env context
- `OPENROUTER_API_KEY` = present
- `GITHUB_TOKEN` = present
- `SUPABASE_ACCESS_TOKEN` = present
- `VERCEL_TOKEN` = missing

This means the FAL test script exists and imports correctly in the Hermes venv, but cannot run a real generation until `FAL_KEY` and `FAL_IMAGE_MODEL` are available in the Hermes execution environment. It also means Vercel CLI access currently appears to rely on existing CLI auth/session state rather than a `VERCEL_TOKEN` exported into the Hermes runtime environment.

## HUDForge repo facts
Verified by git and project metadata:

- Repo path: `/home/herm/hudforge`
- Remote: `https://github.com/lukes1975/hudforge.git`
- Branches present: `main`, `develop`
- Current branch during hardening: `develop`

### Vercel facts
Verified with Vercel CLI:
- Project name: `hudforge`
- Project ID: `prj_qsg4Bl1uaKyWlmm8FMmwDk2FNj6B`
- Production URL: `https://www.hudforge.app`
- Preview deployments exist for this project

Useful commands:

```bash
cd /home/herm/hudforge
vercel project inspect hudforge
vercel ls hudforge
vercel env ls
```

### Supabase facts
Verified from linked local metadata:
- Project ref: `dauhewahzjrvrszemclj`
- Project name: `hudforge-waitlist-live`

Useful commands:

```bash
cd /home/herm/hudforge
cat supabase/.temp/project-ref
cat supabase/.temp/linked-project.json
```

## Golden commands

### System baseline
```bash
~/hermes-hardening/scripts/system-baseline.sh | tee ~/hermes-hardening/logs/system-baseline-manual.txt
```

### Provider presence
```bash
~/hermes-hardening/scripts/check-providers.sh
```

### Gateway health
```bash
~/hermes-hardening/scripts/check-gateway.sh
```

### FAL generation test
```bash
export FAL_KEY='...'
export FAL_IMAGE_MODEL='...'
/home/herm/.hermes/hermes-agent/venv/bin/python ~/hermes-hardening/scripts/test-fal-image.py
```

### HUDForge repo identity
```bash
cd /home/herm/hudforge
git remote -v
git branch -a
git status --short
```

### HUDForge build sanity
```bash
cd /home/herm/hudforge
npm run type-check
npm run build
```

## Non-goals / guardrails
- Do not expose dashboard/admin surfaces publicly.
- Do not move secrets into `NEXT_PUBLIC_*` unless they are explicitly intended for client exposure.
- Do not change DNS as part of VPS hardening.
- Do not install packages into bare system Python unless absolutely necessary.
- Do not run destructive cleanup without explicit approval.

## Recommended next hardening actions
1. Reconcile Hermes venv package drift with Hermes pinned dependency expectations.
2. Fix the auxiliary vision provider/runtime mismatch and restart the gateway cleanly.
3. Add `FAL_KEY` and `FAL_IMAGE_MODEL` to the Hermes runtime environment if FAL tests are required from the VPS.
4. Save provider/gateway check outputs under `~/hermes-hardening/logs/` on each major infra change.
