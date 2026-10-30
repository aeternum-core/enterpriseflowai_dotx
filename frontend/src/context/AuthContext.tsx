import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  quickLogin: (role: UserRole) => Promise<boolean>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => Promise<boolean>;
  getDashboardPath: (role?: UserRole) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function getDashboardPath(role?: UserRole): string {
  switch (role) {
    case 'ADMIN':
      return '/admin/dashboard';
    case 'HR_MANAGER':
      return '/hr/dashboard';
    case 'EMPLOYEE_MANAGER':
      return '/employee/dashboard';
    case 'FINANCE_MANAGER':
      return '/finance/dashboard';
    case 'CLIENT_MANAGER':
    case 'SERVICE_MANAGER':
      return '/client/dashboard';
    default:
      return '/';
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('ef_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore session on load
  useEffect(() => {
    async function checkSession() {
      const storedToken = localStorage.getItem('ef_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/auth/session', {
          headers: { Authorization: `Bearer ${storedToken}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setToken(storedToken);
        } else {
          localStorage.removeItem('ef_token');
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error('Session check failed', err);
      } finally {
        setIsLoading(false);
      }
    }
    checkSession();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Login failed');
      }
      const data = await res.json();
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('ef_token', data.token);
      return true;
    } catch (err: any) {
      alert(err.message || 'Login failed');
      return false;
    }
  };

  const quickLogin = async (role: UserRole): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/quick-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });
      if (!res.ok) throw new Error('Role login failed');
      const data = await res.json();
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('ef_token', data.token);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const switchRole = async (role: UserRole): Promise<boolean> => {
    return quickLogin(role);
  };

  const logout = async (): Promise<void> => {
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (e) {
        // ignore
      }
    }
    localStorage.removeItem('ef_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        quickLogin,
        logout,
        switchRole,
        getDashboardPath
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
