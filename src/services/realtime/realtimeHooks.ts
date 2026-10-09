import { useEffect } from 'react';

import { supabase } from '@/services/supabase';
import { useAlerts } from '@/store/alerts';
import { useDevices } from '@/store/devices';
import { useIncidents } from '@/store/incidents';
import { useVehicles } from '@/store/vehicles';

export function useRealtimeVehicles() {
  const { fetchVehicles } = useVehicles();

  useEffect(() => {
    const channel = supabase
      .channel('vehicles_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vehicles' }, () =>
        fetchVehicles()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchVehicles]);
}

export function useRealtimeIncidents() {
  const { fetchIncidents } = useIncidents();

  useEffect(() => {
    const channel = supabase
      .channel('incidents_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'incidents' }, () =>
        fetchIncidents()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchIncidents]);
}

export function useRealtimeAlerts() {
  const { fetchAlerts } = useAlerts();

  useEffect(() => {
    const channel = supabase
      .channel('alerts_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alerts' }, () =>
        fetchAlerts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAlerts]);
}

export function useRealtimeDevices() {
  const { fetchDevices } = useDevices();

  useEffect(() => {
    const channel = supabase
      .channel('devices_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'devices' }, () =>
        fetchDevices()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchDevices]);
}

export function useAllRealtime() {
  useRealtimeVehicles();
  useRealtimeIncidents();
  useRealtimeAlerts();
  useRealtimeDevices();
}
