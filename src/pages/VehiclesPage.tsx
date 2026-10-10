import { Search, Plus } from 'lucide-react';
import { useState, useMemo } from 'react';

import { SimulationBanner } from '@/components/shared';
import { VehicleCard, VehicleRegistrationModal } from '@/components/vehicles';
import { useVehicles } from '@/store';
import { Vehicle, VehicleType, VehicleStatus } from '@/types';

export default function VehiclesPage() {
  const { vehicles, fetchVehicles, loading, error } = useVehicles();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<VehicleType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<VehicleStatus | 'all'>('all');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const filtered = useMemo(() => {
    return vehicles.filter((v) => {
      if (typeFilter !== 'all' && v.type !== typeFilter) return false;
      if (statusFilter !== 'all' && v.status !== statusFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        return (
          v.plateNumber.toLowerCase().includes(s) ||
          v.driver.toLowerCase().includes(s) ||
          v.id.toLowerCase().includes(s) ||
          v.operator.toLowerCase().includes(s)
        );
      }
      return true;
    });
  }, [vehicles, search, typeFilter, statusFilter]);

  return (
    <div className="flex flex-col h-full">
      <SimulationBanner />
      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-bold text-text-primary">Vehicle Registry</h1>
            <p className="text-xs text-text-muted mt-0.5">
              Registered PUVs with device assignments and operator information
            </p>
          </div>
          <button
            onClick={() => setShowRegisterModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-accent hover:bg-accent-hover text-white text-xs font-medium rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Register Vehicle
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-800/30 text-red-400 text-xs rounded-lg">
            Error loading vehicles: {error}
            <button onClick={fetchVehicles} className="ml-2 underline hover:text-red-300">
              Retry
            </button>
          </div>
        )}

        {loading && (
          <div className="mb-4 p-3 bg-amber-900/30 border border-amber-800/30 text-amber-400 text-xs rounded-lg">
            Loading vehicles...
          </div>
        )}

        {/* Filters */}
        <div className="bg-surface-raised border border-border-default rounded-xl p-3 mb-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by plate, driver, operator..."
                className="w-full bg-navy-800 border border-border-subtle rounded-lg pl-9 pr-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as VehicleType | 'all')}
              className="bg-navy-800 border border-border-subtle rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent"
            >
              <option value="all">All Types</option>
              <option value="jeepney">Jeepney</option>
              <option value="tricycle">Tricycle</option>
              <option value="uv-express">UV Express</option>
              <option value="bus">Bus</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as VehicleStatus | 'all')}
              className="bg-navy-800 border border-border-subtle rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent"
            >
              <option value="all">All Status</option>
              <option value="normal">Normal</option>
              <option value="emergency">Emergency</option>
              <option value="sos">SOS</option>
              <option value="offline">Offline</option>
            </select>
          </div>
        </div>

        {/* Vehicle Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map((v) => (
            <VehicleCard key={v.id} vehicle={v} onClick={setSelectedVehicle} />
          ))}
        </div>
      </div>

      {/* Vehicle Detail Panel */}
      {selectedVehicle && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-raised border border-border-default rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-4 border-b border-border-subtle flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span
                  className={`inline-block w-2.5 h-2.5 rounded-full ${
                    selectedVehicle.status === 'normal'
                      ? 'bg-green-500'
                      : selectedVehicle.status === 'emergency' || selectedVehicle.status === 'sos'
                        ? 'bg-red-500 animate-pulse'
                        : 'bg-gray-500'
                  }`}
                  aria-label={`Status: ${selectedVehicle.status}`}
                />
                <div>
                  <h2 className="text-base font-bold text-text-primary font-mono">
                    {selectedVehicle.plateNumber}
                  </h2>
                  <p className="text-xs text-text-muted capitalize">
                    {selectedVehicle.type} • {selectedVehicle.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedVehicle(null)}
                className="p-2 text-text-muted hover:text-text-primary rounded-lg hover:bg-navy-800"
                aria-label="Close"
              >
                <span role="img" aria-label="Close">
                  ✕
                </span>
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <InfoItem label="Driver" value={selectedVehicle.driver} />
                <InfoItem label="Operator" value={selectedVehicle.operator} />
                <InfoItem label="Device ID" value={selectedVehicle.deviceId} mono />
                <InfoItem label="Route" value={selectedVehicle.route} />
                <InfoItem label="Emergency Contact" value={selectedVehicle.emergencyContact} />
                <InfoItem
                  label="Last Communication"
                  value={new Date(selectedVehicle.lastCommunication).toLocaleString()}
                />
                <InfoItem
                  label="GPS Coordinates"
                  value={`${selectedVehicle.position.lat.toFixed(5)}, ${selectedVehicle.position.lng.toFixed(5)}`}
                  mono
                />
                <InfoItem label="Registration" value={selectedVehicle.registrationStatus} />
              </div>
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-navy-800 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-text-primary">{selectedVehicle.speed}</p>
                  <p className="text-[10px] text-text-muted">km/h</p>
                </div>
                <div className="bg-navy-800 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-text-primary">
                    {selectedVehicle.passengers}
                  </p>
                  <p className="text-[10px] text-text-muted">passengers</p>
                </div>
                <div className="bg-navy-800 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-text-primary">
                    {selectedVehicle.fuelLevel}%
                  </p>
                  <p className="text-[10px] text-text-muted">fuel level</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vehicle Registration Modal */}
      {showRegisterModal && (
        <VehicleRegistrationModal
          onClose={() => setShowRegisterModal(false)}
          onSuccess={() => setShowRegisterModal(false)}
        />
      )}
    </div>
  );
}

interface InfoItemProps {
  label: string;
  value: string;
  mono?: boolean;
}

function InfoItem({ label, value, mono }: InfoItemProps) {
  return (
    <div className="bg-navy-800 rounded-lg p-2.5">
      <p className="text-[10px] text-text-muted uppercase mb-0.5">{label}</p>
      <p className={`text-xs text-text-primary ${mono ? 'font-mono' : ''}`}>{value}</p>
    </div>
  );
}
