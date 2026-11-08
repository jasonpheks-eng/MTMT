import React from 'react';
import { RefreshCw } from 'lucide-react';

export const TabLoader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-4 min-h-[300px]">
      <div className="w-10 h-10 rounded-2xl bg-[#C45266]/20 text-[#C45266] border border-rose-400/30 flex items-center justify-center animate-pulse">
        <RefreshCw className="w-5 h-5 animate-spin" />
      </div>
      <p className="text-xs text-white/60 font-mono animate-pulse">Loading panel section...</p>
    </div>
  );
};
