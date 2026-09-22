import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  KeyRound,
  ShieldCheck,
  Cpu,
  Coins,
  Layers,
  Key,
  FileText,
  BarChart2,
  Wallet,
  QrCode,
  CreditCard,
  Download,
  Sparkles,
  Activity,
  ChevronRight
} from 'lucide-react';
import useAdminStore from '../store/adminStore';

export const AdminSidebar = () => {
  const navigate = useNavigate();
  const { licenses } = useAdminStore();
  const expiredCount = licenses.filter(l => l.status === 'expired' || l.is_locked).length;

  const sections = [
    {
      group: 'TỔNG QUAN',
      items: [
        { to: '/admin/dashboard', icon: <Activity size={15} />, label: 'Tổng quan hệ thống' },
      ],
    },
    {
      group: 'KHÁCH HÀNG & BẢN QUYỀN',
      items: [
        {
          to: '/admin/licenses',
          icon: <Users size={15} />,
          label: 'Quản lý máy người dùng',
          badge: '0',
          badgeColor: 'bg-rose-500/30 text-rose-300 border border-rose-500/40',
        },
        { to: '/admin/users', icon: <ShieldCheck size={15} />, label: 'Phân quyền & Pháp lý' },
      ],
    },
    {
      group: 'DỊCH VỤ & MÔ HÌNH AI',
      items: [
        { to: '#providers', icon: <Cpu size={15} />, label: 'Cấu hình AI Providers' },
        { to: '#credit-pack', icon: <Coins size={15} />, label: 'Cấu hình gói credit' },
        { to: '#model-pack', icon: <Layers size={15} />, label: 'Cấu hình gói model' },
        { to: '#keys', icon: <Key size={15} />, label: 'Cấp Quyền & Credit Key ...' },
        { to: '#ai-logs', icon: <FileText size={15} />, label: 'Nhật ký Requests AI' },
        { to: '#api-reports', icon: <BarChart2 size={15} />, label: 'Báo cáo vận hành API' },
      ],
    },
    {
      group: 'CREDIT & THANH TOÁN',
      items: [
        { to: '#wallet', icon: <Wallet size={15} />, label: 'Ví & dòng tiền' },
        { to: '#banking-qr', icon: <QrCode size={15} />, label: 'Ngân hàng & QR' },
        { to: '#sepay', icon: <CreditCard size={15} />, label: 'Giao dịch nạp SePay' },
      ],
    },
    {
      group: 'CẤU HÌNH & HỆ THỐNG',
      items: [
        { to: '/admin/downloads', icon: <Download size={15} className="text-cyan-400" />, label: 'Kho Tải Tool Desktop' },
      ],
    },
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-[#090d16] border-r border-gray-800/80 flex flex-col justify-between select-none h-full text-gray-300 font-sans">
      <div className="flex-1 overflow-y-auto scrollable-body">
        {/* MintForge Header */}
        <div className="p-4 border-b border-gray-800/80 bg-[#070a12] flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#e11d48] flex items-center justify-center text-white font-bold text-base shadow-lg shadow-rose-900/40">
            Mi
          </div>
          <div>
            <h1 className="font-bold text-sm text-gray-100 leading-none tracking-tight">MintForge</h1>
            <span className="text-[9px] text-gray-400 font-semibold tracking-wider uppercase block mt-1">BUSINESS SUITE</span>
          </div>
        </div>

        {/* Section Title */}
        <div className="px-4 pt-3 pb-1 text-[10px] uppercase font-bold text-gray-500 tracking-wider">
          KHÔNG GIAN LÀM VIỆC
        </div>

        {/* Navigation Sections */}
        <nav className="p-2 space-y-4">
          {sections.map((sec, sIdx) => (
            <div key={sIdx} className="space-y-1">
              <p className="px-3 text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                {sec.group}
              </p>
              {sec.items.map((item, iIdx) => {
                const isHash = item.to.startsWith('#');
                if (isHash) {
                  return (
                    <button
                      key={iIdx}
                      onClick={() => alert(`Tính năng ${item.label} đang được đồng bộ tự động trong Enterprise Suite.`)}
                      className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-gray-100 hover:bg-gray-800/50 transition-all text-left"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="text-gray-400">{item.icon}</span>
                        <span className="truncate">{item.label}</span>
                      </div>
                    </button>
                  );
                }

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-[#e11d48]/15 text-[#fb7185] font-semibold border-l-2 border-[#e11d48]'
                          : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800/50'
                      }`
                    }
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span>{item.icon}</span>
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Upgrade Banner Bottom Card */}
      <div className="p-3 border-t border-gray-800/80 bg-[#070a12]">
        <div className="p-3 rounded-xl bg-[#0f1524] border border-gray-800 space-y-2 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-gray-200">
            <Sparkles size={14} className="text-amber-400" />
            <span>Nâng cấp doanh nghiệp</span>
          </div>
          <p className="text-[11px] text-gray-400 leading-tight">
            Mở khóa báo cáo nâng cao và tự động hóa.
          </p>
          <button
            onClick={() => alert('Doanh nghiệp của bạn đang dùng gói Enterprise cao cấp nhất!')}
            className="w-full py-1.5 px-3 rounded-lg bg-white text-gray-900 font-bold text-[11px] hover:bg-gray-200 transition-all shadow"
          >
            Nâng cấp ngay
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
