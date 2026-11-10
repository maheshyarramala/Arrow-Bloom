/**
 * Arrow Bloom - Dynamic Themed Backgrounds (Light & Dark per Collection)
 */
import React from 'react';
import { CollectionConfig } from '../types.ts';

interface BackgroundProps {
  collection?: CollectionConfig | null;
  theme?: 'dark' | 'light';
}

export const Background: React.FC<BackgroundProps> = ({
  collection,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';
  const colId = collection?.id || 1;

  if (!isDark) {
    // Light Theme: Warm cream background with subtle pastel gradient tints
    return (
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#FDFBF7] transition-colors duration-500">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-50/60 via-amber-50/40 to-cyan-50/60" />
        {/* Subtle warm dot pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#94A3B8_1px,transparent_1px)] [background-size:28px_28px] opacity-25" />
      </div>
    );
  }

  // Dark Theme: Deep neon cosmic gradients per collection
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 transition-colors duration-500">
      {colId === 1 && (
        <div className="absolute inset-0 bg-gradient-to-br from-pink-950 via-slate-950 to-indigo-950">
          <div className="absolute top-[10%] left-[8%] w-48 h-48 rounded-full bg-pink-500/15 blur-3xl animate-pulse" />
          <div className="absolute bottom-[20%] right-[10%] w-64 h-64 rounded-full bg-indigo-500/15 blur-3xl animate-float" />
        </div>
      )}

      {colId === 2 && (
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-950 via-slate-950 to-blue-950">
          <div className="absolute top-[15%] right-[12%] w-52 h-52 rounded-full bg-cyan-400/15 blur-3xl animate-pulse" />
          <div className="absolute bottom-[25%] left-[10%] w-60 h-60 rounded-full bg-blue-500/15 blur-3xl animate-float" />
        </div>
      )}

      {colId === 3 && (
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-slate-950 to-teal-950">
          <div className="absolute top-[8%] left-[15%] w-52 h-52 rounded-full bg-emerald-400/15 blur-3xl animate-pulse" />
          <div className="absolute bottom-[15%] right-[15%] w-64 h-64 rounded-full bg-teal-500/15 blur-3xl animate-float" />
        </div>
      )}

      {colId === 4 && (
        <div className="absolute inset-0 bg-gradient-to-br from-amber-950 via-slate-950 to-purple-950">
          <div className="absolute top-[20%] left-[20%] w-56 h-56 rounded-full bg-amber-500/15 blur-3xl animate-pulse" />
          <div className="absolute bottom-[20%] right-[10%] w-64 h-64 rounded-full bg-rose-500/15 blur-3xl animate-float" />
        </div>
      )}

      {colId === 5 && (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950 via-indigo-950 to-slate-950">
          <div className="absolute top-[10%] right-[10%] w-64 h-64 rounded-full bg-fuchsia-500/15 blur-3xl animate-pulse" />
          <div className="absolute bottom-[10%] left-[10%] w-72 h-72 rounded-full bg-violet-600/15 blur-3xl animate-float" />
          {/* Subtle star field */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />
        </div>
      )}

      {/* Dark Vignette */}
      <div className="absolute inset-0 bg-radial from-transparent via-black/20 to-black/60 pointer-events-none" />
    </div>
  );
};
