import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Search,
  RefreshCw,
  Plus,
  CheckCircle2,
  Lock,
  Unlock,
  Key,
  Laptop,
  Sparkles,
  Sliders,
  Check,
  X,
  ChevronRight,
  FileVideo,
  BookOpen,
  Volume2,
  Cpu,
  Layers,
  HelpCircle,
  Copy,
  AlertCircle
} from 'lucide-react';
import { AdminSidebar } from '../components/AdminSidebar';
import { AdminHeader } from '../components/AdminHeader';
import { Modal } from '@/shared/components/modal/Modal';
import { Button } from '@/shared/components/ui/Button';
import useAdminStore, { DEFAULT_PERMISSIONS, PERMISSION_PRESETS } from '../store/adminStore';

export const AdminPermissionsPage = () => {
  const navigate = useNavigate();
  const {
    clientAccounts,
    updateAccountPermissions,
    toggleAccountLock,
    addKeyToAccount,
  } = useAdminStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notification, setNotification] = useState(null);

  // Modal custom permissions
  const [selectedAccountForPerms, setSelectedAccountForPerms] = useState(null);
  const [tempPermissions, setTempPermissions] = useState({ ...DEFAULT_PERMISSIONS });

  // Modal add key
  const [selectedAccountForKey, setSelectedAccountForKey] = useState(null);
  const [keyForm, setKeyForm] = useState({
    package_type: 'AI Pro Studio (365 ngày)',
    days_remaining: 365,
    is_lifetime: false,
    custom_key: '',
  });

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('Đã làm mới ma trận phân quyền!');
    }, 400);
  };

  // Toggle 1 permission directly from the table
  const handleToggleSinglePermission = (account, permKey) => {
    const updated = {
      ...(account.permissions || DEFAULT_PERMISSIONS),
      [permKey]: !account.permissions?.[permKey],
    };
    updateAccountPermissions(account.id, updated);
    showToast(`Đã cập nhật quyền [${permKey}] cho máy ${account.machine_name}`);
  };

  // Quick apply preset to an account
  const handleApplyPresetToAccount = (account, presetKey) => {
    const preset = PERMISSION_PRESETS[presetKey];
    if (preset) {
      updateAccountPermissions(account.id, preset.permissions);
      showToast(`Đã áp dụng mẫu "${preset.label}" cho máy ${account.machine_name}`);
    }
  };

  // Open modal edit perms
  const handleOpenEditPerms = (account) => {
    setSelectedAccountForPerms(account);
    setTempPermissions({ ...(account.permissions || DEFAULT_PERMISSIONS) });
  };

  // Save modal perms
  const handleSaveModalPerms = () => {
    if (selectedAccountForPerms) {
      updateAccountPermissions(selectedAccountForPerms.id, tempPermissions);
      showToast(`Đã lưu phân quyền chi tiết cho máy ${selectedAccountForPerms.machine_name}`);
      setSelectedAccountForPerms(null);
    }
  };

  // Submit Add Key
  const handleAddKeySubmit = (e) => {
    e.preventDefault();
    if (!selectedAccountForKey) return;
    const newKey = addKeyToAccount(selectedAccountForKey.id, keyForm);
    showToast(`Đã cấp key mới ${newKey.key} cho tài khoản ${selectedAccountForKey.machine_name}`);
    setSelectedAccountForKey(null);
    setKeyForm({
      package_type: 'AI Pro Studio (365 ngày)',
      days_remaining: 365,
      is_lifetime: false,
      custom_key: '',
    });
  };

  // Stats calculation
  const totalAccounts = clientAccounts.length;
  const fullAccessCount = clientAccounts.filter((acc) => {
    const p = acc.permissions || {};
    return Object.values(p).every((val) => val === true);
  }).length;
  const restrictedCount = totalAccounts - fullAccessCount;
  const lockedCount = clientAccounts.filter((acc) => !acc.is_active).length;

  // Filter accounts
  const filteredAccounts = clientAccounts.filter((acc) => {
    const q = searchQuery.toLowerCase();
    const match =
      acc.machine_name?.toLowerCase().includes(q) ||
      acc.customer_name?.toLowerCase().includes(q) ||
      acc.user_email?.toLowerCase().includes(q) ||
      acc.machine_id?.toLowerCase().includes(q);

    if (!match) return false;
    if (filterRole === 'full') {
      const p = acc.permissions || {};
      return Object.values(p).every((val) => val === true);
    }
    if (filterRole === 'restricted') {
      const p = acc.permissions || {};
      return !Object.values(p).every((val) => val === true);
    }
    if (filterRole === 'locked') return !acc.is_active;
    return true;
  });

  return (
    <div className="flex h-screen w-screen bg-[#f8fafc] text-slate-800 overflow-hidden font-sans antialiased">
      {/* 1. Sidebar */}
      <AdminSidebar activeTab="permissions" />

      {/* 2. Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <AdminHeader onSearch={(q) => setSearchQuery(q)} />

        <main className="flex-1 overflow-y-auto scrollable-body p-6 space-y-6 bg-[#f8fafc]">
          {/* Toast notification */}
          {notification && (
            <div className="fixed top-16 right-8 z-50 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-xl border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-top-3">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span>{notification}</span>
            </div>
          )}

          {/* Breadcrumb & Section Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[11px] text-gray-500">
              <span className="flex items-center gap-1">
                <span>🏠</span> MintForge
              </span>
              <span>&gt;</span>
              <span>Quản trị hệ thống</span>
              <span>&gt;</span>
              <span className="text-orange-600 font-semibold bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                Ma trận phân quyền Tool
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20 flex-shrink-0">
                  <Shield size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                      Ma Trận Phân Quyền & Quyền Hạn Tool
                    </h1>
                    <span className="px-2.5 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-orange-600 text-[11px] font-bold">
                      Kiểm soát theo Tài khoản máy & Key
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Thiết lập danh mục menu và chức năng cho từng máy khách. Khi máy khách nhập Key vào Tool, Tool sẽ tự động chỉ hiển thị các phân hệ được cấp phép tại đây.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 flex-shrink-0">
                <button
                  onClick={handleRefresh}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-xs font-semibold transition-all shadow-sm active:scale-95 cursor-pointer"
                >
                  <RefreshCw size={13} className={isRefreshing ? 'animate-spin text-orange-500' : ''} />
                  <span>Làm mới</span>
                </button>

                <button
                  onClick={() => navigate('/admin/users')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#ea580c] hover:bg-[#c2410c] text-white text-xs font-bold transition-all shadow-md shadow-orange-500/20 active:scale-95 cursor-pointer"
                >
                  <Laptop size={14} />
                  <span>Quản lý Tài Khoản Máy</span>
                </button>
              </div>
            </div>
          </div>

          {/* 4 STATS CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-gray-200/80 flex items-center gap-3.5 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500">
                <Laptop size={22} />
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">TỔNG MÁY KHÁCH</p>
                <p className="text-2xl font-extrabold text-gray-900 leading-tight">{totalAccounts}</p>
                <p className="text-[11px] text-gray-500">Thiết bị cấu hình quyền</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-gray-200/80 flex items-center gap-3.5 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500">
                <Sparkles size={22} />
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">TOÀN QUYỀN (VIP)</p>
                <p className="text-2xl font-extrabold text-gray-900 leading-tight">{fullAccessCount}</p>
                <p className="text-[11px] text-emerald-600 font-medium">Bật toàn bộ 13 module</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-gray-200/80 flex items-center gap-3.5 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500">
                <Sliders size={22} />
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">GIỚI HẠN QUYỀN</p>
                <p className="text-2xl font-extrabold text-gray-900 leading-tight">{restrictedCount}</p>
                <p className="text-[11px] text-blue-600 font-medium">Chỉ mở module theo gói</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-gray-200/80 flex items-center gap-3.5 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500">
                <Lock size={22} />
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">TẠM KHÓA TRUY CẬP</p>
                <p className="text-2xl font-extrabold text-gray-900 leading-tight">{lockedCount}</p>
                <p className="text-[11px] text-rose-600 font-medium">Bị chặn khi đăng nhập</p>
              </div>
            </div>
          </div>

          {/* NHÓM MẪU PHÂN QUYỀN NHANH (PRESETS) */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Sparkles size={16} className="text-orange-500" />
                  <span>Các Gói Quyền Mẫu Chuẩn (Permission Presets)</span>
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Chọn mẫu để áp dụng nhanh quyền hạn cho bất kỳ máy khách nào bên dưới bảng ma trận.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {Object.entries(PERMISSION_PRESETS).map(([pKey, pVal]) => (
                <div
                  key={pKey}
                  className="p-3.5 rounded-xl border border-gray-200 bg-slate-50/60 hover:bg-orange-50/30 hover:border-orange-200 transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-900">{pVal.label}</span>
                      <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-white border border-gray-200 text-gray-600">
                        {pKey}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 leading-relaxed">{pVal.desc}</p>
                  </div>

                  <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">
                      Đã bật:{' '}
                      <strong className="text-orange-600 font-bold">
                        {Object.values(pVal.permissions).filter(Boolean).length}/13
                      </strong>{' '}
                      quyền
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* BẢNG MA TRẬN PHÂN QUYỀN (PERMISSION MATRIX TABLE) */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
            {/* Header Toolbar */}
            <div className="p-4 border-b border-gray-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm theo tên máy, HWID, khách hàng..."
                    className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 w-64 transition-all"
                  />
                </div>

                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-xs font-medium">
                  <button
                    onClick={() => setFilterRole('all')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      filterRole === 'all'
                        ? 'bg-white text-gray-900 font-bold shadow-sm'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    Tất cả ({totalAccounts})
                  </button>
                  <button
                    onClick={() => setFilterRole('full')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      filterRole === 'full'
                        ? 'bg-white text-emerald-600 font-bold shadow-sm'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    Toàn quyền ({fullAccessCount})
                  </button>
                  <button
                    onClick={() => setFilterRole('restricted')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      filterRole === 'restricted'
                        ? 'bg-white text-blue-600 font-bold shadow-sm'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    Giới hạn ({restrictedCount})
                  </button>
                  <button
                    onClick={() => setFilterRole('locked')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      filterRole === 'locked'
                        ? 'bg-white text-rose-600 font-bold shadow-sm'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    Đã khóa ({lockedCount})
                  </button>
                </div>
              </div>

              <div className="text-xs text-slate-500">
                Hiển thị <strong className="text-slate-900 font-bold">{filteredAccounts.length}</strong> máy khách
              </div>
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-gray-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold select-none">
                    <th className="py-3 px-4 min-w-[220px]">Tài khoản máy khách</th>
                    <th className="py-3 px-3 text-center min-w-[170px] bg-amber-50/50 border-x border-amber-200/50 text-amber-900">
                      Menu Nguồn (4 quyền)
                    </th>
                    <th className="py-3 px-3 text-center min-w-[240px] bg-blue-50/50 border-r border-blue-200/50 text-blue-900">
                      Menu Công Cụ (6 quyền)
                    </th>
                    <th className="py-3 px-3 text-center min-w-[200px] bg-emerald-50/50 border-r border-emerald-200/50 text-emerald-900">
                      Module Làm Việc (3 quyền)
                    </th>
                    <th className="py-3 px-4 text-center min-w-[150px]">Gán mẫu & Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredAccounts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        Không tìm thấy tài khoản máy khách nào phù hợp với bộ lọc.
                      </td>
                    </tr>
                  ) : (
                    filteredAccounts.map((acc) => {
                      const p = acc.permissions || DEFAULT_PERMISSIONS;
                      const isFull = Object.values(p).every(Boolean);

                      return (
                        <tr
                          key={acc.id}
                          className={`hover:bg-orange-50/20 transition-colors ${
                            !acc.is_active ? 'bg-rose-50/20 opacity-75' : ''
                          }`}
                        >
                          {/* 1. Account Info */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-900 hover:text-orange-600 transition-colors">
                                  {acc.machine_name}
                                </span>
                                {!acc.is_active ? (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-700">
                                    Đã khóa
                                  </span>
                                ) : isFull ? (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-700">
                                    Full VIP
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-700">
                                    Tùy biến
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-gray-500">
                                {acc.customer_name} • {acc.user_email}
                              </p>
                              <div className="flex items-center gap-2 pt-0.5">
                                <span className="font-mono text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                                  {acc.machine_id}
                                </span>
                                <span className="text-[10px] text-orange-600 font-semibold flex items-center gap-1">
                                  <Key size={11} /> {acc.keys?.length || 0} Key
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* 2. Menu Nguồn (4 checkboxes) */}
                          <td className="py-3 px-3 bg-amber-50/20 border-x border-amber-100">
                            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                              <button
                                onClick={() => handleToggleSinglePermission(acc, 'source_download_url')}
                                className={`px-2 py-1 rounded text-left border transition-all flex items-center justify-between cursor-pointer ${
                                  p.source_download_url
                                    ? 'bg-amber-100/70 border-amber-300 text-amber-900 font-semibold'
                                    : 'bg-white border-gray-200 text-gray-400'
                                }`}
                                title="Bật/Tắt Tải video URL"
                              >
                                <span>Tải URL</span>
                                {p.source_download_url ? <Check size={11} className="text-amber-700" /> : <X size={11} />}
                              </button>

                              <button
                                onClick={() => handleToggleSinglePermission(acc, 'source_queue')}
                                className={`px-2 py-1 rounded text-left border transition-all flex items-center justify-between cursor-pointer ${
                                  p.source_queue
                                    ? 'bg-amber-100/70 border-amber-300 text-amber-900 font-semibold'
                                    : 'bg-white border-gray-200 text-gray-400'
                                }`}
                                title="Bật/Tắt Hàng chờ tải qua đêm"
                              >
                                <span>Hàng chờ tải</span>
                                {p.source_queue ? <Check size={11} className="text-amber-700" /> : <X size={11} />}
                              </button>

                              <button
                                onClick={() => handleToggleSinglePermission(acc, 'source_channel_scan')}
                                className={`px-2 py-1 rounded text-left border transition-all flex items-center justify-between cursor-pointer ${
                                  p.source_channel_scan
                                    ? 'bg-amber-100/70 border-amber-300 text-amber-900 font-semibold'
                                    : 'bg-white border-gray-200 text-gray-400'
                                }`}
                                title="Bật/Tắt Quét kênh tải hàng loạt"
                              >
                                <span>Quét kênh</span>
                                {p.source_channel_scan ? <Check size={11} className="text-amber-700" /> : <X size={11} />}
                              </button>

                              <button
                                onClick={() => handleToggleSinglePermission(acc, 'source_import_srt')}
                                className={`px-2 py-1 rounded text-left border transition-all flex items-center justify-between cursor-pointer ${
                                  p.source_import_srt
                                    ? 'bg-amber-100/70 border-amber-300 text-amber-900 font-semibold'
                                    : 'bg-white border-gray-200 text-gray-400'
                                }`}
                                title="Bật/Tắt Chọn file SRT phụ đề"
                              >
                                <span>Nhập SRT</span>
                                {p.source_import_srt ? <Check size={11} className="text-amber-700" /> : <X size={11} />}
                              </button>
                            </div>
                          </td>

                          {/* 3. Menu Công Cụ (6 checkboxes) */}
                          <td className="py-3 px-3 bg-blue-50/20 border-r border-blue-100">
                            <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                              <button
                                onClick={() => handleToggleSinglePermission(acc, 'tool_queue')}
                                className={`px-2 py-1 rounded text-left border transition-all flex items-center justify-between cursor-pointer ${
                                  p.tool_queue
                                    ? 'bg-blue-100/70 border-blue-300 text-blue-900 font-semibold'
                                    : 'bg-white border-gray-200 text-gray-400'
                                }`}
                              >
                                <span>Hàng dịch</span>
                                {p.tool_queue ? <Check size={11} className="text-blue-700" /> : <X size={11} />}
                              </button>

                              <button
                                onClick={() => handleToggleSinglePermission(acc, 'tool_video_split')}
                                className={`px-2 py-1 rounded text-left border transition-all flex items-center justify-between cursor-pointer ${
                                  p.tool_video_split
                                    ? 'bg-blue-100/70 border-blue-300 text-blue-900 font-semibold'
                                    : 'bg-white border-gray-200 text-gray-400'
                                }`}
                              >
                                <span>Ghép/Tách</span>
                                {p.tool_video_split ? <Check size={11} className="text-blue-700" /> : <X size={11} />}
                              </button>

                              <button
                                onClick={() => handleToggleSinglePermission(acc, 'tool_gpu')}
                                className={`px-2 py-1 rounded text-left border transition-all flex items-center justify-between cursor-pointer ${
                                  p.tool_gpu
                                    ? 'bg-blue-100/70 border-blue-300 text-blue-900 font-semibold'
                                    : 'bg-white border-gray-200 text-gray-400'
                                }`}
                              >
                                <span>GPU</span>
                                {p.tool_gpu ? <Check size={11} className="text-blue-700" /> : <X size={11} />}
                              </button>

                              <button
                                onClick={() => handleToggleSinglePermission(acc, 'tool_voice_clone')}
                                className={`px-2 py-1 rounded text-left border transition-all flex items-center justify-between cursor-pointer ${
                                  p.tool_voice_clone
                                    ? 'bg-blue-100/70 border-blue-300 text-blue-900 font-semibold'
                                    : 'bg-white border-gray-200 text-gray-400'
                                }`}
                              >
                                <span>Clone Voice</span>
                                {p.tool_voice_clone ? <Check size={11} className="text-blue-700" /> : <X size={11} />}
                              </button>

                              <button
                                onClick={() => handleToggleSinglePermission(acc, 'tool_offline_voice')}
                                className={`px-2 py-1 rounded text-left border transition-all flex items-center justify-between cursor-pointer ${
                                  p.tool_offline_voice
                                    ? 'bg-blue-100/70 border-blue-300 text-blue-900 font-semibold'
                                    : 'bg-white border-gray-200 text-gray-400'
                                }`}
                              >
                                <span>Giọng Offline</span>
                                {p.tool_offline_voice ? <Check size={11} className="text-blue-700" /> : <X size={11} />}
                              </button>

                              <button
                                onClick={() => handleToggleSinglePermission(acc, 'tool_api_keys')}
                                className={`px-2 py-1 rounded text-left border transition-all flex items-center justify-between cursor-pointer ${
                                  p.tool_api_keys
                                    ? 'bg-blue-100/70 border-blue-300 text-blue-900 font-semibold'
                                    : 'bg-white border-gray-200 text-gray-400'
                                }`}
                              >
                                <span>API Keys</span>
                                {p.tool_api_keys ? <Check size={11} className="text-blue-700" /> : <X size={11} />}
                              </button>
                            </div>
                          </td>

                          {/* 4. Module Làm Việc (3 checkboxes) */}
                          <td className="py-3 px-3 bg-emerald-50/20 border-r border-emerald-100">
                            <div className="space-y-1.5 text-[11px]">
                              <button
                                onClick={() => handleToggleSinglePermission(acc, 'module_video_dubbing')}
                                className={`w-full px-2 py-1 rounded text-left border transition-all flex items-center justify-between cursor-pointer ${
                                  p.module_video_dubbing
                                    ? 'bg-emerald-100/70 border-emerald-300 text-emerald-900 font-semibold'
                                    : 'bg-white border-gray-200 text-gray-400'
                                }`}
                              >
                                <span>1. Video Dubbing Studio</span>
                                {p.module_video_dubbing ? <Check size={11} className="text-emerald-700" /> : <X size={11} />}
                              </button>

                              <button
                                onClick={() => handleToggleSinglePermission(acc, 'module_movie_review')}
                                className={`w-full px-2 py-1 rounded text-left border transition-all flex items-center justify-between cursor-pointer ${
                                  p.module_movie_review
                                    ? 'bg-emerald-100/70 border-emerald-300 text-emerald-900 font-semibold'
                                    : 'bg-white border-gray-200 text-gray-400'
                                }`}
                              >
                                <span>2. Comic & Movie Review</span>
                                {p.module_movie_review ? <Check size={11} className="text-emerald-700" /> : <X size={11} />}
                              </button>

                              <button
                                onClick={() => handleToggleSinglePermission(acc, 'module_subtitles_editor')}
                                className={`w-full px-2 py-1 rounded text-left border transition-all flex items-center justify-between cursor-pointer ${
                                  p.module_subtitles_editor
                                    ? 'bg-emerald-100/70 border-emerald-300 text-emerald-900 font-semibold'
                                    : 'bg-white border-gray-200 text-gray-400'
                                }`}
                              >
                                <span>3. Trình Biên Tập Phụ Đề</span>
                                {p.module_subtitles_editor ? <Check size={11} className="text-emerald-700" /> : <X size={11} />}
                              </button>
                            </div>
                          </td>

                          {/* 5. Gán nhanh mẫu & Thao tác */}
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex flex-col gap-1.5 items-center">
                              {/* Quick Presets dropdown */}
                              <div className="w-full flex items-center gap-1">
                                <button
                                  onClick={() => handleApplyPresetToAccount(acc, 'FULL_ACCESS')}
                                  className="flex-1 py-1 px-1.5 text-[10px] font-bold rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                                  title="Gán nhanh toàn quyền"
                                >
                                  Full VIP
                                </button>
                                <button
                                  onClick={() => handleApplyPresetToAccount(acc, 'DUBBING_STANDARD')}
                                  className="flex-1 py-1 px-1.5 text-[10px] font-bold rounded bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition-colors"
                                  title="Gán chuyên lồng tiếng"
                                >
                                  Dubbing
                                </button>
                                <button
                                  onClick={() => handleApplyPresetToAccount(acc, 'COMIC_REVIEW')}
                                  className="flex-1 py-1 px-1.5 text-[10px] font-bold rounded bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition-colors"
                                  title="Gán chuyên review tranh"
                                >
                                  Comic
                                </button>
                              </div>

                              <div className="w-full flex items-center gap-1">
                                <button
                                  onClick={() => handleOpenEditPerms(acc)}
                                  className="flex-1 py-1 px-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                                >
                                  <Sliders size={11} />
                                  <span>Chi tiết</span>
                                </button>

                                <button
                                  onClick={() => {
                                    setSelectedAccountForKey(acc);
                                  }}
                                  className="flex-1 py-1 px-2 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-600 text-[10px] font-bold border border-orange-200 transition-all flex items-center justify-center gap-1 cursor-pointer"
                                  title="Cấp License Key cho máy này"
                                >
                                  <Plus size={11} />
                                  <span>Cấp Key</span>
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* MODAL CHI TIẾT PHÂN QUYỀN */}
      {selectedAccountForPerms && (
        <Modal
          isOpen={!!selectedAccountForPerms}
          onClose={() => setSelectedAccountForPerms(null)}
          title={`Phân quyền truy cập Tool: ${selectedAccountForPerms.machine_name}`}
          subtitle={`HWID: ${selectedAccountForPerms.machine_id} • Khách hàng: ${selectedAccountForPerms.customer_name}`}
          size="lg"
          footer={
            <div className="flex items-center justify-between w-full">
              <div className="text-xs text-slate-500">
                Đã bật{' '}
                <strong className="text-orange-600 font-bold">
                  {Object.values(tempPermissions).filter(Boolean).length}/13
                </strong>{' '}
                quyền
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedAccountForPerms(null)}>
                  Hủy bỏ
                </Button>
                <Button variant="primary" size="sm" onClick={handleSaveModalPerms}>
                  Lưu thiết lập quyền
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-5 text-xs text-slate-700 max-h-[70vh] overflow-y-auto pr-1">
            {/* Presets banner */}
            <div className="p-3 bg-orange-50/60 border border-orange-200 rounded-xl space-y-2">
              <p className="text-[11px] font-bold text-orange-800">Áp dụng nhanh gói mẫu quyền:</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Object.entries(PERMISSION_PRESETS).map(([k, v]) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setTempPermissions({ ...v.permissions })}
                    className="p-2 bg-white rounded-lg border border-orange-200 hover:border-orange-500 hover:bg-orange-50 text-left transition-all cursor-pointer"
                  >
                    <p className="font-bold text-[11px] text-gray-900 truncate">{v.label}</p>
                    <p className="text-[9.5px] text-gray-500 line-clamp-1">{v.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Group 1: Menu Nguồn */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 border-b border-gray-200 pb-1">
                <FileVideo size={14} className="text-amber-600" />
                <h3 className="font-bold text-xs text-gray-900 uppercase tracking-wide">
                  1. Menu Nguồn (Source Menus)
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  { key: 'source_download_url', label: 'Tải video (URL)', desc: 'Tải video từ YouTube, Douyin, TikTok' },
                  { key: 'source_queue', label: 'Hàng chờ tải (qua đêm)', desc: 'Cho phép xếp danh sách tải liên tục' },
                  { key: 'source_channel_scan', label: 'Quét kênh (tải hàng loạt)', desc: 'Quét và cào toàn bộ danh sách kênh' },
                  { key: 'source_import_srt', label: 'Chọn SRT phụ đề', desc: 'Nhập phụ đề ngoài vào hệ thống' },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="flex items-start gap-2.5 p-2.5 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-white hover:border-orange-300 transition-all cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={!!tempPermissions[item.key]}
                      onChange={(e) =>
                        setTempPermissions({ ...tempPermissions, [item.key]: e.target.checked })
                      }
                      className="mt-0.5 rounded text-orange-600 focus:ring-orange-500 w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <p className="font-bold text-gray-900">{item.label}</p>
                      <p className="text-[11px] text-gray-500">{item.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Group 2: Menu Công Cụ */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 border-b border-gray-200 pb-1">
                <Sliders size={14} className="text-blue-600" />
                <h3 className="font-bold text-xs text-gray-900 uppercase tracking-wide">
                  2. Menu Công Cụ (Tools & Utilities)
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  { key: 'tool_queue', label: 'Hàng chờ dịch', desc: 'Xếp hàng dịch video phụ đề liên tục' },
                  { key: 'tool_video_split', label: 'Ghép / Tách video', desc: 'Công cụ cắt ghép ffmpeg nhanh' },
                  { key: 'tool_gpu', label: 'Tăng tốc GPU (CUDA/DirectML)', desc: 'Tận dụng GPU máy khách tăng tốc' },
                  { key: 'tool_voice_clone', label: 'Giọng clone (tải gói)', desc: 'Sử dụng và huấn luyện giọng đọc AI' },
                  { key: 'tool_offline_voice', label: 'Giọng Việt offline', desc: 'Bộ phát giọng nội bộ không tốn API' },
                  { key: 'tool_api_keys', label: 'Cấu hình API Keys cá nhân', desc: 'Cho phép người dùng cấu hình key riêng' },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="flex items-start gap-2.5 p-2.5 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-white hover:border-orange-300 transition-all cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={!!tempPermissions[item.key]}
                      onChange={(e) =>
                        setTempPermissions({ ...tempPermissions, [item.key]: e.target.checked })
                      }
                      className="mt-0.5 rounded text-orange-600 focus:ring-orange-500 w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <p className="font-bold text-gray-900">{item.label}</p>
                      <p className="text-[11px] text-gray-500">{item.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Group 3: Module Làm Việc */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 border-b border-gray-200 pb-1">
                <Layers size={14} className="text-emerald-600" />
                <h3 className="font-bold text-xs text-gray-900 uppercase tracking-wide">
                  3. Module Không Gian Làm Việc (Workstations)
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  {
                    key: 'module_video_dubbing',
                    label: 'Video Dubbing Studio',
                    desc: 'Dịch thuật tự động và lồng tiếng video',
                  },
                  {
                    key: 'module_movie_review',
                    label: 'Review Truyện Tranh & Phim',
                    desc: 'Tạo kịch bản tóm tắt phim/manga',
                  },
                  {
                    key: 'module_subtitles_editor',
                    label: 'Biên Tập Phụ Đề & Mask',
                    desc: 'Chỉnh sửa timecode phụ đề và che mờ',
                  },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="flex flex-col justify-between p-3 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-white hover:border-orange-300 transition-all cursor-pointer select-none"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-900">{item.label}</span>
                        <input
                          type="checkbox"
                          checked={!!tempPermissions[item.key]}
                          onChange={(e) =>
                            setTempPermissions({ ...tempPermissions, [item.key]: e.target.checked })
                          }
                          className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4 cursor-pointer"
                        />
                      </div>
                      <p className="text-[11px] text-gray-500">{item.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL CẤP KEY NHANH */}
      {selectedAccountForKey && (
        <Modal
          isOpen={!!selectedAccountForKey}
          onClose={() => setSelectedAccountForKey(null)}
          title={`Cấp License Key Cho Máy: ${selectedAccountForKey.machine_name}`}
          subtitle={`HWID: ${selectedAccountForKey.machine_id} • Khách hàng: ${selectedAccountForKey.customer_name}`}
          size="md"
          footer={
            <div className="flex justify-end gap-2 w-full">
              <Button variant="outline" size="sm" onClick={() => setSelectedAccountForKey(null)}>
                Hủy bỏ
              </Button>
              <Button variant="primary" size="sm" onClick={handleAddKeySubmit}>
                Tạo và Kích Hoạt Key
              </Button>
            </div>
          }
        >
          <form onSubmit={handleAddKeySubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Gói bản quyền</label>
              <select
                value={keyForm.package_type}
                onChange={(e) => {
                  const val = e.target.value;
                  let days = 30;
                  let lifetime = false;
                  if (val.includes('365')) days = 365;
                  if (val.includes('90')) days = 90;
                  if (val.includes('Lifetime')) {
                    days = 9999;
                    lifetime = true;
                  }
                  setKeyForm({
                    ...keyForm,
                    package_type: val,
                    days_remaining: days,
                    is_lifetime: lifetime,
                  });
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
              >
                <option value="AI Pro Studio (365 ngày)">AI Pro Studio (365 ngày)</option>
                <option value="AI Standard (90 ngày)">AI Standard (90 ngày)</option>
                <option value="AI Monthly (30 ngày)">AI Monthly (30 ngày)</option>
                <option value="Lifetime VIP (Vĩnh viễn)">Lifetime VIP (Vĩnh viễn)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Mã Key tùy chỉnh (tùy chọn)</label>
              <input
                type="text"
                placeholder="Để trống hệ thống sẽ tự sinh mã WUKONG-XXXX-XXXX..."
                value={keyForm.custom_key}
                onChange={(e) => setKeyForm({ ...keyForm, custom_key: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl font-mono focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Key này sẽ được gán trực tiếp cho tài khoản máy khách và kế thừa toàn bộ ma trận phân quyền đã thiết lập.
              </p>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default AdminPermissionsPage;
