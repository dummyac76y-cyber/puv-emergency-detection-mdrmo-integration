import { Alert } from '@/types';

export interface AlertsState {
  alerts: Alert[];
  loading: boolean;
  error: string | null;
  filters: {
    search: string;
    status: 'all' | 'unacknowledged' | 'acknowledged';
  };
  sort: { field: keyof Alert; direction: 'asc' | 'desc' } | null;
}

export type AlertsAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ALERTS'; payload: Alert[] }
  | { type: 'ADD_ALERT'; payload: Alert }
  | { type: 'ACKNOWLEDGE_ALERT'; payload: { id: string; acknowledgedAt: string } }
  | { type: 'REMOVE_ALERT'; payload: string }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_FILTERS'; payload: Partial<AlertsState['filters']> }
  | { type: 'SET_SORT'; payload: AlertsState['sort'] }
  | { type: 'CLEAR_ERROR' };

export const initialAlertsState: AlertsState = {
  alerts: [],
  loading: false,
  error: null,
  filters: { search: '', status: 'all' },
  sort: null,
};

export function alertsReducer(state: AlertsState, action: AlertsAction): AlertsState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ALERTS':
      return { ...state, alerts: action.payload, loading: false };
    case 'ADD_ALERT':
      return { ...state, alerts: [action.payload, ...state.alerts] };
    case 'ACKNOWLEDGE_ALERT':
      return {
        ...state,
        alerts: state.alerts.map((a) =>
          a.id === action.payload.id
            ? { ...a, acknowledged: true, acknowledgedAt: action.payload.acknowledgedAt }
            : a
        ),
      };
    case 'REMOVE_ALERT':
      return { ...state, alerts: state.alerts.filter((a) => a.id !== action.payload) };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'SET_SORT':
      return { ...state, sort: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}
