/**
 * Arrow Bloom - Daily Missions & Retention Modal
 * Displays daily objectives, streak counter, midnight countdown,
 * and allows claiming extra hints & 2x score multipliers.
 */
import React, { useState, useEffect } from 'react';
import {
  X,
  Flame,
  Clock,
  Sparkles,
  CheckCircle2,
  Gift,
  Zap,
  Lightbulb,
  Award,
} from 'lucide-react';
import { DailyMission, PlayerProgress } from '../types.ts';
import { claimMissionReward, ensureDailyMissions } from '../dailyMissions.ts';
import { saveProgress } from '../storage.ts';
import { soundManager } from '../audio.ts';
import { fireLevelWinConfetti } from './Confetti.tsx';

interface DailyMissionsModalProps {
  isOpen: boolean;
  progress: PlayerProgress;
  onUpdateProgress: (newProgress: PlayerProgress) => void;
  onClose: () => void;
}

export const DailyMissionsModal: React.FC<DailyMissionsModalProps> = ({
  isOpen,
  progress,
  onUpdateProgress,
  onClose,
}) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [claimToast, setClaimToast] = useState<string | null>(null);

  // Live countdown to midnight local time
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diffMs = midnight.getTime() - now.getTime();
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
      setTimeLeft(`${hours}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`);
    };

    updateCountdown();
    const interval = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(interval);
  }, []);

  if (!isOpen) return null;

  const ensured = ensureDailyMissions(progress);
  const missionsState = ensured.dailyMissions;
  const missions = missionsState?.missions || [];
  const streak = missionsState?.streakDays || 1;
  const bankedHints = missionsState?.bonusHintsBank || 0;
  const activeMultiplier = missionsState?.activeScoreMultiplier || 1;
  const hasActiveBoost = activeMultiplier > 1;

  const handleClaim = (mission: DailyMission) => {
    soundManager.playPop(3);
    const { updatedProgress, claimedMission } = claimMissionReward(progress, mission.id);
    if (claimedMission) {
      saveProgress(updatedProgress);
      onUpdateProgress(updatedProgress);
      fireLevelWinConfetti();
      soundManager.playWin();

      const label =
        claimedMission.rewardType === 'extra_hints'
          ? `🎉 Claimed ${claimedMission.rewardLabel}! Added to your Hint Bank.`
          : `⚡ Claimed ${claimedMission.rewardLabel}! Active for your next level!`;
      setClaimToast(label);
      setTimeout(() => setClaimToast(null), 3500);
    }
  };

  const handleClaimAll = () => {
    const claimable = missions.filter((m) => m.completed && !m.claimed);
    if (claimable.length === 0) return;

    let current = progress;
    claimable.forEach((m) => {
      const { updatedProgress } = claimMissionReward(current, m.id);
      current = updatedProgress;
    });

    saveProgress(current);
    onUpdateProgress(current);
    fireLevelWinConfetti();
    soundManager.playWin();
    setClaimToast(`🎉 Claimed all ${claimable.length} mission rewards!`);
    setTimeout(() => setClaimToast(null), 3500);
  };

  const completedCount = missions.filter((m) => m.completed).length;
  const claimableCount = missions.filter((m) => m.completed && !m.claimed).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-sm rounded-3xl bg-slate-900 border-2 border-pink-400/40 p-5 shadow-2xl text-white flex flex-col gap-3.5 max-h-[90vh] overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close daily missions"
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-white/70 hover:text-white transition-all z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="pt-1">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-pink-500 to-rose-400 text-white text-xs font-black uppercase tracking-wider shadow-md">
              <Gift className="w-3.5 h-3.5 fill-current" />
              <span>Daily Missions</span>
            </div>

            {/* Streak Badge */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-black">
              <Flame className="w-3.5 h-3.5 fill-current text-amber-400 animate-pulse" />
              <span>{streak} Day Streak!</span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-2">
            <h2 className="text-xl font-black">Today&apos;s Challenges</h2>
            <div className="flex items-center gap-1 text-[11px] text-white/60 font-semibold">
              <Clock className="w-3 h-3 text-cyan-400" />
              <span>Resets in {timeLeft}</span>
            </div>
          </div>
        </div>

        {/* Toast alert */}
        {claimToast && (
          <div className="p-2.5 rounded-2xl bg-emerald-500/25 border border-emerald-400/50 text-emerald-200 text-xs font-black text-center animate-fade-in">
            {claimToast}
          </div>
        )}

        {/* Active Perks Summary Banner */}
        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center">
              <Lightbulb className="w-4 h-4 fill-current" />
            </div>
            <div>
              <span className="text-[10px] text-white/60 uppercase block leading-tight">
                Bonus Hint Bank
              </span>
              <span className="font-black text-amber-300 text-sm">
                +{bankedHints} Hints Stored
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                hasActiveBoost
                  ? 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/40 animate-pulse'
                  : 'bg-white/10 text-white/40'
              }`}
            >
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <div>
              <span className="text-[10px] text-white/60 uppercase block leading-tight">
                Score Multiplier
              </span>
              <span
                className={`font-black text-sm ${
                  hasActiveBoost ? 'text-cyan-300' : 'text-white/40'
                }`}
              >
                {hasActiveBoost ? '⚡ 2x Boost Active' : 'Normal 1x'}
              </span>
            </div>
          </div>
        </div>

        {/* Missions List */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2.5">
          {missions.map((mission) => {
            const pct = Math.min(100, Math.round((mission.current / mission.target) * 100));
            const isClaimable = mission.completed && !mission.claimed;

            return (
              <div
                key={mission.id}
                className={`p-3 rounded-2xl border transition-all flex flex-col gap-2 ${
                  isClaimable
                    ? 'bg-gradient-to-r from-amber-500/20 via-pink-500/15 to-purple-500/20 border-amber-400/50 shadow-md ring-1 ring-amber-400/30'
                    : mission.claimed
                    ? 'bg-white/5 border-white/10 opacity-70'
                    : 'bg-slate-950/60 border-white/10'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-2xl shrink-0">{mission.icon}</span>
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-xs text-white truncate">
                        {mission.title}
                      </h4>
                      <p className="text-[11px] text-white/70 truncate">
                        {mission.description}
                      </p>
                    </div>
                  </div>

                  {/* Reward Badge */}
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${
                      mission.rewardType === 'score_multiplier'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                        : 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                    }`}
                  >
                    {mission.rewardLabel}
                  </span>
                </div>

                {/* Progress bar & Action row */}
                <div className="flex items-center justify-between gap-3 pt-1">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-[10px] text-white/60 mb-1">
                      <span>Progress</span>
                      <span className="font-bold text-white tabular-nums">
                        {mission.current} / {mission.target}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          mission.completed
                            ? 'bg-gradient-to-r from-emerald-400 to-teal-400'
                            : 'bg-gradient-to-r from-pink-500 to-rose-400'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  {/* Button */}
                  <div className="shrink-0">
                    {isClaimable ? (
                      <button
                        onClick={() => handleClaim(mission)}
                        className="py-1.5 px-3 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 active:scale-95 text-slate-950 font-black text-xs shadow-md transition-transform flex items-center gap-1 animate-bounce"
                      >
                        <Sparkles className="w-3.5 h-3.5 fill-current" />
                        <span>Claim</span>
                      </button>
                    ) : mission.claimed ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Claimed</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-white/40">
                        {pct}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
          <span className="text-[11px] text-white/60 font-semibold">
            {completedCount}/{missions.length} Completed
          </span>

          {claimableCount > 1 ? (
            <button
              onClick={handleClaimAll}
              className="py-2 px-4 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 font-black text-xs shadow-md active:scale-95 transition-transform flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span>Claim All ({claimableCount})</span>
            </button>
          ) : (
            <button
              onClick={onClose}
              className="py-2 px-4 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs transition-all"
            >
              Continue Playing
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
