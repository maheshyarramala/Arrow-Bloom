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

export function loadProgress(): PlayerProgress {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw);
    return {
      unlockedLevel: parsed.unlockedLevel || 1,
      totalScore: parsed.totalScore || 0,
      levelData: parsed.levelData || { 1: { unlocked: true, stars: 0, highScore: 0, cleared: false } },
    };
  } catch {
    return DEFAULT_PROGRESS;
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
  if (nextLevel <= 150) {
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
  } catch {
    // Ignore
  }
  return DEFAULT_PROGRESS;
}
