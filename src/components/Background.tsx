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
    1: { gradient: 'from-pink-950 via-slate-950 to-indigo-950', first: '#EC4899', second: '#6366F1' },
    2: { gradient: 'from-cyan-950 via-slate-950 to-blue-950', first: '#22D3EE', second: '#3B82F6' },
    3: { gradient: 'from-emerald-950 via-slate-950 to-teal-950', first: '#34D399', second: '#14B8A6' },
    4: { gradient: 'from-amber-950 via-slate-950 to-purple-950', first: '#F59E0B', second: '#F43F5E' },
    5: { gradient: 'from-purple-950 via-indigo-950 to-slate-950', first: '#D946EF', second: '#7C3AED' },
  };
  const selected = themes[colId] || themes[1];
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <div className={`absolute inset-0 bg-gradient-to-br ${selected.gradient}`}>
        <div className={`absolute top-[10%] left-[8%] w-48 h-48 rounded-full ${animationClass}`} style={{ ...animationStyle, background: `radial-gradient(circle, ${selected.first}26 0%, transparent 70%)` }} />
        <div className={`absolute bottom-[20%] right-[10%] w-64 h-64 rounded-full ${animationClass}`} style={{ ...animationStyle, animationDelay: '-2s', background: `radial-gradient(circle, ${selected.second}26 0%, transparent 70%)` }} />
      </div>
      {colId === 5 && <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />}
      <div className="absolute inset-0 bg-radial from-transparent via-black/20 to-black/60" />
    </div>
  );
};
