import { createContext, useContext, useReducer, ReactNode, useCallback } from 'react';

import { incidentsApi } from '@/services/api/incidentsApi';
import { Incident, IncidentStatus, TimelineEntry } from '@/types';

import { incidentsReducer, initialIncidentsState, type IncidentsState } from './incidentsReducer';

interface IncidentsContextType extends IncidentsState {
  fetchIncidents: () => Promise<void>;
  addIncident: (incident: Omit<Incident, 'id'>) => Promise<Incident>;
  updateIncident: (id: string, changes: Partial<Incident>) => Promise<void>;
  updateIncidentStatus: (
    id: string,
    status: IncidentStatus,
    timelineEntry?: TimelineEntry
  ) => Promise<void>;
  removeIncident: (id: string) => Promise<void>;
  setSelectedIncident: (incident: Incident | null) => void;
  setFilters: (filters: Partial<IncidentsState['filters']>) => void;
  setSort: (sort: IncidentsState['sort']) => void;
  clearError: () => void;
}

const IncidentsContext = createContext<IncidentsContextType | null>(null);

export function IncidentsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(incidentsReducer, initialIncidentsState);

  const fetchIncidents = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const data = await incidentsApi.getAll();
      dispatch({ type: 'SET_INCIDENTS', payload: data });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to fetch incidents',
      });
    }
  }, []);

  const addIncident = useCallback(async (incident: Omit<Incident, 'id'>) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const newIncident = await incidentsApi.create(incident);
      dispatch({ type: 'ADD_INCIDENT', payload: newIncident });
      return newIncident;
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to add incident',
      });
      throw error;
    }
  }, []);

  const updateIncident = useCallback(async (id: string, changes: Partial<Incident>) => {
    try {
      await incidentsApi.update(id, changes);
      dispatch({ type: 'UPDATE_INCIDENT', payload: { id, changes } });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to update incident',
      });
      throw error;
    }
  }, []);

  const updateIncidentStatus = useCallback(
    async (id: string, status: IncidentStatus, timelineEntry?: TimelineEntry) => {
      try {
        await incidentsApi.updateStatus(id, status);
        dispatch({ type: 'UPDATE_INCIDENT_STATUS', payload: { id, status, timelineEntry } });
      } catch (error) {
        dispatch({
          type: 'SET_ERROR',
          payload: error instanceof Error ? error.message : 'Failed to update incident status',
        });
        throw error;
      }
    },
    []
  );

  const removeIncident = useCallback(async (id: string) => {
    try {
      await incidentsApi.delete(id);
      dispatch({ type: 'REMOVE_INCIDENT', payload: id });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to remove incident',
      });
      throw error;
    }
  }, []);

  const setSelectedIncident = useCallback((incident: Incident | null) => {
    dispatch({ type: 'SET_SELECTED_INCIDENT', payload: incident });
  }, []);

  const setFilters = useCallback((filters: Partial<IncidentsState['filters']>) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  const setSort = useCallback((sort: IncidentsState['sort']) => {
    dispatch({ type: 'SET_SORT', payload: sort });
  }, []);

  const clearError = useCallback(() => dispatch({ type: 'CLEAR_ERROR' }), []);

  return (
    <IncidentsContext.Provider
      value={{
        ...state,
        fetchIncidents,
        addIncident,
        updateIncident,
        updateIncidentStatus,
        removeIncident,
        setSelectedIncident,
        setFilters,
        setSort,
        clearError,
      }}
    >
      {children}
    </IncidentsContext.Provider>
  );
}

export function useIncidents() {
  const ctx = useContext(IncidentsContext);
  if (!ctx) throw new Error('useIncidents must be used within IncidentsProvider');
  return ctx;
}
