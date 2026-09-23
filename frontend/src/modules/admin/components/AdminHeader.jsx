import React, { useState } from 'react';
import {
  Search,
  Globe,
  ChevronDown,
  Plus,
  BookOpen,
  Bell,
  LogOut,
  User as UserIcon,
  ShieldCheck,
  Check
} from 'lucide-react';
import useAuthStore from '@/modules/auth/store/authStore';

export const AdminHeader = ({ onSearch, onOpenCreateJob }) => {
  const { user, logout } = useAuthStore();
  const [searchValue, setSearchValue] = useState('');
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [currentLang, setCurrentLang] = useState('Tiếng Việt');

  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
    if (onSearch) {
      onSearch(e.target.value);
    }
  };

  const displayName = user?.full_name || 'Nguyen Le Hai';
  const displayRole = (user?.role || 'SUPER_ADMIN').toUpperCase();

  return (
    <header className="h-14 flex-shrink-0 bg-white border-b border-gray-200 px-6 flex items-center justify-between text-xs select-none shadow-sm z-10 font-sans">
      {/* 1. Left Search Icon / Input */}
      <div className="flex items-center gap-2">
        <div className="relative w-72">
          <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm tác vụ, prompt, model..."
            value={searchValue}
            onChange={handleSearchChange}
            className="w-full bg-[#f8fafc] border border-gray-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:bg-white transition-all shadow-inner"
          />
        </div>
      </div>

      {/* 2. Right Actions Bar */}
      <div className="flex items-center gap-3">
        {/* Language Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowLanguageMenu(!showLanguageMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-gray-50 text-gray-700 border border-transparent hover:border-gray-200 transition-all cursor-pointer text-xs"
          >
            <Globe size={14} className="text-gray-500" />
            <span className="font-medium">{currentLang}</span>
            <ChevronDown size={12} className="text-gray-400" />
          </button>

          {showLanguageMenu && (
            <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-xl shadow-xl py-1 text-xs text-gray-700 z-50 animate-fadeIn">
              {[
                { label: 'Tiếng Việt', flag: '🇻🇳' },
                { label: 'English', flag: '🇺🇸' },
                { label: '中文 (Chinese)', flag: '🇨🇳' },
              ].map((lng) => (
                <button
                  key={lng.label}
                  onClick={() => {
                    setCurrentLang(lng.label);
                    setShowLanguageMenu(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 text-left transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <span>{lng.flag}</span>
                    <span>{lng.label}</span>
                  </span>
                  {currentLang === lng.label && <Check size={12} className="text-orange-500" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Primary CTA "+ Tạo mới ▾" */}
        <div className="relative">
          <button
            onClick={() => {
              if (onOpenCreateJob) {
                onOpenCreateJob();
              } else {
                setShowCreateMenu(!showCreateMenu);
              }
            }}
            className="flex items-center gap-1.5 bg-[#ea580c] hover:bg-[#c2410c] text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm shadow-orange-500/25 transition-all cursor-pointer"
          >
            <Plus size={14} strokeWidth={2.5} />
            <span>Tạo mới</span>
            <ChevronDown size={12} />
          </button>

          {showCreateMenu && (
            <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-xl py-1 text-xs text-gray-700 z-50 animate-fadeIn">
              <button
                onClick={() => {
                  setShowCreateMenu(false);
                  if (onOpenCreateJob) onOpenCreateJob();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-orange-50 hover:text-orange-600 text-left cursor-pointer"
              >
                <span>✨</span>
                <span>Tạo ảnh AI mới</span>
              </button>
              <button
                onClick={() => {
                  setShowCreateMenu(false);
                  alert('Mở form tạo API Key mới cho khách hàng');
                }}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-orange-50 hover:text-orange-600 text-left cursor-pointer"
              >
                <span>🔑</span>
                <span>Cấp API Key khách</span>
              </button>
            </div>
          )}
        </div>

        {/* API Docs Button */}
        <a
          href="http://127.0.0.1:8000/docs"
          target="_blank"
          rel="noreferrer"
          className="p-2 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors cursor-pointer"
          title="Tài liệu API Swagger"
        >
          <BookOpen size={16} />
        </a>

        {/* API Online Status Pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>API: Online</span>
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => alert('Thông báo: Hệ thống GPU Cluster RTX 4090 đang chạy ổn định.')}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors cursor-pointer relative"
          >
            <Bell size={16} />
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#ea580c] text-white text-[9px] font-bold flex items-center justify-center">
              1
            </span>
          </button>
        </div>

        {/* User Profile Avatar & Name */}
        <div className="relative pl-2 border-l border-gray-200">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer text-left"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-xs shadow-sm flex-shrink-0">
              {displayName.slice(0, 2).toUpperCase()}
            </div>
            <div className="hidden sm:block leading-tight">
              <div className="font-bold text-gray-900 text-xs">{displayName}</div>
              <div className="text-[9.5px] text-gray-400 font-mono tracking-wider">
                {displayRole}
              </div>
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-xl py-1 text-xs text-gray-700 z-50 animate-fadeIn">
              <div className="px-3 py-2 border-b border-gray-100">
                <p className="font-bold text-gray-900">{displayName}</p>
                <p className="text-[11px] text-gray-500 truncate">{user?.email || 'admin@meridian.vn'}</p>
              </div>
              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 text-left transition-colors cursor-pointer"
              >
                <LogOut size={13} />
                <span>Đăng xuất hệ thống</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
