import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '@/modules/auth/pages/LoginPage';
import { StudioPage } from '@/modules/studio/pages/StudioPage';
import useAuthStore from '@/modules/auth/store/authStore';

// Bảo vệ tuyến đường riêng tư (Private Route Guard)
const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  // Nếu chưa đăng nhập, tự động chuyển về /auth/login
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }
  return children;
};

// Bảo vệ tuyến đường công khai (Guest Route Guard)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  // Nếu đã đăng nhập, chuyển thẳng vào /app/studio
  if (isAuthenticated) {
    return <Navigate to="/app/studio" replace />;
  }
  return children;
};

export const AppRoutes = () => {
  return (
    // Sử dụng BrowserRouter chuẩn HTML5 PushState - Tuyệt đối không dùng HashRouter (#)
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

        {/* Tuyến đường Studio có tiền tố /app/... */}
        <Route
          path="/app/studio"
          element={
            <PrivateRoute>
              <StudioPage />
            </PrivateRoute>
          }
        />

        {/* Redirect mặc định */}
        <Route path="/" element={<Navigate to="/app/studio" replace />} />
        <Route path="*" element={<Navigate to="/app/studio" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
