'use client'

import { useCallback, useEffect, useState } from 'react'
import { checkAlerts } from '../../lib/analytics'
import { supabase } from '../../lib/supabase'

interface Alert {
  id: string
  name: string
  description?: string
  severity: 'high' | 'medium' | 'low'
  metric: string
  metricValue: number
  threshold: number
  triggeredAt: Date
  isResolved: boolean
}

type AlertDefinitionRow = {
  name: string
  description: string | null
  metric: string
  threshold: number
}

type AlertTriggerRow = {
  id: string
  metric_value: number
  triggered_at: string
  is_resolved: boolean
  alert_definitions: AlertDefinitionRow | AlertDefinitionRow[] | null
}

const mockAlerts = (): Alert[] => [
  {
    id: '1',
    name: 'MRR Growth Below Target',
    description: 'Weekly MRR growth below £833 needed for the £10k MRR target',
    severity: 'high',
    metric: 'net_new_mrr',
    metricValue: 450,
    threshold: 833,
    triggeredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    isResolved: false,
  },
  {
    id: '2',
    name: 'High Churn Rate',
    description: 'Monthly churn rate above the 5% target',
    severity: 'high',
    metric: 'churn_rate',
    metricValue: 0.08,
    threshold: 0.05,
    triggeredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    isResolved: false,
  },
  {
    id: '3',
    name: 'Low Conversion Rate',
    description: 'Waitlist to paid conversion below the 10% target',
    severity: 'medium',
    metric: 'conversion_rate',
    metricValue: 0.07,
    threshold: 0.1,
    triggeredAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    isResolved: true,
  },
  {
    id: '4',
    name: 'User Acquisition Slow',
    description: 'New user acquisition is below the weekly target',
    severity: 'medium',
    metric: 'new_users',
    metricValue: 32,
    threshold: 50,
    triggeredAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    isResolved: false,
  },
]

function getSeverity(metric: string): Alert['severity'] {
  if (metric.includes('mrr') || metric.includes('churn')) return 'high'
  if (metric.includes('conversion')) return 'medium'
  return 'low'
}

function coerceDefinition(definition: AlertTriggerRow['alert_definitions']): AlertDefinitionRow | null {
  if (!definition) return null
  return Array.isArray(definition) ? (definition[0] ?? null) : definition
}

