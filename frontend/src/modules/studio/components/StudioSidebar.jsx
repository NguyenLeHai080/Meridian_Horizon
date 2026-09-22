import React from 'react';
import {
  Download,
  Clock,
  Radio,
  FileText,
  Scissors,
  Zap,
  Mic,
  Volume2,
  Key,
  ShieldCheck,
  FileSpreadsheet,
  Plus,
  Sparkles,
  Headphones
} from 'lucide-react';
import useStudioStore from '../store/studioStore';

export const StudioSidebar = ({ onOpenCreditModal, onOpenLicenseModal, licenseInfo }) => {
  const credits = useStudioStore((state) => state.credits);

  const licenseLabel = licenseInfo?.is_lifetime
    ? '🛡️ Bản quyền (Vĩnh viễn)'
    : `🛡️ Bản quyền (còn ${licenseInfo?.days_remaining ?? 43} ngày)`;

  return (
    <aside className="w-56 flex-shrink-0 bg-[#0c101c] border-r border-gray-800 flex flex-col justify-between select-none h-full text-gray-300 font-sans z-10">
      <div className="flex-1 overflow-y-auto scrollable-body">
        {/* 1. Panda Mascot Header Box */}
        <div className="p-3 bg-gradient-to-b from-[#6b21a8] to-[#4c1d95] text-white flex flex-col items-center justify-center text-center select-none shadow-md">
          {/* Panda Icon with headphones */}
          <div className="w-16 h-16 rounded-2xl bg-[#581c87] border border-purple-400/40 flex items-center justify-center shadow-lg relative my-1">
            <span className="text-3xl">🐼</span>
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-cyan-400 text-gray-900 flex items-center justify-center">
              <Headphones size={11} />
            </div>
          </div>
          <h1 className="font-extrabold text-base tracking-wide text-white mt-1">PeiPei</h1>
          <p className="text-[10px] text-purple-200 leading-tight">
            PeiPei Dub - Dịch &amp; lồng tiếng video
          </p>
          <span className="text-[9px] text-purple-300 font-mono">Phiên bản 1.5.73</span>
        </div>

        {/* 2. Menu Navigation */}
        <div className="p-2 space-y-3">
          {/* Nhóm NGUỒN */}
          <div className="space-y-0.5">
            <p className="px-2.5 text-[10px] uppercase font-bold text-gray-500 tracking-wider">
              NGUỒN
            </p>
            {[
              { icon: <Download size={13} />, label: '📥 Tải video' },
              { icon: <Clock size={13} />, label: '📁 Hàng chờ tải (qua đêm)' },
              { icon: <Radio size={13} />, label: '🚀 Quét kênh (tải hàng loạt)' },
              { icon: <FileText size={13} />, label: '📄 Chọn SRT' },
            ].map((item, idx) => (
              <button
                key={idx}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-gray-300 hover:text-white hover:bg-[#161f36] transition-colors text-left"
              >
                <span className="truncate">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Nhóm CÔNG CỤ */}
          <div className="space-y-0.5">
            <p className="px-2.5 text-[10px] uppercase font-bold text-gray-500 tracking-wider">
              CÔNG CỤ
            </p>
            {[
              { label: '⏳ Hàng chờ dịch (0)' },
              { label: '✂️ Ghép / Tách video' },
              { label: '⚡ Tăng tốc GPU' },
              { label: '🎙️ Giọng clone (tải gói)' },
              { label: '🔊 Giọng Việt offline (tải gói)' },
              { label: '🔑 API Keys' },
            ].map((item, idx) => (
              <button
                key={idx}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-gray-300 hover:text-white hover:bg-[#161f36] transition-colors text-left"
              >
                <span className="truncate">{item.label}</span>
              </button>
            ))}

            {/* Nút Bản Quyền Kích Hoạt (Nhấp mở Modal) */}
            <button
              onClick={onOpenLicenseModal}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/40 hover:bg-emerald-900/50 transition-all text-left shadow-sm cursor-pointer"
              title="Nhấp để nhập Key mới hoặc xem hạn dùng"
            >
              <span>{licenseLabel}</span>
            </button>

            <button
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-gray-300 hover:text-white hover:bg-[#161f36] transition-colors text-left"
            >
              <span className="truncate">📜 Nhật ký làm video</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Bottom Credit Box & Status */}
      <div className="p-2.5 border-t border-gray-800 bg-[#090d16] space-y-2">
        <div className="p-2.5 rounded-xl bg-[#111625] border border-gray-800 space-y-1">
          <div className="text-[10px] uppercase font-bold text-gray-400">SỐ DƯ CREDIT</div>
          <div className="text-base font-extrabold text-emerald-400 font-mono tracking-tight">
            {credits.toLocaleString()}
          </div>
          <button
            onClick={onOpenCreditModal}
            className="w-full py-1 px-2 rounded-lg bg-[#1a233a] hover:bg-[#222f4f] text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all"
          >
            + Mua thêm
          </button>
        </div>

        <div className="text-[10px] text-emerald-400 font-semibold px-2 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Engine sẵn sàng</span>
        </div>
      </div>
    </aside>
  );
};

export default StudioSidebar;
