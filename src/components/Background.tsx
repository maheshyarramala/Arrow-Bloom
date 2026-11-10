import React from 'react';
import { CollectionConfig } from '../types.ts';

interface BackgroundProps {
  collection?: CollectionConfig | null;
  theme?: 'dark' | 'light';
  performanceMode?: boolean;
  paused?: boolean;
}

export const Background: React.FC<BackgroundProps> = ({ collection, theme = 'dark', performanceMode = false, paused = false }) => {
  const isDark = theme === 'dark';
  const colId = collection?.id || 1;
  const animationClass = performanceMode || paused ? '' : 'animate-float';
  const animationStyle: React.CSSProperties = { animationPlayState: performanceMode || paused ? 'paused' : 'running', willChange: 'transform' };
  if (!isDark) {
    return (
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#FDFBF7]">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-50/60 via-amber-50/40 to-cyan-50/60" />
        <div className="absolute inset-0 bg-[radial-gradient(#94A3B8_1px,transparent_1px)] [background-size:28px_28px] opacity-25" />
      </div>
    );
  }
  const themes: Record<number, { gradient: string; first: string; second: string }> = {
    1: { gradient: 'from-pink-950 via-slate-950 to-indigo-950', first: 'bg-pink-500/15', second: 'bg-indigo-500/15' },
    2: { gradient: 'from-cyan-950 via-slate-950 to-blue-950', first: 'bg-cyan-400/15', second: 'bg-blue-500/15' },
    3: { gradient: 'from-emerald-950 via-slate-950 to-teal-950', first: 'bg-emerald-400/15', second: 'bg-teal-500/15' },
    4: { gradient: 'from-amber-950 via-slate-950 to-purple-950', first: 'bg-amber-500/15', second: 'bg-rose-500/15' },
    5: { gradient: 'from-purple-950 via-indigo-950 to-slate-950', first: 'bg-fuchsia-500/15', second: 'bg-violet-600/15' },
  };
  const selected = themes[colId] || themes[1];
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <div className={`absolute inset-0 bg-gradient-to-br ${selected.gradient}`}>
        <div className={`absolute top-[10%] left-[8%] w-48 h-48 rounded-full ${selected.first} ${animationClass}`} style={animationStyle} />
        <div className={`absolute bottom-[20%] right-[10%] w-64 h-64 rounded-full ${selected.second} ${animationClass}`} style={{ ...animationStyle, animationDelay: '-2s' }} />
      </div>
      {colId === 5 && <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />}
      <div className="absolute inset-0 bg-radial from-transparent via-black/20 to-black/60" />
    </div>
  );
};