export default function AlertPanel() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAlerts = useCallback(async () => {
    setLoading(true)
    try {
      await checkAlerts()

      const { data, error } = await supabase
        .from('alert_triggers')
        .select(
          `
            id,
            metric_value,
            triggered_at,
            is_resolved,
            alert_definitions (
              name,
              description,
              metric,
              threshold
            )
          `
        )
        .order('triggered_at', { ascending: false })
        .limit(10)

      if (error) throw error

      const formattedAlerts = ((data ?? []) as AlertTriggerRow[]).reduce<Alert[]>((acc, trigger) => {
        const definition = coerceDefinition(trigger.alert_definitions)
        if (!definition) return acc

        acc.push({
          id: trigger.id,
          name: definition.name,
          description: definition.description ?? undefined,
          severity: getSeverity(definition.metric),
          metric: definition.metric,
          metricValue: trigger.metric_value,
          threshold: definition.threshold,
          triggeredAt: new Date(trigger.triggered_at),
          isResolved: trigger.is_resolved,
        })

        return acc
      }, [])

      setAlerts(formattedAlerts)
    } catch (error) {
      console.error('Failed to fetch alerts:', error)
      setAlerts(mockAlerts())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const initialLoad = window.setTimeout(() => {
      void fetchAlerts()
    }, 0)

    const interval = window.setInterval(() => {
      void fetchAlerts()
    }, 5 * 60 * 1000)

    return () => {
      window.clearTimeout(initialLoad)
      window.clearInterval(interval)
    }
  }, [fetchAlerts])

  async function resolveAlert(alertId: string) {
    try {
      const { error } = await supabase
        .from('alert_triggers')
        .update({ is_resolved: true, resolved_at: new Date().toISOString() })
        .eq('id', alertId)

      if (error) throw error

      setAlerts((current) => current.map((alert) => (alert.id === alertId ? { ...alert, isResolved: true } : alert)))
    } catch (error) {
      console.error('Failed to resolve alert:', error)
    }
  }

  const activeAlerts = alerts.filter((alert) => !alert.isResolved)
  const resolvedAlerts = alerts.filter((alert) => alert.isResolved)

  const getSeverityColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'high':
        return 'bg-red-500'
      case 'medium':
        return 'bg-yellow-500'
      case 'low':
        return 'bg-blue-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getSeverityText = (severity: Alert['severity']) => {
    switch (severity) {
      case 'high':
        return 'High'
      case 'medium':
        return 'Medium'
      case 'low':
        return 'Low'
      default:
        return 'Info'
    }
  }

  const formatMetricValue = (alert: Alert) => {
    if (alert.metric.includes('rate')) return `${(alert.metricValue * 100).toFixed(1)}%`
    if (alert.metric.includes('mrr')) return `£${alert.metricValue.toFixed(2)}`
    return alert.metricValue.toString()
  }

  const formatThreshold = (alert: Alert) => {
    if (alert.metric.includes('rate')) return `${(alert.threshold * 100).toFixed(1)}%`
    if (alert.metric.includes('mrr')) return `£${alert.threshold.toFixed(2)}`
    return alert.threshold.toString()
  }

  return (
    <div className="h-full rounded-2xl border border-gray-700 bg-gradient-to-br from-gray-800/30 to-gray-900/30 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Alert Panel</h3>
          <div className="text-sm text-gray-400">
            {activeAlerts.length} active • {resolvedAlerts.length} resolved
          </div>
        </div>
        <button onClick={() => void fetchAlerts()} className="rounded-lg bg-gray-800 px-3 py-1 text-sm transition hover:bg-gray-700">
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="py-8 text-center">Loading alerts...</div>
      ) : (
        <>
          <div className="mb-6 space-y-4">
            <h4 className="font-semibold text-gray-300">Active Alerts</h4>
            {activeAlerts.length === 0 ? (
              <div className="rounded-lg border border-green-500/30 py-4 text-center text-green-400">✅ No active alerts</div>
            ) : (
              activeAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`rounded-lg border p-4 ${
                    alert.severity === 'high'
                      ? 'border-red-500/50 bg-red-500/5'
                      : alert.severity === 'medium'
                        ? 'border-yellow-500/50 bg-yellow-500/5'
                        : 'border-blue-500/50 bg-blue-500/5'
                  }`}
                >
                  <div className="mb-2 flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`h-3 w-3 rounded-full ${getSeverityColor(alert.severity)}`} />
                      <div className="font-semibold">{alert.name}</div>
                    </div>
                    <div className="text-xs text-gray-500">{alert.triggeredAt.toLocaleDateString()}</div>
                  </div>

                  <div className="mb-3 text-sm text-gray-400">{alert.description}</div>

                  <div className="mb-3 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-gray-500">Current</div>
                      <div className="font-semibold">{formatMetricValue(alert)}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Target</div>
                      <div className="font-semibold">{formatThreshold(alert)}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="rounded bg-gray-800 px-2 py-1 text-xs">Severity: {getSeverityText(alert.severity)}</div>
                    <button onClick={() => void resolveAlert(alert.id)} className="rounded bg-gray-800 px-3 py-1 text-sm transition hover:bg-gray-700">
                      Mark Resolved
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {resolvedAlerts.length > 0 ? (
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-300">Recently Resolved</h4>
              {resolvedAlerts.slice(0, 3).map((alert) => (
                <div key={alert.id} className="rounded-lg border border-gray-700 bg-gray-800/30 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <div className="text-sm font-medium">{alert.name}</div>
                    </div>
                    <div className="text-xs text-gray-500">Resolved</div>
                  </div>
                  <div className="mt-1 text-xs text-gray-400">
                    Was {formatMetricValue(alert)} vs {formatThreshold(alert)} target
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          <div className="mt-6 border-t border-gray-800 pt-6">
            <h4 className="mb-3 font-semibold">Alert Summary</h4>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-lg bg-red-500/10 p-3 text-center">
                <div className="text-2xl font-bold text-red-400">{activeAlerts.filter((alert) => alert.severity === 'high').length}</div>
                <div className="text-gray-400">High Severity</div>
              </div>
              <div className="rounded-lg bg-yellow-500/10 p-3 text-center">
                <div className="text-2xl font-bold text-yellow-400">{activeAlerts.filter((alert) => alert.severity === 'medium').length}</div>
                <div className="text-gray-400">Medium Severity</div>
              </div>
              <div className="rounded-lg bg-green-500/10 p-3 text-center">
                <div className="text-2xl font-bold text-green-400">{resolvedAlerts.length}</div>
                <div className="text-gray-400">Resolved</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
