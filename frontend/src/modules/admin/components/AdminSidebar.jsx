import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Activity,
  Sparkles,
  FileText,
  Users,
  Key,
  BookOpen,
  Shield,
  Wallet,
  TrendingUp,
  CreditCard,
  QrCode,
  Sliders,
  Package,
  Layers,
  Building2,
  Settings,
  ExternalLink,
  Laptop
} from 'lucide-react';
import useAdminStore from '../store/adminStore';

export const AdminSidebar = ({ activeTab, onSelectTab }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const sections = [
    {
      header: 'KHÔNG GIAN LÀM VIỆC',
      subHeader: 'TỔNG QUAN',
      items: [
        {
          id: 'overview',
          to: '/admin/dashboard',
          icon: <Activity size={14} />,
          label: 'Tổng quan hệ thống',
        },
      ],
    },
    {
      header: 'CỔNG AI GENERATOR (GPT Image 2.5)',
      items: [
        {
          id: 'studio',
          to: '/admin/dashboard',
          tab: 'studio',
          icon: <Sparkles size={14} className="text-orange-400" />,
          label: 'Studio Tạo ảnh AI',
          isHighlight: true,
        },
        {
          id: 'jobs',
          to: '/admin/dashboard',
          tab: 'jobs',
          icon: <FileText size={14} />,
          label: 'Quản lý Jobs & Nhật ký',
        },
      ],
    },
    {
      header: 'TÀI KHOẢN & TRUY CẬP',
      items: [
        {
          id: 'users',
          to: '/admin/users',
          tab: 'users',
          icon: <Users size={14} />,
          label: 'Tài khoản',
        },
        {
          id: 'api-keys',
          to: '/admin/licenses',
          tab: 'licenses',
          icon: <Key size={14} />,
          label: 'API Keys Cổng khách',
        },
        {
          id: 'docs',
          to: 'http://127.0.0.1:8000/docs',
          isExternal: true,
          icon: <BookOpen size={14} />,
          label: 'Tài liệu API (Docs)',
          badge: 'Swagger',
          badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
        },
        {
          id: 'permissions',
          to: '/admin/permissions',
          tab: 'permissions',
          icon: <Shield size={14} />,
          label: 'Phân quyền',
        },
      ],
    },
    {
      header: 'CREDIT & THANH TOÁN',
      items: [
        {
          id: 'wallet',
          to: '#wallet',
          icon: <Wallet size={14} />,
          label: 'Ví & Dòng tiền',
        },
        {
          id: 'pnl',
          to: '#pnl',
          icon: <TrendingUp size={14} />,
          label: 'Báo cáo Dòng tiền & PnL',
        },
        {
          id: 'sepay',
          to: '#sepay',
          icon: <CreditCard size={14} />,
          label: 'Giao dịch nạp SePay',
        },
        {
          id: 'banking',
          to: '#banking',
          icon: <QrCode size={14} />,
          label: 'Ngân hàng & QR',
        },
        {
          id: 'credit-config',
          to: '#credit-config',
          icon: <Sliders size={14} />,
          label: 'Cấu hình Credit',
        },
      ],
    },
    {
      header: 'CẤU HÌNH DỊCH VỤ',
      items: [
        {
          id: 'packages',
          to: '#packages',
          icon: <Package size={14} />,
          label: 'Cấu hình gói',
          badge: 'Đang phát triển',
          badgeColor: 'bg-slate-800 text-slate-400 border border-slate-700/60',
        },
        {
          id: 'pricing',
          to: '#pricing',
          icon: <Layers size={14} />,
          label: 'Bảng giá model',
        },
        {
          id: 'vendors',
          to: '#vendors',
          icon: <Building2 size={14} />,
          label: 'Quản lý NCC',
          badge: 'Active',
          badgeColor: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
        },
        {
          id: 'other-settings',
          to: '#settings',
          icon: <Settings size={14} />,
          label: 'Cài đặt còn...',
          badge: 'Đang phát triển',
          badgeColor: 'bg-slate-800 text-slate-400 border border-slate-700/60',
        },
      ],
    },
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-[#0a0e17] border-r border-slate-800/80 flex flex-col justify-between select-none h-full text-slate-300 font-sans z-20">
      {/* 1. Header with MintForge Logo */}
      <div className="flex-1 overflow-y-auto scrollable-body">
        <div className="p-3.5 border-b border-slate-800/80 bg-[#070a12] flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#ea580c] flex items-center justify-center text-white font-extrabold text-sm shadow-md shadow-orange-600/30 tracking-tight flex-shrink-0">
            MH
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-sm text-white leading-none tracking-tight">MintForge</h1>
            <span className="text-[9px] text-slate-400 font-semibold tracking-wider uppercase block mt-1">
              BUSINESS SUITE
            </span>
          </div>
        </div>

        {/* 2. Navigation Sections */}
        <nav className="p-2 space-y-4">
          {sections.map((sec, sIdx) => (
            <div key={sIdx} className="space-y-0.5">
              {sec.header && (
                <p className="px-3 pt-2 pb-1 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  {sec.header}
                </p>
              )}
              {sec.subHeader && (
                <p className="px-3 pt-1 pb-1 text-[9.5px] uppercase font-bold text-slate-600 tracking-wider">
                  {sec.subHeader}
                </p>
              )}

              {sec.items.map((item) => {
                const isCurrentActive =
                  (activeTab && (item.tab === activeTab || item.id === activeTab)) ||
                  (!activeTab && item.id === 'studio' && location.pathname === '/admin/dashboard') ||
                  (item.to && !item.to.startsWith('#') && location.pathname === item.to);

                if (item.isExternal) {
                  return (
                    <a
                      key={item.id}
                      href={item.to}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-100 hover:bg-slate-800/40 transition-all text-left cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="text-slate-400 group-hover:text-slate-200 transition-colors">
                          {item.icon}
                        </span>
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`px-1.5 py-0.2 text-[9px] font-semibold rounded-full ${item.badgeColor} ml-1 flex-shrink-0`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </a>
                  );
                }

                const isHash = item.to.startsWith('#');

                if (isHash) {
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (item.tab && onSelectTab) {
                          onSelectTab(item.tab);
                        } else {
                          alert(`Mục [${item.label}] đang hoạt động trong phiên bản Enterprise.`);
                        }
                      }}
                      className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-100 hover:bg-slate-800/40 transition-all text-left cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="text-slate-400 group-hover:text-slate-200 transition-colors">
                          {item.icon}
                        </span>
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`px-1.5 py-0.2 text-[9px] font-semibold rounded-full ${item.badgeColor} ml-1 flex-shrink-0`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                }

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.tab && onSelectTab) {
                        onSelectTab(item.tab);
                      }
                      if (item.to && item.to !== location.pathname) {
                        navigate(item.to);
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
                      isCurrentActive
                        ? 'bg-[#1e1a17] text-orange-400 font-semibold border-l-2 border-[#ea580c]'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className={isCurrentActive ? 'text-orange-400' : 'text-slate-400'}>
                        {item.icon}
                      </span>
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`px-1.5 py-0.2 text-[9px] font-semibold rounded-full ${item.badgeColor} ml-1 flex-shrink-0`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* 3. Bottom Client Studio Link */}
      <div className="p-3 border-t border-slate-800/80 bg-[#070a12] space-y-2">
        <button
          onClick={() => navigate('/tool')}
          className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center gap-2">
            <Laptop size={14} className="text-cyan-400" />
            <span className="font-medium text-[11.5px]">Mở Client Studio Tool</span>
          </div>
          <ExternalLink size={12} className="text-slate-500 group-hover:text-cyan-400 transition-colors" />
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
