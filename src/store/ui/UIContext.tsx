import { createContext, useContext, useReducer, ReactNode, useCallback } from 'react';

import { uiReducer, initialUIState, type UIState } from './uiReducer';

interface UIContextType extends UIState {
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setSidebarMobileOpen: (open: boolean) => void;
  showNotification: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
  clearNotification: () => void;
  openModal: (id: string) => void;
  closeModal: (id: string) => void;
  isModalOpen: (id: string) => boolean;
  setSearchOpen: (open: boolean) => void;
}

const UIContext = createContext<UIContextType | null>(null);

export function UIProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(uiReducer, initialUIState);

  const toggleSidebar = useCallback(() => dispatch({ type: 'TOGGLE_SIDEBAR' }), []);
  const setSidebarCollapsed = useCallback(
    (collapsed: boolean) => dispatch({ type: 'SET_SIDEBAR_COLLAPSED', payload: collapsed }),
    []
  );
  const setSidebarMobileOpen = useCallback(
    (open: boolean) => dispatch({ type: 'SET_SIDEBAR_MOBILE_OPEN', payload: open }),
    []
  );
  const showNotification = useCallback(
    (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
      dispatch({ type: 'SHOW_NOTIFICATION', payload: { message, type } });
    },
    []
  );
  const clearNotification = useCallback(() => dispatch({ type: 'CLEAR_NOTIFICATION' }), []);
  const openModal = useCallback((id: string) => dispatch({ type: 'OPEN_MODAL', payload: id }), []);
  const closeModal = useCallback(
    (id: string) => dispatch({ type: 'CLOSE_MODAL', payload: id }),
    []
  );
  const isModalOpen = useCallback((id: string) => state.modals[id] ?? false, [state.modals]);
  const setSearchOpen = useCallback(
    (open: boolean) => dispatch({ type: 'SET_SEARCH_OPEN', payload: open }),
    []
  );

  return (
    <UIContext.Provider
      value={{
        ...state,
        toggleSidebar,
        setSidebarCollapsed,
        setSidebarMobileOpen,
        showNotification,
        clearNotification,
        openModal,
        closeModal,
        isModalOpen,
        setSearchOpen,
      }}
    >
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI must be used within UIProvider');
  return ctx;
}
