import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, FileDown, Sliders, ChevronDown, CheckSquare, Trash2, FolderOpen } from 'lucide-react';
import useStudioStore from '../store/studioStore';

export const ProviderConfigPanel = () => {
  const { t } = useTranslation();
  const {
    sourceType,
    setSourceType,
    method,
    setMethod,
    provider,
    setProvider,
    sourceLang,
    targetLang,
    genre,
    setGenre,
    customPrompt,
    setCustomPrompt,
  } = useStudioStore();

  return (
    <aside className="w-80 flex-shrink-0 bg-[#0c101c] border-l border-gray-800 p-3 overflow-y-auto scrollable-body select-none text-xs space-y-4">
      {/* 1. SECTION: NGUỒN */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-1.5 font-bold text-gray-200">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          <span>{t('studio.sourceSection')}</span>
        </div>

        {/* Kiểu video toggle */}
        <div className="space-y-1">
          <label className="text-[11px] text-gray-400">Kiểu video:</label>
          <div className="grid grid-cols-2 gap-1 bg-[#070a12] p-1 rounded-lg border border-gray-800">
            <button
              onClick={() => setSourceType('has_sub')}
              className={`py-1.5 px-2 rounded text-[11px] font-semibold transition-all text-center ${
                sourceType === 'has_sub'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {t('studio.hasOriginalSub')}
            </button>
            <button
              onClick={() => setSourceType('no_sub')}
              className={`py-1.5 px-2 rounded text-[11px] font-semibold transition-all text-center ${
                sourceType === 'no_sub'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {t('studio.noSubAutoScript')}
            </button>
          </div>
        </div>

        {/* Nguồn phụ đề */}
        <div className="space-y-1">
          <label className="text-[11px] text-gray-400">Nguồn phụ đề:</label>
          <div className="w-full py-1.5 px-2.5 bg-[#141a29] border border-gray-700/60 rounded text-gray-300 text-[11px]">
            {t('studio.sourceSubOcr')}
          </div>
        </div>

        {/* Nút Xuất SRT */}
        <button className="w-full py-1.5 px-3 rounded bg-[#161f33] hover:bg-[#1e2a44] text-cyan-300 hover:text-cyan-200 border border-cyan-500/30 flex items-center justify-center gap-1.5 text-[11px] font-semibold transition-colors">
          <FileDown size={13} />
          <span>{t('studio.exportSrt')}</span>
        </button>
      </div>

      <div className="border-t border-gray-800/80" />

      {/* 2. SECTION: DỊCH AI */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-1.5 font-bold text-gray-200">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
          <span>{t('studio.translationSection')}</span>
        </div>

        {/* Phương thức: Offline / Online */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-gray-400">Phương thức:</span>
          <div className="flex gap-1 bg-[#070a12] p-0.5 rounded border border-gray-800">
            <button
              onClick={() => setMethod('offline')}
              className={`px-2.5 py-1 text-[11px] rounded font-medium transition-all ${
                method === 'offline' ? 'bg-purple-600 text-white' : 'text-gray-400'
              }`}
            >
              Offline (Local)
            </button>
            <button
              onClick={() => setMethod('online')}
              className={`px-2.5 py-1 text-[11px] rounded font-medium transition-all ${
                method === 'online' ? 'bg-blue-600 text-white' : 'text-gray-400'
              }`}
            >
              Online (Cloud)
            </button>
          </div>
        </div>

        {/* Provider Dropdown */}
        <div className="space-y-1">
          <label className="text-[11px] text-gray-400">{t('studio.provider')}:</label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="w-full py-1.5 px-2.5 bg-[#141a29] border border-gray-700/80 rounded text-gray-200 text-xs focus:outline-none focus:border-purple-500"
          >
            <option value="DeepSeek API">DeepSeek API (Chuyên văn phong tiên hiệp)</option>
            <option value="OpenAI GPT-4o">OpenAI GPT-4o (Độ chính xác cao)</option>
            <option value="Offline Local">Offline VITS Local (Không tốn credit)</option>
          </select>
        </div>

        {/* Checkbox Dịch kỹ */}
        <label className="flex items-center gap-2 text-[11px] text-gray-300 cursor-pointer">
          <input type="checkbox" defaultChecked className="rounded bg-gray-800 text-purple-600 focus:ring-0" />
          <span>Dịch kỹ (tuần tự - liền mạch, chậm hơn)</span>
        </label>

        {/* Ngôn ngữ nguồn / Ngôn ngữ dịch sang */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400">{t('studio.sourceLang')}:</span>
            <input
              type="text"
              readOnly
              value={sourceLang}
              className="w-full py-1 px-2 bg-[#121724] border border-gray-800 rounded text-gray-300 text-[11px]"
            />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400">{t('studio.targetLang')}:</span>
            <input
              type="text"
              readOnly
              value={targetLang}
              className="w-full py-1 px-2 bg-[#121724] border border-gray-800 rounded text-gray-300 text-[11px]"
            />
          </div>
        </div>

        {/* Thể loại video */}
        <div className="space-y-1">
          <label className="text-[11px] text-gray-400">{t('studio.genre')}:</label>
          <select
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="w-full py-1.5 px-2.5 bg-[#141a29] border border-gray-700/80 rounded text-gray-200 text-xs focus:outline-none focus:border-purple-500"
          >
            <option value="Xuyên không / Trọng sinh">Xuyên không / Trọng sinh</option>
            <option value="Đô thị tu tiên">Đô thị tu tiên</option>
            <option value="Võ hiệp cổ trang">Võ hiệp cổ trang</option>
            <option value="Hiện đại đời thường">Hiện đại đời thường</option>
          </select>
        </div>

        {/* Custom Prompt Box */}
        <div className="space-y-1">
          <label className="text-[11px] text-amber-400 font-semibold flex items-center gap-1">
            <Sparkles size={12} />
            <span>Prompt riêng cho AI:</span>
          </label>
          <textarea
            rows={4}
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            className="w-full p-2 bg-[#080c14] border border-gray-800 rounded text-gray-300 text-[11px] font-mono leading-relaxed focus:outline-none focus:border-purple-500 resize-none"
          />
        </div>

        {/* Prompt Actions */}
        <div className="flex items-center gap-1 pt-1">
          <button className="flex-1 py-1 px-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-[10px] font-medium rounded flex items-center justify-center gap-1">
            <Sliders size={11} />
            <span>Dùng mẫu</span>
          </button>
          <button className="flex-1 py-1 px-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-[10px] font-medium rounded flex items-center justify-center gap-1">
            <FolderOpen size={11} />
            <span>Tải file</span>
          </button>
          <button className="p-1 bg-gray-800 hover:bg-rose-900/50 text-gray-400 hover:text-rose-400 rounded">
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default ProviderConfigPanel;
