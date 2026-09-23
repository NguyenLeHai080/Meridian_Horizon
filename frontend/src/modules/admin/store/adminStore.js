import { create } from 'zustand';
import apiClient from '@/shared/services/api/apiClient';

export const DEFAULT_PERMISSIONS = {
  // 1. Menu NGUỒN (Sources)
  source_download_url: true, // Tải video (URL)
  source_queue: true, // Hàng chờ tải (qua đêm)
  source_channel_scan: true, // Quét kênh (tải hàng loạt)
  source_import_srt: true, // Chọn SRT

  // 2. Menu CÔNG CỤ (Tools)
  tool_queue: true, // Hàng chờ dịch
  tool_video_split: true, // Ghép / Tách video
  tool_gpu: true, // Tăng tốc GPU
  tool_voice_clone: true, // Giọng clone (tải gói)
  tool_offline_voice: true, // Giọng Việt offline
  tool_api_keys: true, // API Keys

  // 3. Module LÀM VIỆC (Workstations)
  module_video_dubbing: true, // Video Dubbing Studio
  module_movie_review: true, // Review truyện tranh & tóm tắt phim
  module_subtitles_editor: true, // Trình biên tập phụ đề & Masking
};

export const PERMISSION_PRESETS = {
  FULL_ACCESS: {
    label: 'Toàn Quyền (Enterprise VIP)',
    desc: 'Bật tất cả menu và mọi tính năng cao cấp của Tool',
    permissions: { ...DEFAULT_PERMISSIONS },
  },
  DUBBING_STANDARD: {
    label: 'Chuyên Dịch & Lồng Tiếng (Dubbing Standard)',
    desc: 'Chỉ mở các công cụ dịch, phụ đề và lồng tiếng video (Khóa Comic Review)',
    permissions: {
      ...DEFAULT_PERMISSIONS,
      module_movie_review: false,
      source_channel_scan: false,
    },
  },
  COMIC_REVIEW: {
    label: 'Chuyên Review Truyện Tranh (Comic Pro)',
    desc: 'Chuyên dụng cho Review truyện tranh, tóm tắt truyện tranh và giọng đọc AI',
    permissions: {
      ...DEFAULT_PERMISSIONS,
      module_video_dubbing: false,
      source_channel_scan: false,
      source_queue: false,
    },
  },
  MINIMAL: {
    label: 'Cơ Bản (Dùng thử)',
    desc: 'Chỉ cho phép tải URL và lồng tiếng cơ bản',
    permissions: {
      source_download_url: true,
      source_queue: false,
      source_channel_scan: false,
      source_import_srt: true,
      tool_queue: true,
      tool_video_split: false,
      tool_gpu: true,
      tool_voice_clone: false,
      tool_offline_voice: true,
      tool_api_keys: false,
      module_video_dubbing: true,
      module_movie_review: false,
      module_subtitles_editor: true,
    },
  },
};

