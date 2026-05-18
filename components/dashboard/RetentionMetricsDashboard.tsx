'use client'

import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface RetentionData {
  month_offset: number
  retention_rate: number
  retained_users: number
  total_cohort_users: number
}

interface CohortData {
  cohort_date: string
  data: RetentionData[]
}

const mockCohorts: CohortData[] = [
  {
    cohort_date: '2025-05',
    data: [
      { month_offset: 0, retention_rate: 1, retained_users: 100, total_cohort_users: 100 },
      { month_offset: 1, retention_rate: 0.45, retained_users: 45, total_cohort_users: 100 },
      { month_offset: 2, retention_rate: 0.35, retained_users: 35, total_cohort_users: 100 },
      { month_offset: 3, retention_rate: 0.3, retained_users: 30, total_cohort_users: 100 },
      { month_offset: 4, retention_rate: 0.28, retained_users: 28, total_cohort_users: 100 },
      { month_offset: 5, retention_rate: 0.25, retained_users: 25, total_cohort_users: 100 },
    ],
  },
  {
    cohort_date: '2025-04',
    data: [
      { month_offset: 0, retention_rate: 1, retained_users: 80, total_cohort_users: 80 },
      { month_offset: 1, retention_rate: 0.48, retained_users: 38, total_cohort_users: 80 },
      { month_offset: 2, retention_rate: 0.38, retained_users: 30, total_cohort_users: 80 },
      { month_offset: 3, retention_rate: 0.33, retained_users: 26, total_cohort_users: 80 },
      { month_offset: 4, retention_rate: 0.3, retained_users: 24, total_cohort_users: 80 },
    ],
  },
  {
    cohort_date: '2025-03',
    data: [
      { month_offset: 0, retention_rate: 1, retained_users: 60, total_cohort_users: 60 },
      { month_offset: 1, retention_rate: 0.5, retained_users: 30, total_cohort_users: 60 },
      { month_offset: 2, retention_rate: 0.4, retained_users: 24, total_cohort_users: 60 },
      { month_offset: 3, retention_rate: 0.35, retained_users: 21, total_cohort_users: 60 },
    ],
  },
]

