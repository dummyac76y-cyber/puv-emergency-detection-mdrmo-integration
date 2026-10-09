import { Activity, CheckCircle, AlertTriangle, Truck, Radio, Clock } from 'lucide-react';

export default function ActivityLog() {
  const activities = [
    { id: 1, type: 'alert', message: 'Crash detected — PUV-1563', time: '08:30', icon: AlertTriangle, color: 'text-red-400' },
    { id: 2, type: 'dispatch', message: 'Team Alpha dispatched to incident', time: '08:31', icon: Truck, color: 'text-amber-400' },
    { id: 3, type: 'sos', message: 'SOS button activated — PUV-1563', time: '08:28', icon: Radio, color: 'text-red-400' },
    { id: 4, type: 'dispatch', message: 'Medical Unit 1 dispatched', time: '08:31', icon: Truck, color: 'text-amber-400' },
    { id: 5, type: 'acknowledge', message: 'Overspeed alert acknowledged', time: '08:29', icon: CheckCircle, color: 'text-green-400' },
    { id: 6, type: 'alert', message: 'Geofence breach — PUV-6234', time: '08:25', icon: AlertTriangle, color: 'text-amber-400' },
    { id: 7, type: 'acknowledge', message: 'Geofence alert acknowledged', time: '08:26', icon: CheckCircle, color: 'text-green-400' },
    { id: 8, type: 'resolved', message: 'Engine diagnostic resolved — PUV-3291', time: '08:22', icon: CheckCircle, color: 'text-green-400' },
    { id: 9, type: 'dispatch', message: 'Team Charlie arrived on scene', time: '08:33', icon: Truck, color: 'text-blue-400' },
    { id: 10, type: 'alert', message: 'Overspeed warning — PUV-4102', time: '08:29', icon: AlertTriangle, color: 'text-orange-400' },
  ];

  return (
    <div className="bg-command-card border border-command-border rounded-xl flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-command-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-400" />
          <h2 className="text-sm font-bold text-white">ACTIVITY LOG</h2>
        </div>
        <span className="text-xs text-command-muted flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Live
        </span>
      </div>

      {/* Activity List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 max-h-[250px]">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-2 p-1.5 rounded hover:bg-command-surface/50 transition-colors"
          >
            <activity.icon className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${activity.color}`} />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-command-text truncate">{activity.message}</p>
              <p className="text-[10px] text-command-muted">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
