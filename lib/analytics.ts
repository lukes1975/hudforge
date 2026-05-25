import type { GenerationStatus } from './hudforge-generation'

export type AnalyticsSubscriptionState = 'free' | 'trial' | 'active_paid' | 'past_due' | 'canceled' | 'unknown_mock'

export interface AnalyticsProfileRow { user_id: string; created_at: string }
export interface AnalyticsGenerationRow { id: string; user_id: string; status: GenerationStatus; created_at: string; updated_at: string; error?: string | null }
export interface AnalyticsUsageEventRow { id: string; user_id: string; event_name: string; generation_id?: string | null; created_at: string; metadata?: Record<string, unknown> | null }
export interface AnalyticsCreditLedgerRow { id: string; user_id: string; delta: number; balance_after: number; reason: string; generation_id?: string | null; created_at: string }
export interface AnalyticsSubscriptionRow { id: string; user_id: string; state: AnalyticsSubscriptionState; created_at: string }

export interface HudforgeAnalyticsRows {
  profiles: AnalyticsProfileRow[]
  generations: AnalyticsGenerationRow[]
  usageEvents: AnalyticsUsageEventRow[]
  creditLedger: AnalyticsCreditLedgerRow[]
  subscriptions: AnalyticsSubscriptionRow[]
}

export interface AnalyticsFunnelStage {
  stage: 'signed_up' | 'generated' | 'exported' | 'paid'
  count: number
  conversion_rate: number | null
}

export interface HudforgeAnalyticsSummary {
  generated_at: string
  window_days: number
  funnel: AnalyticsFunnelStage[]
  generation: {
    total: number
    optimized: number
    assets_ready: number
    exported: number
    failed: number
    export_rate: number
    success_rate: number
  }
  usage: {
    total_events: number
    unique_active_users: number
    by_event: Record<string, number>
  }
  credits: {
    granted: number
    spent: number
    refunded: number
    net_balance: number
  }
  revenue: {
    active_paid_users: number
    trial_users: number
    past_due_users: number
    canceled_users: number
  }
  health: {
    provider_failures: number
    blockers: string[]
  }
}

export interface HudforgeAnalyticsRepository {
  loadRows(startDate: Date, endDate: Date): Promise<HudforgeAnalyticsRows>
}

export function buildHudforgeAnalyticsSummary(
  rows: HudforgeAnalyticsRows,
  options: { now?: Date; windowDays?: number } = {}
): HudforgeAnalyticsSummary {
  const now = options.now ?? new Date()
  const windowDays = options.windowDays ?? 30
  const uniqueGeneratedUsers = unique(rows.generations.map((generation) => generation.user_id)).length
  const uniqueExportedUsers = unique(rows.generations.filter((generation) => generation.status === 'exported').map((generation) => generation.user_id)).length
  const activePaidUsers = unique(rows.subscriptions.filter((subscription) => subscription.state === 'active_paid').map((subscription) => subscription.user_id)).length
  const funnel: AnalyticsFunnelStage[] = [
    { stage: 'signed_up', count: rows.profiles.length, conversion_rate: null },
    { stage: 'generated', count: uniqueGeneratedUsers, conversion_rate: safeRate(uniqueGeneratedUsers, rows.profiles.length) },
    { stage: 'exported', count: uniqueExportedUsers, conversion_rate: safeRate(uniqueExportedUsers, uniqueGeneratedUsers) },
    { stage: 'paid', count: activePaidUsers, conversion_rate: safeRate(activePaidUsers, uniqueExportedUsers) },
  ]

  const generationCounts = countBy(rows.generations, (generation) => generation.status)
  const usageCounts = countBy(rows.usageEvents, (event) => event.event_name)
  const spent = Math.abs(sum(rows.creditLedger.filter((entry) => entry.delta < 0).map((entry) => entry.delta)))
  const refunded = sum(rows.creditLedger.filter((entry) => entry.reason.includes('refund') && entry.delta > 0).map((entry) => entry.delta))
  const granted = sum(rows.creditLedger.filter((entry) => entry.delta > 0).map((entry) => entry.delta))
  const providerFailures = rows.usageEvents.filter((event) => event.event_name === 'generation_failed').length + rows.generations.filter((generation) => generation.status === 'failed').length
  const blockers = buildBlockers(rows, providerFailures)

  return {
    generated_at: now.toISOString(),
    window_days: windowDays,
    funnel,
    generation: {
      total: rows.generations.length,
      optimized: generationCounts.optimized ?? 0,
      assets_ready: generationCounts.assets_ready ?? 0,
      exported: generationCounts.exported ?? 0,
      failed: generationCounts.failed ?? 0,
      export_rate: safeRate(generationCounts.exported ?? 0, rows.generations.length) ?? 0,
      success_rate: safeRate(rows.generations.length - (generationCounts.failed ?? 0), rows.generations.length) ?? 0,
    },
    usage: {
      total_events: rows.usageEvents.length,
      unique_active_users: unique(rows.usageEvents.map((event) => event.user_id)).length,
      by_event: usageCounts,
    },
    credits: {
      granted,
      spent,
      refunded,
      net_balance: sum(rows.creditLedger.map((entry) => entry.delta)),
    },
    revenue: {
      active_paid_users: activePaidUsers,
      trial_users: rows.subscriptions.filter((subscription) => subscription.state === 'trial').length,
      past_due_users: rows.subscriptions.filter((subscription) => subscription.state === 'past_due').length,
      canceled_users: rows.subscriptions.filter((subscription) => subscription.state === 'canceled').length,
    },
    health: {
      provider_failures: providerFailures,
      blockers,
    },
  }
}

