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
  };
}

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  vibrationEnabled: boolean;
  colorBlindMode: boolean;
  performanceMode: boolean;
  theme: 'dark' | 'light';
}

export interface LevelProgress {
  unlocked: boolean;
  stars: number; // 0-3
  highScore: number;
  cleared: boolean;
}

export interface PlayerProgress {
  unlockedLevel: number;
  levelData: Record<number, LevelProgress>;
  totalScore: number;
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
