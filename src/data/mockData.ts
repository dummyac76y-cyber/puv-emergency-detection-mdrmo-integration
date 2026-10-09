import { Vehicle, Incident, DeviceHealth, Alert, SystemStats } from '../types';

// Center coordinates: a Philippine municipality (simulated)
const CENTER = { lat: 14.5995, lng: 120.9842 };

export const mockVehicles: Vehicle[] = [
  {
    id: 'VH-001', plateNumber: 'ABC-1234', type: 'jeepney', deviceId: 'ESP32-001',
    driver: 'Juan Dela Cruz', operator: 'San Jose Transport Coop', status: 'normal',
    registrationStatus: 'active', lastCommunication: '2026-01-15T08:32:00Z',
    emergencyContact: '+63 917 123 4567',
    position: { lat: CENTER.lat + 0.008, lng: CENTER.lng - 0.005 },
    speed: 35, passengers: 18, fuelLevel: 72, route: 'Route 1 — Town Center to Brgy. San Jose',
  },
  {
    id: 'VH-002', plateNumber: 'XYZ-5678', type: 'jeepney', deviceId: 'ESP32-002',
    driver: 'Pedro Santos', operator: 'San Jose Transport Coop', status: 'emergency',
    registrationStatus: 'active', lastCommunication: '2026-01-15T08:30:00Z',
    emergencyContact: '+63 918 234 5678',
    position: { lat: CENTER.lat + 0.003, lng: CENTER.lng + 0.006 },
    speed: 0, passengers: 12, fuelLevel: 45, route: 'Route 2 — Market to Poblacion',
  },
  {
    id: 'VH-003', plateNumber: 'DEF-9012', type: 'uv-express', deviceId: 'ESP32-003',
    driver: 'Maria Garcia', operator: 'Cruz Lines Inc.', status: 'normal',
    registrationStatus: 'active', lastCommunication: '2026-01-15T08:31:00Z',
    emergencyContact: '+63 919 345 6789',
    position: { lat: CENTER.lat - 0.005, lng: CENTER.lng + 0.010 },
    speed: 48, passengers: 10, fuelLevel: 88, route: 'Route 3 — School District Loop',
  },
  {
    id: 'VH-004', plateNumber: 'GHI-3456', type: 'bus', deviceId: 'ESP32-004',
    driver: 'Roberto Reyes', operator: 'Metro Bus Corp.', status: 'normal',
    registrationStatus: 'active', lastCommunication: '2026-01-15T08:32:00Z',
    emergencyContact: '+63 920 456 7890',
    position: { lat: CENTER.lat - 0.012, lng: CENTER.lng - 0.003 },
    speed: 52, passengers: 35, fuelLevel: 61, route: 'Route 4 — Hospital Express',
  },
  {
    id: 'VH-005', plateNumber: 'JKL-7890', type: 'tricycle', deviceId: 'ESP32-005',
    driver: 'Antonio Lim', operator: 'Independent', status: 'offline',
    registrationStatus: 'active', lastCommunication: '2026-01-15T07:15:00Z',
    emergencyContact: '+63 921 567 8901',
    position: { lat: CENTER.lat + 0.015, lng: CENTER.lng + 0.002 },
    speed: 0, passengers: 0, fuelLevel: 95, route: 'Zone A — Barangay Loop',
  },
  {
    id: 'VH-006', plateNumber: 'MNO-2345', type: 'uv-express', deviceId: 'ESP32-006',
    driver: 'Fernando Torres', operator: 'Coastal Transport', status: 'sos',
    registrationStatus: 'active', lastCommunication: '2026-01-15T08:28:00Z',
    emergencyContact: '+63 922 678 9012',
    position: { lat: CENTER.lat + 0.002, lng: CENTER.lng + 0.012 },
    speed: 0, passengers: 8, fuelLevel: 53, route: 'Route 5 — Coastal Route',
  },
  {
    id: 'VH-007', plateNumber: 'PQR-6789', type: 'jeepney', deviceId: 'ESP32-007',
    driver: 'Carlos Mendoza', operator: 'Poblacion Transport', status: 'normal',
    registrationStatus: 'expired', lastCommunication: '2026-01-15T08:25:00Z',
    emergencyContact: '+63 923 789 0123',
    position: { lat: CENTER.lat - 0.008, lng: CENTER.lng - 0.010 },
    speed: 28, passengers: 14, fuelLevel: 30, route: 'Route 6 — Terminal Loop',
  },
  {
    id: 'VH-008', plateNumber: 'STU-1122', type: 'tricycle', deviceId: 'ESP32-008',
    driver: 'Miguel Aquino', operator: 'Independent', status: 'normal',
    registrationStatus: 'active', lastCommunication: '2026-01-15T08:32:00Z',
    emergencyContact: '+63 924 890 1234',
    position: { lat: CENTER.lat + 0.010, lng: CENTER.lng - 0.008 },
    speed: 22, passengers: 3, fuelLevel: 67, route: 'Zone B — Residential Area',
  },
  {
    id: 'VH-009', plateNumber: 'VWX-3344', type: 'bus', deviceId: 'ESP32-009',
    driver: 'Ricardo Ramos', operator: 'Metro Bus Corp.', status: 'normal',
    registrationStatus: 'active', lastCommunication: '2026-01-15T08:30:00Z',
    emergencyContact: '+63 925 901 2345',
    position: { lat: CENTER.lat - 0.003, lng: CENTER.lng + 0.003 },
    speed: 40, passengers: 28, fuelLevel: 78, route: 'Route 7 — Provincial Highway',
  },
  {
    id: 'VH-010', plateNumber: 'YZA-5566', type: 'jeepney', deviceId: 'ESP32-010',
    driver: 'Andres Villanueva', operator: 'San Jose Transport Coop', status: 'offline',
    registrationStatus: 'suspended', lastCommunication: '2026-01-14T22:00:00Z',
    emergencyContact: '+63 926 012 3456',
    position: { lat: CENTER.lat + 0.018, lng: CENTER.lng + 0.008 },
    speed: 0, passengers: 0, fuelLevel: 15, route: 'Route 1 — Town Center to Brgy. San Jose',
  },
];

