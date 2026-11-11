/**
 * Arrow Bloom - Minimal journey-style home menu.
 * Level numbers and individual level tiles live only in the Play browser.
 */
import React from 'react';
import { Play, Compass, HelpCircle, Settings as SettingsIcon, Star, Trophy, Sparkles, ChevronRight } from 'lucide-react';
import { PlayerProgress } from '../types.ts';
import { COLLECTIONS } from '../levelGenerator.ts';

interface HomeProps {
  progress: PlayerProgress;
  isDarkTheme?: boolean;
  onPlayLevel: (lvl: number) => void;
  onOpenLevelList: () => void;
  onOpenHowToPlay: () => void;
  onOpenSettings: () => void;
}

export const Home: React.FC<HomeProps> = ({
  progress, isDarkTheme = true, onPlayLevel, onOpenLevelList,
  onOpenHowToPlay, onOpenSettings,
}) => {
  const currentLvl = Math.min(300, Math.max(1, progress.unlockedLevel));
  const currentCollection = COLLECTIONS[Math.min(COLLECTIONS.length - 1, Math.floor((currentLvl - 1) / 10))];
  const totalStars = Object.values(progress.levelData).reduce((sum, item) => sum + (item.stars || 0), 0);
  const clearedCount = Object.values(progress.levelData).filter(item => item.cleared || item.stars > 0).length;
  const card = isDarkTheme
    ? 'bg-slate-900/75 border-white/10 text-white'
    : 'bg-white/90 border-slate-200 text-slate-800 shadow-sm';
  const secondary = isDarkTheme
    ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white'
    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800';

  return (
    <main className="relative z-10 flex h-full w-full flex-col items-center overflow-y-auto px-5 pt-safe pb-safe">
      <header className="flex w-full max-w-lg items-center justify-between py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-violet-600 text-2xl shadow-lg">🌸</div>
          <div>
            <h1 className="text-xl font-black tracking-tight">Arrow Bloom</h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] opacity-55">Think · Tap · Bloom</p>
          </div>
        </div>
        <button onClick={onOpenSettings} aria-label="Settings" className={`flex h-10 w-10 items-center justify-center rounded-xl border ${secondary}`}>
          <SettingsIcon className="h-5 w-5" />
        </button>
      </header>

      <section className="my-auto flex w-full max-w-lg flex-col gap-5 py-4">
        <div className={`relative overflow-hidden rounded-[2rem] border p-6 shadow-2xl ${card}`}>
          <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full opacity-20 blur-3xl" style={{ background: currentCollection.accentColor }} />
          <div className="relative">
            <div className="mb-4 flex items-center justify-between">
              <span className="rounded-full bg-pink-500/15 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-pink-400">Your journey</span>
              <span className="flex items-center gap-1 text-xs font-black text-amber-400"><Star className="h-4 w-4 fill-current" /> {totalStars}</span>
            </div>
            <h2 className="text-3xl font-black leading-tight">Ready for<br/>another puzzle?</h2>
            <p className="mt-2 text-sm font-medium opacity-65">Pick up where your adventure paused.</p>
            <div className="mt-6 flex items-center gap-3 rounded-2xl bg-black/15 p-3">
              <div className="h-11 w-11 rounded-xl" style={{ background: `linear-gradient(135deg, ${currentCollection.accentColor}, #7C3AED)` }} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-black">{currentCollection.name}</p>
                <p className="text-xs opacity-60">{clearedCount} puzzles completed · 300 in the journey</p>
              </div>
              <Sparkles className="h-5 w-5 text-amber-300" />
            </div>
            <button onClick={() => onPlayLevel(currentLvl)} className="mt-5 flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-pink-500 via-fuchsia-500 to-violet-600 py-4 text-base font-black text-white shadow-lg shadow-pink-950/30 transition-transform active:scale-[0.98]">
              <Play className="h-5 w-5 fill-current" /> Continue Playing <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <button onClick={onOpenLevelList} className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition-all active:scale-[0.98] ${card}`}>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-400/15 text-cyan-400"><Compass className="h-6 w-6" /></div>
          <div className="flex-1">
            <p className="font-black">Explore Worlds</p>
            <p className="text-xs opacity-60">Choose a collection and find your next challenge</p>
          </div>
          <ChevronRight className="h-5 w-5 opacity-50" />
        </button>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={onOpenHowToPlay} className={`flex items-center justify-center gap-2 rounded-2xl border p-4 text-sm font-bold transition-all active:scale-[0.98] ${secondary}`}>
            <HelpCircle className="h-5 w-5 text-amber-400" /> How to Play
          </button>
          <div className={`flex items-center justify-center gap-2 rounded-2xl border p-4 text-sm font-bold ${secondary}`}>
            <Trophy className="h-5 w-5 text-amber-400" /> {clearedCount} Cleared
          </div>
        </div>
      </section>

      <footer className="w-full max-w-lg pb-4 text-center text-[10px] font-bold uppercase tracking-[0.2em] opacity-35">300 puzzles · 30 worlds · endless thinking</footer>
    </main>
  );
};
