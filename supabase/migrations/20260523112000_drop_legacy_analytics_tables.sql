-- Drop legacy analytics/billing tables that HUDForge no longer uses.
-- Keep:
--   - waitlist
--   - hudforge_profiles
--   - hudforge_generations
--   - hudforge_user_settings
--   - hudforge_usage_events
--   - hudforge_credit_ledger
--   - hudforge_subscriptions
--
-- Why: the old analytics schema used generic users/subscriptions/plans tables that conflict
-- with the current Clerk + hudforge_* SaaS model. Current app generation and waitlist paths
-- do not need these legacy tables.

begin;

-- Functions from the legacy analytics schema.
drop function if exists public.update_daily_mrr_snapshot() cascade;
drop function if exists public.calculate_mrr_for_date(date) cascade;
drop function if exists public.update_subscription_updated_at() cascade;

-- Legacy analytics/revenue/alert tables.
drop table if exists public.alert_triggers cascade;
drop table if exists public.alert_definitions cascade;
drop table if exists public.churn_events cascade;
drop table if exists public.cohort_retention cascade;
drop table if exists public.feature_events cascade;
drop table if exists public.mrr_snapshots cascade;
drop table if exists public.revenue_events cascade;
drop table if exists public.user_cohorts cascade;
drop table if exists public.user_sessions cascade;
drop table if exists public.subscriptions cascade;
drop table if exists public.plans cascade;
drop table if exists public.users cascade;

commit;
