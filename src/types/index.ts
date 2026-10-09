export type VehicleStatus = 'normal' | 'emergency' | 'sos' | 'offline';
export type VehicleType = 'jeepney' | 'tricycle' | 'uv-express' | 'bus';
export type IncidentType = 'crash' | 'sos' | 'medical' | 'threat' | 'other';
export type IncidentStatus = 'new' | 'acknowledged' | 'responding' | 'resolved' | 'false-alarm';
export type IncidentPriority = 'critical' | 'high' | 'medium' | 'low';
export type DeviceStatus = 'online' | 'offline' | 'degraded' | 'maintenance';

export interface Vehicle {
  id: string;
  plateNumber: string;
  type: VehicleType;
  deviceId: string;
  driver: string;
  operator: string;
  status: VehicleStatus;
  registrationStatus: 'active' | 'expired' | 'suspended';
  lastCommunication: string;
  emergencyContact: string;
  position: { lat: number; lng: number };
  speed: number;
  passengers: number;
  fuelLevel: number;
  route: string;
}

export interface Incident {
  id: string;
  vehicleId: string;
  vehicleType: VehicleType;
  type: IncidentType;
  priority: IncidentPriority;
  status: IncidentStatus;
  timestamp: string;
  location: string;
  coordinates: { lat: number; lng: number };
  assignedResponder?: string;
  notes: string;
  timeline: TimelineEntry[];
  alertDeliveryMs: number;
}

export interface TimelineEntry {
  timestamp: string;
  action: string;
  actor: string;
  details?: string;
}

export interface DeviceHealth {
  vehicleId: string;
  deviceId: string;
  status: DeviceStatus;
  batteryLevel: number;
  signalStrength: number;
  gpsAccuracy: number;
  lastHeartbeat: string;
  firmwareVersion: string;
  uptime: string;
}

export interface Alert {
  id: string;
  incidentId: string;
  vehicleId: string;
  type: IncidentType;
  priority: IncidentPriority;
  message: string;
  timestamp: string;
  acknowledged: boolean;
  acknowledgedAt?: string;
}

export interface SystemStats {
  activeEmergencies: number;
  unacknowledgedAlerts: number;
  vehiclesMonitored: number;
  incidentsResolvedToday: number;
  avgAlertDeliveryMs: number;
  devicesOffline: number;
}

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  badge?: number;
}
