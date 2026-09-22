import React, { useRef } from 'react';
import { Play, Square, Eye, Plus, Check, FolderOpen, X, Sparkles, Film, Layers } from 'lucide-react';
import useStudioStore from '../store/studioStore';

export const WorkflowStepBar = ({ onOpenSelectVideoModal }) => {
  const fileInputRef = useRef(null);

  const {
    activeTab,
    setActiveTab,
    currentStep,
    setStep,
    videoFilename,
    videoDuration,
    videoDurationSeconds,
    isProcessing,
    startTranslation,
    cancelTranslation,
    setVideo,
    setIsPlaying,
    setCurrentTime,
    addLog,
  } = useStudioStore();

  const steps = [
    { id: 1, label: '1. Tách transcript' },
    { id: 2, label: '2. Dịch' },
    { id: 3, label: '3. Tạo phụ đề' },
    { id: 4, label: '4. Tạo giọng' },
    { id: 5, label: '5. Xuất bản' },
  ];

  // Xử lý mở hộp thoại chọn Video (Ưu tiên Electron Native File Dialog, Fallback Web Input)
  const handleSelectVideo = async () => {
    if (window.electronAPI && window.electronAPI.openFileDialog) {
      try {
        const res = await window.electronAPI.openFileDialog({
          title: 'Chọn tệp video để biên dịch và lồng tiếng',
          filters: [
            { name: 'Video Files (*.mp4, *.mkv, *.avi, *.mov, *.webm, *.flv)', extensions: ['mp4', 'mkv', 'avi', 'mov', 'webm', 'flv', 'ts'] },
            { name: 'All Files', extensions: ['*'] }
          ]
        });
        if (res && !res.canceled && res.filePath) {
          const sizeMB = (res.size / (1024 * 1024)).toFixed(1);
          setVideo({
            filename: res.fileName,
            url: `http://127.0.0.1:${window.location.port || 61642}/${encodeURIComponent(res.fileName)}`, // hoặc file path
            duration: '00:30',
            durationSeconds: 30
          });
          addLog(`✓ Đã nạp thành công tệp: ${res.fileName} (${sizeMB} MB)`, 'success');
          return;
        }
      } catch (e) {
        console.error('Electron file dialog error:', e);
      }
    }

    // Fallback mở Modal chọn video
    onOpenSelectVideoModal();
  };

  // Fallback chọn từ thẻ input web
  const handleNativeFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideo({
        file,
        url,
        filename: file.name,
        duration: '00:30',
        durationSeconds: 30,
      });
      addLog(`✓ Đã nạp tệp video từ máy tính: ${file.name}`, 'success');
    }
  };

  const handleClearVideo = () => {
    setVideo({
      file: null,
      url: null,
      filename: '',
      duration: '00:00',
      durationSeconds: 0,
    });
    addLog('Đã gỡ bỏ video hiện tại.', 'info');
  };

  const handlePreview = () => {
    setCurrentTime(0);
    setIsPlaying(true);
    addLog('Đang phát đoạn xem trước video kèm phụ đề.', 'info');
  };

  return (
    <div className="flex-shrink-0 bg-[#0a0e1a] border-b border-gray-800 select-none">
      {/* Ẩn input file để fallback */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleNativeFileInputChange}
        accept="video/*"
        className="hidden"
      />

      {/* 1. TOP TABS: Dịch lồng tiếng video & Review Truyện Tranh */}
      <div className="px-4 py-2 flex items-center justify-between bg-[#070a12] border-b border-gray-800/80">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('dubbing')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'dubbing'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-950/50'
                : 'bg-[#12192b] text-gray-400 hover:text-white border border-gray-800'
            }`}
          >
            <Film size={13} />
            <span>Dịch Lồng tiếng video</span>
          </button>
          <button
            onClick={() => setActiveTab('comics')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'comics'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-950/50'
                : 'bg-[#12192b] text-gray-400 hover:text-white border border-gray-800'
            }`}
          >
            <Layers size={13} />
            <span>Review Truyện Tranh</span>
          </button>
        </div>

        <div className="text-[11px] text-gray-400 flex items-center gap-2 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>CUDA ACCELERATED</span>
        </div>
      </div>

      {/* 2. FILE SELECTOR BAR */}
      <div className="px-4 py-2 bg-[#0e1424] flex items-center gap-2.5 border-b border-gray-800">
        <button
          onClick={handleSelectVideo}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-gray-950 rounded-lg transition-all shadow-sm cursor-pointer active:scale-[0.99]"
          title="Chọn tệp video từ máy tính"
        >
          <FolderOpen size={14} />
          <span>Chọn video</span>
        </button>

        <div className="flex-1 relative flex items-center min-w-0">
          <input
            type="text"
            readOnly
            value={videoFilename || 'Chưa chọn video...'}
            placeholder="Nhấp 'Chọn video' để mở tệp từ máy tính"
            className="w-full bg-[#141d30] border border-gray-700/80 rounded-lg pl-3 pr-8 py-1.5 text-xs text-cyan-300 font-sans focus:outline-none truncate"
          />
          {videoFilename && (
            <button
              onClick={handleClearVideo}
              className="absolute right-2 text-gray-400 hover:text-rose-400 p-0.5 rounded cursor-pointer"
              title="Xóa tệp đang chọn"
            >
              <X size={13} />
            </button>
          )}
        </div>

        <span className="px-2.5 py-1.5 rounded-lg bg-[#141d30] text-gray-300 text-xs font-mono border border-gray-800 flex-shrink-0">
          {videoDuration || '00:30'}
        </span>

        <button
          onClick={handlePreview}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#18233a] hover:bg-[#202e4d] text-gray-200 border border-gray-700 text-xs font-semibold transition-all cursor-pointer flex-shrink-0 active:scale-[0.99]"
        >
          <Eye size={13} className="text-cyan-400" />
          <span>Xem trước</span>
        </button>

        {/* Nút Bắt đầu dịch / Dừng dịch */}
        {isProcessing ? (
          <button
            onClick={cancelTranslation}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-md shadow-rose-900/40 cursor-pointer flex-shrink-0 animate-pulse active:scale-[0.99]"
            title="Dừng tiến trình hiện tại"
          >
            <Square size={13} fill="currentColor" />
            <span>Dừng dịch</span>
          </button>
        ) : (
          <button
            onClick={startTranslation}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white transition-all shadow-md shadow-purple-900/40 cursor-pointer flex-shrink-0 active:scale-[0.99]"
            title="Chạy quy trình 5 bước dịch và lồng tiếng"
          >
            <Play size={13} fill="currentColor" />
            <span>Bắt đầu dịch</span>
          </button>
        )}

        <button
          onClick={() => {
            addLog(`Đã thêm [${videoFilename || 'video'}] vào hàng chờ dịch.`, 'info');
          }}
          className="px-2.5 py-1.5 rounded-lg bg-[#141d30] hover:bg-[#1d2a45] text-gray-300 border border-gray-700 text-xs font-semibold transition-colors cursor-pointer flex-shrink-0"
        >
          + Hàng chờ
        </button>

        <button
          onClick={onOpenSelectVideoModal}
          className="px-2.5 py-1.5 rounded-lg bg-[#141d30] hover:bg-[#1d2a45] text-gray-300 border border-gray-700 text-xs font-semibold transition-colors cursor-pointer flex-shrink-0"
        >
          + Nhiều video
        </button>
      </div>

      {/* 3. 5-STEPS PROGRESS NAVIGATION BAR */}
      <div className="px-4 py-2 bg-[#070b14] flex items-center justify-between gap-1 border-b border-gray-800/80 overflow-x-auto">
        {steps.map((step, idx) => {
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;

          return (
            <div
              key={step.id}
              onClick={() => setStep(step.id)}
              className={`flex-1 min-w-[120px] py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer text-center ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-gray-950 font-black shadow-[0_0_15px_rgba(16,185,129,0.35)]'
                  : isCompleted
                  ? 'bg-emerald-950/60 border border-emerald-500/30 text-emerald-300'
                  : 'bg-[#101726] border border-gray-800 text-gray-400 hover:text-gray-200'
              }`}
            >
              {isCompleted ? (
                <Check size={12} strokeWidth={3} className="text-emerald-400" />
              ) : isActive && isProcessing ? (
                <span className="w-2 h-2 rounded-full bg-gray-950 animate-ping" />
              ) : null}
              <span className="truncate">{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WorkflowStepBar;
