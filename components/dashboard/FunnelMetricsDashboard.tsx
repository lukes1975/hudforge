'use client'

import { useState } from 'react'

interface FunnelData {
  stage: string
  count: number
  percentage: number
  conversionRate: number
}

const initialFunnelData: FunnelData[] = [
  { stage: 'Visitors', count: 10000, percentage: 100, conversionRate: 100 },
  { stage: 'Waitlist Signups', count: 1500, percentage: 15, conversionRate: 15 },
  { stage: 'Activated Users', count: 300, percentage: 3, conversionRate: 20 },
  { stage: 'Paying Users', count: 45, percentage: 0.45, conversionRate: 15 },
]

export default function FunnelMetricsDashboard() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('month')
  const funnelData = initialFunnelData

  const targetRates = {
    visitorsToWaitlist: 15,
    waitlistToActivated: 20,
    activatedToPaying: 15,
  }

  const currentRates = {
    visitorsToWaitlist: funnelData[1].percentage,
    waitlistToActivated: funnelData[2].conversionRate,
    activatedToPaying: funnelData[3].conversionRate,
  }

  const calculateRequiredVisitors = () => {
    const requiredPaying = 800
    const requiredActivated = Math.ceil(requiredPaying / (targetRates.activatedToPaying / 100))
    const requiredWaitlist = Math.ceil(requiredActivated / (targetRates.waitlistToActivated / 100))
    const requiredVisitors = Math.ceil(requiredWaitlist / (targetRates.visitorsToWaitlist / 100))

    return { requiredVisitors, requiredWaitlist, requiredActivated, requiredPaying }
  }

  const required = calculateRequiredVisitors()

  return (
    <div className="rounded-2xl border border-gray-700 bg-gradient-to-br from-gray-800/30 to-gray-900/30 p-6">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-xl font-semibold">User Acquisition Funnel</h3>
        <div className="flex gap-2">
          <button onClick={() => setTimeRange('week')} className={`rounded-lg px-3 py-1 text-sm ${timeRange === 'week' ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-300'}`}>
            1W
          </button>
          <button onClick={() => setTimeRange('month')} className={`rounded-lg px-3 py-1 text-sm ${timeRange === 'month' ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-300'}`}>
            1M
          </button>
          <button onClick={() => setTimeRange('quarter')} className={`rounded-lg px-3 py-1 text-sm ${timeRange === 'quarter' ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-300'}`}>
            3M
          </button>
        </div>
      </div>

      <div className="mb-8 space-y-6">
        {funnelData.map((stage, idx) => (
          <div key={stage.stage} className="relative">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 font-bold text-white">{idx + 1}</div>
                <div>
                  <div className="font-semibold">{stage.stage}</div>
                  <div className="text-sm text-gray-400">
                    {stage.count.toLocaleString()} users • {stage.percentage.toFixed(1)}% of visitors
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{stage.count.toLocaleString()}</div>
                {idx > 0 ? (
                  <div className={`text-sm ${stage.conversionRate >= targetRates[Object.keys(targetRates)[idx - 1] as keyof typeof targetRates] ? 'text-green-400' : 'text-red-400'}`}>
                    {stage.conversionRate}% conversion
                  </div>
                ) : null}
              </div>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-gray-800">
              <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500" style={{ width: `${stage.percentage}%` }} />
            </div>

            {idx > 0 ? (
              <div className="absolute right-0 top-0 text-xs text-gray-500">Target: {targetRates[Object.keys(targetRates)[idx - 1] as keyof typeof targetRates]}%</div>
            ) : null}
          </div>
        ))}
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg bg-gray-800/50 p-4">
          <div className="text-sm text-gray-400">Visitors → Waitlist</div>
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-bold">{currentRates.visitorsToWaitlist}%</div>
            <div className="text-sm text-gray-500">/ {targetRates.visitorsToWaitlist}% target</div>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-700">
            <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-600" style={{ width: `${(currentRates.visitorsToWaitlist / targetRates.visitorsToWaitlist) * 100}%` }} />
          </div>
        </div>
        <div className="rounded-lg bg-gray-800/50 p-4">
          <div className="text-sm text-gray-400">Waitlist → Activated</div>
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-bold">{currentRates.waitlistToActivated}%</div>
            <div className="text-sm text-gray-500">/ {targetRates.waitlistToActivated}% target</div>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-700">
            <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-600" style={{ width: `${(currentRates.waitlistToActivated / targetRates.waitlistToActivated) * 100}%` }} />
          </div>
        </div>
        <div className="rounded-lg bg-gray-800/50 p-4">
          <div className="text-sm text-gray-400">Activated → Paying</div>
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-bold">{currentRates.activatedToPaying}%</div>
            <div className="text-sm text-gray-500">/ {targetRates.activatedToPaying}% target</div>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-700">
            <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-600" style={{ width: `${(currentRates.activatedToPaying / targetRates.activatedToPaying) * 100}%` }} />
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-gradient-to-r from-gray-800/50 to-gray-900/50 p-6">
        <h4 className="mb-4 font-semibold">Traffic Required for £10k MRR</h4>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="text-center">
            <div className="text-sm text-gray-400">Visitors</div>
            <div className="text-2xl font-bold">{required.requiredVisitors.toLocaleString()}</div>
            <div className="text-xs text-gray-500">Monthly</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-400">Waitlist</div>
            <div className="text-2xl font-bold">{required.requiredWaitlist.toLocaleString()}</div>
            <div className="text-xs text-gray-500">Signups</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-400">Activated</div>
            <div className="text-2xl font-bold">{required.requiredActivated.toLocaleString()}</div>
            <div className="text-xs text-gray-500">Users</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-400">Paying</div>
            <div className="text-2xl font-bold">{required.requiredPaying.toLocaleString()}</div>
            <div className="text-xs text-gray-500">Customers</div>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-400">
          Based on target conversion rates: {targetRates.visitorsToWaitlist}% → {targetRates.waitlistToActivated}% → {targetRates.activatedToPaying}%
        </div>
      </div>

      <div className="mt-6 rounded-lg bg-gradient-to-r from-gray-800/50 to-gray-900/50 p-4">
        <h4 className="mb-3 font-semibold">Weekly Acquisition Targets</h4>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="text-center">
            <div className="text-sm text-gray-400">New Visitors</div>
            <div className="text-xl font-bold">{Math.ceil(required.requiredVisitors / 4.33).toLocaleString()}</div>
            <div className="text-xs text-gray-500">per week</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-400">Waitlist Adds</div>
            <div className="text-xl font-bold">{Math.ceil(required.requiredWaitlist / 4.33).toLocaleString()}</div>
            <div className="text-xs text-gray-500">per week</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-400">Activations</div>
            <div className="text-xl font-bold">{Math.ceil(required.requiredActivated / 4.33).toLocaleString()}</div>
            <div className="text-xs text-gray-500">per week</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-400">Paid Conversions</div>
            <div className="text-xl font-bold">{Math.ceil(required.requiredPaying / 4.33).toLocaleString()}</div>
            <div className="text-xs text-gray-500">per week</div>
          </div>
        </div>
      </div>
    </div>
  )
}
