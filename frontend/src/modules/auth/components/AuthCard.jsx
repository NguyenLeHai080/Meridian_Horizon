import React from 'react';
import { Sparkles } from 'lucide-react';

export const AuthCard = ({ title, subtitle, children }) => {
  return (
    <div className="relative w-full max-w-md bg-[#0f172a]/95 backdrop-blur-xl border border-gray-800 rounded-2xl shadow-2xl p-8 space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-purple-600 to-cyan-400 text-white shadow-lg shadow-purple-900/40">
          <Sparkles size={28} />
        </div>
        <h1 className="text-2xl font-bold text-gray-100 tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
};

export default AuthCard;
