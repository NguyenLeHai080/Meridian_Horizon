import React from 'react';
import { useTranslation } from 'react-i18next';
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
} from 'lucide-react';
import useStudioStore from '../store/studioStore';

export const StudioSidebar = ({ onOpenCreditModal }) => {
  const { t } = useTranslation();
  const credits = useStudioStore((state) => state.credits);

  const menuItems = [
    { id: 'download', icon: <Download size={16} />, label: t('sidebar.downloadVideo') },
    { id: 'queue', icon: <Clock size={16} />, label: t('sidebar.downloadQueue') },
    { id: 'scan', icon: <Radio size={16} />, label: t('sidebar.scanChannel') },
    { id: 'srt', icon: <FileText size={16} />, label: t('sidebar.selectSrt') },
    { id: 'split', icon: <Scissors size={16} />, label: t('sidebar.splitVideo') },
    { id: 'gpu', icon: <Zap size={16} className="text-amber-400" />, label: t('sidebar.gpuAcceleration') },
    { id: 'voice_clone', icon: <Mic size={16} className="text-rose-400" />, label: t('sidebar.voiceClone') },
    { id: 'offline_tts', icon: <Volume2 size={16} className="text-emerald-400" />, label: t('sidebar.offlineVoice') },
    { id: 'api_keys', icon: <Key size={16} className="text-cyan-400" />, label: t('sidebar.apiKeys') },
    { id: 'license', icon: <ShieldCheck size={16} className="text-blue-400" />, label: t('sidebar.license') },
    { id: 'log', icon: <FileSpreadsheet size={16} />, label: t('sidebar.videoLog') },
  ];

  return (
    <aside className="w-60 flex-shrink-0 bg-[#0d121f] border-r border-gray-800 flex flex-col justify-between select-none h-full">
      {/* 1. Brand Header */}
      <div>
        <div className="p-4 border-b border-gray-800 flex items-center gap-3 bg-[#080d18]">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-purple-900/40">
            <Sparkles size={22} />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-wide text-gray-100 flex items-center gap-1">
              PeiPei <span className="text-xs px-1 py-0.5 rounded bg-purple-900/60 text-purple-300 font-normal">Dub</span>
            </h1>
            <p className="text-[10px] text-gray-400">Meridian Horizon v1.5.73</p>
          </div>
        </div>

        {/* 2. Menu Items Navigation */}
        <nav className="p-2 space-y-0.5 overflow-y-auto max-h-[calc(100vh-230px)] scrollable-body">
          <p className="px-3 py-1.5 text-[10px] uppercase font-bold text-gray-500 tracking-wider">
            Nguồn & Công cụ
          </p>
          {menuItems.map((item, idx) => (
            <button
              key={item.id}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                idx === 0
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                  : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800/60'
              }`}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* 3. Bottom Credit Box (Giống hệt góc trái dưới ảnh mẫu) */}
      <div className="p-3 border-t border-gray-800 bg-[#090e1a]">
        <div className="p-3 rounded-lg bg-[#141b2d] border border-gray-700/60 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase text-gray-400 font-semibold block">Số dư Credit</span>
            <span className="text-base font-extrabold text-emerald-400 font-mono tracking-tight">
              {credits.toLocaleString()}
            </span>
          </div>
          <button
            onClick={onOpenCreditModal}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded bg-purple-600 hover:bg-purple-700 text-white shadow-sm transition-all"
          >
            <Plus size={12} />
            <span>Mua thêm</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default StudioSidebar;
