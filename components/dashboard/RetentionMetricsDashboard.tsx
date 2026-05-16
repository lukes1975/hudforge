'use client';

import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { format } from 'date-fns';
import { getCohortRetention } from '../../lib/analytics';

interface RetentionData {
    month_offset: number;
    retention_rate: number;
    retained_users: number;
    total_cohort_users: number;
}

interface CohortData {
    cohort_date: string;
    data: RetentionData[];
}

export default function RetentionMetricsDashboard() {
    const [cohortData, setCohortData] = useState<CohortData[]>([]);
    const [selectedCohort, setSelectedCohort] = useState<string>('2025-05');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock data for now - replace with real API call
        const mockCohorts: CohortData[] = [
            {
                cohort_date: '2025-05',
                data: [
                    { month_offset: 0, retention_rate: 1.0, retained_users: 100, total_cohort_users: 100 },
                    { month_offset: 1, retention_rate: 0.45, retained_users: 45, total_cohort_users: 100 },
                    { month_offset: 2, retention_rate: 0.35, retained_users: 35, total_cohort_users: 100 },
                    { month_offset: 3, retention_rate: 0.30, retained_users: 30, total_cohort_users: 100 },
                    { month_offset: 4, retention_rate: 0.28, retained_users: 28, total_cohort_users: 100 },
                    { month_offset: 5, retention_rate: 0.25, retained_users: 25, total_cohort_users: 100 },
                ]
            },
            {
                cohort_date: '2025-04',
                data: [
                    { month_offset: 0, retention_rate: 1.0, retained_users: 80, total_cohort_users: 80 },
                    { month_offset: 1, retention_rate: 0.48, retained_users: 38, total_cohort_users: 80 },
                    { month_offset: 2, retention_rate: 0.38, retained_users: 30, total_cohort_users: 80 },
                    { month_offset: 3, retention_rate: 0.33, retained_users: 26, total_cohort_users: 80 },
                    { month_offset: 4, retention_rate: 0.30, retained_users: 24, total_cohort_users: 80 },
                ]
            },
            {
                cohort_date: '2025-03',
                data: [
                    { month_offset: 0, retention_rate: 1.0, retained_users: 60, total_cohort_users: 60 },
                    { month_offset: 1, retention_rate: 0.50, retained_users: 30, total_cohort_users: 60 },
                    { month_offset: 2, retention_rate: 0.40, retained_users: 24, total_cohort_users: 60 },
                    { month_offset: 3, retention_rate: 0.35, retained_users: 21, total_cohort_users: 60 },
                ]
            }
        ];

        setCohortData(mockCohorts);
        setLoading(false);
    }, []);

    const selectedData = cohortData.find(cohort => cohort.cohort_date === selectedCohort)?.data || [];
    const targetRetention = 0.35; // 35% MoM retention target

    // Calculate average retention rates
    const averageRetentionByMonth = [0, 1, 2, 3, 4, 5].map(month => {
        const cohortsWithMonth = cohortData.filter(cohort => 
            cohort.data.some(d => d.month_offset === month)
        );
        const avgRate = cohortsWithMonth.length > 0 
            ? cohortsWithMonth.reduce((sum, cohort) => {
                const monthData = cohort.data.find(d => d.month_offset === month);
                return sum + (monthData?.retention_rate || 0);
            }, 0) / cohortsWithMonth.length
            : 0;
        
        return {
            month_offset: month,
            retention_rate: avgRate,
            target: month === 1 ? targetRetention : targetRetention * Math.pow(0.9, month - 1) // 10% decay per month
        };
    });

    // Calculate churn rate
    const currentChurnRate = selectedData.length > 1 
        ? 1 - selectedData[1].retention_rate
        : 0.55; // Default 55% churn if no data

    const targetChurnRate = 0.65; // 65% churn = 35% retention

    return (
        <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-2xl border border-gray-700 p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Retention & Engagement</h3>
                <div className="flex gap-2">
                    <select 
                        value={selectedCohort}
                        onChange={(e) => setSelectedCohort(e.target.value)}
                        className="bg-gray-800 text-white px-3 py-1 rounded-lg text-sm"
                    >
                        {cohortData.map(cohort => (
                            <option key={cohort.cohort_date} value={cohort.cohort_date}>
                                {cohort.cohort_date} Cohort
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12">Loading retention data...</div>
            ) : (
                <>
                    {/* Retention Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-gray-800/50 p-4 rounded-lg">
                            <div className="text-sm text-gray-400">MoM Retention Rate</div>
                            <div className="text-3xl font-bold mt-2">
                                {(selectedData[1]?.retention_rate || 0).toLocaleString(undefined, { style: 'percent', minimumFractionDigits: 1 })}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                                Month 1 • Target: {(targetRetention).toLocaleString(undefined, { style: 'percent', minimumFractionDigits: 1 })}
                            </div>
                            <div className="h-2 bg-gray-700 rounded-full mt-2 overflow-hidden">
                                <div 
                                    className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full"
                                    style={{ width: `${(selectedData[1]?.retention_rate || 0) * 100}%` }}
                                />
                            </div>
                        </div>

                        <div className="bg-gray-800/50 p-4 rounded-lg">
                            <div className="text-sm text-gray-400">Monthly Churn Rate</div>
                            <div className="text-3xl font-bold mt-2">
                                {(currentChurnRate).toLocaleString(undefined, { style: 'percent', minimumFractionDigits: 1 })}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                                Month 1 • Target: {(targetChurnRate).toLocaleString(undefined, { style: 'percent', minimumFractionDigits: 1 })}
                            </div>
                            <div className="h-2 bg-gray-700 rounded-full mt-2 overflow-hidden">
                                <div 
                                    className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
                                    style={{ width: `${currentChurnRate * 100}%` }}
                                />
                            </div>
                        </div>

                        <div className="bg-gray-800/50 p-4 rounded-lg">
                            <div className="text-sm text-gray-400">Cohort Size</div>
                            <div className="text-3xl font-bold mt-2">
                                {selectedData[0]?.total_cohort_users.toLocaleString() || 0}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                                Initial users • {selectedCohort}
                            </div>
                            <div className="h-2 bg-gray-700 rounded-full mt-2 overflow-hidden">
                                <div 
                                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                                    style={{ width: '100%' }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Retention Curve Chart */}
                    <div className="mb-8">
                        <h4 className="font-semibold mb-4">Retention Curve</h4>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={selectedData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis 
                                        dataKey="month_offset" 
                                        label={{ value: 'Months Since Signup', position: 'insideBottom', offset: -5 }}
                                        stroke="#9CA3AF"
                                    />
                                    <YAxis 
                                        label={{ value: 'Retention Rate', angle: -90, position: 'insideLeft' }}
                                        stroke="#9CA3AF"
                                        tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                                    />
                                    <Tooltip 
                                        formatter={(value) => [`${(Number(value) * 100).toFixed(1)}%`, 'Retention']}
                                        labelFormatter={(label) => `Month ${label}`}
                                        contentStyle={{ backgroundColor: '#1F2937', borderColor: '#4B5563' }}
                                    />
                                    <Legend />
                                    <Line 
                                        type="monotone" 
                                        dataKey="retention_rate" 
                                        name="Actual Retention" 
                                        stroke="#3B82F6" 
                                        strokeWidth={2}
                                        dot={{ r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey={() => targetRetention} 
                                        name="Target (35%)" 
                                        stroke="#10B981" 
                                        strokeWidth={2}
                                        strokeDasharray="5 5"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Cohort Comparison */}
                    <div className="mb-8">
                        <h4 className="font-semibold mb-4">Cohort Comparison</h4>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={averageRetentionByMonth}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis dataKey="month_offset" stroke="#9CA3AF" />
                                    <YAxis 
                                        stroke="#9CA3AF"
                                        tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                                    />
                                    <Tooltip 
                                        formatter={(value) => [`${(Number(value) * 100).toFixed(1)}%`, 'Retention']}
                                        labelFormatter={(label) => `Month ${label}`}
                                        contentStyle={{ backgroundColor: '#1F2937', borderColor: '#4B5563' }}
                                    />
                                    <Legend />
                                    <Bar 
                                        dataKey="retention_rate" 
                                        name="Average Retention" 
                                        fill="#3B82F6"
                                        radius={[4, 4, 0, 0]}
                                    >
                                        {averageRetentionByMonth.map((entry, index) => (
                                            <Cell 
                                                key={`cell-${index}`}
                                                fill={entry.retention_rate >= entry.target ? '#10B981' : '#EF4444'}
                                            />
                                        ))}
                                    </Bar>
                                    <Bar 
                                        dataKey="target" 
                                        name="Target" 
                                        fill="#6B7280"
                                        opacity={0.3}
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Retention Health Indicators */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-lg p-6">
                            <h4 className="font-semibold mb-4">Retention Health</h4>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-400">MoM Retention vs Target</span>
                                        <span className="font-medium">
                                            {((selectedData[1]?.retention_rate || 0) - targetRetention).toLocaleString(undefined, { style: 'percent', minimumFractionDigits: 1, signDisplay: 'exceptZero' })}
                                        </span>
                                    </div>
                                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full ${(selectedData[1]?.retention_rate || 0) >= targetRetention ? 'bg-green-500' : 'bg-red-500'} rounded-full`}
                                            style={{ width: `${Math.min((selectedData[1]?.retention_rate || 0) * 100, 100)}%` }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-400">Cohort Decay Rate</span>
                                        <span className="font-medium">
                                            {selectedData.length > 2 
                                                ? `${((selectedData[1]?.retention_rate || 0) - (selectedData[2]?.retention_rate || 0)).toLocaleString(undefined, { style: 'percent', minimumFractionDigits: 1 })}`
                                                : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                                            style={{ width: `${selectedData.length > 2 ? Math.abs((selectedData[1]?.retention_rate || 0) - (selectedData[2]?.retention_rate || 0)) * 100 : 0}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-lg p-6">
                            <h4 className="font-semibold mb-4">Impact on £10k MRR</h4>
                            <div className="space-y-3">
                                <div className="text-sm">
                                    <div className="text-gray-400">Current Retention → Required Users</div>
                                    <div className="text-lg font-semibold mt-1">
                                        {Math.ceil(800 / (selectedData[1]?.retention_rate || 0.35)).toLocaleString()} users
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Need {Math.ceil(800 / (selectedData[1]?.retention_rate || 0.35) - 800).toLocaleString()} more than target
                                    </div>
                                </div>

                                <div className="text-sm">
                                    <div className="text-gray-400">LTV at Current Retention</div>
                                    <div className="text-lg font-semibold mt-1">
                                        £{((12.5 * (selectedData[1]?.retention_rate || 0.35) * 12) / (1 - (selectedData[1]?.retention_rate || 0.35))).toFixed(2)}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Based on £12.50 ARPU, 12-month horizon
                                    </div>
                                </div>

                                <div className="text-sm">
                                    <div className="text-gray-400">Required CAC Payback</div>
                                    <div className="text-lg font-semibold mt-1">
                                        &lt;{Math.ceil(45 * (targetRetention / (selectedData[1]?.retention_rate || 0.35)))} days
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Current: {Math.ceil(45 * (targetRetention / (selectedData[1]?.retention_rate || 0.35)))} days vs Target: 45 days
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}