export default function RetentionMetricsDashboard() {
  const cohortData = mockCohorts
  const selectedCohort = cohortData[0]?.cohort_date ?? '2025-05'
  const selectedData = cohortData.find((cohort) => cohort.cohort_date === selectedCohort)?.data ?? []
  const targetRetention = 0.35

  const averageRetentionByMonth = [0, 1, 2, 3, 4, 5].map((month) => {
    const cohortsWithMonth = cohortData.filter((cohort) => cohort.data.some((entry) => entry.month_offset === month))
    const averageRate =
      cohortsWithMonth.length > 0
        ? cohortsWithMonth.reduce((sum, cohort) => {
            const monthData = cohort.data.find((entry) => entry.month_offset === month)
            return sum + (monthData?.retention_rate ?? 0)
          }, 0) / cohortsWithMonth.length
        : 0

    return {
      month_offset: month,
      retention_rate: averageRate,
      target: month === 1 ? targetRetention : targetRetention * Math.pow(0.9, month - 1),
    }
  })

  const currentChurnRate = selectedData.length > 1 ? 1 - selectedData[1].retention_rate : 0.55
  const targetChurnRate = 0.65

  return (
    <div className="rounded-2xl border border-gray-700 bg-gradient-to-br from-gray-800/30 to-gray-900/30 p-6">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-xl font-semibold">Retention & Engagement</h3>
        <div className="rounded-lg bg-gray-800 px-3 py-1 text-sm text-white">{selectedCohort} Cohort</div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-lg bg-gray-800/50 p-4">
          <div className="text-sm text-gray-400">MoM Retention Rate</div>
          <div className="mt-2 text-3xl font-bold">{(selectedData[1]?.retention_rate ?? 0).toLocaleString(undefined, { style: 'percent', minimumFractionDigits: 1 })}</div>
          <div className="mt-1 text-sm text-gray-500">Month 1 • Target: {targetRetention.toLocaleString(undefined, { style: 'percent', minimumFractionDigits: 1 })}</div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-700">
            <div className="h-full rounded-full bg-gradient-to-r from-green-500 to-blue-500" style={{ width: `${(selectedData[1]?.retention_rate ?? 0) * 100}%` }} />
          </div>
        </div>

        <div className="rounded-lg bg-gray-800/50 p-4">
          <div className="text-sm text-gray-400">Monthly Churn Rate</div>
          <div className="mt-2 text-3xl font-bold">{currentChurnRate.toLocaleString(undefined, { style: 'percent', minimumFractionDigits: 1 })}</div>
          <div className="mt-1 text-sm text-gray-500">Month 1 • Target: {targetChurnRate.toLocaleString(undefined, { style: 'percent', minimumFractionDigits: 1 })}</div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-700">
            <div className="h-full rounded-full bg-gradient-to-r from-red-500 to-orange-500" style={{ width: `${currentChurnRate * 100}%` }} />
          </div>
        </div>

        <div className="rounded-lg bg-gray-800/50 p-4">
          <div className="text-sm text-gray-400">Cohort Size</div>
          <div className="mt-2 text-3xl font-bold">{selectedData[0]?.total_cohort_users.toLocaleString() ?? 0}</div>
          <div className="mt-1 text-sm text-gray-500">Initial users • {selectedCohort}</div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-700">
            <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500" style={{ width: '100%' }} />
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h4 className="mb-4 font-semibold">Retention Curve</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={selectedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month_offset" label={{ value: 'Months Since Signup', position: 'insideBottom', offset: -5 }} stroke="#9CA3AF" />
              <YAxis label={{ value: 'Retention Rate', angle: -90, position: 'insideLeft' }} stroke="#9CA3AF" tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
              <Tooltip formatter={(value) => [`${(Number(value) * 100).toFixed(1)}%`, 'Retention']} labelFormatter={(label) => `Month ${label}`} contentStyle={{ backgroundColor: '#1F2937', borderColor: '#4B5563' }} />
              <Legend />
              <Line type="monotone" dataKey="retention_rate" name="Actual Retention" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey={() => targetRetention} name="Target (35%)" stroke="#10B981" strokeWidth={2} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mb-8">
        <h4 className="mb-4 font-semibold">Cohort Comparison</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={averageRetentionByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month_offset" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
              <Tooltip formatter={(value) => [`${(Number(value) * 100).toFixed(1)}%`, 'Retention']} labelFormatter={(label) => `Month ${label}`} contentStyle={{ backgroundColor: '#1F2937', borderColor: '#4B5563' }} />
              <Legend />
              <Bar dataKey="retention_rate" name="Average Retention" fill="#3B82F6" radius={[4, 4, 0, 0]}>
                {averageRetentionByMonth.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.retention_rate >= entry.target ? '#10B981' : '#EF4444'} />
                ))}
              </Bar>
              <Bar dataKey="target" name="Target" fill="#6B7280" opacity={0.3} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-lg bg-gradient-to-r from-gray-800/50 to-gray-900/50 p-6">
          <h4 className="mb-4 font-semibold">Retention Health</h4>
          <div className="space-y-4">
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-gray-400">MoM Retention vs Target</span>
                <span className="font-medium">{((selectedData[1]?.retention_rate ?? 0) - targetRetention).toLocaleString(undefined, { style: 'percent', minimumFractionDigits: 1, signDisplay: 'exceptZero' })}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-700">
                <div className={`h-full rounded-full ${(selectedData[1]?.retention_rate ?? 0) >= targetRetention ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${Math.min((selectedData[1]?.retention_rate ?? 0) * 100, 100)}%` }} />
              </div>
            </div>

            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-gray-400">Cohort Decay Rate</span>
                <span className="font-medium">{selectedData.length > 2 ? `${((selectedData[1]?.retention_rate ?? 0) - (selectedData[2]?.retention_rate ?? 0)).toLocaleString(undefined, { style: 'percent', minimumFractionDigits: 1 })}` : 'N/A'}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-700">
                <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500" style={{ width: `${selectedData.length > 2 ? Math.abs((selectedData[1]?.retention_rate ?? 0) - (selectedData[2]?.retention_rate ?? 0)) * 100 : 0}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-gradient-to-r from-gray-800/50 to-gray-900/50 p-6">
          <h4 className="mb-4 font-semibold">Impact on £10k MRR</h4>
          <div className="space-y-3">
            <div className="text-sm">
              <div className="text-gray-400">Current Retention → Required Users</div>
              <div className="mt-1 text-lg font-semibold">{Math.ceil(800 / (selectedData[1]?.retention_rate ?? 0.35)).toLocaleString()} users</div>
              <div className="text-xs text-gray-500">Need {Math.ceil(800 / (selectedData[1]?.retention_rate ?? 0.35) - 800).toLocaleString()} more than target</div>
            </div>

            <div className="text-sm">
              <div className="text-gray-400">LTV at Current Retention</div>
              <div className="mt-1 text-lg font-semibold">£{((12.5 * (selectedData[1]?.retention_rate ?? 0.35) * 12) / (1 - (selectedData[1]?.retention_rate ?? 0.35))).toFixed(2)}</div>
              <div className="text-xs text-gray-500">Based on £12.50 ARPU, 12-month horizon</div>
            </div>

            <div className="text-sm">
              <div className="text-gray-400">Required CAC Payback</div>
              <div className="mt-1 text-lg font-semibold">&lt;{Math.ceil(45 * (targetRetention / (selectedData[1]?.retention_rate ?? 0.35)))} days</div>
              <div className="text-xs text-gray-500">Current: {Math.ceil(45 * (targetRetention / (selectedData[1]?.retention_rate ?? 0.35)))} days vs Target: 45 days</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
