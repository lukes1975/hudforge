<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# HUDForge Agent Operating Rules

## Mission
- HUDForge is a Roblox UI workflow product, not a generic AI art toy.
- Prioritize work that improves signup conversion, activation, export success, paid conversion, retention, or distribution within 7 days.
- Prefer boring infrastructure and visible user value.

## Repo identity
- Canonical local repo: `/home/herm/hudforge`
- Git remote: `https://github.com/lukes1975/hudforge.git`
- Active branches present locally/remotely: `develop`, `main`
- Branch policy for this repo:
  - `main` = production line
  - `develop` = preview/dev line
- Current working branch may be `develop`; do not assume branch from memory—check before edits.

## Deployment + infrastructure facts
- Vercel project name: `hudforge`
- Vercel project ID: `prj_qsg4Bl1uaKyWlmm8FMmwDk2FNj6B`
- Production URL: `https://www.hudforge.app`
- Preview deployments exist on Vercel for this project; use `vercel ls hudforge` to inspect current preview URLs.
- Supabase linked project ref: `dauhewahzjrvrszemclj`
- Supabase linked project name: `hudforge-waitlist-live`
- Waitlist/API routes use Supabase env vars; do not expose server secrets to the frontend.

## Safety rules
- Never print secrets, tokens, auth headers, or raw `.env` values.
- Never move server-only secrets into `NEXT_PUBLIC_*` variables.
- Do not expose internal dashboards publicly.
- Do not change DNS as part of routine repo work.
- Do not run destructive cleanup commands unless explicitly requested.
- If an operation requires sudo or irreversible infra changes, stop and report the exact command needed.

## Coding rules
- Validate with the smallest relevant checks before pushing.
- For app changes, prefer these checks when relevant:
  - `npm run type-check`
  - `npm run build`
  - `npm run test:run`
- Keep edits scoped. Do not rewrite unrelated areas.
- Preserve preview-safe behavior. Example: dev-only helper routes must stay disabled in production.

## Ops workflow
- Hermes hardening assets live outside the repo at `~/hermes-hardening/`.
- Repo-side ops documentation should live under `docs/ops/`.
- When touching deployment/auth/data paths, document the exact command used and the verification result.
- For Vercel and Supabase inspection, prefer read-only commands first.

## Common commands
```bash
# local dev
npm run dev
npm run type-check
npm run build
npm run test:run

# git sanity
git remote -v
git branch -a
git status --short

# vercel
vercel project inspect hudforge
vercel ls hudforge
vercel env ls

# supabase-linked metadata
cat supabase/.temp/project-ref
cat supabase/.temp/linked-project.json
```

## Execution default
- If repo files change and the work is meant to ship, commit and push without waiting for a reminder.
- Use conventional commits.
- Report completion in a short Done / Changed / Verified / Next format.
