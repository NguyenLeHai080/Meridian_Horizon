import { create } from 'zustand';
import apiClient from '@/shared/services/api/apiClient';
import { ENDPOINTS } from '@/shared/services/api/endpoints';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('access_token') || null,
  isAuthenticated: !!localStorage.getItem('access_token'),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post(ENDPOINTS.AUTH.LOGIN, { email, password });
      const data = response.data;

      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);

      set({
        token: data.access_token,
        isAuthenticated: true,
        user: {
          id: data.user_id,
          email: data.email,
          role: data.role,
          full_name: data.email.split('@')[0],
          credit_balance: 86137,
        },
        isLoading: false,
      });
      return true;
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  register: async (email, password, full_name) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.post(ENDPOINTS.AUTH.REGISTER, { email, password, full_name });
      set({ isLoading: false });
      return true;
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    try {
      await apiClient.post(ENDPOINTS.AUTH.LOGOUT);
    } catch (e) {
      // Bỏ qua lỗi mạng khi logout
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      set({ user: null, token: null, isAuthenticated: false });
    }
  },

  checkAuth: async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      set({ isAuthenticated: false, user: null });
      return;
    }
    try {
      const res = await apiClient.get(ENDPOINTS.AUTH.ME);
      set({ user: res.data, isAuthenticated: true });
    } catch (err) {
      // Token không hợp lệ
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      set({ user: null, token: null, isAuthenticated: false });
    }
  },

  deductCredits: (amount) => {
    const currentUser = get().user;
    if (currentUser) {
      set({
        user: {
          ...currentUser,
          credit_balance: Math.max(0, (currentUser.credit_balance || 86137) - amount),
        },
      });
    }
  },
}));

export default useAuthStore;
