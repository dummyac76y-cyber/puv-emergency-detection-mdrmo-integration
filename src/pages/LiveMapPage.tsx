import L from 'leaflet';
import { Filter, Layers, MapPin, AlertTriangle, Plus, Trash2, Save, X } from 'lucide-react';
import { useState, useMemo, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

import { VehicleStatusDot, IncidentTypeIcon, PriorityBadge } from '@/components/shared';
import { useVehicles, useIncidents } from '@/store';
import { useApp } from '@/store/AppContext';
import { VehicleStatus, VehicleType, IncidentType, IncidentPriority } from '@/types';

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

function createSimulationMarker() {
  return L.divIcon({
    className: 'simulation-marker',
    html: `
      <div style="position:relative;width:32px;height:32px;">
        <div style="width:32px;height:32px;border-radius:50%;background:#f59e0b;border:3px solid white;box-shadow:0 3px 12px rgba(245,158,11,0.5);display:flex;align-items:center;justify-content:center;animation:markerPulse 1.5s infinite;">
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

const INCIDENT_TYPES: IncidentType[] = ['crash', 'sos', 'medical', 'threat', 'other'];
const INCIDENT_PRIORITIES: IncidentPriority[] = ['critical', 'high', 'medium', 'low'];

interface SimulationIncident {
  id: string;
  lat: number;
  lng: number;
  type: IncidentType;
  priority: IncidentPriority;
  vehicleId: string;
}

export default function LiveMapPage({ compact = false }: { compact?: boolean }) {
  const { vehicles, loading: vehiclesLoading } = useVehicles();
  const { incidents, setSelectedIncident, loading: incidentsLoading, addIncident } = useIncidents();
  const { simulationMode } = useApp();
  const [statusFilter, setStatusFilter] = useState<VehicleStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<VehicleType | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showSimPanel, setShowSimPanel] = useState(false);
  const [simMode, setSimMode] = useState<'idle' | 'placing'>('idle');
  const [simIncidents, setSimIncidents] = useState<SimulationIncident[]>([]);
  const [selectedSimIncident, setSelectedSimIncident] = useState<SimulationIncident | null>(null);
  const [simForm, setSimForm] = useState<{
    type: IncidentType;
    priority: IncidentPriority;
    vehicleId: string;
    notes: string;
  }>({
    type: 'crash',
    priority: 'critical',
    vehicleId: '',
    notes: '',
  });
  const [mapProvider, setMapProvider] = useState<'openstreetmap' | 'carto' | 'mapbox'>(
    'openstreetmap'
  );
  const [cartoApiKey, setCartoApiKey] = useState('');
  const [cartoUsername, setCartoUsername] = useState('');
  const mapRef = useRef<L.Map | null>(null);

  // Load map settings from localStorage on mount
  useEffect(() => {
    const savedProvider = localStorage.getItem('mapProvider') as
      'openstreetmap' | 'carto' | 'mapbox' | null;
    const savedCartoKey = localStorage.getItem('cartoApiKey');
    const savedCartoUser = localStorage.getItem('cartoUsername');
    if (savedProvider) setMapProvider(savedProvider);
    if (savedCartoKey) setCartoApiKey(savedCartoKey);
    if (savedCartoUser) setCartoUsername(savedCartoUser);
  }, []);

  const handleMapProviderChange = (provider: 'openstreetmap' | 'carto' | 'mapbox') => {
    setMapProvider(provider);
    localStorage.setItem('mapProvider', provider);
  };

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

  const handleMapClick = (e: L.LeafletMouseEvent) => {
    if (simMode === 'placing' && simulationMode) {
      const { lat, lng } = e.latlng;
      const newSimIncident: SimulationIncident = {
        id: `SIM-${Date.now()}`,
        lat,
        lng,
        type: simForm.type,
        priority: simForm.priority,
        vehicleId: simForm.vehicleId || vehicles[0]?.id || 'VH-001',
      };
      setSimIncidents((prev) => [...prev, newSimIncident]);
      setSimMode('idle');
      setShowSimPanel(true);
      setSelectedSimIncident(newSimIncident);
    }
  };

  const confirmSimulation = async () => {
    if (!selectedSimIncident) return;

    const vehiclesWithCoords = vehicles.filter((v) => v.position);
    const nearestVehicle = vehiclesWithCoords.reduce(
      (nearest, vehicle) => {
        const dist = Math.hypot(
          vehicle.position.lat - selectedSimIncident!.lat,
          vehicle.position.lng - selectedSimIncident!.lng
        );
        return dist < nearest.dist ? { vehicle, dist } : nearest;
      },
      { vehicle: vehicles[0], dist: Infinity }
    );

    try {
      await addIncident({
        vehicleId: nearestVehicle.vehicle.id,
        vehicleType: nearestVehicle.vehicle.type,
        type: simForm.type,
        priority: simForm.priority,
        status: 'new',
        timestamp: new Date().toISOString(),
        location: `Simulated at ${selectedSimIncident.lat.toFixed(5)}, ${selectedSimIncident.lng.toFixed(5)}`,
        coordinates: { lat: selectedSimIncident.lat, lng: selectedSimIncident.lng },
        assignedResponder: 'Simulation',
        notes: simForm.notes || `Simulated ${simForm.type} incident`,
        alertDeliveryMs: Math.floor(Math.random() * 500 + 500),
        timeline: [
          {
            timestamp: new Date().toISOString(),
            action: 'Simulation created',
            actor: 'Operator (Simulation)',
            details: `Simulated ${simForm.type} incident placed on map`,
          },
        ],
      });

      setSimIncidents((prev) => prev.filter((i) => i.id !== selectedSimIncident.id));
      setSelectedSimIncident(null);
      setShowSimPanel(false);
      setSimForm({ type: 'crash', priority: 'critical', vehicleId: '', notes: '' });
    } catch (error) {
      console.error('Failed to create simulation incident:', error);
    }
  };

  const cancelSimulation = () => {
    if (selectedSimIncident) {
      setSimIncidents((prev) => prev.filter((i) => i.id !== selectedSimIncident!.id));
    }
    setSelectedSimIncident(null);
    setShowSimPanel(false);
    setSimMode('idle');
  };

  const removeSimIncident = (id: string) => {
    setSimIncidents((prev) => prev.filter((i) => i.id !== id));
    if (selectedSimIncident?.id === id) {
      setSelectedSimIncident(null);
      setShowSimPanel(false);
    }
  };

  const clearAllSimulations = () => {
    setSimIncidents([]);
    setSelectedSimIncident(null);
    setShowSimPanel(false);
    setSimMode('idle');
  };

  return (
    <div className="relative w-full h-full">
      {/* Map Controls */}
      {!compact && (
        <div className="absolute top-3 left-3 z-[1000] flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-raised border border-border-default rounded-lg text-xs text-text-secondary hover:text-text-primary transition-colors shadow-lg"
          >
            <Filter className="w-3.5 h-3.5" />
            Filters
          </button>
          {/* Map Layer Selector */}
          <div className="relative">
            <select
              value={mapProvider}
              onChange={(e) =>
                handleMapProviderChange(e.target.value as 'openstreetmap' | 'carto' | 'mapbox')
              }
              className="bg-surface-raised border border-border-default rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent appearance-none pr-8"
            >
              <option value="openstreetmap">OpenStreetMap</option>
              <option value="carto">CartoDB</option>
              <option value="mapbox">Mapbox</option>
            </select>
            <Layers className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
          </div>
          {simulationMode && (
            <>
              <button
                onClick={() => setShowSimPanel(!showSimPanel)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-raised border border-border-default rounded-lg text-xs text-text-secondary hover:text-text-primary transition-colors shadow-lg"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                Simulation
              </button>
              <button
                onClick={() => {
                  setSimMode('placing');
                  setShowSimPanel(true);
                }}
                disabled={simMode === 'placing'}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 border border-amber-500/30 text-amber-400 hover:bg-amber-500/30 text-xs rounded-lg transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-3.5 h-3.5" />
                Place Incident
              </button>
            </>
          )}
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

      {/* Simulation Panel */}
      {simulationMode && showSimPanel && (
        <div className="absolute top-12 right-3 z-[1000] bg-surface-raised border border-border-default rounded-xl p-3 shadow-xl w-72 animate-fade-in max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              {simMode === 'placing' ? 'Click Map to Place Incident' : 'Simulation Incidents'}
            </h3>
            <button
              onClick={() => {
                setShowSimPanel(false);
                setSimMode('idle');
              }}
              className="p-1.5 text-text-muted hover:text-text-primary rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {simMode === 'placing' && (
            <div className="space-y-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <p className="text-xs text-amber-300 text-center">
                <AlertTriangle className="w-3 h-3 inline mr-1" /> Click anywhere on the map to place
                incident
              </p>
              <div className="space-y-2 text-xs">
                <div>
                  <label htmlFor="sim-incident-type" className="block text-text-muted mb-1">
                    Incident Type
                  </label>
                  <select
                    id="sim-incident-type"
                    value={simForm.type}
                    onChange={(e) =>
                      setSimForm({ ...simForm, type: e.target.value as IncidentType })
                    }
                    className="w-full bg-navy-800 border border-border-subtle rounded-lg px-2 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent"
                  >
                    {INCIDENT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t.charAt(0).toUpperCase() + t.slice(1).replace('-', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="sim-priority" className="block text-text-muted mb-1">
                    Priority
                  </label>
                  <select
                    id="sim-priority"
                    value={simForm.priority}
                    onChange={(e) =>
                      setSimForm({ ...simForm, priority: e.target.value as IncidentPriority })
                    }
                    className="w-full bg-navy-800 border border-border-subtle rounded-lg px-2 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent"
                  >
                    {INCIDENT_PRIORITIES.map((p) => (
                      <option key={p} value={p}>
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="sim-vehicle" className="block text-text-muted mb-1">
                    Vehicle (optional)
                  </label>
                  <select
                    id="sim-vehicle"
                    value={simForm.vehicleId}
                    onChange={(e) => setSimForm({ ...simForm, vehicleId: e.target.value })}
                    className="w-full bg-navy-800 border border-border-subtle rounded-lg px-2 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent"
                  >
                    <option value="">Auto-assign nearest</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.plateNumber} ({v.driver})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="sim-notes" className="block text-text-muted mb-1">
                    Notes
                  </label>
                  <textarea
                    id="sim-notes"
                    value={simForm.notes}
                    onChange={(e) => setSimForm({ ...simForm, notes: e.target.value })}
                    rows={2}
                    className="w-full bg-navy-800 border border-border-subtle rounded-lg px-2 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent"
                    placeholder="Additional details..."
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={cancelSimulation}
                  className="flex-1 px-3 py-2 bg-navy-800 border border-border-subtle text-text-secondary hover:bg-navy-700 rounded-lg text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {simMode === 'idle' && simIncidents.length > 0 && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {simIncidents.map((sim) => (
                <button
                  key={sim.id}
                  onClick={() => setSelectedSimIncident(sim)}
                  className={`flex items-center gap-2 p-2 rounded-lg border transition-colors w-full text-left ${
                    selectedSimIncident?.id === sim.id
                      ? 'bg-accent/10 border-accent'
                      : 'bg-navy-800 border-border-subtle hover:border-border-default'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-text-primary truncate">
                      {sim.type.charAt(0).toUpperCase() + sim.type.slice(1)} • {sim.priority}
                    </p>
                    <p className="text-[10px] text-text-muted truncate">
                      {sim.lat.toFixed(5)}, {sim.lng.toFixed(5)}
                    </p>
                  </div>
                  {selectedSimIncident?.id === sim.id && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          confirmSimulation();
                        }}
                        className="p-1.5 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded text-[10px]"
                        title="Confirm"
                      >
                        <Save className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeSimIncident(sim.id);
                        }}
                        className="p-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded text-[10px]"
                        title="Remove"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {simMode === 'idle' && simIncidents.length === 0 && (
            <div className="text-center py-8 text-text-muted">
              <AlertTriangle className="w-10 h-10 text-text-muted/30 mx-auto mb-2" />
              <p className="text-xs">No simulation incidents</p>
              <p className="text-[10px] mt-1">Click &ldquo;Place Incident&rdquo; to add one</p>
            </div>
          )}

          {simIncidents.length > 0 && simMode === 'idle' && (
            <div className="flex gap-2 pt-2 border-t border-border-subtle">
              <button
                onClick={clearAllSimulations}
                className="flex-1 px-3 py-2 bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                Clear All
              </button>
            </div>
          )}
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
        {simulationMode && (
          <span className="flex items-center gap-1 text-[10px] text-text-muted">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" aria-hidden="true" /> Simulation
          </span>
        )}
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
        whenCreated={(map) => {
          mapRef.current = map;
        }}
        onClick={handleMapClick}
      >
        {(() => {
          switch (mapProvider) {
            case 'carto':
              return (
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                  url={
                    cartoApiKey && cartoUsername
                      ? `https://{s}.carto.com/api/v1/map/${cartoUsername}/light_all/{z}/{x}/{y}.png?api_key=${cartoApiKey}`
                      : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
                  }
                />
              );
            case 'mapbox':
              return (
                <TileLayer
                  attribution='&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token={accessToken}"
                  accessToken={import.meta.env.VITE_MAPBOX_TOKEN || ''}
                />
              );
            default:
              return (
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
              );
          }
        })()}

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

        {/* Simulation markers */}
        {simIncidents.map((sim) => (
          <Marker
            key={sim.id}
            position={[sim.lat, sim.lng]}
            icon={createSimulationMarker()}
            eventHandlers={{
              click: () => {
                setSelectedSimIncident(sim);
                setShowSimPanel(true);
              },
            }}
          >
            <Popup>
              <div className="min-w-[200px] p-1">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span className="font-mono font-bold text-sm">{sim.id}</span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded">
                    SIMULATION
                  </span>
                </div>
                <p className="text-xs text-gray-300 mb-2">{sim.notes || 'Simulation incident'}</p>
                <div className="space-y-1 text-xs">
                  <p>
                    <span className="text-gray-400">Type:</span> {sim.type}
                  </p>
                  <p>
                    <span className="text-gray-400">Priority:</span> {sim.priority}
                  </p>
                  <p>
                    <span className="text-gray-400">GPS:</span> {sim.lat.toFixed(5)},{' '}
                    {sim.lng.toFixed(5)}
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
