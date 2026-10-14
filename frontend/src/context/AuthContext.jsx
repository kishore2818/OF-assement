import React, { createContext, useContext, useState } from 'react';
import { clearAuthToken, loginUser } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // In-memory state only: whenever page refreshes, user is null and redirected to /login
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const login = async (email, password) => {
    const data = await loginUser(email, password);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    clearAuthToken();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token && !!user, loading: false, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
