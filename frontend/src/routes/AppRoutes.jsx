import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '@/modules/auth/pages/LoginPage';
import { StudioPage } from '@/modules/studio/pages/StudioPage';
import { AdminDashboardPage } from '@/modules/admin/pages/AdminDashboardPage';
import { AdminUsersPage } from '@/modules/admin/pages/AdminUsersPage';
import { AdminLicensesPage } from '@/modules/admin/pages/AdminLicensesPage';
import { AdminToolDownloadPage } from '@/modules/admin/pages/AdminToolDownloadPage';
import useAuthStore from '@/modules/auth/store/authStore';

// Bảo vệ tuyến đường riêng tư (Private Route Guard)
const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }
  return children;
};

// Bảo vệ tuyến đường công khai (Guest Route Guard)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return children;
};

export const AppRoutes = () => {
  return (
    // Sử dụng BrowserRouter chuẩn HTML5 PushState - Tuyệt đối không dùng Hash (#)
    <BrowserRouter>
      <Routes>
        {/* Tuyến đường Auth có tiền tố /auth/... */}
        <Route
          path="/auth/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />

        {/* Tuyến đường dành cho Desktop Client Tool */}
        <Route path="/tool" element={<StudioPage />} />
        <Route path="/studio" element={<StudioPage />} />

        {/* Cắt Web Studio trên web - Chuyển hướng sang trang Tải Tool Desktop */}
        <Route
          path="/app/studio"
          element={<Navigate to="/admin/downloads" replace />}
        />

        {/* Tuyến đường Quản trị có tiền tố /admin/... */}
        <Route
          path="/admin/dashboard"
          element={
            <PrivateRoute>
              <AdminDashboardPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <PrivateRoute>
              <AdminUsersPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/licenses"
          element={
            <PrivateRoute>
              <AdminLicensesPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/downloads"
          element={
            <PrivateRoute>
              <AdminToolDownloadPage />
            </PrivateRoute>
          }
        />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

        {/* Redirect mặc định vào trang Admin */}
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
