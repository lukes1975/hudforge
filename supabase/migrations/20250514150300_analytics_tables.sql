-- Analytics tables for HUDForge £10k MRR objective validation framework
-- Created: 2025-05-14

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================== USER FUNNEL & ACQUISITION ====================

-- Waitlist signups (existing table from waitlist feature)
CREATE TABLE IF NOT EXISTS waitlist (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    source TEXT, -- 'landing_page', 'twitter', 'discord', etc.
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Users table (when authentication is implemented)
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    onboarded_at TIMESTAMP WITH TIME ZONE,
    stripe_customer_id TEXT,
    lemon_squeezy_customer_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Subscription plans
CREATE TABLE IF NOT EXISTS plans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL, -- 'Pro', 'Team', 'Enterprise'
    price_monthly INTEGER NOT NULL, -- in pence (£)
    price_yearly INTEGER, -- in pence (£)
    features JSONB DEFAULT '[]'::jsonb,
    lemon_squeezy_variant_id TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions (paying customers)
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES plans(id),
    status TEXT NOT NULL, -- 'active', 'past_due', 'canceled', 'trialing'
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT false,
    lemon_squeezy_subscription_id TEXT,
    lemon_squeezy_order_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== REVENUE & METRICS ====================

-- Revenue events (MRR calculations)
CREATE TABLE IF NOT EXISTS revenue_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL, -- in pence (£)
    currency TEXT DEFAULT 'GBP',
    type TEXT NOT NULL, -- 'subscription_created', 'subscription_renewed', 'refund', 'one_time'
    event_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Monthly recurring revenue (MRR) snapshot
CREATE TABLE IF NOT EXISTS mrr_snapshots (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    snapshot_date DATE NOT NULL UNIQUE,
    total_mrr INTEGER NOT NULL, -- in pence (£)
    new_mrr INTEGER NOT NULL, -- MRR from new customers this month
    expansion_mrr INTEGER NOT NULL, -- MRR from upgrades/expansions
    churned_mrr INTEGER NOT NULL, -- MRR lost from churn
    net_new_mrr INTEGER NOT NULL, -- (new + expansion) - churned
    active_customers INTEGER NOT NULL,
    new_customers INTEGER NOT NULL,
    churned_customers INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== USER BEHAVIOR & ACTIVITY ====================

-- User sessions/traffic (from Vercel Analytics or custom tracking)
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    session_id TEXT NOT NULL,
    referrer TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    user_agent TEXT,
    ip_address INET,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Feature usage events
CREATE TABLE IF NOT EXISTS feature_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- 'generation_started', 'generation_completed', 'export_downloaded', 'preview_viewed'
    feature_name TEXT NOT NULL, -- 'ui_generator', 'luau_exporter', 'preview'
    duration_ms INTEGER, -- how long the operation took
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== RETENTION & CHURN ====================

-- User cohorts (based on signup month)
CREATE TABLE IF NOT EXISTS user_cohorts (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE PRIMARY KEY,
    cohort_date DATE NOT NULL, -- first day of signup month
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cohort retention tracking
CREATE TABLE IF NOT EXISTS cohort_retention (
    cohort_date DATE NOT NULL,
    month_offset INTEGER NOT NULL, -- months since cohort
    retained_users INTEGER NOT NULL, -- users active in this month
    total_cohort_users INTEGER NOT NULL, -- total users in cohort
    retention_rate DECIMAL(5,4) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (cohort_date, month_offset)
);

-- Churn events
CREATE TABLE IF NOT EXISTS churn_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
    churn_date DATE NOT NULL,
    churn_type TEXT NOT NULL, -- 'voluntary', 'involuntary', 'downgrade'
    churn_reason TEXT,
    revenue_lost INTEGER NOT NULL, -- in pence (£)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== ALERTS & NOTIFICATIONS ====================

-- Alert definitions
CREATE TABLE IF NOT EXISTS alert_definitions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    metric TEXT NOT NULL, -- 'mrr_growth', 'user_acquisition', 'churn_rate', 'conversion_rate'
    threshold DECIMAL NOT NULL,
    operator TEXT NOT NULL, -- '>', '<', '=', '!='
    check_frequency TEXT NOT NULL, -- 'daily', 'weekly', 'monthly'
    is_active BOOLEAN DEFAULT true,
    notification_channels JSONB DEFAULT '["email"]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alert triggers
CREATE TABLE IF NOT EXISTS alert_triggers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    alert_definition_id UUID REFERENCES alert_definitions(id) ON DELETE CASCADE,
    triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metric_value DECIMAL NOT NULL,
    threshold DECIMAL NOT NULL,
    is_resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    resolved_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== INDEXES ====================

CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON waitlist(created_at);
CREATE INDEX IF NOT EXISTS idx_waitlist_source ON waitlist(source);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_period_end ON subscriptions(current_period_end);
CREATE INDEX IF NOT EXISTS idx_revenue_events_event_time ON revenue_events(event_time);
CREATE INDEX IF NOT EXISTS idx_mrr_snapshots_date ON mrr_snapshots(snapshot_date);
CREATE INDEX IF NOT EXISTS idx_feature_events_created_at ON feature_events(created_at);
CREATE INDEX IF NOT EXISTS idx_feature_events_user_event ON feature_events(user_id, event_type);
CREATE INDEX IF NOT EXISTS idx_user_sessions_started_at ON user_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_cohort_retention_cohort ON cohort_retention(cohort_date, month_offset);
CREATE INDEX IF NOT EXISTS idx_churn_events_churn_date ON churn_events(churn_date);
CREATE INDEX IF NOT EXISTS idx_alert_triggers_triggered_at ON alert_triggers(triggered_at);

-- ==================== FUNCTIONS ====================

-- Function to calculate MRR for a given date
CREATE OR REPLACE FUNCTION calculate_mrr_for_date(target_date DATE)
RETURNS TABLE (
    total_mrr INTEGER,
    new_mrr INTEGER,
    expansion_mrr INTEGER,
    churned_mrr INTEGER,
    net_new_mrr INTEGER,
    active_customers INTEGER,
    new_customers INTEGER,
    churned_customers INTEGER
) AS $$
DECLARE
    start_of_month DATE := DATE_TRUNC('month', target_date)::DATE;
    end_of_month DATE := (DATE_TRUNC('month', target_date) + INTERVAL '1 month' - INTERVAL '1 day')::DATE;
BEGIN
    RETURN QUERY
    WITH active_subscriptions AS (
        SELECT 
            s.id,
            s.user_id,
            p.price_monthly,
            s.created_at,
            s.current_period_start,
            s.current_period_end
        FROM subscriptions s
        JOIN plans p ON s.plan_id = p.id
        WHERE s.status = 'active'
          AND s.current_period_start <= end_of_month
          AND s.current_period_end >= start_of_month
    ),
    new_customers AS (
        SELECT COUNT(DISTINCT user_id) as count,
               SUM(price_monthly) as mrr
        FROM active_subscriptions
        WHERE DATE_TRUNC('month', created_at)::DATE = start_of_month
    ),
    churned_customers AS (
        SELECT COUNT(DISTINCT s.user_id) as count,
               SUM(p.price_monthly) as mrr
        FROM subscriptions s
        JOIN plans p ON s.plan_id = p.id
        WHERE s.status IN ('canceled', 'past_due')
          AND DATE_TRUNC('month', s.updated_at)::DATE = start_of_month
    ),
    all_customers AS (
        SELECT COUNT(DISTINCT user_id) as count
        FROM active_subscriptions
    )
    SELECT 
        COALESCE(SUM(price_monthly), 0)::INTEGER as total_mrr,
        COALESCE(new_customers.mrr, 0)::INTEGER as new_mrr,
        0::INTEGER as expansion_mrr, -- Simplified for now
        COALESCE(churned_customers.mrr, 0)::INTEGER as churned_mrr,
        (COALESCE(new_customers.mrr, 0) - COALESCE(churned_customers.mrr, 0))::INTEGER as net_new_mrr,
        COALESCE(all_customers.count, 0)::INTEGER as active_customers,
        COALESCE(new_customers.count, 0)::INTEGER as new_customers,
        COALESCE(churned_customers.count, 0)::INTEGER as churned_customers
    FROM active_subscriptions, new_customers, churned_customers, all_customers
    GROUP BY new_customers.mrr, new_customers.count, churned_customers.mrr, churned_customers.count, all_customers.count;
END;
$$ LANGUAGE plpgsql;

-- Function to update MRR snapshot for today
CREATE OR REPLACE FUNCTION update_daily_mrr_snapshot()
RETURNS VOID AS $$
DECLARE
    today DATE := CURRENT_DATE;
    snapshot RECORD;
BEGIN
    SELECT * INTO snapshot FROM calculate_mrr_for_date(today);
    
    INSERT INTO mrr_snapshots (
        snapshot_date,
        total_mrr,
        new_mrr,
        expansion_mrr,
        churned_mrr,
        net_new_mrr,
        active_customers,
        new_customers,
        churned_customers
    ) VALUES (
        today,
        snapshot.total_mrr,
        snapshot.new_mrr,
        snapshot.expansion_mrr,
        snapshot.churned_mrr,
        snapshot.net_new_mrr,
        snapshot.active_customers,
        snapshot.new_customers,
        snapshot.churned_customers
    )
    ON CONFLICT (snapshot_date) DO UPDATE SET
        total_mrr = EXCLUDED.total_mrr,
        new_mrr = EXCLUDED.new_mrr,
        expansion_mrr = EXCLUDED.expansion_mrr,
        churned_mrr = EXCLUDED.churned_mrr,
        net_new_mrr = EXCLUDED.net_new_mrr,
        active_customers = EXCLUDED.active_customers,
        new_customers = EXCLUDED.new_customers,
        churned_customers = EXCLUDED.churned_customers,
        created_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- ==================== TRIGGERS ====================

-- Auto-update subscription updated_at
CREATE OR REPLACE FUNCTION update_subscription_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_subscription_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_subscription_updated_at();

-- ==================== INITIAL DATA ====================

-- Insert default plans
INSERT INTO plans (name, price_monthly, price_yearly, features, is_active) VALUES
    ('Pro', 1999, 19990, '["Unlimited generations", "Priority support", "Commercial license"]', true),
    ('Team', 4999, 49990, '["Everything in Pro", "Team collaboration", "Shared asset library"]', true),
    ('Enterprise', 9999, NULL, '["Everything in Team", "Custom integrations", "SLA", "Dedicated support"]', true)
ON CONFLICT DO NOTHING;

-- Insert default alert definitions
INSERT INTO alert_definitions (name, description, metric, threshold, operator, check_frequency, is_active) VALUES
    ('mrr_growth_slow', 'MRR growth below target', 'net_new_mrr', 833, '<', 'weekly', true), -- £833/week = £3,332/month needed for £10k MRR in 3 months
    ('high_churn_rate', 'Churn rate above acceptable', 'churn_rate', 0.05, '>', 'weekly', true), -- 5% monthly churn
    ('low_conversion', 'Waitlist to paid conversion low', 'conversion_rate', 0.10, '<', 'weekly', true), -- 10% conversion from waitlist
    ('user_acquisition_slow', 'New users below target', 'new_users', 50, '<', 'weekly', true) -- 50 new users/week = 200/month = 800-1500 paying users
ON CONFLICT DO NOTHING;