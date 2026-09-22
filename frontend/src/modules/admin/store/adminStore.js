import { create } from 'zustand';
import apiClient from '@/shared/services/api/apiClient';

export const useAdminStore = create((set, get) => ({
  stats: {
    total_users: 142,
    active_licenses: 89,
    total_credits_allocated: 4850000,
    total_rendered_videos: 1240,
    gpu_cluster_status: 'Online (4/4 RTX 4090)',
    active_dubbing_tasks: 7,
  },
  users: [
    { id: 1, email: 'admin@meridian.vn', full_name: 'Nguyễn Lê Hải (Admin Lead)', role: 'admin', is_active: true, credit_balance: 86137, created_at: '2026-03-01' },
    { id: 2, email: 'tung.editor@peipei.com', full_name: 'Trần Thanh Tùng (Video Lead)', role: 'editor', is_active: true, credit_balance: 45000, created_at: '2026-03-05' },
    { id: 3, email: 'client_vip@manga.net', full_name: 'Studio Truyện Tranh 3D', role: 'user', is_active: true, credit_balance: 120000, created_at: '2026-03-10' },
    { id: 4, email: 'reviewer_02@youtube.com', full_name: 'Kênh Review Phim Hoạt Hình', role: 'user', is_active: false, credit_balance: 500, created_at: '2026-03-15' },
  ],
  licenses: [
    { id: 1, license_key: 'PEIPEI-PRO-A89B-4C2F', user_email: 'tung.editor@peipei.com', machine_id: 'HWID-WIN11-64X-88231', days_remaining: 43, max_concurrency: 3, is_active: true },
    { id: 2, license_key: 'PEIPEI-PRO-F710-9E11', user_email: 'client_vip@manga.net', machine_id: 'HWID-WIN11-64X-99014', days_remaining: 180, max_concurrency: 5, is_active: true },
    { id: 3, license_key: 'PEIPEI-PRO-0012-7A4B', user_email: 'reviewer_02@youtube.com', machine_id: 'HWID-WIN10-64X-12093', days_remaining: 0, max_concurrency: 1, is_active: false },
  ],
  isLoading: false,

  fetchStats: async () => {
    try {
      const res = await apiClient.get('/admin/stats');
      if (res.data) set({ stats: res.data });
    } catch (e) {
      // Giữ mock stats nếu backend chưa có DB đầy đủ
    }
  },

  addCreditsToUser: async (userId, amount) => {
    set((state) => ({
      users: state.users.map((u) =>
        u.id === userId ? { ...u, credit_balance: u.credit_balance + amount } : u
      ),
    }));
  },

  toggleUserStatus: async (userId) => {
    set((state) => ({
      users: state.users.map((u) =>
        u.id === userId ? { ...u, is_active: !u.is_active } : u
      ),
    }));
  },

  createLicense: async (email, days) => {
    const newLic = {
      id: Date.now(),
      license_key: `PEIPEI-PRO-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      user_email: email,
      machine_id: `HWID-WIN11-64X-${Math.floor(10000 + Math.random() * 90000)}`,
      days_remaining: days,
      max_concurrency: 3,
      is_active: true,
    };
    set((state) => ({
      licenses: [newLic, ...state.licenses],
    }));
    return newLic;
  },
}));

export default useAdminStore;
