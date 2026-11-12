/**
 * Arrow Bloom - In-Game Bottom Bar
 * Controls: Undo, Hint (with Ad badge when 0 hints left or VIP unlimited), Zoom +, Zoom -, Fit
 */
import React from 'react';
import { Undo2, Lightbulb, ZoomIn, ZoomOut, Maximize2, Video, Crown } from 'lucide-react';

interface BottomBarProps {
  canUndo: boolean;
  hintsLeft: number;
  zoomLevel: number;
  isDarkTheme?: boolean;
  isAdFree?: boolean;
  onUndo: () => void;
  onHint: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomFit: () => void;
}

export const BottomBar: React.FC<BottomBarProps> = React.memo(({
  canUndo,
  hintsLeft,
  zoomLevel,
  isDarkTheme = true,
  isAdFree = false,
  onUndo,
  onHint,
  onZoomIn,
  onZoomOut,
  onZoomFit,
}) => {
  return (
    <footer className="w-full max-w-lg mx-auto flex items-center justify-between gap-2 px-3 pb-safe pt-1 z-20 shrink-0 select-none">
      {/* Undo Button */}
      <button
        onClick={onUndo}
        disabled={!canUndo}
        title="Undo last move (Z)"
        aria-label="Undo move"
        className={`flex-1 py-2.5 px-2 rounded-2xl flex items-center justify-center gap-1.5 font-bold text-xs md:text-sm border transition-all active:scale-95 shadow-sm ${
          canUndo
            ? isDarkTheme
              ? 'bg-white/15 hover:bg-white/25 text-white border-white/20'
              : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200'
            : isDarkTheme
            ? 'bg-white/5 text-white/30 border-white/5 cursor-not-allowed'
            : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
        }`}
      >
        <Undo2 className="w-4 h-4" />
        <span>Undo</span>
      </button>

      {/* Hint Button: Active either with remaining hints OR via Rewarded Ad / VIP */}
      <button
        onClick={onHint}
        title={
          isAdFree
            ? 'VIP Free Instant Hint (H)'
            : hintsLeft > 0
            ? `Use Hint (${hintsLeft} left)`
            : 'Watch 5s Ad for Free Hint'
        }
        aria-label="Use hint"
        className={`flex-1 py-2.5 px-2 rounded-2xl flex items-center justify-center gap-1.5 font-black text-xs md:text-sm transition-all active:scale-95 shadow-md border ${
          isAdFree
            ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 border-yellow-200'
            : hintsLeft > 0
            ? 'bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 border-yellow-200'
            : 'bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 border-cyan-200 animate-pulse'
        }`}
      >
        {isAdFree ? (
          <>
            <Crown className="w-4 h-4 fill-current text-slate-950" />
            <span>Hint</span>
            <span className="text-[10px] uppercase font-black px-1.5 py-0.2 rounded bg-black/20">
              VIP
            </span>
          </>
        ) : hintsLeft > 0 ? (
          <>
            <Lightbulb className="w-4 h-4 fill-current" />
            <span>Hint</span>
            <span className="px-1.5 py-0.2 rounded-full bg-black/25 text-xs font-black">
              {hintsLeft}
            </span>
          </>
        ) : (
          <>
            <Video className="w-4 h-4" />
            <span>+Hint</span>
            <span className="px-1.5 py-0.2 rounded bg-slate-950/20 text-[10px] font-black uppercase">
              Ad
            </span>
          </>
        )}
      </button>

      {/* Zoom Controls Cluster: Zoom -, Zoom +, Fit */}
      <div className="flex items-center gap-1">
        <button
          onClick={onZoomOut}
          disabled={zoomLevel <= 1}
          title="Zoom Out"
          aria-label="Zoom out"
          className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all active:scale-95 ${
            isDarkTheme
              ? 'bg-white/10 hover:bg-white/20 text-white border-white/15'
              : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200'
          }`}
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <button
          onClick={onZoomIn}
          disabled={zoomLevel >= 4}
          title="Zoom In"
          aria-label="Zoom in"
          className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all active:scale-95 ${
            isDarkTheme
              ? 'bg-white/10 hover:bg-white/20 text-white border-white/15'
              : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200'
          }`}
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <button
          onClick={onZoomFit}
          title="Fit board to screen"
          aria-label="Fit screen"
          className={`px-2.5 h-9 rounded-xl flex items-center justify-center gap-1 text-xs font-bold border transition-all active:scale-95 ${
            isDarkTheme
              ? 'bg-white/10 hover:bg-white/20 text-cyan-300 border-white/15'
              : 'bg-white hover:bg-slate-100 text-cyan-600 border-slate-200'
          }`}
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span>Fit</span>
        </button>
      </div>
    </footer>
  );
});