export const mockIncidents: Incident[] = [
  {
    id: 'INC-2026-001', vehicleId: 'VH-002', vehicleType: 'jeepney',
    type: 'crash', priority: 'critical', status: 'responding',
    timestamp: '2026-01-15T08:30:00Z',
    location: 'National Highway, Km 12, Brgy. San Isidro',
    coordinates: { lat: CENTER.lat + 0.003, lng: CENTER.lng + 0.006 },
    assignedResponder: 'Team Alpha',
    notes: 'Multi-vehicle collision. At least 2 passengers reported injured. Airbag deployed.',
    alertDeliveryMs: 1200,
    timeline: [
      { timestamp: '2026-01-15T08:30:00Z', action: 'Crash detected', actor: 'ESP32-002 (Automatic)', details: 'Impact sensor triggered. Deceleration > 8G.' },
      { timestamp: '2026-01-15T08:30:01Z', action: 'Alert transmitted', actor: 'System', details: 'GSM alert sent. Delivery confirmed in 1.2s.' },
      { timestamp: '2026-01-15T08:30:15Z', action: 'Incident created', actor: 'System', details: 'INC-2026-001 auto-generated.' },
      { timestamp: '2026-01-15T08:30:45Z', action: 'Acknowledged', actor: 'Operator Reyes', details: 'Confirmed receipt. Dispatching Team Alpha.' },
      { timestamp: '2026-01-15T08:31:20Z', action: 'Team Alpha dispatched', actor: 'Operator Reyes', details: 'ETA 4 minutes.' },
      { timestamp: '2026-01-15T08:32:00Z', action: 'Medical Unit notified', actor: 'Operator Reyes', details: 'Ambulance dispatched from Municipal Hospital.' },
    ],
  },
  {
    id: 'INC-2026-002', vehicleId: 'VH-006', vehicleType: 'uv-express',
    type: 'sos', priority: 'critical', status: 'acknowledged',
    timestamp: '2026-01-15T08:28:00Z',
    location: 'Coastal Road, near Fish Port, Brgy. San Roque',
    coordinates: { lat: CENTER.lat + 0.002, lng: CENTER.lng + 0.012 },
    assignedResponder: 'Team Bravo',
    notes: 'Driver activated SOS button. Reports possible threat from passenger.',
    alertDeliveryMs: 800,
    timeline: [
      { timestamp: '2026-01-15T08:28:00Z', action: 'SOS activated', actor: 'Driver (Manual)', details: 'Emergency button pressed.' },
      { timestamp: '2026-01-15T08:28:01Z', action: 'Alert transmitted', actor: 'System', details: 'Priority GSM alert sent. Delivery confirmed in 0.8s.' },
      { timestamp: '2026-01-15T08:28:30Z', action: 'Acknowledged', actor: 'Operator Santos', details: 'Contacting driver via radio.' },
    ],
  },
  {
    id: 'INC-2026-003', vehicleId: 'VH-004', vehicleType: 'bus',
    type: 'medical', priority: 'high', status: 'responding',
    timestamp: '2026-01-15T07:45:00Z',
    location: 'Hospital Access Road, Zone B',
    coordinates: { lat: CENTER.lat - 0.012, lng: CENTER.lng - 0.003 },
    assignedResponder: 'Medical Unit 1',
    notes: 'Passenger experiencing chest pain. Bus diverted to hospital.',
    alertDeliveryMs: 1500,
    timeline: [
      { timestamp: '2026-01-15T07:45:00Z', action: 'Medical alert', actor: 'Driver (Manual)', details: 'Passenger reported chest pain.' },
      { timestamp: '2026-01-15T07:45:02Z', action: 'Alert transmitted', actor: 'System', details: 'Delivery confirmed in 1.5s.' },
      { timestamp: '2026-01-15T07:46:00Z', action: 'Acknowledged', actor: 'Operator Reyes', details: 'Medical Unit 1 dispatched.' },
    ],
  },
  {
    id: 'INC-2026-004', vehicleId: 'VH-003', vehicleType: 'uv-express',
    type: 'other', priority: 'medium', status: 'resolved',
    timestamp: '2026-01-15T06:20:00Z',
    location: 'School District, Zone A',
    coordinates: { lat: CENTER.lat - 0.005, lng: CENTER.lng + 0.010 },
    notes: 'Engine overheating warning. Driver pulled over safely.',
    alertDeliveryMs: 2100,
    timeline: [
      { timestamp: '2026-01-15T06:20:00Z', action: 'Engine alert', actor: 'ESP32-003 (Automatic)', details: 'Temperature sensor exceeded threshold.' },
      { timestamp: '2026-01-15T06:20:02Z', action: 'Alert transmitted', actor: 'System', details: 'Delivery confirmed in 2.1s.' },
      { timestamp: '2026-01-15T06:25:00Z', action: 'Acknowledged', actor: 'Operator Santos', details: 'Driver advised to pull over.' },
      { timestamp: '2026-01-15T06:45:00Z', action: 'Resolved', actor: 'Operator Santos', details: 'Engine cooled. Vehicle resumed route.' },
    ],
  },
  {
    id: 'INC-2026-005', vehicleId: 'VH-007', vehicleType: 'jeepney',
    type: 'sos', priority: 'low', status: 'false-alarm',
    timestamp: '2026-01-15T05:10:00Z',
    location: 'Terminal Road, Brgy. Poblacion',
    coordinates: { lat: CENTER.lat - 0.008, lng: CENTER.lng - 0.010 },
    notes: 'SOS button accidentally pressed by passenger leaning on panel.',
    alertDeliveryMs: 950,
    timeline: [
      { timestamp: '2026-01-15T05:10:00Z', action: 'SOS activated', actor: 'Unknown (Manual)', details: 'Button pressed.' },
      { timestamp: '2026-01-15T05:10:01Z', action: 'Alert transmitted', actor: 'System', details: 'Delivery confirmed in 0.95s.' },
      { timestamp: '2026-01-15T05:12:00Z', action: 'Acknowledged', actor: 'Operator Reyes', details: 'Contacting driver.' },
      { timestamp: '2026-01-15T05:15:00Z', action: 'Marked false alarm', actor: 'Operator Reyes', details: 'Driver confirmed accidental activation.' },
    ],
  },
  {
    id: 'INC-2026-006', vehicleId: 'VH-009', vehicleType: 'bus',
    type: 'fire', priority: 'high', status: 'new',
    timestamp: '2026-01-15T08:35:00Z',
    location: 'Provincial Highway, Km 8',
    coordinates: { lat: CENTER.lat - 0.003, lng: CENTER.lng + 0.003 },
    notes: 'Smoke detected from engine compartment. All passengers evacuated.',
    alertDeliveryMs: 600,
    timeline: [
      { timestamp: '2026-01-15T08:35:00Z', action: 'Fire detected', actor: 'ESP32-009 (Automatic)', details: 'Temperature and smoke sensor triggered.' },
      { timestamp: '2026-01-15T08:35:01Z', action: 'Alert transmitted', actor: 'System', details: 'Priority alert sent. Delivery confirmed in 0.6s.' },
    ],
  },
];

