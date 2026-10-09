import { supabase } from '@/services/supabase';

export interface SystemStats {
  activeEmergencies: number;
  unacknowledgedAlerts: number;
  vehiclesMonitored: number;
  incidentsResolvedToday: number;
  avgAlertDeliveryMs: number;
  devicesOffline: number;
}

export interface AnalyticsData {
  incidentsByType: { name: string; count: number; fill: string }[];
  incidentsByVehicleType: { name: string; count: number; fill: string }[];
  dailyIncidents: { date: string; incidents: number; resolved: number }[];
  alertDeliveryTime: { date: string; avgMs: number }[];
}

export const analyticsApi = {
  async getSystemStats(): Promise<SystemStats> {
    const [
      { count: activeEmergencies },
      { count: unacknowledgedAlerts },
      { count: vehiclesMonitored },
      { count: incidentsResolvedToday },
      { data: alertDelivery },
      { count: devicesOffline },
    ] = await Promise.all([
      supabase
        .from('incidents')
        .select('id', { count: 'exact', head: true })
        .in('status', ['new', 'acknowledged', 'responding']),
      supabase
        .from('alerts')
        .select('id', { count: 'exact', head: true })
        .eq('acknowledged', false),
      supabase
        .from('vehicles')
        .select('id', { count: 'exact', head: true })
        .neq('status', 'offline'),
      supabase
        .from('incidents')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'resolved')
        .gte('updated_at', new Date().toISOString().split('T')[0]),
      supabase.from('incidents').select('alert_delivery_ms').not('alert_delivery_ms', 'is', null),
      supabase.from('devices').select('id', { count: 'exact', head: true }).eq('status', 'offline'),
    ]);

    const avgAlertDeliveryMs =
      alertDelivery && alertDelivery.length > 0
        ? Math.round(
            alertDelivery.reduce((sum, a) => sum + (a.alert_delivery_ms ?? 0), 0) /
              alertDelivery.length
          )
        : 0;

    return {
      activeEmergencies: activeEmergencies ?? 0,
      unacknowledgedAlerts: unacknowledgedAlerts ?? 0,
      vehiclesMonitored: vehiclesMonitored ?? 0,
      incidentsResolvedToday: incidentsResolvedToday ?? 0,
      avgAlertDeliveryMs,
      devicesOffline: devicesOffline ?? 0,
    };
  },

  async getAnalyticsData(): Promise<AnalyticsData> {
    const [byType, byVehicleType, daily, delivery] = await Promise.all([
      supabase
        .from('incidents')
        .select('type')
        .then(({ data }) => {
          const counts = new Map<string, number>();
          data?.forEach((d) => counts.set(d.type, (counts.get(d.type) ?? 0) + 1));
          const colors = {
            crash: '#ef4444',
            sos: '#f59e0b',
            medical: '#8b5cf6',
            threat: '#ec4899',
            other: '#64748b',
          };
          return Array.from(counts.entries()).map(([name, count]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1).replace('-', ' '),
            count,
            fill: colors[name as keyof typeof colors] ?? '#64748b',
          }));
        }),
      supabase
        .from('vehicles')
        .select('type')
        .then(({ data }) => {
          const counts = new Map<string, number>();
          data?.forEach((d) => counts.set(d.type, (counts.get(d.type) ?? 0) + 1));
          const colors = {
            jeepney: '#3b82f6',
            'uv-express': '#10b981',
            bus: '#8b5cf6',
            tricycle: '#f59e0b',
          };
          return Array.from(counts.entries()).map(([name, count]) => ({
            name:
              name === 'uv-express' ? 'UV Express' : name.charAt(0).toUpperCase() + name.slice(1),
            count,
            fill: colors[name as keyof typeof colors] ?? '#64748b',
          }));
        }),
      supabase
        .from('incidents')
        .select('timestamp, status')
        .gte('timestamp', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .then(({ data }) => {
          const dailyMap = new Map<string, { incidents: number; resolved: number }>();
          data?.forEach((d) => {
            const date = new Date(d.timestamp).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            });
            const entry = dailyMap.get(date) ?? { incidents: 0, resolved: 0 };
            entry.incidents++;
            if (d.status === 'resolved') entry.resolved++;
            dailyMap.set(date, entry);
          });
          return Array.from(dailyMap.entries())
            .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
            .map(([date, values]) => ({ date, ...values }));
        }),
      supabase
        .from('incidents')
        .select('timestamp, alert_delivery_ms')
        .not('alert_delivery_ms', 'is', null)
        .then(({ data }) => {
          const dailyMap = new Map<string, number[]>();
          data?.forEach((d) => {
            const date = new Date(d.timestamp).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            });
            const arr = dailyMap.get(date) ?? [];
            arr.push(d.alert_delivery_ms);
            dailyMap.set(date, arr);
          });
          return Array.from(dailyMap.entries())
            .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
            .map(([date, values]) => ({
              date,
              avgMs: Math.round(values.reduce((s, v) => s + v, 0) / values.length),
            }));
        }),
    ]);

    return {
      incidentsByType: byType ?? [],
      incidentsByVehicleType: byVehicleType ?? [],
      dailyIncidents: daily ?? [],
      alertDeliveryTime: delivery ?? [],
    };
  },
};
