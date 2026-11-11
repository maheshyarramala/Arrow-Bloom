/**
 * Arrow Bloom - Minimal Home Screen
 * Keep level browsing out of Home; offer a direct Continue action.
 */
import React from 'react';
import { Play, HelpCircle, Settings as SettingsIcon, Star } from 'lucide-react';
import { PlayerProgress } from '../types.ts';

interface HomeProps {
  progress: PlayerProgress;
  isDarkTheme?: boolean;
  onPlayLevel: (lvl: number) => void;
  onOpenLevelList: () => void;
  onOpenHowToPlay: () => void;
  onOpenSettings: () => void;
}

export const Home: React.FC<HomeProps> = ({
  progress, isDarkTheme = true, onPlayLevel, onOpenHowToPlay, onOpenSettings,
}) => {
  const currentLvl = Math.min(300, Math.max(1, progress.unlockedLevel || 1));
  const totalStars = Object.values(progress.levelData).reduce((sum, level) => sum + (level.stars || 0), 0);

  return (
    <main className="relative w-full h-full flex flex-col items-center justify-center pt-safe pb-safe px-5 z-10 overflow-hidden">
      <header className="absolute top-0 w-full max-w-lg mx-auto flex items-center justify-between py-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-pink-500 flex items-center justify-center text-white shadow-md">🌸</div>
          <span className="text-xl font-black tracking-tight">Arrow Bloom</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-black border ${isDarkTheme ? 'bg-black/40 border-white/10 text-amber-300' : 'bg-white border-amber-200 text-amber-600'}`}>
            <Star className="w-3.5 h-3.5 fill-current" /><span>{totalStars}</span>
          </div>
          <button onClick={onOpenSettings} aria-label="Open settings" className={`w-9 h-9 rounded-xl flex items-center justify-center border active:scale-95 ${isDarkTheme ? 'bg-white/10 text-white border-white/15' : 'bg-white text-slate-800 border-slate-200'}`}>
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>
      </header>

      <section className="w-full max-w-md flex flex-col items-center text-center gap-5">
        <div className="w-28 h-28 rounded-[2rem] bg-gradient-to-br from-pink-500 via-fuchsia-500 to-indigo-500 shadow-2xl flex items-center justify-center text-6xl">🌸</div>
        <div className="space-y-2">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-pink-400">A little brain workout</p>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">Arrow Bloom</h1>
          <p className={`text-sm font-medium ${isDarkTheme ? 'text-white/65' : 'text-slate-500'}`}>Follow the arrows, clear the board, and bloom your way forward.</p>
        </div>
        <button type="button" onClick={() => onPlayLevel(currentLvl)} aria-label="Continue playing" className="w-full rounded-3xl p-5 bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 text-white shadow-xl active:scale-[0.98] transition-transform">
          <span className="flex items-center justify-center gap-3 text-xl font-black"><Play className="w-6 h-6 fill-current" />Play Now</span>
          <span className="block mt-1 text-xs font-bold text-white/85">Continue your journey</span>
        </button>
        <button onClick={onOpenHowToPlay} className={`w-full py-3 px-4 rounded-2xl border flex items-center justify-center gap-2 font-bold text-sm active:scale-95 ${isDarkTheme ? 'bg-white/10 text-white border-white/15' : 'bg-white text-slate-800 border-slate-200'}`}>
          <HelpCircle className="w-4 h-4 text-amber-400" />How to Play
        </button>
      </section>
    </main>
  );
};
