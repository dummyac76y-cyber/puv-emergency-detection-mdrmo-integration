import { createContext, useContext, useReducer, ReactNode, useCallback } from 'react';

import { vehiclesApi } from '@/services/api/vehiclesApi';
import { Vehicle, VehicleStatus } from '@/types';

import { vehiclesReducer, initialVehiclesState, type VehiclesState } from './vehiclesReducer';

interface VehiclesContextType extends VehiclesState {
  fetchVehicles: () => Promise<void>;
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => Promise<Vehicle>;
  updateVehicle: (id: string, changes: Partial<Vehicle>) => Promise<void>;
  removeVehicle: (id: string) => Promise<void>;
  setVehicleStatus: (id: string, status: VehicleStatus) => Promise<void>;
  setFilters: (filters: Partial<VehiclesState['filters']>) => void;
  setSort: (sort: VehiclesState['sort']) => void;
  clearError: () => void;
}

const VehiclesContext = createContext<VehiclesContextType | null>(null);

export function VehiclesProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(vehiclesReducer, initialVehiclesState);

  const fetchVehicles = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const data = await vehiclesApi.getAll();
      dispatch({ type: 'SET_VEHICLES', payload: data });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to fetch vehicles',
      });
    }
  }, []);

  const addVehicle = useCallback(async (vehicle: Omit<Vehicle, 'id'>) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const newVehicle = await vehiclesApi.create(vehicle);
      dispatch({ type: 'ADD_VEHICLE', payload: newVehicle });
      return newVehicle;
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to add vehicle',
      });
      throw error;
    }
  }, []);

  const updateVehicle = useCallback(async (id: string, changes: Partial<Vehicle>) => {
    try {
      await vehiclesApi.update(id, changes);
      dispatch({ type: 'UPDATE_VEHICLE', payload: { id, changes } });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to update vehicle',
      });
      throw error;
    }
  }, []);

  const removeVehicle = useCallback(async (id: string) => {
    try {
      await vehiclesApi.delete(id);
      dispatch({ type: 'REMOVE_VEHICLE', payload: id });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to remove vehicle',
      });
      throw error;
    }
  }, []);

  const setVehicleStatus = useCallback(async (id: string, status: VehicleStatus) => {
    try {
      await vehiclesApi.update(id, { status });
      dispatch({ type: 'SET_VEHICLE_STATUS', payload: { id, status } });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to update vehicle status',
      });
      throw error;
    }
  }, []);

  const setFilters = useCallback((filters: Partial<VehiclesState['filters']>) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  const setSort = useCallback((sort: VehiclesState['sort']) => {
    dispatch({ type: 'SET_SORT', payload: sort });
  }, []);

  const clearError = useCallback(() => dispatch({ type: 'CLEAR_ERROR' }), []);

  return (
    <VehiclesContext.Provider
      value={{
        ...state,
        fetchVehicles,
        addVehicle,
        updateVehicle,
        removeVehicle,
        setVehicleStatus,
        setFilters,
        setSort,
        clearError,
      }}
    >
      {children}
    </VehiclesContext.Provider>
  );
}

export function useVehicles() {
  const ctx = useContext(VehiclesContext);
  if (!ctx) throw new Error('useVehicles must be used within VehiclesProvider');
  return ctx;
}
