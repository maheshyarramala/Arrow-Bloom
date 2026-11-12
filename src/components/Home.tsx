/**
 * Arrow Bloom - Minimalist Home Screen
 * Clean, player-focused interface with Play/Resume, 300 Levels browser,
 * Daily Missions & Streaks, Google Play Games Hub, and VIP Pass.
 */
import React from 'react';
import {
  Play,
  HelpCircle,
  Settings as SettingsIcon,
  Star,
  Trophy,
  Crown,
  Gamepad2,
  Gift,
  Flame,
} from 'lucide-react';
import { PlayerProgress } from '../types.ts';
import { isAdFreePurchased, loadMidLevelState } from '../storage.ts';
import { ensureDailyMissions } from '../dailyMissions.ts';

interface HomeProps {
  progress: PlayerProgress;
  isDarkTheme?: boolean;
  onPlayLevel: (lvl: number) => void;
  onOpenLevelList: () => void;
  onOpenHowToPlay: () => void;
  onOpenSettings: () => void;
  onOpenShop: () => void;
  onOpenGameCenter: () => void;
  onOpenDailyMissions: () => void;
}

export const Home: React.FC<HomeProps> = ({
  progress,
  isDarkTheme = true,
  onPlayLevel,
  onOpenLevelList,
  onOpenHowToPlay,
  onOpenSettings,
  onOpenShop,
  onOpenGameCenter,
  onOpenDailyMissions,
}) => {
  const currentLvl = Math.min(300, Math.max(1, progress.unlockedLevel || 1));
  const totalStars = Object.values(progress.levelData).reduce(
    (sum, level) => sum + (level.stars || 0),
    0
  );
  const isVip = isAdFreePurchased();
  const midState = loadMidLevelState(currentLvl);

  const ensured = ensureDailyMissions(progress);
  const dailyState = ensured.dailyMissions;
  const missions = dailyState?.missions || [];
  const streak = dailyState?.streakDays || 1;
  const completedCount = missions.filter((m) => m.completed).length;
  const claimableCount = missions.filter((m) => m.completed && !m.claimed).length;

  return (
    <main className="relative w-full h-full flex flex-col items-center justify-between pt-safe pb-safe px-4 z-10 overflow-y-auto select-none">
      {/* Top Header Bar */}
      <header className="w-full max-w-md mx-auto flex items-center justify-between py-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-400 flex items-center justify-center text-white text-xl shadow-md border border-pink-300/40">
            🌸
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tight leading-none">
              Arrow Bloom
            </span>
            <span className="text-[10px] text-pink-400 font-bold uppercase tracking-wider">
              {isVip ? '👑 VIP Ad-Free' : '300 Puzzle Mazes'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Daily Missions Trigger Pill */}
          <button
            onClick={onOpenDailyMissions}
            aria-label="Daily Missions"
            title="Daily Missions"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-pink-500/20 text-pink-300 border border-pink-400/30 text-xs font-black active:scale-95 transition-all relative"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-current animate-pulse" />
            <span>{streak}d</span>
            {claimableCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            )}
          </button>

          {/* Stars Pill */}
          <div
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-black border ${
              isDarkTheme
                ? 'bg-black/40 border-white/10 text-amber-300'
                : 'bg-white border-amber-200 text-amber-600 shadow-sm'
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>{totalStars}</span>
          </div>

          {/* Google Play Games Center Button */}
          <button
            onClick={onOpenGameCenter}
            aria-label="Google Play Games Center"
            title="Google Play Games Center"
            className={`w-9 h-9 rounded-xl flex items-center justify-center border active:scale-95 transition-all ${
              isDarkTheme
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30 hover:bg-emerald-500/30'
                : 'bg-emerald-50 text-emerald-700 border-emerald-300'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            aria-label="Open settings"
            className={`w-9 h-9 rounded-xl flex items-center justify-center border active:scale-95 transition-all ${
              isDarkTheme
                ? 'bg-white/10 text-white border-white/15 hover:bg-white/20'
                : 'bg-white text-slate-800 border-slate-200 shadow-sm'
            }`}
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Hero Visual & Main Actions */}
      <section className="w-full max-w-md flex flex-col items-center text-center gap-3.5 my-auto py-2">
        {/* Blooming Icon Container */}
        <div className="relative group">
          <div className="w-26 h-26 rounded-[2.2rem] bg-gradient-to-br from-pink-500 via-rose-500 to-indigo-600 shadow-2xl flex items-center justify-center text-5xl shadow-pink-500/30 border-2 border-white/20 transform hover:scale-105 transition-transform duration-300">
            🌸
          </div>
          {isVip && (
            <div className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase shadow-lg border border-yellow-200 flex items-center gap-1">
              <Crown className="w-3 h-3 fill-current" />
              <span>VIP</span>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-[11px] font-black uppercase tracking-[0.25em] text-pink-400">
            Relaxing Logic Puzzle
          </p>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">
            Arrow Bloom
          </h1>
          <p
            className={`text-xs font-medium max-w-xs mx-auto ${
              isDarkTheme ? 'text-white/65' : 'text-slate-500'
            }`}
          >
            Inspect the straight rays, untangle interlocking arrows, and reveal blooming silhouettes.
          </p>
        </div>

        {/* Primary Play / Resume Button */}
        <button
          type="button"
          onClick={() => onPlayLevel(currentLvl)}
          aria-label="Continue playing"
          className="w-full rounded-3xl p-4 bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 text-slate-950 font-black shadow-xl active:scale-[0.98] transition-transform shadow-pink-500/25 border border-pink-200"
        >
          <span className="flex items-center justify-center gap-2.5 text-lg font-black text-white drop-shadow">
            <Play className="w-5 h-5 fill-current" />
            {midState ? `Resume Level ${currentLvl}` : `Play Level ${currentLvl}`}
          </span>
          <span className="block mt-0.5 text-[11px] font-extrabold text-white/90">
            {midState
              ? `⚡ In-progress (${midState.activeArrows.length} arrows left)`
              : 'Start your journey'}
          </span>
        </button>

        {/* Daily Missions Interactive Card */}
        <button
          onClick={onOpenDailyMissions}
          className="w-full p-3 rounded-2xl bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-amber-500/20 border border-pink-400/35 flex items-center justify-between text-left active:scale-[0.98] transition-all shadow-md"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-pink-500/30 border border-pink-400/40 flex items-center justify-center text-lg shrink-0">
              <Gift className="w-4 h-4 text-pink-300" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-white">Daily Missions</span>
                {claimableCount > 0 ? (
                  <span className="text-[10px] font-black uppercase px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 animate-bounce">
                    Claim {claimableCount}!
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-amber-300">
                    +{dailyState?.bonusHintsBank || 0} Hints Banked
                  </span>
                )}
              </div>
              <span className="text-[10px] text-white/70 block truncate">
                Win extra hints &amp; 2x score multipliers
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 pl-2">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-white/10 text-white/90">
              {completedCount}/{missions.length}
            </span>
          </div>
        </button>

        {/* Browse Levels Button */}
        <button
          onClick={onOpenLevelList}
          className={`w-full py-2.5 px-4 rounded-2xl border flex items-center justify-center gap-2 font-bold text-xs active:scale-95 transition-all ${
            isDarkTheme
              ? 'bg-white/10 text-white border-white/15 hover:bg-white/20'
              : 'bg-white text-slate-800 border-slate-200 shadow-sm'
          }`}
        >
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>Browse All 300 Levels</span>
        </button>

        {/* Ad-Free VIP Pass Promo Card (if not purchased) */}
        {!isVip ? (
          <div
            onClick={onOpenShop}
            className="w-full p-2.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-pink-500/15 to-purple-500/20 border border-amber-400/40 flex items-center justify-between cursor-pointer active:scale-95 transition-all"
          >
            <div className="flex items-center gap-2 text-left">
              <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0">
                <Crown className="w-4 h-4 fill-current" />
              </div>
              <div>
                <span className="text-xs font-black text-amber-300 block leading-tight">
                  Remove All Ads Forever
                </span>
                <span className="text-[10px] text-white/70">
                  Instant hints &amp; free continues for ₹99 ($1.19)
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-xl bg-amber-400 text-slate-950 font-black text-xs shrink-0 shadow">
              ₹99
            </span>
          </div>
        ) : (
          <div className="w-full p-2 rounded-xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center gap-1.5 text-emerald-300 text-xs font-bold">
            <Crown className="w-3.5 h-3.5 fill-current text-amber-400" />
            <span>Lifetime Ad-Free VIP Active</span>
          </div>
        )}
      </section>

      {/* Bottom Clean Footer: Rules & Mechanics link */}
      <footer className="w-full max-w-md mx-auto py-3 border-t border-white/10 shrink-0 flex items-center justify-center">
        <button
          onClick={onOpenHowToPlay}
          className={`py-2 px-4 rounded-xl border flex items-center justify-center gap-1.5 font-bold text-xs active:scale-95 transition-all ${
            isDarkTheme
              ? 'bg-white/5 text-white/80 border-white/10 hover:bg-white/10'
              : 'bg-white text-slate-700 border-slate-200'
          }`}
        >
          <HelpCircle className="w-4 h-4 text-amber-400" />
          <span>Game Rules &amp; How to Play</span>
        </button>
      </footer>
    </main>
  );
};
