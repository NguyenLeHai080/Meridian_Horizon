import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Key,
  Shield,
  Edit2,
  Trash2,
  Lock,
  Unlock,
  Copy,
  Check,
  X,
  Laptop,
  CheckCircle2,
  Sliders,
  Sparkles,
  ChevronDown,
  Clock,
  Calendar,
  AlertCircle
} from 'lucide-react';
import useAdminStore, { DEFAULT_PERMISSIONS, PERMISSION_PRESETS } from '../store/adminStore';

export const AccountMachineManager = () => {
  const {
    clientAccounts,
    createAccount,
    updateAccount,
    deleteAccount,
    toggleAccountLock,
    addKeyToAccount,
    deleteKeyFromAccount,
    toggleKeyLock,
    updateAccountPermissions
  } = useAdminStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [copiedKey, setCopiedKey] = useState(null);

  // Modals state
  const [isAccountModalOpen, setAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [isAddKeyModalOpen, setAddKeyModalOpen] = useState(false);
  const [selectedAccountForKey, setSelectedAccountForKey] = useState(null);
  const [isPermissionsModalOpen, setPermissionsModalOpen] = useState(false);
  const [selectedAccountForPerms, setSelectedAccountForPerms] = useState(null);

  // Form Account state (Thêm / Sửa tài khoản)
  const [accountForm, setAccountForm] = useState({
    machine_name: '',
    customer_name: '',
    user_email: '',
    machine_id: '',
    note: '',
    permissions: { ...DEFAULT_PERMISSIONS },
  });

  // Form Add Key state
  const [keyForm, setKeyForm] = useState({
    package_type: 'AI Pro Studio (365 ngày)',
    days_remaining: 365,
    is_lifetime: false,
    custom_key: '',
  });

  // Copy helper
  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Filter accounts
  const filteredAccounts = clientAccounts.filter((acc) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      acc.machine_name?.toLowerCase().includes(q) ||
      acc.customer_name?.toLowerCase().includes(q) ||
      acc.user_email?.toLowerCase().includes(q) ||
      acc.machine_id?.toLowerCase().includes(q) ||
      acc.keys?.some((k) => k.key.toLowerCase().includes(q));

    if (!matchSearch) return false;
    if (statusFilter === 'active') return acc.is_active;
    if (statusFilter === 'locked') return !acc.is_active;
    return true;
  });

  // Thêm mới tài khoản
  const handleOpenCreateAccount = () => {
    setEditingAccount(null);
    setAccountForm({
      machine_name: '',
      customer_name: '',
      user_email: '',
      machine_id: `PC-WIN-${Math.floor(1000 + Math.random() * 9000)}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      note: '',
      permissions: { ...DEFAULT_PERMISSIONS },
    });
    setAccountModalOpen(true);
  };

  // Sửa tài khoản
  const handleOpenEditAccount = (acc) => {
    setEditingAccount(acc);
    setAccountForm({
      machine_name: acc.machine_name,
      customer_name: acc.customer_name,
      user_email: acc.user_email,
      machine_id: acc.machine_id,
      note: acc.note || '',
      permissions: acc.permissions || { ...DEFAULT_PERMISSIONS },
    });
    setAccountModalOpen(true);
  };

  const handleSaveAccountSubmit = (e) => {
    e.preventDefault();
    if (!accountForm.machine_name.trim()) {
      alert('Vui lòng nhập Tên máy');
      return;
    }

    if (editingAccount) {
      updateAccount(editingAccount.id, accountForm);
    } else {
      createAccount(accountForm);
    }
    setAccountModalOpen(false);
  };

  // Mở modal Add Key cho tài khoản
  const handleOpenAddKey = (acc) => {
    setSelectedAccountForKey(acc);
    setKeyForm({
      package_type: 'AI Pro Studio (365 ngày)',
      days_remaining: 365,
      is_lifetime: false,
      custom_key: `WUKONG-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    });
    setAddKeyModalOpen(true);
  };

  const handleSaveKeySubmit = (e) => {
    e.preventDefault();
    if (!selectedAccountForKey) return;

    addKeyToAccount(selectedAccountForKey.id, {
      key: keyForm.custom_key.trim().toUpperCase(),
      package_type: keyForm.package_type,
      days_remaining: Number(keyForm.days_remaining),
      is_lifetime: keyForm.is_lifetime,
    });
    setAddKeyModalOpen(false);
  };

  // Mở modal Sửa Phân Quyền
  const handleOpenPermissions = (acc) => {
    setSelectedAccountForPerms(acc);
    setPermissionsModalOpen(true);
  };

  const handleSavePermissions = (newPerms) => {
    if (selectedAccountForPerms) {
      updateAccountPermissions(selectedAccountForPerms.id, newPerms);
      setPermissionsModalOpen(false);
    }
  };

  // Preset changer
  const applyPreset = (presetKey) => {
    const preset = PERMISSION_PRESETS[presetKey];
    if (preset) {
      setAccountForm((prev) => ({
        ...prev,
        permissions: { ...preset.permissions },
      }));
    }
  };

  // Helper count active permissions
  const countActivePerms = (perms) => {
    if (!perms) return 0;
    return Object.values(perms).filter(Boolean).length;
  };

  return (
    <div className="space-y-5 font-sans select-none">
      {/* 1. Action Bar: Search, Status Filter & Create Account Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative flex-1 max-w-xl">
          <Search size={14} className="absolute left-3.5 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo tên máy, tên khách, email, HWID, mã Key..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#f8fafc] border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white shadow-inner"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-[#f8fafc] border border-gray-200 rounded-lg pl-3 pr-8 py-2 text-xs text-slate-700 font-medium focus:outline-none focus:border-orange-500 shadow-sm cursor-pointer"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="locked">Tạm khóa</option>
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-3 text-gray-400 pointer-events-none" />
          </div>

          <button
            onClick={handleOpenCreateAccount}
            className="px-4 py-2 bg-[#ea580c] hover:bg-[#c2410c] text-white text-xs font-bold rounded-lg shadow-sm shadow-orange-500/25 flex items-center gap-1.5 transition-all cursor-pointer flex-shrink-0"
          >
            <Plus size={14} strokeWidth={2.5} />
            <span>+ Thêm Tài Khoản Máy Mới</span>
          </button>
        </div>
      </div>

      {/* 2. Main Client Accounts Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-[#fafbfc] border-b border-gray-200 text-slate-500 uppercase text-[10.5px] font-bold tracking-wider">
              <tr>
                <th className="py-3.5 px-4 min-w-[240px]">TÀI KHOẢN & TÊN MÁY</th>
                <th className="py-3.5 px-4 min-w-[180px]">PHẦN CỨNG (HWID)</th>
                <th className="py-3.5 px-4 min-w-[220px]">PHÂN QUYỀN MENU TOOL</th>
                <th className="py-3.5 px-4 min-w-[320px]">KEYS ĐÃ CẤP CHO MÁY</th>
                <th className="py-3.5 px-3 text-center">TRẠNG THÁI</th>
                <th className="py-3.5 px-4 text-right">THAO TÁC</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Chưa có tài khoản máy khách nào. Bấm <strong>+ Thêm Tài Khoản Máy Mới</strong> để tạo trước.
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((acc) => {
                  const activePermCount = countActivePerms(acc.permissions);
                  const totalPermCount = Object.keys(DEFAULT_PERMISSIONS).length;

                  return (
                    <tr key={acc.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* TÀI KHOẢN & TÊN MÁY */}
                      <td className="py-4 px-4">
                        <div className="flex items-start gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-700 text-white flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
                            <Laptop size={17} className="text-orange-400" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-xs tracking-tight flex items-center gap-1.5">
                              <span>{acc.machine_name}</span>
                            </p>
                            <p className="text-[11px] text-slate-600 mt-0.5 font-medium">
                              {acc.customer_name} • <span className="text-slate-400">{acc.user_email || 'Chưa có email'}</span>
                            </p>
                            {acc.note && (
                              <p className="text-[10px] text-amber-600 mt-1 font-mono italic">
                                📝 {acc.note}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* PHẦN CỨNG (HWID) */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-cyan-800 text-[11px] font-semibold bg-cyan-50 border border-cyan-200 px-2 py-1 rounded select-all">
                            {acc.machine_id}
                          </span>
                          <button
                            onClick={() => handleCopy(acc.machine_id, `hwid_${acc.id}`)}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                            title="Sao chép HWID"
                          >
                            {copiedKey === `hwid_${acc.id}` ? (
                              <Check size={12} className="text-emerald-500" />
                            ) : (
                              <Copy size={12} />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* PHÂN QUYỀN MENU TOOL */}
                      <td className="py-4 px-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                activePermCount === totalPermCount
                                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                                  : 'bg-orange-50 text-orange-700 border-orange-200'
                              }`}
                            >
                              Được mở: {activePermCount}/{totalPermCount} quyền
                            </span>
                            <button
                              onClick={() => handleOpenPermissions(acc)}
                              className="text-[10.5px] font-semibold text-blue-600 hover:underline flex items-center gap-0.5 cursor-pointer"
                            >
                              <Shield size={11} />
                              <span>Sửa quyền</span>
                            </button>
                          </div>

                          {/* Quick Badges Preview */}
                          <div className="flex items-center gap-1 flex-wrap text-[9.5px]">
                            {acc.permissions?.module_video_dubbing && (
                              <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                                🎬 Video Dubbing
                              </span>
                            )}
                            {acc.permissions?.module_movie_review && (
                              <span className="px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-600 border border-indigo-200">
                                📚 Review Truyện
                              </span>
                            )}
                            {acc.permissions?.tool_voice_clone && (
                              <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-600 border border-emerald-200">
                                🎙️ Giọng Clone
                              </span>
                            )}
                            {acc.permissions?.tool_gpu && (
                              <span className="px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200">
                                ⚡ GPU
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* KEYS ĐÃ CẤP CHO MÁY */}
                      <td className="py-4 px-4">
                        <div className="space-y-1.5">
                          {acc.keys && acc.keys.length > 0 ? (
                            acc.keys.map((k) => (
                              <div
                                key={k.id}
                                className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                              >
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-mono font-bold text-purple-700 text-[11.5px] tracking-wider select-all">
                                      {k.key}
                                    </span>
                                    <button
                                      onClick={() => handleCopy(k.key, k.id)}
                                      className="p-0.5 rounded text-slate-400 hover:text-slate-700"
                                      title="Sao chép Key"
                                    >
                                      {copiedKey === k.id ? (
                                        <Check size={11} className="text-emerald-500" />
                                      ) : (
                                        <Copy size={11} />
                                      )}
                                    </button>
                                  </div>
                                  <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                                    <span>{k.package_type}</span>
                                    <span>•</span>
                                    <span className={k.days_remaining > 10 ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                                      {k.is_lifetime ? 'Vĩnh viễn' : `Còn ${k.days_remaining} ngày`}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 ml-2">
                                  <button
                                    onClick={() => toggleKeyLock(acc.id, k.id)}
                                    className={`p-1 rounded text-xs transition-colors cursor-pointer ${
                                      k.status === 'locked'
                                        ? 'text-rose-600 hover:bg-rose-50'
                                        : 'text-slate-400 hover:text-slate-700'
                                    }`}
                                    title={k.status === 'locked' ? 'Mở khóa key' : 'Tạm khóa key'}
                                  >
                                    {k.status === 'locked' ? <Lock size={12} /> : <Unlock size={12} />}
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (window.confirm(`Xóa Key [${k.key}]?`)) {
                                        deleteKeyFromAccount(acc.id, k.id);
                                      }
                                    }}
                                    className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                                    title="Xóa Key này"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </div>
                            ))
                          ) : (
                            <span className="text-[11px] text-slate-400 italic block">
                              Chưa có Key nào được cấp cho tài khoản này.
                            </span>
                          )}

                          {/* Nút Add Key cho riêng tài khoản này */}
                          <button
                            onClick={() => handleOpenAddKey(acc)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-orange-600 hover:text-orange-700 hover:underline pt-0.5 cursor-pointer"
                          >
                            <Plus size={12} strokeWidth={2.5} />
                            <span>+ Cấp thêm Key mới</span>
                          </button>
                        </div>
                      </td>

                      {/* TRẠNG THÁI */}
                      <td className="py-4 px-3 text-center">
                        <button
                          onClick={() => toggleAccountLock(acc.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${
                            acc.is_active
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              acc.is_active ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                          <span>{acc.is_active ? 'Hoạt động' : 'Tạm khóa'}</span>
                        </button>
                      </td>

                      {/* THAO TÁC */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 text-slate-400">
                          <button
                            onClick={() => handleOpenAddKey(acc)}
                            className="p-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-600 transition-colors cursor-pointer"
                            title="Add Key mới cho tài khoản này"
                          >
                            <Key size={13} />
                          </button>
                          <button
                            onClick={() => handleOpenPermissions(acc)}
                            className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors cursor-pointer"
                            title="Chỉnh sửa phân quyền Menu Tool"
                          >
                            <Shield size={13} />
                          </button>
                          <button
                            onClick={() => handleOpenEditAccount(acc)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
                            title="Sửa thông tin tài khoản & Tên máy"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Bạn có chắc chắn muốn xóa tài khoản máy [${acc.machine_name}] và toàn bộ keys liên kết?`)) {
                                deleteAccount(acc.id);
                              }
                            }}
                            className="p-1.5 rounded-lg hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Xóa tài khoản máy"
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
      </div>

      {/* ========================================================= */}
      {/* MODAL 1: THÊM / SỬA TÀI KHOẢN MÁY KHÁCH & PHÂN QUYỀN BAN ĐẦU */}
      {/* ========================================================= */}
      {isAccountModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl bg-white border border-gray-200 rounded-2xl p-6 shadow-2xl text-slate-800 animate-scaleUp max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-orange-50 text-orange-600">
                  <Laptop size={16} />
                </span>
                <h3 className="font-bold text-sm text-slate-900">
                  {editingAccount ? `Chỉnh sửa: ${editingAccount.machine_name}` : 'Thêm Tài Khoản Máy Khách Mới'}
                </h3>
              </div>
              <button
                onClick={() => setAccountModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveAccountSubmit} className="mt-4 space-y-4 text-xs">
              {/* Thông tin Máy & Khách hàng */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Tên Máy Khách (Machine Name) <span className="text-rose-500">*</span>:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Máy Trạm 01 - Studio Hà Nội"
                    value={accountForm.machine_name}
                    onChange={(e) => setAccountForm({ ...accountForm, machine_name: e.target.value })}
                    className="w-full bg-[#fafbfc] border border-gray-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-orange-500 shadow-inner"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Tên Khách Hàng (Customer Name):
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Nguyễn Văn Hùng"
                    value={accountForm.customer_name}
                    onChange={(e) => setAccountForm({ ...accountForm, customer_name: e.target.value })}
                    className="w-full bg-[#fafbfc] border border-gray-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-orange-500 shadow-inner"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Email Tài Khoản:
                  </label>
                  <input
                    type="email"
                    placeholder="client.video@gmail.com"
                    value={accountForm.user_email}
                    onChange={(e) => setAccountForm({ ...accountForm, user_email: e.target.value })}
                    className="w-full bg-[#fafbfc] border border-gray-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-orange-500 shadow-inner"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Mã Phần Cứng Khóa Máy (HWID):
                  </label>
                  <input
                    type="text"
                    placeholder="PC-WIN-510A-..."
                    value={accountForm.machine_id}
                    onChange={(e) => setAccountForm({ ...accountForm, machine_id: e.target.value })}
                    className="w-full bg-[#fafbfc] border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono text-cyan-800 focus:outline-none focus:border-orange-500 shadow-inner"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Ghi Chú:</label>
                <input
                  type="text"
                  placeholder="Ghi chú về khách hàng, chi nhánh, phòng ban..."
                  value={accountForm.note}
                  onChange={(e) => setAccountForm({ ...accountForm, note: e.target.value })}
                  className="w-full bg-[#fafbfc] border border-gray-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-orange-500 shadow-inner"
                />
              </div>

              {/* BẢNG PHÂN QUYỀN MENU TOOL KHI VÀO TOOL */}
              <div className="pt-3 border-t border-gray-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <Shield size={14} className="text-orange-600" />
                      <span>Phân Quyền Truy Cập Menu & Tính Năng Khi Vào Tool</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Chọn các phần được phép hiển thị trên màn hình Tool khi khách kích hoạt key của tài khoản này
                    </p>
                  </div>

                  {/* Preset Buttons */}
                  <div className="flex gap-1.5">
                    {Object.entries(PERMISSION_PRESETS).map(([pKey, pVal]) => (
                      <button
                        key={pKey}
                        type="button"
                        onClick={() => applyPreset(pKey)}
                        className="px-2 py-1 text-[10px] font-semibold bg-gray-100 hover:bg-orange-50 hover:text-orange-600 rounded border border-gray-200 transition-colors"
                      >
                        {pVal.label.split('(')[0]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Nhóm 1: Menu NGUỒN */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <p className="font-bold text-[10.5px] uppercase text-slate-500 tracking-wider">
                      MENU NGUỒN
                    </p>
                    <div className="space-y-1.5">
                      {[
                        { key: 'source_download_url', label: 'Tải video (URL)' },
                        { key: 'source_queue', label: 'Hàng chờ tải' },
                        { key: 'source_channel_scan', label: 'Quét kênh tải loạt' },
                        { key: 'source_import_srt', label: 'Chọn file SRT' },
                      ].map((item) => (
                        <label key={item.key} className="flex items-center gap-2 cursor-pointer text-slate-700">
                          <input
                            type="checkbox"
                            checked={!!accountForm.permissions[item.key]}
                            onChange={(e) =>
                              setAccountForm({
                                ...accountForm,
                                permissions: {
                                  ...accountForm.permissions,
                                  [item.key]: e.target.checked,
                                },
                              })
                            }
                            className="rounded border-gray-300 text-orange-600 accent-orange-600 cursor-pointer"
                          />
                          <span className="text-[11.5px]">{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Nhóm 2: Menu CÔNG CỤ */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <p className="font-bold text-[10.5px] uppercase text-slate-500 tracking-wider">
                      MENU CÔNG CỤ
                    </p>
                    <div className="space-y-1.5">
                      {[
                        { key: 'tool_queue', label: 'Hàng chờ dịch' },
                        { key: 'tool_video_split', label: 'Ghép / Tách video' },
                        { key: 'tool_gpu', label: 'Tăng tốc GPU' },
                        { key: 'tool_voice_clone', label: 'Giọng clone AI' },
                        { key: 'tool_offline_voice', label: 'Giọng Việt offline' },
                        { key: 'tool_api_keys', label: 'Quản lý API Keys' },
                      ].map((item) => (
                        <label key={item.key} className="flex items-center gap-2 cursor-pointer text-slate-700">
                          <input
                            type="checkbox"
                            checked={!!accountForm.permissions[item.key]}
                            onChange={(e) =>
                              setAccountForm({
                                ...accountForm,
                                permissions: {
                                  ...accountForm.permissions,
                                  [item.key]: e.target.checked,
                                },
                              })
                            }
                            className="rounded border-gray-300 text-orange-600 accent-orange-600 cursor-pointer"
                          />
                          <span className="text-[11.5px]">{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Nhóm 3: Module WORKSTATION */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <p className="font-bold text-[10.5px] uppercase text-slate-500 tracking-wider">
                      MODULE WORKSTATION
                    </p>
                    <div className="space-y-1.5">
                      {[
                        { key: 'module_video_dubbing', label: 'Dịch & Lồng tiếng Video' },
                        { key: 'module_movie_review', label: 'Review Truyện Tranh' },
                        { key: 'module_subtitles_editor', label: 'Biên tập phụ đề & Mask' },
                      ].map((item) => (
                        <label key={item.key} className="flex items-center gap-2 cursor-pointer text-slate-700">
                          <input
                            type="checkbox"
                            checked={!!accountForm.permissions[item.key]}
                            onChange={(e) =>
                              setAccountForm({
                                ...accountForm,
                                permissions: {
                                  ...accountForm.permissions,
                                  [item.key]: e.target.checked,
                                },
                              })
                            }
                            className="rounded border-gray-300 text-orange-600 accent-orange-600 cursor-pointer"
                          />
                          <span className="text-[11.5px] font-semibold">{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setAccountModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#ea580c] hover:bg-[#c2410c] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm shadow-orange-500/25"
                >
                  <Check size={14} />
                  <span>{editingAccount ? 'Lưu Thay Đổi' : 'Tạo Tài Khoản Máy'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: ADD KEY CHO RIÊNG TỪNG TÀI KHOẢN MÁY */}
      {/* ========================================================= */}
      {isAddKeyModalOpen && selectedAccountForKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-6 shadow-2xl text-slate-800 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-orange-50 text-orange-600">
                  <Key size={16} />
                </span>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Cấp License Key Cho Tài Khoản</h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Gắn với: {selectedAccountForKey.machine_name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAddKeyModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveKeySubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Chọn Gói Bản Quyền:</label>
                <select
                  value={keyForm.package_type}
                  onChange={(e) => {
                    const val = e.target.value;
                    let d = 365;
                    let life = false;
                    if (val.includes('30 ngày')) d = 30;
                    if (val.includes('90 ngày')) d = 90;
                    if (val.includes('Vĩnh viễn')) {
                      d = 9999;
                      life = true;
                    }
                    setKeyForm({
                      ...keyForm,
                      package_type: val,
                      days_remaining: d,
                      is_lifetime: life,
                    });
                  }}
                  className="w-full bg-[#fafbfc] border border-gray-200 rounded-lg p-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:border-orange-500 shadow-inner"
                >
                  <option value="AI Pro Studio (365 ngày)">Gói Tiêu Chuẩn 1 Năm (365 ngày)</option>
                  <option value="AI Pro Studio (30 ngày)">Gói Dùng Thử 1 Tháng (30 ngày)</option>
                  <option value="AI Pro Studio (90 ngày)">Gói Quý 3 Tháng (90 ngày)</option>
                  <option value="Lifetime VIP (Vĩnh viễn)">Gói Vĩnh Viễn VIP (Lifetime)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Số Ngày Sử Dụng:</label>
                <input
                  type="number"
                  disabled={keyForm.is_lifetime}
                  value={keyForm.days_remaining}
                  onChange={(e) => setKeyForm({ ...keyForm, days_remaining: Number(e.target.value) })}
                  className="w-full bg-[#fafbfc] border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-orange-500 shadow-inner disabled:bg-gray-100"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">Mã Key Được Cấp (License Key):</label>
                  <button
                    type="button"
                    onClick={() => {
                      setKeyForm({
                        ...keyForm,
                        custom_key: `WUKONG-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
                      });
                    }}
                    className="text-[10.5px] text-orange-600 hover:underline"
                  >
                    🎲 Tạo mã ngẫu nhiên
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={keyForm.custom_key}
                  onChange={(e) => setKeyForm({ ...keyForm, custom_key: e.target.value.toUpperCase() })}
                  className="w-full bg-[#fafbfc] border border-purple-300 focus:border-purple-600 rounded-lg px-3 py-2 text-xs font-mono font-bold text-purple-700 tracking-wider shadow-inner"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-[11px] text-slate-600">
                <p>
                  ✓ Key này sẽ <strong>kế thừa toàn bộ quyền</strong> của tài khoản <strong>[{selectedAccountForKey.machine_name}]</strong>.
                </p>
                <p>
                  ✓ Khi khách kích hoạt key trên Tool, hệ thống sẽ mở các menu theo cấu hình phân quyền của tài khoản.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setAddKeyModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#ea580c] hover:bg-[#c2410c] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm shadow-orange-500/25"
                >
                  <Key size={13} />
                  <span>Xác Nhận Cấp Key</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: SỬA NHANH PHÂN QUYỀN CHO TÀI KHOẢN */}
      {/* ========================================================= */}
      {isPermissionsModalOpen && selectedAccountForPerms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xl bg-white border border-gray-200 rounded-2xl p-6 shadow-2xl text-slate-800 animate-scaleUp max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                  <Shield size={16} />
                </span>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Phân Quyền Tool: {selectedAccountForPerms.machine_name}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Bật / Tắt các menu và tính năng khi máy khách kích hoạt Key vào Tool
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPermissionsModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100"
              >
                <X size={16} />
              </button>
            </div>

            {/* Permissions Editor */}
            <div className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Nguồn */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <p className="font-bold text-[10.5px] uppercase text-slate-500">MENU NGUỒN</p>
                  <div className="space-y-1.5">
                    {[
                      { key: 'source_download_url', label: 'Tải video (URL)' },
                      { key: 'source_queue', label: 'Hàng chờ tải' },
                      { key: 'source_channel_scan', label: 'Quét kênh tải loạt' },
                      { key: 'source_import_srt', label: 'Chọn file SRT' },
                    ].map((item) => (
                      <label key={item.key} className="flex items-center gap-2 cursor-pointer text-slate-700">
                        <input
                          type="checkbox"
                          checked={!!selectedAccountForPerms.permissions?.[item.key]}
                          onChange={(e) => {
                            setSelectedAccountForPerms({
                              ...selectedAccountForPerms,
                              permissions: {
                                ...selectedAccountForPerms.permissions,
                                [item.key]: e.target.checked,
                              },
                            });
                          }}
                          className="rounded border-gray-300 text-orange-600 accent-orange-600 cursor-pointer"
                        />
                        <span className="text-[11.5px]">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Công cụ */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <p className="font-bold text-[10.5px] uppercase text-slate-500">MENU CÔNG CỤ</p>
                  <div className="space-y-1.5">
                    {[
                      { key: 'tool_queue', label: 'Hàng chờ dịch' },
                      { key: 'tool_video_split', label: 'Ghép / Tách video' },
                      { key: 'tool_gpu', label: 'Tăng tốc GPU' },
                      { key: 'tool_voice_clone', label: 'Giọng clone AI' },
                      { key: 'tool_offline_voice', label: 'Giọng Việt offline' },
                      { key: 'tool_api_keys', label: 'Quản lý API Keys' },
                    ].map((item) => (
                      <label key={item.key} className="flex items-center gap-2 cursor-pointer text-slate-700">
                        <input
                          type="checkbox"
                          checked={!!selectedAccountForPerms.permissions?.[item.key]}
                          onChange={(e) => {
                            setSelectedAccountForPerms({
                              ...selectedAccountForPerms,
                              permissions: {
                                ...selectedAccountForPerms.permissions,
                                [item.key]: e.target.checked,
                              },
                            });
                          }}
                          className="rounded border-gray-300 text-orange-600 accent-orange-600 cursor-pointer"
                        />
                        <span className="text-[11.5px]">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Workstation Modules */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <p className="font-bold text-[10.5px] uppercase text-slate-500">WORKSTATIONS</p>
                  <div className="space-y-1.5">
                    {[
                      { key: 'module_video_dubbing', label: 'Dịch & Lồng tiếng Video' },
                      { key: 'module_movie_review', label: 'Review Truyện Tranh' },
                      { key: 'module_subtitles_editor', label: 'Biên tập phụ đề & Mask' },
                    ].map((item) => (
                      <label key={item.key} className="flex items-center gap-2 cursor-pointer text-slate-700">
                        <input
                          type="checkbox"
                          checked={!!selectedAccountForPerms.permissions?.[item.key]}
                          onChange={(e) => {
                            setSelectedAccountForPerms({
                              ...selectedAccountForPerms,
                              permissions: {
                                ...selectedAccountForPerms.permissions,
                                [item.key]: e.target.checked,
                              },
                            });
                          }}
                          className="rounded border-gray-300 text-orange-600 accent-orange-600 cursor-pointer"
                        />
                        <span className="text-[11.5px] font-semibold">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setPermissionsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={() => handleSavePermissions(selectedAccountForPerms.permissions)}
                  className="px-4 py-2 rounded-lg bg-[#ea580c] hover:bg-[#c2410c] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm shadow-orange-500/25"
                >
                  <Check size={14} />
                  <span>Lưu Phân Quyền</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountMachineManager;
