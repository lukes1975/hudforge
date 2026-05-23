import { getHudforgeAnalyticsSummary, type HudforgeAnalyticsSummary } from './analytics'

export interface HudforgeDashboardData {
  analytics: HudforgeAnalyticsSummary
  lastUpdated: string
}

export async function updateAnalytics() {
  const analytics = await getHudforgeAnalyticsSummary({ windowDays: 30 })
  return {
    success: true,
    providerFailures: analytics.health.provider_failures,
    blockers: analytics.health.blockers,
    lastUpdated: analytics.generated_at,
  }
}

export async function getDashboardData(): Promise<HudforgeDashboardData> {
  const analytics = await getHudforgeAnalyticsSummary({ windowDays: 30 })
  return {
    analytics,
    lastUpdated: analytics.generated_at,
  }
}
