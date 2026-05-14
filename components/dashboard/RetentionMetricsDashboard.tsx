'use client';

import React, { useState, useEffect } from 'react';

interface CohortData {
    cohort: string; // e.g., "2025-01"
    month0: number; // Signup month retention
    month1: number;
    month2: number;
    month3: number;
}

interface RetentionMetrics {
    d1: number; // Day 1 retention
    d7: number; // Day 7 retention
    d30: number; // Day 30 retention
    monthly: number; // Month-over-month retention
    churnRate: number;
    ltv: number; // Lifetime value in £
    cac: number; // Customer acquisition cost in £
}

export default function RetentionMetricsDashboard() {
    const [cohortData, setCohortData] = useState<CohortData[]>([
        { cohort: '2025-04', month0: 100, month1: 65, month2: 45, month3: 35 },
        { cohort: '2025-03', month0: 100, month1: 62, month2: 42, month3: 32 },
        { cohort: '2025-02', month0: 100, month1: 68, month2: 48, month3: 38 },
        { cohort: '2025-01', month0: 100, month1: 70, month2: 50, month3: 40 },
    ]);

    const [metrics, setMetrics] = useState<RetentionMetrics>({
        d1: 85, // 85% of users return on day 2
        d7: 60, // 60% of users return on day 8
        d30: 40, // 40% of users return on day 31
        monthly: 35, // 35% month-over-month retention
        churnRate: 65, // 65% monthly churn (inverse of retention)
        ltv: 45.00, // £45 lifetime value
        cac: 15.00, // £15 customer acquisition cost
    });

    const targetRetention = 35; // Minimum MoM retention for £10k MRR
    const targetLtvCac = 3; // LTV/CAC ratio target
    const currentLtvCac = metrics.ltv / metrics.cac;

    return (
        <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-2xl border border-gray-700 p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Retention & Engagement</h3>
                <div className="text-sm text-gray-400">MoM Target: {targetRetention}%+</div>
            </div>

            {/* Retention Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gray-800/50 p-4 rounded-lg">
                    <div className="text-sm text-gray-400">Day 1 Retention</div>
                    <div className="text-2xl font-bold">{metrics.d1}%</div>
                    <div className="text-xs text-gray-500">Users returning next day</div>
                    <div className={`h-2 bg-gray-700 rounded-full mt-2 overflow-hidden`}>
                        <div 
                            className={`h-full rounded-full ${metrics.d1 >= 80 ? 'bg-green-500' : metrics.d1 >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${metrics.d1}%` }}
                        />
                    </div>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                    <div className="text-sm text-gray-400">Day 7 Retention</div>
                    <div className="text-2xl font-bold">{metrics.d7}%</div>
                    <div className="text-xs text-gray-500">Users returning after week</div>
                    <div className={`h-2 bg-gray-700 rounded-full mt-2 overflow-hidden`}>
                        <div 
                            className={`h-full rounded-full ${metrics.d7 >= 50 ? 'bg-green-500' : metrics.d7 >= 30 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${metrics.d7}%` }}
                        />
                    </div>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                    <div className="text-sm text-gray-400">MoM Retention</div>
                    <div className="text-2xl font-bold">{metrics.monthly}%</div>
                    <div className="text-xs text-gray-500">Monthly active users</div>
                    <div className={`h-2 bg-gray-700 rounded-full mt-2 overflow-hidden`}>
                        <div 
                            className={`h-full rounded-full ${metrics.monthly >= targetRetention ? 'bg-green-500' : 'bg-red-500'}`}
                            style={{ width: `${metrics.monthly}%` }}
                        />
                    </div>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                    <div className="text-sm text-gray-400">Monthly Churn</div>
                    <div className="text-2xl font-bold">{metrics.churnRate}%</div>
                    <div className="text-xs text-gray-500">Users lost per month</div>
                    <div className={`h-2 bg-gray-700 rounded-full mt-2 overflow-hidden`}>
                        <div 
                            className={`h-full rounded-full ${metrics.churnRate <= 5 ? 'bg-green-500' : metrics.churnRate <= 10 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${metrics.churnRate}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Cohort Retention Heatmap */}
            <div className="mb-8">
                <h4 className="font-semibold mb-4">Cohort Retention Heatmap</h4>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-700">
                                <th className="text-left py-2 px-3 text-gray-400">Cohort</th>
                                <th className="text-center py-2 px-3 text-gray-400">Month 0</th>
                                <th className="text-center py-2 px-3 text-gray-400">Month 1</th>
                                <th className="text-center py-2 px-3 text-gray-400">Month 2</th>
                                <th className="text-center py-2 px-3 text-gray-400">Month 3</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cohortData.map((cohort) => (
                                <tr key={cohort.cohort} className="border-b border-gray-800/50">
                                    <td className="py-3 px-3 font-medium">{cohort.cohort}</td>
                                    {[cohort.month0, cohort.month1, cohort.month2, cohort.month3].map((retention, idx) => (
                                        <td key={idx} className="py-3 px-3 text-center">
                                            <div className="inline-flex items-center justify-center">
                                                <div 
                                                    className={`w-16 h-8 rounded flex items-center justify-center text-white font-medium ${
                                                        retention >= 70 ? 'bg-green-600/80' :
                                                        retention >= 50 ? 'bg-green-500/60' :
                                                        retention >= 40 ? 'bg-yellow-600/60' :
                                                        retention >= 30 ? 'bg-orange-600/60' :
                                                        'bg-red-600/60'
                                                    }`}
                                                >
                                                    {retention}%
                                                </div>
                                            </div>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                    Shows percentage of each cohort still active in subsequent months
                </div>
            </div>

            {/* LTV/CAC Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-semibold">LTV/CAC Ratio</h4>
                        <div className={`text-lg font-bold ${currentLtvCac >= targetLtvCac ? 'text-green-400' : 'text-red-400'}`}>
                            {currentLtvCac.toFixed(1)}:1
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-400">Lifetime Value (LTV)</span>
                                <span className="font-medium">£{metrics.ltv.toFixed(2)}</span>
                            </div>
                            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                                    style={{ width: `${Math.min((metrics.ltv / 100) * 100, 100)}%` }}
                                />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-400">Customer Acquisition Cost (CAC)</span>
                                <span className="font-medium">£{metrics.cac.toFixed(2)}</span>
                            </div>
                            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
                                    style={{ width: `${Math.min((metrics.cac / 50) * 100, 100)}%` }}
                                />
                            </div>
                        </div>
                    </div>
                    <div className={`mt-4 p-3 rounded ${currentLtvCac >= targetLtvCac ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
                        <div className="text-sm">
                            {currentLtvCac >= targetLtvCac ? (
                                <>✅ Healthy ratio: LTV {currentLtvCac.toFixed(1)}× CAC (target: {targetLtvCac}×)</>
                            ) : (
                                <>⚠️ Low ratio: LTV only {currentLtvCac.toFixed(1)}× CAC (need {targetLtvCac}×)</>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-lg p-6">
                    <h4 className="font-semibold mb-4">CAC Payback Period</h4>
                    <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-400">Current</span>
                            <span className="font-medium">{Math.ceil(metrics.cac / (metrics.ltv / 12))} months</span>
                        </div>
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div 
                                className={`h-full rounded-full ${Math.ceil(metrics.cac / (metrics.ltv / 12)) <= 1.5 ? 'bg-green-500' : 'bg-red-500'}`}
                                style={{ width: `${Math.min((Math.ceil(metrics.cac / (metrics.ltv / 12)) / 6) * 100, 100)}%` }}
                            />
                        </div>
                    </div>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Target</span>
                        <span className="font-medium">≤1.5 months</span>
                    </div>
                    <div className="text-sm text-gray-400 mb-4">
                        Time to recover customer acquisition cost
                    </div>
                    <div className="text-sm">
                        {Math.ceil(metrics.cac / (metrics.ltv / 12)) <= 1.5 ? (
                            <div className="text-green-400">✅ CAC payback within target (≤1.5 months)</div>
                        ) : (
                            <div className="text-red-400">⚠️ CAC payback too long — reduce acquisition cost or increase LTV</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Viral Coefficient */}
            <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold">Viral Coefficient</h4>
                    <div className={`text-2xl font-bold ${0.8 > 0.8 ? 'text-green-400' : 'text-red-400'}`}>
                        0.8
                    </div>
                </div>
                <div className="text-sm text-gray-400 mb-4">
                    Each user brings 0.8 new users through referrals
                </div>
                <div className="h-3 bg-gray-700 rounded-full overflow-hidden mb-2">
                    <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                        style={{ width: `${(0.8 / 1.5) * 100}%` }}
                    />
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                    <div>0 (no growth)</div>
                    <div>Target: 0.8</div>
                    <div>1 (viral)</div>
                </div>
                <div className={`mt-4 p-3 rounded ${0.8 >= 0.8 ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
                    <div className="text-sm">
                        {0.8 >= 0.8 ? (
                            <>✅ Viral coefficient meets target (≥0.8)</>
                        ) : (
                            <>⚠️ Viral coefficient below target — need more referrals or sharing features</>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}