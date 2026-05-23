import { NextResponse } from 'next/server'
import { getHudforgeUserId } from '@/lib/hudforge-auth'
import { getHudforgeAnalyticsSummary } from '@/lib/analytics'

export async function GET() {
  const userId = await getHudforgeUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const summary = await getHudforgeAnalyticsSummary({ windowDays: 30 })
  return NextResponse.json(summary)
}
