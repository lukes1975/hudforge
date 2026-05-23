-- HUDForge authenticated generation persistence + credit ledger
-- Created: 2026-05-23

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS hudforge_profiles (
    user_id TEXT PRIMARY KEY,
    email TEXT,
    display_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL
);

CREATE TABLE IF NOT EXISTS hudforge_generations (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES hudforge_profiles(user_id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    prompt TEXT NOT NULL,
    ui_type TEXT NOT NULL CHECK (ui_type IN ('shop_ui', 'hud', 'inventory', 'main_menu', 'reward_screen')),
    style TEXT NOT NULL CHECK (style IN ('neon', 'cartoon', 'sci_fi', 'anime', 'minimal', 'premium')),
    status TEXT NOT NULL CHECK (status IN ('idle', 'optimizing', 'optimized', 'generating_assets', 'assets_ready', 'preview_ready', 'exporting', 'exported', 'failed')),
    optimized_spec JSONB,
    asset_bundle JSONB,
    export_package JSONB,
    error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS hudforge_user_settings (
    user_id TEXT PRIMARY KEY REFERENCES hudforge_profiles(user_id) ON DELETE CASCADE,
    settings JSONB NOT NULL DEFAULT '{"default_export_format":"zip","mobile_first":true,"default_ui_type":"shop_ui","default_style":"neon","save_history":true}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS hudforge_usage_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES hudforge_profiles(user_id) ON DELETE CASCADE,
    generation_id TEXT REFERENCES hudforge_generations(id) ON DELETE SET NULL,
    event_name TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS hudforge_credit_ledger (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES hudforge_profiles(user_id) ON DELETE CASCADE,
    generation_id TEXT REFERENCES hudforge_generations(id) ON DELETE SET NULL,
    delta INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    reason TEXT NOT NULL CHECK (reason IN ('initial_free_grant', 'generation_optimize', 'asset_generation', 'asset_generation_refund', 'manual_adjustment')),
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS hudforge_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES hudforge_profiles(user_id) ON DELETE CASCADE,
    state TEXT NOT NULL CHECK (state IN ('free', 'trial', 'active_paid', 'past_due', 'canceled', 'unknown_mock')) DEFAULT 'free',
    lemon_squeezy_customer_id TEXT,
    lemon_squeezy_subscription_id TEXT,
    lemon_squeezy_variant_id TEXT,
    plan_id TEXT,
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT false NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_hudforge_generations_user_updated ON hudforge_generations(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_hudforge_generations_status ON hudforge_generations(status);
CREATE INDEX IF NOT EXISTS idx_hudforge_usage_events_user_created ON hudforge_usage_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_hudforge_usage_events_generation ON hudforge_usage_events(generation_id);
CREATE INDEX IF NOT EXISTS idx_hudforge_credit_ledger_user_created ON hudforge_credit_ledger(user_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_hudforge_subscriptions_user_state ON hudforge_subscriptions(user_id, state);

ALTER TABLE hudforge_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE hudforge_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE hudforge_user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE hudforge_usage_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE hudforge_credit_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE hudforge_subscriptions ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS. Authenticated user policies are intentionally not added yet
-- because Clerk user IDs are not Supabase auth.uid() values. App access goes through
-- server-side route handlers using SUPABASE_SERVICE_ROLE_KEY.

CREATE OR REPLACE FUNCTION hudforge_touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_hudforge_profiles_updated_at ON hudforge_profiles;
CREATE TRIGGER trigger_hudforge_profiles_updated_at BEFORE UPDATE ON hudforge_profiles FOR EACH ROW EXECUTE FUNCTION hudforge_touch_updated_at();

DROP TRIGGER IF EXISTS trigger_hudforge_generations_updated_at ON hudforge_generations;
CREATE TRIGGER trigger_hudforge_generations_updated_at BEFORE UPDATE ON hudforge_generations FOR EACH ROW EXECUTE FUNCTION hudforge_touch_updated_at();

DROP TRIGGER IF EXISTS trigger_hudforge_user_settings_updated_at ON hudforge_user_settings;
CREATE TRIGGER trigger_hudforge_user_settings_updated_at BEFORE UPDATE ON hudforge_user_settings FOR EACH ROW EXECUTE FUNCTION hudforge_touch_updated_at();

DROP TRIGGER IF EXISTS trigger_hudforge_subscriptions_updated_at ON hudforge_subscriptions;
CREATE TRIGGER trigger_hudforge_subscriptions_updated_at BEFORE UPDATE ON hudforge_subscriptions FOR EACH ROW EXECUTE FUNCTION hudforge_touch_updated_at();
