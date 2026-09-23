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
  Lock,
  Unlock,
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
  Monitor,
  RotateCw,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { AdminSidebar } from '../components/AdminSidebar';
import { AdminHeader } from '../components/AdminHeader';
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
    <div className="flex h-screen w-screen bg-[#f8fafc] text-gray-800 overflow-hidden font-sans antialiased">
      {/* 1. DARK SIDEBAR CHUẨN MINTFORGE */}
      <AdminSidebar />

      {/* 2. MAIN CANVAS CHUẨN LIGHT THEME NHƯ HÌNH MẪU */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* TOP BAR TRẮNG TINH TẾ */}
        <AdminHeader onSearch={setSearchQuery} />

        {/* MAIN BODY SCROLLABLE NỀN XÁM NHẸ #f8fafc */}
        <main className="flex-1 overflow-y-auto scrollable-body p-6 space-y-6">
          {/* Breadcrumb & Section Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[11px] text-gray-500">
              <span className="flex items-center gap-1">
                <span>🏠</span> JACS Studio
              </span>
              <span>&gt;</span>
              <span>Quản trị hệ thống</span>
              <span>&gt;</span>
              <span className="text-orange-600 font-semibold bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                Quản lý máy người dùng
              </span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
                  <Users size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">Quản lý máy người dùng</h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 text-[11px] font-bold">
                      ● {onlineCount} Online
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Cấp phát bản quyền, khóa thiết bị, gia hạn thuê bao và giám sát phiên máy khách thời gian thực.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => fetchLicenses()}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-xs font-semibold transition-all shadow-sm active:scale-95"
                >
                  <RefreshCw size={13} className={isLoading ? 'animate-spin text-orange-500' : ''} />
                  <span>Làm mới</span>
                </button>

                <button
                  onClick={() => setCreateModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-bold transition-all shadow-md shadow-orange-500/25 active:scale-95 cursor-pointer"
                >
                  <Plus size={15} />
                  <span>+ Cấp License / Tạo User</span>
                </button>
              </div>
            </div>
          </div>

          {/* 4 STATS CARDS CHUẨN MINTFORGE - NỀN TRẮNG BORDERS NHẸ */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* CARD 1: TỔNG NGƯỜI DÙNG */}
            <div className="p-4 rounded-2xl bg-white border border-gray-200/80 flex items-center gap-3.5 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500">
                <Users size={22} />
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">TỔNG NGƯỜI DÙNG</p>
                <p className="text-2xl font-extrabold text-gray-900 leading-tight">{totalCount}</p>
                <p className="text-[11px] text-gray-500 flex items-center gap-1">
                  <span className="text-orange-500">●</span> Toàn bộ bản quyền máy khách
                </p>
              </div>
            </div>

            {/* CARD 2: ĐANG HOẠT ĐỘNG */}
            <div className="p-4 rounded-2xl bg-white border border-gray-200/80 flex items-center gap-3.5 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500">
                <CheckCircle2 size={22} />
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">ĐANG HOẠT ĐỘNG</p>
                <p className="text-2xl font-extrabold text-gray-900 leading-tight">{activeCount}</p>
                <p className="text-[11px] text-gray-500 flex items-center gap-1">
                  <span className="text-emerald-500 font-bold">⚡</span> {totalCount > 0 ? Math.round((activeCount / totalCount) * 100) : 0}% tỷ lệ hoạt động hợp lệ
                </p>
              </div>
            </div>

            {/* CARD 3: HẾT HẠN / KHÓA */}
            <div className="p-4 rounded-2xl bg-white border border-gray-200/80 flex items-center gap-3.5 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500">
                <AlertCircle size={22} />
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">HẾT HẠN / KHÓA</p>
                <p className="text-2xl font-extrabold text-rose-600 leading-tight">{expiredCount + lockedCount}</p>
                <p className="text-[11px] text-gray-500 flex items-center gap-1">
                  <span className="text-rose-500">⚠️</span> {expiredCount} hết hạn / {lockedCount} khóa
                </p>
              </div>
            </div>

            {/* CARD 4: BẢN QUYỀN & AI PRO */}
            <div className="p-4 rounded-2xl bg-white border border-gray-200/80 flex items-center gap-3.5 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500">
                <Sparkles size={22} />
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">BẢN QUYỀN &amp; AI PRO</p>
                <p className="text-2xl font-extrabold text-gray-900 leading-tight">{activeCount} / {totalCount} Pro Key</p>
                <p className="text-[11px] text-gray-500 flex items-center gap-1">
                  <span className="text-blue-500">🔑</span> Cấp quyền AI Gateway
                </p>
              </div>
            </div>
          </div>

          {/* MAIN TABLE SECTION - KHUNG TRẮNG CARD ROBUST */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-gray-900">Danh sách người dùng</h3>
                  <span className="px-2 py-0.5 rounded-md bg-orange-50 text-orange-600 border border-orange-200 text-[11px] font-bold">
                    {totalCount} thiết bị
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Quản trị viên có thể kiểm soát khóa, gia hạn, cấp lại key và giám sát phần cứng thời gian thực
                </p>
              </div>

              {/* Search Inside Table Card */}
              <div className="relative w-72">
                <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm tên hoặc email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Filter Tabs & Display Rows Dropdown */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                {[
                  { id: 'all', label: `Tất cả`, count: totalCount, activeClass: 'text-orange-600 bg-orange-50 border-orange-200' },
                  { id: 'online', label: `Đang Online`, count: onlineCount, activeClass: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
                  { id: 'offline', label: `Offline`, count: offlineCount, activeClass: 'text-blue-600 bg-blue-50 border-blue-200' },
                  { id: 'expired', label: `Hết hạn`, count: expiredCount, activeClass: 'text-rose-600 bg-rose-50 border-rose-200' },
                  { id: 'locked', label: `Tạm khóa`, count: lockedCount, activeClass: 'text-amber-600 bg-amber-50 border-amber-200' },
                ].map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                        isActive
                          ? `${tab.activeClass} shadow-sm`
                          : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-white shadow-xs' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 text-gray-500 text-xs">
                <span>Hiển thị:</span>
                <select className="bg-gray-50 border border-gray-200 rounded px-2 py-1 text-gray-700 focus:outline-none cursor-pointer">
                  <option value="10">10 dòng</option>
                  <option value="25">25 dòng</option>
                  <option value="50">50 dòng</option>
                </select>
              </div>
            </div>

            {/* TABLE CHUẨN MINTFORGE */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-[10px] uppercase font-bold text-gray-400 tracking-wider bg-gray-50/70">
                    <th className="py-3 px-3">KHÁCH HÀNG</th>
                    <th className="py-3 px-3">GÓI &amp; BẢN QUYỀN</th>
                    <th className="py-3 px-3">MÃ MÁY (HWID)</th>
                    <th className="py-3 px-3">LICENSE KEY</th>
                    <th className="py-3 px-3">THỜI HẠN</th>
                    <th className="py-3 px-3">PHIÊN HOẠT ĐỘNG</th>
                    <th className="py-3 px-3 text-right">THAO TÁC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredLicenses.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-gray-400">
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
                        <tr key={lic.id} className="hover:bg-gray-50/90 transition-colors group">
                          {/* 1. KHÁCH HÀNG */}
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-[#111827] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                                {avatarLetters}
                              </div>
                              <div>
                                <div className="font-bold text-gray-900 flex items-center gap-1.5">
                                  <span>{lic.customer_name}</span>
                                  {lic.is_locked && (
                                    <span className="px-1.5 py-0.2 rounded bg-rose-50 text-rose-600 border border-rose-200 text-[9px] font-bold">
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
                                <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-[11px] shadow-xs flex items-center gap-1">
                                  <Sparkles size={11} />
                                  <span>Lifetime VIP</span>
                                </span>
                              ) : (
                                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-600 font-bold text-[11px]">
                                  AI Pro
                                </span>
                              )}
                              <span className="text-[11px] text-gray-400 font-mono">{lic.daily_limit || '100/d'}</span>
                            </div>
                          </td>

                          {/* 3. MÃ MÁY HWID */}
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-1.5">
                              <span className="px-1.5 py-0.5 rounded bg-gray-100 text-[10px] font-mono text-gray-600 border border-gray-200">
                                {lic.machine_id?.startsWith('Win') ? 'Win' : 'PC'}
                              </span>
                              <span className="font-mono text-[11px] text-gray-700 font-medium">
                                {lic.machine_id?.length > 20
                                  ? `${lic.machine_id.substring(0, 10)}...${lic.machine_id.substring(lic.machine_id.length - 6)}`
                                  : lic.machine_id}
                              </span>
                              <button
                                onClick={() => handleCopy(lic.machine_id, `hwid_${lic.id}`)}
                                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                                title="Sao chép HWID"
                              >
                                {copiedKey === `hwid_${lic.id}` ? (
                                  <Check size={12} className="text-emerald-500" />
                                ) : (
                                  <Copy size={12} />
                                )}
                              </button>
                            </div>
                          </td>

                          {/* 4. LICENSE KEY */}
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[11px] text-gray-800 bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
                                {lic.license_key}
                              </span>
                              <button
                                onClick={() => handleCopy(lic.full_license_key || lic.license_key, `key_${lic.id}`)}
                                className="text-gray-400 hover:text-orange-500 transition-colors cursor-pointer"
                                title="Sao chép toàn bộ License Key"
                              >
                                {copiedKey === `key_${lic.id}` ? (
                                  <Check size={12} className="text-emerald-500" />
                                ) : (
                                  <Copy size={12} />
                                )}
                              </button>
                              <button
                                onClick={() => alert(`License Key đầy đủ: ${lic.full_license_key || lic.license_key}`)}
                                className="text-gray-400 hover:text-blue-500 transition-colors cursor-pointer"
                                title="Xem đầy đủ"
                              >
                                <RotateCw size={11} />
                              </button>
                            </div>
                          </td>

                          {/* 5. THỜI HẠN */}
                          <td className="py-3.5 px-3">
                            {lic.is_lifetime ? (
                              <span className="px-2 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-purple-600 text-[11px] font-bold inline-flex items-center gap-1">
                                <Sparkles size={11} />
                                <span>Vĩnh viễn</span>
                              </span>
                            ) : isExpired ? (
                              <div className="flex items-center gap-1.5">
                                <span className="text-[11px] text-gray-500 font-mono">
                                  {lic.expires_at ? new Date(lic.expires_at).toLocaleDateString('vi-VN') : '21/09/2026'}
                                </span>
                                <span className="px-1.5 py-0.2 rounded bg-rose-50 border border-rose-200 text-rose-600 text-[10px] font-bold">
                                  Đã hết hạn
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <span className="text-[11px] text-emerald-600 font-bold font-mono">
                                  Còn {lic.days_remaining} ngày
                                </span>
                              </div>
                            )}
                          </td>

                          {/* 6. PHIÊN HOẠT ĐỘNG */}
                          <td className="py-3.5 px-3">
                            {lic.is_online ? (
                              <span className="inline-flex items-center gap-1.5 text-emerald-600 font-semibold">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                                <span>Online</span>
                              </span>
                            ) : isExpired ? (
                              <span className="inline-flex items-center gap-1 text-rose-600 text-[11px] font-medium">
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
                                className="px-3 py-1.5 rounded-lg bg-[#059669] hover:bg-[#047857] text-white font-bold text-[11px] transition-all flex items-center gap-1 shadow-sm active:scale-95 cursor-pointer"
                                title="Gia hạn thêm thời gian sử dụng"
                              >
                                <RefreshCw size={11} />
                                <span>Gia hạn</span>
                              </button>

                              {/* Nút Khóa / Mở khóa */}
                              <button
                                onClick={() => toggleLockLicense(lic.id)}
                                className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                                  lic.is_locked
                                    ? 'bg-rose-50 border-rose-300 text-rose-600 hover:bg-rose-100'
                                    : 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100'
                                }`}
                                title={lic.is_locked ? 'Mở khóa thiết bị' : 'Khóa thiết bị'}
                              >
                                <Shield size={13} />
                              </button>

                              {/* Nút Lock Device */}
                              <button
                                onClick={() => toggleLockLicense(lic.id)}
                                className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-600 transition-colors cursor-pointer"
                                title="Tạm dừng phiên máy"
                              >
                                <Lock size={13} />
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
                                className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 transition-colors cursor-pointer"
                                title="Sửa thông tin"
                              >
                                <Edit2 size={13} />
                              </button>

                              {/* Nút Xóa */}
                              <button
                                onClick={() => handleDelete(lic.id, lic.customer_name)}
                                className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 transition-colors cursor-pointer"
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
            <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
              <div>
                Hiển thị 1 – {filteredLicenses.length} trong tổng số {totalCount} người dùng
              </div>
              <div className="flex items-center gap-1.5">
                <button className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 cursor-not-allowed">
                  &lt;
                </button>
                <button className="w-7 h-7 rounded-lg bg-[#f97316] text-white font-bold flex items-center justify-center shadow-xs">
                  1
                </button>
                <button className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 cursor-not-allowed">
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
              className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white border-none font-bold"
              onClick={handleCreateSubmit}
            >
              Tạo &amp; Cấp Key Ngay
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs text-left">
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Tên khách hàng / Tên máy:</label>
            <input
              type="text"
              placeholder="VD: Máy nhà, hoangdinhchien..."
              value={createForm.customer_name}
              onChange={(e) => setCreateForm({ ...createForm, customer_name: e.target.value })}
              className="w-full bg-white border border-gray-300 rounded-lg p-2 text-gray-900 focus:outline-none focus:border-orange-500 shadow-xs"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">Email nhận bản quyền (*):</label>
            <input
              type="email"
              required
              placeholder="khachhang@gmail.com"
              value={createForm.user_email}
              onChange={(e) => setCreateForm({ ...createForm, user_email: e.target.value })}
              className="w-full bg-white border border-gray-300 rounded-lg p-2 text-gray-900 focus:outline-none focus:border-orange-500 shadow-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Gói bản quyền:</label>
              <select
                value={createForm.package_type}
                onChange={(e) => setCreateForm({ ...createForm, package_type: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded-lg p-2 text-gray-900 focus:outline-none"
              >
                <option value="AI Pro">AI Pro (Tiêu chuẩn)</option>
                <option value="Lifetime VIP">Lifetime VIP (Không giới hạn)</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">Giới hạn ngày:</label>
              <input
                type="text"
                value={createForm.daily_limit}
                onChange={(e) => setCreateForm({ ...createForm, daily_limit: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded-lg p-2 text-gray-900"
              />
            </div>
          </div>

          <div className="p-3 bg-orange-50/60 rounded-xl border border-orange-200/80 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={createForm.is_lifetime}
                onChange={(e) => setCreateForm({ ...createForm, is_lifetime: e.target.checked })}
                className="rounded text-orange-600 focus:ring-orange-500"
              />
              <span className="font-bold text-orange-800">Cấp Bản Quyền Vĩnh Viễn (Lifetime VIP)</span>
            </label>

            {!createForm.is_lifetime && (
              <div>
                <label className="block text-gray-600 text-[11px] mb-1">Thời hạn sử dụng (ngày):</label>
                <div className="grid grid-cols-3 gap-2">
                  {[30, 90, 365].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setCreateForm({ ...createForm, days: d })}
                      className={`py-1.5 rounded-lg border text-xs font-semibold ${
                        createForm.days === d
                          ? 'bg-orange-500 text-white border-orange-500 shadow-xs'
                          : 'bg-white border-gray-300 text-gray-700'
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
            <label className="block text-gray-700 font-semibold mb-1">Khóa cứng máy trạm (HWID - Tùy chọn):</label>
            <input
              type="text"
              placeholder="Để trống nếu để máy khách tự liên kết khi nhập key lần đầu"
              value={createForm.machine_id}
              onChange={(e) => setCreateForm({ ...createForm, machine_id: e.target.value })}
              className="w-full bg-white border border-gray-300 rounded-lg p-2 text-gray-900 font-mono text-xs focus:outline-none"
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
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-gray-500">Khách hàng:</span>
              <span className="font-bold text-gray-800">{selectedLicense?.customer_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Mã Key:</span>
              <span className="font-mono text-orange-600 font-bold">{selectedLicense?.full_license_key || selectedLicense?.license_key}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Thời hạn hiện tại:</span>
              <span className="font-semibold text-rose-600">
                {selectedLicense?.is_lifetime ? 'Vĩnh viễn' : `Còn ${selectedLicense?.days_remaining || 0} ngày`}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Chọn gói thời gian gia hạn thêm:</label>
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
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-xs'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
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
                  ? 'bg-purple-50 border-purple-500 text-purple-700 shadow-xs'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Sparkles size={14} className="text-amber-500" />
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
            <label className="block text-gray-700 font-semibold mb-1">Tên khách hàng:</label>
            <input
              type="text"
              value={editForm.customer_name}
              onChange={(e) => setEditForm({ ...editForm, customer_name: e.target.value })}
              className="w-full bg-white border border-gray-300 rounded-lg p-2 text-gray-900"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">Email:</label>
            <input
              type="email"
              value={editForm.user_email}
              onChange={(e) => setEditForm({ ...editForm, user_email: e.target.value })}
              className="w-full bg-white border border-gray-300 rounded-lg p-2 text-gray-900"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">Mã khóa phần cứng (HWID):</label>
            <input
              type="text"
              value={editForm.machine_id}
              onChange={(e) => setEditForm({ ...editForm, machine_id: e.target.value })}
              className="w-full bg-white border border-gray-300 rounded-lg p-2 text-gray-900 font-mono"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminLicensesPage;
