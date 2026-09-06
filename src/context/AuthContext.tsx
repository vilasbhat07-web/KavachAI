import React, { createContext, useContext, useState } from 'react';
import { AuthUser, UserRole } from '../types/auth';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  hasRole: (role: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const SESSION_KEY = 'kavacha-auth-session';
const DEMO_PASSWORD = 'kavacha';

const readStoredUser = (): AuthUser | null => {
  try {
    const stored = localStorage.getItem(SESSION_KEY);
    return stored ? (JSON.parse(stored) as AuthUser) : null;
  } catch {
    return null;
  }
};

const userFromEmail = (email: string): AuthUser | null => {
  const normalizedEmail = email.trim().toLowerCase();
  if (normalizedEmail === 'admin@kavacha.ai') {
    return { email: normalizedEmail, name: 'KAVACHA Administrator', role: 'ADMIN' };
  }
  if (normalizedEmail === 'user@kavacha.ai') {
    return { email: normalizedEmail, name: 'Plant Operations User', role: 'USER' };
  }
  return null;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(readStoredUser);

  const login = async (email: string, password: string) => {
    const nextUser = userFromEmail(email);
    if (!nextUser || password !== DEMO_PASSWORD) {
      return { success: false, error: 'The supplied credentials could not be authenticated.' };
    }

    localStorage.setItem(SESSION_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  const hasRole = (requiredRole: UserRole) => user?.role === requiredRole;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: Boolean(user), login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
