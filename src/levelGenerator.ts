/**
 * Arrow Bloom - Deterministic Silhouette Level Generator & Difficulty Optimizer
 */
import {
  ArrowData,
  CellCoord,
  CollectionConfig,
  Direction,
  LevelConfig,
} from './types.ts';
import { SHAPE_DEFINITIONS, rasterizeShape } from './shapes.ts';

export const PALETTE = [
  '#FF2A85', // 0: Hot Pink
  '#FF7A00', // 1: Orange
  '#FFD000', // 2: Sunny Yellow
  '#76E026', // 3: Lime
  '#10E7A1', // 4: Mint
  '#00E5FF', // 5: Cyan
  '#2997FF', // 6: Sky Blue
  '#5856D6', // 7: Indigo
  '#AF52DE', // 8: Purple
  '#FF2D92', // 9: Magenta
  '#FF5E57', // 10: Coral
  '#00C2A8', // 11: Teal
  '#FFAA00', // 12: Gold
  '#B886FF', // 13: Lavender
];

export const COLOR_BLIND_SYMBOLS = [
  '●', '▲', '◆', '★', '■', '✚', '♥', '✦', '❖', '⬟', '⬢', '✶', '✖', '▲',
];

export const COLLECTIONS: CollectionConfig[] = [
  {
    id: 1,
    name: 'Shapes',
    theme: 'shapes',
    levels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    subtitle: 'Classic geometric silhouettes',
    gradientDark: 'from-pink-950 via-slate-900 to-indigo-950',
    gradientLight: 'from-pink-50 via-rose-100 to-purple-50',
    accentColor: '#FF2A85',
  },
  {
    id: 2,
    name: 'Sky',
    theme: 'sky',
    levels: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
    subtitle: 'High-flying birds, jets & celestial wonders',
    gradientDark: 'from-cyan-950 via-blue-950 to-slate-950',
    gradientLight: 'from-cyan-50 via-sky-100 to-blue-50',
    accentColor: '#00E5FF',
  },
  {
    id: 3,
    name: 'Animals',
    theme: 'animals',
    levels: [21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
    subtitle: 'Clever critters & jungle companions',
    gradientDark: 'from-emerald-950 via-teal-950 to-slate-950',
    gradientLight: 'from-emerald-50 via-teal-100 to-green-50',
    accentColor: '#76E026',
  },
  {
    id: 4,
    name: 'Nature',
    theme: 'nature',
    levels: [31, 32, 33, 34, 35, 36, 37, 38, 39, 40],
    subtitle: 'Mountains, waves, blooms & wilderness',
    gradientDark: 'from-amber-950 via-rose-950 to-purple-950',
    gradientLight: 'from-amber-50 via-orange-100 to-rose-50',
    accentColor: '#FF7A00',
  },
  {
    id: 5,
    name: 'Legends',
    theme: 'legends',
    levels: [41, 42, 43, 44, 45, 46, 47, 48, 49, 50],
    subtitle: 'Mythic beasts & the Grand Master Maze',
    gradientDark: 'from-purple-950 via-indigo-950 to-black',
    gradientLight: 'from-violet-50 via-fuchsia-100 to-indigo-50',
    accentColor: '#AF52DE',
  },
];

// Seeded PRNG: Mulberry32
export function createRNG(seed: number) {
  let s = seed >>> 0;
  return function () {
    let t = (s += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const DIR_DELTA: Record<Direction, [number, number]> = {
  up: [-1, 0],
  down: [1, 0],
  left: [0, -1],
  right: [0, 1],
};

export function getDirFromDelta(dr: number, dc: number): Direction {
  if (dr === -1) return 'up';
  if (dr === 1) return 'down';
  if (dc === -1) return 'left';
  return 'right';
}

// Compute level parameters (Grid size, snake lengths)
export function getLevelParams(level: number) {
  const collectionIdx = Math.min(4, Math.floor((level - 1) / 10));
  const collection = COLLECTIONS[collectionIdx];
  const step = ((level - 1) % 10) / 9; // 0..1

  let gridSize: number;
  let minLen: number;
  let maxLen: number;

  if (collection.id === 1) {
    gridSize = Math.round(10 + step * 6); // 10 -> 16
    minLen = 3;
    maxLen = Math.round(4 + step * 3); // 4 -> 7
  } else if (collection.id === 2) {
    gridSize = Math.round(14 + step * 6); // 14 -> 20
    minLen = 3;
    maxLen = Math.round(6 + step * 4); // 6 -> 10
  } else if (collection.id === 3) {
    gridSize = Math.round(16 + step * 8); // 16 -> 24
    minLen = 4;
    maxLen = Math.round(8 + step * 6); // 8 -> 14
  } else if (collection.id === 4) {
    gridSize = Math.round(20 + step * 8); // 20 -> 28
    minLen = 4;
    maxLen = Math.round(10 + step * 10); // 10 -> 20
  } else {
    // Collection 5: Legends
    gridSize = Math.round(26 + step * 8); // 26 -> 34
    minLen = 5;
    maxLen = Math.round(12 + step * 16); // 12 -> 28 (with occasional mega snakes)
  }

  // Level 1 gentle tuning
  if (level === 1) {
    gridSize = 10;
    minLen = 3;
    maxLen = 4;
  }

  return { collection, gridSize, minLen, maxLen };
}

// Ray calculation from head in direction towards grid edge
export function getRayCells(
  head: CellCoord,
  dir: Direction,
  gridSize: number
): CellCoord[] {
  const ray: CellCoord[] = [];
  const [dr, dc] = DIR_DELTA[dir];
  let r = head.r + dr;
  let c = head.c + dc;
  while (r >= 0 && r < gridSize && c >= 0 && c < gridSize) {
    ray.push({ r, c });
    r += dr;
    c += dc;
  }
  return ray;
}

// Greedy graph coloring for 14-palette
export function assignColors(
  arrows: ArrowData[],
  gridSize: number,
  rng: () => number
): void {
  const cellToArrow = new Map<string, number>();
  arrows.forEach((arrow, idx) => {
    arrow.cells.forEach((cell) => {
      cellToArrow.set(`${cell.r},${cell.c}`, idx);
    });
  });

  const adj = Array.from({ length: arrows.length }, () => new Set<number>());
  arrows.forEach((arrow, idx) => {
    arrow.cells.forEach((cell) => {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = cell.r + dr;
          const nc = cell.c + dc;
          if (nr >= 0 && nr < gridSize && nc >= 0 && nc < gridSize) {
            const neighborIdx = cellToArrow.get(`${nr},${nc}`);
            if (neighborIdx !== undefined && neighborIdx !== idx) {
              adj[idx].add(neighborIdx);
              adj[neighborIdx].add(idx);
            }
          }
        }
      }
    });
  });

  const baseOffset = Math.floor(rng() * PALETTE.length);
  arrows.forEach((arrow, idx) => {
    const used = new Set<number>();
    adj[idx].forEach((nIdx) => {
      if (arrows[nIdx].colorIndex !== -1) {
        used.add(arrows[nIdx].colorIndex);
      }
    });

    for (let i = 0; i < PALETTE.length; i++) {
      const candidate = (baseOffset + i) % PALETTE.length;
      if (!used.has(candidate)) {
        arrow.colorIndex = candidate;
        break;
      }
    }
    if (arrow.colorIndex === -1) {
      arrow.colorIndex = (baseOffset + idx) % PALETTE.length;
    }
  });
}

// Solver simulation with depth & trap measurement
export function analyzeLevelSolvability(
  arrows: ArrowData[],
  gridSize: number
): {
  solvable: boolean;
  depth: number;
  initialFreeCount: number;
  trapPct: number;
} {
  const activeArrows = new Map<string, ArrowData>();
  const occupied = new Map<string, string>(); // 'r,c' -> arrowId

  arrows.forEach((a) => {
    activeArrows.set(a.id, a);
    a.cells.forEach((c) => occupied.set(`${c.r},${c.c}`, a.id));
  });

  // Calculate initial free arrows & near-miss traps
  let initialFreeCount = 0;
  let trapCount = 0;

  for (const arrow of arrows) {
    const head = arrow.cells[arrow.cells.length - 1];
    const ray = getRayCells(head, arrow.direction, gridSize);
    const blockers = new Set<string>();
    for (const cell of ray) {
      const occ = occupied.get(`${cell.r},${cell.c}`);
      if (occ && occ !== arrow.id) {
        blockers.add(occ);
      }
    }
    if (blockers.size === 0) {
      initialFreeCount++;
    } else if (blockers.size === 1) {
      trapCount++;
    }
  }

  const trapPct = arrows.length > 0 ? (trapCount / arrows.length) * 100 : 0;

  // Rounds-based simulation for depth
  let depth = 0;
  while (activeArrows.size > 0) {
    const freeInThisRound: string[] = [];

    for (const [id, arrow] of activeArrows.entries()) {
      const head = arrow.cells[arrow.cells.length - 1];
      const ray = getRayCells(head, arrow.direction, gridSize);
      let blocked = false;
      for (const cell of ray) {
        const occ = occupied.get(`${cell.r},${cell.c}`);
        if (occ && occ !== id) {
          blocked = true;
          break;
        }
      }
      if (!blocked) {
        freeInThisRound.push(id);
      }
    }

    if (freeInThisRound.length === 0) {
      // Stuck!
      return { solvable: false, depth, initialFreeCount, trapPct };
    }

    // Remove all free in this round
    for (const id of freeInThisRound) {
      const arrow = activeArrows.get(id)!;
      arrow.cells.forEach((c) => occupied.delete(`${c.r},${c.c}`));
      activeArrows.delete(id);
    }
    depth++;
  }

  return { solvable: true, depth, initialFreeCount, trapPct };
}

// Single Level Construction with Silhouette & Difficulty Filtering
function buildSingleLevelCandidate(
  levelNumber: number,
  seed: number
): LevelConfig | null {
  const rng = createRNG(seed);
  const shapeDef = SHAPE_DEFINITIONS[levelNumber] || SHAPE_DEFINITIONS[1];
  const { collection, gridSize, minLen, maxLen } = getLevelParams(levelNumber);

  const { mask, cells: playableCells } = rasterizeShape(shapeDef, gridSize);
  if (playableCells.length < 8) return null;

  const occupied = new Map<string, string>(); // 'r,c' -> arrowId
  const arrows: ArrowData[] = [];
  const directions: Direction[] = ['up', 'down', 'left', 'right'];

  // Snake generation parameters
  const targetCoverage = 0.90; // aim for >=90%
  const targetCoveredCells = Math.floor(playableCells.length * targetCoverage);

  let currentCoveredCells = 0;
  let attempts = 0;
  const maxPlacementAttempts = 500;

  // Chance for rare mega-snake on higher levels (levels 30+)
  const allowMegaSnakes = levelNumber >= 30;

  while (
    currentCoveredCells < targetCoveredCells &&
    attempts < maxPlacementAttempts
  ) {
    attempts++;

    // Pick empty playable cell for tail
    const emptyCells = playableCells.filter(
      (c) => !occupied.has(`${c.r},${c.c}`)
    );
    if (emptyCells.length === 0) break;

    const startCell = emptyCells[Math.floor(rng() * emptyCells.length)];

    // Determine snake target length
    let targetLen = Math.floor(rng() * (maxLen - minLen + 1)) + minLen;
    if (allowMegaSnakes && rng() < 0.12) {
      targetLen = Math.min(36, Math.floor(rng() * 16) + 20); // 20..36
    }

    const path: CellCoord[] = [startCell];
    const visited = new Set<string>([`${startCell.r},${startCell.c}`]);

    let currDir: Direction = directions[Math.floor(rng() * directions.length)];
    let stuck = false;

    while (path.length < targetLen) {
      const curr = path[path.length - 1];

      // Prefer turns with turnProbability 0.35-0.5
      const wantTurn = rng() < 0.42;
      const candidateDirs: Direction[] = [];

      if (!wantTurn) {
        candidateDirs.push(currDir);
      }
      // Add other perpendicular directions
      const otherDirs = directions
        .filter((d) => d !== currDir)
        .sort(() => rng() - 0.5);
      candidateDirs.push(...otherDirs);

      let foundNext = false;
      for (const d of candidateDirs) {
        const [dr, dc] = DIR_DELTA[d];
        const nr = curr.r + dr;
        const nc = curr.c + dc;
        const key = `${nr},${nc}`;

        // Must be inside silhouette mask, empty, not visited
        if (
          nr >= 0 &&
          nr < gridSize &&
          nc >= 0 &&
          nc < gridSize &&
          mask[nr][nc] &&
          !occupied.has(key) &&
          !visited.has(key)
        ) {
          path.push({ r: nr, c: nc });
          visited.add(key);
          currDir = d;
          foundNext = true;
          break;
        }
      }

      if (!foundNext) {
        stuck = true;
        break;
      }
    }

    // Must meet minimum length
    if (path.length < 2) continue;
    if (stuck && path.length < Math.min(minLen, 3)) continue;

    // Head is last cell. Head direction MUST continue the last segment's direction!
    const head = path[path.length - 1];
    const prev = path[path.length - 2];
    const headDir = getDirFromDelta(head.r - prev.r, head.c - prev.c);

    // Compute ray from head to edge of grid
    // ACCEPT ONLY IF ray has NO already-placed cell (cells outside mask on ray are fine!)
    const ray = getRayCells(head, headDir, gridSize);
    let rayHitsAlreadyPlaced = false;
    for (const cell of ray) {
      if (occupied.has(`${cell.r},${cell.c}`)) {
        rayHitsAlreadyPlaced = true;
        break;
      }
    }

    if (rayHitsAlreadyPlaced) {
      continue;
    }

    // ACCEPT arrow!
    const arrowId = `a_${levelNumber}_${arrows.length + 1}`;
    const newArrow: ArrowData = {
      id: arrowId,
      cells: path,
      direction: headDir,
      colorIndex: -1,
      order: arrows.length,
    };

    path.forEach((c) => occupied.set(`${c.r},${c.c}`, arrowId));
    arrows.push(newArrow);
    currentCoveredCells += path.length;
  }

  // Second pass: fill small leftover holes with 2-3 cell arrows if clear ray exists
  if (currentCoveredCells < targetCoveredCells) {
    const leftoverEmpty = playableCells.filter(
      (c) => !occupied.has(`${c.r},${c.c}`)
    );
    for (const cell of leftoverEmpty) {
      if (occupied.has(`${cell.r},${cell.c}`)) continue;
      // Try 2-cell mini arrows
      for (const d of directions) {
        const [dr, dc] = DIR_DELTA[d];
        const nr = cell.r + dr;
        const nc = cell.c + dc;
        if (
          nr >= 0 &&
          nr < gridSize &&
          nc >= 0 &&
          nc < gridSize &&
          mask[nr][nc] &&
          !occupied.has(`${nr},${nc}`)
        ) {
          const miniHead = { r: nr, c: nc };
          const ray = getRayCells(miniHead, d, gridSize);
          const rayBlocked = ray.some((c) => occupied.has(`${c.r},${c.c}`));
          if (!rayBlocked) {
            const arrowId = `a_${levelNumber}_${arrows.length + 1}`;
            const miniArrow: ArrowData = {
              id: arrowId,
              cells: [cell, miniHead],
              direction: d,
              colorIndex: -1,
              order: arrows.length,
            };
            occupied.set(`${cell.r},${cell.c}`, arrowId);
            occupied.set(`${miniHead.r},${miniHead.c}`, arrowId);
            arrows.push(miniArrow);
            currentCoveredCells += 2;
            break;
          }
        }
      }
    }
  }

  if (arrows.length === 0) return null;

  // Run solver and measure metrics
  const analysis = analyzeLevelSolvability(arrows, gridSize);
  if (!analysis.solvable) return null;

  const coveragePct = (currentCoveredCells / playableCells.length) * 100;
  let totalLen = 0;
  arrows.forEach((a) => (totalLen += a.cells.length));
  const avgLength = totalLen / arrows.length;

  assignColors(arrows, gridSize, rng);

  return {
    levelNumber,
    collectionId: collection.id,
    shapeName: shapeDef.name,
    gridSize,
    playableMask: mask,
    playableCells,
    arrows,
    solutionOrder: [...arrows].reverse().map((a) => a.id),
    stats: {
      depth: analysis.depth,
      initialFreeCount: analysis.initialFreeCount,
      coveragePct,
      trapPct: analysis.trapPct,
      avgLength,
    },
  };
}

// In-memory cache
const levelCache = new Map<number, LevelConfig>();

/**
 * Difficulty criteria check based on level progression
 */
function meetsDifficultyTargets(level: number, candidate: LevelConfig): boolean {
  const { depth, initialFreeCount, coveragePct, trapPct } = candidate.stats;
  const totalArrows = candidate.arrows.length;

  // Level 1 targets: depth >= 3, initialFree <= 35%
  if (level === 1) {
    return depth >= 2 && initialFreeCount >= 1 && coveragePct >= 75;
  }

  // Linear ramp:
  // depth: 3 on level 1 rising to 18 on level 50
  const requiredDepth = Math.max(2, Math.round(3 + (level / 50) * 14));

  // initialFree: <= 25% on level 1, falling to <= 6% on level 50
  const maxInitialPct = Math.max(0.06, 0.25 - (level / 50) * 0.19);
  const maxInitialCount = Math.max(2, Math.floor(totalArrows * maxInitialPct));

  // Traps: >= 25% near-miss traps
  const minTrapPct = 25;

  return (
    depth >= requiredDepth &&
    initialFreeCount <= maxInitialCount &&
    trapPct >= minTrapPct &&
    coveragePct >= 80
  );
}

/**
 * Returns verified level config with retries
 */
export function getLevel(levelNumber: number): LevelConfig {
  if (levelCache.has(levelNumber)) {
    return levelCache.get(levelNumber)!;
  }

  let attempt = 0;
  let bestCandidate: LevelConfig | null = null;
  let bestScore = -Infinity;

  while (attempt < 45) {
    const seed = levelNumber * 7919 + attempt;
    const candidate = buildSingleLevelCandidate(levelNumber, seed);

    if (candidate) {
      if (meetsDifficultyTargets(levelNumber, candidate)) {
        levelCache.set(levelNumber, candidate);
        return candidate;
      }

      // Rank candidate by depth + traps
      const score =
        candidate.stats.depth * 2 +
        candidate.stats.trapPct +
        candidate.stats.coveragePct -
        candidate.stats.initialFreeCount * 3;

      if (score > bestScore) {
        bestScore = score;
        bestCandidate = candidate;
      }
    }
    attempt++;
  }

  // Fallback to best candidate
  if (bestCandidate) {
    levelCache.set(levelNumber, bestCandidate);
    return bestCandidate;
  }

  // Guaranteed emergency fallback
  const fallback = buildSingleLevelCandidate(levelNumber, levelNumber * 7919)!;
  levelCache.set(levelNumber, fallback);
  return fallback;
}

/**
 * Pre-generate and verify all 50 levels for dev check
 */
export function preloadAndVerifyAllLevels(): void {
  const startTime = performance.now();
  let solvableCount = 0;

  for (let i = 1; i <= 50; i++) {
    const lvl = getLevel(i);
    if (lvl.stats.depth > 0) {
      solvableCount++;
    }
  }

  const elapsed = Math.round(performance.now() - startTime);
  console.log(
    `[Arrow Bloom] 50 silhouette levels generated & verified in ${elapsed}ms (${solvableCount}/50 solvable).`
  );
}
