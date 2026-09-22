import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, FileDown, Sliders, ChevronDown, CheckSquare, Trash2, Mic, Volume2 } from 'lucide-react';
import useStudioStore from '../store/studioStore';

export const ProviderConfigPanel = () => {
  const { t } = useTranslation();
  const {
    sourceType,
    setSourceType,
    ocrSource,
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
    selectedVoice,
    setSelectedVoice,
    voices,
    exportSrtContent,
    videoFilename,
    addLog,
  } = useStudioStore();

  const [sequentialTranslation, setSequentialTranslation] = useState(true);

  // Xử lý xuất file SRT thật
  const handleExportSrt = async () => {
    const srtContent = exportSrtContent();
    const defaultFileName = (videoFilename.split('/').pop()?.replace(/\.[^/.]+$/, '') || 'peipei_sub') + '.srt';

    if (window.electronAPI && window.electronAPI.saveFileDialog) {
      try {
        const res = await window.electronAPI.saveFileDialog({
          title: 'Xuất tệp phụ đề SRT',
          defaultPath: defaultFileName,
          content: srtContent,
          filters: [{ name: 'Subtitle Files (*.srt)', extensions: ['srt'] }]
        });
        if (res && !res.canceled && res.filePath) {
          addLog(`✓ Đã lưu tệp phụ đề SRT thành công: ${res.filePath}`, 'success');
          return;
        }
      } catch (e) {
        console.error('Save dialog error:', e);
      }
    }

    // Web fallback download
    const blob = new Blob([srtContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = defaultFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addLog(`✓ Đã tải tệp phụ đề [${defaultFileName}] về máy tính.`, 'success');
  };

  return (
    <aside className="w-80 flex-shrink-0 bg-[#0c101c] border-l border-gray-800 p-3 overflow-y-auto scrollable-body select-none text-xs space-y-4">
      {/* 1. SECTION: NGUỒN */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-1.5 font-bold text-gray-200">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          <span>• Nguồn video</span>
        </div>

        {/* Kiểu video toggle */}
        <div className="space-y-1">
          <label className="text-[11px] text-gray-400">Kiểu video:</label>
          <div className="grid grid-cols-2 gap-1 bg-[#070a12] p-1 rounded-lg border border-gray-800">
            <button
              onClick={() => setSourceType('has_sub')}
              className={`py-1.5 px-2 rounded text-[11px] font-semibold transition-all text-center cursor-pointer ${
                sourceType === 'has_sub'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Có phụ đề gốc - Dịch lại
            </button>
            <button
              onClick={() => setSourceType('no_sub')}
              className={`py-1.5 px-2 rounded text-[11px] font-semibold transition-all text-center cursor-pointer ${
                sourceType === 'no_sub'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Không phụ đề - Tự viết kịch bản
            </button>
          </div>
        </div>

        {/* Nguồn phụ đề */}
        <div className="space-y-1">
          <label className="text-[11px] text-gray-400">Nguồn phụ đề:</label>
          <select
            defaultValue="ocr"
            className="w-full py-1.5 px-2.5 bg-[#141a29] border border-gray-700/60 rounded text-gray-200 text-[11px] focus:outline-none cursor-pointer"
          >
            <option value="ocr">Phụ đề trong video (OCR) — chuẩn, chậm</option>
            <option value="audio_whisper">Âm thanh giọng nói (Whisper AI Transcription)</option>
            <option value="srt_file">File SRT có sẵn (Render lại, không tốn credit)</option>
          </select>
        </div>

        {/* Nút Xuất SRT */}
        <button
          onClick={handleExportSrt}
          className="w-full py-2 px-3 rounded-lg bg-[#161f33] hover:bg-[#1e2a44] text-cyan-300 hover:text-cyan-200 border border-cyan-500/40 flex items-center justify-center gap-1.5 text-[11px] font-semibold transition-all cursor-pointer shadow-sm active:scale-[0.99]"
          title="Tải tệp phụ đề .SRT về máy tính"
        >
          <FileDown size={13} />
          <span>📥 Xuất SRT để sửa ngoài</span>
        </button>
      </div>

      <div className="border-t border-gray-800/80" />

      {/* 2. SECTION: CẤU HÌNH DỊCH AI */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-1.5 font-bold text-gray-200">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
          <span>• Cấu hình Dịch AI</span>
        </div>

        {/* Phương thức: Offline / Online */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-gray-400">Phương thức:</span>
          <div className="flex gap-1 bg-[#070a12] p-0.5 rounded-lg border border-gray-800">
            <button
              onClick={() => setMethod('offline')}
              className={`px-2.5 py-1 text-[11px] rounded font-medium transition-all cursor-pointer ${
                method === 'offline' ? 'bg-purple-600 text-white font-bold' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Offline (Local)
            </button>
            <button
              onClick={() => setMethod('online')}
              className={`px-2.5 py-1 text-[11px] rounded font-medium transition-all cursor-pointer ${
                method === 'online' ? 'bg-blue-600 text-white font-bold' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Online (Cloud)
            </button>
          </div>
        </div>

        {/* Provider dịch */}
        <div className="space-y-1">
          <label className="text-[11px] text-gray-400">Provider dịch:</label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="w-full py-1.5 px-2.5 bg-[#141a29] border border-gray-700/60 rounded text-purple-300 font-semibold text-[11px] focus:outline-none cursor-pointer"
          >
            <option value="DeepSeek API">DeepSeek API (Chuyên văn phong tiên hiệp, truyện dịch)</option>
            <option value="OpenAI GPT-4o">OpenAI GPT-4o (Đa dụng, văn phong tự nhiên)</option>
            <option value="Google Gemini 1.5">Google Gemini 1.5 Pro (Xử lý ngữ cảnh dài)</option>
            <option value="Claude 3.5 Sonnet">Claude 3.5 Sonnet (Chính xác, sắc sảo)</option>
          </select>
        </div>

        {/* Checkbox Dịch kỹ */}
        <div className="flex items-center gap-2 pt-0.5">
          <input
            type="checkbox"
            id="chkSeq"
            checked={sequentialTranslation}
            onChange={(e) => setSequentialTranslation(e.target.checked)}
            className="rounded bg-gray-800 border-gray-700 text-purple-600 focus:ring-0 cursor-pointer"
          />
          <label htmlFor="chkSeq" className="text-[11px] text-gray-300 cursor-pointer select-none">
            Dịch kỹ (tuần tự - liền mạch, chậm hơn)
          </label>
        </div>

        {/* Cặp ngôn ngữ */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-gray-400 block mb-1">Ngôn ngữ nguồn:</label>
            <select
              defaultValue="zh"
              className="w-full py-1 px-2 bg-[#141a29] border border-gray-700/60 rounded text-gray-200 text-[11px] focus:outline-none cursor-pointer"
            >
              <option value="zh">Tiếng Trung</option>
              <option value="en">Tiếng Anh</option>
              <option value="ko">Tiếng Hàn</option>
              <option value="ja">Tiếng Nhật</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] text-gray-400 block mb-1">Dịch sang:</label>
            <select
              defaultValue="vi"
              className="w-full py-1 px-2 bg-[#141a29] border border-gray-700/60 rounded text-emerald-300 font-bold text-[11px] focus:outline-none cursor-pointer"
            >
              <option value="vi">Tiếng Việt</option>
              <option value="en">Tiếng Anh</option>
            </select>
          </div>
        </div>

        {/* Thể loại video */}
        <div className="space-y-1">
          <label className="text-[11px] text-gray-400">Thể loại video:</label>
          <select
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="w-full py-1.5 px-2.5 bg-[#141a29] border border-gray-700/60 rounded text-gray-200 text-[11px] focus:outline-none cursor-pointer"
          >
            <option value="Võ hiệp / Trọng sinh">Võ hiệp / Trọng sinh / Tiên hiệp</option>
            <option value="Đô thị / Hài hước">Đô thị / Tình cảm / Hài hước</option>
            <option value="Review Phim / Truyện Tranh">Review Phim / Tóm tắt Truyện Tranh</option>
            <option value="Tài liệu / Khoa học">Tài liệu / Đời sống / Khoa học</option>
            <option value="Tin tức / Sự kiện">Tin tức / Bình luận thời sự</option>
          </select>
        </div>

        {/* Giọng đọc AI */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-gray-400">
            <span className="flex items-center gap-1">
              <Mic size={12} className="text-amber-400" />
              <span>Giọng đọc AI (TTS):</span>
            </span>
          </div>
          <select
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value)}
            className="w-full py-1.5 px-2.5 bg-[#141a29] border border-gray-700/60 rounded text-amber-300 font-semibold text-[11px] focus:outline-none cursor-pointer"
          >
            {voices.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} ({v.gender} - {v.region}) • {v.style}
              </option>
            ))}
          </select>
        </div>

        {/* Prompt văn phong tùy chỉnh */}
        <div className="space-y-1">
          <label className="text-[11px] text-gray-400">Văn phong AI:</label>
          <textarea
            rows={4}
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            className="w-full bg-[#070b14] border border-gray-700/80 rounded-lg p-2 text-[11px] font-mono text-gray-300 focus:outline-none focus:border-purple-500 transition-colors resize-none leading-relaxed"
            placeholder="Hướng dẫn xưng hô, ngôi kể cho AI..."
          />
        </div>
      </div>
    </aside>
  );
};

export default ProviderConfigPanel;
