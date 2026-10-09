import { supabase } from '@/services/supabase';
import { Alert, IncidentPriority, IncidentType } from '@/types';

const ALERTS_TABLE = 'alerts';

function mapAlertFromDb(db: Record<string, unknown>): Alert {
  return {
    id: db.id as string,
    incidentId: db.incident_id as string,
    vehicleId: db.vehicle_id as string,
    type: db.type as IncidentType,
    priority: db.priority as IncidentPriority,
    message: db.message as string,
    timestamp: db.timestamp as string,
    acknowledged: db.acknowledged as boolean,
    acknowledgedAt: db.acknowledged_at as string | undefined,
  };
}

export const alertsApi = {
  async getAll(): Promise<Alert[]> {
    const { data, error } = await supabase
      .from(ALERTS_TABLE)
      .select('*')
      .order('timestamp', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapAlertFromDb);
  },

  async getById(id: string): Promise<Alert | null> {
    const { data, error } = await supabase.from(ALERTS_TABLE).select('*').eq('id', id).single();
    if (error) throw error;
    return data ? mapAlertFromDb(data) : null;
  },

  async create(alert: Omit<Alert, 'id'>): Promise<Alert> {
    const dbAlert = {
      incident_id: alert.incidentId,
      vehicle_id: alert.vehicleId,
      type: alert.type,
      priority: alert.priority,
      message: alert.message,
      timestamp: alert.timestamp,
      acknowledged: alert.acknowledged,
      acknowledged_at: alert.acknowledgedAt,
    };
    const { data, error } = await supabase.from(ALERTS_TABLE).insert(dbAlert).select().single();
    if (error) throw error;
    return mapAlertFromDb(data);
  },

  async acknowledge(id: string): Promise<void> {
    const { error } = await supabase
      .from(ALERTS_TABLE)
      .update({ acknowledged: true, acknowledged_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from(ALERTS_TABLE).delete().eq('id', id);
    if (error) throw error;
  },

  subscribeToChanges(callback: (alerts: Alert[]) => void) {
    const channel = supabase
      .channel('alerts_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: ALERTS_TABLE }, async () => {
        const { data } = await supabase
          .from(ALERTS_TABLE)
          .select('*')
          .order('timestamp', { ascending: false });
        callback((data ?? []).map(mapAlertFromDb));
      })
      .subscribe();
    return channel;
  },
};
