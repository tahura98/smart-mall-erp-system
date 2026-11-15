import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { initialData } from '../data/mockData';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('smart_mall_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('smart_mall_token') || null);
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      // 1. Try real Laravel Sanctum API
      const res = await api.post('/login', { email, password });
      if (res.data && res.data.token) {
        const authToken = res.data.token;
        const authUser = res.data.user;

        localStorage.setItem('smart_mall_token', authToken);
        localStorage.setItem('smart_mall_user', JSON.stringify(authUser));

        setToken(authToken);
        setUser(authUser);
        setLoading(false);
        return { success: true, role: authUser.role };
      }
    } catch (err) {
      // 2. Fallback to mock data if backend server is not active
      console.warn('Backend /api/login unavailable, verifying with seed accounts...', err.message);
      
      const foundUser = initialData.users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase().trim()
      );

      if (foundUser) {
        const dummyToken = `demo_sanctum_token_${Date.now()}_${foundUser.role}`;
        localStorage.setItem('smart_mall_token', dummyToken);
        localStorage.setItem('smart_mall_user', JSON.stringify(foundUser));

        setToken(dummyToken);
        setUser(foundUser);
        setLoading(false);
        return { success: true, role: foundUser.role };
      }

      setLoading(false);
      throw new Error(
        err.response?.data?.message || 'Invalid email or password. Use demo credentials.'
      );
    }
  };

  const logout = async () => {
    try {
      if (token && !token.startsWith('demo_sanctum')) {
        await api.post('/logout');
      }
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('smart_mall_token');
      localStorage.removeItem('smart_mall_user');
      setToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role || null,
        isAuthenticated: !!token && !!user,
        login,
        logout,
        loading,
      }}
    >
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
