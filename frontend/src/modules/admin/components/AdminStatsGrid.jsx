import React from 'react';
import { Users, KeyRound, Coins, Video, Cpu, Activity } from 'lucide-react';
import { useAdminStore } from '../store/adminStore';

export const AdminStatsGrid = () => {
  const stats = useAdminStore((state) => state.stats);

  const cards = [
    {
      title: 'Tổng Người dùng Tool',
      value: stats.total_users,
      icon: <Users size={20} className="text-blue-400" />,
      sub: '+12 đăng ký mới trong tuần',
      border: 'border-blue-500/30',
    },
    {
      title: 'Bản quyền Tool Đang Active',
      value: `${stats.active_licenses} máy`,
      icon: <KeyRound size={20} className="text-emerald-400" />,
      sub: 'Khóa HWID phần cứng an toàn',
      border: 'border-emerald-500/30',
    },
    {
      title: 'Tổng Credit Đã Cấp Phát',
      value: stats.total_credits_allocated.toLocaleString(),
      icon: <Coins size={20} className="text-amber-400" />,
      sub: 'Doanh thu credit ổn định',
      border: 'border-amber-500/30',
    },
    {
      title: 'Video Đã Biên dịch / Xuất bản',
      value: stats.total_rendered_videos.toLocaleString(),
      icon: <Video size={20} className="text-purple-400" />,
      sub: `${stats.active_dubbing_tasks} tác vụ đang chạy`,
      border: 'border-purple-500/30',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className={`p-4 rounded-xl bg-[#0f1523] border ${card.border} shadow-lg space-y-2 select-none`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">{card.title}</span>
            <div className="p-2 rounded-lg bg-gray-800/60">{card.icon}</div>
          </div>
          <p className="text-2xl font-extrabold text-gray-100 font-mono tracking-tight">
            {card.value}
          </p>
          <p className="text-[11px] text-gray-500">{card.sub}</p>
        </div>
      ))}
    </div>
  );
};

export default AdminStatsGrid;
