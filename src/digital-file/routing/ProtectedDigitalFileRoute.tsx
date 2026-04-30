import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import type { UserRole } from '../types/auth';

interface ProtectedDigitalFileRouteProps {
  allowedRole: UserRole;
}

export const ProtectedDigitalFileRoute: React.FC<ProtectedDigitalFileRouteProps> = ({ allowedRole }) => {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated || !role) {
    return <Navigate to="/digital-file/login" replace />;
  }

  if (role !== allowedRole) {
    return <Navigate to={role === 'admin' ? '/digital-file/admin-dashboard' : '/digital-file/parent-dashboard'} replace />;
  }

  return <Outlet />;
};