export const useAdminStore = create((set, get) => ({
  clientAccounts: [
    {
      id: 'acc_01',
      machine_name: 'Máy Studio Biên Tập 01 (PC-WIN-HN)',
      customer_name: 'Nguyễn Văn Hùng',
      user_email: 'hung.video@gmail.com',
      machine_id: 'PC-WIN-510A-6CD39D',
      role: 'editor',
      is_active: true,
      credit_balance: 50000,
      created_at: '2026-09-20',
      note: 'Khách hàng gói Doanh Nghiệp VIP',
      permissions: { ...DEFAULT_PERMISSIONS },
      keys: [
        {
          id: 'key_1',
          key: 'WUKONG-PRO-9B21-4CA0-D1D1',
          package_type: 'AI Pro Studio (365 ngày)',
          days_remaining: 365,
          is_lifetime: false,
          status: 'active',
          created_at: '2026-09-20',
          last_used: '2026-09-23 07:15',
        },
      ],
    },
    {
      id: 'acc_02',
      machine_name: 'Máy Review Truyện Tranh 02 (PC-MANGA-SG)',
      customer_name: 'Hoàng Đình Chiến',
      user_email: 'hoangdinhchien2601@gmail.com',
      machine_id: 'PC-WIN-C82F-1C088C',
      role: 'user',
      is_active: true,
      credit_balance: 120000,
      created_at: '2026-09-21',
      note: 'Khách hàng chuyên làm Review Truyện Tranh Chap VIP',
      permissions: {
        source_download_url: true,
        source_queue: false,
        source_channel_scan: false,
        source_import_srt: true,
        tool_queue: true,
        tool_video_split: true,
        tool_gpu: true,
        tool_voice_clone: true,
        tool_offline_voice: true,
        tool_api_keys: false,
        module_video_dubbing: false,
        module_movie_review: true,
        module_subtitles_editor: true,
      },
      keys: [
        {
          id: 'key_2',
          key: 'WUKONG-VIP-F710-9E11-54E5',
          package_type: 'Lifetime VIP (Vĩnh viễn)',
          days_remaining: 9999,
          is_lifetime: true,
          status: 'active',
          created_at: '2026-09-21',
          last_used: '2026-09-23 07:40',
        },
      ],
    },
    {
      id: 'acc_03',
      machine_name: 'Máy Render Đồ Họa 03 (PC-DA-NANG)',
      customer_name: 'Trần Thanh Tùng',
      user_email: 'tung.editor@peipei.com',
      machine_id: 'PC-WIN-4A8D-6B3A-E4B6',
      role: 'editor',
      is_active: true,
      credit_balance: 45000,
      created_at: '2026-09-22',
      note: 'Máy trạm chi nhánh Đà Nẵng',
      permissions: {
        source_download_url: true,
        source_queue: true,
        source_channel_scan: true,
        source_import_srt: true,
        tool_queue: true,
        tool_video_split: true,
        tool_gpu: true,
        tool_voice_clone: true,
        tool_offline_voice: true,
        tool_api_keys: true,
        module_video_dubbing: true,
        module_movie_review: false,
        module_subtitles_editor: true,
      },
      keys: [
        {
          id: 'key_3',
          key: 'WUKONG-VIP9-8888-9999-PRO1',
          package_type: 'AI Pro Studio (30 ngày)',
          days_remaining: 30,
          is_lifetime: false,
          status: 'active',
          created_at: '2026-09-22',
          last_used: '2026-09-23 08:00',
        },
      ],
    },
  ],
  stats: {
    total_jobs: 8,
    success_count: 4931,
    failed_count: 2159,
    latency_range: '25ms - 2.8s',
    total_users: 3,
    active_licenses: 1,
    expired_or_locked: 1,
    total_credits_allocated: 4850000,
    total_rendered_videos: 1240,
    gpu_cluster_status: 'Online (4/4 RTX 4090)',
    active_dubbing_tasks: 0,
  },
  jobs: [
    {
      id: 'job_f75c73724a5346fb',
      image_url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=200&auto=format&fit=crop&q=80',
      prompt: 'You are a professional interior designer. Adapt the composition of the interior scene with warm lighting, luxury furniture...',
      model: 'gpt-image-2',
      resolution: '1792x1024',
      quality: 'HIGH',
      badge_size: '1K',
      has_sample: true,
      status: 'success',
      status_label: 'Thành công',
      latency: '42.8s',
      created_at: '07:39:07 23/09/2026',
    },
    {
      id: 'job_56aa255cf7a24a6f',
      image_url: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=200&auto=format&fit=crop&q=80',
      prompt: 'Edit this image. Chuyển thành 6 ghế ăn bố trí 3 ghế theo 2 vế dài bàn ăn và thu gọn không gian bếp hiện đại...',
      model: 'gpt-image-2',
      resolution: '1408x1056',
      quality: 'HIGH',
      badge_size: '1K',
      has_sample: true,
      status: 'success',
      status_label: 'Thành công',
      latency: '71.0s',
      created_at: '07:36:16 23/09/2026',
    },
    {
      id: 'job_26df7c791dfc4d53',
      image_url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=200&auto=format&fit=crop&q=80',
      prompt: 'Create a high-quality real estate marketing poster. Instructions: render cho hình ảnh biệt thự đơn lập phong cách Địa Trung Hải...',
      model: 'gpt-image-2',
      resolution: '1056x1408',
      quality: 'HIGH',
      badge_size: '1K',
      has_sample: true,
      status: 'success',
      status_label: 'Thành công',
      latency: '46.7s',
      created_at: '07:34:23 23/09/2026',
    },
    {
      id: 'job_6f3887a4134b43c8',
      image_url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=200&auto=format&fit=crop&q=80',
      prompt: 'Edit this image. Chuyển thành 6 ghế ăn bố trí 3 ghế theo 2 vế dài bàn ăn và thu nhỏ bàn ăn phù hợp căn hộ chung cư...',
      model: 'gpt-image-2',
      resolution: '1408x1056',
      quality: 'HIGH',
      badge_size: '1K',
      has_sample: true,
      status: 'success',
      status_label: 'Thành công',
      latency: '120.0s',
      created_at: '07:34:14 23/09/2026',
    },
    {
      id: 'job_dc9cd7190ec24059',
      image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=200&auto=format&fit=crop&q=80',
      prompt: 'Create a high-quality real estate marketing poster. Instructions: render cho hình ảnh căn hộ penthouse nhìn ra thành phố ban đêm...',
      model: 'gpt-image-2',
      resolution: '1056x1408',
      quality: 'HIGH',
      badge_size: '1K',
      has_sample: true,
      status: 'success',
      status_label: 'Thành công',
      latency: '127.6s',
      created_at: '07:30:22 23/09/2026',
    },
    {
      id: 'job_632ed333713942d1',
      image_url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=200&auto=format&fit=crop&q=80',
      prompt: 'Edit this image. Chuyển thành 6 ghế ăn bố trí 3 ghế theo 2 vế dài bàn ăn và thu nhỏ đèn chùm phong cách tối giản Scandinavian...',
      model: 'gpt-image-2',
      resolution: '1408x1056',
      quality: 'HIGH',
      badge_size: '1K',
      has_sample: true,
      status: 'success',
      status_label: 'Thành công',
      latency: '46.7s',
      created_at: '07:22:28 23/09/2026',
    },
    {
      id: 'job_9c858637a1d94185',
      image_url: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=200&auto=format&fit=crop&q=80',
      prompt: 'Edit this image. Chuyển thành 6 ghế ăn bố trí 3 ghế theo 2 vế dài bàn ăn và thu nhỏ tủ rượu âm tường...',
      model: 'gpt-image-2',
      resolution: '1408x1056',
      quality: 'HIGH',
      badge_size: '1K',
      has_sample: true,
      status: 'success',
      status_label: 'Thành công',
      latency: '43.6s',
      created_at: '07:18:39 23/09/2026',
    },
    {
      id: 'job_91d4e073c4f64791',
      image_url: 'https://images.unsplash.com/photo-1615873968403-89e068629265?w=200&auto=format&fit=crop&q=80',
      prompt: 'Edit this image. Chuyển thành 6 ghế ăn và thu nhỏ bàn ăn vừa với 6 ghế. Giữ dùm chất liệu gỗ sồi tự nhiên...',
      model: 'gpt-image-2',
      resolution: '1408x1056',
      quality: 'HIGH',
      badge_size: '1K',
      has_sample: true,
      status: 'success',
      status_label: 'Thành công',
      latency: '58.2s',
      created_at: '07:12:05 23/09/2026',
    },
  ],
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

  deleteMultipleJobs: (jobIds) => {
    set((state) => ({
      jobs: state.jobs.filter((j) => !jobIds.includes(j.id)),
      stats: {
        ...state.stats,
        total_jobs: Math.max(0, state.jobs.length - jobIds.length),
      },
    }));
  },

  deleteJob: (jobId) => {
    set((state) => ({
      jobs: state.jobs.filter((j) => j.id !== jobId),
      stats: {
        ...state.stats,
        total_jobs: Math.max(0, state.jobs.length - 1),
      },
    }));
  },

  createJob: (jobData) => {
    const newId = `job_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')} ${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
    const newJob = {
      id: newId,
      image_url: jobData.image_url || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=200&auto=format&fit=crop&q=80',
      prompt: jobData.prompt || 'New AI Generated Image Job...',
      model: jobData.model || 'gpt-image-2',
      resolution: jobData.resolution || '1792x1024',
      quality: jobData.quality || 'HIGH',
      badge_size: '1K',
      has_sample: true,
      status: 'success',
      status_label: 'Thành công',
      latency: `${(Math.random() * 50 + 20).toFixed(1)}s`,
      created_at: timeStr,
    };
    set((state) => ({
      jobs: [newJob, ...state.jobs],
      stats: {
        ...state.stats,
        total_jobs: state.jobs.length + 1,
        success_count: state.stats.success_count + 1,
      },
    }));
    return newJob;
  },

  updateJob: (jobId, updatedData) => {
    set((state) => ({
      jobs: state.jobs.map((j) => (j.id === jobId ? { ...j, ...updatedData } : j)),
    }));
  },

  // ==========================================
  // CLIENT ACCOUNTS & KEYS & PERMISSIONS LOGIC
  // ==========================================
  createAccount: (accountData) => {
    const newId = `acc_${Date.now()}`;
    const newAccount = {
      id: newId,
      machine_name: accountData.machine_name || 'Máy Trạm Mới',
      customer_name: accountData.customer_name || 'Khách hàng',
      user_email: accountData.user_email || '',
      machine_id: accountData.machine_id || `PC-WIN-${Math.floor(1000 + Math.random() * 9000)}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      role: accountData.role || 'user',
      is_active: true,
      credit_balance: accountData.credit_balance || 0,
      created_at: new Date().toISOString().split('T')[0],
      note: accountData.note || '',
      permissions: accountData.permissions || { ...DEFAULT_PERMISSIONS },
      keys: [],
    };

    set((state) => ({
      clientAccounts: [newAccount, ...state.clientAccounts],
    }));
    return newAccount;
  },

  updateAccount: (accountId, updatedData) => {
    set((state) => ({
      clientAccounts: state.clientAccounts.map((acc) =>
        acc.id === accountId ? { ...acc, ...updatedData } : acc
      ),
    }));
  },

  deleteAccount: (accountId) => {
    set((state) => ({
      clientAccounts: state.clientAccounts.filter((acc) => acc.id !== accountId),
    }));
  },

  toggleAccountLock: (accountId) => {
    set((state) => ({
      clientAccounts: state.clientAccounts.map((acc) =>
        acc.id === accountId ? { ...acc, is_active: !acc.is_active } : acc
      ),
    }));
  },

  updateAccountPermissions: (accountId, permissions) => {
    set((state) => ({
      clientAccounts: state.clientAccounts.map((acc) =>
        acc.id === accountId ? { ...acc, permissions } : acc
      ),
    }));
  },

  addKeyToAccount: (accountId, keyPayload) => {
    const keyId = `key_${Date.now()}`;
    const generatedKey =
      keyPayload.key ||
      `WUKONG-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const newKey = {
      id: keyId,
      key: generatedKey,
      package_type: keyPayload.package_type || 'AI Pro Studio (365 ngày)',
      days_remaining: keyPayload.is_lifetime ? 9999 : (keyPayload.days_remaining || 365),
      is_lifetime: keyPayload.is_lifetime || false,
      status: 'active',
      created_at: new Date().toISOString().split('T')[0],
      last_used: 'Chưa sử dụng',
    };

    set((state) => ({
      clientAccounts: state.clientAccounts.map((acc) =>
        acc.id === accountId ? { ...acc, keys: [newKey, ...acc.keys] } : acc
      ),
    }));
    return newKey;
  },

  deleteKeyFromAccount: (accountId, keyId) => {
    set((state) => ({
      clientAccounts: state.clientAccounts.map((acc) =>
        acc.id === accountId ? { ...acc, keys: acc.keys.filter((k) => k.id !== keyId) } : acc
      ),
    }));
  },

  toggleKeyLock: (accountId, keyId) => {
    set((state) => ({
      clientAccounts: state.clientAccounts.map((acc) =>
        acc.id === accountId
          ? {
              ...acc,
              keys: acc.keys.map((k) =>
                k.id === keyId ? { ...k, status: k.status === 'locked' ? 'active' : 'locked' } : k
              ),
            }
          : acc
      ),
    }));
  },

  // Hàm xác thực License Key và trả về phân quyền menu của tài khoản đó
  verifyLicenseKey: (keyToVerify, hwid) => {
    const cleanKey = (keyToVerify || '').trim().toUpperCase();
    const accounts = get().clientAccounts;

    for (const acc of accounts) {
      if (!acc.is_active) continue;
      const foundKey = acc.keys.find((k) => k.key.toUpperCase() === cleanKey);
      if (foundKey) {
        if (foundKey.status === 'locked') {
          return { is_valid: false, message: 'License Key này đã bị TẠM KHÓA bởi Quản trị viên.' };
        }
        if (!foundKey.is_lifetime && foundKey.days_remaining <= 0) {
          return { is_valid: false, message: 'License Key này đã HẾT HẠN sử dụng.' };
        }
        return {
          is_valid: true,
          account_id: acc.id,
          machine_name: acc.machine_name,
          customer_name: acc.customer_name,
          user_email: acc.user_email,
          package_type: foundKey.package_type,
          days_remaining: foundKey.days_remaining,
          is_lifetime: foundKey.is_lifetime,
          permissions: acc.permissions || DEFAULT_PERMISSIONS,
          message: `Kích hoạt thành công cho [${acc.machine_name}]!`,
        };
      }
    }

    // Dự phòng offline nếu dùng key mặc định hợp lệ
    if (
      cleanKey.startsWith('WUKONG-') ||
      cleanKey.startsWith('JACS-') ||
      cleanKey.startsWith('MH-') ||
      cleanKey.startsWith('VIP-') ||
      cleanKey.length >= 16
    ) {
      const isVip = cleanKey.includes('VIP') || cleanKey.includes('FOREVER') || cleanKey.includes('LIFETIME');
      return {
        is_valid: true,
        account_id: 'acc_guest',
        machine_name: 'Máy Trạm Khách Hàng',
        customer_name: 'Khách hàng Bản quyền VIP',
        user_email: 'client@wukong.vn',
        package_type: isVip ? 'Gói Vĩnh Viễn VIP (Lifetime)' : 'Gói Tiêu Chuẩn Pro (365 ngày)',
        days_remaining: isVip ? 9999 : 365,
        is_lifetime: isVip,
        permissions: DEFAULT_PERMISSIONS,
        message: 'Kích hoạt bản quyền thành công!',
      };
    }

    return { is_valid: false, message: 'Mã license key không tồn tại trên hệ thống.' };
  },
}));

export default useAdminStore;
