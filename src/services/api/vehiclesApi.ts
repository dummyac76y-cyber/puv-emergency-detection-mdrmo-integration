import { supabase } from '@/services/supabase';
import { Vehicle, VehicleStatus, VehicleType } from '@/types';

const VEHICLES_TABLE = 'vehicles';

function mapVehicleFromDb(db: Record<string, unknown>): Vehicle {
  return {
    id: db.id as string,
    plateNumber: db.plate_number as string,
    type: db.type as VehicleType,
    deviceId: db.device_id as string,
    driver: db.driver as string,
    operator: db.operator as string,
    status: db.status as VehicleStatus,
    registrationStatus: db.registration_status as Vehicle['registrationStatus'],
    lastCommunication: db.last_communication as string,
    emergencyContact: db.emergency_contact as string,
    position: { lat: db.lat as number, lng: db.lng as number },
    speed: db.speed as number,
    passengers: db.passengers as number,
    fuelLevel: db.fuel_level as number,
    route: db.route as string,
  };
}

function mapVehicleToDb(vehicle: Partial<Vehicle>): Record<string, unknown> {
  const db: Record<string, unknown> = {};
  if (vehicle.plateNumber !== undefined) db.plate_number = vehicle.plateNumber;
  if (vehicle.type !== undefined) db.type = vehicle.type;
  if (vehicle.deviceId !== undefined) db.device_id = vehicle.deviceId;
  if (vehicle.driver !== undefined) db.driver = vehicle.driver;
  if (vehicle.operator !== undefined) db.operator = vehicle.operator;
  if (vehicle.status !== undefined) db.status = vehicle.status;
  if (vehicle.registrationStatus !== undefined) db.registration_status = vehicle.registrationStatus;
  if (vehicle.lastCommunication !== undefined) db.last_communication = vehicle.lastCommunication;
  if (vehicle.emergencyContact !== undefined) db.emergency_contact = vehicle.emergencyContact;
  if (vehicle.position !== undefined) {
    db.lat = vehicle.position.lat;
    db.lng = vehicle.position.lng;
  }
  if (vehicle.speed !== undefined) db.speed = vehicle.speed;
  if (vehicle.passengers !== undefined) db.passengers = vehicle.passengers;
  if (vehicle.fuelLevel !== undefined) db.fuel_level = vehicle.fuelLevel;
  if (vehicle.route !== undefined) db.route = vehicle.route;
  return db;
}

export const vehiclesApi = {
  async getAll(): Promise<Vehicle[]> {
    const { data, error } = await supabase
      .from(VEHICLES_TABLE)
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapVehicleFromDb);
  },

  async getById(id: string): Promise<Vehicle | null> {
    const { data, error } = await supabase.from(VEHICLES_TABLE).select('*').eq('id', id).single();
    if (error) throw error;
    return data ? mapVehicleFromDb(data) : null;
  },

  async create(vehicle: Omit<Vehicle, 'id'>): Promise<Vehicle> {
    const dbVehicle = mapVehicleToDb(vehicle);
    const { data, error } = await supabase.from(VEHICLES_TABLE).insert(dbVehicle).select().single();
    if (error) throw error;
    return mapVehicleFromDb(data);
  },

  async update(id: string, changes: Partial<Vehicle>): Promise<void> {
    const dbChanges = mapVehicleToDb(changes);
    const { error } = await supabase.from(VEHICLES_TABLE).update(dbChanges).eq('id', id);
    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from(VEHICLES_TABLE).delete().eq('id', id);
    if (error) throw error;
  },

  async updateStatus(id: string, status: VehicleStatus): Promise<void> {
    const { error } = await supabase
      .from(VEHICLES_TABLE)
      .update({ status, last_communication: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
  },

  subscribeToChanges(callback: (vehicles: Vehicle[]) => void) {
    const channel = supabase
      .channel('vehicles_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: VEHICLES_TABLE }, async () => {
        const { data } = await supabase
          .from(VEHICLES_TABLE)
          .select('*')
          .order('created_at', { ascending: false });
        callback((data ?? []).map(mapVehicleFromDb));
      })
      .subscribe();
    return channel;
  },
};
