'use client';

import React, { useState, useEffect } from 'react';

interface Alert {
    id: string;
    type: 'warning' | 'error' | 'info' | 'success';
    title: string;
    description: string;
    metric: string;
    currentValue: number;
    targetValue: number;
    triggeredAt: string;
    isResolved: boolean;
}

export default function AlertPanel() {
    const [alerts, setAlerts] = useState<Alert[]>([
        {
            id: '1',
            type: 'warning',
            title: 'MRR growth below weekly target',
            description: 'Weekly MRR growth of £233 is below £833 target',
            metric: 'net_new_mrr',
            currentValue: 233,
            targetValue: 833,
            triggeredAt: '2025-05-14T10:30:00Z',
            isResolved: false,
        },
        {
            id: '2',
            type: 'error',
            title: 'Churn rate above threshold',
            description: 'Monthly churn rate of 65% exceeds 5% threshold',
            metric: 'churn_rate',
            currentValue: 65,
            targetValue: 5,
            triggeredAt: '2025-05-13T14:20:00Z',
            isResolved: false,
        },
        {
            id: '3',
            type: 'info',
            title: 'Waitlist conversion low',
            description: 'Waitlist to activated conversion at 20% vs 20% target',
            metric: 'conversion_rate',
            currentValue: 20,
            targetValue: 20,
            triggeredAt: '2025-05-12T09:15:00Z',
            isResolved: true,
        },
        {
            id: '4',
            type: 'success',
            title: 'CAC payback on target',
            description: 'CAC payback period of 1.2 months meets ≤1.5 month target',
            metric: 'cac_payback',
            currentValue: 1.2,
            targetValue: 1.5,
            triggeredAt: '2025-05-10T16:45:00Z',
            isResolved: true,
        },
    ]);

    const [showResolved, setShowResolved] = useState(false);

    const activeAlerts = alerts.filter(alert => !alert.isResolved);
    const resolvedAlerts = alerts.filter(alert => alert.isResolved);

    const getAlertColor = (type: Alert['type']) => {
        switch (type) {
            case 'error': return 'bg-red-500/20 border-red-500/50';
            case 'warning': return 'bg-yellow-500/20 border-yellow-500/50';
            case 'info': return 'bg-blue-500/20 border-blue-500/50';
            case 'success': return 'bg-green-500/20 border-green-500/50';
            default: return 'bg-gray-500/20 border-gray-500/50';
        }
    };

    const getAlertIcon = (type: Alert['type']) => {
        switch (type) {
            case 'error': return '🔴';
            case 'warning': return '🟡';
            case 'info': return '🔵';
            case 'success': return '🟢';
            default: return '⚪';
        }
    };

    const getAlertTextColor = (type: Alert['type']) => {
        switch (type) {
            case 'error': return 'text-red-400';
            case 'warning': return 'text-yellow-400';
            case 'info': return 'text-blue-400';
            case 'success': return 'text-green-400';
            default: return 'text-gray-400';
        }
    };

    const markAsResolved = (id: string) => {
        setAlerts(alerts.map(alert => 
            alert.id === id ? { ...alert, isResolved: true } : alert
        ));
    };

    const markAsUnresolved = (id: string) => {
        setAlerts(alerts.map(alert => 
            alert.id === id ? { ...alert, isResolved: false } : alert
        ));
    };

    return (
        <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-2xl border border-gray-700 p-6 h-full">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Alerts & Notifications</h3>
                <div className="text-sm">
                    <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-lg">
                        {activeAlerts.length} active
                    </span>
                </div>
            </div>

            {/* Active Alerts */}
            <div className="space-y-4 mb-8">
                <h4 className="font-semibold text-gray-300">Active Alerts</h4>
                {activeAlerts.length > 0 ? (
                    activeAlerts.map(alert => (
                        <div 
                            key={alert.id} 
                            className={`p-4 rounded-lg border ${getAlertColor(alert.type)}`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <span>{getAlertIcon(alert.type)}</span>
                                    <h5 className={`font-semibold ${getAlertTextColor(alert.type)}`}>
                                        {alert.title}
                                    </h5>
                                </div>
                                <button 
                                    onClick={() => markAsResolved(alert.id)}
                                    className="text-xs px-2 py-1 bg-gray-800 rounded hover:bg-gray-700"
                                >
                                    Mark resolved
                                </button>
                            </div>
                            <p className="text-sm text-gray-300 mb-3">{alert.description}</p>
                            <div className="text-xs text-gray-400">
                                Metric: <span className="font-mono">{alert.metric}</span> • 
                                Triggered: {new Date(alert.triggeredAt).toLocaleDateString()}
                            </div>
                            <div className="mt-3 flex items-center gap-4">
                                <div className="flex-1">
                                    <div className="text-xs text-gray-400 mb-1">Current: {alert.currentValue}</div>
                                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full ${getAlertTextColor(alert.type).replace('text-', 'bg-')}`}
                                            style={{ width: `${Math.min((alert.currentValue / (alert.targetValue * 2)) * 100, 100)}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="text-xs text-gray-400 mb-1">Target: {alert.targetValue}</div>
                                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-gray-500"
                                            style={{ width: `50%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-6 text-center border border-gray-700 rounded-lg">
                        <div className="text-4xl mb-2">🎉</div>
                        <div className="font-semibold text-green-400">All systems nominal</div>
                        <div className="text-sm text-gray-400">No active alerts</div>
                    </div>
                )}
            </div>

            {/* Resolved Alerts Toggle */}
            {resolvedAlerts.length > 0 && (
                <div>
                    <button
                        onClick={() => setShowResolved(!showResolved)}
                        className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-300 mb-4"
                    >
                        {showResolved ? '▼' : '▶'} {resolvedAlerts.length} resolved alerts
                    </button>

                    {showResolved && (
                        <div className="space-y-3">
                            {resolvedAlerts.map(alert => (
                                <div 
                                    key={alert.id} 
                                    className="p-3 rounded-lg border border-gray-700 bg-gray-800/30"
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-500">✓</span>
                                            <h5 className="text-sm font-medium text-gray-400 line-through">
                                                {alert.title}
                                            </h5>
                                        </div>
                                        <button 
                                            onClick={() => markAsUnresolved(alert.id)}
                                            className="text-xs px-2 py-1 bg-gray-700 rounded hover:bg-gray-600"
                                        >
                                            Re-open
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Alert Configuration */}
            <div className="mt-8 pt-6 border-t border-gray-800">
                <h4 className="font-semibold mb-3">Alert Configuration</h4>
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400">Weekly MRR growth</span>
                        <span className="font-medium">Below £833</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400">Monthly churn rate</span>
                        <span className="font-medium">Above 5%</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400">Waitlist conversion</span>
                        <span className="font-medium">Below 20%</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400">CAC payback period</span>
                        <span className="font-medium">Above 1.5 months</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                        Alerts sent via email • Weekly report every Monday
                    </div>
                </div>
            </div>
        </div>
    );
}