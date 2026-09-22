import React from 'react';
import { useTranslation } from 'react-i18next';
import { Terminal, CheckCircle2, Circle } from 'lucide-react';
import useStudioStore from '../store/studioStore';

export const ExecutionLogTerminal = () => {
  const { t } = useTranslation();
  const logs = useStudioStore((state) => state.logs);

  return (
    <div className="flex-shrink-0 bg-[#080c14] border-t border-gray-800 p-3 select-none">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/80">
            <CheckCircle2 size={12} />
            <span>{t('studio.completed')}</span>
          </span>
          <span className="text-xs font-semibold text-gray-400 flex items-center gap-1">
            <Terminal size={12} />
            <span>{t('studio.logTitle')}</span>
          </span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>{t('studio.engineReady')}</span>
        </div>
      </div>

      {/* Terminal Output Window */}
      <div className="h-24 bg-[#05070d] border border-gray-900 rounded-lg p-2.5 overflow-y-auto font-mono text-[11px] text-gray-300 space-y-1 scrollable-body shadow-inner">
        {logs.map((log) => {
          const colorClass =
            log.type === 'success'
              ? 'text-emerald-400'
              : log.type === 'warning'
              ? 'text-amber-400'
              : 'text-gray-400';

          return (
            <div key={log.id} className="flex items-start gap-2 leading-relaxed">
              <span className="text-gray-600 select-none">❯</span>
              <span className={colorClass}>{log.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExecutionLogTerminal;
