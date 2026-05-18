'use client'

import { useState } from 'react'

interface WeeklyTarget {
  week: string
  startDate: string
  endDate: string
  mrrTarget: number
  newUsersTarget: number
  waitlistTarget: number
  activationsTarget: number
  paidConversionsTarget: number
  mrrActual?: number
  newUsersActual?: number
  waitlistActual?: number
  activationsActual?: number
  paidConversionsActual?: number
}

function buildWeeklyTargets(): WeeklyTarget[] {
  const targets: WeeklyTarget[] = []
  const startDate = new Date('2025-05-14')
  const targetMrr = 10000
  const weeklyMrrGrowth = targetMrr / 13
  let cumulativeMrr = 0

  for (let week = 1; week <= 13; week += 1) {
    const weekStart = new Date(startDate)
    weekStart.setDate(weekStart.getDate() + (week - 1) * 7)

    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)

    cumulativeMrr += weeklyMrrGrowth

    const weeklyPaidTarget = Math.ceil((weeklyMrrGrowth / 12.5) * 0.8)
    const weeklyActivationsTarget = Math.ceil(weeklyPaidTarget / 0.15)
    const weeklyWaitlistTarget = Math.ceil(weeklyActivationsTarget / 0.2)
    const weeklyNewUsersTarget = Math.ceil(weeklyWaitlistTarget / 0.15)

    targets.push({
      week: `Week ${week}`,
      startDate: weekStart.toISOString().split('T')[0],
      endDate: weekEnd.toISOString().split('T')[0],
      mrrTarget: Math.min(Math.round(cumulativeMrr), targetMrr),
      newUsersTarget: Math.round(weeklyNewUsersTarget),
      waitlistTarget: Math.round(weeklyWaitlistTarget),
      activationsTarget: Math.round(weeklyActivationsTarget),
      paidConversionsTarget: Math.round(weeklyPaidTarget),
      mrrActual: week <= 2 ? Math.round(cumulativeMrr * 0.3) : undefined,
      newUsersActual: week <= 2 ? Math.round(weeklyNewUsersTarget * 0.4) : undefined,
      waitlistActual: week <= 2 ? Math.round(weeklyWaitlistTarget * 0.5) : undefined,
      activationsActual: week <= 2 ? Math.round(weeklyActivationsTarget * 0.3) : undefined,
      paidConversionsActual: week <= 2 ? Math.round(weeklyPaidTarget * 0.2) : undefined,
    })
  }

  return targets
}

