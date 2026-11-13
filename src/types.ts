/**
 * Arrow Bloom - Type Definitions
 */

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface CellCoord {
  r: number; // row: 0 to gridSize - 1
  c: number; // col: 0 to gridSize - 1
}

export interface ArrowData {
  id: string;
  cells: CellCoord[]; // polyline: [tail, ..., head]. head is cells[cells.length - 1]
  direction: Direction; // direction the head points towards (must continue last segment)
  colorIndex: number; // index into PALETTE
  order: number; // generation placement order
}

export interface ShapeDefinition {
  id: string;
  name: string;
  collectionId: number;
  polygons: Array<Array<[number, number]>>; // One or more normalized [x, y] polygons (0..1)
  description?: string;
  svgIconPath?: string;
}

export interface CollectionConfig {
  id: number;
  name: string;
  theme: string;
  levels: number[]; // e.g. 1..10
  subtitle: string;
  gradientDark: string;
  gradientLight: string;
  accentColor: string;
}

export interface LevelConfig {
  levelNumber: number;
  collectionId: number;
  shapeName: string;
  gridSize: number;
  playableMask: boolean[][]; // [r][c] is true if cell is inside silhouette
  playableCells: CellCoord[];
  arrows: ArrowData[];
  solutionOrder: string[]; // arrow IDs in the order they were placed backwards
  stats: {
    depth: number;
    initialFreeCount: number;
    coveragePct: number;
    trapPct: number;
    avgLength: number;
    difficultyTier?: string;
    turnChance?: number;
  };
}

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  vibrationEnabled: boolean;
  colorBlindMode: boolean;
  performanceMode: boolean;
  /** Arrow escape animation pace; optional to support older saved settings. */
  animationSpeed?: 'slow' | 'normal' | 'fast';
  theme: 'dark' | 'light';
}

export interface LevelProgress {
  unlocked: boolean;
  stars: number; // 0-3
  highScore: number;
  cleared: boolean;
}

export interface DailyMission {
  id: string; // e.g. 'clear_levels', 'reach_combo', 'arrow_untangler', 'flawless_clear'
  title: string;
  description: string;
  icon: string;
  target: number;
  current: number;
  completed: boolean;
  claimed: boolean;
  rewardType: 'extra_hints' | 'score_multiplier';
  rewardAmount: number;
  rewardLabel: string;
}

export interface DailyMissionsProgress {
  date: string; // 'YYYY-MM-DD'
  missions: DailyMission[];
  streakDays: number;
  lastLoginDate: string;
  bonusHintsBank: number; // Banked extra hints earned from missions
  activeScoreMultiplier: number; // e.g. 2 for 2x score
  multiplierRemainingGames: number; // e.g. 1 game
}

export interface PlayerProgress {
  unlockedLevel: number;
  levelData: Record<number, LevelProgress>;
  totalScore: number;
  dailyMissions?: DailyMissionsProgress;
  dailyChallenge?: { date: string; levelNumber: number; completed: boolean };
  stats?: {
    arrowsCleared: number;
    bestCombo: number;
    perfectLevels: number;
    lastPlayedAt: number;
  };
}

export type ScreenState =
  | 'splash'
  | 'home'
  | 'levels'
  | 'game'
  | 'settings'
  | 'how-to-play';

export interface FloatingScoreItem {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
  createdAt?: number;
}

export interface SavedLevelState {
  levelNumber: number;
  activeArrows: ArrowData[];
  score: number;
  mistakes: number;
  hintsLeft: number;
  hearts: number;
  savedAt: number;
}

export interface AdState {
  isPlaying: boolean;
  adReason: 'hint' | 'free_hits' | 'double_score' | 'interstitial';
  duration: number;
  timeRemaining: number;
  rewardGranted: boolean;
  onReward?: () => void;
  onClose?: () => void;
}

export interface AchievementItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  unlocked: boolean;
  progress: number; // 0 to 100
  target: number;
  current: number;
}

export interface GamerProfile {
  connected: boolean;
  gamerTag: string;
  xp: number;
  level: number;
  achievements: Record<string, { unlocked: boolean; unlockedAt?: number; progress: number }>;
  lastSyncedAt?: number;
}
