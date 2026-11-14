/**
 * Arrow Bloom - Bottom Banner Ad Component
 * Displays a lightweight mobile banner ad at the bottom of the screen.
 * Automatically hidden if the player owns Lifetime Ad-Free.
 */
import React from 'react';
import { Crown, Sparkles } from 'lucide-react';

interface BannerAdProps {
  isAdFree: boolean;
  isDarkTheme?: boolean;
  onOpenShop: () => void;
}

export const BannerAd: React.FC<BannerAdProps> = ({
  isAdFree,
  isDarkTheme = true,
  onOpenShop,
}) => {
  if (isAdFree) return null;

  return (
    <div
      className={`w-full max-w-md mx-auto px-2 py-1.5 z-20 flex items-center justify-between gap-2 border-t text-xs select-none ${
        isDarkTheme
          ? 'bg-slate-950/90 border-white/10 text-white'
          : 'bg-white/95 border-slate-200 text-slate-800 shadow-sm'
      }`}
    >
      {/* Left: Ad tag & sponsor info */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 shrink-0">
          Ad
        </span>
        <div className="flex flex-col min-w-0 leading-tight">
          <span className="font-extrabold truncate text-[11px] flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-pink-400 shrink-0" />
            <span>Puzzle Master Arena</span>
          </span>
          <span
            className={`text-[9px] truncate ${
              isDarkTheme ? 'text-white/50' : 'text-slate-500'
            }`}
          >
            Play 500+ brain challenges free!
          </span>
        </div>
      </div>

      {/* Right: ₹499 Ad-Free CTA */}
      <button
        onClick={onOpenShop}
        className="shrink-0 px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 active:scale-95 text-slate-950 font-black text-[10px] shadow-sm flex items-center gap-1 transition-transform"
        title="Remove all ads forever for ₹499"
      >
        <Crown className="w-3 h-3 text-slate-950 fill-current" />
        <span>No Ads ₹499</span>
      </button>
    </div>
  );
};
