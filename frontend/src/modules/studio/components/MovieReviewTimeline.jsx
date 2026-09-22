import React from 'react';
import { Film, Mic, Music, MessageSquare, Play, Pause, ChevronRight } from 'lucide-react';
import useStudioStore from '../store/studioStore';

export const MovieReviewTimeline = () => {
  const {
    reviewScenes,
    activeSceneId,
    setActiveSceneId,
    currentTime,
    setCurrentTime,
    videoDurationSeconds,
    selectedVoice,
    voices,
    bgmConfig,
  } = useStudioStore();

  const totalDuration = videoDurationSeconds || 150;
  const currentPercent = Math.min(100, Math.max(0, (currentTime / totalDuration) * 100));

  const currentVoiceObj = voices.find((v) => v.id === selectedVoice) || voices[0];

  const handleSceneClick = (scene) => {
    setActiveSceneId(scene.id);
    setCurrentTime(scene.startSec);
  };

  return (
    <div className="bg-[#080c16] border-t border-gray-800 p-2.5 select-none font-sans text-xs">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-amber-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>TIMELINE PHÂN CẢNH &amp; KỊCH BẢN REVIEW (MULTI-TRACK STORYBOARD)</span>
          </span>
          <span className="text-[10.5px] text-gray-400 bg-gray-900 px-2 py-0.5 rounded border border-gray-800">
            {reviewScenes.length} Phân đoạn
          </span>
        </div>
        <div className="text-[11px] text-gray-400 font-mono">
          Nhấp vào từng phân đoạn để đồng bộ video &amp; lời bình
        </div>
      </div>

      {/* Multi-Track Container */}
      <div className="relative bg-[#05080f] rounded-xl border border-gray-800/80 p-2 space-y-1.5 overflow-x-auto shadow-inner">
        {/* Needle Scrubber indicator */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-30 pointer-events-none transition-all shadow-[0_0_8px_#f43f5e]"
          style={{ left: `${Math.max(2, Math.min(98, currentPercent))}%` }}
        >
          <div className="w-2 h-2 rounded-full bg-rose-500 -ml-[3px] -mt-0.5 shadow" />
        </div>

        {/* TRACK 1: VIDEO SCENES */}
        <div className="flex items-center gap-2">
          <div className="w-28 flex-shrink-0 flex items-center gap-1.5 text-gray-400 text-[10.5px] font-semibold">
            <Film size={12} className="text-cyan-400" />
            <span>Video Scenes</span>
          </div>
          <div className="flex-1 flex gap-1.5 h-7">
            {reviewScenes.map((scene) => {
              const isSelected = activeSceneId === scene.id;
              return (
                <div
                  key={scene.id}
                  onClick={() => handleSceneClick(scene)}
                  className={`flex-1 rounded-lg px-2 flex items-center justify-between text-[10.5px] cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-gradient-to-r from-cyan-950 to-blue-950 border-cyan-400 text-cyan-200 font-bold shadow-md shadow-cyan-950/40'
                      : 'bg-[#101728] hover:bg-[#162038] border-gray-800 text-gray-300'
                  }`}
                >
                  <span className="truncate">{scene.title.split(':')[0]}</span>
                  <span className="font-mono text-[9px] text-gray-500 ml-1">{scene.timecode}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* TRACK 2: NARRATOR VOICEOVER */}
        <div className="flex items-center gap-2">
          <div className="w-28 flex-shrink-0 flex items-center gap-1.5 text-gray-400 text-[10.5px] font-semibold">
            <Mic size={12} className="text-purple-400" />
            <span>Voiceover</span>
          </div>
          <div className="flex-1 flex gap-1.5 h-6">
            {reviewScenes.map((scene) => {
              const isSelected = activeSceneId === scene.id;
              return (
                <div
                  key={scene.id}
                  onClick={() => handleSceneClick(scene)}
                  className={`flex-1 rounded-md px-2 flex items-center justify-between text-[10px] cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-purple-950/80 border-purple-400 text-purple-200 font-semibold'
                      : 'bg-[#131024] hover:bg-[#1b1733] border-purple-950/60 text-purple-300/80'
                  }`}
                >
                  <span className="truncate">🎙️ {currentVoiceObj.name} ({scene.estimatedDuration})</span>
                  <span className="text-[9px] text-purple-400/80 font-mono">1.15x</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* TRACK 3: BGM MUSIC (AUTO-DUCKING) */}
        <div className="flex items-center gap-2">
          <div className="w-28 flex-shrink-0 flex items-center gap-1.5 text-gray-400 text-[10.5px] font-semibold">
            <Music size={12} className="text-amber-400" />
            <span>Nhạc BGM</span>
          </div>
          <div className="flex-1 flex gap-1.5 h-6">
            <div className="w-full bg-gradient-to-r from-amber-950/40 via-amber-900/30 to-amber-950/40 border border-amber-500/30 rounded-md px-3 flex items-center justify-between text-[10px] text-amber-300">
              <span className="font-semibold">🎵 {bgmConfig.genre} • Âm lượng: {bgmConfig.volume}%</span>
              <span className="text-[9px] text-amber-400 font-mono bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                AUTO-DUCKING ON (-80% khi nói)
              </span>
            </div>
          </div>
        </div>

        {/* TRACK 4: SUBTITLES */}
        <div className="flex items-center gap-2">
          <div className="w-28 flex-shrink-0 flex items-center gap-1.5 text-gray-400 text-[10.5px] font-semibold">
            <MessageSquare size={12} className="text-emerald-400" />
            <span>Phụ đề Review</span>
          </div>
          <div className="flex-1 flex gap-1.5 h-6">
            {reviewScenes.map((scene) => (
              <div
                key={scene.id}
                onClick={() => handleSceneClick(scene)}
                className="flex-1 rounded-md px-2 flex items-center text-[10px] bg-[#0c1815] border border-emerald-950/80 text-emerald-300 truncate cursor-pointer hover:border-emerald-500/40"
              >
                <span className="truncate">💬 {scene.script.slice(0, 30)}...</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieReviewTimeline;