export function supabaseHudforgeAnalyticsRepository(): HudforgeAnalyticsRepository {
  async function client() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) throw new Error('Supabase analytics is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.')
    const { createClient } = await import('@supabase/supabase-js')
    return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  }

  return {
    async loadRows(startDate, endDate) {
      const supabase = await client()
      const start = startDate.toISOString()
      const end = endDate.toISOString()
      const [profiles, generations, usageEvents, creditLedger, subscriptions] = await Promise.all([
        supabase.from('hudforge_profiles').select('user_id, created_at').gte('created_at', start).lte('created_at', end),
        supabase.from('hudforge_generations').select('id, user_id, status, created_at, updated_at, error').gte('created_at', start).lte('created_at', end),
        supabase.from('hudforge_usage_events').select('id, user_id, event_name, generation_id, created_at, metadata').gte('created_at', start).lte('created_at', end),
        supabase.from('hudforge_credit_ledger').select('id, user_id, delta, balance_after, reason, generation_id, created_at').gte('created_at', start).lte('created_at', end),
        supabase.from('hudforge_subscriptions').select('id, user_id, state, created_at').gte('created_at', start).lte('created_at', end),
      ])

      const failed = [profiles, generations, usageEvents, creditLedger, subscriptions].find((result) => result.error)
      if (failed?.error) throw failed.error

      return {
        profiles: (profiles.data ?? []) as AnalyticsProfileRow[],
        generations: (generations.data ?? []) as AnalyticsGenerationRow[],
        usageEvents: (usageEvents.data ?? []) as AnalyticsUsageEventRow[],
        creditLedger: (creditLedger.data ?? []) as AnalyticsCreditLedgerRow[],
        subscriptions: (subscriptions.data ?? []) as AnalyticsSubscriptionRow[],
      }
    },
  }
}

export async function getHudforgeAnalyticsSummary(options: { windowDays?: number; repository?: HudforgeAnalyticsRepository; now?: Date } = {}) {
  const now = options.now ?? new Date()
  const windowDays = options.windowDays ?? 30
  const startDate = new Date(now.getTime() - windowDays * 24 * 60 * 60 * 1000)
  const rows = await (options.repository ?? supabaseHudforgeAnalyticsRepository()).loadRows(startDate, now)
  return buildHudforgeAnalyticsSummary(rows, { now, windowDays })
}

export async function recordHudforgeRevenueEvent(userId: string, event: { amount_gbp_pence: number; provider: 'lemon_squeezy'; metadata?: Record<string, unknown> }) {
  const repository = supabaseHudforgeAnalyticsRepository()
  const now = new Date()
  const rows = await repository.loadRows(new Date(now.getTime() - 1), now)
  void rows
  return {
    user_id: userId,
    recorded: false,
    reason: 'Revenue events should be written through Lemon Squeezy webhook into hudforge_subscriptions and hudforge_credit_ledger.',
    amount_gbp_pence: event.amount_gbp_pence,
    provider: event.provider,
  }
}

function buildBlockers(rows: HudforgeAnalyticsRows, providerFailures: number) {
  const blockers: string[] = []
  const failedGenerations = rows.generations.filter((generation) => generation.status === 'failed').length
  if (failedGenerations > 0) blockers.push(`${failedGenerations} failed generation${failedGenerations === 1 ? '' : 's'} need${failedGenerations === 1 ? 's' : ''} retry/error polish`)
  if (providerFailures > failedGenerations) blockers.push('Provider failure events are being recorded; inspect FAL/OpenRouter health')
  if (rows.generations.length > 0 && !rows.generations.some((generation) => generation.status === 'exported')) blockers.push('Generations exist but exports are not happening yet')
  return blockers
}

function countBy<T>(rows: T[], getKey: (row: T) => string) {
  return rows.reduce<Record<string, number>>((counts, row) => {
    const key = getKey(row)
    counts[key] = (counts[key] ?? 0) + 1
    return counts
  }, {})
}

function safeRate(numerator: number, denominator: number) {
  if (denominator <= 0) return null
  return numerator / denominator
}

function unique(values: string[]) {
  return Array.from(new Set(values))
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0)
}
