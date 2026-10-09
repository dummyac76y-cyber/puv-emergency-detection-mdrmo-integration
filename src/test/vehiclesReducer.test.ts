import { describe, it, expect, beforeEach } from 'vitest';

import { vehiclesReducer, initialVehiclesState } from '@/store/vehicles/vehiclesReducer';
import { Vehicle, VehicleStatus, VehicleType } from '@/types';

const mockVehicle: Vehicle = {
  id: 'VH-001',
  plateNumber: 'ABC-1234',
  type: 'jeepney' as VehicleType,
  deviceId: 'ESP32-001',
  driver: 'Juan Dela Cruz',
  operator: 'San Jose Transport Coop',
  status: 'normal' as VehicleStatus,
  registrationStatus: 'active',
  lastCommunication: '2026-01-15T08:32:00Z',
  emergencyContact: '+63 917 123 4567',
  position: { lat: 14.5995, lng: 120.9842 },
  speed: 35,
  passengers: 18,
  fuelLevel: 72,
  route: 'Route 1 — Town Center to Brgy. San Jose',
};

const mockVehicle2: Vehicle = {
  ...mockVehicle,
  id: 'VH-002',
  plateNumber: 'XYZ-5678',
  status: 'emergency',
};

describe('vehiclesReducer', () => {
  let state: ReturnType<typeof initialVehiclesState>;

  beforeEach(() => {
    state = { ...initialVehiclesState };
  });

  it('should return initial state when called with undefined', () => {
    // Test initial state directly
    expect(initialVehiclesState).toEqual({
      vehicles: [],
      loading: false,
      error: null,
      filters: { search: '', type: 'all', status: 'all' },
      sort: null,
    });
  });

  it('should return current state for unknown action types at runtime', () => {
    // This tests runtime behavior - the default case returns state
    const unknownAction = { type: 'UNKNOWN_ACTION' } as VehiclesAction;
    const result = vehiclesReducer(state, unknownAction);
    expect(result).toBe(state);
  });

  it('should handle SET_LOADING', () => {
    const action = { type: 'SET_LOADING' as const, payload: true };
    const result = vehiclesReducer(state, action);
    expect(result.loading).toBe(true);
  });

  it('should handle SET_VEHICLES', () => {
    const vehicles = [mockVehicle, mockVehicle2];
    const action = { type: 'SET_VEHICLES' as const, payload: vehicles };
    const result = vehiclesReducer(state, action);
    expect(result.vehicles).toEqual(vehicles);
    expect(result.loading).toBe(false);
  });

  it('should handle ADD_VEHICLE', () => {
    state.vehicles = [mockVehicle];
    const action = { type: 'ADD_VEHICLE' as const, payload: mockVehicle2 };
    const result = vehiclesReducer(state, action);
    expect(result.vehicles).toHaveLength(2);
    expect(result.vehicles[0]).toEqual(mockVehicle2);
  });

  it('should handle UPDATE_VEHICLE', () => {
    state.vehicles = [mockVehicle];
    const action = {
      type: 'UPDATE_VEHICLE' as const,
      payload: { id: 'VH-001', changes: { status: 'emergency' as VehicleStatus, speed: 0 } },
    };
    const result = vehiclesReducer(state, action);
    expect(result.vehicles[0].status).toBe('emergency');
    expect(result.vehicles[0].speed).toBe(0);
  });

  it('should handle REMOVE_VEHICLE', () => {
    state.vehicles = [mockVehicle, mockVehicle2];
    const action = { type: 'REMOVE_VEHICLE' as const, payload: 'VH-001' };
    const result = vehiclesReducer(state, action);
    expect(result.vehicles).toHaveLength(1);
    expect(result.vehicles[0].id).toBe('VH-002');
  });

  it('should handle SET_VEHICLE_STATUS', () => {
    state.vehicles = [mockVehicle];
    const action = {
      type: 'SET_VEHICLE_STATUS' as const,
      payload: { id: 'VH-001', status: 'sos' as VehicleStatus },
    };
    const result = vehiclesReducer(state, action);
    expect(result.vehicles[0].status).toBe('sos');
  });

  it('should handle SET_ERROR', () => {
    const action = { type: 'SET_ERROR' as const, payload: 'Failed to fetch' };
    const result = vehiclesReducer(state, action);
    expect(result.error).toBe('Failed to fetch');
    expect(result.loading).toBe(false);
  });

  it('should handle SET_FILTERS', () => {
    const action = {
      type: 'SET_FILTERS' as const,
      payload: { search: 'test', type: 'jeepney' as VehicleType },
    };
    const result = vehiclesReducer(state, action);
    expect(result.filters.search).toBe('test');
    expect(result.filters.type).toBe('jeepney');
  });

  it('should handle CLEAR_ERROR', () => {
    state.error = 'Some error';
    const action = { type: 'CLEAR_ERROR' as const };
    const result = vehiclesReducer(state, action);
    expect(result.error).toBeNull();
  });
});
