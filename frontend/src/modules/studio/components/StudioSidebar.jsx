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
  Headphones,
  ListOrdered,
  History
} from 'lucide-react';
import useStudioStore from '../store/studioStore';

export const StudioSidebar = ({
  onOpenCreditModal,
  onOpenLicenseModal,
  onOpenDownloadModal,
  onOpenQueueModal,
  onOpenImportSrtModal,
  onOpenVideoEditModal,
  onOpenGpuModal,
  onOpenVoiceModal,
  onOpenApiKeyModal,
  onOpenHistoryModal,
  licenseInfo,
}) => {
  const credits = useStudioStore((state) => state.credits);
  const videoQueue = useStudioStore((state) => state.videoQueue);

  const isActivated = !!licenseInfo;
  const permissions = licenseInfo?.permissions || (() => {
    try {
      const saved = localStorage.getItem('wukong_permissions');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  })();

  const isPermitted = (permKey) => {
    if (!permissions) return true;
    return permissions[permKey] !== false;
  };

  const licenseLabel = !isActivated
    ? '🛡️ Kích hoạt Bản quyền'
    : licenseInfo?.is_lifetime
    ? '🛡️ Bản quyền (Vĩnh viễn)'
    : `🛡️ Bản quyền (còn ${licenseInfo?.days_remaining ?? 43} ngày)`;

  return (
    <aside className="w-56 flex-shrink-0 bg-[#0c101c] border-r border-gray-800 flex flex-col justify-between select-none h-full text-gray-300 font-sans z-10">
      <div className="flex-1 overflow-y-auto scrollable-body">
        {/* 1. Panda Mascot Header Box */}
        <div className="p-3 bg-gradient-to-b from-[#6b21a8] to-[#4c1d95] text-white flex flex-col items-center justify-center text-center select-none shadow-md">
          {/* Panda Icon with headphones */}
          <div className="w-16 h-16 rounded-2xl bg-[#581c87] border border-purple-400/40 flex items-center justify-center shadow-lg relative my-1 overflow-hidden">
            <img src="/icon.png" alt="Panda" className="w-12 h-12 object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
            <span className="text-3xl absolute pointer-events-none">🐼</span>
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-cyan-400 text-gray-900 flex items-center justify-center shadow-[0_0_8px_#22d3ee]">
              <Headphones size={11} strokeWidth={3} />
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
            {isPermitted('source_download_url') && (
              <button
                onClick={onOpenDownloadModal}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-gray-300 hover:text-white hover:bg-[#161f36] transition-colors text-left cursor-pointer"
              >
                <Download size={13} className="text-cyan-400 flex-shrink-0" />
                <span className="truncate">Tải video (URL)</span>
              </button>
            )}
            {isPermitted('source_queue') && (
              <button
                onClick={onOpenQueueModal}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-gray-300 hover:text-white hover:bg-[#161f36] transition-colors text-left cursor-pointer"
              >
                <Clock size={13} className="text-amber-400 flex-shrink-0" />
                <span className="truncate">Hàng chờ tải (qua đêm)</span>
              </button>
            )}
            {isPermitted('source_channel_scan') && (
              <button
                onClick={onOpenDownloadModal}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-gray-300 hover:text-white hover:bg-[#161f36] transition-colors text-left cursor-pointer"
              >
                <Radio size={13} className="text-purple-400 flex-shrink-0" />
                <span className="truncate">Quét kênh (tải hàng loạt)</span>
              </button>
            )}
            {isPermitted('source_import_srt') && (
              <button
                onClick={onOpenImportSrtModal}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-gray-300 hover:text-white hover:bg-[#161f36] transition-colors text-left cursor-pointer"
              >
                <FileText size={13} className="text-emerald-400 flex-shrink-0" />
                <span className="truncate">Chọn SRT</span>
              </button>
            )}
          </div>

          {/* Nhóm CÔNG CỤ */}
          <div className="space-y-0.5">
            <p className="px-2.5 text-[10px] uppercase font-bold text-gray-500 tracking-wider">
              CÔNG CỤ
            </p>
            {isPermitted('tool_queue') && (
              <button
                onClick={onOpenQueueModal}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-gray-300 hover:text-white hover:bg-[#161f36] transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-2 truncate">
                  <ListOrdered size={13} className="text-cyan-400 flex-shrink-0" />
                  <span className="truncate">Hàng chờ dịch</span>
                </div>
                <span className="px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono">
                  {videoQueue?.length || 0}
                </span>
              </button>
            )}

            {isPermitted('tool_video_split') && (
              <button
                onClick={onOpenVideoEditModal}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-gray-300 hover:text-white hover:bg-[#161f36] transition-colors text-left cursor-pointer"
              >
                <Scissors size={13} className="text-rose-400 flex-shrink-0" />
                <span className="truncate">Ghép / Tách video</span>
              </button>
            )}

            {isPermitted('tool_gpu') && (
              <button
                onClick={onOpenGpuModal}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-gray-300 hover:text-white hover:bg-[#161f36] transition-colors text-left cursor-pointer"
              >
                <Zap size={13} className="text-amber-400 flex-shrink-0" />
                <span className="truncate">Tăng tốc GPU</span>
              </button>
            )}

            {isPermitted('tool_voice_clone') && (
              <button
                onClick={onOpenVoiceModal}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-gray-300 hover:text-white hover:bg-[#161f36] transition-colors text-left cursor-pointer"
              >
                <Mic size={13} className="text-purple-400 flex-shrink-0" />
                <span className="truncate">Giọng clone (tải gói)</span>
              </button>
            )}

            {isPermitted('tool_offline_voice') && (
              <button
                onClick={onOpenVoiceModal}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-gray-300 hover:text-white hover:bg-[#161f36] transition-colors text-left cursor-pointer"
              >
                <Volume2 size={13} className="text-emerald-400 flex-shrink-0" />
                <span className="truncate">Giọng Việt offline (tải gói)</span>
              </button>
            )}

            {isPermitted('tool_api_keys') && (
              <button
                onClick={onOpenApiKeyModal}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-gray-300 hover:text-white hover:bg-[#161f36] transition-colors text-left cursor-pointer"
              >
                <Key size={13} className="text-amber-400 flex-shrink-0" />
                <span className="truncate">API Keys</span>
              </button>
            )}

            {/* Nút Bản Quyền Kích Hoạt */}
            <button
              onClick={onOpenLicenseModal}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all text-left shadow-sm cursor-pointer ${
                isActivated
                  ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-500/40 hover:bg-emerald-900/50'
                  : 'text-amber-300 bg-amber-950/40 border border-amber-500/50 hover:bg-amber-900/50 animate-pulse'
              }`}
              title="Nhấp để nhập Key mới hoặc xem thông tin hạn dùng"
            >
              <div className="flex items-center gap-1.5 truncate">
                <ShieldCheck size={13} className="flex-shrink-0" />
                <span className="truncate">{licenseLabel}</span>
              </div>
            </button>

            {/* Nhật ký làm video */}
            <button
              onClick={onOpenHistoryModal}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-gray-300 hover:text-white hover:bg-[#161f36] transition-colors text-left cursor-pointer"
            >
              <History size={13} className="text-cyan-400 flex-shrink-0" />
              <span className="truncate">Nhật ký làm video</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Bottom Credits Widget */}
      <div className="p-3 bg-[#080d17] border-t border-gray-800 flex-shrink-0">
        <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1">
          <span className="uppercase font-bold tracking-wider text-[10px]">SỐ DƯ CREDIT</span>
        </div>
        <div className="text-base font-extrabold font-mono text-emerald-400 tracking-tight flex items-baseline gap-1">
          <span>{credits.toLocaleString()}</span>
          <span className="text-[10px] font-sans font-normal text-gray-400">credits</span>
        </div>

        <button
          onClick={onOpenCreditModal}
          className="mt-2 w-full py-1.5 rounded-lg bg-[#1a233a] hover:bg-[#253252] text-cyan-300 hover:text-cyan-200 border border-cyan-500/30 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
        >
          <Plus size={12} strokeWidth={3} />
          <span>Mua thêm</span>
        </button>

        <div className="mt-2 flex items-center justify-center gap-1 text-[10px] text-gray-500 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Engine sẵn sàng</span>
        </div>
      </div>
    </aside>
  );
};

export default StudioSidebar;
