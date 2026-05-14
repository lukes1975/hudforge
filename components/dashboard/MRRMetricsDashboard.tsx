'use client';

import React, { useState, useEffect } from 'react';

interface MRRData {
    date: string;
    total: number;
    new: number;
    expansion: number;
    churned: number;
    netNew: number;
    activeCustomers: number;
}

export default function MRRMetricsDashboard() {
    const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('month');
    const [mrrData, setMrrData] = useState<MRRData[]>([]);

    // Mock data - in production this would come from Supabase
    useEffect(() => {
        const generateMockData = () => {
            const data: MRRData[] = [];
            const now = new Date();
            
            for (let i = 30; i >= 0; i--) {
                const date = new Date(now);
                date.setDate(date.getDate() - i);
                
                // Simulate growth toward £10k MRR
                const baseMrr = 1000; // Starting at £10 MRR
                const dailyGrowth = 33; // £33/day = ~£1000/month
                const total = Math.min(baseMrr + (i * dailyGrowth), 10000); // Cap at £10k
                const newMrr = Math.floor(Math.random() * 200) + 50;
                const churnedMrr = Math.floor(Math.random() * 100);
                
                data.push({
                    date: date.toISOString().split('T')[0],
                    total,
                    new: newMrr,
                    expansion: Math.floor(Math.random() * 50),
                    churned: churnedMrr,
                    netNew: newMrr - churnedMrr,
                    activeCustomers: Math.floor(total / 12.5), // Assuming ~£12.50 ARPU
                });
            }
            setMrrData(data);
        };

        generateMockData();
    }, []);

    const currentMrr = mrrData[mrrData.length - 1]?.total || 0;
    const targetMrr = 10000; // £10k MRR target
    const progressPercentage = Math.min((currentMrr / targetMrr) * 100, 100);
    
    const weeklyMrrNeeded = (targetMrr - currentMrr) / 13; // 13 weeks in ~3 months
    const dailyMrrNeeded = weeklyMrrNeeded / 7;

    const filteredData = timeRange === 'week' 
        ? mrrData.slice(-7)
        : timeRange === 'month'
        ? mrrData
        : []; // Simplified for demo

    return (
        <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-2xl border border-gray-700 p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Monthly Recurring Revenue (MRR)</h3>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setTimeRange('week')}
                        className={`px-3 py-1 rounded-lg text-sm ${timeRange === 'week' ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-300'}`}
                    >
                        1W
                    </button>
                    <button 
                        onClick={() => setTimeRange('month')}
                        className={`px-3 py-1 rounded-lg text-sm ${timeRange === 'month' ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-300'}`}
                    >
                        1M
                    </button>
                    <button 
                        onClick={() => setTimeRange('quarter')}
                        className={`px-3 py-1 rounded-lg text-sm ${timeRange === 'quarter' ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-300'}`}
                    >
                        3M
                    </button>
                </div>
            </div>

            {/* MRR Progress */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                    <div className="text-3xl font-bold">£{(currentMrr / 100).toFixed(2)}</div>
                    <div className="text-gray-400">Target: £{(targetMrr / 100).toFixed(2)}</div>
                </div>
                <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>
                <div className="flex justify-between text-sm text-gray-400 mt-2">
                    <div>{progressPercentage.toFixed(1)}% to target</div>
                    <div>Need £{(dailyMrrNeeded / 100).toFixed(2)} daily growth</div>
                </div>
            </div>

            {/* MRR Components */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gray-800/50 p-4 rounded-lg">
                    <div className="text-sm text-gray-400">New MRR</div>
                    <div className="text-2xl font-bold text-green-400">+£{((mrrData[mrrData.length - 1]?.new || 0) / 100).toFixed(2)}</div>
                    <div className="text-xs text-gray-500">This month</div>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                    <div className="text-sm text-gray-400">Expansion MRR</div>
                    <div className="text-2xl font-bold text-blue-400">+£{((mrrData[mrrData.length - 1]?.expansion || 0) / 100).toFixed(2)}</div>
                    <div className="text-xs text-gray-500">Upgrades & add-ons</div>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                    <div className="text-sm text-gray-400">Churned MRR</div>
                    <div className="text-2xl font-bold text-red-400">-£{((mrrData[mrrData.length - 1]?.churned || 0) / 100).toFixed(2)}</div>
                    <div className="text-xs text-gray-500">This month</div>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                    <div className="text-sm text-gray-400">Net New MRR</div>
                    <div className="text-2xl font-bold text-white">£{((mrrData[mrrData.length - 1]?.netNew || 0) / 100).toFixed(2)}</div>
                    <div className="text-xs text-gray-500">Net growth</div>
                </div>
            </div>

            {/* Simple Chart */}
            <div className="h-64">
                <div className="text-sm text-gray-400 mb-2">MRR Trend ({timeRange})</div>
                <div className="relative h-48">
                    {filteredData.length > 0 && (
                        <div className="absolute inset-0 flex items-end">
                            {filteredData.map((point, idx) => {
                                const maxMrr = Math.max(...filteredData.map(d => d.total));
                                const height = (point.total / maxMrr) * 100;
                                return (
                                    <div 
                                        key={idx}
                                        className="flex-1 flex flex-col items-center mx-0.5"
                                    >
                                        <div 
                                            className="w-full bg-gradient-to-t from-blue-500/60 to-purple-600/60 rounded-t"
                                            style={{ height: `${height}%` }}
                                        />
                                        <div className="text-xs text-gray-500 mt-1">
                                            {timeRange === 'week' 
                                                ? new Date(point.date).toLocaleDateString('en-US', { weekday: 'short' })
                                                : new Date(point.date).getDate()}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Active Customers */}
            <div className="mt-6 p-4 bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-lg">
                <div className="flex justify-between items-center">
                    <div>
                        <div className="text-sm text-gray-400">Active Paying Customers</div>
                        <div className="text-2xl font-bold">{mrrData[mrrData.length - 1]?.activeCustomers || 0}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-gray-400">Required for £10k MRR</div>
                        <div className="text-2xl font-bold">800–1,500</div>
                    </div>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                    Current ARPU: ~£{(currentMrr > 0 && mrrData[mrrData.length - 1]?.activeCustomers > 0 
                        ? (currentMrr / mrrData[mrrData.length - 1].activeCustomers / 100).toFixed(2) 
                        : '0.00')}
                </div>
            </div>
        </div>
    );
}