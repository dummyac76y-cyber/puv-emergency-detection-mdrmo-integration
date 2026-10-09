import { Shield, CheckCircle, Truck, Clock } from 'lucide-react';

export default function ResponsePanel() {
  const teams = [
    { id: 't1', name: 'Team Alpha', status: 'dispatched', eta: '3 min', icon: Truck },
    { id: 't2', name: 'Team Bravo', status: 'available', eta: '-', icon: Shield },
    { id: 't3', name: 'Team Charlie', status: 'on-scene', eta: '0 min', icon: CheckCircle },
    { id: 't4', name: 'Medical Unit 1', status: 'dispatched', eta: '5 min', icon: Truck },
    { id: 't5', name: 'Fire Rescue 2', status: 'available', eta: '-', icon: Shield },
  ];

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'dispatched': return { dot: 'bg-amber-400', text: 'text-amber-400', label: 'En Route' };
      case 'available': return { dot: 'bg-green-400', text: 'text-green-400', label: 'Available' };
      case 'on-scene': return { dot: 'bg-blue-400', text: 'text-blue-400', label: 'On Scene' };
      default: return { dot: 'bg-gray-400', text: 'text-gray-400', label: 'Unknown' };
    }
  };

  return (
    <div className="bg-command-card border border-command-border rounded-xl flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-command-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-blue-400" />
          <h2 className="text-sm font-bold text-white">RESPONSE TEAMS</h2>
        </div>
        <span className="text-xs text-command-muted">
          {teams.filter(t => t.status === 'available').length} available
        </span>
      </div>

      {/* Teams List */}
      <div className="p-2 space-y-1.5">
        {teams.map((team) => {
          const styles = getStatusStyles(team.status);
          return (
            <div
              key={team.id}
              className="flex items-center justify-between p-2 rounded-lg bg-command-surface/50 hover:bg-command-surface transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${styles.dot} ${team.status === 'dispatched' ? 'blink' : ''}`} />
                <span className="text-xs font-medium text-command-text">{team.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-medium ${styles.text}`}>{styles.label}</span>
                {team.status === 'dispatched' && (
                  <span className="flex items-center gap-0.5 text-[10px] text-amber-400">
                    <Clock className="w-3 h-3" />
                    {team.eta}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