export default function WeeklyTargets() {
  const [currentWeek, setCurrentWeek] = useState(1)
  const weeklyTargets = buildWeeklyTargets()

  const currentTarget = weeklyTargets[currentWeek - 1] ?? weeklyTargets[0]
  const nextWeekTarget = weeklyTargets[currentWeek] ?? weeklyTargets[1]

  const calculateProgress = (actual?: number, target?: number) => {
    if (!actual || !target || target === 0) return 0
    return Math.min((actual / target) * 100, 100)
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-green-500'
    if (progress >= 70) return 'bg-green-400'
    if (progress >= 40) return 'bg-yellow-500'
    if (progress >= 20) return 'bg-orange-500'
    return 'bg-red-500'
  }

  return (
    <div className="h-full rounded-2xl border border-gray-700 bg-gradient-to-br from-gray-800/30 to-gray-900/30 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Weekly Targets</h3>
          <div className="text-sm text-gray-400">
            Week {currentWeek} of 13 • {currentTarget?.startDate} – {currentTarget?.endDate}
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setCurrentWeek(Math.max(1, currentWeek - 1))} disabled={currentWeek <= 1} className="rounded-lg bg-gray-800 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50">
            ←
          </button>
          <button onClick={() => setCurrentWeek(Math.min(13, currentWeek + 1))} disabled={currentWeek >= 13} className="rounded-lg bg-gray-800 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50">
            →
          </button>
        </div>
      </div>

      {currentTarget ? (
        <>
          <div className="mb-6 space-y-4">
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-gray-400">MRR Target</span>
                <span className="font-medium">£{(currentTarget.mrrTarget / 100).toFixed(2)}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-gray-700">
                <div className={`h-full ${getProgressColor(calculateProgress(currentTarget.mrrActual, currentTarget.mrrTarget))}`} style={{ width: `${calculateProgress(currentTarget.mrrActual, currentTarget.mrrTarget)}%` }} />
              </div>
              <div className="mt-1 text-xs text-gray-500">{currentTarget.mrrActual ? `£${(currentTarget.mrrActual / 100).toFixed(2)} actual` : 'No data yet'}</div>
            </div>

            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-gray-400">New Users</span>
                <span className="font-medium">{currentTarget.newUsersTarget}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-gray-700">
                <div className={`h-full ${getProgressColor(calculateProgress(currentTarget.newUsersActual, currentTarget.newUsersTarget))}`} style={{ width: `${calculateProgress(currentTarget.newUsersActual, currentTarget.newUsersTarget)}%` }} />
              </div>
              <div className="mt-1 text-xs text-gray-500">{currentTarget.newUsersActual ? `${currentTarget.newUsersActual} actual` : 'No data yet'}</div>
            </div>

            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-gray-400">Waitlist Signups</span>
                <span className="font-medium">{currentTarget.waitlistTarget}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-gray-700">
                <div className={`h-full ${getProgressColor(calculateProgress(currentTarget.waitlistActual, currentTarget.waitlistTarget))}`} style={{ width: `${calculateProgress(currentTarget.waitlistActual, currentTarget.waitlistTarget)}%` }} />
              </div>
              <div className="mt-1 text-xs text-gray-500">{currentTarget.waitlistActual ? `${currentTarget.waitlistActual} actual` : 'No data yet'}</div>
            </div>

            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-gray-400">Paid Conversions</span>
                <span className="font-medium">{currentTarget.paidConversionsTarget}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-gray-700">
                <div className={`h-full ${getProgressColor(calculateProgress(currentTarget.paidConversionsActual, currentTarget.paidConversionsTarget))}`} style={{ width: `${calculateProgress(currentTarget.paidConversionsActual, currentTarget.paidConversionsTarget)}%` }} />
              </div>
              <div className="mt-1 text-xs text-gray-500">{currentTarget.paidConversionsActual ? `${currentTarget.paidConversionsActual} actual` : 'No data yet'}</div>
            </div>
          </div>

          <div className="mb-6">
            <div className="mb-1 flex justify-between text-sm">
              <span className="text-gray-400">Overall MRR Progress</span>
              <span className="font-medium">£{(currentTarget.mrrTarget / 100).toFixed(2)} / £100.00</span>
            </div>
            <div className="h-4 overflow-hidden rounded-full bg-gray-800">
              <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-600" style={{ width: `${(currentTarget.mrrTarget / 10000) * 100}%` }} />
            </div>
            <div className="mt-1 text-xs text-gray-500">Week {currentWeek} of 13 • {((currentTarget.mrrTarget / 10000) * 100).toFixed(1)}% to £10k MRR target</div>
          </div>
        </>
      ) : null}

      {nextWeekTarget ? (
        <div className="border-t border-gray-800 pt-6">
          <h4 className="mb-3 font-semibold">Next Week Preview</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg bg-gray-800/30 p-3">
              <div className="text-gray-400">MRR Target</div>
              <div className="font-semibold">£{(nextWeekTarget.mrrTarget / 100).toFixed(2)}</div>
            </div>
            <div className="rounded-lg bg-gray-800/30 p-3">
              <div className="text-gray-400">New Users</div>
              <div className="font-semibold">{nextWeekTarget.newUsersTarget}</div>
            </div>
            <div className="rounded-lg bg-gray-800/30 p-3">
              <div className="text-gray-400">Waitlist Signups</div>
              <div className="font-semibold">{nextWeekTarget.waitlistTarget}</div>
            </div>
            <div className="rounded-lg bg-gray-800/30 p-3">
              <div className="text-gray-400">Paid Conversions</div>
              <div className="font-semibold">{nextWeekTarget.paidConversionsTarget}</div>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Week {currentWeek + 1}: {nextWeekTarget.startDate} – {nextWeekTarget.endDate}
          </div>
        </div>
      ) : null}

      <div className="mt-6 border-t border-gray-800 pt-6">
        <h4 className="mb-3 font-semibold">This Week&apos;s Actions</h4>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2">
            <input type="checkbox" className="rounded" />
            <span>Ship 1 quality-of-life improvement</span>
          </li>
          <li className="flex items-center gap-2">
            <input type="checkbox" className="rounded" />
            <span>Publish 3–5 content pieces</span>
          </li>
          <li className="flex items-center gap-2">
            <input type="checkbox" className="rounded" />
            <span>Engage 10+ Roblox creators on Twitter/X</span>
          </li>
          <li className="flex items-center gap-2">
            <input type="checkbox" className="rounded" />
            <span>Test conversion rate on the landing page</span>
          </li>
          <li className="flex items-center gap-2">
            <input type="checkbox" className="rounded" />
            <span>Review weekly metrics and adjust strategy</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
