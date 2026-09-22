import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Sparkles,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Plus,
  Trash2,
  Mic,
  Music,
  Film,
  RefreshCw,
  Sliders,
  ShieldAlert,
  Download,
  Share2,
  Layers,
  Smile,
  Zap,
  Check
} from 'lucide-react';
import useStudioStore from '../store/studioStore';
import { MovieReviewTimeline } from './MovieReviewTimeline';

export const MovieReviewWorkstation = () => {
  const { t } = useTranslation();
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const {
    videoUrl,
    videoFilename,
    videoDurationSeconds,
    currentTime,
    setCurrentTime,
    isPlaying,
    setIsPlaying,
    volume,
    setVolume,
    reviewScenes,
    activeSceneId,
    setActiveSceneId,
    updateReviewScene,
    addReviewScene,
    removeReviewScene,
    generateReviewScript,
    rewriteReviewScene,
    reviewAspectRatio,
    setReviewAspectRatio,
    reviewGenre,
    setReviewGenre,
    reviewPace,
    setReviewPace,
    bgmConfig,
    setBgmConfig,
    copyrightBypass,
    setCopyrightBypass,
    watermarkText,
    setWatermarkText,
    selectedVoice,
    setSelectedVoice,
    voices,
    addLog,
  } = useStudioStore();

  const [isMuted, setIsMuted] = useState(false);
  const [activeRewriteMenuId, setActiveRewriteMenuId] = useState(null);

  const currentScene = reviewScenes.find((s) => s.id === activeSceneId) || reviewScenes[0];
  const currentVoiceObj = voices.find((v) => v.id === selectedVoice) || voices[0];

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

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const targetSec = pos * (videoDurationSeconds || 150);
    if (videoRef.current) {
      videoRef.current.currentTime = targetSec;
    }
    setCurrentTime(targetSec);
  };

  // Nghe thử câu kịch bản review bằng SpeechSynthesis
  const handlePlaySceneAudio = (scene) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(scene.script);
      utter.lang = 'vi-VN';
      utter.rate = reviewPace || 1.15;
      window.speechSynthesis.speak(utter);
      addLog(`[Reviewer ${currentVoiceObj.name} - ${reviewPace}x]: ${scene.script}`, 'info');
    }
  };

  const formatTime = (sec) => {
    const s = Math.max(0, sec || 0);
    const m = Math.floor(s / 60);
    const remS = Math.floor(s % 60);
    return `${String(m).padStart(2, '0')}:${String(remS).padStart(2, '0')}`;
  };

  const totalTimeStr = formatTime(videoDurationSeconds || 150);
  const currentTimeStr = formatTime(currentTime);
  const percentPlayed = Math.min(100, Math.max(0, (currentTime / (videoDurationSeconds || 150)) * 100));

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full bg-[#070b14] select-none text-gray-200">
      {/* 1. TOP REVIEW WORKFLOW BAR */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* ======================================================== */}
        {/* CỘT TRÁI: BẢNG PHÂN CẢNH & KỊCH BẢN REVIEW (STORYBOARD) */}
        {/* ======================================================== */}
        <div className="w-[420px] flex-shrink-0 bg-[#090e1a] border-r border-gray-800 flex flex-col justify-between overflow-hidden">
          {/* Header kịch bản */}
          <div className="p-3 border-b border-gray-800 bg-[#0b1220] flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-xs text-amber-300 flex items-center gap-1.5 uppercase tracking-wide">
                <span>🎬 Kịch bản Lời bình Review Phim</span>
              </h2>
              <p className="text-[10px] text-gray-400 mt-0.5">
                {reviewScenes.length} phân đoạn • Ước tính ~2 phút 30 giây
              </p>
            </div>

            {/* Nút 1-Click AI Script Generator */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => generateReviewScript(reviewGenre)}
                className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-gray-950 font-black text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer active:scale-[0.99]"
                title="AI tự động phân tích video và sinh toàn bộ kịch bản Review chuẩn triệu view"
              >
                <Sparkles size={13} strokeWidth={2.5} />
                <span>AI Sinh kịch bản</span>
              </button>

              <button
                onClick={() => addReviewScene({})}
                className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 cursor-pointer"
                title="Thêm phân đoạn mới"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Danh sách phân cảnh cuộn được */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 scrollable-body">
            {reviewScenes.map((scene, idx) => {
              const isSelected = activeSceneId === scene.id;

              return (
                <div
                  key={scene.id}
                  onClick={() => setActiveSceneId(scene.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer space-y-2 relative ${
                    isSelected
                      ? 'bg-[#10192e] border-amber-500/80 shadow-lg shadow-amber-950/20'
                      : 'bg-[#0c1322] border-gray-800/80 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-amber-400 animate-pulse' : 'bg-gray-600'}`} />
                      <span className="font-bold text-gray-200 text-[11px] truncate max-w-[200px]">
                        {scene.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/50">
                        {scene.timecode}
                      </span>
                      {reviewScenes.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeReviewScene(scene.id);
                          }}
                          className="text-gray-500 hover:text-rose-400 p-0.5"
                          title="Xóa phân đoạn"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Textarea kịch bản lời bình */}
                  <textarea
                    rows={3}
                    value={scene.script}
                    onChange={(e) => updateReviewScene(scene.id, { script: e.target.value })}
                    className="w-full bg-[#060a14] border border-gray-700/60 rounded-lg p-2 text-xs text-gray-200 font-sans focus:outline-none focus:border-amber-400 transition-colors resize-none leading-relaxed"
                    placeholder="Nhập lời bình review cho phân đoạn này..."
                  />

                  {/* Actions & Meta */}
                  <div className="flex items-center justify-between text-[10.5px] text-gray-400 pt-0.5">
                    <div className="flex items-center gap-2">
                      <span>{scene.script.split(' ').length} từ</span>
                      <span>•</span>
                      <span className="font-mono text-amber-300">~{scene.estimatedDuration}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Nút Nghe thử */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlaySceneAudio(scene);
                        }}
                        className="px-2 py-1 rounded bg-[#162038] hover:bg-[#1f2d4e] text-cyan-300 font-semibold flex items-center gap-1 border border-cyan-500/30 transition-colors cursor-pointer"
                        title="Nghe thử giọng đọc review câu này"
                      >
                        <Mic size={11} />
                        <span>Nghe thử</span>
                      </button>

                      {/* Nút AI Viết lại */}
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveRewriteMenuId(activeRewriteMenuId === scene.id ? null : scene.id);
                          }}
                          className="px-2 py-1 rounded bg-purple-950/60 hover:bg-purple-900/80 text-purple-300 font-semibold flex items-center gap-1 border border-purple-500/40 transition-colors cursor-pointer"
                        >
                          <Sparkles size={11} />
                          <span>Viết lại</span>
                        </button>

                        {activeRewriteMenuId === scene.id && (
                          <div className="absolute right-0 bottom-full mb-1 w-36 bg-[#121b30] border border-gray-700 rounded-lg shadow-2xl p-1 z-40 space-y-0.5 text-[11px]">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                rewriteReviewScene(scene.id, 'humorous');
                                setActiveRewriteMenuId(null);
                              }}
                              className="w-full text-left px-2 py-1 rounded hover:bg-[#1a2645] text-amber-300 font-medium"
                            >
                              😆 Hài hước / Bựa
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                rewriteReviewScene(scene.id, 'dramatic');
                                setActiveRewriteMenuId(null);
                              }}
                              className="w-full text-left px-2 py-1 rounded hover:bg-[#1a2645] text-rose-300 font-medium"
                            >
                              🔥 Kịch tính / Gay cấn
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                rewriteReviewScene(scene.id, 'concise');
                                setActiveRewriteMenuId(null);
                              }}
                              className="w-full text-left px-2 py-1 rounded hover:bg-[#1a2645] text-cyan-300 font-medium"
                            >
                              ⚡ Ngắn gọn súc tích
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ======================================================== */}
        {/* KHU VỰC GIỮA: TRÌNH PHÁT REVIEW VIDEO & PREVIEW KHUNG HÌNH */}
        {/* ======================================================== */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#060911] p-3 overflow-y-auto scrollable-body">
          {/* Header Preview Bar */}
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span>Xem trước Video Review ({reviewAspectRatio})</span>
              </span>
            </div>

            {/* Toggle Tỷ lệ khung hình: 16:9 ngang (YouTube) vs 9:16 dọc (TikTok) */}
            <div className="flex items-center gap-1 bg-[#101726] p-0.5 rounded-lg border border-gray-800">
              <button
                onClick={() => setReviewAspectRatio('16:9')}
                className={`px-2.5 py-1 text-[11px] rounded font-bold transition-all cursor-pointer ${
                  reviewAspectRatio === '16:9'
                    ? 'bg-amber-500 text-gray-950 shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                16:9 (YouTube)
              </button>
              <button
                onClick={() => setReviewAspectRatio('9:16')}
                className={`px-2.5 py-1 text-[11px] rounded font-bold transition-all cursor-pointer ${
                  reviewAspectRatio === '9:16'
                    ? 'bg-amber-500 text-gray-950 shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                9:16 (TikTok / Reels)
              </button>
            </div>
          </div>

          {/* Video Container Box */}
          <div className="flex-1 flex items-center justify-center p-2">
            <div
              ref={containerRef}
              className={`relative bg-black rounded-xl border border-gray-800 overflow-hidden shadow-2xl flex flex-col justify-between transition-all ${
                reviewAspectRatio === '9:16'
                  ? 'w-[280px] h-[500px] aspect-[9/16]'
                  : 'w-full max-w-2xl aspect-video'
              }`}
            >
              {/* Thẻ Video HTML5 với bộ lọc né bản quyền (Mirror, Zoom) */}
              {videoUrl ? (
                <video
                  ref={videoRef}
                  src={videoUrl}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-300"
                  style={{
                    transform: `${copyrightBypass.mirror ? 'scaleX(-1)' : ''} scale(${copyrightBypass.zoom})`,
                  }}
                  onClick={togglePlay}
                />
              ) : (
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-300 cursor-pointer"
                  style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1200&auto=format&fit=crop')`,
                    transform: `${copyrightBypass.mirror ? 'scaleX(-1)' : ''} scale(${copyrightBypass.zoom})`,
                  }}
                  onClick={togglePlay}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />
                </div>
              )}

              {/* Watermark kênh */}
              {watermarkText && (
                <div className="absolute top-3 right-3 z-20 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm border border-amber-500/40 text-[10px] font-mono text-amber-300 font-bold">
                  {watermarkText}
                </div>
              )}

              {/* Phụ đề kiểu Review Phim (Chữ vàng viền đen dày nổi bật) */}
              {currentScene && (
                <div className="absolute bottom-10 left-0 right-0 z-20 px-4 flex flex-col items-center justify-center text-center pointer-events-none">
                  <div className="inline-block px-4 py-2 rounded-xl bg-black/85 backdrop-blur-md border border-amber-400 shadow-2xl max-w-lg">
                    <p
                      className="font-black text-amber-300 tracking-wide text-sm md:text-base leading-relaxed"
                      style={{
                        textShadow: '0 2px 4px #000, 0 0 10px rgba(0,0,0,0.9)',
                      }}
                    >
                      {currentScene.script}
                    </p>
                  </div>
                </div>
              )}

              {/* Bottom Scrubber */}
              <div className="relative z-20 px-3 py-1.5 bg-gradient-to-t from-black to-transparent flex items-center gap-2 text-xs">
                <button onClick={togglePlay} className="text-white hover:text-amber-400 cursor-pointer">
                  {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                </button>
                <div
                  onClick={handleSeek}
                  className="flex-1 h-1.5 bg-gray-800 hover:h-2 rounded-full overflow-hidden cursor-pointer"
                >
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: `${percentPlayed}%` }} />
                </div>
                <span className="text-[10px] font-mono text-gray-400">
                  {currentTimeStr} / {totalTimeStr}
                </span>
                <button onClick={() => setIsMuted(!isMuted)} className="text-gray-300 hover:text-white">
                  {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* CỘT PHẢI: BẢNG ĐIỀU KHIỂN REVIEWER & NHẠC NỀN BGM */}
        {/* ======================================================== */}
        <div className="w-80 flex-shrink-0 bg-[#090e1a] border-l border-gray-800 p-3 overflow-y-auto scrollable-body select-none text-xs space-y-4">
          {/* 1. THỂ LOẠI & VĂN PHONG REVIEW */}
          <div className="space-y-2">
            <h3 className="font-bold text-gray-200 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>Phong cách Kịch bản Review</span>
            </h3>

            <select
              value={reviewGenre}
              onChange={(e) => setReviewGenre(e.target.value)}
              className="w-full py-1.5 px-2.5 bg-[#12192b] border border-gray-700 rounded-lg text-amber-300 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="Tiên hiệp / Tu chân bá đạo">Tiên hiệp / Tu chân bá đạo</option>
              <option value="Hài hước / Bựa / Tấu hài">Hài hước / Bựa / Tấu hài</option>
              <option value="Kịch tính / Giật gân / Hành động">Kịch tính / Giật gân / Hành động</option>
              <option value="Review Truyện Tranh Manhua">Review Truyện Tranh Manhua / Manga</option>
              <option value="Triết lý / Sâu lắng / Tình cảm">Triết lý / Sâu lắng / Tình cảm</option>
            </select>
          </div>

          <div className="border-t border-gray-800" />

          {/* 2. GIỌNG ĐỌC REVIEWER & TỐC ĐỘ */}
          <div className="space-y-2.5">
            <h3 className="font-bold text-gray-200 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              <span>Giọng Đọc Reviewer AI</span>
            </h3>

            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="w-full py-1.5 px-2.5 bg-[#12192b] border border-gray-700 rounded-lg text-purple-300 font-semibold focus:outline-none cursor-pointer"
            >
              {voices.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.region}) • {v.style}
                </option>
              ))}
            </select>

            {/* Tốc độ đọc review chuẩn */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-gray-400">
                <span>Tốc độ đọc review:</span>
                <span className="font-mono text-purple-400 font-bold">{reviewPace}x</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { val: 1.0, label: '1.0x (Chuẩn)' },
                  { val: 1.15, label: '1.15x (Review Phim)' },
                  { val: 1.25, label: '1.25x (TikTok)' },
                ].map((p) => (
                  <button
                    key={p.val}
                    onClick={() => setReviewPace(p.val)}
                    className={`py-1.5 rounded-md text-[10.5px] font-bold border transition-all cursor-pointer ${
                      reviewPace === p.val
                        ? 'bg-purple-600 text-white border-purple-400 shadow'
                        : 'bg-[#12192b] text-gray-400 border-gray-800 hover:text-gray-200'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800" />

          {/* 3. NHẠC NỀN BGM & AUTO-DUCKING */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-200 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>Nhạc Nền BGM (Auto-Ducking)</span>
              </h3>
              <input
                type="checkbox"
                checked={bgmConfig.enabled}
                onChange={(e) => setBgmConfig({ enabled: e.target.checked })}
                className="rounded bg-gray-800 text-cyan-500 cursor-pointer"
              />
            </div>

            {bgmConfig.enabled && (
              <div className="space-y-2 p-2.5 bg-[#0e1628] rounded-xl border border-gray-800">
                <div className="space-y-1">
                  <label className="text-[10.5px] text-gray-400">Thể loại BGM:</label>
                  <select
                    value={bgmConfig.genre}
                    onChange={(e) => setBgmConfig({ genre: e.target.value })}
                    className="w-full py-1 px-2 bg-[#121b30] border border-gray-700 rounded text-cyan-300 text-[11px] focus:outline-none cursor-pointer"
                  >
                    <option value="Tiên hiệp hoành tráng">Tiên hiệp hoành tráng</option>
                    <option value="Hồi hộp gay cấn (Suspense)">Hồi hộp gay cấn (Suspense)</option>
                    <option value="Hài hước vui nhộn (Funny Meme)">Hài hước vui nhộn (Funny Meme)</option>
                    <option value="Bi tráng hào hùng (Epic Battle)">Bi tráng hào hùng (Epic Battle)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10.5px] text-gray-400">
                    <span>Âm lượng nhạc nền:</span>
                    <span className="font-mono text-cyan-300">{bgmConfig.volume}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="80"
                    value={bgmConfig.volume}
                    onChange={(e) => setBgmConfig({ volume: Number(e.target.value) })}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-gray-800">
                  <input
                    type="checkbox"
                    id="chkDuck"
                    checked={bgmConfig.autoDucking}
                    onChange={(e) => setBgmConfig({ autoDucking: e.target.checked })}
                    className="rounded bg-gray-800 text-cyan-500 cursor-pointer"
                  />
                  <label htmlFor="chkDuck" className="text-[10px] text-gray-300 cursor-pointer">
                    Bật Auto-Ducking (Tự giảm 80% khi nói)
                  </label>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-gray-800" />

          {/* 4. BỘ CÔNG CỤ NÉ BẢN QUYỀN HÌNH ẢNH (COPYRIGHT BYPASS) */}
          <div className="space-y-2">
            <h3 className="font-bold text-gray-200 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Bộ Lọc Né Bản Quyền Video</span>
            </h3>

            <div className="space-y-1.5 p-2 bg-[#0c1322] rounded-xl border border-gray-800">
              <label className="flex items-center justify-between text-[11px] text-gray-300 cursor-pointer">
                <span>Lật gương video 180° (Mirror Flip)</span>
                <input
                  type="checkbox"
                  checked={copyrightBypass.mirror}
                  onChange={(e) => setCopyrightBypass({ mirror: e.target.checked })}
                  className="rounded bg-gray-800 text-emerald-500 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between text-[11px] text-gray-300 cursor-pointer">
                <span>Thu phóng nhẹ 1.05x (Anti-detect Zoom)</span>
                <input
                  type="checkbox"
                  checked={copyrightBypass.zoom === 1.05}
                  onChange={(e) => setCopyrightBypass({ zoom: e.target.checked ? 1.05 : 1.0 })}
                  className="rounded bg-gray-800 text-emerald-500 cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* 5. WATERMARK KÊNH */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-gray-400 font-bold block">Watermark Logo Kênh:</label>
            <input
              type="text"
              value={watermarkText}
              onChange={(e) => setWatermarkText(e.target.value)}
              placeholder="VD: @PeiPei_Review_Phim"
              className="w-full bg-[#12192b] border border-gray-700 rounded-lg p-2 text-xs text-amber-300 font-mono focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>
      </div>

      {/* 2. BOTTOM MULTI-TRACK TIMELINE */}
      <MovieReviewTimeline />
    </div>
  );
};

export default MovieReviewWorkstation;
