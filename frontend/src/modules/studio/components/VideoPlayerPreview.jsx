import React from 'react';
import { useTranslation } from 'react-i18next';
import { Edit3, Image, Play, Volume2, Maximize2 } from 'lucide-react';
import useStudioStore from '../store/studioStore';

export const VideoPlayerPreview = ({ onOpenSubtitleModal }) => {
  const { t } = useTranslation();
  const { currentSubtitle, progress } = useStudioStore();

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#0a0e17] p-4 overflow-y-auto scrollable-body">
      <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
        <span className="font-semibold text-gray-300">Xem trước</span>
        <span className="font-mono text-[11px] text-gray-500">00:00:02.400 / 00:00:30.000</span>
      </div>

      {/* 1. Main Video Frame Screen */}
      <div className="relative w-full aspect-video bg-black rounded-xl border border-gray-800 overflow-hidden shadow-2xl flex flex-col justify-between group">
        {/* Background Visual Rendering (Cyberpunk Anime Fantasy Art matching user image) */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105 opacity-80"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1200&auto=format&fit=crop')`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
        </div>

        {/* Top Video Overlay Badge */}
        <div className="relative z-10 p-3 flex justify-between items-center">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-900/80 text-purple-200 border border-purple-500/40">
            1080P FHD • 60 FPS
          </span>
          <button className="p-1 rounded bg-black/50 text-gray-300 hover:text-white transition-colors">
            <Maximize2 size={14} />
          </button>
        </div>

        {/* Subtitle Display Overlay (Box viền xanh lá chuẩn xác như trong ảnh mẫu) */}
        <div className="relative z-10 pb-6 px-4 flex flex-col items-center justify-center text-center">
          <div className="inline-block px-4 py-2 rounded-lg bg-black/80 backdrop-blur-md border border-emerald-500/70 shadow-lg max-w-lg">
            {/* Original Chinese Subtitle */}
            <p className="text-sm md:text-base font-semibold text-emerald-400 tracking-wide font-sans">
              {currentSubtitle.original}
            </p>
            {/* Vietnamese Translated Subtitle */}
            <p className="text-xs md:text-sm text-gray-200 mt-1 font-medium">
              {currentSubtitle.translated}
            </p>
          </div>
        </div>

        {/* Bottom Playback Scrubber */}
        <div className="relative z-10 px-4 py-2 bg-gradient-to-t from-black to-transparent flex items-center gap-3">
          <button className="text-gray-300 hover:text-white">
            <Play size={16} fill="currentColor" />
          </button>
          <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden cursor-pointer">
            <div className="h-full bg-purple-500 rounded-full" style={{ width: '35%' }} />
          </div>
          <button className="text-gray-300 hover:text-white">
            <Volume2 size={16} />
          </button>
        </div>
      </div>

      {/* 2. Controls Under Video */}
      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-center text-xs text-gray-400 gap-1 cursor-pointer hover:text-gray-200">
          <Image size={13} />
          <span>Lấy frame xem trước</span>
        </div>

        {/* Nút to mở Editor chuẩn ảnh mẫu */}
        <button
          onClick={onOpenSubtitleModal}
          className="w-full py-2.5 px-4 rounded-lg bg-[#141d30] hover:bg-[#1a253d] text-gray-200 hover:text-white font-semibold text-xs border border-purple-500/40 flex items-center justify-center gap-2 transition-all shadow-md"
        >
          <Edit3 size={14} className="text-purple-400" />
          <span>Mở Editor (sửa phụ đề song ngữ + chỉnh timecode)</span>
        </button>

        {/* Thanh Progress Bar 100% */}
        <div className="w-full bg-[#111827] rounded-full h-3.5 p-0.5 border border-gray-800 overflow-hidden relative">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-500 flex items-center justify-center"
            style={{ width: `${progress}%` }}
          >
            <span className="text-[9px] font-bold text-black select-none tracking-tight">
              {progress}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayerPreview;
