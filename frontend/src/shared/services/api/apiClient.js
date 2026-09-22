import axios from 'axios';
import { API_BASE_URL, ENDPOINTS } from './endpoints';

// Tạo axios instance tập trung
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request Interceptor: Tự động đính kèm Access Token vào Header
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Xử lý Response Envelope & Tự động xoay vòng Token khi gặp lỗi 401
apiClient.interceptors.response.use(
  (response) => {
    // Trả về data trực tiếp từ APIResponse
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Nếu gặp lỗi 401 và chưa thử refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');

      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE_URL}${ENDPOINTS.AUTH.REFRESH}`, {
            refresh_token: refreshToken,
          });

          const newAccessToken = res.data?.data?.access_token;
          const newRefreshToken = res.data?.data?.refresh_token;

          if (newAccessToken) {
            localStorage.setItem('access_token', newAccessToken);
            if (newRefreshToken) {
              localStorage.setItem('refresh_token', newRefreshToken);
            }
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return apiClient(originalRequest);
          }
        } catch (refreshErr) {
          // Refresh token hết hạn -> Buộc đăng xuất
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/auth/login';
          return Promise.reject(refreshErr);
        }
      }
    }

    // Trả về message chuẩn từ APIResponse
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại.';
    return Promise.reject(new Error(errorMessage));
  }
);

export default apiClient;
