import { Alert, Vehicle } from '../types';
import { AlertTriangle, Car, Radio, MapPin, Clock, CheckCircle, Eye } from 'lucide-react';

interface AlertsPanelProps {
  alerts: Alert[];
  vehicles: Vehicle[];
  onSelectAlert: (alert: Alert) => void;
  onAcknowledge: (alertId: string) => void;
}

export default function AlertsPanel({ alerts, vehicles, onSelectAlert, onAcknowledge }: AlertsPanelProps) {
  const getSeverityStyles = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical': return { bg: 'bg-red-900/30', border: 'border-red-700/50', badge: 'bg-red-600', text: 'text-red-400' };
      case 'high': return { bg: 'bg-orange-900/30', border: 'border-orange-700/50', badge: 'bg-orange-600', text: 'text-orange-400' };
      case 'medium': return { bg: 'bg-amber-900/30', border: 'border-amber-700/50', badge: 'bg-amber-600', text: 'text-amber-400' };
      case 'low': return { bg: 'bg-blue-900/30', border: 'border-blue-700/50', badge: 'bg-blue-600', text: 'text-blue-400' };
    }
  };

  const getTypeIcon = (type: Alert['type']) => {
    switch (type) {
      case 'crash': return <AlertTriangle className="w-4 h-4" />;
      case 'sos': return <Radio className="w-4 h-4" />;
      case 'overspeed': return <Car className="w-4 h-4" />;
      case 'geofence': return <MapPin className="w-4 h-4" />;
      case 'engine': return <Car className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: Alert['type']) => {
    switch (type) {
      case 'crash': return 'CRASH DETECTED';
      case 'sos': return 'SOS ACTIVATED';
      case 'overspeed': return 'OVERSPEED';
      case 'geofence': return 'GEOFENCE BREACH';
      case 'engine': return 'ENGINE ALERT';
      default: return 'ALERT';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const getVehicle = (vehicleId: string) => vehicles.find(v => v.id === vehicleId);

  const sortedAlerts = [...alerts].sort((a, b) => {
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    const statusOrder = { active: 0, acknowledged: 1, resolved: 2 };
    if (statusOrder[a.status] !== statusOrder[b.status]) return statusOrder[a.status] - statusOrder[b.status];
    return severityOrder[a.severity] - severityOrder[b.severity];
  });

  return (
    <div className="bg-command-card border border-command-border rounded-xl flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-command-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <h2 className="text-sm font-bold text-white">ACTIVE ALERTS</h2>
          <span className="bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
            {alerts.filter(a => a.status === 'active').length}
          </span>
        </div>
        <span className="text-xs text-command-muted">
          {alerts.length} total
        </span>
      </div>

      {/* Alerts List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {sortedAlerts.map((alert) => {
          const styles = getSeverityStyles(alert.severity);
          const vehicle = getVehicle(alert.vehicleId);

          return (
            <div
              key={alert.id}
              className={`${styles.bg} border ${styles.border} rounded-lg p-3 fade-in cursor-pointer hover:brightness-110 transition-all ${
                alert.status === 'active' && alert.severity === 'critical' ? 'alert-pulse-red' : ''
              }`}
              onClick={() => onSelectAlert(alert)}
            >
              {/* Alert Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`${styles.text} ${alert.status === 'active' ? 'blink' : ''}`}>
                    {getTypeIcon(alert.type)}
                  </span>
                  <span className={`${styles.badge} text-white text-[10px] font-bold px-1.5 py-0.5 rounded`}>
                    {getTypeLabel(alert.type)}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-command-muted">
                  <Clock className="w-3 h-3" />
                  {formatTime(alert.timestamp)}
                </div>
              </div>

              {/* Alert Message */}
              <p className="text-xs text-command-text leading-relaxed mb-2 line-clamp-2">
                {alert.message}
              </p>

              {/* Alert Details */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-command-muted">
                  {vehicle && (
                    <span className="flex items-center gap-1">
                      <Car className="w-3 h-3" />
                      {vehicle.plateNumber}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {alert.location.split(',')[0]}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {alert.status === 'active' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onAcknowledge(alert.id); }}
                      className="flex items-center gap-1 text-xs bg-blue-600/30 text-blue-300 px-2 py-0.5 rounded hover:bg-blue-600/50 transition-colors"
                    >
                      <Eye className="w-3 h-3" />
                      ACK
                    </button>
                  )}
                  {alert.status === 'acknowledged' && (
                    <span className="flex items-center gap-1 text-xs text-green-400">
                      <CheckCircle className="w-3 h-3" />
                      ACK'd
                    </span>
                  )}
                  {alert.status === 'resolved' && (
                    <span className="flex items-center gap-1 text-xs text-green-500">
                      <CheckCircle className="w-3 h-3" />
                      Resolved
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
