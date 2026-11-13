/**
 * Arrow Bloom - Compact Single-Row Game Top Bar
 * back button | shape name & collection | score & active multiplier | VIP/Shop | theme toggle | settings
 */
import React, { useEffect, useRef } from 'react';
import { ChevronLeft, Sun, Moon, Settings as SettingsIcon, Crown, Zap } from 'lucide-react';

interface TopBarProps {
  levelNumber: number;
  shapeName: string;
  collectionName: string;
  score: number;
  theme: 'dark' | 'light';
  isAdFree?: boolean;
  scoreMultiplier?: number;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  onOpenShop?: () => void;
  onBack: () => void;
  onToggleDebug?: () => void;
}

export const TopBar: React.FC<TopBarProps> = React.memo(({
  shapeName,
  collectionName,
  score,
  theme,
  isAdFree = false,
  scoreMultiplier = 1,
  onToggleTheme,
  onOpenSettings,
  onOpenShop,
  onBack,
  onToggleDebug,
}) => {
  const longPressTimer = useRef<number | null>(null);
  const cancelLongPress = () => {
    if (longPressTimer.current !== null) window.clearTimeout(longPressTimer.current);
    longPressTimer.current = null;
  };
  const isDark = theme === 'dark';
  const scoreTextRef = useRef<HTMLSpanElement>(null);
  const displayedScoreRef = useRef(score);

  useEffect(() => {
    const from = displayedScoreRef.current;
    const delta = score - from;
    const started = performance.now();
    let frame = 0;
    const animate = (now: number) => {
      const progress = Math.min(1, (now - started) / 220);
      const value = Math.round(from + delta * progress);
      if (scoreTextRef.current) scoreTextRef.current.textContent = value.toLocaleString();
      if (progress < 1) frame = requestAnimationFrame(animate);
      else displayedScoreRef.current = score;
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  return (
    <header className="w-full flex items-center justify-between px-3 pt-safe pb-1 z-20 shrink-0 gap-2 select-none">
      {/* Left: Back Button */}
      <button
        onClick={onBack}
        aria-label="Back to game home"
        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95 border ${
          isDark
            ? 'bg-white/10 hover:bg-white/20 text-white border-white/15'
            : 'bg-black/5 hover:bg-black/10 text-slate-800 border-black/10'
        }`}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Center: Title & Collection */}
      <div className="flex-1 min-w-0 flex flex-col items-center justify-center text-center px-1">
        <div className="flex items-center gap-1.5 max-w-full">
<h1
            onPointerDown={() => {
              if (onToggleDebug) longPressTimer.current = window.setTimeout(onToggleDebug, 650);
            }}
            onPointerUp={cancelLongPress}
            onPointerLeave={cancelLongPress}
            onPointerCancel={cancelLongPress}
            className="text-sm sm:text-base font-black truncate tracking-wide whitespace-nowrap overflow-hidden"
          >
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
        {/* Active Multiplier Pill */}
        {scoreMultiplier > 1 && (
          <div
            title={`${scoreMultiplier}x Score Multiplier Active!`}
            className="px-2 py-1 rounded-xl bg-cyan-400/25 border border-cyan-400/50 text-cyan-300 font-black text-xs flex items-center gap-0.5 animate-pulse"
          >
            <Zap className="w-3 h-3 fill-current" />
            <span>{scoreMultiplier}x</span>
          </div>
        )}

        {/* Live Score Counter */}
        <div
          className={`px-2.5 py-1 rounded-xl text-xs font-black tabular-nums border ${
            isDark
              ? 'bg-slate-900/80 text-amber-300 border-amber-400/30'
              : 'bg-white text-amber-600 border-amber-300 shadow-sm'
          }`}
        >
          <span ref={scoreTextRef}>{score.toLocaleString()}</span> pts
        </div>

        {/* VIP / Shop Button */}
        {onOpenShop && (
          <button
            onClick={onOpenShop}
            aria-label="Shop and VIP"
            title={isAdFree ? 'VIP Ad-Free Active' : 'Remove Ads for ₹99'}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95 border ${
              isAdFree
                ? 'bg-amber-400/20 text-amber-400 border-amber-400/40'
                : 'bg-white/10 text-amber-300 border-white/15 hover:bg-white/20'
            }`}
          >
            <Crown className={`w-4 h-4 ${isAdFree ? 'fill-current' : ''}`} />
          </button>
        )}

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
});
