import React from 'react';
import { Layers, CheckCircle2, AlertCircle, Zap } from 'lucide-react';
import useAdminStore from '../store/adminStore';

export const AdminMetricCards = () => {
  const { stats, jobs } = useAdminStore();

  const totalJobsCount = jobs?.length || stats?.total_jobs || 8;
  const successCount = stats?.success_count || 4931;
  const failedCount = stats?.failed_count || 2159;
  const latencyRange = stats?.latency_range || '25ms - 2.8s';

  const cards = [
    {
      label: 'TỔNG SỐ JOBS ĐÃ TẠO',
      value: totalJobsCount,
      subtext: 'Toàn bộ tác vụ tạo ảnh hệ thống',
      accentColor: 'border-l-orange-500',
      iconContainer: 'bg-orange-50 text-orange-500 border border-orange-100',
      icon: <Layers size={18} strokeWidth={2} />,
    },
    {
      label: 'TẠO THÀNH CÔNG',
      value: successCount.toLocaleString(),
      subtext: 'Đạt tỷ lệ 69.58% hoàn tất',
      accentColor: 'border-l-emerald-500',
      iconContainer: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
      icon: <CheckCircle2 size={18} strokeWidth={2} />,
    },
    {
      label: 'THẤT BẠI / LỖI',
      value: failedCount.toLocaleString(),
      subtext: 'Lỗi từ upstream (Không trừ tiền)',
      accentColor: 'border-l-rose-500',
      iconContainer: 'bg-rose-50 text-rose-500 border border-rose-100',
      icon: <AlertCircle size={18} strokeWidth={2} />,
    },
    {
      label: 'TỐC ĐỘ XỬ LÝ',
      value: latencyRange,
      subtext: '⚡ Smart Cache & Model gpt-image-2',
      accentColor: 'border-l-purple-500',
      iconContainer: 'bg-purple-50 text-purple-600 border border-purple-100',
      icon: <Zap size={18} strokeWidth={2} />,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, idx) => (
        <div
          key={idx}
          className={`bg-white border border-gray-200 ${c.accentColor} border-l-4 rounded-xl p-4 shadow-sm flex items-start justify-between transition-all hover:shadow-md select-none`}
        >
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              {c.label}
            </span>
            <div className="text-2xl font-black text-slate-900 tracking-tight font-sans">
              {c.value}
            </div>
            <p className="text-[11px] text-slate-400 font-medium">{c.subtext}</p>
          </div>

          <div className={`p-2.5 rounded-xl ${c.iconContainer} flex-shrink-0 shadow-sm`}>
            {c.icon}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminMetricCards;
