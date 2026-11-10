/**
 * Arrow Bloom - In-Game Sub-header: Hearts & Rainbow Progress Bar
 */
import React from 'react';
import { Hearts } from './Hearts.tsx';

interface ProgressBarProps {
  hearts: number;
  remainingCount: number;
  initialCount: number;
  isDarkTheme?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  hearts,
  remainingCount,
  initialCount,
  isDarkTheme = true,
}) => {
  const percentCleared = Math.round(
    ((initialCount - remainingCount) / Math.max(1, initialCount)) * 100
  );

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-1 flex items-center justify-between gap-3 z-20 shrink-0">
      {/* Hearts Cluster */}
      <Hearts hearts={hearts} />

      {/* Progress Bar & Percentage */}
      <div className="flex-1 flex flex-col gap-1">
        <div className="flex items-center justify-between text-[11px] font-black tracking-wide">
          <span className={isDarkTheme ? 'text-white/80' : 'text-slate-600'}>
            Arrows Left: <strong className="text-pink-500 font-extrabold">{remainingCount}</strong>
          </span>
          <span className={isDarkTheme ? 'text-emerald-400 font-black' : 'text-emerald-600 font-black'}>
            {percentCleared}%
          </span>
        </div>
        <div
          className={`w-full h-2 rounded-full p-0.5 overflow-hidden border shadow-inner ${
            isDarkTheme ? 'bg-black/40 border-white/10' : 'bg-slate-200 border-slate-300'
          }`}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-pink-500 via-amber-400 to-emerald-400 transition-all duration-300 shadow-sm"
            style={{ width: `${percentCleared}%` }}
          />
        </div>
      </div>
    </div>
  );
};
