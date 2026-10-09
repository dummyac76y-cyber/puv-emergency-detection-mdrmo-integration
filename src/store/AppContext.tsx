import { createContext, useContext, useReducer, ReactNode } from 'react';

import { mockVehicles, mockIncidents, mockAlerts, mockStats } from '@/data/mockData';
import { AlertsProvider } from '@/store/alerts';
import { AuthProvider } from '@/store/auth';
import { DevicesProvider } from '@/store/devices';
import { IncidentsProvider } from '@/store/incidents';
import { MapProvider } from '@/store/map';
import { UIProvider } from '@/store/ui';
import { VehiclesProvider } from '@/store/vehicles';
import { Incident, Alert, Vehicle, IncidentStatus, SystemStats } from '@/types';

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

type AppAction =
  | { type: 'SET_CURRENT_PAGE'; payload: string }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_SIDEBAR_COLLAPSED'; payload: boolean }
  | { type: 'SET_SIMULATION_MODE'; payload: boolean }
  | { type: 'ACKNOWLEDGE_ALERT'; payload: string }
  | { type: 'UPDATE_INCIDENT_STATUS'; payload: { incidentId: string; status: IncidentStatus } }
  | { type: 'SET_SELECTED_INCIDENT'; payload: Incident | null }
  | { type: 'SET_SELECTED_VEHICLE'; payload: Vehicle | null }
  | {
      type: 'SHOW_NOTIFICATION';
      payload: { message: string; type: 'success' | 'error' | 'warning' | 'info' };
    }
  | { type: 'CLEAR_NOTIFICATION' };

const initialState: AppState = {
  vehicles: mockVehicles,
  incidents: mockIncidents,
  alerts: mockAlerts,
  stats: mockStats,
  currentPage: 'overview',
  sidebarCollapsed: false,
  simulationMode: true,
  selectedIncident: null,
  selectedVehicle: null,
  notification: null,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_CURRENT_PAGE':
      return { ...state, currentPage: action.payload };
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };
    case 'SET_SIDEBAR_COLLAPSED':
      return { ...state, sidebarCollapsed: action.payload };
    case 'SET_SIMULATION_MODE':
      return { ...state, simulationMode: action.payload };
    case 'ACKNOWLEDGE_ALERT':
      return {
        ...state,
        alerts: state.alerts.map((a) =>
          a.id === action.payload
            ? { ...a, acknowledged: true, acknowledgedAt: new Date().toISOString() }
            : a
        ),
      };
    case 'UPDATE_INCIDENT_STATUS': {
      const newTimelineEntry = {
        timestamp: new Date().toISOString(),
        action: `Status changed to ${action.payload.status}`,
        actor: 'Operator Admin',
        details: `Incident marked as ${action.payload.status}.`,
      };
      return {
        ...state,
        incidents: state.incidents.map((inc) =>
          inc.id === action.payload.incidentId
            ? {
                ...inc,
                status: action.payload.status,
                timeline: [...inc.timeline, newTimelineEntry],
              }
            : inc
        ),
        selectedIncident:
          state.selectedIncident?.id === action.payload.incidentId
            ? {
                ...state.selectedIncident,
                status: action.payload.status,
                timeline: [...state.selectedIncident.timeline, newTimelineEntry],
              }
            : state.selectedIncident,
      };
    }
    case 'SET_SELECTED_INCIDENT':
      return { ...state, selectedIncident: action.payload };
    case 'SET_SELECTED_VEHICLE':
      return { ...state, selectedVehicle: action.payload };
    case 'SHOW_NOTIFICATION':
      return { ...state, notification: action.payload };
    case 'CLEAR_NOTIFICATION':
      return { ...state, notification: null };
    default:
      return state;
  }
}

const AppContext = createContext<
  | (AppState & {
      setCurrentPage: (page: string) => void;
      toggleSidebar: () => void;
      acknowledgeAlert: (alertId: string) => void;
      updateIncidentStatus: (incidentId: string, status: IncidentStatus) => void;
      setSelectedIncident: (incident: Incident | null) => void;
      setSelectedVehicle: (vehicle: Vehicle | null) => void;
      showNotification: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
      clearNotification: () => void;
      fetchData: () => Promise<void>;
    })
  | null
>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const setCurrentPage = (page: string) => dispatch({ type: 'SET_CURRENT_PAGE', payload: page });
  const toggleSidebar = () => dispatch({ type: 'TOGGLE_SIDEBAR' });
  const acknowledgeAlert = (alertId: string) =>
    dispatch({ type: 'ACKNOWLEDGE_ALERT', payload: alertId });
  const updateIncidentStatus = (incidentId: string, status: IncidentStatus) =>
    dispatch({ type: 'UPDATE_INCIDENT_STATUS', payload: { incidentId, status } });
  const setSelectedIncident = (incident: Incident | null) =>
    dispatch({ type: 'SET_SELECTED_INCIDENT', payload: incident });
  const setSelectedVehicle = (vehicle: Vehicle | null) =>
    dispatch({ type: 'SET_SELECTED_VEHICLE', payload: vehicle });
  const showNotification = (message: string, type: 'success' | 'error' | 'warning' | 'info') =>
    dispatch({ type: 'SHOW_NOTIFICATION', payload: { message, type } });
  const clearNotification = () => dispatch({ type: 'CLEAR_NOTIFICATION' });
  const fetchData = async () => {
    // In production, this would fetch from Supabase
    // For now, it's a no-op since we use mock data
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        setCurrentPage,
        toggleSidebar,
        acknowledgeAlert,
        updateIncidentStatus,
        setSelectedIncident,
        setSelectedVehicle,
        showNotification,
        clearNotification,
        fetchData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <VehiclesProvider>
        <IncidentsProvider>
          <AlertsProvider>
            <DevicesProvider>
              <UIProvider>
                <MapProvider>
                  <AppProvider>{children}</AppProvider>
                </MapProvider>
              </UIProvider>
            </DevicesProvider>
          </AlertsProvider>
        </IncidentsProvider>
      </VehiclesProvider>
    </AuthProvider>
  );
}
