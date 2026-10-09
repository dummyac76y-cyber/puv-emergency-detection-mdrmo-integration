import { Vehicle, VehicleStatus, VehicleType } from '@/types';

export interface VehiclesState {
  vehicles: Vehicle[];
  loading: boolean;
  error: string | null;
  filters: {
    search: string;
    type: VehicleType | 'all';
    status: VehicleStatus | 'all';
  };
  sort: { field: keyof Vehicle; direction: 'asc' | 'desc' } | null;
}

export type VehiclesAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_VEHICLES'; payload: Vehicle[] }
  | { type: 'ADD_VEHICLE'; payload: Vehicle }
  | { type: 'UPDATE_VEHICLE'; payload: { id: string; changes: Partial<Vehicle> } }
  | { type: 'REMOVE_VEHICLE'; payload: string }
  | { type: 'SET_VEHICLE_STATUS'; payload: { id: string; status: VehicleStatus } }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_FILTERS'; payload: Partial<VehiclesState['filters']> }
  | { type: 'SET_SORT'; payload: VehiclesState['sort'] }
  | { type: 'CLEAR_ERROR' };

export const initialVehiclesState: VehiclesState = {
  vehicles: [],
  loading: false,
  error: null,
  filters: { search: '', type: 'all', status: 'all' },
  sort: null,
};

export function vehiclesReducer(state: VehiclesState, action: VehiclesAction): VehiclesState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_VEHICLES':
      return { ...state, vehicles: action.payload, loading: false };
    case 'ADD_VEHICLE':
      return { ...state, vehicles: [action.payload, ...state.vehicles] };
    case 'UPDATE_VEHICLE':
      return {
        ...state,
        vehicles: state.vehicles.map((v) =>
          v.id === action.payload.id ? { ...v, ...action.payload.changes } : v
        ),
      };
    case 'REMOVE_VEHICLE':
      return { ...state, vehicles: state.vehicles.filter((v) => v.id !== action.payload) };
    case 'SET_VEHICLE_STATUS':
      return {
        ...state,
        vehicles: state.vehicles.map((v) =>
          v.id === action.payload.id ? { ...v, status: action.payload.status } : v
        ),
      };
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
