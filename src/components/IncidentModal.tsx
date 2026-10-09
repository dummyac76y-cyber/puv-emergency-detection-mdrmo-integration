import { Alert, Vehicle } from '../types';
import { X, AlertTriangle, MapPin, Clock, Car, Users, Phone, Radio, Shield, Send } from 'lucide-react';
import { useState } from 'react';

interface IncidentModalProps {
  alert: Alert;
  vehicle: Vehicle | undefined;
  onClose: () => void;
  onDispatch: (alertId: string, team: string) => void;
}

export default function IncidentModal({ alert, vehicle, onClose, onDispatch }: IncidentModalProps) {
  const [selectedTeam, setSelectedTeam] = useState('');
  const [note, setNote] = useState('');

  const responseTeams = [
    { id: 't1', name: 'Team Alpha', status: 'dispatched' },
    { id: 't2', name: 'Team Bravo', status: 'available' },
    { id: 't3', name: 'Medical Unit 1', status: 'dispatched' },
    { id: 't4', name: 'Fire Rescue 2', status: 'available' },
    { id: 't5', name: 'Police Escort', status: 'available' },
  ];

  const getSeverityColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-900/30 border-red-700';
      case 'high': return 'text-orange-400 bg-orange-900/30 border-orange-700';
      case 'medium': return 'text-amber-400 bg-amber-900/30 border-amber-700';
      case 'low': return 'text-blue-400 bg-blue-900/30 border-blue-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm fade-in">
      <div className="bg-command-surface border border-command-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Modal Header */}
        <div className={`p-4 border-b border-command-border flex items-center justify-between ${
          alert.severity === 'critical' ? 'bg-red-900/20' : ''
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg border ${getSeverityColor(alert.severity)}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                INCIDENT #{alert.id.toUpperCase()}
              </h2>
              <p className="text-xs text-command-muted capitalize">
                {alert.severity} severity • {alert.type}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-command-card transition-colors text-command-muted hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-4">
          {/* Alert Message */}
          <div className="bg-command-card rounded-lg p-3 border border-command-border">
            <p className="text-sm text-command-text leading-relaxed">
              {alert.message}
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-command-card rounded-lg p-3 border border-command-border">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-command-muted">Location</span>
              </div>
              <p className="text-sm text-white">{alert.location}</p>
            </div>
            <div className="bg-command-card rounded-lg p-3 border border-command-border">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-command-muted">Time</span>
              </div>
              <p className="text-sm text-white">
                {new Date(alert.timestamp).toLocaleString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: false,
                })}
              </p>
            </div>
            {vehicle && (
              <>
                <div className="bg-command-card rounded-lg p-3 border border-command-border">
                  <div className="flex items-center gap-2 mb-1">
                    <Car className="w-4 h-4 text-green-400" />
                    <span className="text-xs text-command-muted">Vehicle</span>
                  </div>
                  <p className="text-sm text-white font-mono">{vehicle.plateNumber}</p>
                  <p className="text-xs text-command-muted">{vehicle.driver}</p>
                </div>
                <div className="bg-command-card rounded-lg p-3 border border-command-border">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-amber-400" />
                    <span className="text-xs text-command-muted">Passengers</span>
                  </div>
                  <p className="text-sm text-white">{vehicle.passengers} on board</p>
                </div>
              </>
            )}
          </div>

          {/* Response Teams */}
          <div className="bg-command-card rounded-lg p-3 border border-command-border">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-400" />
              Dispatch Response Team
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {responseTeams.map((team) => (
                <button
                  key={team.id}
                  onClick={() => setSelectedTeam(team.id)}
                  className={`p-2 rounded-lg border text-left text-xs transition-all ${
                    selectedTeam === team.id
                      ? 'bg-blue-900/40 border-blue-600 text-blue-300'
                      : team.status === 'available'
                      ? 'bg-command-surface border-command-border text-command-text hover:border-blue-600/50'
                      : 'bg-command-surface border-command-border text-command-muted opacity-60'
                  }`}
                >
                  <p className="font-medium">{team.name}</p>
                  <p className="text-[10px] capitalize mt-0.5">{team.status}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-2">
            <button className="flex items-center justify-center gap-2 p-2.5 bg-green-900/30 border border-green-700/50 rounded-lg text-green-400 text-xs font-medium hover:bg-green-900/50 transition-colors">
              <Phone className="w-4 h-4" />
              Call Driver
            </button>
            <button className="flex items-center justify-center gap-2 p-2.5 bg-amber-900/30 border border-amber-700/50 rounded-lg text-amber-400 text-xs font-medium hover:bg-amber-900/50 transition-colors">
              <Radio className="w-4 h-4" />
              Radio All
            </button>
            <button className="flex items-center justify-center gap-2 p-2.5 bg-red-900/30 border border-red-700/50 rounded-lg text-red-400 text-xs font-medium hover:bg-red-900/50 transition-colors">
              <AlertTriangle className="w-4 h-4" />
              Escalate
            </button>
          </div>

          {/* Notes */}
          <div className="bg-command-card rounded-lg p-3 border border-command-border">
            <h3 className="text-sm font-bold text-white mb-2">Incident Notes</h3>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add notes about this incident..."
              className="w-full bg-command-surface border border-command-border rounded-lg p-2 text-sm text-command-text placeholder-command-muted resize-none h-20 focus:outline-none focus:border-blue-600"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-command-border flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-command-muted hover:text-white transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              if (selectedTeam) {
                onDispatch(alert.id, selectedTeam);
              }
            }}
            disabled={!selectedTeam}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Send className="w-4 h-4" />
            Dispatch Team
          </button>
        </div>
      </div>
    </div>
  );
}
