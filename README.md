# HUDForge

Roblox UI workflow platform. Generate structured UI specs, mock-safe asset bundles, browser previews, and deterministic Luau/json_payload exports from simple prompts.

## Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Environment Variables

Create `.env.local`:

```env
# Supabase (for waitlist)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Replicate (for image generation)
REPLICATE_API_TOKEN=your_replicate_token

# Clerk (for auth)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Lemon Squeezy (for payments)
LEMON_SQUEEZY_API_KEY=your_lemon_squeezy_key
LEMON_SQUEEZY_STORE_ID=your_store_id
```

See `.env.local.example` for full list.

## Marketing Route Map

The public marketing frontend is a multi-page App Router site backed by typed local content in `lib/marketing-content.ts`.

- `/` - home
- `/templates` and `/templates/[id]` - static template gallery and details
- `/how-it-works` - Roblox UI workflow overview
- `/pricing` - beta pricing and FAQs
- `/blog` and `/blog/[slug]` - local blog index and article pages
- `/documentation` - quick-start documentation landing
- `/contact` - contact channels and waitlist CTA

The waitlist UI posts to the existing `app/api/waitlist/route.ts` endpoint. Template, blog, pricing, docs, nav, contact, and image prompt content is currently local typed data so the frontend can ship without adding CMS or backend complexity.

## Authenticated Generation Foundation

Protected Clerk routes:

- `/dashboard` - generation-focused activation dashboard
- `/generate` - primary prompt to preview to export workflow
- `/projects` - generation history surface
- `/settings` - generation defaults
- `/billing` - mock-safe billing readiness

Generation APIs:

- `POST /api/generate/optimize`
- `POST /api/generate/assets`
- `POST /api/generate/export`
- `GET /api/generations`
- `POST /api/usage/event`
- `GET /api/settings`
- `POST /api/settings`
- `GET /api/billing/status`

The authenticated flow is mock-safe by default. It does not require external LLM, image, billing, or database keys for local development. Export returns a `json_payload` package containing `manifest.json`, `layout.json`, `code/MainUI.lua`, and `assets/assets.json`.

## Brand + Distribution Assets

Launch/distribution scaffolding now lives in-repo:

- `assets/brand-guidelines.md` — logo, palette, typography, voice, usage rules
- `public/brand/` — favicons, app icons, emblem, wordmark, square avatar
- `public/generated/brand/` — launch banners, social headers, template header art
- `public/press-kit/` — downloadable press ZIP and one-page overview PDF
- `emails/` — branded HTML email templates
- `marketing/social-captions/` — bios, launch posts, content calendar, forum copy
- `docs/distribution-setup.md` — manual platform activation instructions
- `docs/distribution-strategy.md` — channel priorities and launch KPI plan

## Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS v4
- **Auth:** Clerk
- **Database:** Supabase
- **Payments:** Lemon Squeezy
- **AI:** Deterministic mock foundation for authenticated generation; Replicate remains for the legacy public API route
- **Deployment:** Vercel

## Development

```bash
# Start dev server
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Format code
npm run format
```

## Deployment

Deploy to Vercel:

```bash
vercel
```

Or push to GitHub and connect via Vercel dashboard.

## License

MIT
