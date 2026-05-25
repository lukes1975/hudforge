import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { buildHudforgeAnalyticsSummary, type HudforgeAnalyticsRows } from '../lib/analytics'

describe('HUDForge durable analytics summary', () => {
  it('summarizes activation, export, credits, failures, and paid conversion from hudforge tables', () => {
    const now = new Date('2026-05-23T12:00:00.000Z')
    const rows: HudforgeAnalyticsRows = {
      profiles: [{ user_id: 'u1', created_at: '2026-05-23T09:00:00.000Z' }, { user_id: 'u2', created_at: '2026-05-23T10:00:00.000Z' }],
      generations: [
        { id: 'g1', user_id: 'u1', status: 'exported', created_at: '2026-05-23T09:10:00.000Z', updated_at: '2026-05-23T09:30:00.000Z' },
        { id: 'g2', user_id: 'u2', status: 'failed', created_at: '2026-05-23T10:10:00.000Z', updated_at: '2026-05-23T10:20:00.000Z', error: 'FAL failed' },
        { id: 'g3', user_id: 'u1', status: 'assets_ready', created_at: '2026-05-23T11:10:00.000Z', updated_at: '2026-05-23T11:20:00.000Z' },
      ],
      usageEvents: [
        { id: 'e1', user_id: 'u1', event_name: 'generation_started', generation_id: 'g1', created_at: '2026-05-23T09:10:00.000Z', metadata: {} },
        { id: 'e2', user_id: 'u1', event_name: 'export_clicked', generation_id: 'g1', created_at: '2026-05-23T09:30:00.000Z', metadata: {} },
        { id: 'e3', user_id: 'u2', event_name: 'generation_failed', generation_id: 'g2', created_at: '2026-05-23T10:20:00.000Z', metadata: { stage: 'assets' } },
      ],
      creditLedger: [
        { id: 'c1', user_id: 'u1', delta: 25, balance_after: 25, reason: 'initial_free_grant', created_at: '2026-05-23T09:00:00.000Z' },
        { id: 'c2', user_id: 'u1', delta: -1, balance_after: 24, reason: 'generation_optimize', generation_id: 'g1', created_at: '2026-05-23T09:10:00.000Z' },
        { id: 'c3', user_id: 'u1', delta: -5, balance_after: 19, reason: 'asset_generation', generation_id: 'g1', created_at: '2026-05-23T09:15:00.000Z' },
        { id: 'c4', user_id: 'u2', delta: 5, balance_after: 24, reason: 'asset_generation_refund', generation_id: 'g2', created_at: '2026-05-23T10:20:00.000Z' },
      ],
      subscriptions: [{ id: 's1', user_id: 'u1', state: 'active_paid', created_at: '2026-05-23T09:40:00.000Z' }],
    }

    const summary = buildHudforgeAnalyticsSummary(rows, { now, windowDays: 7 })

    expect(summary.funnel).toEqual([
      { stage: 'signed_up', count: 2, conversion_rate: null },
      { stage: 'generated', count: 2, conversion_rate: 1 },
      { stage: 'exported', count: 1, conversion_rate: 0.5 },
      { stage: 'paid', count: 1, conversion_rate: 1 },
    ])
    expect(summary.generation.total).toBe(3)
    expect(summary.generation.exported).toBe(1)
    expect(summary.generation.failed).toBe(1)
    expect(summary.generation.export_rate).toBeCloseTo(1 / 3)
    expect(summary.generation.success_rate).toBeCloseTo(2 / 3)
    expect(summary.credits.granted).toBe(30)
    expect(summary.credits.spent).toBe(6)
    expect(summary.credits.refunded).toBe(5)
    expect(summary.credits.net_balance).toBe(24)
    expect(summary.health.blockers).toContain('1 failed generation needs retry/error polish')
    expect(summary.revenue.active_paid_users).toBe(1)
  })

  it('does not depend on removed legacy analytics tables', () => {
    const source = readFileSync(new URL('../lib/analytics.ts', import.meta.url), 'utf8')
    for (const removedTable of ['mrr_snapshots', 'alert_definitions', 'alert_triggers', 'cohort_retention', 'revenue_events', 'user_sessions', "from('users')", "from('subscriptions')"]) {
      expect(source).not.toContain(removedTable)
    }
  })
})
