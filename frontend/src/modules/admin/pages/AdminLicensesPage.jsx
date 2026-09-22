import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  RefreshCw,
  Plus,
  Copy,
  Check,
  Shield,
  ShieldAlert,
  Edit2,
  Trash2,
  Calendar,
  Sparkles,
  KeyRound,
  Laptop,
  CheckCircle2,
  AlertCircle,
  Clock,
  Globe,
  Bell,
  Monitor
} from 'lucide-react';
import { AdminSidebar } from '../components/AdminSidebar';
import { Modal } from '@/shared/components/modal/Modal';
import { Button } from '@/shared/components/ui/Button';
import useAdminStore from '../store/adminStore';

export const AdminLicensesPage = () => {
  const {
    licenses,
    fetchLicenses,
    createLicense,
    renewLicense,
    toggleLockLicense,
    updateLicense,
    deleteLicense,
    isLoading
  } = useAdminStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // all, online, offline, expired, locked
  const [copiedKey, setCopiedKey] = useState(null);

  // Modals state
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isRenewModalOpen, setRenewModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState(null);

  // Form states
  const [createForm, setCreateForm] = useState({
    customer_name: '',
    user_email: '',
    package_type: 'AI Pro',
    daily_limit: '100/d',
    days: 30,
    is_lifetime: false,
    machine_id: '',
  });

  const [renewDays, setRenewDays] = useState(30);
  const [renewLifetime, setRenewLifetime] = useState(false);

  const [editForm, setEditForm] = useState({
    customer_name: '',
    user_email: '',
    package_type: 'AI Pro',
    daily_limit: '100/d',
    machine_id: '',
  });

  useEffect(() => {
    fetchLicenses();
  }, [fetchLicenses]);

  // Thao tác copy
  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Thống kê nhanh
  const totalCount = licenses.length;
  const onlineCount = licenses.filter((l) => l.is_online).length;
  const offlineCount = licenses.filter((l) => !l.is_online && l.days_remaining > 0 && !l.is_locked).length;
  const expiredCount = licenses.filter((l) => !l.is_lifetime && l.days_remaining <= 0).length;
  const lockedCount = licenses.filter((l) => l.is_locked).length;
  const activeCount = licenses.filter((l) => (l.is_lifetime || l.days_remaining > 0) && !l.is_locked).length;

  // Lọc danh sách theo tab và tìm kiếm
  const filteredLicenses = licenses.filter((lic) => {
    const matchSearch =
      lic.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lic.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lic.machine_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lic.license_key?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchSearch) return false;

    if (activeTab === 'online') return lic.is_online;
    if (activeTab === 'offline') return !lic.is_online && !lic.is_locked && (lic.is_lifetime || lic.days_remaining > 0);
    if (activeTab === 'expired') return !lic.is_lifetime && lic.days_remaining <= 0;
    if (activeTab === 'locked') return lic.is_locked;
    return true;
  });

  // Submit Cấp Key
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!createForm.user_email) {
      alert('Vui lòng nhập Email người nhận');
      return;
    }
    await createLicense(createForm);
    setCreateModalOpen(false);
    setCreateForm({
      customer_name: '',
      user_email: '',
      package_type: 'AI Pro',
      daily_limit: '100/d',
      days: 30,
      is_lifetime: false,
      machine_id: '',
    });
  };

  // Submit Gia Hạn
  const handleRenewSubmit = async () => {
    if (!selectedLicense) return;
    await renewLicense(selectedLicense.id, {
      add_days: renewDays,
      is_lifetime: renewLifetime,
    });
    setRenewModalOpen(false);
  };

  // Submit Sửa
  const handleEditSubmit = async () => {
    if (!selectedLicense) return;
    await updateLicense(selectedLicense.id, editForm);
    setEditModalOpen(false);
  };

  // Xóa Key
  const handleDelete = async (id, name) => {
    if (window.confirm(`Bạn có chắc chắn muốn thu hồi & xóa bản quyền của "${name}"?`)) {
      await deleteLicense(id);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-[#0b0f19] text-gray-100 overflow-hidden font-sans">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* TOP BAR CHUẨN MINTFORGE */}
        <header className="h-14 flex-shrink-0 bg-[#090d16] border-b border-gray-800/80 px-6 flex items-center justify-between text-xs select-none">
          <div className="relative w-72">
            <Search size={14} className="absolute left-3 top-2.5 text-gray-500" />
            <input
              type="text"
              placeholder="Tìm tên hoặc email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#111625] border border-gray-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-rose-500/50 transition-all"
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Status Online Indicator */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 font-semibold text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>{onlineCount} Máy Online</span>
            </div>

            <button
              onClick={() => fetchLicenses()}
              className="p-2 rounded-lg bg-[#111625] hover:bg-gray-800 text-gray-400 hover:text-gray-200 border border-gray-800 transition-colors"
              title="Làm mới dữ liệu"
            >
              <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
            </button>

            <button className="p-2 rounded-lg bg-[#111625] hover:bg-gray-800 text-gray-400 hover:text-gray-200 border border-gray-800 transition-colors relative">
              <Bell size={13} />
              {expiredCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500" />
              )}
            </button>

            {/* Language */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#111625] border border-gray-800 text-gray-300 text-[11px] font-medium">
              <span>🇻🇳</span>
              <span>Tiếng Việt</span>
            </div>

            {/* User Profile */}
            <div className="flex items-center gap-2 pl-2 border-l border-gray-800">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center font-bold text-white text-xs">
                AD
              </div>
              <div className="leading-tight text-left">
                <div className="font-semibold text-gray-200 text-xs">Superadmin</div>
                <div className="text-[10px] text-gray-500 uppercase font-bold">ADMIN</div>
              </div>
            </div>
          </div>
        </header>

        {/* MAIN BODY SCROLLABLE */}
        <main className="flex-1 overflow-y-auto scrollable-body p-6 space-y-6">
          {/* Breadcrumb & Section Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[11px] text-gray-500">
              <span>JACS Studio</span>
              <span>&gt;</span>
              <span>Quản trị hệ thống</span>
              <span>&gt;</span>
              <span className="text-gray-300 font-medium bg-[#141b2d] px-2 py-0.5 rounded border border-gray-800">
                Quản lý máy người dùng
              </span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 shadow-md shadow-orange-950/30">
                  <Users size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-xl font-bold text-gray-100">Quản lý máy người dùng</h2>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold">
                      ● {onlineCount} Online
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Cấp phát bản quyền, khóa thiết bị, gia hạn thuê bao và giám sát phiên máy khách thời gian thực.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => fetchLicenses()}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#141b2d] hover:bg-gray-800 text-gray-300 border border-gray-800 text-xs font-semibold transition-all shadow-sm"
                >
                  <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
                  <span>Làm mới</span>
                </button>

                <button
                  onClick={() => setCreateModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-bold transition-all shadow-lg shadow-orange-900/30 active:scale-95"
                >
                  <Plus size={15} />
                  <span>+ Cấp License / Tạo User</span>
                </button>
              </div>
            </div>
          </div>

          {/* 4 STATS CARDS CHUẨN MINTFORGE */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* CARD 1: TỔNG NGƯỜI DÙNG */}
            <div className="p-4 rounded-2xl bg-[#0f1524] border border-gray-800/90 flex items-center gap-3.5 shadow-sm">
              <div className="w-11 h-11 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
                <Users size={20} />
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">TỔNG NGƯỜI DÙNG</p>
                <p className="text-xl font-extrabold text-gray-100">{totalCount}</p>
                <p className="text-[11px] text-gray-400 flex items-center gap-1">
                  <span className="text-orange-400">●</span> Toàn bộ bản quyền máy khách
                </p>
              </div>
            </div>

            {/* CARD 2: ĐANG HOẠT ĐỘNG */}
            <div className="p-4 rounded-2xl bg-[#0f1524] border border-gray-800/90 flex items-center gap-3.5 shadow-sm">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CheckCircle2 size={20} />
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">ĐANG HOẠT ĐỘNG</p>
                <p className="text-xl font-extrabold text-gray-100">{activeCount}</p>
                <p className="text-[11px] text-gray-400 flex items-center gap-1">
                  <span className="text-emerald-400">⚡</span> {totalCount > 0 ? Math.round((activeCount / totalCount) * 100) : 0}% tỷ lệ hoạt động hợp lệ
                </p>
              </div>
            </div>

            {/* CARD 3: HẾT HẠN / KHÓA */}
            <div className="p-4 rounded-2xl bg-[#0f1524] border border-gray-800/90 flex items-center gap-3.5 shadow-sm">
              <div className="w-11 h-11 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <AlertCircle size={20} />
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">HẾT HẠN / KHÓA</p>
                <p className="text-xl font-extrabold text-rose-400">{expiredCount + lockedCount}</p>
                <p className="text-[11px] text-gray-400 flex items-center gap-1">
                  <span className="text-rose-400">⚠️</span> {expiredCount} hết hạn / {lockedCount} khóa
                </p>
              </div>
            </div>

            {/* CARD 4: BẢN QUYỀN & AI PRO */}
            <div className="p-4 rounded-2xl bg-[#0f1524] border border-gray-800/90 flex items-center gap-3.5 shadow-sm">
              <div className="w-11 h-11 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Sparkles size={20} />
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">BẢN QUYỀN &amp; AI PRO</p>
                <p className="text-xl font-extrabold text-gray-100">{activeCount} / {totalCount} Pro Key</p>
                <p className="text-[11px] text-gray-400 flex items-center gap-1">
                  <span className="text-blue-400">🔑</span> Cấp quyền AI Gateway
                </p>
              </div>
            </div>
          </div>

          {/* MAIN TABLE SECTION */}
          <div className="bg-[#0f1524] border border-gray-800/90 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800/70 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-gray-100">Danh sách người dùng</h3>
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold">
                    {totalCount} thiết bị
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  Quản trị viên có thể kiểm soát khóa, gia hạn, cấp lại key và giám sát phần cứng thời gian thực
                </p>
              </div>

              {/* Quick Search */}
              <div className="relative w-64">
                <Search size={14} className="absolute left-3 top-2.5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Tìm tên hoặc email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#161f36] border border-gray-700/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-orange-500/50"
                />
              </div>
            </div>

            {/* Filter Tabs & Display Rows */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 bg-[#141b2d] p-1 rounded-xl border border-gray-800">
                {[
                  { id: 'all', label: `Tất cả ${totalCount}` },
                  { id: 'online', label: `Đang Online ${onlineCount}` },
                  { id: 'offline', label: `Offline ${offlineCount}` },
                  { id: 'expired', label: `Hết hạn ${expiredCount}` },
                  { id: 'locked', label: `Tạm khóa ${lockedCount}` },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      activeTab === tab.id
                        ? 'bg-[#e11d48] text-white shadow'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 text-gray-400 text-xs">
                <span>Hiển thị:</span>
                <select className="bg-[#141b2d] border border-gray-800 rounded px-2 py-1 text-gray-200 focus:outline-none">
                  <option value="10">10 dòng</option>
                  <option value="25">25 dòng</option>
                  <option value="50">50 dòng</option>
                </select>
              </div>
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-800 text-[10px] uppercase font-bold text-gray-400 tracking-wider bg-[#0a0e1a]/50">
                    <th className="py-3 px-3">KHÁCH HÀNG</th>
                    <th className="py-3 px-3">GÓI &amp; BẢN QUYỀN</th>
                    <th className="py-3 px-3">MÃ MÁY (HWID)</th>
                    <th className="py-3 px-3">LICENSE KEY</th>
                    <th className="py-3 px-3">THỜI HẠN</th>
                    <th className="py-3 px-3">PHIÊN HOẠT ĐỘNG</th>
                    <th className="py-3 px-3 text-right">THAO TÁC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {filteredLicenses.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-gray-500">
                        Không tìm thấy thiết bị nào phù hợp với điều kiện tìm kiếm.
                      </td>
                    </tr>
                  ) : (
                    filteredLicenses.map((lic) => {
                      const isExpired = !lic.is_lifetime && (lic.days_remaining <= 0);
                      const avatarLetters = (lic.customer_name || 'U')
                        .split(' ')
                        .map((w) => w[0])
                        .join('')
                        .substring(0, 2)
                        .toUpperCase();

                      return (
                        <tr key={lic.id} className="hover:bg-[#141b2d]/60 transition-colors group">
                          {/* 1. KHÁCH HÀNG */}
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-[#1b253b] border border-gray-700 flex items-center justify-center font-bold text-gray-200 text-xs">
                                {avatarLetters}
                              </div>
                              <div>
                                <div className="font-bold text-gray-200 flex items-center gap-1.5">
                                  <span>{lic.customer_name}</span>
                                  {lic.is_locked && (
                                    <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-400 text-[9px] font-bold">
                                      ĐÃ KHÓA
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-gray-400 font-mono">{lic.user_email}</div>
                              </div>
                            </div>
                          </td>

                          {/* 2. GÓI BẢN QUYỀN */}
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-1.5">
                              {lic.package_type?.includes('VIP') || lic.is_lifetime ? (
                                <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-300 font-bold text-[11px] flex items-center gap-1">
                                  <Sparkles size={11} />
                                  <span>Lifetime VIP</span>
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300 font-bold text-[11px]">
                                  AI Pro
                                </span>
                              )}
                              <span className="text-[10px] text-gray-400 font-mono">{lic.daily_limit || '100/d'}</span>
                            </div>
                          </td>

                          {/* 3. MÃ MÁY HWID */}
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-1.5">
                              <span className="px-1.5 py-0.5 rounded bg-gray-800 text-[10px] font-mono text-gray-300">
                                {lic.machine_id?.startsWith('Win') ? 'Win' : 'PC'}
                              </span>
                              <span className="font-mono text-[11px] text-gray-300">
                                {lic.machine_id?.length > 20
                                  ? `${lic.machine_id.substring(0, 10)}...${lic.machine_id.substring(lic.machine_id.length - 6)}`
                                  : lic.machine_id}
                              </span>
                              <button
                                onClick={() => handleCopy(lic.machine_id, `hwid_${lic.id}`)}
                                className="text-gray-500 hover:text-gray-300 transition-colors"
                                title="Sao chép HWID"
                              >
                                {copiedKey === `hwid_${lic.id}` ? (
                                  <Check size={12} className="text-emerald-400" />
                                ) : (
                                  <Copy size={12} />
                                )}
                              </button>
                            </div>
                          </td>

                          {/* 4. LICENSE KEY */}
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[11px] text-purple-300 bg-[#171f33] px-2 py-0.5 rounded border border-purple-500/20">
                                {lic.license_key}
                              </span>
                              <button
                                onClick={() => handleCopy(lic.full_license_key || lic.license_key, `key_${lic.id}`)}
                                className="text-gray-500 hover:text-purple-300 transition-colors"
                                title="Sao chép toàn bộ License Key"
                              >
                                {copiedKey === `key_${lic.id}` ? (
                                  <Check size={12} className="text-emerald-400" />
                                ) : (
                                  <Copy size={12} />
                                )}
                              </button>
                            </div>
                          </td>

                          {/* 5. THỜI HẠN */}
                          <td className="py-3.5 px-3">
                            {lic.is_lifetime ? (
                              <span className="px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-[11px] font-bold inline-flex items-center gap-1">
                                <Sparkles size={11} />
                                <span>Vĩnh viễn</span>
                              </span>
                            ) : isExpired ? (
                              <div className="space-y-0.5">
                                <div className="text-[11px] text-gray-400 font-mono">
                                  {lic.expires_at ? new Date(lic.expires_at).toLocaleDateString('vi-VN') : '21/09/2026'}
                                </div>
                                <span className="px-1.5 py-0.2 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 text-[10px] font-bold">
                                  Đã hết hạn
                                </span>
                              </div>
                            ) : (
                              <div className="space-y-0.5">
                                <div className="text-[11px] text-emerald-400 font-semibold font-mono">
                                  Còn {lic.days_remaining} ngày
                                </div>
                                <div className="text-[10px] text-gray-500 font-mono">
                                  {lic.expires_at ? new Date(lic.expires_at).toLocaleDateString('vi-VN') : 'Đang hoạt động'}
                                </div>
                              </div>
                            )}
                          </td>

                          {/* 6. PHIÊN HOẠT ĐỘNG */}
                          <td className="py-3.5 px-3">
                            {lic.is_online ? (
                              <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                                <span>Online</span>
                              </span>
                            ) : isExpired ? (
                              <span className="inline-flex items-center gap-1 text-rose-400 text-[11px]">
                                <AlertCircle size={12} />
                                <span>Đã hết hạn</span>
                              </span>
                            ) : (
                              <span className="text-gray-400 font-mono text-[11px] flex items-center gap-1">
                                <span className="text-gray-500">Offline</span>
                                <span>{lic.last_ip || '172.21.0.4'}</span>
                              </span>
                            )}
                          </td>

                          {/* 7. THAO TÁC CRUD */}
                          <td className="py-3.5 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Nút Gia hạn */}
                              <button
                                onClick={() => {
                                  setSelectedLicense(lic);
                                  setRenewModalOpen(true);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-all flex items-center gap-1 shadow-sm"
                                title="Gia hạn thêm thời gian sử dụng"
                              >
                                <RefreshCw size={11} />
                                <span>Gia hạn</span>
                              </button>

                              {/* Nút Khóa / Mở khóa */}
                              <button
                                onClick={() => toggleLockLicense(lic.id)}
                                className={`p-1.5 rounded-lg border transition-all ${
                                  lic.is_locked
                                    ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 hover:bg-rose-500/30'
                                    : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                                }`}
                                title={lic.is_locked ? 'Mở khóa thiết bị này' : 'Khóa thiết bị'}
                              >
                                <Shield size={13} />
                              </button>

                              {/* Nút Chỉnh sửa */}
                              <button
                                onClick={() => {
                                  setSelectedLicense(lic);
                                  setEditForm({
                                    customer_name: lic.customer_name,
                                    user_email: lic.user_email,
                                    package_type: lic.package_type,
                                    daily_limit: lic.daily_limit,
                                    machine_id: lic.machine_id,
                                  });
                                  setEditModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 transition-colors"
                                title="Sửa thông tin"
                              >
                                <Edit2 size={13} />
                              </button>

                              {/* Nút Xóa */}
                              <button
                                onClick={() => handleDelete(lic.id, lic.customer_name)}
                                className="p-1.5 rounded-lg bg-gray-800 hover:bg-rose-950 border border-gray-700 hover:border-rose-700 text-gray-400 hover:text-rose-400 transition-colors"
                                title="Xóa và thu hồi key"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-800/60">
              <div>
                Hiển thị 1 – {filteredLicenses.length} trong tổng số {totalCount} người dùng
              </div>
              <div className="flex items-center gap-1">
                <button className="px-2.5 py-1 rounded bg-[#141b2d] border border-gray-800 text-gray-400 cursor-not-allowed">
                  &lt;
                </button>
                <button className="px-2.5 py-1 rounded bg-[#e11d48] text-white font-bold">1</button>
                <button className="px-2.5 py-1 rounded bg-[#141b2d] border border-gray-800 text-gray-400 cursor-not-allowed">
                  &gt;
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ========================================================================= */}
      {/* 1. MODAL CẤP LICENSE / TẠO USER MỚI */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Cấp Phát Bản Quyền Mới (License & HWID)"
        subtitle="Khởi tạo mã key kích hoạt tool cho máy trạm khách hàng"
        size="md"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setCreateModalOpen(false)}>
              Hủy bỏ
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 border-none"
              onClick={handleCreateSubmit}
            >
              Tạo &amp; Cấp Key Ngay
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs text-left">
          <div>
            <label className="block text-gray-300 font-semibold mb-1">Tên khách hàng / Tên máy:</label>
            <input
              type="text"
              placeholder="VD: Máy nhà, hoangdinhchien..."
              value={createForm.customer_name}
              onChange={(e) => setCreateForm({ ...createForm, customer_name: e.target.value })}
              className="w-full bg-[#141b2d] border border-gray-700 rounded-lg p-2 text-gray-100 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-gray-300 font-semibold mb-1">Email nhận bản quyền (*):</label>
            <input
              type="email"
              required
              placeholder="khachhang@gmail.com"
              value={createForm.user_email}
              onChange={(e) => setCreateForm({ ...createForm, user_email: e.target.value })}
              className="w-full bg-[#141b2d] border border-gray-700 rounded-lg p-2 text-gray-100 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Gói bản quyền:</label>
              <select
                value={createForm.package_type}
                onChange={(e) => setCreateForm({ ...createForm, package_type: e.target.value })}
                className="w-full bg-[#141b2d] border border-gray-700 rounded-lg p-2 text-gray-100 focus:outline-none"
              >
                <option value="AI Pro">AI Pro (Tiêu chuẩn)</option>
                <option value="Lifetime VIP">Lifetime VIP (Không giới hạn)</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-300 font-semibold mb-1">Giới hạn ngày:</label>
              <input
                type="text"
                value={createForm.daily_limit}
                onChange={(e) => setCreateForm({ ...createForm, daily_limit: e.target.value })}
                className="w-full bg-[#141b2d] border border-gray-700 rounded-lg p-2 text-gray-100"
              />
            </div>
          </div>

          <div className="p-3 bg-[#111625] rounded-xl border border-gray-800 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={createForm.is_lifetime}
                onChange={(e) => setCreateForm({ ...createForm, is_lifetime: e.target.checked })}
                className="rounded text-orange-500"
              />
              <span className="font-bold text-amber-400">Cấp Bản Quyền Vĩnh Viễn (Lifetime VIP)</span>
            </label>

            {!createForm.is_lifetime && (
              <div>
                <label className="block text-gray-400 text-[11px] mb-1">Thời hạn sử dụng (ngày):</label>
                <div className="grid grid-cols-3 gap-2">
                  {[30, 90, 365].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setCreateForm({ ...createForm, days: d })}
                      className={`py-1.5 rounded border text-xs font-semibold ${
                        createForm.days === d
                          ? 'bg-orange-500/20 border-orange-500 text-orange-300'
                          : 'bg-[#162035] border-gray-700 text-gray-300'
                      }`}
                    >
                      {d} ngày {d === 365 ? '(1 năm)' : ''}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-gray-300 font-semibold mb-1">Khóa cứng máy trạm (HWID - Tùy chọn):</label>
            <input
              type="text"
              placeholder="Để trống nếu để máy khách tự liên kết khi nhập key lần đầu"
              value={createForm.machine_id}
              onChange={(e) => setCreateForm({ ...createForm, machine_id: e.target.value })}
              className="w-full bg-[#141b2d] border border-gray-700 rounded-lg p-2 text-gray-100 font-mono text-xs focus:outline-none"
            />
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* 2. MODAL GIA HẠN BẢN QUYỀN */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isRenewModalOpen}
        onClose={() => setRenewModalOpen(false)}
        title="Gia Hạn Bản Quyền Tool Studio"
        subtitle={`Cộng thêm thời hạn cho khách hàng: ${selectedLicense?.customer_name}`}
        size="md"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setRenewModalOpen(false)}>
              Hủy
            </Button>
            <Button variant="success" size="sm" onClick={handleRenewSubmit}>
              Xác nhận Gia hạn
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-[#111625] rounded-xl border border-gray-800 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-gray-400">Khách hàng:</span>
              <span className="font-bold text-gray-200">{selectedLicense?.customer_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Mã Key:</span>
              <span className="font-mono text-purple-300">{selectedLicense?.full_license_key || selectedLicense?.license_key}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Thời hạn hiện tại:</span>
              <span className="font-semibold text-rose-400">
                {selectedLicense?.is_lifetime ? 'Vĩnh viễn' : `Còn ${selectedLicense?.days_remaining || 0} ngày`}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-gray-300 font-semibold mb-2">Chọn gói thời gian gia hạn thêm:</label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[
                { days: 30, label: '+30 Ngày' },
                { days: 90, label: '+90 Ngày (3 tháng)' },
                { days: 365, label: '+365 Ngày (1 năm)' },
              ].map((item) => (
                <button
                  key={item.days}
                  type="button"
                  onClick={() => {
                    setRenewDays(item.days);
                    setRenewLifetime(false);
                  }}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                    renewDays === item.days && !renewLifetime
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow'
                      : 'bg-[#141b2d] border-gray-800 text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setRenewLifetime(!renewLifetime)}
              className={`w-full p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                renewLifetime
                  ? 'bg-purple-500/25 border-purple-500 text-purple-300 shadow-md shadow-purple-900/30'
                  : 'bg-[#141b2d] border-gray-800 text-gray-400 hover:text-gray-200'
              }`}
            >
              <Sparkles size={14} className="text-amber-400" />
              <span>Nâng cấp thành Bản quyền VĨNH VIỄN (Lifetime VIP)</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* 3. MODAL CHỈNH SỬA THÔNG TIN BẢN QUYỀN */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Chỉnh Sửa Thông Tin Thiết Bị & Bản Quyền"
        subtitle={`Cập nhật thông số cho License #${selectedLicense?.id}`}
        size="md"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setEditModalOpen(false)}>
              Hủy
            </Button>
            <Button variant="primary" size="sm" onClick={handleEditSubmit}>
              Lưu Thay Đổi
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-gray-300 font-semibold mb-1">Tên khách hàng:</label>
            <input
              type="text"
              value={editForm.customer_name}
              onChange={(e) => setEditForm({ ...editForm, customer_name: e.target.value })}
              className="w-full bg-[#141b2d] border border-gray-700 rounded-lg p-2 text-gray-100"
            />
          </div>

          <div>
            <label className="block text-gray-300 font-semibold mb-1">Email:</label>
            <input
              type="email"
              value={editForm.user_email}
              onChange={(e) => setEditForm({ ...editForm, user_email: e.target.value })}
              className="w-full bg-[#141b2d] border border-gray-700 rounded-lg p-2 text-gray-100"
            />
          </div>

          <div>
            <label className="block text-gray-300 font-semibold mb-1">Mã khóa phần cứng (HWID):</label>
            <input
              type="text"
              value={editForm.machine_id}
              onChange={(e) => setEditForm({ ...editForm, machine_id: e.target.value })}
              className="w-full bg-[#141b2d] border border-gray-700 rounded-lg p-2 text-gray-100 font-mono"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminLicensesPage;
