import {
  AlertTriangle,
  Radio,
  Heart,
  ShieldAlert,
  HelpCircle,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
} from 'lucide-react';

import {
  IncidentPriority,
  IncidentStatus,
  IncidentType,
  VehicleStatus,
  DeviceStatus,
} from '@/types';

export function PriorityBadge({ priority }: { priority: IncidentPriority }) {
  const styles = {
    critical: 'bg-red-900/40 text-red-300 border-red-700/50',
    high: 'bg-orange-900/40 text-orange-300 border-orange-700/50',
    medium: 'bg-amber-900/40 text-amber-300 border-amber-700/50',
    low: 'bg-blue-900/40 text-blue-300 border-blue-700/50',
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-[11px] font-semibold rounded border uppercase tracking-wide ${styles[priority]}`}
    >
      {priority}
    </span>
  );
}

export function StatusBadge({ status }: { status: IncidentStatus }) {
  const config = {
    new: {
      label: 'New',
      className: 'bg-red-900/40 text-red-300 border-red-700/50',
      icon: AlertTriangle,
    },
    acknowledged: {
      label: 'Acknowledged',
      className: 'bg-amber-900/40 text-amber-300 border-amber-700/50',
      icon: Clock,
    },
    responding: {
      label: 'Responding',
      className: 'bg-blue-900/40 text-blue-300 border-blue-700/50',
      icon: Truck,
    },
    resolved: {
      label: 'Resolved',
      className: 'bg-green-900/40 text-green-300 border-green-700/50',
      icon: CheckCircle,
    },
    'false-alarm': {
      label: 'False Alarm',
      className: 'bg-gray-800/40 text-gray-400 border-gray-600/50',
      icon: XCircle,
    },
  };
  const c = config[status];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded border ${c.className}`}
    >
      <c.icon className="w-3 h-3" />
      {c.label}
    </span>
  );
}

export function IncidentTypeIcon({
  type,
  className = 'w-4 h-4',
}: {
  type: IncidentType;
  className?: string;
}) {
  const icons = {
    crash: AlertTriangle,
    sos: Radio,
    medical: Heart,
    threat: ShieldAlert,
    other: HelpCircle,
  };
  const Icon = icons[type];
  return <Icon className={className} />;
}

export function VehicleStatusDot({ status }: { status: VehicleStatus }) {
  const colors = {
    normal: 'bg-green-500',
    emergency: 'bg-red-500 animate-pulse',
    sos: 'bg-red-500 animate-blink',
    offline: 'bg-gray-500',
  };
  return (
    <span
      className={`inline-block w-2.5 h-2.5 rounded-full ${colors[status]}`}
      aria-label={`Status: ${status}`}
    />
  );
}

export function DeviceStatusBadge({ status }: { status: DeviceStatus }) {
  const config = {
    online: { label: 'Online', className: 'bg-green-900/30 text-green-400 border-green-700/40' },
    offline: { label: 'Offline', className: 'bg-gray-800/30 text-gray-400 border-gray-600/40' },
    degraded: {
      label: 'Degraded',
      className: 'bg-amber-900/30 text-amber-400 border-amber-700/40',
    },
    maintenance: {
      label: 'Maintenance',
      className: 'bg-blue-900/30 text-blue-400 border-blue-700/40',
    },
  };
  const c = config[status];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded border ${c.className}`}
    >
      {c.label}
    </span>
  );
}

export function VehicleTypeLabel({ type }: { type: string }) {
  const labels: Record<string, string> = {
    jeepney: 'Jeepney',
    tricycle: 'Tricycle',
    'uv-express': 'UV Express',
    bus: 'Bus',
  };
  return <span className="text-xs text-text-secondary">{labels[type] || type}</span>;
}

export function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = 'Confirm',
  danger = false,
}: {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  danger?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface-raised border border-border-default rounded-xl shadow-2xl w-full max-w-md p-5">
        <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
        <p className="text-sm text-text-secondary mb-5">{message}</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary bg-surface border border-border-default rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-accent hover:bg-accent-hover'}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-text-muted mb-3">{icon}</div>
      <h3 className="text-sm font-medium text-text-primary mb-1">{title}</h3>
      <p className="text-xs text-text-muted max-w-xs">{description}</p>
    </div>
  );
}

export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };
  return (
    <div className="flex items-center justify-center py-8">
      <div
        className={`${sizes[size]} border-2 border-accent border-t-transparent rounded-full animate-spin`}
      />
    </div>
  );
}

export function SimulationBanner() {
  return (
    <div className="bg-amber-900/20 border-b border-amber-800/30 px-4 py-1.5 flex items-center justify-center gap-2">
      <span className="w-2 h-2 rounded-full bg-amber-400 animate-blink" />
      <span className="text-[11px] font-medium text-amber-300 uppercase tracking-wider">
        Simulation Mode — Vehicle accident & driver threat monitoring (demo data)
      </span>
    </div>
  );
}

export function Notification({
  message,
  type,
  onClose,
}: {
  message: string;
  type: string;
  onClose: () => void;
}) {
  const colors = {
    success: 'bg-green-900/80 border-green-700/50 text-green-300',
    error: 'bg-red-900/80 border-red-700/50 text-red-300',
    warning: 'bg-amber-900/80 border-amber-700/50 text-amber-300',
    info: 'bg-blue-900/80 border-blue-700/50 text-blue-300',
  };
  return (
    <div
      className={`fixed top-4 right-4 z-[200] px-4 py-3 rounded-lg border shadow-xl animate-slide-in flex items-center gap-3 ${colors[type as keyof typeof colors] || colors.info}`}
    >
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="opacity-60 hover:opacity-100">
        <XCircle className="w-4 h-4" />
      </button>
    </div>
  );
}
