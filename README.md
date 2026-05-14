# HUD Forge

AI-powered Roblox UI workflow platform. Generate production-ready transparent PNGs and clean Luau code from simple prompts.

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
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret

# Lemon Squeezy (for payments)
LEMON_SQUEEZY_API_KEY=your_lemon_squeezy_key
LEMON_SQUEEZY_STORE_ID=your_store_id
```

See `.env.local.example` for full list.

## Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Auth:** Clerk
- **Database:** Supabase
- **Payments:** Lemon Squeezy
- **AI:** Replicate (Flux models)
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
