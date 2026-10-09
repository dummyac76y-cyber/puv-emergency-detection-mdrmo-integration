import { Eye, CheckCircle, XCircle } from 'lucide-react';
import { memo } from 'react';

import { IncidentTypeIcon, PriorityBadge, StatusBadge } from '@/components/shared';
import { Incident } from '@/types';

interface IncidentRowProps {
  incident: Incident;
  onViewDetails: (incident: Incident) => void;
  onAcknowledge: (incidentId: string) => void;
  onMarkFalseAlarm: (incidentId: string) => void;
}

const IncidentRow = memo(function IncidentRow({
  incident,
  onViewDetails,
  onAcknowledge,
  onMarkFalseAlarm,
}: IncidentRowProps) {
  return (
    <tr className="border-b border-border-subtle/50 table-row-hover transition-colors">
      <td className="px-4 py-3">
        <span className="font-mono text-xs font-semibold text-text-primary">{incident.id}</span>
      </td>
      <td className="px-4 py-3">
        <div>
          <span className="font-mono text-xs text-text-primary">{incident.vehicleId}</span>
          <p className="text-[11px] text-text-muted">{incident.vehicleType}</p>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          <IncidentTypeIcon type={incident.type} className="w-3.5 h-3.5 text-text-muted" />
          <span className="text-xs text-text-secondary capitalize">{incident.type}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <PriorityBadge priority={incident.priority} />
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={incident.status} />
      </td>
      <td className="px-4 py-3">
        <span className="text-xs text-text-muted font-mono">
          {new Date(incident.timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          })}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className="text-xs text-text-muted max-w-[150px] truncate block">
          {incident.location}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onViewDetails(incident)}
            className="p-1.5 text-text-muted hover:text-accent rounded transition-colors"
            title="View details"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          {incident.status === 'new' && (
            <button
              onClick={() => onAcknowledge(incident.id)}
              className="p-1.5 text-text-muted hover:text-amber-400 rounded transition-colors"
              title="Acknowledge"
            >
              <CheckCircle className="w-3.5 h-3.5" />
            </button>
          )}
          {(incident.status === 'resolved' || incident.status === 'false-alarm') && (
            <button
              onClick={() => onMarkFalseAlarm(incident.id)}
              className="p-1.5 text-text-muted hover:text-gray-400 rounded transition-colors"
              title="Mark false alarm"
            >
              <XCircle className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
});

IncidentRow.displayName = 'IncidentRow';

export { IncidentRow };
