import { createContext, useContext, useReducer, ReactNode, useCallback } from 'react';

import { VehicleStatus, VehicleType } from '@/types';

import { mapReducer, initialMapState, type MapState } from './mapReducer';

interface MapContextType extends MapState {
  setCenter: (center: [number, number]) => void;
  setZoom: (zoom: number) => void;
  setVehicleStatusFilter: (status: VehicleStatus | 'all') => void;
  setVehicleTypeFilter: (type: VehicleType | 'all') => void;
  toggleFilters: () => void;
  setShowFilters: (show: boolean) => void;
  setSelectedMarker: (marker: MapState['selectedMarker']) => void;
}

const MapContext = createContext<MapContextType | null>(null);

export function MapProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(mapReducer, initialMapState);

  const setCenter = useCallback(
    (center: [number, number]) => dispatch({ type: 'SET_CENTER', payload: center }),
    []
  );
  const setZoom = useCallback((zoom: number) => dispatch({ type: 'SET_ZOOM', payload: zoom }), []);
  const setVehicleStatusFilter = useCallback(
    (status: VehicleStatus | 'all') =>
      dispatch({ type: 'SET_VEHICLE_STATUS_FILTER', payload: status }),
    []
  );
  const setVehicleTypeFilter = useCallback(
    (type: VehicleType | 'all') => dispatch({ type: 'SET_VEHICLE_TYPE_FILTER', payload: type }),
    []
  );
  const toggleFilters = useCallback(() => dispatch({ type: 'TOGGLE_FILTERS' }), []);
  const setShowFilters = useCallback(
    (show: boolean) => dispatch({ type: 'SET_SHOW_FILTERS', payload: show }),
    []
  );
  const setSelectedMarker = useCallback(
    (marker: MapState['selectedMarker']) =>
      dispatch({ type: 'SET_SELECTED_MARKER', payload: marker }),
    []
  );

  return (
    <MapContext.Provider
      value={{
        ...state,
        setCenter,
        setZoom,
        setVehicleStatusFilter,
        setVehicleTypeFilter,
        toggleFilters,
        setShowFilters,
        setSelectedMarker,
      }}
    >
      {children}
    </MapContext.Provider>
  );
}

export function useMap() {
  const ctx = useContext(MapContext);
  if (!ctx) throw new Error('useMap must be used within MapProvider');
  return ctx;
}
