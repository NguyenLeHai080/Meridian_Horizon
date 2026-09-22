import React, { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Edit3, Image, Play, Pause, Volume2, VolumeX, Maximize2, Sparkles, Check, Download } from 'lucide-react';
import useStudioStore from '../store/studioStore';

export const VideoPlayerPreview = ({ onOpenSubtitleModal }) => {
  const { t } = useTranslation();
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const {
    videoUrl,
    videoDurationSeconds,
    currentTime,
    setCurrentTime,
    isPlaying,
    setIsPlaying,
    volume,
    setVolume,
    currentSubtitle,
    progress,
    subtitleStyle,
    maskConfig,
    addLog,
  } = useStudioStore();

  const [isMuted, setIsMuted] = useState(false);
  const [snapshotUrl, setSnapshotUrl] = useState(null);
  const [showSnapshotToast, setShowSnapshotToast] = useState(false);

  // Đồng bộ trạng thái Play/Pause giữa Store và thẻ Video
  const togglePlay = () => {
    if (!videoRef.current) {
      setIsPlaying(!isPlaying);
      return;
    }
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const targetSec = pos * (videoDurationSeconds || 30);
    if (videoRef.current) {
      videoRef.current.currentTime = targetSec;
    }
    setCurrentTime(targetSec);
  };

  const handleToggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  // Trích xuất Snapshot Frame sắc nét từ Video thật
  const handleCaptureFrame = () => {
    let capturedUrl = null;
    if (videoRef.current && videoRef.current.videoWidth > 0) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      capturedUrl = canvas.toDataURL('image/png');
    } else {
      // Fallback ảnh mẫu chất lượng cao nếu chưa nạp video MP4 thật
      capturedUrl = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1200&auto=format&fit=crop';
    }

    setSnapshotUrl(capturedUrl);
    setShowSnapshotToast(true);
    addLog(`Đã chụp frame xem trước tại mốc [${formatTime(currentTime)}]. Bấm để xem hoặc tải ảnh.`, 'success');
    setTimeout(() => setShowSnapshotToast(false), 4000);
  };

  const formatTime = (sec) => {
    const s = Math.max(0, sec || 0);
    const m = Math.floor(s / 60);
    const remS = Math.floor(s % 60);
    const ms = Math.floor((s % 1) * 1000);
    return `${String(m).padStart(2, '0')}:${String(remS).padStart(2, '0')}.${String(ms).padStart(3, '0').slice(0, 3)}`;
  };

  const totalTimeStr = formatTime(videoDurationSeconds || 30);
  const currentTimeStr = formatTime(currentTime);
  const percentPlayed = Math.min(100, Math.max(0, (currentTime / (videoDurationSeconds || 30)) * 100));

  // Xác định vị trí phụ đề
  const positionClass =
    subtitleStyle.position === 'top'
      ? 'top-8'
      : subtitleStyle.position === 'center'
      ? 'top-1/2 -translate-y-1/2'
      : 'bottom-12';

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#0a0e17] p-4 overflow-y-auto scrollable-body select-none">
      <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
        <span className="font-bold text-gray-200 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Khung hình Video &amp; Đồng bộ Phụ đề</span>
        </span>
        <span className="font-mono text-[11px] text-gray-400 bg-gray-900/80 px-2 py-0.5 rounded border border-gray-800">
          {currentTimeStr} / {totalTimeStr}
        </span>
      </div>

      {/* 1. Main Video Frame Screen */}
      <div
        ref={containerRef}
        className="relative w-full aspect-video bg-black rounded-xl border border-gray-800/90 overflow-hidden shadow-2xl flex flex-col justify-between group"
      >
        {/* Video HTML5 thực tế hoặc Fallback Anime Background */}
        {videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            className="absolute inset-0 w-full h-full object-contain bg-black"
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsPlaying(false)}
            onClick={togglePlay}
          />
        ) : (
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105 opacity-80 cursor-pointer"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1200&auto=format&fit=crop')`,
            }}
            onClick={togglePlay}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
          </div>
        )}

        {/* Hộp đen che vùng phụ đề gốc (Video Masking) */}
        {maskConfig.enabled && (
          <div
            className="absolute left-0 right-0 bg-black pointer-events-none z-10 transition-all shadow-[0_0_15px_rgba(0,0,0,0.9)]"
            style={{
              top: `${maskConfig.y}%`,
              height: `${maskConfig.height}%`,
              opacity: maskConfig.opacity / 100,
            }}
          >
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-[9px] font-mono text-gray-600 uppercase tracking-widest opacity-40">
                [VÙNG CHE PHỤ ĐỀ GỐC ĐANG KÍCH HOẠT]
              </span>
            </div>
          </div>
        )}

        {/* Top Video Overlay Badge */}
        <div className="relative z-20 p-3 flex justify-between items-center pointer-events-auto">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-900/80 text-purple-200 border border-purple-500/40 backdrop-blur-sm shadow-sm">
              1080P FHD • 60 FPS
            </span>
            {maskConfig.enabled && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40">
                MASKING ON
              </span>
            )}
          </div>
          <button
            onClick={handleFullscreen}
            className="p-1.5 rounded bg-black/60 hover:bg-black/80 text-gray-300 hover:text-white transition-colors cursor-pointer border border-gray-700/50"
            title="Toàn màn hình"
          >
            <Maximize2 size={13} />
          </button>
        </div>

        {/* Subtitle Display Overlay (Chạy đồng bộ theo thời gian thực) */}
        {currentSubtitle && (
          <div className={`absolute z-20 left-0 right-0 px-4 flex flex-col items-center justify-center text-center pointer-events-none ${positionClass}`}>
            <div
              className="inline-block px-4 py-2 rounded-xl backdrop-blur-md shadow-2xl transition-all max-w-xl"
              style={{
                backgroundColor: `rgba(0, 0, 0, ${subtitleStyle.bgOpacity / 100})`,
                border: `1px solid ${subtitleStyle.color}90`,
                boxShadow: `0 0 20px ${subtitleStyle.color}25`,
              }}
            >
              {/* Original Chinese Subtitle */}
              {subtitleStyle.showDual && currentSubtitle.zh && (
                <p className="text-xs md:text-sm font-semibold tracking-wide font-sans text-emerald-400 mb-0.5 opacity-90">
                  {currentSubtitle.zh}
                </p>
              )}
              {/* Vietnamese Translated Subtitle */}
              <p
                className="font-bold tracking-wide transition-all"
                style={{
                  fontSize: `${subtitleStyle.fontSize}px`,
                  color: subtitleStyle.color,
                  textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                }}
              >
                {currentSubtitle.vi}
              </p>
            </div>
          </div>
        )}

        {/* Bottom Playback Scrubber & Controls */}
        <div className="relative z-20 px-4 py-2 bg-gradient-to-t from-black via-black/80 to-transparent flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="p-1 rounded text-white hover:text-purple-400 transition-colors cursor-pointer"
            title={isPlaying ? 'Tạm dừng' : 'Phát'}
          >
            {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
          </button>

          {/* Scrubber Bar */}
          <div
            onClick={handleSeek}
            className="flex-1 h-2 bg-gray-800 hover:h-2.5 rounded-full overflow-hidden cursor-pointer relative transition-all"
            title="Kéo hoặc nhấp để tua video"
          >
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-emerald-400 rounded-full transition-all"
              style={{ width: `${percentPlayed}%` }}
            />
          </div>

          <span className="text-[10.5px] font-mono text-gray-400 min-w-[70px] text-right">
            {currentTimeStr.slice(0, 5)} / {totalTimeStr.slice(0, 5)}
          </span>

          <button
            onClick={handleToggleMute}
            className="text-gray-300 hover:text-white p-1 transition-colors cursor-pointer"
            title={isMuted ? 'Bật âm thanh' : 'Tắt âm'}
          >
            {isMuted ? <VolumeX size={16} className="text-rose-400" /> : <Volume2 size={16} />}
          </button>
        </div>
      </div>

      {/* 2. Controls Under Video */}
      <div className="mt-3 space-y-2.5">
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={handleCaptureFrame}
            className="flex-1 py-2 px-3 rounded-xl bg-[#141c2e] hover:bg-[#1b263f] text-gray-200 border border-gray-700/80 hover:border-cyan-500/50 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer active:scale-[0.99]"
          >
            <Image size={14} className="text-cyan-400" />
            <span>✨ Lấy frame xem trước</span>
          </button>

          <button
            onClick={onOpenSubtitleModal}
            className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-[#6b21a8] to-[#4c1d95] hover:from-[#7e22ce] hover:to-[#581c87] text-white font-bold text-xs border border-purple-400/40 flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-950/40 cursor-pointer active:scale-[0.99]"
          >
            <Edit3 size={14} />
            <span>📝 Mở Editor (căn phụ đề + che vùng, xem video)</span>
          </button>
        </div>

        {/* Thanh Progress Bar Tiến trình Dịch */}
        <div className="p-2.5 bg-[#0e1424] rounded-xl border border-gray-800 space-y-1.5 shadow-inner">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-gray-400 font-medium">Tiến độ quy trình xử lý:</span>
            <span className="font-mono font-bold text-emerald-400">{progress}%</span>
          </div>
          <div className="w-full bg-gray-900 rounded-full h-2.5 overflow-hidden border border-gray-800 relative">
            <div
              className="bg-gradient-to-r from-purple-500 via-teal-400 to-emerald-400 h-full rounded-full transition-all duration-500 flex items-center justify-center shadow-lg shadow-emerald-500/40"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Toast Thông báo Snapshot */}
        {showSnapshotToast && snapshotUrl && (
          <div className="p-3 bg-emerald-950/90 border border-emerald-500/60 rounded-xl flex items-center justify-between gap-3 text-xs animate-fadeIn shadow-xl">
            <div className="flex items-center gap-2.5 min-w-0">
              <img src={snapshotUrl} alt="Snapshot" className="w-12 h-8 rounded object-cover border border-emerald-400/50 flex-shrink-0" />
              <div className="truncate">
                <p className="font-bold text-emerald-300 truncate">✓ Đã chụp ảnh frame sắc nét!</p>
                <p className="text-[10px] text-gray-400">Mốc thời gian: {currentTimeStr}</p>
              </div>
            </div>
            <a
              href={snapshotUrl}
              download={`peipei_frame_${currentTimeStr.replace(/:/g, '-')}.png`}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-500 text-gray-950 font-bold text-[11px] hover:bg-emerald-400 transition-colors flex-shrink-0"
            >
              <Download size={12} />
              <span>Tải ảnh</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayerPreview;
