import { Bus, User, Cpu, Fuel, Users } from 'lucide-react';
import { memo, useMemo } from 'react';

import { VehicleStatusDot } from '@/components/shared';
import { Vehicle } from '@/types';

interface VehicleCardProps {
  vehicle: Vehicle;
  onClick: (vehicle: Vehicle) => void;
}

const VehicleCard = memo(function VehicleCard({ vehicle, onClick }: VehicleCardProps) {
  const registrationStatusClass = useMemo(() => {
    switch (vehicle.registrationStatus) {
      case 'active':
        return 'bg-green-900/30 text-green-400 border-green-700/40';
      case 'expired':
        return 'bg-amber-900/30 text-amber-400 border-amber-700/40';
      default:
        return 'bg-red-900/30 text-red-400 border-red-700/40';
    }
  }, [vehicle.registrationStatus]);

  return (
    <button
      onClick={() => onClick(vehicle)}
      className="text-left bg-surface-raised border border-border-default rounded-xl p-4 hover:border-accent/50 transition-all"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <VehicleStatusDot status={vehicle.status} />
          <span className="font-mono text-sm font-bold text-text-primary">
            {vehicle.plateNumber}
          </span>
        </div>
        <span
          className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${registrationStatusClass}`}
        >
          {vehicle.registrationStatus}
        </span>
      </div>
      <div className="space-y-1.5 text-xs">
        <div className="flex items-center gap-2 text-text-secondary">
          <Bus className="w-3.5 h-3.5 text-text-muted" />
          <span className="capitalize">{vehicle.type}</span>
          <span className="text-text-muted">•</span>
          <span className="text-text-muted">{vehicle.route.split('—')[0]}</span>
        </div>
        <div className="flex items-center gap-2 text-text-secondary">
          <User className="w-3.5 h-3.5 text-text-muted" />
          <span>{vehicle.driver}</span>
        </div>
        <div className="flex items-center gap-2 text-text-secondary">
          <Cpu className="w-3.5 h-3.5 text-text-muted" />
          <span className="font-mono text-[11px]">{vehicle.deviceId}</span>
        </div>
      </div>
      <div className="flex items-center gap-4 mt-3 pt-2 border-t border-border-subtle">
        <span className="text-[11px] text-text-muted flex items-center gap-1">
          <Users className="w-3 h-3" /> {vehicle.passengers} pax
        </span>
        <span className="text-[11px] text-text-muted flex items-center gap-1">
          <Fuel className="w-3 h-3" /> {vehicle.fuelLevel}%
        </span>
        <span className="text-[11px] text-text-muted">{vehicle.speed} km/h</span>
      </div>
    </button>
  );
});

VehicleCard.displayName = 'VehicleCard';

export { VehicleCard };
