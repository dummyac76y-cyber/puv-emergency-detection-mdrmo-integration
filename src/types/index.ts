export interface Vehicle {
  id: string;
  plateNumber: string;
  route: string;
  driver: string;
  status: 'active' | 'idle' | 'maintenance' | 'emergency';
  speed: number;
  lastUpdate: string;
  passengers: number;
  fuelLevel: number;
  position: { x: number; y: number };
  routeColor: string;
}

export interface Alert {
  id: string;
  type: 'crash' | 'sos' | 'overspeed' | 'geofence' | 'engine';
  severity: 'critical' | 'high' | 'medium' | 'low';
  vehicleId: string;
  message: string;
  timestamp: string;
  status: 'active' | 'acknowledged' | 'resolved';
  location: string;
  responseTeam?: string;
}

export interface Incident {
  id: string;
  alertId: string;
  type: string;
  status: 'open' | 'dispatched' | 'on-scene' | 'resolved';
  assignedUnit?: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface SystemStats {
  totalVehicles: number;
  activeVehicles: number;
  activeAlerts: number;
  criticalAlerts: number;
  avgResponseTime: string;
  incidentsToday: number;
}
