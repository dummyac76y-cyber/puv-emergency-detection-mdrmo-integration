import { Radio, Phone, MapPin, AlertTriangle, Siren } from 'lucide-react';
import { useState } from 'react';

export default function EmergencyBar() {
  const [sosActive, setSosActive] = useState(false);

  return (
    <div className="bg-command-card border border-command-border rounded-xl p-3 flex items-center justify-between flex-wrap gap-2">
      <div className="flex items-center gap-2">
        <Siren className="w-4 h-4 text-red-400" />
        <span className="text-xs font-bold text-white uppercase tracking-wider">Quick Actions</span>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setSosActive(!sosActive)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            sosActive
              ? 'bg-red-600 text-white alert-pulse-red'
              : 'bg-red-900/30 text-red-400 border border-red-700/50 hover:bg-red-900/50'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          BROADCAST SOS
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-900/30 text-amber-400 border border-amber-700/50 hover:bg-amber-900/50 transition-all">
          <Phone className="w-3.5 h-3.5" />
          Contact All Drivers
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-900/30 text-blue-400 border border-blue-700/50 hover:bg-blue-900/50 transition-all">
          <MapPin className="w-3.5 h-3.5" />
          Roll Call
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-900/30 text-purple-400 border border-purple-700/50 hover:bg-purple-900/50 transition-all">
          <AlertTriangle className="w-3.5 h-3.5" />
          Incident Report
        </button>
      </div>
    </div>
  );
}
