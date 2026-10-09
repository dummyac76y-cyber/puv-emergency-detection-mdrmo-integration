import { Vehicle } from '../types';
import { Bus, Fuel, Users, Gauge, MoreVertical } from 'lucide-react';

interface VehicleListProps {
  vehicles: Vehicle[];
  selectedVehicle: string | null;
  onSelectVehicle: (id: string) => void;
}

export default function VehicleList({ vehicles, selectedVehicle, onSelectVehicle }: VehicleListProps) {
  const getStatusBadge = (status: Vehicle['status']) => {
    switch (status) {
      case 'active': return { label: 'ACTIVE', className: 'bg-green-900/40 text-green-400 border-green-700/50' };
      case 'emergency': return { label: 'EMERGENCY', className: 'bg-red-900/40 text-red-400 border-red-700/50' };
      case 'idle': return { label: 'IDLE', className: 'bg-amber-900/40 text-amber-400 border-amber-700/50' };
      case 'maintenance': return { label: 'MAINT', className: 'bg-gray-900/40 text-gray-400 border-gray-700/50' };
    }
  };

  const getFuelColor = (level: number) => {
    if (level > 60) return 'bg-green-500';
    if (level > 30) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-command-card border border-command-border rounded-xl flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-command-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bus className="w-4 h-4 text-blue-400" />
          <h2 className="text-sm font-bold text-white">VEHICLE FLEET</h2>
          <span className="text-xs text-command-muted">({vehicles.length})</span>
        </div>
      </div>

      {/* Vehicle List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {vehicles.map((vehicle) => {
          const statusBadge = getStatusBadge(vehicle.status);
          const isSelected = selectedVehicle === vehicle.id;

          return (
            <div
              key={vehicle.id}
              className={`rounded-lg p-2.5 cursor-pointer transition-all border ${
                isSelected
                  ? 'bg-blue-900/30 border-blue-600/50'
                  : vehicle.status === 'emergency'
                  ? 'bg-red-900/20 border-red-800/30 hover:bg-red-900/30'
                  : 'bg-command-surface/50 border-transparent hover:bg-command-surface'
              }`}
              onClick={() => onSelectVehicle(vehicle.id)}
            >
              {/* Vehicle Header */}
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-white">{vehicle.plateNumber}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${statusBadge.className}`}>
                    {statusBadge.label}
                  </span>
                </div>
                <button className="text-command-muted hover:text-white">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              {/* Driver & Route */}
              <p className="text-xs text-command-muted mb-1.5 truncate">
                {vehicle.driver} • {vehicle.route.split(' - ')[0]}
              </p>

              {/* Stats Row */}
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-command-muted">
                  <Gauge className="w-3 h-3" />
                  <span className={vehicle.speed > 50 ? 'text-amber-400' : 'text-command-text'}>
                    {vehicle.speed} km/h
                  </span>
                </span>
                <span className="flex items-center gap-1 text-command-muted">
                  <Users className="w-3 h-3" />
                  <span className="text-command-text">{vehicle.passengers}</span>
                </span>
                <span className="flex items-center gap-1 text-command-muted flex-1">
                  <Fuel className="w-3 h-3" />
                  <div className="flex-1 h-1.5 bg-command-bg rounded-full overflow-hidden max-w-[60px]">
                    <div
                      className={`h-full rounded-full ${getFuelColor(vehicle.fuelLevel)}`}
                      style={{ width: `${vehicle.fuelLevel}%` }}
                    />
                  </div>
                  <span className="text-command-text">{vehicle.fuelLevel}%</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
