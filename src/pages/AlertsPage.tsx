import { Search } from 'lucide-react';
import { useState, useMemo } from 'react';

import { AlertItem } from '@/components/alerts';
import { SimulationBanner } from '@/components/shared';
import { useAlerts, useIncidents } from '@/store';
import { useApp } from '@/store/AppContext';

export default function AlertsPage() {
  const { alerts, fetchAlerts, acknowledgeAlert, loading, error } = useAlerts();
  const { incidents } = useIncidents();
  const { setCurrentPage, setSelectedIncident } = useApp();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'unacknowledged' | 'acknowledged'>('all');

  const filtered = useMemo(() => {
    return alerts.filter((a) => {
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
  }, [alerts, search, filter]);

  const sorted = useMemo(() => {
    return [...filtered].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [filtered]);

  const handleViewIncident = (incidentId: string) => {
    const incident = incidents.find((i) => i.id === incidentId);
    if (incident) {
      setSelectedIncident(incident);
      setCurrentPage('incidents');
    }
  };

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

        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-800/30 text-red-400 text-xs rounded-lg">
            Error loading alerts: {error}
            <button onClick={fetchAlerts} className="ml-2 underline hover:text-red-300">
              Retry
            </button>
          </div>
        )}

        {loading && (
          <div className="mb-4 p-3 bg-amber-900/30 border border-amber-800/30 text-amber-400 text-xs rounded-lg">
            Loading alerts...
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
          {sorted.map((alert) => (
            <AlertItem
              key={alert.id}
              alert={alert}
              onAcknowledge={acknowledgeAlert}
              onViewIncident={handleViewIncident}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
