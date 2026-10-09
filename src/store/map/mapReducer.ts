import { VehicleStatus, VehicleType } from '@/types';

export interface MapState {
  center: [number, number];
  zoom: number;
  filters: {
    vehicleStatus: VehicleStatus | 'all';
    vehicleType: VehicleType | 'all';
  };
  showFilters: boolean;
  selectedMarker: { type: 'vehicle' | 'incident'; id: string } | null;
}

export type MapAction =
  | { type: 'SET_CENTER'; payload: [number, number] }
  | { type: 'SET_ZOOM'; payload: number }
  | { type: 'SET_VEHICLE_STATUS_FILTER'; payload: VehicleStatus | 'all' }
  | { type: 'SET_VEHICLE_TYPE_FILTER'; payload: VehicleType | 'all' }
  | { type: 'TOGGLE_FILTERS' }
  | { type: 'SET_SHOW_FILTERS'; payload: boolean }
  | { type: 'SET_SELECTED_MARKER'; payload: MapState['selectedMarker'] };

export const initialMapState: MapState = {
  center: [14.5995, 120.9842],
  zoom: 14,
  filters: { vehicleStatus: 'all', vehicleType: 'all' },
  showFilters: false,
  selectedMarker: null,
};

export function mapReducer(state: MapState, action: MapAction): MapState {
  switch (action.type) {
    case 'SET_CENTER':
      return { ...state, center: action.payload };
    case 'SET_ZOOM':
      return { ...state, zoom: action.payload };
    case 'SET_VEHICLE_STATUS_FILTER':
      return { ...state, filters: { ...state.filters, vehicleStatus: action.payload } };
    case 'SET_VEHICLE_TYPE_FILTER':
      return { ...state, filters: { ...state.filters, vehicleType: action.payload } };
    case 'TOGGLE_FILTERS':
      return { ...state, showFilters: !state.showFilters };
    case 'SET_SHOW_FILTERS':
      return { ...state, showFilters: action.payload };
    case 'SET_SELECTED_MARKER':
      return { ...state, selectedMarker: action.payload };
    default:
      return state;
  }
}
