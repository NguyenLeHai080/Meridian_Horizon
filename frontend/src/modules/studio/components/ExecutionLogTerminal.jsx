import React from 'react';
import { useTranslation } from 'react-i18next';
import { Terminal, CheckCircle2, Circle } from 'lucide-react';
import useStudioStore from '../store/studioStore';

export const ExecutionLogTerminal = () => {
  const logs = useStudioStore((state) => state.logs);

  return (
    <div className="flex-shrink-0 bg-[#080c14] border-t border-gray-800 p-2.5 select-none font-mono">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
          HOÀN THÀNH <span className="text-[13px]">✓</span> Nhật ký
        </span>
      </div>

      {/* Terminal Output Box */}
      <div className="h-20 bg-[#05070d] border border-gray-900 rounded p-2 overflow-y-auto text-[11px] text-gray-300 space-y-0.5 scrollable-body leading-relaxed">
        <div className="text-gray-300">xong nap lai bang Nguon='File SRT co san' de render lai, khong ton credit dich.</div>
        <div className="text-gray-400">• Don 0.07 GB file tam cua lan chay nay (giu lai log/phu de de chan doan).</div>
        <div className="text-emerald-400 font-bold">HOÀN THÀNH!</div>
        <div className="text-gray-300 flex items-center gap-1">
          <span className="text-emerald-400 font-bold">▶ Video:</span>
          <span>C:\Users\tung\Desktop\dich phim trung\神性游戏_第23集_bilisub.mp4</span>
        </div>
      </div>
    </div>
  );
};

export default ExecutionLogTerminal;
