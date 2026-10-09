import { Vehicle, Alert } from '../types';
import { MapPin, AlertTriangle, Navigation } from 'lucide-react';

interface MapViewProps {
  vehicles: Vehicle[];
  alerts: Alert[];
  selectedVehicle: string | null;
  onSelectVehicle: (id: string) => void;
}

export default function MapView({ vehicles, alerts, selectedVehicle, onSelectVehicle }: MapViewProps) {
  const getVehicleMarkerColor = (vehicle: Vehicle) => {
    switch (vehicle.status) {
      case 'emergency': return 'bg-red-500';
      case 'active': return 'bg-green-500';
      case 'idle': return 'bg-amber-500';
      case 'maintenance': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  const hasActiveAlert = (vehicleId: string) => {
    return alerts.some(a => a.vehicleId === vehicleId && a.status === 'active');
  };

  return (
    <div className="relative bg-command-card border border-command-border rounded-xl overflow-hidden h-full min-h-[400px]">
      {/* Map Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-command-card/95 to-transparent p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-white">Live Vehicle Tracking</span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Active</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> Emergency</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Idle</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-500"></span> Maintenance</span>
        </div>
      </div>

      {/* Map Area with Grid */}
      <div className="absolute inset-0 map-grid">
        {/* Simulated roads */}
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          {/* Main highways */}
          <line x1="10%" y1="50%" x2="90%" y2="50%" stroke="rgba(59, 130, 246, 0.15)" strokeWidth="3" strokeDasharray="8 4" />
          <line x1="50%" y1="10%" x2="50%" y2="90%" stroke="rgba(59, 130, 246, 0.15)" strokeWidth="3" strokeDasharray="8 4" />
          {/* Diagonal roads */}
          <line x1="15%" y1="15%" x2="85%" y2="85%" stroke="rgba(59, 130, 246, 0.08)" strokeWidth="2" strokeDasharray="6 3" />
          <line x1="85%" y1="15%" x2="15%" y2="85%" stroke="rgba(59, 130, 246, 0.08)" strokeWidth="2" strokeDasharray="6 3" />
          {/* Route lines */}
          <path d="M 15% 35% Q 30% 30% 55% 42%" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="2" fill="none" strokeDasharray="4 2" />
          <path d="M 40% 65% Q 60% 55% 82% 55%" stroke="rgba(16, 185, 129, 0.3)" strokeWidth="2" fill="none" strokeDasharray="4 2" />
          <path d="M 25% 35% Q 50% 25% 72% 28%" stroke="rgba(139, 92, 246, 0.3)" strokeWidth="2" fill="none" strokeDasharray="4 2" />
        </svg>

        {/* Location labels */}
        <div className="absolute top-[15%] left-[20%] text-xs text-blue-400/50 font-medium">Brgy. San Jose</div>
        <div className="absolute top-[20%] right-[15%] text-xs text-blue-400/50 font-medium">Town Center</div>
        <div className="absolute bottom-[20%] left-[12%] text-xs text-blue-400/50 font-medium">Market Area</div>
        <div className="absolute bottom-[15%] right-[20%] text-xs text-blue-400/50 font-medium">Poblacion</div>
        <div className="absolute top-[45%] left-[45%] text-xs text-blue-400/50 font-medium">National Hwy</div>
        <div className="absolute top-[60%] right-[10%] text-xs text-blue-400/50 font-medium">Coastal Rd</div>

        {/* Vehicle Markers */}
        {vehicles.map((vehicle) => (
          <div
            key={vehicle.id}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 ${
              selectedVehicle === vehicle.id ? 'scale-125 z-20' : 'z-10 hover:scale-110'
            }`}
            style={{ left: `${vehicle.position.x}%`, top: `${vehicle.position.y}%` }}
            onClick={() => onSelectVehicle(vehicle.id)}
          >
            {/* Pulse ring for emergency vehicles */}
            {vehicle.status === 'emergency' && (
              <div className="absolute inset-0 w-8 h-8 -m-1 rounded-full bg-red-500/30 marker-ring" />
            )}
            
            {/* Alert indicator */}
            {hasActiveAlert(vehicle.id) && (
              <div className="absolute -top-4 -right-3">
                <AlertTriangle className="w-3 h-3 text-red-400 blink" />
              </div>
            )}

            {/* Vehicle marker */}
            <div className={`w-6 h-6 rounded-full ${getVehicleMarkerColor(vehicle)} border-2 border-white/30 flex items-center justify-center shadow-lg`}>
              <MapPin className="w-3 h-3 text-white" />
            </div>

            {/* Vehicle label */}
            <div className={`absolute top-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-mono px-1.5 py-0.5 rounded ${
              selectedVehicle === vehicle.id 
                ? 'bg-blue-600 text-white' 
                : 'bg-command-surface/90 text-command-muted border border-command-border'
            }`}>
              {vehicle.plateNumber}
            </div>
          </div>
        ))}
      </div>

      {/* Map Footer */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-command-card/95 to-transparent p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-command-muted">
            Municipal Coverage Area • Last refresh: 2s ago
          </span>
          <span className="text-xs text-green-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 blink"></span>
            GPS Tracking Active
          </span>
        </div>
      </div>
    </div>
  );
}
