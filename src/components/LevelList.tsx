/**
 * Arrow Bloom - 4-Column Rounded Squares Level List Grouped by Collection
 */
import React from 'react';
import { COLLECTIONS } from '../levelGenerator.ts';
import { PlayerProgress } from '../types.ts';
import { SHAPE_DEFINITIONS, getShapeThumbnailPath } from '../shapes.ts';
import { ChevronLeft, Lock, Check, Star } from 'lucide-react';

interface LevelListProps {
  progress: PlayerProgress;
  isDarkTheme?: boolean;
  onSelectLevel: (lvl: number) => void;
  onBack: () => void;
}

export const LevelList: React.FC<LevelListProps> = ({
  progress,
  isDarkTheme = true,
  onSelectLevel,
  onBack,
}) => {
  return (
    <div className="relative w-full h-full flex flex-col pt-safe pb-safe px-4 z-10 overflow-hidden">
      {/* Top Header */}
      <header className="flex items-center justify-between py-2 shrink-0">
        <button
          onClick={onBack}
          aria-label="Back to home"
          className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all active:scale-95 border ${
            isDarkTheme
              ? 'bg-white/10 hover:bg-white/20 text-white border-white/15'
              : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200'
          }`}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <h1 className="text-xl md:text-2xl font-black tracking-wide">Puzzle Library</h1>

        {/* Total Stars Counter */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border text-amber-400 font-black text-xs md:text-sm shadow-inner ${
            isDarkTheme
              ? 'bg-black/40 border-white/15'
              : 'bg-white border-amber-200 shadow-sm'
          }`}
        >
          <Star className="w-4 h-4 fill-amber-400 text-amber-300" />
          <span>
            {Object.values(progress.levelData).reduce((sum, l) => sum + (l.stars || 0), 0)}
          </span>
        </div>
      </header>

      {/* Grouped Collections List */}
      <div className="flex-1 overflow-y-auto py-2 space-y-6 max-w-lg mx-auto w-full pr-1">
        {COLLECTIONS.map((col) => {
          const firstLvl = col.levels[0];
          const isColUnlocked = progress.unlockedLevel >= firstLvl;

          return (
            <div key={col.id} className="space-y-2.5">
              {/* Collection Header */}
              <div className="flex items-baseline justify-between px-1">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: col.accentColor }}
                  />
                  <h2 className="text-base font-black tracking-wide">
                    {col.id}. {col.name}
                  </h2>
                </div>
                <span className="text-[11px] font-semibold opacity-60">
                  {col.subtitle}
                </span>
              </div>

              {/* 4-Column Grid of Rounded Squares */}
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
                {col.levels.map((lvlNum) => {
                  const isUnlocked = progress.unlockedLevel >= lvlNum;
                  const isCurrent = progress.unlockedLevel === lvlNum;
                  const info = progress.levelData[lvlNum];
                  const isCleared = !!info?.cleared || (info?.stars || 0) > 0;
                  const stars = info?.stars || 0;
                  const shapeDef = SHAPE_DEFINITIONS[lvlNum];

                  return (
                    <button
                      key={lvlNum}
                      disabled={!isUnlocked}
                      onClick={() => onSelectLevel(lvlNum)}
                      className={`relative aspect-square rounded-2xl p-1.5 flex flex-col items-center justify-between border-2 transition-all active:scale-95 ${
                        isCurrent
                          ? 'bg-gradient-to-br from-amber-400 to-yellow-500 border-white text-slate-950 scale-105 shadow-[0_6px_20px_rgba(251,191,36,0.6)] animate-pulse'
                          : isCleared
                          ? isDarkTheme
                            ? 'bg-white/15 hover:bg-white/25 border-emerald-400/40 text-white'
                            : 'bg-white hover:bg-emerald-50 border-emerald-400 text-slate-800 shadow-sm'
                          : isUnlocked
                          ? isDarkTheme
                            ? 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
                            : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-800'
                          : isDarkTheme
                          ? 'bg-black/20 border-white/5 text-white/30 cursor-not-allowed'
                          : 'bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed'
                      }`}
                    >
                      {/* Top row: Number and Check or Lock */}
                      <div className="w-full flex items-center justify-between px-1">
                        <span className="text-xs font-black">{lvlNum}</span>
                        {isCleared ? (
                          <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        ) : !isUnlocked ? (
                          <Lock className="w-3 h-3 opacity-40" />
                        ) : null}
                      </div>

                      {/* Mini Silhouette Outline Icon */}
                      {shapeDef && (
                        <svg viewBox="0 0 100 100" className="w-7 h-7 my-auto opacity-70">
                          <path
                            d={getShapeThumbnailPath(shapeDef, 100)}
                            fill="currentColor"
                            opacity={isUnlocked ? 0.8 : 0.2}
                          />
                        </svg>
                      )}

                      {/* Bottom row: Stars */}
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3].map((s) => (
                          <Star
                            key={s}
                            className={`w-2.5 h-2.5 ${
                              s <= stars
                                ? 'fill-amber-400 text-amber-400'
                                : 'opacity-20 fill-current'
                            }`}
                          />
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
