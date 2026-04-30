import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from '../auth/AuthContext';
import AdminDashboardPage from '../pages/AdminDashboardPage';
import LoginPage from '../pages/LoginPage';
import ParentDashboardPage from '../pages/ParentDashboardPage';
import SignupPage from '../pages/SignupPage';
import { ProtectedDigitalFileRoute } from './ProtectedDigitalFileRoute';

const LoginEntryRedirect: React.FC = () => {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated || !role) {
    return <LoginPage />;
  }

  return <Navigate to={role === 'admin' ? '/digital-file/admin-dashboard' : '/digital-file/parent-dashboard'} replace />;
};

const DigitalFileRoutes: React.FC = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route index element={<Navigate to="/digital-file/login" replace />} />
        <Route path="login" element={<LoginEntryRedirect />} />
        <Route path="signup" element={<SignupPage />} />

        <Route element={<ProtectedDigitalFileRoute allowedRole="parent" />}>
          <Route path="parent-dashboard" element={<ParentDashboardPage />} />
        </Route>

        <Route element={<ProtectedDigitalFileRoute allowedRole="admin" />}>
          <Route path="admin-dashboard" element={<AdminDashboardPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/digital-file/login" replace />} />
      </Routes>
    </AuthProvider>
  );
};

export default DigitalFileRoutes;
