/**
 * Arrow Bloom - Compact Single-Row Game Top Bar
 * back button | shape name & collection | score | theme toggle | settings
 */
import React from 'react';
import { ChevronLeft, Sun, Moon, Settings as SettingsIcon } from 'lucide-react';

interface TopBarProps {
  levelNumber: number;
  shapeName: string;
  collectionName: string;
  score: number;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  onBack: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  levelNumber,
  shapeName,
  collectionName,
  score,
  theme,
  onToggleTheme,
  onOpenSettings,
  onBack,
}) => {
  const isDark = theme === 'dark';

  return (
    <header className="w-full flex items-center justify-between px-3 pt-safe pb-1 z-20 shrink-0 gap-2">
      {/* Left: Back Button */}
      <button
        onClick={onBack}
        aria-label="Back to levels"
        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95 border ${
          isDark
            ? 'bg-white/10 hover:bg-white/20 text-white border-white/15'
            : 'bg-black/5 hover:bg-black/10 text-slate-800 border-black/10'
        }`}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Center: Title & Collection (Truncated, clamped single-line) */}
      <div className="flex-1 min-w-0 flex flex-col items-center justify-center text-center px-1">
        <div className="flex items-center gap-1.5 max-w-full">
          <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded-md bg-pink-500/20 text-pink-500 border border-pink-500/30">
            L{levelNumber}
          </span>
          <h1 className="text-sm sm:text-base font-black truncate tracking-wide whitespace-nowrap overflow-hidden">
            {shapeName}
          </h1>
        </div>
        <span
          className={`text-[10px] font-semibold truncate tracking-wider uppercase ${
            isDark ? 'text-white/60' : 'text-slate-500'
          }`}
        >
          {collectionName}
        </span>
      </div>

      {/* Right: Live Score & Action Toggles */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Live Score Counter */}
        <div
          className={`px-2.5 py-1 rounded-xl text-xs font-black tabular-nums border ${
            isDark
              ? 'bg-slate-900/80 text-amber-300 border-amber-400/30'
              : 'bg-white text-amber-600 border-amber-300 shadow-sm'
          }`}
        >
          {score.toLocaleString()} pts
        </div>

        {/* Theme Toggle (Moon / Sun) */}
        <button
          onClick={onToggleTheme}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          title={isDark ? 'Light Theme' : 'Dark Theme'}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95 border ${
            isDark
              ? 'bg-white/10 hover:bg-white/20 text-yellow-300 border-white/15'
              : 'bg-black/5 hover:bg-black/10 text-amber-600 border-black/10'
          }`}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          aria-label="Open settings"
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95 border ${
            isDark
              ? 'bg-white/10 hover:bg-white/20 text-white/80 border-white/15'
              : 'bg-black/5 hover:bg-black/10 text-slate-700 border-black/10'
          }`}
        >
          <SettingsIcon className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
