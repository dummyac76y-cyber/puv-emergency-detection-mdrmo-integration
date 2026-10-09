import { describe, it, expect, beforeEach } from 'vitest';

import { alertsReducer, initialAlertsState } from '@/store/alerts/alertsReducer';
import { Alert, IncidentType, IncidentPriority } from '@/types';

const mockAlert: Alert = {
  id: 'ALT-001',
  incidentId: 'INC-2026-001',
  vehicleId: 'VH-001',
  type: 'crash' as IncidentType,
  priority: 'critical' as IncidentPriority,
  message: 'CRASH — VH-001 at National Highway',
  timestamp: '2026-01-15T08:30:00Z',
  acknowledged: false,
};

const mockAlert2: Alert = {
  ...mockAlert,
  id: 'ALT-002',
  acknowledged: true,
  acknowledgedAt: '2026-01-15T08:31:00Z',
};

describe('alertsReducer', () => {
  let state: ReturnType<typeof initialAlertsState>;

  beforeEach(() => {
    state = { ...initialAlertsState };
  });

  it('should return initial state when called with undefined', () => {
    expect(initialAlertsState).toEqual({
      alerts: [],
      loading: false,
      error: null,
      filters: { search: '', status: 'all' },
      sort: null,
    });
  });

  it('should return current state for unknown action types at runtime', () => {
    const unknownAction = { type: 'UNKNOWN_ACTION' } as AlertsAction;
    const result = alertsReducer(state, unknownAction);
    expect(result).toBe(state);
  });

  it('should handle SET_LOADING', () => {
    const action = { type: 'SET_LOADING' as const, payload: true };
    const result = alertsReducer(state, action);
    expect(result.loading).toBe(true);
  });

  it('should handle SET_ALERTS', () => {
    const alerts = [mockAlert, mockAlert2];
    const action = { type: 'SET_ALERTS' as const, payload: alerts };
    const result = alertsReducer(state, action);
    expect(result.alerts).toEqual(alerts);
    expect(result.loading).toBe(false);
  });

  it('should handle ADD_ALERT', () => {
    state.alerts = [mockAlert];
    const action = { type: 'ADD_ALERT' as const, payload: mockAlert2 };
    const result = alertsReducer(state, action);
    expect(result.alerts).toHaveLength(2);
    expect(result.alerts[0]).toEqual(mockAlert2);
  });

  it('should handle ACKNOWLEDGE_ALERT', () => {
    state.alerts = [mockAlert];
    const action = {
      type: 'ACKNOWLEDGE_ALERT' as const,
      payload: { id: 'ALT-001', acknowledgedAt: '2026-01-15T08:31:00Z' },
    };
    const result = alertsReducer(state, action);
    expect(result.alerts[0].acknowledged).toBe(true);
    expect(result.alerts[0].acknowledgedAt).toBe('2026-01-15T08:31:00Z');
  });

  it('should handle REMOVE_ALERT', () => {
    state.alerts = [mockAlert, mockAlert2];
    const action = { type: 'REMOVE_ALERT' as const, payload: 'ALT-001' };
    const result = alertsReducer(state, action);
    expect(result.alerts).toHaveLength(1);
    expect(result.alerts[0].id).toBe('ALT-002');
  });

  it('should handle SET_ERROR', () => {
    const action = { type: 'SET_ERROR' as const, payload: 'Failed to fetch' };
    const result = alertsReducer(state, action);
    expect(result.error).toBe('Failed to fetch');
    expect(result.loading).toBe(false);
  });

  it('should handle SET_FILTERS', () => {
    const action = {
      type: 'SET_FILTERS' as const,
      payload: { search: 'crash', status: 'unacknowledged' },
    };
    const result = alertsReducer(state, action);
    expect(result.filters.search).toBe('crash');
    expect(result.filters.status).toBe('unacknowledged');
  });

  it('should handle CLEAR_ERROR', () => {
    state.error = 'Some error';
    const action = { type: 'CLEAR_ERROR' as const };
    const result = alertsReducer(state, action);
    expect(result.error).toBeNull();
  });
});
