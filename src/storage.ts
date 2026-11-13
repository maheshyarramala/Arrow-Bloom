/**
 * Safe LocalStorage Progress & Settings Persistence
 */
import { GameSettings, PlayerProgress } from './types.ts';

const SETTINGS_KEY = 'arrow_bloom_settings';
const PROGRESS_KEY = 'arrow_bloom_progress';

export const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: true,
  musicEnabled: false,
  vibrationEnabled: true,
  colorBlindMode: false,
  performanceMode: typeof navigator !== 'undefined' && ((navigator.hardwareConcurrency || 8) <= 4 || (((navigator as Navigator & { deviceMemory?: number }).deviceMemory || 8) <= 4)),
  animationSpeed: 'slow',
  theme: 'dark',
};

export const DEFAULT_PROGRESS: PlayerProgress = {
  unlockedLevel: 1,
  totalScore: 0,
  levelData: {
    1: { unlocked: true, stars: 0, highScore: 0, cleared: false },
  },
};

export function loadSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: GameSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Graceful fallback
  }
}

import { ensureDailyMissions } from './dailyMissions.ts';

export function loadProgress(): PlayerProgress {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return ensureDailyMissions(DEFAULT_PROGRESS);
    const parsed = JSON.parse(raw);
    const loaded: PlayerProgress = {
      unlockedLevel: parsed.unlockedLevel || 1,
      totalScore: parsed.totalScore || 0,
      levelData: parsed.levelData || { 1: { unlocked: true, stars: 0, highScore: 0, cleared: false } },
      dailyMissions: parsed.dailyMissions,
    };
    return ensureDailyMissions(loaded);
  } catch {
    return ensureDailyMissions(DEFAULT_PROGRESS);
  }
}

export function saveProgress(progress: PlayerProgress): void {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    // Graceful fallback
  }
}

export function updateLevelCompletion(
  currentProgress: PlayerProgress,
  levelNumber: number,
  stars: number,
  score: number
): PlayerProgress {
  const nextProgress: PlayerProgress = {
    ...currentProgress,
    levelData: { ...currentProgress.levelData },
  };

  const prevRecord = nextProgress.levelData[levelNumber] || {
    unlocked: true,
    stars: 0,
    highScore: 0,
    cleared: false,
  };

  const bestStars = Math.max(prevRecord.stars, stars);
  const bestScore = Math.max(prevRecord.highScore, score);

  nextProgress.levelData[levelNumber] = {
    unlocked: true,
    stars: bestStars,
    highScore: bestScore,
    cleared: true,
  };

  // Unlock next level (up to 150)
  const nextLevel = levelNumber + 1;
  if (nextLevel <= 300) {
    if (nextProgress.unlockedLevel < nextLevel) {
      nextProgress.unlockedLevel = nextLevel;
    }
    if (!nextProgress.levelData[nextLevel]) {
      nextProgress.levelData[nextLevel] = {
        unlocked: true,
        stars: 0,
        highScore: 0,
        cleared: false,
      };
    } else {
      nextProgress.levelData[nextLevel].unlocked = true;
    }
  }

  // Calculate total score
  let total = 0;
  Object.values(nextProgress.levelData).forEach((l) => {
    total += l.highScore;
  });
  nextProgress.totalScore = total;

  saveProgress(nextProgress);
  return nextProgress;
}

export function resetProgress(): PlayerProgress {
  try {
    localStorage.removeItem(PROGRESS_KEY);
    localStorage.removeItem(MID_LEVEL_KEY);
  } catch {
    // Ignore
  }
  return DEFAULT_PROGRESS;
}

const MID_LEVEL_KEY = 'arrow_bloom_mid_level';
const AD_FREE_KEY = 'arrow_bloom_ad_free';
const GAMER_PROFILE_KEY = 'arrow_bloom_gamer_profile';

import { SavedLevelState, GamerProfile, AchievementItem } from './types.ts';

export function saveMidLevelState(state: SavedLevelState | null): void {
  try {
    if (!state) {
      localStorage.removeItem(MID_LEVEL_KEY);
      return;
    }
    localStorage.setItem(MID_LEVEL_KEY, JSON.stringify(state));
  } catch {
    // Ignore
  }
}

export function loadMidLevelState(levelNumber?: number): SavedLevelState | null {
  try {
    const raw = localStorage.getItem(MID_LEVEL_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedLevelState;
    if (levelNumber !== undefined && parsed.levelNumber !== levelNumber) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearMidLevelState(): void {
  try {
    localStorage.removeItem(MID_LEVEL_KEY);
  } catch {
    // Ignore
  }
}

export function isAdFreePurchased(): boolean {
  try {
    return localStorage.getItem(AD_FREE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setAdFreePurchased(adFree: boolean): void {
  try {
    localStorage.setItem(AD_FREE_KEY, adFree ? 'true' : 'false');
  } catch {
    // Ignore
  }
}

export const ACHIEVEMENTS_DEF: Array<{ id: string; title: string; description: string; icon: string; xpReward: number; target: number }> = [
  { id: 'first_bloom', title: 'First Bloom', description: 'Clear your very first level', icon: '🎯', xpReward: 500, target: 1 },
  { id: 'combo_maestro', title: 'Combo Maestro', description: 'Achieve a 5x combo streak in any level', icon: '⚡', xpReward: 1500, target: 5 },
  { id: 'perfectionist', title: 'Flawless Mind', description: 'Complete a level with zero mistakes (3 Stars)', icon: '💎', xpReward: 2000, target: 1 },
  { id: 'shapes_collector', title: 'Shape Master', description: 'Clear Collection 1 (Levels 1–10)', icon: '🌸', xpReward: 3000, target: 10 },
  { id: 'century_solver', title: 'Century Solver', description: 'Conquer 100 intricate arrow puzzles', icon: '💯', xpReward: 7500, target: 100 },
  { id: 'ad_free_vip', title: 'Patron of Bloom', description: 'Unlock Lifetime Ad-Free VIP Pass', icon: '👑', xpReward: 5000, target: 1 },
  { id: 'grand_master', title: 'Grand Master 300', description: 'Conquer all 300 arrow silhouettes', icon: '🌟', xpReward: 15000, target: 300 },
];

export const DEFAULT_GAMER_PROFILE: GamerProfile = {
  connected: true,
  gamerTag: 'BloomSolver_99',
  xp: 1250,
  level: 4,
  achievements: {
    first_bloom: { unlocked: true, progress: 100, unlockedAt: Date.now() - 3600000 },
  },
  lastSyncedAt: Date.now(),
};

export function loadGamerProfile(): GamerProfile {
  try {
    const raw = localStorage.getItem(GAMER_PROFILE_KEY);
    if (!raw) return DEFAULT_GAMER_PROFILE;
    return { ...DEFAULT_GAMER_PROFILE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_GAMER_PROFILE;
  }
}

export function saveGamerProfile(profile: GamerProfile): void {
  try {
    localStorage.setItem(GAMER_PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // Ignore
  }
}

