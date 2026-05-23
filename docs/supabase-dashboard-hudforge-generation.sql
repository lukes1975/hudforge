-- HUDForge authenticated generation persistence + credit ledger
-- Run this in Supabase Dashboard → SQL Editor for project: hudforge-waitlist-live
-- Project ref: dauhewahzjrvrszemclj
--
-- Safe to re-run: uses CREATE TABLE IF NOT EXISTS, CREATE INDEX IF NOT EXISTS,
-- CREATE OR REPLACE FUNCTION, and DROP TRIGGER IF EXISTS before trigger creation.
--
-- Important architecture note:
-- HUDForge uses Clerk auth user IDs, not Supabase Auth user IDs. These tables keep
-- RLS enabled and intentionally do not expose direct browser policies. The Next.js
-- server routes access them using SUPABASE_SERVICE_ROLE_KEY only.

begin;

create extension if not exists "uuid-ossp";

create table if not exists public.hudforge_profiles (
    user_id text primary key,
    email text,
    display_name text,
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null,
    metadata jsonb default '{}'::jsonb not null
);

create table if not exists public.hudforge_generations (
    id text primary key,
    user_id text not null references public.hudforge_profiles(user_id) on delete cascade,
    title text not null,
    prompt text not null,
    ui_type text not null check (ui_type in ('shop_ui', 'hud', 'inventory', 'main_menu', 'reward_screen')),
    style text not null check (style in ('neon', 'cartoon', 'sci_fi', 'anime', 'minimal', 'premium')),
    status text not null check (status in ('idle', 'optimizing', 'optimized', 'generating_assets', 'assets_ready', 'preview_ready', 'exporting', 'exported', 'failed')),
    optimized_spec jsonb,
    asset_bundle jsonb,
    export_package jsonb,
    error text,
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null
);

create table if not exists public.hudforge_user_settings (
    user_id text primary key references public.hudforge_profiles(user_id) on delete cascade,
    settings jsonb not null default '{"default_export_format":"zip","mobile_first":true,"default_ui_type":"shop_ui","default_style":"neon","save_history":true}'::jsonb,
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null
);

create table if not exists public.hudforge_usage_events (
    id uuid default uuid_generate_v4() primary key,
    user_id text not null references public.hudforge_profiles(user_id) on delete cascade,
    generation_id text references public.hudforge_generations(id) on delete set null,
    event_name text not null,
    metadata jsonb default '{}'::jsonb not null,
    created_at timestamp with time zone default now() not null
);

create table if not exists public.hudforge_credit_ledger (
    id uuid default uuid_generate_v4() primary key,
    user_id text not null references public.hudforge_profiles(user_id) on delete cascade,
    generation_id text references public.hudforge_generations(id) on delete set null,
    delta integer not null,
    balance_after integer not null,
    reason text not null check (reason in ('initial_free_grant', 'generation_optimize', 'asset_generation', 'asset_generation_refund', 'manual_adjustment')),
    metadata jsonb default '{}'::jsonb not null,
    created_at timestamp with time zone default now() not null
);

create table if not exists public.hudforge_subscriptions (
    id uuid default uuid_generate_v4() primary key,
    user_id text not null references public.hudforge_profiles(user_id) on delete cascade,
    state text not null check (state in ('free', 'trial', 'active_paid', 'past_due', 'canceled', 'unknown_mock')) default 'free',
    lemon_squeezy_customer_id text,
    lemon_squeezy_subscription_id text,
    lemon_squeezy_variant_id text,
    plan_id text,
    current_period_start timestamp with time zone,
    current_period_end timestamp with time zone,
    cancel_at_period_end boolean default false not null,
    metadata jsonb default '{}'::jsonb not null,
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null
);

create index if not exists idx_hudforge_generations_user_updated on public.hudforge_generations(user_id, updated_at desc);
create index if not exists idx_hudforge_generations_status on public.hudforge_generations(status);
create index if not exists idx_hudforge_usage_events_user_created on public.hudforge_usage_events(user_id, created_at desc);
create index if not exists idx_hudforge_usage_events_generation on public.hudforge_usage_events(generation_id);
create index if not exists idx_hudforge_credit_ledger_user_created on public.hudforge_credit_ledger(user_id, created_at asc);
create index if not exists idx_hudforge_subscriptions_user_state on public.hudforge_subscriptions(user_id, state);

alter table public.hudforge_profiles enable row level security;
alter table public.hudforge_generations enable row level security;
alter table public.hudforge_user_settings enable row level security;
alter table public.hudforge_usage_events enable row level security;
alter table public.hudforge_credit_ledger enable row level security;
alter table public.hudforge_subscriptions enable row level security;

-- No direct authenticated/anonymous policies are created yet.
-- Service role bypasses RLS from server-only route handlers.

create or replace function public.hudforge_touch_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

drop trigger if exists trigger_hudforge_profiles_updated_at on public.hudforge_profiles;
create trigger trigger_hudforge_profiles_updated_at before update on public.hudforge_profiles for each row execute function public.hudforge_touch_updated_at();

drop trigger if exists trigger_hudforge_generations_updated_at on public.hudforge_generations;
create trigger trigger_hudforge_generations_updated_at before update on public.hudforge_generations for each row execute function public.hudforge_touch_updated_at();

drop trigger if exists trigger_hudforge_user_settings_updated_at on public.hudforge_user_settings;
create trigger trigger_hudforge_user_settings_updated_at before update on public.hudforge_user_settings for each row execute function public.hudforge_touch_updated_at();

drop trigger if exists trigger_hudforge_subscriptions_updated_at on public.hudforge_subscriptions;
create trigger trigger_hudforge_subscriptions_updated_at before update on public.hudforge_subscriptions for each row execute function public.hudforge_touch_updated_at();

commit;

-- Verification query. Run after the transaction succeeds.
select
  c.relname as table_name,
  c.relrowsecurity as row_level_security_enabled
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind = 'r'
  and c.relname in (
    'hudforge_profiles',
    'hudforge_generations',
    'hudforge_user_settings',
    'hudforge_usage_events',
    'hudforge_credit_ledger',
    'hudforge_subscriptions'
  )
order by c.relname;
