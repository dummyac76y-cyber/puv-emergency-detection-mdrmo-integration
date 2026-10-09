import { CheckCircle, Eye } from 'lucide-react';
import { memo, useMemo } from 'react';

import { IncidentTypeIcon, PriorityBadge } from '@/components/shared';
import { Alert } from '@/types';

interface AlertItemProps {
  alert: Alert;
  onAcknowledge: (alertId: string) => void;
  onViewIncident?: (incidentId: string) => void;
}

const AlertItem = memo(function AlertItem({
  alert,
  onAcknowledge,
  onViewIncident,
}: AlertItemProps) {
  const iconColor = useMemo(
    () => (alert.priority === 'critical' ? 'text-red-400' : 'text-amber-400'),
    [alert.priority]
  );

  const borderClass = useMemo(
    () => (alert.acknowledged ? 'border-border-default' : 'border-amber-700/40 bg-amber-900/5'),
    [alert.acknowledged]
  );

  return (
    <div className={`bg-surface-raised border rounded-xl p-4 transition-all ${borderClass}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <IncidentTypeIcon type={alert.type} className={`w-4 h-4 ${iconColor}`} />
          <span className="font-mono text-xs font-semibold text-text-primary">{alert.id}</span>
          <PriorityBadge priority={alert.priority} />
          {!alert.acknowledged && (
            <span className="bg-amber-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded blink">
              UNREAD
            </span>
          )}
        </div>
        <span className="text-[11px] text-text-muted font-mono">
          {new Date(alert.timestamp).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          })}
        </span>
      </div>
      <p className="text-sm text-text-secondary mb-2">{alert.message}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-text-muted">
          <span>
            Vehicle: <span className="font-mono text-text-secondary">{alert.vehicleId}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          {!alert.acknowledged && (
            <button
              onClick={() => onAcknowledge(alert.id)}
              className="flex items-center gap-1 px-2.5 py-1 bg-accent/20 text-accent text-xs font-medium rounded-lg hover:bg-accent/30 transition-colors"
            >
              <CheckCircle className="w-3 h-3" />
              Acknowledge
            </button>
          )}
          {alert.acknowledged && (
            <span className="flex items-center gap-1 text-xs text-green-400">
              <CheckCircle className="w-3 h-3" />
              Acknowledged
            </span>
          )}
          {onViewIncident && (
            <button
              onClick={() => onViewIncident(alert.incidentId)}
              className="flex items-center gap-1 px-2.5 py-1 bg-navy-800 text-text-secondary text-xs rounded-lg hover:text-text-primary transition-colors"
            >
              <Eye className="w-3 h-3" />
              View Incident
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

AlertItem.displayName = 'AlertItem';

export { AlertItem };