export const mockDevices: DeviceHealth[] = mockVehicles.map((v, i) => ({
  vehicleId: v.id,
  deviceId: v.deviceId,
  status: v.status === 'offline' ? 'offline' : i === 3 ? 'degraded' : 'online',
  batteryLevel: v.status === 'offline' ? 5 : 60 + Math.floor(Math.random() * 40),
  signalStrength: v.status === 'offline' ? 0 : 60 + Math.floor(Math.random() * 40),
  gpsAccuracy: v.status === 'offline' ? 0 : 2 + Math.floor(Math.random() * 8),
  lastHeartbeat: v.lastCommunication,
  firmwareVersion: 'v2.4.1',
  uptime: v.status === 'offline' ? '0h' : `${24 + i * 12}h`,
}));

export const mockAlerts: Alert[] = mockIncidents.map((inc, i) => ({
  id: `ALT-${String(i + 1).padStart(3, '0')}`,
  incidentId: inc.id,
  vehicleId: inc.vehicleId,
  type: inc.type,
  priority: inc.priority,
  message: `${inc.type.toUpperCase()} — ${inc.vehicleId} at ${inc.location}`,
  timestamp: inc.timestamp,
  acknowledged: inc.status !== 'new',
  acknowledgedAt: inc.status !== 'new' ? inc.timeline.find(t => t.action.includes('cknowledged'))?.timestamp : undefined,
}));

