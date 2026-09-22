import React from 'react';
import { useTranslation } from 'react-i18next';
import { Play, Eye, Plus, Check, ChevronRight } from 'lucide-react';
import useStudioStore from '../store/studioStore';

export const WorkflowStepBar = ({ onOpenSelectVideoModal }) => {
  const { t } = useTranslation();
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
    { id: 1, label: t('studio.step1') },
    { id: 2, label: t('studio.step2') },
    { id: 3, label: t('studio.step3') },
    { id: 4, label: t('studio.step4') },
    { id: 5, label: t('studio.step5') },
  ];

  return (
    <div className="flex-shrink-0 bg-[#0f1524] border-b border-gray-800 p-3 space-y-2.5 select-none">
      {/* 1. Top Tabs & Quick Action Buttons */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        {/* Left Tabs */}
        <div className="flex items-center gap-1 bg-[#090d16] p-1 rounded-lg border border-gray-800">
          <button
            onClick={() => setActiveTab('dubbing')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'dubbing'
                ? 'bg-purple-600 text-white shadow'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {t('studio.title')}
          </button>
          <button
            onClick={() => setActiveTab('comics')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'comics'
                ? 'bg-purple-600 text-white shadow'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {t('studio.reviewComics')}
          </button>
        </div>

        {/* Video Path Indicator & Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onOpenSelectVideoModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#1a2336] hover:bg-[#232f48] text-amber-300 rounded border border-amber-500/30 transition-colors"
          >
            <span>📁 {t('studio.selectVideo')}</span>
          </button>

          <div className="max-w-[280px] truncate text-[11px] text-gray-400 bg-[#080d17] px-2.5 py-1.5 rounded border border-gray-800 font-mono">
            {videoFilename}
          </div>

          <button className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-gray-800 hover:bg-gray-700 text-gray-200 rounded transition-colors">
            <Eye size={13} />
            <span>{t('studio.previewVideo')}</span>
          </button>

          <button
            onClick={startTranslation}
            disabled={isProcessing}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded shadow-md shadow-purple-900/40 transition-all cursor-pointer"
          >
            <Play size={13} fill="currentColor" />
            <span>{isProcessing ? t('common.loading') : t('studio.startTranslation')}</span>
          </button>

          <button className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-gray-800/80 hover:bg-gray-700 text-gray-300 rounded border border-gray-700/60 transition-colors">
            <Plus size={12} />
            <span>{t('studio.queue')}</span>
          </button>
          <button className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-gray-800/80 hover:bg-gray-700 text-gray-300 rounded border border-gray-700/60 transition-colors">
            <Plus size={12} />
            <span>{t('studio.batch')}</span>
          </button>
        </div>
      </div>

      {/* 2. 5-Step Process Bar (Green Buttons identical to PeiPei screenshot) */}
      <div className="grid grid-cols-5 gap-2">
        {steps.map((step) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;

          return (
            <button
              key={step.id}
              onClick={() => setStep(step.id)}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded text-xs font-semibold transition-all border ${
                isCompleted || isCurrent
                  ? 'bg-emerald-600/90 text-white border-emerald-500 shadow-sm shadow-emerald-950'
                  : 'bg-[#151c2c] text-gray-400 border-gray-800 hover:border-gray-700 hover:text-gray-200'
              }`}
            >
              {isCompleted ? <Check size={13} className="text-white" /> : null}
              <span className="truncate">{step.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default WorkflowStepBar;
