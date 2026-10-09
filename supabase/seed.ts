import { createClient } from '@supabase/supabase-js';
import { mockVehicles, mockIncidents, mockDevices, mockAlerts } from '../src/data/mockData';
import { Vehicle, Incident, DeviceHealth, Alert } from '../src/types';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function seedOperators() {
  const operators = [
    { name: 'San Jose Transport Coop', code: 'SJTC', region: 'NCR', contact_email: 'ops@sjtc.ph', contact_phone: '+63 2 123 4567', address: 'San Jose, NCR' },
    { name: 'Cruz Lines Inc.', code: 'CLI', region: 'NCR', contact_email: 'ops@cruzlines.ph', contact_phone: '+63 2 234 5678', address: 'Quezon City, NCR' },
    { name: 'Metro Bus Corp.', code: 'MBC', region: 'NCR', contact_email: 'ops@metrobust.ph', contact_phone: '+63 2 345 6789', address: 'Makati, NCR' },
    { name: 'Coastal Transport', code: 'CT', region: 'Region IV-A', contact_email: 'ops@coastal.ph', contact_phone: '+63 2 456 7890', address: 'Cavite, Region IV-A' },
    { name: 'Poblacion Transport', code: 'PT', region: 'NCR', contact_email: 'ops@poblacion.ph', contact_phone: '+63 2 567 8901', address: 'Manila, NCR' },
    { name: 'Independent', code: 'IND', region: 'NCR', contact_email: 'ops@independent.ph', contact_phone: '+63 2 678 9012', address: 'Various, NCR' },
  ];

  for (const op of operators) {
    const { error } = await supabase.from('operators').upsert(op, { onConflict: 'code' });
    if (error) throw error;
  }

  const { data, error } = await supabase.from('operators').select('id, code');
  if (error) throw error;
  return data;
}

async function seedVehicles(operators: { id: string; code: string }[]) {
  const operatorMap = new Map(operators.map(op => [op.code, op.id]));

  const vehiclesToInsert = mockVehicles.map(v => {
    let operatorCode = 'SJTC';
    if (v.operator === 'Cruz Lines Inc.') operatorCode = 'CLI';
    else if (v.operator === 'Metro Bus Corp.') operatorCode = 'MBC';
    else if (v.operator === 'Coastal Transport') operatorCode = 'CT';
    else if (v.operator === 'Poblacion Transport') operatorCode = 'PT';
    else if (v.operator === 'Independent') operatorCode = 'IND';

    return {
      plate_number: v.plateNumber,
      type: v.type,
      device_id: v.deviceId,
      driver: v.driver,
      operator_id: operatorMap.get(operatorCode),
      status: v.status,
      registration_status: v.registrationStatus,
      last_communication: v.lastCommunication,
      emergency_contact: v.emergencyContact,
      position: `POINT(${v.position.lng} ${v.position.lat})`,
      speed: v.speed,
      passengers: v.passengers,
      fuel_level: v.fuelLevel,
      route: v.route,
    };
  });

  const { error } = await supabase.from('vehicles').upsert(vehiclesToInsert, { onConflict: 'plate_number' });
  if (error) throw error;

  const { data, error: selectError } = await supabase.from('vehicles').select('id, plate_number, device_id');
  if (selectError) throw selectError;
  return data;
}

async function seedDevices(vehicles: { id: string; device_id: string }[]) {
  const vehicleMap = new Map(vehicles.map(v => [v.device_id, v.id]));

  const devicesToInsert = mockDevices.map(d => {
    const vehicleId = vehicleMap.get(d.deviceId);
    if (!vehicleId) throw new Error(`Vehicle not found for device ${d.deviceId}`);
    return {
      vehicle_id: vehicleId,
      device_id: d.deviceId,
      status: d.status,
      battery_level: d.batteryLevel,
      signal_strength: d.signalStrength,
      gps_accuracy: d.gpsAccuracy,
      last_heartbeat: d.lastHeartbeat,
      firmware_version: d.firmwareVersion,
      uptime: d.uptime,
    };
  });

  const { error } = await supabase.from('devices').upsert(devicesToInsert, { onConflict: 'device_id' });
  if (error) throw error;
}

