import React, { createContext, useContext, useMemo, useState } from 'react';
import type { AuthSession, AuthUser, UserRole } from '../types/auth';

interface AuthContextValue {
  token: string | null;
  user: AuthUser | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  setSession: (session: AuthSession) => void;
  clearSession: () => void;
}

const STORAGE_KEY = 'digital_file_auth_session';

const readSessionFromStorage = (): AuthSession | null => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as AuthSession;
    if (!parsed?.token || !parsed?.user?.role) return null;
    return parsed;
  } catch {
    return null;
  }
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [session, setSessionState] = useState<AuthSession | null>(() => readSessionFromStorage());

  const setSession = (nextSession: AuthSession): void => {
    setSessionState(nextSession);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
  };

  const clearSession = (): void => {
    setSessionState(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      token: session?.token ?? null,
      user: session?.user ?? null,
      role: session?.user?.role ?? null,
      isAuthenticated: Boolean(session?.token),
      setSession,
      clearSession,
    }),
    [session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
