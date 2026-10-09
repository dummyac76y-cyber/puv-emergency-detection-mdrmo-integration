import { useState, useEffect } from 'react';
import { Shield, Wifi, Clock, AlertTriangle } from 'lucide-react';

export default function Header() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-command-surface border-b border-command-border px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="bg-blue-600 p-2 rounded-lg">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white tracking-wide">
            PUV EMERGENCY COMMAND CENTER
          </h1>
          <p className="text-xs text-command-muted">
            Municipal Disaster Risk Reduction & Management Office (MDRRMO)
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* System Status */}
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 blink' : 'bg-red-500'}`} />
          <span className="text-xs text-command-muted flex items-center gap-1">
            <Wifi className="w-3 h-3" />
            {isConnected ? 'SYSTEM ONLINE' : 'DISCONNECTED'}
          </span>
        </div>

        {/* Alert Indicator */}
        <div className="flex items-center gap-2 bg-red-900/30 border border-red-800/50 rounded-lg px-3 py-1.5">
          <AlertTriangle className="w-4 h-4 text-red-400 blink" />
          <span className="text-xs font-semibold text-red-400">2 CRITICAL ALERTS</span>
        </div>

        {/* Time */}
        <div className="flex items-center gap-2 text-command-muted">
          <Clock className="w-4 h-4" />
          <span className="text-sm font-mono">
            {currentTime.toLocaleTimeString('en-US', { hour12: false })}
          </span>
          <span className="text-xs">
            {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>
    </header>
  );
}
