# Supabase waitlist setup

Environment variables required:

- `NEXT_PUBLIC_SUPABASE_URL` — public Supabase project URL used by the client and API route.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — public anon key for client-side reads and any browser Supabase usage.
- `SUPABASE_SERVICE_ROLE_KEY` — server-only key used by `/api/waitlist` to write waitlist rows securely.

Database migration:

- `supabase/migrations/20250522120000_waitlist_table.sql`

Table shape:

- `id UUID PRIMARY KEY`
- `email TEXT UNIQUE NOT NULL`
- `created_at TIMESTAMPTZ DEFAULT NOW()`
- `source TEXT`
- `metadata JSONB DEFAULT '{}'::jsonb`

Notes:

- The waitlist route normalizes emails to lowercase and trims whitespace.
- Duplicate signups return a success response instead of a hard error.
- Server-side inserts use the Supabase service role key; do not expose it to the browser.
