import { supabase } from '@/services/supabase';
import { Incident, IncidentStatus, TimelineEntry } from '@/types';

const INCIDENTS_TABLE = 'incidents';
const TIMELINE_TABLE = 'incident_timeline';

function mapIncidentFromDb(db: Record<string, unknown>): Incident {
  return {
    id: db.id as string,
    vehicleId: db.vehicle_id as string,
    vehicleType: db.vehicle_type as Incident['vehicleType'],
    type: db.type as Incident['type'],
    priority: db.priority as Incident['priority'],
    status: db.status as IncidentStatus,
    timestamp: db.timestamp as string,
    location: db.location as string,
    coordinates: { lat: db.lat as number, lng: db.lng as number },
    assignedResponder: db.assigned_responder as string | undefined,
    notes: db.notes as string,
    alertDeliveryMs: db.alert_delivery_ms as number,
    timeline: [],
  };
}

async function fetchTimeline(incidentId: string): Promise<TimelineEntry[]> {
  const { data, error } = await supabase
    .from(TIMELINE_TABLE)
    .select('*')
    .eq('incident_id', incidentId)
    .order('timestamp', { ascending: true });
  if (error) throw error;
  return (data ?? []) as TimelineEntry[];
}

export const incidentsApi = {
  async getAll(): Promise<Incident[]> {
    const { data, error } = await supabase
      .from(INCIDENTS_TABLE)
      .select('*')
      .order('timestamp', { ascending: false });
    if (error) throw error;
    const incidents = (data ?? []).map(mapIncidentFromDb);
    const incidentsWithTimeline = await Promise.all(
      incidents.map(async (inc) => {
        const timeline = await fetchTimeline(inc.id);
        return { ...inc, timeline };
      })
    );
    return incidentsWithTimeline;
  },

  async getById(id: string): Promise<Incident | null> {
    const { data, error } = await supabase.from(INCIDENTS_TABLE).select('*').eq('id', id).single();
    if (error) throw error;
    if (!data) return null;
    const incident = mapIncidentFromDb(data);
    incident.timeline = await fetchTimeline(id);
    return incident;
  },

  async create(incident: Omit<Incident, 'id'>): Promise<Incident> {
    const dbIncident = {
      vehicle_id: incident.vehicleId,
      vehicle_type: incident.vehicleType,
      type: incident.type,
      priority: incident.priority,
      status: incident.status,
      timestamp: incident.timestamp,
      location: incident.location,
      lat: incident.coordinates.lat,
      lng: incident.coordinates.lng,
      assigned_responder: incident.assignedResponder,
      notes: incident.notes,
      alert_delivery_ms: incident.alertDeliveryMs,
    };
    const { data, error } = await supabase
      .from(INCIDENTS_TABLE)
      .insert(dbIncident)
      .select()
      .single();
    if (error) throw error;
    const newIncident = mapIncidentFromDb(data);
    if (incident.timeline.length > 0) {
      const timelineEntries = incident.timeline.map((entry) => ({
        incident_id: data.id,
        ...entry,
      }));
      await supabase.from(TIMELINE_TABLE).insert(timelineEntries);
      newIncident.timeline = incident.timeline;
    }
    return newIncident;
  },

  async update(id: string, changes: Partial<Incident>): Promise<void> {
    const dbChanges: Record<string, unknown> = {};
    if (changes.vehicleId !== undefined) dbChanges.vehicle_id = changes.vehicleId;
    if (changes.vehicleType !== undefined) dbChanges.vehicle_type = changes.vehicleType;
    if (changes.type !== undefined) dbChanges.type = changes.type;
    if (changes.priority !== undefined) dbChanges.priority = changes.priority;
    if (changes.status !== undefined) dbChanges.status = changes.status;
    if (changes.timestamp !== undefined) dbChanges.timestamp = changes.timestamp;
    if (changes.location !== undefined) dbChanges.location = changes.location;
    if (changes.coordinates !== undefined) {
      dbChanges.lat = changes.coordinates.lat;
      dbChanges.lng = changes.coordinates.lng;
    }
    if (changes.assignedResponder !== undefined)
      dbChanges.assigned_responder = changes.assignedResponder;
    if (changes.notes !== undefined) dbChanges.notes = changes.notes;
    if (changes.alertDeliveryMs !== undefined)
      dbChanges.alert_delivery_ms = changes.alertDeliveryMs;

    const { error } = await supabase.from(INCIDENTS_TABLE).update(dbChanges).eq('id', id);
    if (error) throw error;
  },

  async updateStatus(id: string, status: IncidentStatus): Promise<void> {
    const { error } = await supabase.from(INCIDENTS_TABLE).update({ status }).eq('id', id);
    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from(INCIDENTS_TABLE).delete().eq('id', id);
    if (error) throw error;
  },

  subscribeToChanges(callback: (incidents: Incident[]) => void) {
    const channel = supabase
      .channel('incidents_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: INCIDENTS_TABLE },
        async () => {
          const { data } = await supabase
            .from(INCIDENTS_TABLE)
            .select('*')
            .order('timestamp', { ascending: false });
          const incidents = (data ?? []).map(mapIncidentFromDb);
          const incidentsWithTimeline = await Promise.all(
            incidents.map(async (inc) => {
              const timeline = await fetchTimeline(inc.id);
              return { ...inc, timeline };
            })
          );
          callback(incidentsWithTimeline);
        }
      )
      .subscribe();
    return channel;
  },
};
