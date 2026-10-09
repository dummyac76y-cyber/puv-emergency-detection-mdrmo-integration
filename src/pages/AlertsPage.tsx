import { Search, CheckCircle, Eye } from 'lucide-react';
import { useState } from 'react';

import { SimulationBanner, PriorityBadge, IncidentTypeIcon } from '@/components/shared';
import { useApp } from '@/store/AppContext';

export default function AlertsPage() {
  const { alerts, vehicles, acknowledgeAlert, setCurrentPage, setSelectedIncident, incidents } =
    useApp();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'unacknowledged' | 'acknowledged'>('all');

  const filtered = alerts.filter((a) => {
    if (filter === 'unacknowledged' && a.acknowledged) return false;
    if (filter === 'acknowledged' && !a.acknowledged) return false;
    if (search) {
      const s = search.toLowerCase();
      return (
        a.id.toLowerCase().includes(s) ||
        a.vehicleId.toLowerCase().includes(s) ||
        a.message.toLowerCase().includes(s)
      );
    }
    return true;
  });

  const sorted = [...filtered].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const getVehicle = (id: string) => vehicles.find((v) => v.id === id);
  const getIncident = (id: string) => incidents.find((i) => i.id === id);

  return (
    <div className="flex flex-col h-full">
      <SimulationBanner />
      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        <div className="mb-4">
          <h1 className="text-lg font-bold text-text-primary">Alert History</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Complete log of all vehicle accident and driver threat alerts received by the system
          </p>
        </div>

        {/* Filters */}
        <div className="bg-surface-raised border border-border-default rounded-xl p-3 mb-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search alerts..."
                className="w-full bg-navy-800 border border-border-subtle rounded-lg pl-9 pr-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent"
              />
            </div>
            <div className="flex items-center gap-1 bg-navy-800 rounded-lg p-0.5">
              {(['all', 'unacknowledged', 'acknowledged'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 text-xs rounded-md transition-colors capitalize ${filter === f ? 'bg-accent text-white' : 'text-text-muted hover:text-text-primary'}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Alert List */}
        <div className="space-y-2">
          {sorted.map((alert) => {
            const vehicle = getVehicle(alert.vehicleId);
            const incident = getIncident(alert.incidentId);
            return (
              <div
                key={alert.id}
                className={`bg-surface-raised border rounded-xl p-4 transition-all ${alert.acknowledged ? 'border-border-default' : 'border-amber-700/40 bg-amber-900/5'}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <IncidentTypeIcon
                      type={alert.type}
                      className={`w-4 h-4 ${alert.priority === 'critical' ? 'text-red-400' : 'text-amber-400'}`}
                    />
                    <span className="font-mono text-xs font-semibold text-text-primary">
                      {alert.id}
                    </span>
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
                      Vehicle:{' '}
                      <span className="font-mono text-text-secondary">{alert.vehicleId}</span>
                    </span>
                    {vehicle && <span>({vehicle.plateNumber})</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    {!alert.acknowledged && (
                      <button
                        onClick={() => acknowledgeAlert(alert.id)}
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
                    {incident && (
                      <button
                        onClick={() => {
                          setSelectedIncident(incident);
                          setCurrentPage('incidents');
                        }}
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
          })}
        </div>
      </div>
    </div>
  );
}
