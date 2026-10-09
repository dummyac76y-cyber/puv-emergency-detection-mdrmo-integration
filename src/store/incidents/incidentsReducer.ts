import { Incident, IncidentStatus, IncidentPriority, IncidentType, TimelineEntry } from '@/types';

export interface IncidentsState {
  incidents: Incident[];
  loading: boolean;
  error: string | null;
  filters: {
    search: string;
    status: IncidentStatus | 'all';
    priority: IncidentPriority | 'all';
    type: IncidentType | 'all';
  };
  sort: { field: keyof Incident; direction: 'asc' | 'desc' } | null;
  selectedIncident: Incident | null;
}

export type IncidentsAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_INCIDENTS'; payload: Incident[] }
  | { type: 'ADD_INCIDENT'; payload: Incident }
  | { type: 'UPDATE_INCIDENT'; payload: { id: string; changes: Partial<Incident> } }
  | {
      type: 'UPDATE_INCIDENT_STATUS';
      payload: { id: string; status: IncidentStatus; timelineEntry?: TimelineEntry };
    }
  | { type: 'REMOVE_INCIDENT'; payload: string }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_FILTERS'; payload: Partial<IncidentsState['filters']> }
  | { type: 'SET_SORT'; payload: IncidentsState['sort'] }
  | { type: 'SET_SELECTED_INCIDENT'; payload: Incident | null }
  | { type: 'CLEAR_ERROR' };

export const initialIncidentsState: IncidentsState = {
  incidents: [],
  loading: false,
  error: null,
  filters: { search: '', status: 'all', priority: 'all', type: 'all' },
  sort: null,
  selectedIncident: null,
};

export function incidentsReducer(state: IncidentsState, action: IncidentsAction): IncidentsState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_INCIDENTS':
      return { ...state, incidents: action.payload, loading: false };
    case 'ADD_INCIDENT':
      return { ...state, incidents: [action.payload, ...state.incidents] };
    case 'UPDATE_INCIDENT':
      return {
        ...state,
        incidents: state.incidents.map((inc) =>
          inc.id === action.payload.id ? { ...inc, ...action.payload.changes } : inc
        ),
      };
    case 'UPDATE_INCIDENT_STATUS': {
      const incident = state.incidents.find((i) => i.id === action.payload.id);
      if (!incident) return state;
      const newTimelineEntry = action.payload.timelineEntry ?? {
        timestamp: new Date().toISOString(),
        action: `Status changed to ${action.payload.status}`,
        actor: 'Operator Admin',
        details: `Incident marked as ${action.payload.status}.`,
      };
      return {
        ...state,
        incidents: state.incidents.map((inc) =>
          inc.id === action.payload.id
            ? {
                ...inc,
                status: action.payload.status,
                timeline: [...inc.timeline, newTimelineEntry],
              }
            : inc
        ),
        selectedIncident:
          state.selectedIncident?.id === action.payload.id
            ? {
                ...state.selectedIncident,
                status: action.payload.status,
                timeline: [...state.selectedIncident.timeline, newTimelineEntry],
              }
            : state.selectedIncident,
      };
    }
    case 'REMOVE_INCIDENT':
      return { ...state, incidents: state.incidents.filter((i) => i.id !== action.payload) };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'SET_SORT':
      return { ...state, sort: action.payload };
    case 'SET_SELECTED_INCIDENT':
      return { ...state, selectedIncident: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}
