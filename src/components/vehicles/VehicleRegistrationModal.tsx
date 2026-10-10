import { X, Bus, User, Building, MapPin, Shield, Loader2 } from 'lucide-react';
import { useState } from 'react';

import { useVehicles } from '@/store';
import { VehicleType, VehicleStatus, RegistrationStatus } from '@/types';

interface VehicleFormData {
  plateNumber: string;
  type: VehicleType;
  deviceId: string;
  driver: string;
  operator: string;
  emergencyContact: string;
  route: string;
  registrationStatus: RegistrationStatus;
}

const VEHICLE_TYPES: VehicleType[] = ['jeepney', 'tricycle', 'uv-express', 'bus'];
const REGISTRATION_STATUSES: RegistrationStatus[] = ['active', 'expired', 'suspended'];

export function VehicleRegistrationModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const { vehicles, addVehicle } = useVehicles();
  const [formData, setFormData] = useState<VehicleFormData>({
    plateNumber: '',
    type: 'jeepney',
    deviceId: '',
    driver: '',
    operator: '',
    emergencyContact: '',
    route: '',
    registrationStatus: 'active',
  });
  const [errors, setErrors] = useState<Partial<VehicleFormData>>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const newErrors: Partial<VehicleFormData> = {};
    if (!formData.plateNumber.trim()) newErrors.plateNumber = 'Plate number is required';
    else if (!/^[A-Z]{3}-?\d{4}$/i.test(formData.plateNumber))
      newErrors.plateNumber = 'Format: ABC-1234 or ABC1234';
    if (!formData.deviceId.trim()) newErrors.deviceId = 'Device ID is required';
    if (!formData.driver.trim()) newErrors.driver = 'Driver name is required';
    if (!formData.operator.trim()) newErrors.operator = 'Operator is required';
    if (!formData.emergencyContact.trim())
      newErrors.emergencyContact = 'Emergency contact is required';
    if (!formData.route.trim()) newErrors.route = 'Route is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const newVehicle = {
        ...formData,
        id: `VH-${String(vehicles.length + 1).padStart(3, '0')}`,
        status: 'normal' as VehicleStatus,
        position: { lat: 14.5995, lng: 120.9842 },
        speed: 0,
        passengers: 0,
        fuelLevel: 100,
        lastCommunication: new Date().toISOString(),
      };
      await addVehicle(newVehicle);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to register vehicle:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatPlateNumber = (value: string) => {
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 7) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}`;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface-raised border border-border-default rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
              <Bus className="w-5 h-5 text-accent" />
            </div>
            <h2 className="text-lg font-bold text-text-primary">Register New Vehicle</h2>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-2 text-text-muted hover:text-text-primary rounded-lg hover:bg-navy-800 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Plate Number */}
          <div>
            <label htmlFor="plateNumber" className="block text-xs text-text-muted mb-1">
              Plate Number <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Bus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                id="plateNumber"
                type="text"
                value={formData.plateNumber}
                onChange={(e) =>
                  setFormData({ ...formData, plateNumber: formatPlateNumber(e.target.value) })
                }
                placeholder="ABC-1234"
                className={`w-full bg-navy-800 border border-border-subtle rounded-lg pl-10 pr-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent ${errors.plateNumber ? 'border-red-500' : ''}`}
                disabled={submitting}
              />
            </div>
            {errors.plateNumber && (
              <p className="text-xs text-red-400 mt-1">{errors.plateNumber}</p>
            )}
          </div>

          {/* Vehicle Type & Device ID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label htmlFor="type" className="block text-xs text-text-muted mb-1">
                Vehicle Type <span className="text-red-400">*</span>
              </label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as VehicleType })}
                className="w-full bg-navy-800 border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
                disabled={submitting}
              >
                {VEHICLE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="deviceId" className="block text-xs text-text-muted mb-1">
                Device ID (ESP32) <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  id="deviceId"
                  type="text"
                  value={formData.deviceId}
                  onChange={(e) =>
                    setFormData({ ...formData, deviceId: e.target.value.toUpperCase() })
                  }
                  placeholder="ESP32-001"
                  className="w-full bg-navy-800 border border-border-subtle rounded-lg pl-10 pr-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent"
                  disabled={submitting}
                />
              </div>
            </div>
          </div>

          {/* Driver & Operator */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label htmlFor="driver" className="block text-xs text-text-muted mb-1">
                Driver Name <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  id="driver"
                  type="text"
                  value={formData.driver}
                  onChange={(e) => setFormData({ ...formData, driver: e.target.value })}
                  placeholder="Juan Dela Cruz"
                  className="w-full bg-navy-800 border border-border-subtle rounded-lg pl-10 pr-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent"
                  disabled={submitting}
                />
              </div>
            </div>
            <div>
              <label htmlFor="operator" className="block text-xs text-text-muted mb-1">
                Operator <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  id="operator"
                  type="text"
                  value={formData.operator}
                  onChange={(e) => setFormData({ ...formData, operator: e.target.value })}
                  placeholder="San Jose Transport Coop"
                  className="w-full bg-navy-800 border border-border-subtle rounded-lg pl-10 pr-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent"
                  disabled={submitting}
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact & Route */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label htmlFor="emergencyContact" className="block text-xs text-text-muted mb-1">
                Emergency Contact <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  id="emergencyContact"
                  type="tel"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                  placeholder="+63 917 123 4567"
                  className="w-full bg-navy-800 border border-border-subtle rounded-lg pl-10 pr-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent"
                  disabled={submitting}
                />
              </div>
            </div>
            <div>
              <label htmlFor="route" className="block text-xs text-text-muted mb-1">
                Route <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  id="route"
                  type="text"
                  value={formData.route}
                  onChange={(e) => setFormData({ ...formData, route: e.target.value })}
                  placeholder="Route 1 — Town Center to Brgy. San Jose"
                  className="w-full bg-navy-800 border border-border-subtle rounded-lg pl-10 pr-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent"
                  disabled={submitting}
                />
              </div>
            </div>
          </div>

          {/* Registration Status */}
          <div>
            <p className="block text-xs text-text-muted mb-1">Registration Status</p>
            <div className="flex flex-wrap gap-2">
              {REGISTRATION_STATUSES.map((status) => {
                const radioId = `reg-status-${status}`;
                return (
                  <label
                    key={status}
                    htmlFor={radioId}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                      formData.registrationStatus === status
                        ? 'bg-accent/10 border-accent text-accent'
                        : 'bg-navy-800 border-border-subtle text-text-secondary hover:border-accent/50'
                    }`}
                  >
                    <input
                      type="radio"
                      id={radioId}
                      name="registrationStatus"
                      value={status}
                      checked={formData.registrationStatus === status}
                      onChange={() => setFormData({ ...formData, registrationStatus: status })}
                      className="sr-only"
                      disabled={submitting}
                    />
                    <span className="text-xs font-medium capitalize">{status}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Error Message */}
          <div className="text-center text-xs text-red-400" id="form-error" aria-live="polite" />

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 px-4 py-2.5 bg-navy-800 border border-border-subtle text-text-secondary hover:text-text-primary hover:bg-navy-700 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Register Vehicle
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
