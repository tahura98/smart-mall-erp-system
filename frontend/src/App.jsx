import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import TenantDashboard from './pages/tenant/TenantDashboard';
import ParkingDashboard from './pages/parking/ParkingDashboard';

function RootRedirect() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'super_admin' || user.role === 'accounts_officer') {
    return <Navigate to="/admin" replace />;
  }

  if (user.role === 'tenant') {
    return <Navigate to="/tenant" replace />;
  }

  if (user.role === 'parking_operator') {
    return <Navigate to="/parking" replace />;
  }

  return <Navigate to="/admin" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Login Route */}
          <Route path="/login" element={<Login />} />

          {/* 1) Executive Management Portal (super_admin & accounts_officer) */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={['super_admin', 'accounts_officer']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* 2) Tenant & Shop Owner Portal (tenant) */}
          <Route
            path="/tenant/*"
            element={
              <ProtectedRoute allowedRoles={['tenant', 'super_admin']}>
                <TenantDashboard />
              </ProtectedRoute>
            }
          />

          {/* Backward compatibility route for /owner */}
          <Route path="/owner/*" element={<Navigate to="/tenant" replace />} />

          {/* 3) Basement Parking Control (parking_operator) */}
          <Route
            path="/parking/*"
            element={
              <ProtectedRoute allowedRoles={['parking_operator', 'super_admin', 'accounts_officer']}>
                <ParkingDashboard />
              </ProtectedRoute>
            }
          />

          {/* Index and Catch-all Redirection */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
