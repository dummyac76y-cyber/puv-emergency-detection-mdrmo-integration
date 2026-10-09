import { useState } from 'react';
import Header from './components/Header';
import StatsBar from './components/StatsBar';
import MapView from './components/MapView';
import AlertsPanel from './components/AlertsPanel';
import VehicleList from './components/VehicleList';
import IncidentModal from './components/IncidentModal';
import ResponsePanel from './components/ResponsePanel';
import ActivityLog from './components/ActivityLog';
import EmergencyBar from './components/EmergencyBar';
import { mockVehicles, mockAlerts, mockStats } from './data/mockData';
import { Alert } from './types';
import { Bell, Settings, LogOut, User, Menu, X } from 'lucide-react';

export default function App() {
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [alerts, setAlerts] = useState(mockAlerts);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleAcknowledge = (alertId: string) => {
    setAlerts(prev => prev.map(a => 
      a.id === alertId ? { ...a, status: 'acknowledged' as const } : a
    ));
  };

  const handleDispatch = (alertId: string, team: string) => {
    setAlerts(prev => prev.map(a => 
      a.id === alertId ? { ...a, status: 'acknowledged' as const, responseTeam: team } : a
    ));
    setSelectedAlert(null);
  };

  const handleSelectVehicle = (id: string) => {
    setSelectedVehicle(selectedVehicle === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-command-bg flex flex-col">
      {/* Header */}
      <Header />

      {/* User Menu Button - Top Right */}
      <button
        onClick={() => setShowUserMenu(!showUserMenu)}
        className="fixed top-3 right-4 z-40 w-9 h-9 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors shadow-lg"
      >
        <User className="w-4 h-4 text-white" />
      </button>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Mobile Menu Toggle */}
        <button
          className="lg:hidden fixed bottom-4 right-4 z-40 bg-blue-600 text-white p-3 rounded-full shadow-lg"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Left Sidebar - Alerts */}
        <aside className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 fixed lg:relative z-30 lg:z-auto
          w-80 lg:w-80 h-full lg:h-auto
          transition-transform duration-300 ease-in-out
          bg-command-bg lg:bg-transparent
          overflow-y-auto
        `}>
          <div className="p-3 space-y-3 h-full">
            <AlertsPanel
              alerts={alerts}
              vehicles={mockVehicles}
              onSelectAlert={(alert) => setSelectedAlert(alert)}
              onAcknowledge={handleAcknowledge}
            />
          </div>
        </aside>

        {/* Center Content - Map & Stats */}
        <main className="flex-1 flex flex-col overflow-hidden p-3 space-y-3">
          {/* Stats Bar */}
          <StatsBar stats={mockStats} />

          {/* Emergency Actions */}
          <EmergencyBar />

          {/* Map */}
          <div className="flex-1 min-h-[300px]">
            <MapView
              vehicles={mockVehicles}
              alerts={alerts}
              selectedVehicle={selectedVehicle}
              onSelectVehicle={handleSelectVehicle}
            />
          </div>

          {/* Bottom Panels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <ResponsePanel />
            <ActivityLog />
          </div>
        </main>

        {/* Right Sidebar - Vehicles */}
        <aside className="hidden lg:block w-72 overflow-y-auto p-3">
          <VehicleList
            vehicles={mockVehicles}
            selectedVehicle={selectedVehicle}
            onSelectVehicle={handleSelectVehicle}
          />
        </aside>
      </div>

      {/* Incident Modal */}
      {selectedAlert && (
        <IncidentModal
          alert={selectedAlert}
          vehicle={mockVehicles.find(v => v.id === selectedAlert.vehicleId)}
          onClose={() => setSelectedAlert(null)}
          onDispatch={handleDispatch}
        />
      )}

      {/* User Menu Overlay */}
      {showUserMenu && (
        <div className="fixed inset-0 z-50" onClick={() => setShowUserMenu(false)}>
          <div className="absolute top-16 right-4 bg-command-surface border border-command-border rounded-xl shadow-2xl w-64 p-2 fade-in">
            <div className="p-3 border-b border-command-border mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Admin Operator</p>
                  <p className="text-xs text-command-muted">MDRRMO Command</p>
                </div>
              </div>
            </div>
            <button className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-command-card text-sm text-command-text transition-colors">
              <Settings className="w-4 h-4" />
              System Settings
            </button>
            <button className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-command-card text-sm text-command-text transition-colors">
              <Bell className="w-4 h-4" />
              Notification Preferences
            </button>
            <hr className="border-command-border my-1" />
            <button className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-red-900/30 text-sm text-red-400 transition-colors">
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
