-- HUDForge legacy table cleanup plan
-- Run only after confirming the exact deletion list.

begin;

drop function if exists public.update_daily_mrr_snapshot() cascade;
drop function if exists public.calculate_mrr_for_date(date) cascade;
drop function if exists public.update_subscription_updated_at() cascade;

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

-- Verification: should return only waitlist + hudforge_* app tables from public schema.
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_type = 'BASE TABLE'
order by table_name;
