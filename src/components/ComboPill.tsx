/**
 * Arrow Bloom - Non-Stacking Combo Pill Component
 * Replaces text in-place instead of stacking and auto-hides after 700ms.
 */
import React from 'react';
import { Flame } from 'lucide-react';

interface ComboPillProps {
  comboCount: number;
  visible: boolean;
}

export const ComboPill: React.FC<ComboPillProps> = ({ comboCount, visible }) => {
  if (!visible || comboCount <= 1) return null;

  return (
    <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 pointer-events-none transition-all duration-150 animate-bounce">
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black text-xs md:text-sm shadow-lg border border-yellow-200">
        <Flame className="w-3.5 h-3.5 fill-current text-red-600 animate-pulse" />
        <span className="tracking-wide uppercase">Combo x{comboCount}!</span>
      </div>
    </div>
  );
};
