// Dashboard integration script
import { supabase } from './supabase';
import { updateDailyMrrSnapshot, getFunnelStages, getCohortRetention, checkAlerts } from './analytics';

export async function updateAnalytics() {
    try {
        console.log('Updating analytics dashboard...');
        
        // Update MRR snapshot
        const mrrUpdated = await updateDailyMrrSnapshot();
        if (mrrUpdated) {
            console.log('✅ MRR snapshot updated');
        }
        
        // Check for new alerts
        const alerts = await checkAlerts();
        console.log(`✅ Alerts checked: ${alerts.length} triggered`);
        
        return {
            success: true,
            mrrUpdated,
            alertsTriggered: alerts.length
        };
    } catch (error) {
        console.error('Analytics update failed:', error);
        return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
}

export async function getDashboardData() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    try {
        const [mrrData, funnelData, retentionData] = await Promise.all([
            // Get MRR data for last 30 days
            supabase
                .from('mrr_snapshots')
                .select('*')
                .gte('snapshot_date', thirtyDaysAgo.toISOString().split('T')[0])
                .order('snapshot_date'),
                
            // Get funnel data for current month
            getFunnelStages(new Date(now.getFullYear(), now.getMonth(), 1), now),
            
            // Get retention data for latest cohort
            getCohortRetention(new Date(now.getFullYear(), now.getMonth() - 1, 1))
        ]);
        
        return {
            mrrData: mrrData.data || [],
            funnelData,
            retentionData,
            lastUpdated: now.toISOString()
        };
    } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        return {
            mrrData: [],
            funnelData: [],
            retentionData: [],
            lastUpdated: now.toISOString(),
            error: error instanceof Error ? error.message : String(error)
        };
    }
}