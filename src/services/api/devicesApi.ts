import { supabase } from '@/services/supabase';
import { DeviceHealth, DeviceStatus } from '@/types';

const DEVICES_TABLE = 'devices';

function mapDeviceFromDb(db: Record<string, unknown>): DeviceHealth {
  return {
    vehicleId: db.vehicle_id as string,
    deviceId: db.device_id as string,
    status: db.status as DeviceStatus,
    batteryLevel: db.battery_level as number,
    signalStrength: db.signal_strength as number,
    gpsAccuracy: db.gps_accuracy as number,
    lastHeartbeat: db.last_heartbeat as string,
    firmwareVersion: db.firmware_version as string,
    uptime: db.uptime as string,
  };
}

function mapDeviceToDb(device: Partial<DeviceHealth>): Record<string, unknown> {
  const db: Record<string, unknown> = {};
  if (device.vehicleId !== undefined) db.vehicle_id = device.vehicleId;
  if (device.deviceId !== undefined) db.device_id = device.deviceId;
  if (device.status !== undefined) db.status = device.status;
  if (device.batteryLevel !== undefined) db.battery_level = device.batteryLevel;
  if (device.signalStrength !== undefined) db.signal_strength = device.signalStrength;
  if (device.gpsAccuracy !== undefined) db.gps_accuracy = device.gpsAccuracy;
  if (device.lastHeartbeat !== undefined) db.last_heartbeat = device.lastHeartbeat;
  if (device.firmwareVersion !== undefined) db.firmware_version = device.firmwareVersion;
  if (device.uptime !== undefined) db.uptime = device.uptime;
  return db;
}

export const devicesApi = {
  async getAll(): Promise<DeviceHealth[]> {
    const { data, error } = await supabase
      .from(DEVICES_TABLE)
      .select('*')
      .order('device_id', { ascending: true });
    if (error) throw error;
    return (data ?? []).map(mapDeviceFromDb);
  },

  async getById(deviceId: string): Promise<DeviceHealth | null> {
    const { data, error } = await supabase
      .from(DEVICES_TABLE)
      .select('*')
      .eq('device_id', deviceId)
      .single();
    if (error) throw error;
    return data ? mapDeviceFromDb(data) : null;
  },

  async update(deviceId: string, changes: Partial<DeviceHealth>): Promise<void> {
    const dbChanges = mapDeviceToDb(changes);
    const { error } = await supabase
      .from(DEVICES_TABLE)
      .update(dbChanges)
      .eq('device_id', deviceId);
    if (error) throw error;
  },

  async updateStatus(deviceId: string, status: DeviceStatus): Promise<void> {
    const { error } = await supabase
      .from(DEVICES_TABLE)
      .update({ status, last_heartbeat: new Date().toISOString() })
      .eq('device_id', deviceId);
    if (error) throw error;
  },

  subscribeToChanges(callback: (devices: DeviceHealth[]) => void) {
    const channel = supabase
      .channel('devices_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: DEVICES_TABLE }, async () => {
        const { data } = await supabase
          .from(DEVICES_TABLE)
          .select('*')
          .order('device_id', { ascending: true });
        callback((data ?? []).map(mapDeviceFromDb));
      })
      .subscribe();
    return channel;
  },
};
