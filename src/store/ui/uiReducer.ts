export interface UIState {
  sidebarCollapsed: boolean;
  sidebarMobileOpen: boolean;
  notification: { message: string; type: 'success' | 'error' | 'warning' | 'info' } | null;
  modals: Record<string, boolean>;
  searchOpen: boolean;
}

export type UIAction =
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_SIDEBAR_COLLAPSED'; payload: boolean }
  | { type: 'SET_SIDEBAR_MOBILE_OPEN'; payload: boolean }
  | { type: 'SHOW_NOTIFICATION'; payload: UIState['notification'] }
  | { type: 'CLEAR_NOTIFICATION' }
  | { type: 'OPEN_MODAL'; payload: string }
  | { type: 'CLOSE_MODAL'; payload: string }
  | { type: 'SET_SEARCH_OPEN'; payload: boolean };

export const initialUIState: UIState = {
  sidebarCollapsed: false,
  sidebarMobileOpen: false,
  notification: null,
  modals: {},
  searchOpen: false,
};

export function uiReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };
    case 'SET_SIDEBAR_COLLAPSED':
      return { ...state, sidebarCollapsed: action.payload };
    case 'SET_SIDEBAR_MOBILE_OPEN':
      return { ...state, sidebarMobileOpen: action.payload };
    case 'SHOW_NOTIFICATION':
      return { ...state, notification: action.payload };
    case 'CLEAR_NOTIFICATION':
      return { ...state, notification: null };
    case 'OPEN_MODAL':
      return { ...state, modals: { ...state.modals, [action.payload]: true } };
    case 'CLOSE_MODAL':
      return { ...state, modals: { ...state.modals, [action.payload]: false } };
    case 'SET_SEARCH_OPEN':
      return { ...state, searchOpen: action.payload };
    default:
      return state;
  }
}
