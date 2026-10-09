import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Incident, Alert, Vehicle, IncidentStatus, SystemStats } from '../types';
import { mockVehicles, mockIncidents, mockAlerts, mockStats } from '../data/mockData';

interface AppState {
  vehicles: Vehicle[];
  incidents: Incident[];
  alerts: Alert[];
  stats: SystemStats;
  currentPage: string;
  sidebarCollapsed: boolean;
  simulationMode: boolean;
  selectedIncident: Incident | null;
  selectedVehicle: Vehicle | null;
  notification: { message: string; type: 'success' | 'error' | 'warning' | 'info' } | null;
}

interface AppContextType extends AppState {
  setCurrentPage: (page: string) => void;
  toggleSidebar: () => void;
  acknowledgeAlert: (alertId: string) => void;
  updateIncidentStatus: (incidentId: string, status: IncidentStatus) => void;
  setSelectedIncident: (incident: Incident | null) => void;
  setSelectedVehicle: (vehicle: Vehicle | null) => void;
  showNotification: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
  clearNotification: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [vehicles] = useState<Vehicle[]>(mockVehicles);
  const [incidents, setIncidents] = useState<Incident[]>(mockIncidents);
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [stats] = useState<SystemStats>(mockStats);
  const [currentPage, setCurrentPage] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [notification, setNotification] = useState<AppState['notification']>(null);

  const toggleSidebar = useCallback(() => setSidebarCollapsed(p => !p), []);

  const acknowledgeAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(a =>
      a.id === alertId ? { ...a, acknowledged: true, acknowledgedAt: new Date().toISOString() } : a
    ));
    showNotification('Alert acknowledged', 'success');
  }, []);

  const updateIncidentStatus = useCallback((incidentId: string, status: IncidentStatus) => {
    setIncidents(prev => prev.map(inc => {
      if (inc.id !== incidentId) return inc;
      const newTimeline = [...inc.timeline, {
        timestamp: new Date().toISOString(),
        action: `Status changed to ${status}`,
        actor: 'Operator Admin',
        details: `Incident marked as ${status}.`,
      }];
      return { ...inc, status, timeline: newTimeline };
    }));
    if (selectedIncident?.id === incidentId) {
      setSelectedIncident(prev => prev ? { ...prev, status } : null);
    }
    showNotification(`Incident ${incidentId} updated to ${status}`, 'success');
  }, [selectedIncident]);

  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  }, []);

  const clearNotification = useCallback(() => setNotification(null), []);

  return (
    <AppContext.Provider value={{
      vehicles, incidents, alerts, stats, currentPage, sidebarCollapsed,
      simulationMode: true, selectedIncident, selectedVehicle, notification,
      setCurrentPage, toggleSidebar, acknowledgeAlert, updateIncidentStatus,
      setSelectedIncident, setSelectedVehicle, showNotification, clearNotification,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
