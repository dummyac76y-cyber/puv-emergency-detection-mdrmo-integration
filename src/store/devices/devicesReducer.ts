import { DeviceHealth, DeviceStatus } from '@/types';

export interface DevicesState {
  devices: DeviceHealth[];
  loading: boolean;
  error: string | null;
  filters: {
    search: string;
    status: DeviceStatus | 'all';
  };
}

export type DevicesAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_DEVICES'; payload: DeviceHealth[] }
  | { type: 'UPDATE_DEVICE'; payload: { id: string; changes: Partial<DeviceHealth> } }
  | { type: 'SET_DEVICE_STATUS'; payload: { id: string; status: DeviceStatus } }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_FILTERS'; payload: Partial<DevicesState['filters']> }
  | { type: 'CLEAR_ERROR' };

export const initialDevicesState: DevicesState = {
  devices: [],
  loading: false,
  error: null,
  filters: { search: '', status: 'all' },
};

export function devicesReducer(state: DevicesState, action: DevicesAction): DevicesState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_DEVICES':
      return { ...state, devices: action.payload, loading: false };
    case 'UPDATE_DEVICE':
      return {
        ...state,
        devices: state.devices.map((d) =>
          d.deviceId === action.payload.id ? { ...d, ...action.payload.changes } : d
        ),
      };
    case 'SET_DEVICE_STATUS':
      return {
        ...state,
        devices: state.devices.map((d) =>
          d.deviceId === action.payload.id ? { ...d, status: action.payload.status } : d
        ),
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}
