import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Terminal, Copy, Trash2, CheckCircle2 } from 'lucide-react';
import useStudioStore from '../store/studioStore';

export const ExecutionLogTerminal = () => {
  const logs = useStudioStore((state) => state.logs);
  const clearLogs = useStudioStore((state) => state.clearLogs);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleCopyLogs = () => {
    const text = logs.map((l) => l.text).join('\n');
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex-shrink-0 bg-[#080c14] border-t border-gray-800 p-2.5 select-none font-mono">
      <div className="flex items-center justify-between mb-1.5 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-emerald-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>NHẬT KÝ THỰC THI (TERMINAL LOG)</span>
          </span>
          <span className="text-[10px] text-gray-500 font-sans">
            ({logs.length} bản ghi)
          </span>
        </div>

        <div className="flex items-center gap-2 text-[10px]">
          <button
            onClick={handleCopyLogs}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-gray-800/80 hover:bg-gray-700 text-gray-300 transition-colors cursor-pointer"
            title="Sao chép toàn bộ log"
          >
            <Copy size={11} />
            <span>Sao chép</span>
          </button>
          <button
            onClick={clearLogs}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-gray-800/80 hover:bg-rose-950 text-gray-400 hover:text-rose-300 transition-colors cursor-pointer"
            title="Xóa sạch nhật ký"
          >
            <Trash2 size={11} />
            <span>Xóa</span>
          </button>
        </div>
      </div>

      {/* Terminal Output Box */}
      <div className="h-24 bg-[#04070d] border border-gray-800/80 rounded-lg p-2.5 overflow-y-auto text-[11px] text-gray-300 space-y-1 scrollable-body leading-relaxed select-text shadow-inner">
        {logs.map((log) => {
          const colorClass =
            log.type === 'success'
              ? 'text-emerald-400 font-bold'
              : log.type === 'warning'
              ? 'text-amber-300'
              : log.type === 'error'
              ? 'text-rose-400 font-bold'
              : 'text-gray-300';

          return (
            <div key={log.id} className={`${colorClass} flex items-start gap-1.5`}>
              <span className="opacity-60 text-[10px]">▶</span>
              <span className="flex-1 break-words">{log.text}</span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default ExecutionLogTerminal;
