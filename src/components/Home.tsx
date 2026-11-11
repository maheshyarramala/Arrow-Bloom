/**
 * Arrow Bloom - Home Screen Component
 * Continue card + picture-book collections with numbered levels kept inside the level browser.
 */
import React from 'react';
import { Play, Grid, HelpCircle, Settings as SettingsIcon, Star, Lock } from 'lucide-react';
import { PlayerProgress } from '../types.ts';
import { COLLECTIONS } from '../levelGenerator.ts';
import { SHAPE_DEFINITIONS, getShapeThumbnailPath } from '../shapes.ts';

interface HomeProps {
  progress: PlayerProgress;
  isDarkTheme?: boolean;
  onPlayLevel: (lvl: number) => void;
  onOpenLevelList: () => void;
  onOpenHowToPlay: () => void;
  onOpenSettings: () => void;
}

export const Home: React.FC<HomeProps> = ({
  progress,
  isDarkTheme = true,
  onPlayLevel,
  onOpenLevelList,
  onOpenHowToPlay,
  onOpenSettings,
}) => {
  const currentLvl = Math.min(300, progress.unlockedLevel);
  const currentShape = SHAPE_DEFINITIONS[currentLvl] || SHAPE_DEFINITIONS[((currentLvl - 1) % 150) + 1] || SHAPE_DEFINITIONS[1];

  let totalStars = 0;
  let clearedCount = 0;
  Object.values(progress.levelData).forEach((l) => {
    totalStars += l.stars || 0;
    if (l.cleared || (l.stars || 0) > 0) clearedCount++;
  });

  return (
    <div className="relative w-full h-full flex flex-col pt-safe pb-safe px-4 z-10 overflow-y-auto">
      <header className="w-full max-w-lg mx-auto flex items-center justify-between py-2 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-pink-500 flex items-center justify-center text-white shadow-md">🌸</div>
          <span className="text-xl font-black tracking-tight">Arrow Bloom</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-black border ${isDarkTheme ? 'bg-black/40 border-white/10 text-amber-300' : 'bg-white border-amber-200 text-amber-600'}`}>
            <Star className="w-3.5 h-3.5 fill-current" /><span>{totalStars}</span>
          </div>
          <button onClick={onOpenSettings} aria-label="Open settings" className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-all active:scale-95 ${isDarkTheme ? 'bg-white/10 hover:bg-white/20 text-white border-white/15' : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200'}`}>
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="w-full max-w-lg mx-auto flex flex-col gap-4 py-2 flex-1">
        <button
          type="button"
          onClick={() => onPlayLevel(currentLvl)}
          aria-label="Continue your journey"
          className={`relative text-left rounded-3xl p-5 border-2 transition-all cursor-pointer active:scale-[0.98] shadow-xl overflow-hidden group w-full ${isDarkTheme ? 'bg-gradient-to-br from-pink-600/40 via-purple-700/30 to-indigo-900/50 border-pink-400/40 hover:border-pink-300' : 'bg-gradient-to-br from-pink-100 via-rose-50 to-indigo-100 border-pink-300 hover:border-pink-400'}`}
        >
          <div className="absolute right-2 -bottom-2 w-32 h-32 opacity-25 group-hover:opacity-40 transition-opacity pointer-events-none">
            <svg viewBox="0 0 100 100" className="w-full h-full fill-pink-500"><path d={getShapeThumbnailPath(currentShape, 100)} /></svg>
          </div>
          <div className="relative z-10 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-pink-500 text-white text-[11px] font-black uppercase tracking-wider">Continue Playing</span>
              <span className="text-xs font-bold opacity-75">{clearedCount} of 300 Solved</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight">Continue your journey</h2>
            <p className="text-xs font-semibold opacity-85">Next challenge: <strong className="text-pink-400">{currentShape.name}</strong></p>
            <div className="mt-3 flex items-center justify-between">
              <span className="inline-flex items-center gap-2 py-2.5 px-5 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 text-white font-black text-sm shadow-lg group-hover:scale-105 transition-transform">
                <Play className="w-4 h-4 fill-current ml-0.5" />Play Now
              </span>
              <span className="text-xs font-bold text-amber-300 drop-shadow-sm">300 challenges await</span>
            </div>
          </div>
        </button>

        <div className="flex items-center gap-3">
          <button onClick={onOpenLevelList} className={`flex-1 py-3 px-4 rounded-2xl border flex items-center justify-center gap-2 font-black text-sm transition-all active:scale-95 shadow-md ${isDarkTheme ? 'bg-white/10 hover:bg-white/20 text-white border-white/20' : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200'}`}>
            <Grid className="w-4 h-4 text-cyan-400" /><span>Explore Worlds</span>
          </button>
          <button onClick={onOpenHowToPlay} className={`flex-1 py-3 px-4 rounded-2xl border flex items-center justify-center gap-2 font-black text-sm transition-all active:scale-95 shadow-md ${isDarkTheme ? 'bg-white/10 hover:bg-white/20 text-white border-white/20' : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200'}`}>
            <HelpCircle className="w-4 h-4 text-amber-400" /><span>How to Play</span>
          </button>
        </div>

        <section className="flex flex-col gap-3 pt-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-lg font-black tracking-wide">Collections</h3>
            <span className="text-xs font-bold opacity-60">30 Themed Worlds</span>
          </div>
          <div className="flex flex-col gap-4">
            {COLLECTIONS.map((col) => {
              const firstLvl = col.levels[0];
              const isColUnlocked = progress.unlockedLevel >= firstLvl;
              const colStars = col.levels.reduce((sum, lvl) => sum + (progress.levelData[lvl]?.stars || 0), 0);
              return (
                <div key={col.id} className={`rounded-2xl p-4 border transition-all ${isDarkTheme ? 'bg-slate-900/60 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: col.accentColor }} />
                      <h4 className="font-black text-base">{col.id}. {col.name}</h4>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold">
                      <span className="text-amber-400 flex items-center gap-1"><Star className="w-3 h-3 fill-current" />{colStars}/30</span>
                      {!isColUnlocked && <Lock className="w-3.5 h-3.5 opacity-50" />}
                    </div>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {col.levels.map((lvl) => {
                      const isUnlocked = progress.unlockedLevel >= lvl;
                      const shapeKey = ((lvl - 1) % 150) + 1;
                      const shape = SHAPE_DEFINITIONS[lvl] || SHAPE_DEFINITIONS[shapeKey];
                      const stars = progress.levelData[lvl]?.stars || 0;
                      return (
                        <button key={lvl} disabled={!isUnlocked} onClick={() => onPlayLevel(lvl)} aria-label={`Play ${shape?.name || 'challenge'}`} className={`flex flex-col items-center gap-1 p-1.5 rounded-xl border transition-all active:scale-95 ${isUnlocked ? isDarkTheme ? 'bg-white/5 hover:bg-white/15 border-white/10 text-white' : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800' : isDarkTheme ? 'bg-black/20 border-white/5 text-white/20 cursor-not-allowed' : 'bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed'}`}>
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center p-1 bg-black/15">
                            {shape ? <svg viewBox="0 0 100 100" className="w-full h-full"><path d={getShapeThumbnailPath(shape, 100)} fill={isUnlocked ? col.accentColor : '#64748B'} opacity={isUnlocked ? 0.9 : 0.25} /></svg> : null}
                          </div>
                          <span className="text-[10px] font-black truncate max-w-full">{shape?.name || 'Mystery shape'}</span>
                          <div className="flex items-center gap-0.5">{[1, 2, 3].map((star) => <div key={star} className={`w-1.5 h-1.5 rounded-full ${star <= stars ? 'bg-amber-400' : 'bg-white/20'}`} />)}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};
