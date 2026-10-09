import { createContext, useContext, useReducer, ReactNode, useCallback } from 'react';

import { alertsApi } from '@/services/api/alertsApi';
import { Alert } from '@/types';

import { alertsReducer, initialAlertsState, type AlertsState } from './alertsReducer';

interface AlertsContextType extends AlertsState {
  fetchAlerts: () => Promise<void>;
  addAlert: (alert: Omit<Alert, 'id'>) => Promise<Alert>;
  acknowledgeAlert: (id: string) => Promise<void>;
  removeAlert: (id: string) => Promise<void>;
  setFilters: (filters: Partial<AlertsState['filters']>) => void;
  setSort: (sort: AlertsState['sort']) => void;
  clearError: () => void;
}

const AlertsContext = createContext<AlertsContextType | null>(null);

export function AlertsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(alertsReducer, initialAlertsState);

  const fetchAlerts = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const data = await alertsApi.getAll();
      dispatch({ type: 'SET_ALERTS', payload: data });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to fetch alerts',
      });
    }
  }, []);

  const addAlert = useCallback(async (alert: Omit<Alert, 'id'>) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const newAlert = await alertsApi.create(alert);
      dispatch({ type: 'ADD_ALERT', payload: newAlert });
      return newAlert;
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to add alert',
      });
      throw error;
    }
  }, []);

  const acknowledgeAlert = useCallback(async (id: string) => {
    try {
      const acknowledgedAt = new Date().toISOString();
      await alertsApi.acknowledge(id);
      dispatch({ type: 'ACKNOWLEDGE_ALERT', payload: { id, acknowledgedAt } });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to acknowledge alert',
      });
      throw error;
    }
  }, []);

  const removeAlert = useCallback(async (id: string) => {
    try {
      await alertsApi.delete(id);
      dispatch({ type: 'REMOVE_ALERT', payload: id });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to remove alert',
      });
      throw error;
    }
  }, []);

  const setFilters = useCallback((filters: Partial<AlertsState['filters']>) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  const setSort = useCallback((sort: AlertsState['sort']) => {
    dispatch({ type: 'SET_SORT', payload: sort });
  }, []);

  const clearError = useCallback(() => dispatch({ type: 'CLEAR_ERROR' }), []);

  return (
    <AlertsContext.Provider
      value={{
        ...state,
        fetchAlerts,
        addAlert,
        acknowledgeAlert,
        removeAlert,
        setFilters,
        setSort,
        clearError,
      }}
    >
      {children}
    </AlertsContext.Provider>
  );
}

export function useAlerts() {
  const ctx = useContext(AlertsContext);
  if (!ctx) throw new Error('useAlerts must be used within AlertsProvider');
  return ctx;
}
