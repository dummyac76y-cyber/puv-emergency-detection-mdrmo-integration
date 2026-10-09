import { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';

import { supabase } from '@/services/supabase';

import { authReducer, initialAuthState, type AuthState } from './authReducer';

const isSupabaseConfigured = !!(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  const login = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      dispatch({ type: 'SET_ERROR', payload: 'Supabase not configured' });
      return;
    }
    dispatch({ type: 'SET_LOADING', payload: true });
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
    dispatch({ type: 'SET_SESSION', payload: { user: data.user, session: data.session } });
    if (data.user) {
      const role = data.user.user_metadata?.role ?? 'viewer';
      dispatch({ type: 'SET_ROLE', payload: role });
    }
  };

  const logout = async () => {
    if (!isSupabaseConfigured) return;
    await supabase.auth.signOut();
    dispatch({ type: 'LOGOUT' });
  };

  const refreshSession = async () => {
    if (!isSupabaseConfigured) {
      dispatch({ type: 'SET_LOADING', payload: false });
      return;
    }
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      dispatch({
        type: 'SET_SESSION',
        payload: { user: data.session.user, session: data.session },
      });
      const role = data.session.user.user_metadata?.role ?? 'viewer';
      dispatch({ type: 'SET_ROLE', payload: role });
    } else {
      dispatch({ type: 'LOGOUT' });
    }
  };

  useEffect(() => {
    refreshSession();
    if (!isSupabaseConfigured) return;
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        dispatch({ type: 'SET_SESSION', payload: { user: session.user, session } });
        const role = session.user.user_metadata?.role ?? 'viewer';
        dispatch({ type: 'SET_ROLE', payload: role });
      } else {
        dispatch({ type: 'LOGOUT' });
      }
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
