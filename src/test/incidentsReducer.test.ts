import { describe, it, expect, beforeEach } from 'vitest';

import { incidentsReducer, initialIncidentsState } from '@/store/incidents/incidentsReducer';
import { Incident, IncidentStatus, IncidentPriority, IncidentType, TimelineEntry } from '@/types';

const mockIncident: Incident = {
  id: 'INC-2026-001',
  vehicleId: 'VH-001',
  vehicleType: 'jeepney',
  type: 'crash' as IncidentType,
  priority: 'critical' as IncidentPriority,
  status: 'new' as IncidentStatus,
  timestamp: '2026-01-15T08:30:00Z',
  location: 'National Highway, Km 12',
  coordinates: { lat: 14.6025, lng: 120.9902 },
  assignedResponder: 'Team Alpha',
  notes: 'Multi-vehicle collision',
  alertDeliveryMs: 1200,
  timeline: [
    {
      timestamp: '2026-01-15T08:30:00Z',
      action: 'Crash detected',
      actor: 'System',
      details: 'Impact sensor triggered',
    },
  ],
};

const mockIncident2: Incident = {
  ...mockIncident,
  id: 'INC-2026-002',
  status: 'acknowledged',
  priority: 'high',
};

const mockTimelineEntry: TimelineEntry = {
  timestamp: '2026-01-15T08:31:00Z',
  action: 'Status changed to acknowledged',
  actor: 'Operator Admin',
  details: 'Incident acknowledged by operator',
};

describe('incidentsReducer', () => {
  let state: ReturnType<typeof initialIncidentsState>;

  beforeEach(() => {
    state = { ...initialIncidentsState };
  });

  it('should return initial state when called with undefined', () => {
    expect(initialIncidentsState).toEqual({
      incidents: [],
      loading: false,
      error: null,
      filters: { search: '', status: 'all', priority: 'all', type: 'all' },
      sort: null,
      selectedIncident: null,
    });
  });

  it('should return current state for unknown action types at runtime', () => {
    const unknownAction = { type: 'UNKNOWN_ACTION' } as IncidentsAction;
    const result = incidentsReducer(state, unknownAction);
    expect(result).toBe(state);
  });

  it('should handle SET_LOADING', () => {
    const action = { type: 'SET_LOADING' as const, payload: true };
    const result = incidentsReducer(state, action);
    expect(result.loading).toBe(true);
  });

  it('should handle SET_INCIDENTS', () => {
    const incidents = [mockIncident, mockIncident2];
    const action = { type: 'SET_INCIDENTS' as const, payload: incidents };
    const result = incidentsReducer(state, action);
    expect(result.incidents).toEqual(incidents);
    expect(result.loading).toBe(false);
  });

  it('should handle ADD_INCIDENT', () => {
    state.incidents = [mockIncident];
    const action = { type: 'ADD_INCIDENT' as const, payload: mockIncident2 };
    const result = incidentsReducer(state, action);
    expect(result.incidents).toHaveLength(2);
    expect(result.incidents[0]).toEqual(mockIncident2);
  });

  it('should handle UPDATE_INCIDENT', () => {
    state.incidents = [mockIncident];
    const action = {
      type: 'UPDATE_INCIDENT' as const,
      payload: { id: 'INC-2026-001', changes: { notes: 'Updated notes' } },
    };
    const result = incidentsReducer(state, action);
    expect(result.incidents[0].notes).toBe('Updated notes');
  });

  it('should handle UPDATE_INCIDENT_STATUS with timeline', () => {
    state.incidents = [mockIncident];
    state.selectedIncident = mockIncident;
    const action = {
      type: 'UPDATE_INCIDENT_STATUS' as const,
      payload: {
        id: 'INC-2026-001',
        status: 'acknowledged' as IncidentStatus,
        timelineEntry: mockTimelineEntry,
      },
    };
    const result = incidentsReducer(state, action);
    expect(result.incidents[0].status).toBe('acknowledged');
    expect(result.incidents[0].timeline).toHaveLength(2);
    expect(result.incidents[0].timeline[1]).toEqual(mockTimelineEntry);
    expect(result.selectedIncident?.status).toBe('acknowledged');
  });

  it('should handle UPDATE_INCIDENT_STATUS without timeline (auto-generates)', () => {
    state.incidents = [mockIncident];
    const action = {
      type: 'UPDATE_INCIDENT_STATUS' as const,
      payload: { id: 'INC-2026-001', status: 'responding' as IncidentStatus },
    };
    const result = incidentsReducer(state, action);
    expect(result.incidents[0].status).toBe('responding');
    expect(result.incidents[0].timeline).toHaveLength(2);
    expect(result.incidents[0].timeline[1].action).toBe('Status changed to responding');
  });

  it('should handle REMOVE_INCIDENT', () => {
    state.incidents = [mockIncident, mockIncident2];
    const action = { type: 'REMOVE_INCIDENT' as const, payload: 'INC-2026-001' };
    const result = incidentsReducer(state, action);
    expect(result.incidents).toHaveLength(1);
    expect(result.incidents[0].id).toBe('INC-2026-002');
  });

  it('should handle SET_ERROR', () => {
    const action = { type: 'SET_ERROR' as const, payload: 'Failed to fetch' };
    const result = incidentsReducer(state, action);
    expect(result.error).toBe('Failed to fetch');
    expect(result.loading).toBe(false);
  });

  it('should handle SET_FILTERS', () => {
    const action = {
      type: 'SET_FILTERS' as const,
      payload: {
        search: 'crash',
        status: 'new' as IncidentStatus,
        priority: 'critical' as IncidentPriority,
      },
    };
    const result = incidentsReducer(state, action);
    expect(result.filters.search).toBe('crash');
    expect(result.filters.status).toBe('new');
    expect(result.filters.priority).toBe('critical');
  });

  it('should handle SET_SELECTED_INCIDENT', () => {
    const action = { type: 'SET_SELECTED_INCIDENT' as const, payload: mockIncident };
    const result = incidentsReducer(state, action);
    expect(result.selectedIncident).toEqual(mockIncident);
  });

  it('should handle CLEAR_ERROR', () => {
    state.error = 'Some error';
    const action = { type: 'CLEAR_ERROR' as const };
    const result = incidentsReducer(state, action);
    expect(result.error).toBeNull();
  });
});
