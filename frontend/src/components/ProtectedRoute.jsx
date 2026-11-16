import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to user's authorized portal
    if (user.role === 'super_admin' || user.role === 'accounts_officer') {
      return <Navigate to="/admin" replace />;
    }
    if (user.role === 'tenant') {
      return <Navigate to="/tenant" replace />;
    }
    if (user.role === 'parking_operator') {
      return <Navigate to="/parking" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return children;
}
