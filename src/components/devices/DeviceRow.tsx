import { Cpu, Battery, Wifi, MapPin } from 'lucide-react';
import { memo, useMemo } from 'react';

import { DeviceStatusBadge } from '@/components/shared';
import { DeviceHealth, Vehicle } from '@/types';

interface DeviceRowProps {
  device: DeviceHealth;
  vehicle?: Vehicle | null;
}

const DeviceRow = memo(function DeviceRow({ device, vehicle }: DeviceRowProps) {
  const batteryColor = useMemo(() => {
    if (device.batteryLevel > 50) return 'text-green-400';
    if (device.batteryLevel > 20) return 'text-amber-400';
    return 'text-red-400';
  }, [device.batteryLevel]);

  const batteryBgColor = useMemo(() => {
    if (device.batteryLevel > 50) return 'bg-green-500';
    if (device.batteryLevel > 20) return 'bg-amber-500';
    return 'bg-red-500';
  }, [device.batteryLevel]);

  const signalColor = useMemo(() => {
    if (device.signalStrength > 70) return 'text-green-400';
    if (device.signalStrength > 40) return 'text-amber-400';
    return 'text-red-400';
  }, [device.signalStrength]);

  return (
    <tr className="border-b border-border-subtle/50 table-row-hover">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Cpu className="w-3.5 h-3.5 text-text-muted" />
          <span className="font-mono text-xs text-text-primary">{device.deviceId}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <div>
          <span className="font-mono text-xs text-text-primary">{device.vehicleId}</span>
          {vehicle && <p className="text-[11px] text-text-muted">{vehicle.plateNumber}</p>}
        </div>
      </td>
      <td className="px-4 py-3">
        <DeviceStatusBadge status={device.status} />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Battery className={`w-3.5 h-3.5 ${batteryColor}`} />
          <div className="w-16 h-1.5 bg-navy-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${batteryBgColor}`}
              style={{ width: `${device.batteryLevel}%` }}
            />
          </div>
          <span className="text-xs text-text-secondary">{device.batteryLevel}%</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Wifi className={`w-3.5 h-3.5 ${signalColor}`} />
          <span className="text-xs text-text-secondary">{device.signalStrength}%</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-text-muted" />
          <span className="text-xs text-text-secondary">±{device.gpsAccuracy}m</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="text-xs text-text-muted font-mono">
          {new Date(device.lastHeartbeat).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          })}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className="text-xs text-text-muted font-mono">{device.firmwareVersion}</span>
      </td>
    </tr>
  );
});

DeviceRow.displayName = 'DeviceRow';

export { DeviceRow };
