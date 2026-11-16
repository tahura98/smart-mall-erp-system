import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('toc_erp_user') || localStorage.getItem('smart_mall_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => {
    return localStorage.getItem('toc_erp_token') || localStorage.getItem('smart_mall_token') || null;
  });
  const [loading, setLoading] = useState(false);

  // Sync state with localStorage
  const setAuthSession = (authToken, authUser) => {
    if (authToken && authUser) {
      localStorage.setItem('toc_erp_token', authToken);
      localStorage.setItem('toc_erp_user', JSON.stringify(authUser));
      setToken(authToken);
      setUser(authUser);
    } else {
      localStorage.removeItem('toc_erp_token');
      localStorage.removeItem('toc_erp_user');
      localStorage.removeItem('smart_mall_token');
      localStorage.removeItem('smart_mall_user');
      setToken(null);
      setUser(null);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/login', { email, password });
      if (res.data && res.data.token) {
        const authToken = res.data.token;
        const authUser = res.data.user;
        setAuthSession(authToken, authUser);
        setLoading(false);
        return {
          success: true,
          user: authUser,
          role: authUser.role,
          redirect_path: res.data.redirect_path,
        };
      }
      throw new Error(res.data?.message || 'Login failed.');
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.message || err.message || 'Login failed. Please check your credentials.';
      throw new Error(msg);
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await api.post('/logout');
      }
    } catch {
      // Ignore network errors during logout
    } finally {
      setAuthSession(null, null);
    }
  };

  const refreshProfile = async () => {
    try {
      if (token) {
        const res = await api.get('/me');
        if (res.data?.user) {
          setUser(res.data.user);
          localStorage.setItem('toc_erp_user', JSON.stringify(res.data.user));
        }
      }
    } catch {
      // Ignore
    }
  };

  const role = user?.role || null;
  const isSuperAdmin = role === 'super_admin';
  const isAccountsOfficer = role === 'accounts_officer';
  const isManagement = isSuperAdmin || isAccountsOfficer;
  const isTenant = role === 'tenant';
  const isParkingOperator = role === 'parking_operator';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        isSuperAdmin,
        isAccountsOfficer,
        isManagement,
        isTenant,
        isParkingOperator,
        isAuthenticated: !!token && !!user,
        loading,
        login,
        logout,
        refreshProfile,
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
