import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  KeyRound,
  Coins,
  Cpu,
  Tv,
  ArrowLeft,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';

export const AdminSidebar = () => {
  const navigate = useNavigate();

  const navItems = [
    { to: '/admin/dashboard', icon: <LayoutDashboard size={18} />, label: 'Bảng điều khiển' },
    { to: '/admin/users', icon: <Users size={18} />, label: 'Quản lý Người dùng' },
    { to: '/admin/licenses', icon: <KeyRound size={18} />, label: 'Bản quyền Tool' },
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-[#0c101c] border-r border-gray-800 flex flex-col justify-between select-none h-full">
      <div>
        {/* Admin Header */}
        <div className="p-4 border-b border-gray-800 bg-[#080c16] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white shadow-md">
              <ShieldAlert size={18} />
            </div>
            <div>
              <h2 className="font-bold text-sm text-gray-100">Admin Portal</h2>
              <p className="text-[10px] text-amber-400 font-mono">Quản lý Tool Studio</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1">
          <p className="px-3 py-1.5 text-[10px] uppercase font-bold text-gray-500 tracking-wider">
            Quản trị hệ thống
          </p>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-950'
                    : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800/60'
                }`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Switch to Studio Tool Button */}
      <div className="p-3 border-t border-gray-800 bg-[#080c16] space-y-2">
        <button
          onClick={() => navigate('/app/studio')}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#192237] hover:bg-[#222e49] text-purple-300 font-semibold text-xs border border-purple-500/40 transition-all shadow-md"
        >
          <Tv size={14} />
          <span>Vào Tool Lồng Tiếng</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
