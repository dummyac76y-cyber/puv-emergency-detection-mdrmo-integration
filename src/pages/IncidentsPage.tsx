import { Search, Eye, CheckCircle, XCircle } from 'lucide-react';
import { useState, useMemo } from 'react';

import {
  SimulationBanner,
  PriorityBadge,
  StatusBadge,
  IncidentTypeIcon,
  ConfirmDialog,
} from '@/components/shared';
import { useIncidents } from '@/store';
import { Incident, IncidentStatus, IncidentPriority, IncidentType } from '@/types';

export default function IncidentsPage() {
  const { incidents, fetchIncidents, updateIncidentStatus, loading, error } = useIncidents();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<IncidentStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<IncidentPriority | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<IncidentType | 'all'>('all');
  const [confirmAction, setConfirmAction] = useState<{
    incidentId: string;
    status: IncidentStatus;
  } | null>(null);
  const [detailIncident, setDetailIncident] = useState<Incident | null>(null);

  const filtered = useMemo(() => {
    return incidents.filter((inc) => {
      if (statusFilter !== 'all' && inc.status !== statusFilter) return false;
      if (priorityFilter !== 'all' && inc.priority !== priorityFilter) return false;
      if (typeFilter !== 'all' && inc.type !== typeFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        return (
          inc.id.toLowerCase().includes(s) ||
          inc.vehicleId.toLowerCase().includes(s) ||
          inc.location.toLowerCase().includes(s)
        );
      }
      return true;
    });
  }, [incidents, search, statusFilter, priorityFilter, typeFilter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      const statusOrder = { new: 0, acknowledged: 1, responding: 2, resolved: 3, 'false-alarm': 4 };
      if (statusOrder[a.status] !== statusOrder[b.status])
        return statusOrder[a.status] - statusOrder[b.status];
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [filtered]);

  return (
    <div className="flex flex-col h-full">
      <SimulationBanner />
      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-bold text-text-primary">
              Vehicle Accidents & Driver Threats
            </h1>
            <p className="text-xs text-text-muted mt-0.5">
              Manage and track vehicle collisions, SOS activations, medical emergencies, and threats
              against drivers
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span className="bg-red-900/30 text-red-400 px-2 py-1 rounded border border-red-800/30">
              {incidents.filter((i) => i.status === 'new').length} new
            </span>
            <span className="bg-amber-900/30 text-amber-400 px-2 py-1 rounded border border-amber-800/30">
              {incidents.filter((i) => i.status === 'responding').length} responding
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-800/30 text-red-400 text-xs rounded-lg">
            Error loading incidents: {error}
            <button onClick={fetchIncidents} className="ml-2 underline hover:text-red-300">
              Retry
            </button>
          </div>
        )}

        {loading && (
          <div className="mb-4 p-3 bg-amber-900/30 border border-amber-800/30 text-amber-400 text-xs rounded-lg">
            Loading incidents...
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
                placeholder="Search incidents..."
                className="w-full bg-navy-800 border border-border-subtle rounded-lg pl-9 pr-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as IncidentStatus | 'all')}
              className="bg-navy-800 border border-border-subtle rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="responding">Responding</option>
              <option value="resolved">Resolved</option>
              <option value="false-alarm">False Alarm</option>
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as IncidentPriority | 'all')}
              className="bg-navy-800 border border-border-subtle rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent"
            >
              <option value="all">All Priority</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as IncidentType | 'all')}
              className="bg-navy-800 border border-border-subtle rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent"
            >
              <option value="all">All Types</option>
              <option value="crash">Crash Detection</option>
              <option value="sos">Manual SOS</option>
              <option value="medical">Medical</option>
              <option value="threat">Threat</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-surface-raised border border-border-default rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-subtle">
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                    Incident
                  </th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                    Type
                  </th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                    Time
                  </th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                    Location
                  </th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((inc) => (
                  <tr
                    key={inc.id}
                    className="border-b border-border-subtle/50 table-row-hover transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-semibold text-text-primary">
                        {inc.id}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <span className="font-mono text-xs text-text-primary">{inc.vehicleId}</span>
                        <p className="text-[11px] text-text-muted">{inc.vehicleType}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <IncidentTypeIcon type={inc.type} className="w-3.5 h-3.5 text-text-muted" />
                        <span className="text-xs text-text-secondary capitalize">{inc.type}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <PriorityBadge priority={inc.priority} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={inc.status} />
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-text-muted font-mono">
                        {new Date(inc.timestamp).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false,
                        })}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-text-muted max-w-[150px] truncate block">
                        {inc.location}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setDetailIncident(inc)}
                          className="p-1.5 text-text-muted hover:text-accent rounded transition-colors"
                          title="View details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {inc.status === 'new' && (
                          <button
                            onClick={() =>
                              setConfirmAction({ incidentId: inc.id, status: 'acknowledged' })
                            }
                            className="p-1.5 text-text-muted hover:text-amber-400 rounded transition-colors"
                            title="Acknowledge"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {(inc.status === 'resolved' || inc.status === 'false-alarm') && (
                          <button
                            onClick={() =>
                              setConfirmAction({ incidentId: inc.id, status: 'false-alarm' })
                            }
                            className="p-1.5 text-text-muted hover:text-gray-400 rounded transition-colors"
                            title="Mark false alarm"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {detailIncident && (
        <IncidentDetailModal
          incident={detailIncident}
          onClose={() => setDetailIncident(null)}
          onStatusChange={(status) => {
            updateIncidentStatus(detailIncident.id, status);
            setDetailIncident(null);
          }}
        />
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={!!confirmAction}
        title={
          confirmAction?.status === 'false-alarm'
            ? 'Mark as False Alarm?'
            : 'Update Incident Status'
        }
        message={
          confirmAction?.status === 'false-alarm'
            ? 'This will mark the incident as a false alarm. This action will be recorded in the incident timeline.'
            : `Change incident status to "${confirmAction?.status}"?`
        }
        confirmLabel={confirmAction?.status === 'false-alarm' ? 'Mark False Alarm' : 'Confirm'}
        danger={confirmAction?.status === 'false-alarm'}
        onConfirm={() => {
          if (confirmAction) {
            updateIncidentStatus(confirmAction.incidentId, confirmAction.status);
            setConfirmAction(null);
          }
        }}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}

function IncidentDetailModal({
  incident,
  onClose,
  onStatusChange,
}: {
  incident: Incident;
  onClose: () => void;
  onStatusChange: (status: IncidentStatus) => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface-raised border border-border-default rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div
          className={`p-4 border-b border-border-subtle flex items-center justify-between ${incident.priority === 'critical' ? 'bg-red-900/10' : ''}`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-navy-800">
              <IncidentTypeIcon
                type={incident.type}
                className={`w-5 h-5 ${incident.priority === 'critical' ? 'text-red-400' : 'text-amber-400'}`}
              />
            </div>
            <div>
              <h2 className="text-base font-bold text-text-primary">{incident.id}</h2>
              <p className="text-xs text-text-muted capitalize">
                {incident.type} • {incident.priority} priority
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-text-muted hover:text-text-primary rounded-lg hover:bg-navy-800 transition-colors"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          {/* Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-navy-800 rounded-lg p-3">
              <p className="text-[10px] text-text-muted uppercase mb-1">Status</p>
              <StatusBadge status={incident.status} />
            </div>
            <div className="bg-navy-800 rounded-lg p-3">
              <p className="text-[10px] text-text-muted uppercase mb-1">Vehicle</p>
              <p className="text-sm font-mono text-text-primary">{incident.vehicleId}</p>
            </div>
            <div className="bg-navy-800 rounded-lg p-3">
              <p className="text-[10px] text-text-muted uppercase mb-1 flex items-center gap-1">
                Time
              </p>
              <p className="text-sm text-text-primary">
                {new Date(incident.timestamp).toLocaleTimeString('en-US', { hour12: false })}
              </p>
            </div>
            <div className="bg-navy-800 rounded-lg p-3">
              <p className="text-[10px] text-text-muted uppercase mb-1">Alert Delivery</p>
              <p className="text-sm text-text-primary">{incident.alertDeliveryMs}ms</p>
            </div>
          </div>

          {/* Location */}
          <div className="bg-navy-800 rounded-lg p-3">
            <p className="text-[10px] text-text-muted uppercase mb-1">Location</p>
            <p className="text-sm text-text-primary">{incident.location}</p>
            <p className="text-[11px] text-text-muted mt-0.5">
              GPS: {incident.coordinates.lat.toFixed(5)}, {incident.coordinates.lng.toFixed(5)}
            </p>
          </div>

          {/* Notes */}
          <div className="bg-navy-800 rounded-lg p-3">
            <p className="text-[10px] text-text-muted uppercase mb-1">Incident Notes</p>
            <p className="text-sm text-text-secondary">{incident.notes}</p>
          </div>

          {/* Timeline */}
          <div className="bg-navy-800 rounded-lg p-3">
            <p className="text-[10px] text-text-muted uppercase mb-3">Incident Timeline</p>
            <div className="space-y-3">
              {incident.timeline.map((entry, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-accent mt-1" />
                    {i < incident.timeline.length - 1 && (
                      <div className="w-px h-full bg-border-subtle min-h-[20px]" />
                    )}
                  </div>
                  <div className="flex-1 pb-2">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-medium text-text-primary">{entry.action}</span>
                      <span className="text-[10px] text-text-muted">
                        {new Date(entry.timestamp).toLocaleTimeString('en-US', { hour12: false })}
                      </span>
                    </div>
                    <p className="text-[11px] text-text-muted">{entry.actor}</p>
                    {entry.details && (
                      <p className="text-[11px] text-text-secondary mt-0.5">{entry.details}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-border-subtle">
            {incident.status === 'new' && (
              <button
                onClick={() => onStatusChange('acknowledged')}
                className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium rounded-lg transition-colors"
              >
                Acknowledge
              </button>
            )}
            {(incident.status === 'acknowledged' || incident.status === 'new') && (
              <button
                onClick={() => onStatusChange('responding')}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
              >
                Mark Responding
              </button>
            )}
            {incident.status !== 'resolved' && (
              <button
                onClick={() => onStatusChange('resolved')}
                className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-colors"
              >
                Resolve
              </button>
            )}
            {incident.status !== 'false-alarm' && (
              <button
                onClick={() => onStatusChange('false-alarm')}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-xs font-medium rounded-lg transition-colors"
              >
                False Alarm
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
