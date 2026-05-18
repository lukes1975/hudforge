import React from 'react';
import MRRMetricsDashboard from '@/components/dashboard/MRRMetricsDashboard';
import FunnelMetricsDashboard from '@/components/dashboard/FunnelMetricsDashboard';
import RetentionMetricsDashboard from '@/components/dashboard/RetentionMetricsDashboard';
import AlertPanel from '@/components/dashboard/AlertPanel';
import WeeklyTargets from '@/components/dashboard/WeeklyTargets';

const hasClerkKeys = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY)

export default async function DashboardPage() {
    if (!hasClerkKeys) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-900 via-gray-900 to-black px-6 py-16 text-white">
                <div className="w-full max-w-xl rounded-[1.5rem] border border-white/10 bg-white/5 p-8 text-center shadow-2xl shadow-black/30">
                    <p className="text-sm uppercase text-cyan-300">Clerk setup incomplete</p>
                    <h1 className="mt-4 text-3xl font-semibold">Add your Clerk keys to unlock the dashboard.</h1>
                    <p className="mt-4 text-base leading-7 text-slate-300">
                        The protected dashboard is deployed, but Clerk is not fully connected yet because the required
                        production auth keys are still missing.
                    </p>
                </div>
            </main>
        );
    }

    const { auth } = await import('@clerk/nextjs/server');
    await auth.protect();

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white">
            <header className="border-b border-gray-800 py-6 px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <h1 className="text-3xl font-bold">HUDForge £10k MRR Objective Validation Framework</h1>
                    <p className="text-gray-400 mt-2">Real-time tracking of revenue, user acquisition, and milestones toward £10k MRR</p>
                </div>
            </header>

            <main className="py-8 px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    {/* Weekly Targets & Alerts */}
                    <div className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <WeeklyTargets />
                        </div>
                        <div>
                            <AlertPanel />
                        </div>
                    </div>

                    {/* MRR & Revenue Metrics */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <span className="text-3xl">💰</span> Revenue Metrics
                        </h2>
                        <MRRMetricsDashboard />
                    </section>

                    {/* User Acquisition Funnel */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <span className="text-3xl">📈</span> User Acquisition Funnel
                        </h2>
                        <FunnelMetricsDashboard />
                    </section>

                    {/* Retention & Engagement */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <span className="text-3xl">📊</span> Retention & Engagement
                        </h2>
                        <RetentionMetricsDashboard />
                    </section>

                    {/* Key Metrics Summary */}
                    <section className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-2xl border border-gray-700 p-6 mb-12">
                        <h2 className="text-2xl font-bold mb-6">Target Metrics for £10k MRR</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-gray-800/50 p-4 rounded-lg">
                                <div className="text-sm text-gray-400">Target Paying Users</div>
                                <div className="text-2xl font-bold">800–1,500</div>
                                <div className="text-xs text-gray-500">@ £6.67–£12.50 ARPU</div>
                            </div>
                            <div className="bg-gray-800/50 p-4 rounded-lg">
                                <div className="text-sm text-gray-400">MoM Retention</div>
                                <div className="text-2xl font-bold">&gt;35%</div>
                                <div className="text-xs text-gray-500">Activated users</div>
                            </div>
                            <div className="bg-gray-800/50 p-4 rounded-lg">
                                <div className="text-sm text-gray-400">CAC Payback</div>
                                <div className="text-2xl font-bold">&lt;45 days</div>
                                <div className="text-xs text-gray-500">Customer acquisition cost</div>
                            </div>
                            <div className="bg-gray-800/50 p-4 rounded-lg">
                                <div className="text-sm text-gray-400">Viral Coefficient</div>
                                <div className="text-2xl font-bold">&gt;0.8</div>
                                <div className="text-xs text-gray-500">Organic growth factor</div>
                            </div>
                        </div>
                    </section>

                    {/* Integration Status */}
                    <section className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-2xl border border-gray-700 p-6">
                        <h2 className="text-2xl font-bold mb-4">Integration Status</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className={`p-4 rounded-lg ${true ? 'bg-green-500/10 border border-green-500/50' : 'bg-red-500/10 border border-red-500/50'}`}>
                                <div className="font-semibold">Supabase Analytics</div>
                                <div className="text-sm text-gray-400">Data storage & metrics</div>
                                <div className="text-xs mt-2">{true ? '✅ Connected' : '❌ Disconnected'}</div>
                            </div>
                            <div className={`p-4 rounded-lg ${false ? 'bg-green-500/10 border border-green-500/50' : 'bg-gray-800/50 border border-gray-700'}`}>
                                <div className="font-semibold">Vercel Analytics</div>
                                <div className="text-sm text-gray-400">Traffic & user sessions</div>
                                <div className="text-xs mt-2">{false ? '✅ Connected' : '⚠️ Not configured'}</div>
                            </div>
                            <div className={`p-4 rounded-lg ${false ? 'bg-green-500/10 border border-green-500/50' : 'bg-gray-800/50 border border-gray-700'}`}>
                                <div className="font-semibold">Lemon Squeezy</div>
                                <div className="text-sm text-gray-400">Payment processing</div>
                                <div className="text-xs mt-2">{false ? '✅ Connected' : '⚠️ Not configured'}</div>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}