export const mockStats: SystemStats = {
  activeEmergencies: 2,
  unacknowledgedAlerts: 1,
  vehiclesMonitored: 8,
  incidentsResolvedToday: 3,
  avgAlertDeliveryMs: 1192,
  devicesOffline: 2,
};

// Analytics data
export const incidentsByTypeData = [
  { name: 'Crash Detection', count: 12, fill: '#ef4444' },
  { name: 'Manual SOS', count: 8, fill: '#f59e0b' },
  { name: 'Medical', count: 5, fill: '#8b5cf6' },
  { name: 'Fire', count: 2, fill: '#f97316' },
  { name: 'Threat', count: 3, fill: '#ec4899' },
  { name: 'Other', count: 7, fill: '#64748b' },
];

export const incidentsByVehicleType = [
  { name: 'Jeepney', count: 15, fill: '#3b82f6' },
  { name: 'UV Express', count: 8, fill: '#10b981' },
  { name: 'Bus', count: 6, fill: '#8b5cf6' },
  { name: 'Tricycle', count: 4, fill: '#f59e0b' },
];

export const dailyIncidentsData = [
  { date: 'Jan 9', incidents: 3, resolved: 2 },
  { date: 'Jan 10', incidents: 5, resolved: 4 },
  { date: 'Jan 11', incidents: 2, resolved: 2 },
  { date: 'Jan 12', incidents: 7, resolved: 6 },
  { date: 'Jan 13', incidents: 4, resolved: 4 },
  { date: 'Jan 14', incidents: 6, resolved: 5 },
  { date: 'Jan 15', incidents: 6, resolved: 3 },
];

export const alertDeliveryTimeData = [
  { date: 'Jan 9', avgMs: 1450 },
  { date: 'Jan 10', avgMs: 1200 },
  { date: 'Jan 11', avgMs: 980 },
  { date: 'Jan 12', avgMs: 1350 },
  { date: 'Jan 13', avgMs: 1100 },
  { date: 'Jan 14', avgMs: 1050 },
  { date: 'Jan 15', avgMs: 1192 },
];
