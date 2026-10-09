import L from 'leaflet';
import { Filter, Layers, MapPin } from 'lucide-react';
import { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

import { VehicleStatusDot, IncidentTypeIcon, PriorityBadge } from '@/components/shared';
import { useVehicles, useIncidents } from '@/store';
import { VehicleStatus, VehicleType } from '@/types';

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as { _getIconUrl?: string })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function createVehicleIcon(status: VehicleStatus) {
  const colors: Record<VehicleStatus, string> = {
    normal: '#10b981',
    emergency: '#ef4444',
    sos: '#ef4444',
    offline: '#64748b',
  };
  const color = colors[status];
  const pulse = status === 'emergency' || status === 'sos';

  return L.divIcon({
    className: 'custom-vehicle-marker',
    html: `
      <div style="position:relative;width:28px;height:28px;">
        ${pulse ? '<div style="position:absolute;inset:-4px;border-radius:50%;border:2px solid #ef4444;animation:markerPulse 2s infinite;"></div>' : ''}
        <div style="width:28px;height:28px;border-radius:50%;background:${color};border:2.5px solid rgba(255,255,255,0.4);box-shadow:0 2px 8px rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="8" width="18" height="10" rx="2"/><path d="M7 8V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

function createIncidentIcon() {
  return L.divIcon({
    className: 'custom-incident-marker',
    html: `
      <div style="position:relative;width:32px;height:32px;">
        <div style="position:absolute;inset:-6px;border-radius:50%;background:rgba(239,68,68,0.15);animation:markerPulse 2s infinite;"></div>
        <div style="width:32px;height:32px;border-radius:50%;background:#ef4444;border:3px solid white;box-shadow:0 3px 12px rgba(239,68,68,0.5);display:flex;align-items:center;justify-content:center;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

export default function LiveMapPage({ compact = false }: { compact?: boolean }) {
  const { vehicles, loading: vehiclesLoading } = useVehicles();
  const { incidents, setSelectedIncident, loading: incidentsLoading } = useIncidents();
  const [statusFilter, setStatusFilter] = useState<VehicleStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<VehicleType | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  const CENTER: [number, number] = [14.5995, 120.9842];

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      if (statusFilter !== 'all' && v.status !== statusFilter) return false;
      if (typeFilter !== 'all' && v.type !== typeFilter) return false;
      return true;
    });
  }, [vehicles, statusFilter, typeFilter]);

  const activeIncidents = useMemo(() => {
    return incidents.filter((i) => i.status !== 'resolved' && i.status !== 'false-alarm');
  }, [incidents]);

  return (
    <div className="relative w-full h-full">
      {/* Map Controls */}
      {!compact && (
        <div className="absolute top-3 left-3 z-[1000] flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-raised border border-border-default rounded-lg text-xs text-text-secondary hover:text-text-primary transition-colors shadow-lg"
          >
            <Filter className="w-3.5 h-3.5" />
            Filters
          </button>
        </div>
      )}

      {/* Filter Panel */}
      {showFilters && (
        <div className="absolute top-12 left-3 z-[1000] bg-surface-raised border border-border-default rounded-xl p-3 shadow-xl w-56 animate-fade-in">
          <h3 className="text-xs font-semibold text-text-primary mb-2 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-accent" />
            Map Filters
          </h3>
          <div className="space-y-2">
            <div>
              <label
                htmlFor="status-filter"
                id="status-filter-label"
                className="text-[11px] text-text-muted mb-1 block"
              >
                Vehicle Status
              </label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as VehicleStatus | 'all')}
                className="w-full bg-navy-800 border border-border-subtle rounded-lg px-2 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent"
              >
                <option value="all">All Statuses</option>
                <option value="normal">Normal</option>
                <option value="emergency">Emergency</option>
                <option value="sos">SOS Active</option>
                <option value="offline">Offline</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="type-filter"
                id="type-filter-label"
                className="text-[11px] text-text-muted mb-1 block"
              >
                Vehicle Type
              </label>
              <select
                id="type-filter"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as VehicleType | 'all')}
                className="w-full bg-navy-800 border border-border-subtle rounded-lg px-2 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent"
              >
                <option value="all">All Types</option>
                <option value="jeepney">Jeepney</option>
                <option value="tricycle">Tricycle</option>
                <option value="uv-express">UV Express</option>
                <option value="bus">Bus</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div
        className={`absolute bottom-3 left-3 z-[1000] bg-surface-raised/95 border border-border-default rounded-lg p-2 shadow-lg ${compact ? 'hidden lg:flex' : 'flex'} items-center gap-3`}
      >
        <span className="flex items-center gap-1 text-[10px] text-text-muted">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500" aria-hidden="true" /> Normal
        </span>
        <span className="flex items-center gap-1 text-[10px] text-text-muted">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500" aria-hidden="true" /> Emergency
        </span>
        <span className="flex items-center gap-1 text-[10px] text-text-muted">
          <span className="w-2.5 h-2.5 rounded-full bg-gray-500" aria-hidden="true" /> Offline
        </span>
        <span className="flex items-center gap-1 text-[10px] text-text-muted">
          <MapPin className="w-2.5 h-2.5 text-red-400" aria-hidden="true" /> Incident
        </span>
      </div>

      {/* Vehicle count */}
      <div className="absolute top-3 right-3 z-[1000] bg-surface-raised/95 border border-border-default rounded-lg px-2.5 py-1.5 shadow-lg">
        <span className="text-[11px] text-text-muted">
          {filteredVehicles.length} vehicles shown
        </span>
      </div>

      {(vehiclesLoading || incidentsLoading) && (
        <div className="absolute inset-0 bg-navy-900/50 flex items-center justify-center z-[100]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
        </div>
      )}

      {/* Leaflet Map */}
      <MapContainer
        center={CENTER}
        zoom={14}
        className="w-full h-full"
        zoomControl={!compact}
        attributionControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* Vehicle markers */}
        {filteredVehicles.map((vehicle) => (
          <Marker
            key={vehicle.id}
            position={[vehicle.position.lat, vehicle.position.lng]}
            icon={createVehicleIcon(vehicle.status)}
          >
            <Popup>
              <div className="min-w-[200px] p-1">
                <div className="flex items-center gap-2 mb-2">
                  <VehicleStatusDot status={vehicle.status} />
                  <span className="font-mono font-bold text-sm">{vehicle.plateNumber}</span>
                </div>
                <div className="space-y-1 text-xs">
                  <p>
                    <span className="text-gray-400">Type:</span> {vehicle.type}
                  </p>
                  <p>
                    <span className="text-gray-400">Driver:</span> {vehicle.driver}
                  </p>
                  <p>
                    <span className="text-gray-400">Speed:</span> {vehicle.speed} km/h
                  </p>
                  <p>
                    <span className="text-gray-400">Passengers:</span> {vehicle.passengers}
                  </p>
                  <p>
                    <span className="text-gray-400">GPS:</span> {vehicle.position.lat.toFixed(5)},{' '}
                    {vehicle.position.lng.toFixed(5)}
                  </p>
                  <p>
                    <span className="text-gray-400">Last Update:</span>{' '}
                    {new Date(vehicle.lastCommunication).toLocaleTimeString('en-US', {
                      hour12: false,
                    })}
                  </p>
                  <p>
                    <span className="text-gray-400">Device:</span> {vehicle.deviceId}
                  </p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Incident markers */}
        {activeIncidents.map((inc) => (
          <Marker
            key={inc.id}
            position={[inc.coordinates.lat, inc.coordinates.lng]}
            icon={createIncidentIcon()}
            eventHandlers={{ click: () => setSelectedIncident(inc) }}
          >
            <Popup>
              <div className="min-w-[220px] p-1">
                <div className="flex items-center gap-2 mb-2">
                  <IncidentTypeIcon type={inc.type} className="w-4 h-4 text-red-400" />
                  <span className="font-mono font-bold text-sm">{inc.id}</span>
                  <PriorityBadge priority={inc.priority} />
                </div>
                <p className="text-xs text-gray-300 mb-2">{inc.notes}</p>
                <div className="space-y-1 text-xs">
                  <p>
                    <span className="text-gray-400">Location:</span> {inc.location}
                  </p>
                  <p>
                    <span className="text-gray-400">Time:</span>{' '}
                    {new Date(inc.timestamp).toLocaleTimeString('en-US', { hour12: false })}
                  </p>
                  <p>
                    <span className="text-gray-400">Vehicle:</span> {inc.vehicleId}
                  </p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
