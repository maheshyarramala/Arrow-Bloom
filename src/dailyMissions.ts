/**
 * Arrow Bloom - Daily Missions & Retention System
 * Generates fresh daily challenges each calendar day, tracks streaks,
 * and awards extra hints & score multipliers.
 */
import { DailyMission, DailyMissionsProgress, PlayerProgress } from './types.ts';

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Stable daily puzzle selection; the same date always opens the same level offline. */
export function getDailyChallengeLevel(date = getTodayDateString()): number {
  let hash = 2166136261;
  for (let i = 0; i < date.length; i++) {
    hash ^= date.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return 1 + ((hash >>> 0) % 500);
}

export function getDefaultMissions(): DailyMission[] {
  return [
    {
      id: 'bloom_explorer',
      title: 'Bloom Explorer',
      description: 'Clear 2 puzzle levels today',
      icon: '🌸',
      target: 2,
      current: 0,
      completed: false,
      claimed: false,
      rewardType: 'extra_hints',
      rewardAmount: 2,
      rewardLabel: '+2 Extra Hints',
    },
    {
      id: 'combo_streak',
      title: 'Combo Maestro',
      description: 'Achieve a 4x combo streak in any level',
      icon: '⚡',
      target: 4,
      current: 0,
      completed: false,
      claimed: false,
      rewardType: 'score_multiplier',
      rewardAmount: 2,
      rewardLabel: '2x Score Multiplier',
    },
    {
      id: 'arrow_untangler',
      title: 'Arrow Untangler',
      description: 'Clear 60 arrows across any levels',
      icon: '🎯',
      target: 60,
      current: 0,
      completed: false,
      claimed: false,
      rewardType: 'extra_hints',
      rewardAmount: 2,
      rewardLabel: '+2 Extra Hints',
    },
    {
      id: 'flawless_mind',
      title: 'Flawless Mind',
      description: 'Clear any level with 3 stars (0 mistakes)',
      icon: '💎',
      target: 1,
      current: 0,
      completed: false,
      claimed: false,
      rewardType: 'score_multiplier',
      rewardAmount: 2,
      rewardLabel: '2x Score Multiplier',
    },
  ];
}

/**
 * Initializes or refreshes daily missions for today, computing daily login streaks.
 */
export function ensureDailyMissions(progress: PlayerProgress): PlayerProgress {
  const today = getTodayDateString();
  const existing = progress.dailyMissions;

  if (existing && existing.date === today) {
    return progress;
  }

  // Calculate streak: check if yesterday was lastLoginDate
  let newStreak = 1;
  if (existing && existing.lastLoginDate) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

    if (existing.lastLoginDate === yesterdayStr) {
      newStreak = (existing.streakDays || 1) + 1;
    } else if (existing.lastLoginDate === today) {
      newStreak = existing.streakDays || 1;
    }
  }

  const newDailyMissions: DailyMissionsProgress = {
    date: today,
    missions: getDefaultMissions(),
    streakDays: newStreak,
    lastLoginDate: today,
    bonusHintsBank: existing?.bonusHintsBank || 0,
    activeScoreMultiplier: existing?.activeScoreMultiplier || 1,
    multiplierRemainingGames: existing?.multiplierRemainingGames || 0,
  };

  return {
    ...progress,
    dailyMissions: newDailyMissions,
  };
}

export type MissionEvent =
  | { type: 'LEVEL_CLEARED'; levelNumber: number; mistakes: number; stars: number }
  | { type: 'COMBO_REACHED'; comboCount: number }
  | { type: 'ARROWS_CLEARED'; count: number };

/**
 * Updates daily missions progress based on an in-game event.
 */
export function recordMissionEvent(
  progress: PlayerProgress,
  event: MissionEvent
): { updatedProgress: PlayerProgress; completedMission?: DailyMission } {
  const ensured = ensureDailyMissions(progress);
  if (!ensured.dailyMissions) return { updatedProgress: ensured };

  let completedMission: DailyMission | undefined = undefined;

  const nextMissions = ensured.dailyMissions.missions.map((mission) => {
    let nextCurrent = mission.current;

    if (event.type === 'LEVEL_CLEARED') {
      if (mission.id === 'bloom_explorer') {
        nextCurrent = Math.min(mission.target, nextCurrent + 1);
      }
      if (mission.id === 'flawless_mind' && event.mistakes === 0) {
        nextCurrent = Math.min(mission.target, nextCurrent + 1);
      }
    } else if (event.type === 'COMBO_REACHED') {
      if (mission.id === 'combo_streak') {
        nextCurrent = Math.max(nextCurrent, Math.min(mission.target, event.comboCount));
      }
    } else if (event.type === 'ARROWS_CLEARED') {
      if (mission.id === 'arrow_untangler') {
        nextCurrent = Math.min(mission.target, nextCurrent + event.count);
      }
    }

    const completed = nextCurrent >= mission.target;
    if (completed && !mission.completed && !completedMission) {
      completedMission = { ...mission, current: nextCurrent, completed: true };
    }

    return {
      ...mission,
      current: nextCurrent,
      completed,
    };
  });

  const updatedProgress: PlayerProgress = {
    ...ensured,
    dailyMissions: {
      ...ensured.dailyMissions,
      missions: nextMissions,
    },
  };

  return { updatedProgress, completedMission };
}

/**
 * Claims a completed mission's reward.
 */
export function claimMissionReward(
  progress: PlayerProgress,
  missionId: string
): { updatedProgress: PlayerProgress; claimedMission?: DailyMission } {
  const ensured = ensureDailyMissions(progress);
  if (!ensured.dailyMissions) return { updatedProgress: ensured };

  let targetMission: DailyMission | undefined = undefined;
  let addedHints = 0;
  let newMultiplier = ensured.dailyMissions.activeScoreMultiplier;
  let newMultiplierGames = ensured.dailyMissions.multiplierRemainingGames;

  const nextMissions = ensured.dailyMissions.missions.map((mission) => {
    if (mission.id === missionId && mission.completed && !mission.claimed) {
      targetMission = mission;
      if (mission.rewardType === 'extra_hints') {
        addedHints += mission.rewardAmount;
      } else if (mission.rewardType === 'score_multiplier') {
        newMultiplier = Math.max(newMultiplier, mission.rewardAmount);
        newMultiplierGames = Math.max(newMultiplierGames, 1);
      }
      return { ...mission, claimed: true };
    }
    return mission;
  });

  if (!targetMission) return { updatedProgress: progress };

  const updatedProgress: PlayerProgress = {
    ...ensured,
    dailyMissions: {
      ...ensured.dailyMissions,
      missions: nextMissions,
      bonusHintsBank: (ensured.dailyMissions.bonusHintsBank || 0) + addedHints,
      activeScoreMultiplier: newMultiplier,
      multiplierRemainingGames: newMultiplierGames,
    },
  };

  return { updatedProgress, claimedMission: targetMission };
}

/**
 * Consumes 1 game of active score multiplier upon level completion.
 */
export function consumeScoreMultiplier(progress: PlayerProgress): PlayerProgress {
  if (!progress.dailyMissions) return progress;
  const remaining = progress.dailyMissions.multiplierRemainingGames || 0;
  if (remaining <= 1) {
    return {
      ...progress,
      dailyMissions: {
        ...progress.dailyMissions,
        activeScoreMultiplier: 1,
        multiplierRemainingGames: 0,
      },
    };
  }

  return {
    ...progress,
    dailyMissions: {
      ...progress.dailyMissions,
      multiplierRemainingGames: remaining - 1,
    },
  };
}
