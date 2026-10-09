import { Bus, AlertCircle, AlertTriangle, Clock, Activity, TrendingUp } from 'lucide-react';
import { SystemStats } from '../types';

interface StatsBarProps {
  stats: SystemStats;
}

export default function StatsBar({ stats }: StatsBarProps) {
  const statItems = [
    {
      label: 'Total Vehicles',
      value: stats.totalVehicles,
      icon: Bus,
      color: 'text-blue-400',
      bg: 'bg-blue-900/20',
      border: 'border-blue-800/30',
    },
    {
      label: 'Active Vehicles',
      value: stats.activeVehicles,
      icon: Activity,
      color: 'text-green-400',
      bg: 'bg-green-900/20',
      border: 'border-green-800/30',
    },
    {
      label: 'Active Alerts',
      value: stats.activeAlerts,
      icon: AlertCircle,
      color: 'text-amber-400',
      bg: 'bg-amber-900/20',
      border: 'border-amber-800/30',
    },
    {
      label: 'Critical Alerts',
      value: stats.criticalAlerts,
      icon: AlertTriangle,
      color: 'text-red-400',
      bg: 'bg-red-900/20',
      border: 'border-red-800/30',
    },
    {
      label: 'Avg Response Time',
      value: stats.avgResponseTime,
      icon: Clock,
      color: 'text-purple-400',
      bg: 'bg-purple-900/20',
      border: 'border-purple-800/30',
    },
    {
      label: 'Incidents Today',
      value: stats.incidentsToday,
      icon: TrendingUp,
      color: 'text-orange-400',
      bg: 'bg-orange-900/20',
      border: 'border-orange-800/30',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 p-4">
      {statItems.map((item) => (
        <div
          key={item.label}
          className={`${item.bg} border ${item.border} rounded-xl p-3 flex items-center gap-3`}
        >
          <div className={`${item.color}`}>
            <item.icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-lg font-bold text-white">{item.value}</p>
            <p className="text-xs text-command-muted">{item.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
