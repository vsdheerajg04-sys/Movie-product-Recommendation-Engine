import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (identifier: string, pass: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    pass: string,
    favoriteMovieGenres?: string[],
    favoriteProductCategories?: string[]
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('auth_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('auth_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const verify = async () => {
      if (token) {
        try {
          const profile = await api.getCurrentUser();
          setUser(profile);
          localStorage.setItem('auth_user', JSON.stringify(profile));
        } catch {
          // Keep cached user if offline
        }
      }
      setIsLoading(false);
    };
    verify();
  }, [token]);

  const login = async (identifier: string, pass: string) => {
    const res = await api.login(identifier, pass);
    const u: User = { id: res.userId, username: res.username, email: res.email };
    setToken(res.token);
    setUser(u);
    localStorage.setItem('auth_token', res.token);
    localStorage.setItem('auth_user', JSON.stringify(u));
  };

  const register = async (
    username: string,
    email: string,
    pass: string,
    favoriteMovieGenres: string[] = [],
    favoriteProductCategories: string[] = []
  ) => {
    const res = await api.register(username, email, pass, favoriteMovieGenres, favoriteProductCategories);
    const u: User = {
      id: res.userId,
      username: res.username,
      email: res.email,
      favoriteMovieGenres,
      favoriteProductCategories,
      createdAt: new Date().toISOString(),
    };
    setToken(res.token);
    setUser(u);
    localStorage.setItem('auth_token', res.token);
    localStorage.setItem('auth_user', JSON.stringify(u));
  };

  const logout = async () => {
    await api.logout();
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    if (token) {
      const profile = await api.getCurrentUser();
      setUser(profile);
      localStorage.setItem('auth_user', JSON.stringify(profile));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
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
