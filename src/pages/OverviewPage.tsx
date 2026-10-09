import { useApp } from '../store/AppContext';
import { SimulationBanner, PriorityBadge, StatusBadge, VehicleStatusDot, IncidentTypeIcon } from '../components/shared';
import { AlertTriangle, Bus, CheckCircle, Clock, Cpu, Radio, Zap, Activity, ArrowRight } from 'lucide-react';
import LiveMap from './LiveMapPage';

export default function OverviewPage() {
  const { stats, incidents, alerts, vehicles, setCurrentPage, setSelectedIncident, acknowledgeAlert } = useApp();
  const activeEmergencies = incidents.filter(i => i.status === 'new' || i.status === 'acknowledged' || i.status === 'responding');
  const unacknowledged = alerts.filter(a => !a.acknowledged);
  const recentIncidents = [...incidents].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5);

  const statCards = [
    { label: 'Active Emergencies', value: stats.activeEmergencies, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-900/20', border: 'border-red-800/30' },
    { label: 'Unacknowledged Alerts', value: stats.unacknowledgedAlerts, icon: Radio, color: 'text-amber-400', bg: 'bg-amber-900/20', border: 'border-amber-800/30' },
    { label: 'Vehicles Monitored', value: stats.vehiclesMonitored, icon: Bus, color: 'text-blue-400', bg: 'bg-blue-900/20', border: 'border-blue-800/30' },
    { label: 'Resolved Today', value: stats.incidentsResolvedToday, icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-900/20', border: 'border-green-800/30' },
    { label: 'Avg Alert Delivery', value: `${stats.avgAlertDeliveryMs}ms`, icon: Zap, color: 'text-purple-400', bg: 'bg-purple-900/20', border: 'border-purple-800/30' },
    { label: 'Devices Offline', value: stats.devicesOffline, icon: Cpu, color: 'text-gray-400', bg: 'bg-gray-800/20', border: 'border-gray-700/30' },
  ];

  return (
    <div className="flex flex-col h-full">
      <SimulationBanner />
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-5">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {statCards.map((s) => (
            <div key={s.label} className={`${s.bg} border ${s.border} rounded-xl p-3.5`}>
              <div className="flex items-center justify-between mb-2">
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <p className="text-xl font-bold text-text-primary">{s.value}</p>
              <p className="text-[11px] text-text-muted mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Map + Emergency Queue */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Map */}
          <div className="xl:col-span-2 h-[400px] lg:h-[450px] rounded-xl border border-border-default overflow-hidden">
            <LiveMap compact />
          </div>

          {/* Active Emergency Queue */}
          <div className="bg-surface-raised border border-border-default rounded-xl flex flex-col">
            <div className="p-3 border-b border-border-subtle flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <h2 className="text-sm font-semibold text-text-primary">Active Emergencies</h2>
              </div>
              <button onClick={() => setCurrentPage('incidents')} className="text-xs text-accent hover:underline flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {activeEmergencies.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
                  <p className="text-sm text-text-secondary">No active emergencies</p>
                </div>
              ) : (
                activeEmergencies.map((inc) => (
                  <button
                    key={inc.id}
                    onClick={() => setSelectedIncident(inc)}
                    className={`w-full text-left p-3 rounded-lg border transition-all hover:brightness-110 ${
                      inc.priority === 'critical' ? 'bg-red-900/20 border-red-800/40 animate-pulse-danger' : 'bg-navy-800 border-border-subtle hover:border-border-default'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <IncidentTypeIcon type={inc.type} className={`w-4 h-4 ${inc.priority === 'critical' ? 'text-red-400' : 'text-amber-400'}`} />
                        <span className="text-xs font-mono font-semibold text-text-primary">{inc.id}</span>
                      </div>
                      <PriorityBadge priority={inc.priority} />
                    </div>
                    <p className="text-xs text-text-secondary mb-1.5 line-clamp-2">{inc.notes}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-text-muted">{inc.location.split(',').slice(0, 2).join(',')}</span>
                      <StatusBadge status={inc.status} />
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Bottom row: Activity Feed + Device Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Recent Activity Feed */}
          <div className="bg-surface-raised border border-border-default rounded-xl flex flex-col">
            <div className="p-3 border-b border-border-subtle flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" />
              <h2 className="text-sm font-semibold text-text-primary">Recent Activity</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-2 max-h-[280px]">
              {recentIncidents.map((inc) => {
                const lastEvent = inc.timeline[inc.timeline.length - 1];
                return (
                  <div key={inc.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-navy-800/50 transition-colors">
                    <div className={`mt-0.5 p-1.5 rounded-lg ${inc.priority === 'critical' ? 'bg-red-900/30' : 'bg-navy-800'}`}>
                      <IncidentTypeIcon type={inc.type} className={`w-3.5 h-3.5 ${inc.priority === 'critical' ? 'text-red-400' : 'text-text-muted'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-mono font-semibold text-text-primary">{inc.id}</span>
                        <StatusBadge status={inc.status} />
                      </div>
                      <p className="text-[11px] text-text-muted truncate">{lastEvent?.action} — {lastEvent?.details}</p>
                    </div>
                    <span className="text-[10px] text-text-muted flex-shrink-0">
                      {new Date(inc.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Vehicle / Device Summary */}
          <div className="bg-surface-raised border border-border-default rounded-xl flex flex-col">
            <div className="p-3 border-b border-border-subtle flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bus className="w-4 h-4 text-blue-400" />
                <h2 className="text-sm font-semibold text-text-primary">Fleet Status</h2>
              </div>
              <button onClick={() => setCurrentPage('vehicles')} className="text-xs text-accent hover:underline flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 max-h-[280px]">
              {vehicles.slice(0, 6).map((v) => (
                <div key={v.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-navy-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <VehicleStatusDot status={v.status} />
                    <div>
                      <p className="text-xs font-mono font-semibold text-text-primary">{v.plateNumber}</p>
                      <p className="text-[11px] text-text-muted">{v.driver}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-text-secondary">{v.speed} km/h</p>
                    <p className="text-[11px] text-text-muted">{v.passengers} pax</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
