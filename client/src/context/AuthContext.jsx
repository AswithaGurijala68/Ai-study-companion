import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, setAuthToken, clearAuthToken, getAuthToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      if (!getAuthToken()) { setLoading(false); return; }
      try {
        const res = await api.getCurrentUser();
        setCurrentUser(res.user || null);
      } catch {
        clearAuthToken();
        setCurrentUser(null);
      } finally { setLoading(false); }
    }
    restoreSession();
  }, []);

  async function login(email, password) {
    const res = await api.login(email, password);
    setAuthToken(res.token);
    setCurrentUser(res.user);
    return res.user;
  }

  async function register(name, email, password) {
    const res = await api.register(name, email, password);
    setAuthToken(res.token);
    setCurrentUser(res.user);
    return res.user;
  }

  function logout() {
    clearAuthToken();
    setCurrentUser(null);
  }

  return (
    <AuthContext.Provider value={{
      currentUser,
      isAdmin: currentUser?.role === 'admin',
      login,
      register,
      logout,
      refreshUser: async () => {
        const res = await api.getCurrentUser();
        setCurrentUser(res.user);
        return res.user;
      },
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
