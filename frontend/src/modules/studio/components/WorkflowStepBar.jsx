import React from 'react';
import { Play, Eye, Plus, Check, ChevronRight, FolderOpen, X } from 'lucide-react';
import useStudioStore from '../store/studioStore';

export const WorkflowStepBar = ({ onOpenSelectVideoModal }) => {
  const {
    activeTab,
    setActiveTab,
    currentStep,
    setStep,
    videoFilename,
    isProcessing,
    startTranslation,
  } = useStudioStore();

  const steps = [
    { id: 1, label: '1. Tách transcript' },
    { id: 2, label: '2. Dịch' },
    { id: 3, label: '3. Tạo phụ đề' },
    { id: 4, label: '4. Tạo giọng' },
    { id: 5, label: '5. Xuất bản' },
  ];

  return (
    <div className="flex-shrink-0 bg-[#0a0e1a] border-b border-gray-800 select-none">
      {/* 1. TOP TABS: Dịch lồng tiếng video & Review Truyện Tranh */}
      <div className="px-4 py-2 flex items-center gap-2 bg-[#070a12] border-b border-gray-800/80">
        <button
          onClick={() => setActiveTab('dubbing')}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'dubbing'
              ? 'bg-[#7c3aed] text-white shadow-md shadow-purple-900/30'
              : 'bg-[#161f33] text-gray-400 hover:text-white'
          }`}
        >
          ☰ Dịch Lồng tiếng video
        </button>
        <button
          onClick={() => setActiveTab('comics')}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'comics'
              ? 'bg-[#7c3aed] text-white shadow-md shadow-purple-900/30'
              : 'bg-[#161f33] text-gray-400 hover:text-white'
          }`}
        >
          ■ Review Truyện Tranh
        </button>
      </div>

      {/* 2. FILE SELECTOR BAR */}
      <div className="px-4 py-2.5 bg-[#0e1424] flex items-center gap-2 border-b border-gray-800">
        <button
          onClick={onOpenSelectVideoModal}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#d97706] hover:bg-[#b45309] text-white rounded-lg transition-colors shadow-sm cursor-pointer"
        >
          <FolderOpen size={14} />
          <span>Chọn video</span>
        </button>

        <div className="flex-1 relative flex items-center">
          <input
            type="text"
            readOnly
            value={videoFilename || 'ideast\\PeiPeiReup\\神性游戏_第23集|虚空神藏降世 林宣强势镇压神圣 众仙俯首称臣 这正是一场光看数词就发...一个不消_bilibili.mp4'}
            className="w-full bg-[#162035] border border-gray-700/80 rounded-lg px-3 py-1.5 text-xs text-gray-200 font-sans focus:outline-none truncate"
          />
          <button
            onClick={() => {}}
            className="absolute right-2 text-gray-400 hover:text-white"
          >
            <X size={14} />
          </button>
        </div>

        <span className="px-2.5 py-1 rounded bg-[#162035] text-gray-400 text-xs font-mono border border-gray-800">
          30 giây
        </span>

        <button
          onClick={() => alert('Đang phát đoạn xem trước 30 giây kèm phụ đề OCR.')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a243a] hover:bg-[#22304d] text-gray-200 border border-gray-700 text-xs font-semibold transition-colors"
        >
          <Eye size={13} />
          <span>Xem trước</span>
        </button>

        <button
          onClick={startTranslation}
          disabled={isProcessing}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md shadow-purple-900/40 ${
            isProcessing
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-[#7c3aed] hover:bg-[#6d28d9] text-white'
          }`}
        >
          <Play size={13} />
          <span>{isProcessing ? 'Đang dịch AI...' : 'Bắt đầu dịch'}</span>
        </button>

        <button className="px-2.5 py-1.5 rounded-lg bg-[#1a243a] hover:bg-[#22304d] text-gray-300 border border-gray-700 text-xs font-semibold transition-colors">
          + Hàng chờ
        </button>

        <button className="px-2.5 py-1.5 rounded-lg bg-[#1a243a] hover:bg-[#22304d] text-gray-300 border border-gray-700 text-xs font-semibold transition-colors">
          + Nhiều video
        </button>
      </div>

      {/* 3. 5-STEP PIPELINE GREEN BAR */}
      <div className="px-4 py-2 bg-[#080c16] flex items-center justify-between gap-1">
        {steps.map((s, idx) => {
          const isDone = s.id <= currentStep;
          return (
            <React.Fragment key={s.id}>
              <div
                onClick={() => setStep(s.id)}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold text-center transition-all cursor-pointer select-none ${
                  isDone
                    ? 'bg-[#059669] text-white shadow-sm'
                    : 'bg-[#131d31] text-gray-400 hover:text-gray-200'
                }`}
              >
                <span>{s.label}</span>
              </div>
              {idx < steps.length - 1 && (
                <span className="text-gray-600 font-bold px-0.5 text-xs">➔</span>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default WorkflowStepBar;
