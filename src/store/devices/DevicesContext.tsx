import { createContext, useContext, useReducer, ReactNode, useCallback } from 'react';

import { devicesApi } from '@/services/api/devicesApi';
import { DeviceHealth, DeviceStatus } from '@/types';

import { devicesReducer, initialDevicesState, type DevicesState } from './devicesReducer';

interface DevicesContextType extends DevicesState {
  fetchDevices: () => Promise<void>;
  updateDevice: (id: string, changes: Partial<DeviceHealth>) => Promise<void>;
  setDeviceStatus: (id: string, status: DeviceStatus) => Promise<void>;
  setFilters: (filters: Partial<DevicesState['filters']>) => void;
  clearError: () => void;
}

const DevicesContext = createContext<DevicesContextType | null>(null);

export function DevicesProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(devicesReducer, initialDevicesState);

  const fetchDevices = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const data = await devicesApi.getAll();
      dispatch({ type: 'SET_DEVICES', payload: data });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to fetch devices',
      });
    }
  }, []);

  const updateDevice = useCallback(async (id: string, changes: Partial<DeviceHealth>) => {
    try {
      await devicesApi.update(id, changes);
      dispatch({ type: 'UPDATE_DEVICE', payload: { id, changes } });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to update device',
      });
      throw error;
    }
  }, []);

  const setDeviceStatus = useCallback(async (id: string, status: DeviceStatus) => {
    try {
      await devicesApi.update(id, { status });
      dispatch({ type: 'SET_DEVICE_STATUS', payload: { id, status } });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to update device status',
      });
      throw error;
    }
  }, []);

  const setFilters = useCallback((filters: Partial<DevicesState['filters']>) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  const clearError = useCallback(() => dispatch({ type: 'CLEAR_ERROR' }), []);

  return (
    <DevicesContext.Provider
      value={{
        ...state,
        fetchDevices,
        updateDevice,
        setDeviceStatus,
        setFilters,
        clearError,
      }}
    >
      {children}
    </DevicesContext.Provider>
  );
}

export function useDevices() {
  const ctx = useContext(DevicesContext);
  if (!ctx) throw new Error('useDevices must be used within DevicesProvider');
  return ctx;
}
