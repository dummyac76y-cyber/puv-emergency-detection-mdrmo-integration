import { Server } from 'lucide-react';
import { useMemo } from 'react';

import { DeviceRow } from '@/components/devices';
import { SimulationBanner } from '@/components/shared';
import { useDevices, useVehicles } from '@/store';

export default function DevicesPage() {
  const { devices, fetchDevices, loading, error } = useDevices();
  const { vehicles } = useVehicles();

  const onlineCount = useMemo(() => devices.filter((d) => d.status === 'online').length, [devices]);
  const offlineCount = useMemo(
    () => devices.filter((d) => d.status === 'offline').length,
    [devices]
  );
  const degradedCount = useMemo(
    () => devices.filter((d) => d.status === 'degraded').length,
    [devices]
  );

  return (
    <div className="flex flex-col h-full">
      <SimulationBanner />
      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        <div className="mb-4">
          <h1 className="text-lg font-bold text-text-primary">Device Health</h1>
          <p className="text-xs text-text-muted mt-0.5">
            ESP32 onboard device status, battery, signal, and GPS accuracy
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-800/30 text-red-400 text-xs rounded-lg">
            Error loading devices: {error}
            <button onClick={fetchDevices} className="ml-2 underline hover:text-red-300">
              Retry
            </button>
          </div>
        )}

        {loading && (
          <div className="mb-4 p-3 bg-amber-900/30 border border-amber-800/30 text-amber-400 text-xs rounded-lg">
            Loading devices...
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <div className="bg-green-900/20 border border-green-800/30 rounded-xl p-3">
            <p className="text-xl font-bold text-green-400">{onlineCount}</p>
            <p className="text-[11px] text-text-muted">Online</p>
          </div>
          <div className="bg-gray-800/20 border border-gray-700/30 rounded-xl p-3">
            <p className="text-xl font-bold text-gray-400">{offlineCount}</p>
            <p className="text-[11px] text-text-muted">Offline</p>
          </div>
          <div className="bg-amber-900/20 border border-amber-800/30 rounded-xl p-3">
            <p className="text-xl font-bold text-amber-400">{degradedCount}</p>
            <p className="text-[11px] text-text-muted">Degraded</p>
          </div>
          <div className="bg-blue-900/20 border border-blue-800/30 rounded-xl p-3">
            <p className="text-xl font-bold text-blue-400">{devices.length}</p>
            <p className="text-[11px] text-text-muted">Total Devices</p>
          </div>
        </div>

        {/* Device Table */}
        <div className="bg-surface-raised border border-border-default rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-subtle">
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                    Device
                  </th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                    Battery
                  </th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                    Signal
                  </th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                    GPS Accuracy
                  </th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                    Last Heartbeat
                  </th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                    Firmware
                  </th>
                </tr>
              </thead>
              <tbody>
                {devices.map((device) => {
                  const vehicle = vehicles.find((v) => v.id === device.vehicleId);
                  return (
                    <DeviceRow key={device.deviceId} device={device} vehicle={vehicle ?? null} />
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Integration note */}
        <div className="mt-4 bg-blue-900/10 border border-blue-800/30 rounded-lg p-3 flex items-start gap-2">
          <Server className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-blue-300/80 font-medium">Hardware Integration Ready</p>
            <p className="text-[11px] text-blue-300/60 mt-0.5">
              This system is prepared to receive data from ESP32 devices via GSM/SMS. Device health
              metrics will update in real-time when connected to the backend API.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
