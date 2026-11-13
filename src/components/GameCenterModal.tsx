/**
 * Arrow Bloom - Google Play Games / Game Center Hub
 * Tracks player GamerTag, Level, XP, 7 achievements, leaderboards, and cloud save sync.
 */
import React, { useState } from 'react';
import {
  X,
  Trophy,
  Award,
  Crown,
  CloudCheck,
  RefreshCw,
  Sparkles,
  User,
  CheckCircle2,
} from 'lucide-react';
import {
  loadGamerProfile,
  saveGamerProfile,
  ACHIEVEMENTS_DEF,
  isAdFreePurchased,
} from '../storage.ts';
import { PlayerProgress } from '../types.ts';
import { soundManager } from '../audio.ts';

interface GameCenterModalProps {
  isOpen: boolean;
  progress: PlayerProgress;
  onClose: () => void;
  onOpenShop: () => void;
}

export const GameCenterModal: React.FC<GameCenterModalProps> = ({
  isOpen,
  progress,
  onClose,
  onOpenShop,
}) => {
  const [tab, setTab] = useState<'achievements' | 'leaderboard'>('achievements');
  const [profile, setProfile] = useState(loadGamerProfile());
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncAlert, setSyncAlert] = useState<string | null>(null);

  if (!isOpen) return null;

  const isVip = isAdFreePurchased();
  const clearedCount = Object.values(progress.levelData).filter((l) => l.cleared).length;
  const totalStars = Object.values(progress.levelData).reduce((s, l) => s + (l.stars || 0), 0);
  const totalScore = progress.totalScore || 0;

  // Compute live achievement states
  const computedAchievements = ACHIEVEMENTS_DEF.map((ach) => {
    let current = 0;
    if (ach.id === 'first_bloom') current = clearedCount >= 1 ? 1 : 0;
    else if (ach.id === 'shapes_collector') current = clearedCount >= 10 ? 10 : clearedCount;
    else if (ach.id === 'century_solver') current = clearedCount >= 100 ? 100 : clearedCount;
    else if (ach.id === 'grand_master') current = clearedCount;
    else if (ach.id === 'perfectionist') current = Math.min(1, progress.stats?.perfectLevels || 0);
    else if (ach.id === 'combo_maestro') current = Math.min(5, progress.stats?.bestCombo || 0);
    else if (ach.id === 'arrow_collector') current = Math.min(1000, progress.stats?.arrowsCleared || 0);
    else if (ach.id === 'daily_bloom') current = Math.min(7, progress.stats?.dailyChallengesCompleted || 0);
    else if (ach.id === 'ad_free_vip') current = isVip ? 1 : 0;

    const progressPct = Math.min(100, Math.round((current / ach.target) * 100));
    const unlocked = progressPct >= 100;
    return { ...ach, current, progress: progressPct, unlocked };
  });

  const unlockedCount = computedAchievements.filter((a) => a.unlocked).length;
  const totalXpEarned = computedAchievements
    .filter((a) => a.unlocked)
    .reduce((sum, a) => sum + a.xpReward, 500);
  const calculatedLevel = Math.max(1, Math.floor(totalXpEarned / 1000) + 1);

  const handleCloudSync = () => {
    setIsSyncing(true);
    soundManager.playClick();
    setTimeout(() => {
      const updated = {
        ...profile,
        xp: totalXpEarned,
        level: calculatedLevel,
        lastSyncedAt: Date.now(),
      };
      saveGamerProfile(updated);
      setProfile(updated);
      setIsSyncing(false);
      setSyncAlert('Cloud save synced with Google Play Games!');
      soundManager.playWin();
      setTimeout(() => setSyncAlert(null), 3000);
    }, 600);
  };

  // Mock global leaderboard
  const mockLeaderboard = [
    { rank: 1, name: 'DragonMaster_X', score: 382400, levels: 300, isVip: true },
    { rank: 2, name: 'BloomQueen_9', score: 341200, levels: 284, isVip: true },
    { rank: 3, name: 'ZenPuzzler_7', score: 298500, levels: 250, isVip: false },
    { rank: 4, name: profile.gamerTag + ' (You)', score: totalScore, levels: clearedCount, isVip, isCurrent: true },
    { rank: 5, name: 'NeonRider_21', score: Math.max(12000, totalScore - 4200), levels: Math.max(1, clearedCount - 2), isVip: false },
    { rank: 6, name: 'ArrowSniper', score: Math.max(8500, totalScore - 9600), levels: Math.max(1, clearedCount - 5), isVip: false },
  ].sort((a, b) => b.score - a.score).map((entry, idx) => ({ ...entry, rank: idx + 1 }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-sm rounded-3xl bg-slate-900 border-2 border-emerald-500/40 p-5 shadow-2xl text-white flex flex-col gap-4 max-h-[90vh] overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close Game Center"
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-white/70 hover:text-white transition-all z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Profile Header */}
        <div className="flex items-center gap-3 pt-1">
          <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-lg border border-emerald-300">
            <User className="w-6 h-6" />
            {isVip && (
              <div
                onClick={onOpenShop}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow cursor-pointer"
                title="VIP Patron"
              >
                <Crown className="w-3 h-3 fill-current" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-sm truncate">{profile.gamerTag}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Connected" />
            </div>
            <div className="flex items-center gap-2 text-xs text-white/70 mt-0.5">
              <span className="px-1.5 py-0.2 rounded bg-white/10 font-bold text-[10px] text-amber-300">
                LVL {calculatedLevel}
              </span>
              <span>{totalXpEarned.toLocaleString()} XP</span>
            </div>
          </div>

          <button
            onClick={handleCloudSync}
            disabled={isSyncing}
            title="Sync with Google Play Games cloud"
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-emerald-400 border border-white/10"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Sync alert banner */}
        {syncAlert && (
          <div className="py-1 px-3 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[11px] font-bold text-center flex items-center justify-center gap-1.5">
            <CloudCheck className="w-3.5 h-3.5" />
            <span>{syncAlert}</span>
          </div>
        )}

        {/* Real player statistics */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Levels cleared', value: clearedCount.toLocaleString(), color: 'text-emerald-300' },
            { label: 'Total stars', value: totalStars.toLocaleString(), color: 'text-amber-300' },
            { label: 'Arrows cleared', value: (progress.stats?.arrowsCleared || 0).toLocaleString(), color: 'text-cyan-300' },
            { label: 'Best combo', value: `${progress.stats?.bestCombo || 0}×`, color: 'text-pink-300' },
            { label: 'Perfect levels', value: (progress.stats?.perfectLevels || 0).toLocaleString(), color: 'text-purple-300' },
            { label: 'Daily puzzles', value: (progress.stats?.dailyChallengesCompleted || 0).toLocaleString(), color: 'text-orange-300' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl bg-white/5 border border-white/10 p-2.5">
              <span className={`block text-lg font-black ${stat.color}`}>{stat.value}</span>
              <span className="text-[10px] text-white/55">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-2xl bg-slate-950/80 p-1 border border-white/10">
          <button
            onClick={() => {
              soundManager.playClick();
              setTab('achievements');
            }}
            className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              tab === 'achievements'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Achievements ({unlockedCount}/{ACHIEVEMENTS_DEF.length})</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              setTab('leaderboard');
            }}
            className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              tab === 'leaderboard'
                ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-md'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Leaderboard</span>
          </button>
        </div>

        {/* Tab 1: Achievements */}
        {tab === 'achievements' && (
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {computedAchievements.map((ach) => (
              <div
                key={ach.id}
                className={`p-3 rounded-2xl border transition-all flex items-center gap-3 ${
                  ach.unlocked
                    ? 'bg-emerald-950/30 border-emerald-500/40'
                    : 'bg-white/5 border-white/10 opacity-70'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl shrink-0">
                  {ach.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-xs text-white truncate">
                      {ach.title}
                    </h4>
                    <span className="text-[10px] font-black text-amber-300 shrink-0">
                      +{ach.xpReward} XP
                    </span>
                  </div>
                  <p className="text-[10px] text-white/60 truncate">{ach.description}</p>

                  <div className="mt-1.5 w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        ach.unlocked ? 'bg-emerald-400' : 'bg-cyan-400'
                      }`}
                      style={{ width: `${ach.progress}%` }}
                    />
                  </div>
                </div>

                {ach.unlocked && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Leaderboard */}
        {tab === 'leaderboard' && (
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {mockLeaderboard.map((player) => (
              <div
                key={player.name}
                className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs ${
                  player.isCurrent
                    ? 'bg-amber-500/20 border-amber-400/50 shadow'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`w-6 h-6 rounded-lg font-black text-xs flex items-center justify-center shrink-0 ${
                      player.rank === 1
                        ? 'bg-amber-400 text-slate-950'
                        : player.rank === 2
                        ? 'bg-slate-300 text-slate-950'
                        : player.rank === 3
                        ? 'bg-amber-700 text-white'
                        : 'bg-white/10 text-white/70'
                    }`}
                  >
                    {player.rank}
                  </span>
                  <div className="truncate">
                    <div className="flex items-center gap-1 font-bold truncate">
                      <span className="truncate">{player.name}</span>
                      {player.isVip && (
                        <Crown className="w-3 h-3 text-amber-400 fill-current shrink-0" />
                      )}
                    </div>
                    <span className="text-[10px] text-white/50 block">
                      {player.levels} Levels Cleared
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-black text-amber-300 tabular-nums">
                    {player.score.toLocaleString()}
                  </span>
                  <span className="block text-[9px] text-white/40 uppercase">PTS</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-white/50">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-400" /> Google Play Games Connected
          </span>
          {!isVip && (
            <button
              onClick={() => {
                onClose();
                onOpenShop();
              }}
              className="text-amber-400 hover:text-amber-300 font-bold underline"
            >
              Get VIP Pass ₹99
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
