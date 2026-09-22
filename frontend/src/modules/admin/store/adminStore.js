import { create } from 'zustand';
import apiClient from '@/shared/services/api/apiClient';

export const useAdminStore = create((set, get) => ({
  stats: {
    total_users: 2,
    active_licenses: 1,
    expired_or_locked: 1,
    total_credits_allocated: 4850000,
    total_rendered_videos: 1240,
    gpu_cluster_status: 'Online (4/4 RTX 4090)',
    active_dubbing_tasks: 0,
  },
  users: [
    { id: 1, email: 'admin@meridian.vn', full_name: 'Nguyễn Lê Hải (Admin Lead)', role: 'admin', is_active: true, credit_balance: 86137, created_at: '2026-03-01' },
    { id: 2, email: 'tung.editor@peipei.com', full_name: 'Trần Thanh Tùng (Video Lead)', role: 'editor', is_active: true, credit_balance: 45000, created_at: '2026-03-05' },
    { id: 3, email: 'client_vip@manga.net', full_name: 'Studio Truyện Tranh 3D', role: 'user', is_active: true, credit_balance: 120000, created_at: '2026-03-10' },
  ],
  licenses: [
    {
      id: 1,
      license_key: 'JACS-****-D1D1',
      full_license_key: 'JACS-9B21-4CA0-D1D1',
      customer_name: 'Máy nhà',
      user_email: 'nguyenlehai2003@gmail.com',
      machine_id: 'PC JACS-WIN-510A-6CD39D',
      package_type: 'AI Pro',
      daily_limit: '100/d',
      days_remaining: 0,
      is_lifetime: false,
      is_active: true,
      is_locked: false,
      is_online: false,
      last_ip: '172.21.0.4',
      expires_at: '2026-09-21T00:00:00',
      status: 'expired',
    },
    {
      id: 2,
      license_key: 'JACS-****-54E5',
      full_license_key: 'JACS-F710-9E11-54E5',
      customer_name: 'hoangdinhchien',
      user_email: 'hoangdinhchien2601@gmail.com',
      machine_id: 'Win JACS-WIN-C82F-1C088C',
      package_type: 'Lifetime VIP',
      daily_limit: '100/d',
      days_remaining: 9999,
      is_lifetime: true,
      is_active: true,
      is_locked: false,
      is_online: false,
      last_ip: '172.21.0.4',
      expires_at: null,
      status: 'active',
    },
  ],
  isLoading: false,

  fetchStats: async () => {
    try {
      const res = await apiClient.get('/admin/stats');
      if (res.data) set({ stats: res.data });
    } catch (e) {
      // Giữ mock stats
    }
  },

  fetchLicenses: async () => {
    set({ isLoading: true });
    try {
      const res = await apiClient.get('/admin/licenses');
      if (res.data && res.data.length > 0) {
        const formatted = res.data.map((lic) => {
          const isExpired = !lic.is_lifetime && (lic.days_remaining <= 0);
          let st = 'active';
          if (lic.is_locked) st = 'locked';
          else if (isExpired) st = 'expired';
          else if (lic.is_online) st = 'online';
          else st = 'offline';

          return {
            ...lic,
            full_license_key: lic.license_key,
            license_key: lic.license_key.length > 12 ? `${lic.license_key.substring(0, 4)}-****-${lic.license_key.substring(lic.license_key.length - 4)}` : lic.license_key,
            status: st,
          };
        });
        set({ licenses: formatted, isLoading: false });
        return;
      }
    } catch (e) {
      // Backend offline hoặc chưa có token, giữ mock data
    }
    set({ isLoading: false });
  },

  createLicense: async (formData) => {
    try {
      const res = await apiClient.post('/admin/licenses', formData);
      if (res.data) {
        await get().fetchLicenses();
        return res.data;
      }
    } catch (e) {
      // Fallback local update
    }

    const newKey = `JACS-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const newLic = {
      id: Date.now(),
      license_key: `${newKey.substring(0, 4)}-****-${newKey.substring(newKey.length - 4)}`,
      full_license_key: newKey,
      customer_name: formData.customer_name || 'Khách hàng mới',
      user_email: formData.user_email,
      machine_id: formData.machine_id || `PC JACS-WIN-${Math.floor(1000 + Math.random() * 9000)}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      package_type: formData.package_type || 'AI Pro',
      daily_limit: formData.daily_limit || '100/d',
      days_remaining: formData.is_lifetime ? 9999 : (formData.days || 30),
      is_lifetime: formData.is_lifetime || false,
      is_active: true,
      is_locked: false,
      is_online: false,
      last_ip: '127.0.0.1',
      expires_at: formData.is_lifetime ? null : new Date(Date.now() + (formData.days || 30) * 86400000).toISOString(),
      status: 'active',
    };

    set((state) => ({
      licenses: [newLic, ...state.licenses],
    }));
    return newLic;
  },

  renewLicense: async (licenseId, { add_days = 30, is_lifetime = false }) => {
    try {
      await apiClient.put(`/admin/licenses/${licenseId}/renew`, { add_days, is_lifetime });
      await get().fetchLicenses();
      return true;
    } catch (e) {
      // Fallback local
    }

    set((state) => ({
      licenses: state.licenses.map((lic) => {
        if (lic.id === licenseId) {
          const newDays = is_lifetime ? 9999 : Math.max(0, lic.days_remaining) + add_days;
          return {
            ...lic,
            is_lifetime,
            days_remaining: newDays,
            is_locked: false,
            status: 'active',
            expires_at: is_lifetime ? null : new Date(Date.now() + add_days * 86400000).toISOString(),
          };
        }
        return lic;
      }),
    }));
    return true;
  },

  toggleLockLicense: async (licenseId) => {
    try {
      await apiClient.put(`/admin/licenses/${licenseId}/toggle-lock`);
      await get().fetchLicenses();
      return true;
    } catch (e) {
      // Fallback local
    }

    set((state) => ({
      licenses: state.licenses.map((lic) => {
        if (lic.id === licenseId) {
          const nextLock = !lic.is_locked;
          return {
            ...lic,
            is_locked: nextLock,
            status: nextLock ? 'locked' : (lic.days_remaining > 0 ? 'active' : 'expired'),
          };
        }
        return lic;
      }),
    }));
    return true;
  },

  updateLicense: async (licenseId, updatedData) => {
    try {
      await apiClient.put(`/admin/licenses/${licenseId}`, updatedData);
      await get().fetchLicenses();
      return true;
    } catch (e) {
      // Fallback local
    }

    set((state) => ({
      licenses: state.licenses.map((lic) =>
        lic.id === licenseId ? { ...lic, ...updatedData } : lic
      ),
    }));
    return true;
  },

  deleteLicense: async (licenseId) => {
    try {
      await apiClient.delete(`/admin/licenses/${licenseId}`);
      await get().fetchLicenses();
      return true;
    } catch (e) {
      // Fallback local
    }

    set((state) => ({
      licenses: state.licenses.filter((lic) => lic.id !== licenseId),
    }));
    return true;
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
}));

export default useAdminStore;