async function seedIncidents(vehicles: { id: string; plate_number: string }[]) {
  const vehicleMap = new Map(vehicles.map(v => [v.plate_number, v.id]));

  const incidentsToInsert = mockIncidents.map(inc => {
    const vehicleId = vehicleMap.get(inc.vehicleId);
    if (!vehicleId) throw new Error(`Vehicle not found for incident ${inc.id}`);
    return {
      id: inc.id,
      vehicle_id: vehicleId,
      vehicle_type: inc.vehicleType,
      type: inc.type,
      priority: inc.priority,
      status: inc.status,
      timestamp: inc.timestamp,
      location: inc.location,
      coordinates: `POINT(${inc.coordinates.lng} ${inc.coordinates.lat})`,
      assigned_responder: inc.assignedResponder,
      notes: inc.notes,
      alert_delivery_ms: inc.alertDeliveryMs,
    };
  });

  const { error } = await supabase.from('incidents').upsert(incidentsToInsert, { onConflict: 'id' });
  if (error) throw error;

  const { data, error: selectError } = await supabase.from('incidents').select('id');
  if (selectError) throw selectError;
  return data;
}

async function seedIncidentTimeline(incidents: { id: string }[]) {
  const incidentMap = new Map(incidents.map(i => [i.id, i.id]));
  const timelineEntries = [];

  for (const inc of mockIncidents) {
    const incidentId = incidentMap.get(inc.id);
    if (!incidentId) continue;
    for (const entry of inc.timeline) {
      timelineEntries.push({
        incident_id: incidentId,
        timestamp: entry.timestamp,
        action: entry.action,
        actor: entry.actor,
        details: entry.details,
      });
    }
  }

  if (timelineEntries.length > 0) {
    const { error } = await supabase.from('incident_timeline').upsert(timelineEntries);
    if (error) throw error;
  }
}

async function seedAlerts(vehicles: { id: string; plate_number: string }[], incidents: { id: string }[]) {
  const vehicleMap = new Map(vehicles.map(v => [v.plate_number, v.id]));
  const incidentMap = new Map(incidents.map(i => [i.id, i.id]));

  const alertsToInsert = mockAlerts.map(alert => {
    const vehicleId = vehicleMap.get(alert.vehicleId);
    const incidentId = incidentMap.get(alert.incidentId);
    if (!vehicleId || !incidentId) throw new Error(`Missing references for alert ${alert.id}`);
    return {
      id: alert.id,
      incident_id: incidentId,
      vehicle_id: vehicleId,
      type: alert.type,
      priority: alert.priority,
      message: alert.message,
      timestamp: alert.timestamp,
      acknowledged: alert.acknowledged,
      acknowledged_at: alert.acknowledgedAt,
    };
  });

  const { error } = await supabase.from('alerts').upsert(alertsToInsert, { onConflict: 'id' });
  if (error) throw error;
}

async function seedSystemStats() {
  const { error } = await supabase.from('system_stats').upsert({
    id: 1,
    active_emergencies: 2,
    unacknowledged_alerts: 1,
    vehicles_monitored: 8,
    incidents_resolved_today: 3,
    avg_alert_delivery_ms: 1192,
    devices_offline: 2,
  });
  if (error) throw error;
}

async function main() {
  console.log('Seeding Supabase database...');

  console.log('1. Seeding operators...');
  const operators = await seedOperators();
  console.log(`   Created ${operators.length} operators`);

  console.log('2. Seeding vehicles...');
  const vehicles = await seedVehicles(operators);
  console.log(`   Created ${vehicles.length} vehicles`);

  console.log('3. Seeding devices...');
  await seedDevices(vehicles);
  console.log('   Devices seeded');

  console.log('4. Seeding incidents...');
  const incidents = await seedIncidents(vehicles);
  console.log(`   Created ${incidents.length} incidents`);

  console.log('5. Seeding incident timeline...');
  await seedIncidentTimeline(incidents);
  console.log('   Timeline entries seeded');

  console.log('6. Seeding alerts...');
  await seedAlerts(vehicles, incidents);
  console.log('   Alerts seeded');

  console.log('7. Seeding system stats...');
  await seedSystemStats();
  console.log('   System stats seeded');

  console.log('\\n✅ Database seeding completed successfully!');
}

main().catch(err => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});