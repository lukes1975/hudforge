'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { checkAlerts } from '../../lib/analytics';

interface Alert {
    id: string;
    name: string;
    description?: string;
    severity: 'high' | 'medium' | 'low';
    metric: string;
    metric_value: number;
    threshold: number;
    triggered_at: Date;
    is_resolved: boolean;
}

export default function AlertPanel() {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAlerts();
        // Check for new alerts every 5 minutes
        const interval = setInterval(fetchAlerts, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const fetchAlerts = async () => {
        try {
            // First check for new alerts
            await checkAlerts();
            
            // Then fetch recent triggers
            const { data, error } = await supabase
                .from('alert_triggers')
                .select(`
                    *,
                    alert_definitions (
                        name,
                        description,
                        metric,
                        threshold
                    )
                `)
                .order('triggered_at', { ascending: false })
                .limit(10);
            
            if (error) throw error;

            const formattedAlerts: Alert[] = (data || []).map((trigger: any) => {
                const def = trigger.alert_definitions;
                let severity: 'high' | 'medium' | 'low' = 'medium';
                
                // Determine severity based on metric
                if (def.metric.includes('mrr') || def.metric.includes('churn')) {
                    severity = 'high';
                } else if (def.metric.includes('conversion')) {
                    severity = 'medium';
                } else {
                    severity = 'low';
                }

                return {
                    id: trigger.id,
                    name: def.name,
                    description: def.description,
                    severity,
                    metric: def.metric,
                    metric_value: trigger.metric_value,
                    threshold: def.threshold,
                    triggered_at: new Date(trigger.triggered_at),
                    is_resolved: trigger.is_resolved
                };
            });

            setAlerts(formattedAlerts);
        } catch (error) {
            console.error('Failed to fetch alerts:', error);
            // Mock data for demo
            setAlerts(getMockAlerts());
        } finally {
            setLoading(false);
        }
    };

    const getMockAlerts = (): Alert[] => [
        {
            id: '1',
            name: 'MRR Growth Below Target',
            description: 'Weekly MRR growth below £833 needed for £10k MRR target',
            severity: 'high',
            metric: 'net_new_mrr',
            metric_value: 450,
            threshold: 833,
            triggered_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            is_resolved: false
        },
        {
            id: '2',
            name: 'High Churn Rate',
            description: 'Monthly churn rate above 5% target',
            severity: 'high',
            metric: 'churn_rate',
            metric_value: 0.08,
            threshold: 0.05,
            triggered_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            is_resolved: false
        },
        {
            id: '3',
            name: 'Low Conversion Rate',
            description: 'Waitlist to paid conversion below 10% target',
            severity: 'medium',
            metric: 'conversion_rate',
            metric_value: 0.07,
            threshold: 0.10,
            triggered_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            is_resolved: true
        },
        {
            id: '4',
            name: 'User Acquisition Slow',
            description: 'New user acquisition below weekly target',
            severity: 'medium',
            metric: 'new_users',
            metric_value: 32,
            threshold: 50,
            triggered_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            is_resolved: false
        }
    ];

    const resolveAlert = async (alertId: string) => {
        try {
            const { error } = await supabase
                .from('alert_triggers')
                .update({ is_resolved: true, resolved_at: new Date().toISOString() })
                .eq('id', alertId);
            
            if (error) throw error;
            
            setAlerts(alerts.map(alert => 
                alert.id === alertId ? { ...alert, is_resolved: true } : alert
            ));
        } catch (error) {
            console.error('Failed to resolve alert:', error);
        }
    };

    const activeAlerts = alerts.filter(a => !a.is_resolved);
    const resolvedAlerts = alerts.filter(a => a.is_resolved);

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'high': return 'bg-red-500';
            case 'medium': return 'bg-yellow-500';
            case 'low': return 'bg-blue-500';
            default: return 'bg-gray-500';
        }
    };

    const getSeverityText = (severity: string) => {
        switch (severity) {
            case 'high': return 'High';
            case 'medium': return 'Medium';
            case 'low': return 'Low';
            default: return 'Info';
        }
    };

    const formatMetricValue = (alert: Alert) => {
        const value = alert.metric_value;
        if (alert.metric.includes('rate')) {
            return `${(value * 100).toFixed(1)}%`;
        } else if (alert.metric.includes('mrr')) {
            return `£${value.toFixed(2)}`;
        } else {
            return value.toString();
        }
    };

    const formatThreshold = (alert: Alert) => {
        const threshold = alert.threshold;
        if (alert.metric.includes('rate')) {
            return `${(threshold * 100).toFixed(1)}%`;
        } else if (alert.metric.includes('mrr')) {
            return `£${threshold.toFixed(2)}`;
        } else {
            return threshold.toString();
        }
    };

    return (
        <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-2xl border border-gray-700 p-6 h-full">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xl font-semibold">Alert Panel</h3>
                    <div className="text-sm text-gray-400">
                        {activeAlerts.length} active • {resolvedAlerts.length} resolved
                    </div>
                </div>
                <button 
                    onClick={fetchAlerts}
                    className="px-3 py-1 bg-gray-800 rounded-lg text-sm hover:bg-gray-700 transition"
                >
                    Refresh
                </button>
            </div>

            {loading ? (
                <div className="text-center py-8">Loading alerts...</div>
            ) : (
                <>
                    {/* Active Alerts */}
                    <div className="space-y-4 mb-6">
                        <h4 className="font-semibold text-gray-300">Active Alerts</h4>
                        {activeAlerts.length === 0 ? (
                            <div className="text-center py-4 text-green-400 border border-green-500/30 rounded-lg">
                                ✅ No active alerts
                            </div>
                        ) : (
                            activeAlerts.map(alert => (
                                <div 
                                    key={alert.id}
                                    className={`p-4 rounded-lg border ${alert.severity === 'high' ? 'border-red-500/50 bg-red-500/5' : alert.severity === 'medium' ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-blue-500/50 bg-blue-500/5'}`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-3 h-3 rounded-full ${getSeverityColor(alert.severity)}`} />
                                            <div className="font-semibold">{alert.name}</div>
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {alert.triggered_at.toLocaleDateString()}
                                        </div>
                                    </div>
                                    
                                    <div className="text-sm text-gray-400 mb-3">
                                        {alert.description}
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                                        <div>
                                            <div className="text-gray-500">Current</div>
                                            <div className="font-semibold">{formatMetricValue(alert)}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-500">Target</div>
                                            <div className="font-semibold">{formatThreshold(alert)}</div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex justify-between items-center">
                                        <div className="text-xs px-2 py-1 rounded bg-gray-800">
                                            Severity: {getSeverityText(alert.severity)}
                                        </div>
                                        <button
                                            onClick={() => resolveAlert(alert.id)}
                                            className="px-3 py-1 text-sm bg-gray-800 rounded hover:bg-gray-700 transition"
                                        >
                                            Mark Resolved
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Resolved Alerts */}
                    {resolvedAlerts.length > 0 && (
                        <div className="space-y-4">
                            <h4 className="font-semibold text-gray-300">Recently Resolved</h4>
                            {resolvedAlerts.slice(0, 3).map(alert => (
                                <div 
                                    key={alert.id}
                                    className="p-3 rounded-lg border border-gray-700 bg-gray-800/30"
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-green-500" />
                                            <div className="font-medium text-sm">{alert.name}</div>
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            Resolved
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">
                                        Was {formatMetricValue(alert)} vs {formatThreshold(alert)} target
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Alert Summary */}
                    <div className="mt-6 pt-6 border-t border-gray-800">
                        <h4 className="font-semibold mb-3">Alert Summary</h4>
                        <div className="grid grid-cols-3 gap-3 text-sm">
                            <div className="text-center p-3 bg-red-500/10 rounded-lg">
                                <div className="text-2xl font-bold text-red-400">{activeAlerts.filter(a => a.severity === 'high').length}</div>
                                <div className="text-gray-400">High Severity</div>
                            </div>
                            <div className="text-center p-3 bg-yellow-500/10 rounded-lg">
                                <div className="text-2xl font-bold text-yellow-400">{activeAlerts.filter(a => a.severity === 'medium').length}</div>
                                <div className="text-gray-400">Medium Severity</div>
                            </div>
                            <div className="text-center p-3 bg-green-500/10 rounded-lg">
                                <div className="text-2xl font-bold text-green-400">{resolvedAlerts.length}</div>
                                <div className="text-gray-400">Resolved</div>
                            </div>
                        </div>
                    </div>

                    {/* Alert Configuration */}
                    <div className="mt-6 pt-6 border-t border-gray-800">
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="font-semibold">Alert Configurations</h4>
                            <button className="text-sm text-blue-400 hover:text-blue-300">
                                Manage Alerts
                            </button>
                        </div>
                        <div className="text-sm text-gray-400 space-y-1">
                            <div className="flex justify-between">
                                <span>MRR Growth Alert</span>
                                <span className="text-green-400">Active</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Churn Rate Alert</span>
                                <span className="text-green-400">Active</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Conversion Rate Alert</span>
                                <span className="text-green-400">Active</span>
                            </div>
                            <div className="flex justify-between">
                                <span>User Acquisition Alert</span>
                                <span className="text-green-400">Active</span>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}