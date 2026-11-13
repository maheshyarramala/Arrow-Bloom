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
import './extendedShapes.ts';

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
    id: 1, name: 'Shapes', theme: 'shapes', levels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    subtitle: 'Classic geometric silhouettes', accentColor: '#FF2A85',
    gradientDark: 'from-pink-950 via-slate-900 to-indigo-950', gradientLight: 'from-pink-50 via-rose-100 to-purple-50',
  },
  {
    id: 2, name: 'Sky', theme: 'sky', levels: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
    subtitle: 'High-flying birds, jets & celestial wonders', accentColor: '#00E5FF',
    gradientDark: 'from-cyan-950 via-blue-950 to-slate-950', gradientLight: 'from-cyan-50 via-sky-100 to-blue-50',
  },
  {
    id: 3, name: 'Animals', theme: 'animals', levels: [21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
    subtitle: 'Clever critters & jungle companions', accentColor: '#76E026',
    gradientDark: 'from-emerald-950 via-teal-950 to-slate-950', gradientLight: 'from-emerald-50 via-teal-100 to-green-50',
  },
  {
    id: 4, name: 'Nature', theme: 'nature', levels: [31, 32, 33, 34, 35, 36, 37, 38, 39, 40],
    subtitle: 'Mountains, waves, blooms & wilderness', accentColor: '#FF7A00',
    gradientDark: 'from-amber-950 via-rose-950 to-purple-950', gradientLight: 'from-amber-50 via-orange-100 to-rose-50',
  },
  {
    id: 5, name: 'Legends', theme: 'legends', levels: [41, 42, 43, 44, 45, 46, 47, 48, 49, 50],
    subtitle: 'Mythic beasts & the Grand Master Maze', accentColor: '#AF52DE',
    gradientDark: 'from-purple-950 via-indigo-950 to-black', gradientLight: 'from-violet-50 via-fuchsia-100 to-indigo-50',
  },
];

COLLECTIONS.push(
  { id: 6, name: 'Deep Sea', theme: 'deep-sea', levels: [51, 52, 53, 54, 55, 56, 57, 58, 59, 60], subtitle: 'Explore the wonders beneath the waves', accentColor: '#22D3EE', gradientDark: 'from-cyan-950 via-blue-950 to-slate-950', gradientLight: 'from-cyan-50 via-sky-100 to-blue-50' },
  { id: 7, name: 'Enchanted', theme: 'enchanted', levels: [61, 62, 63, 64, 65, 66, 67, 68, 69, 70], subtitle: 'Magical objects from a hidden kingdom', accentColor: '#E879F9', gradientDark: 'from-fuchsia-950 via-purple-950 to-slate-950', gradientLight: 'from-fuchsia-50 via-violet-100 to-purple-50' },
  { id: 8, name: 'Cosmos', theme: 'cosmos', levels: [71, 72, 73, 74, 75, 76, 77, 78, 79, 80], subtitle: 'Travel through stars, planets and galaxies', accentColor: '#818CF8', gradientDark: 'from-indigo-950 via-slate-950 to-black', gradientLight: 'from-indigo-50 via-blue-100 to-slate-100' },
  { id: 9, name: 'Sweet World', theme: 'sweet', levels: [81, 82, 83, 84, 85, 86, 87, 88, 89, 90], subtitle: 'A colourful collection of sweet treats', accentColor: '#FB7185', gradientDark: 'from-pink-950 via-rose-950 to-orange-950', gradientLight: 'from-pink-50 via-rose-100 to-orange-50' },
  { id: 10, name: 'Sports', theme: 'sports', levels: [91, 92, 93, 94, 95, 96, 97, 98, 99, 100], subtitle: 'Gear up for the ultimate challenge', accentColor: '#FB923C', gradientDark: 'from-orange-950 via-red-950 to-slate-950', gradientLight: 'from-orange-50 via-amber-100 to-red-50' },
  { id: 11, name: 'Music', theme: 'music', levels: [101, 102, 103, 104, 105, 106, 107, 108, 109, 110], subtitle: 'Make shapes sing with every move', accentColor: '#A78BFA', gradientDark: 'from-violet-950 via-indigo-950 to-slate-950', gradientLight: 'from-violet-50 via-indigo-100 to-blue-50' },
  { id: 12, name: 'Adventure', theme: 'adventure', levels: [111, 112, 113, 114, 115, 116, 117, 118, 119, 120], subtitle: 'Discover maps, treasures and faraway places', accentColor: '#FBBF24', gradientDark: 'from-amber-950 via-yellow-950 to-stone-950', gradientLight: 'from-amber-50 via-yellow-100 to-stone-100' },
  { id: 13, name: 'Technology', theme: 'technology', levels: [121, 122, 123, 124, 125, 126, 127, 128, 129, 130], subtitle: 'A futuristic set of mechanical silhouettes', accentColor: '#38BDF8', gradientDark: 'from-sky-950 via-cyan-950 to-slate-950', gradientLight: 'from-sky-50 via-cyan-100 to-slate-100' },
  { id: 14, name: 'Mythical', theme: 'mythical', levels: [131, 132, 133, 134, 135, 136, 137, 138, 139, 140], subtitle: 'Legends, creatures and enchanted artefacts', accentColor: '#C084FC', gradientDark: 'from-purple-950 via-fuchsia-950 to-slate-950', gradientLight: 'from-purple-50 via-fuchsia-100 to-indigo-50' },
  { id: 15, name: 'Mastery', theme: 'mastery', levels: [141, 142, 143, 144, 145, 146, 147, 148, 149, 150], subtitle: 'The final ten challenges for master players', accentColor: '#F0ABFC', gradientDark: 'from-slate-950 via-indigo-950 to-black', gradientLight: 'from-slate-100 via-indigo-100 to-violet-100' }
);

for (let id = 16; id <= 50; id++) {
  const start = (id - 1) * 10 + 1;
  const hue = (id * 47) % 360;
  const names = [
    'Aurora','Neon City','Ancient','Crystal','Volcano','Dreamscape','Oceanic','Clockwork','Wildlands','Legendary','Infinity','Eclipse','Starlight','Obsidian','Final Bloom',
    'Mirage','Frostbite','Nebula Rush','Jade Temple','Cyber Pulse','Solar Flare','Velvet Night','Amber Dunes','Arcane','Prism Forge','Skyborne','Coral Abyss','Starforge','Emerald Mist','Chronos','Radiant Peak','Phantom Maze','Celestial','Nova Core','Eternal Bloom'
  ];
  COLLECTIONS.push({
    id, name: names[id - 16],
    theme: 'world-' + id, levels: Array.from({ length: 10 }, (_, i) => start + i),
    subtitle: id > 30 ? 'Apex master winding arrow challenges' : 'A new set of winding arrow challenges',
    gradientDark: 'from-slate-950 via-indigo-950 to-black', gradientLight: 'from-indigo-50 via-sky-100 to-violet-100',
    accentColor: 'hsl(' + hue + ' 85% 62%)',
  });
}

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

export function getDifficultyProfile(level: number) {
  const safeLevel = Math.max(1, Math.min(500, Math.floor(level)));
  if (safeLevel <= 10) return { tier: 'Beginner', gridSize: 48, turnChance: 0.36, targetMin: 7, targetMax: 17 };
  if (safeLevel <= 50) return { tier: 'Easy', gridSize: 50, turnChance: 0.42, targetMin: 8, targetMax: 18 };
  if (safeLevel <= 100) return { tier: 'Medium', gridSize: 52, turnChance: 0.48, targetMin: 8, targetMax: 19 };
  if (safeLevel <= 180) return { tier: 'Hard', gridSize: 54, turnChance: 0.54, targetMin: 9, targetMax: 20 };
  if (safeLevel <= 250) return { tier: 'Expert', gridSize: 56, turnChance: 0.60, targetMin: 9, targetMax: 21 };
  if (safeLevel <= 350) return { tier: 'Master', gridSize: 58, turnChance: 0.65, targetMin: 10, targetMax: 22 };
  if (safeLevel <= 430) return { tier: 'Grandmaster', gridSize: 60, turnChance: 0.70, targetMin: 10, targetMax: 23 };
  return { tier: 'Eternal', gridSize: 62, turnChance: 0.74, targetMin: 11, targetMax: 24 };
}

export function getLevelParams(level: number) {
  const collectionIdx = Math.min(49, Math.max(0, Math.floor((level - 1) / 10)));
  const collection = COLLECTIONS[collectionIdx];
  const difficulty = getDifficultyProfile(level);
  return { collection, ...difficulty, minLen: 4, maxLen: 28 };
}

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

export function analyzeLevelSolvability(
  arrows: ArrowData[],
  gridSize: number
): { solvable: boolean; depth: number; initialFreeCount: number; trapPct: number } {
  const count = arrows.length;
  const owner = new Int16Array(gridSize * gridSize);
  owner.fill(-1);
  for (let i = 0; i < count; i++) {
    const cells = arrows[i].cells;
    for (let j = 0; j < cells.length; j++) owner[cells[j].r * gridSize + cells[j].c] = i;
  }

  const blockers = new Array<number[]>(count);
  const blockedBy = new Array<number[]>(count);
  const remaining = new Int16Array(count);
  const removed = new Uint8Array(count);
  let initialFreeCount = 0;
  let trapCount = 0;

  for (let i = 0; i < count; i++) {
    const arrow = arrows[i];
    const head = arrow.cells[arrow.cells.length - 1];
    const [dr, dc] = DIR_DELTA[arrow.direction];
    let r = head.r + dr;
    let c = head.c + dc;
    const seen = new Uint8Array(count);
    const list: number[] = [];
    while (r >= 0 && r < gridSize && c >= 0 && c < gridSize) {
      const other = owner[r * gridSize + c];
      if (other >= 0 && other !== i && seen[other] === 0) {
        seen[other] = 1;
        list.push(other);
      }
      r += dr;
      c += dc;
    }
    blockers[i] = list;
    remaining[i] = list.length;
    if (list.length === 0) initialFreeCount++;
    else if (list.length === 1) trapCount++;
    for (let j = 0; j < list.length; j++) {
      const blocker = list[j];
      (blockedBy[blocker] || (blockedBy[blocker] = [])).push(i);
    }
  }

  const trapPct = count ? (trapCount / count) * 100 : 0;
  let frontier = new Int16Array(count);
  let next = new Int16Array(count);
  let frontierCount = 0;
  for (let i = 0; i < count; i++) if (remaining[i] === 0) frontier[frontierCount++] = i;
  let removedCount = 0;
  let depth = 0;
  while (frontierCount > 0) {
    let nextCount = 0;
    for (let q = 0; q < frontierCount; q++) {
      const current = frontier[q];
      if (removed[current]) continue;
      removed[current] = 1;
      removedCount++;
      const dependents = blockedBy[current];
      if (!dependents) continue;
      for (let j = 0; j < dependents.length; j++) {
        const target = dependents[j];
        if (remaining[target] > 0 && --remaining[target] === 0) next[nextCount++] = target;
      }
    }
    depth++;
    const swap = frontier; frontier = next; next = swap;
    frontierCount = nextCount;
  }
  return { solvable: removedCount === count, depth, initialFreeCount, trapPct };
}

function buildSingleLevelCandidate(
  levelNumber: number,
  seed: number
): LevelConfig | null {
  const rng = createRNG(seed);
  const shapeKey = ((levelNumber - 1) % 150) + 1;
  const shapeDef = SHAPE_DEFINITIONS[levelNumber] || SHAPE_DEFINITIONS[shapeKey] || SHAPE_DEFINITIONS[1];
  const { collection } = getLevelParams(levelNumber);

  // Expand grid density enough to guarantee >60 winding interlocking arrows on every silhouette.
  const difficulty = getDifficultyProfile(levelNumber);
  let gridSize = difficulty.gridSize;
  let { cells: playableCells } = rasterizeShape(shapeDef, gridSize);
  while (playableCells.length < 880 && gridSize + 2 <= 76) {
    gridSize += 2;
    ({ cells: playableCells } = rasterizeShape(shapeDef, gridSize));
  }

  const occupied = new Int16Array(gridSize * gridSize);
  occupied.fill(-1);
  const remaining = new Set<number>();
  for (const c of playableCells) remaining.add(c.r * gridSize + c.c);

  const arrows: ArrowData[] = [];
  const directions: Direction[] = ['up', 'down', 'left', 'right'];

  function countRayBlockers(hr: number, hc: number, d: Direction): number {
    const [dr, dc] = DIR_DELTA[d];
    let r = hr + dr, c = hc + dc;
    let blockers = 0;
    while (r >= 0 && r < gridSize && c >= 0 && c < gridSize) {
      const idx = r * gridSize + c;
      if (remaining.has(idx)) return -1; // passes through unassigned cell -> could be blocked later
      if (occupied[idx] >= 0) blockers++;
      r += dr; c += dc;
    }
    return blockers;
  }

  function pickDirectionScored(hr: number, hc: number): { d: Direction; blockers: number } | null {
    const scored: Array<{ d: Direction; blockers: number }> = [];
    for (const d of directions) {
      const [dr, dc] = DIR_DELTA[d];
      const nr = hr - dr, nc = hc - dc;
      if (nr >= 0 && nr < gridSize && nc >= 0 && nc < gridSize && remaining.has(nr * gridSize + nc)) {
        const blockers = countRayBlockers(hr, hc, d);
        if (blockers >= 0) scored.push({ d, blockers });
      }
    }
    if (scored.length === 0) return null;
    scored.sort((a, b) => b.blockers - a.blockers);
    if (scored[0].blockers > 0 && rng() < 0.92) return scored[0];
    return scored[Math.floor(rng() * scored.length)];
  }

  function touchesArrowBody(arrowCells: CellCoord[], nr: number, nc: number, excludeIndex = 0): boolean {
    for (let i = 0; i < arrowCells.length; i++) {
      if (i === excludeIndex) continue;
      if (Math.abs(arrowCells[i].r - nr) + Math.abs(arrowCells[i].c - nc) === 1) return true;
    }
    return false;
  }

  function growSnake(hr: number, hc: number, chosenDir: Direction, targetLen: number): CellCoord[] {
    const [dr, dc] = DIR_DELTA[chosenDir];
    const neck = { r: hr - dr, c: hc - dc };
    const snake = [neck, { r: hr, c: hc }];
    const snakeSet = new Set<number>([neck.r * gridSize + neck.c, hr * gridSize + hc]);
    let tail = neck;
    let backDr = neck.r - hr;
    let backDc = neck.c - hc;

    while (snake.length < targetLen) {
      const options: Array<{ r: number; c: number; dr: number; dc: number; isStraight: boolean; deg: number }> = [];
      for (const d of directions) {
        const [stepDr, stepDc] = DIR_DELTA[d];
        if (stepDr === -backDr && stepDc === -backDc) continue;
        const nr = tail.r + stepDr;
        const nc = tail.c + stepDc;
        if (nr >= 0 && nr < gridSize && nc >= 0 && nc < gridSize) {
          const idx = nr * gridSize + nc;
          if (remaining.has(idx) && !snakeSet.has(idx)) {
            let touchesSelf = false;
            let deg = 0;
            for (const d2 of directions) {
              const [fDr, fDc] = DIR_DELTA[d2];
              const adjR = nr + fDr, adjC = nc + fDc;
              if (adjR >= 0 && adjR < gridSize && adjC >= 0 && adjC < gridSize) {
                const adjIdx = adjR * gridSize + adjC;
                if (snakeSet.has(adjIdx) && (adjR !== tail.r || adjC !== tail.c)) {
                  touchesSelf = true; break;
                }
                if (remaining.has(adjIdx) && !snakeSet.has(adjIdx)) deg++;
              }
            }
            if (!touchesSelf) {
              options.push({ r: nr, c: nc, dr: stepDr, dc: stepDc, isStraight: stepDr === backDr && stepDc === backDc, deg });
            }
          }
        }
      }
      if (options.length === 0) break;
      const alive = options.filter(o => o.deg > 0);
      const pool = alive.length > 0 ? alive : options;
      pool.sort((a, b) => a.deg - b.deg);
      let chosen = pool[0];
      if (rng() >= 0.45) {
        const turns = pool.filter(o => !o.isStraight);
        const straights = pool.filter(o => o.isStraight);
        chosen = (turns.length > 0 && (straights.length === 0 || rng() < difficulty.turnChance))
          ? turns[Math.floor(rng() * turns.length)]
          : (straights[0] || turns[0]);
      }
      snake.unshift({ r: chosen.r, c: chosen.c });
      snakeSet.add(chosen.r * gridSize + chosen.c);
      tail = { r: chosen.r, c: chosen.c };
      backDr = chosen.dr;
      backDc = chosen.dc;
    }
    return snake;
  }

  function runSnakePass(minLen: number, minTarget: number, maxTarget: number, maxAttempts: number) {
    let attempts = 0;
    while (remaining.size > 0 && attempts < maxAttempts) {
      attempts++;
      const arr = Array.from(remaining);
      const sampleCount = arrows.length < 4 ? 1 : 8;
      let bestPick: { hr: number; hc: number; d: Direction; blockers: number } | null = null;
      for (let s = 0; s < sampleCount; s++) {
        const startIdx = arr[Math.floor(rng() * arr.length)];
        const hr = Math.floor(startIdx / gridSize);
        const hc = startIdx % gridSize;
        const pick = pickDirectionScored(hr, hc);
        if (pick && (!bestPick || pick.blockers > bestPick.blockers)) {
          bestPick = { hr, hc, d: pick.d, blockers: pick.blockers };
          if (bestPick.blockers >= 2) break;
        }
      }
      if (!bestPick) continue;
      const targetLen = minTarget + Math.floor(rng() * (maxTarget - minTarget + 1));
      const snake = growSnake(bestPick.hr, bestPick.hc, bestPick.d, targetLen);
      if (snake.length < minLen) continue;

      const arrowIdx = arrows.length;
      for (const c of snake) {
        const idx = c.r * gridSize + c.c;
        occupied[idx] = arrowIdx;
        remaining.delete(idx);
      }
      arrows.push({
        id: `a_${levelNumber}_${arrowIdx + 1}`,
        cells: snake,
        direction: bestPick.d,
        order: arrowIdx,
        colorIndex: -1,
      });
    }
  }

  function scanRemainingPass(minLen: number, minTarget: number, maxTarget: number) {
    let madeProgress = true;
    while (madeProgress && remaining.size > 0) {
      madeProgress = false;
      const candidates = Array.from(remaining);
      for (let i = candidates.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        const tmp = candidates[i];
        candidates[i] = candidates[j];
        candidates[j] = tmp;
      }
      for (const startIdx of candidates) {
        if (!remaining.has(startIdx)) continue;
        const hr = Math.floor(startIdx / gridSize);
        const hc = startIdx % gridSize;
        const pick = pickDirectionScored(hr, hc);
        if (!pick) continue;
        const chosenDir = pick.d;
        const targetLen = minTarget + Math.floor(rng() * (maxTarget - minTarget + 1));
        const snake = growSnake(hr, hc, chosenDir, targetLen);
        if (snake.length < minLen) continue;

        const arrowIdx = arrows.length;
        for (const c of snake) {
          const idx = c.r * gridSize + c.c;
          occupied[idx] = arrowIdx;
          remaining.delete(idx);
        }
        arrows.push({
          id: `a_${levelNumber}_${arrowIdx + 1}`,
          cells: snake,
          direction: chosenDir,
          order: arrowIdx,
          colorIndex: -1,
        });
        madeProgress = true;
      }
    }
  }

  function extendTails() {
    let changed = true;
    while (changed && remaining.size > 0) {
      changed = false;
      for (let k = 0; k < arrows.length; k++) {
        const arr = arrows[k];
        const tail = arr.cells[0];
        for (const d of directions) {
          const [dr, dc] = DIR_DELTA[d];
          const nr = tail.r + dr, nc = tail.c + dc;
          if (nr >= 0 && nr < gridSize && nc >= 0 && nc < gridSize) {
            const idx = nr * gridSize + nc;
            if (remaining.has(idx) && !touchesArrowBody(arr.cells, nr, nc, 0)) {
              // Check if (nr, nc) is in forward ray of any earlier arrow
              let inRay = false;
              for (let j = 0; j <= k; j++) {
                const head = arrows[j].cells[arrows[j].cells.length - 1];
                const [hdr, hdc] = DIR_DELTA[arrows[j].direction];
                let rr = head.r + hdr, cc = head.c + hdc;
                while (rr >= 0 && rr < gridSize && cc >= 0 && cc < gridSize) {
                  if (rr === nr && cc === nc) { inRay = true; break; }
                  rr += hdr; cc += hdc;
                }
                if (inRay) break;
              }
              if (!inRay) {
                arr.cells.unshift({ r: nr, c: nc });
                occupied[idx] = k;
                remaining.delete(idx);
                changed = true;
                break;
              }
            }
          }
        }
      }
    }
  }

  const cellCount = playableCells.length;
  if (cellCount < 820) {
    // Compact silhouettes: medium-long winding snakes so arrow count stays comfortably > 60 with 0 stubs
    runSnakePass(6, 8, 14, 2000);
    extendTails();
    scanRemainingPass(5, 7, 12);
    extendTails();
    scanRemainingPass(4, 5, 9);
    extendTails();
  } else if (cellCount < 1150) {
    // Medium silhouettes: lengthy winding snakes + dense interlocking coverage
    runSnakePass(8, 12, 20, 2000);
    extendTails();
    scanRemainingPass(6, 9, 16);
    extendTails();
    scanRemainingPass(4, 6, 12);
    extendTails();
  } else {
    // Large silhouettes: long sweeping serpentine arrows
    runSnakePass(10, 15, 28, 2000);
    extendTails();
    scanRemainingPass(6, 12, 22);
    extendTails();
    scanRemainingPass(4, 8, 16);
    extendTails();
  }

  // Build actualMask and actualCells strictly from arrow cells so EVERY dot is covered by an arrow!
  // Zero empty dots anywhere!
  const actualMask = Array.from({ length: gridSize }, () => Array(gridSize).fill(false));
  const actualCells: CellCoord[] = [];
  for (const a of arrows) {
    for (const c of a.cells) {
      if (!actualMask[c.r][c.c]) {
        actualMask[c.r][c.c] = true;
        actualCells.push(c);
      }
    }
  }

  assignColors(arrows, gridSize, rng);

  let totalLen = 0;
  arrows.forEach((a) => (totalLen += a.cells.length));
  const avgLength = arrows.length > 0 ? totalLen / arrows.length : 0;

  const candidate: LevelConfig = {
    levelNumber,
    collectionId: collection.id,
    shapeName: shapeDef.name,
    gridSize,
    playableMask: actualMask,
    playableCells: actualCells,
    arrows,
    solutionOrder: arrows.map((a) => a.id),
    stats: {
      depth: 0,
      initialFreeCount: 0,
      coveragePct: 100,
      trapPct: 0,
      avgLength,
    },
  };

  const analysis = analyzeLevelSolvability(arrows, gridSize);
  candidate.stats.depth = analysis.depth;
  candidate.stats.initialFreeCount = analysis.initialFreeCount;
  candidate.stats.trapPct = analysis.trapPct;

  return candidate;
}

export function validateLevel(level: LevelConfig): boolean {
  // Enforce >60 arrows per level and valid level bounds (1–500).
  if (!level || !level.arrows || level.arrows.length <= 60 || !level.shapeName || level.levelNumber < 1 || level.levelNumber > 500) return false;
  const gridSize = level.gridSize;
  const owner = new Int16Array(gridSize * gridSize);
  owner.fill(-1);

  for (let i = 0; i < level.arrows.length; i++) {
    const arrow = level.arrows[i];
    if (!arrow.cells || arrow.cells.length < 4) return false;
    for (let j = 1; j < arrow.cells.length; j++) {
      const a = arrow.cells[j - 1];
      const b = arrow.cells[j];
      const dr = Math.abs(a.r - b.r);
      const dc = Math.abs(a.c - b.c);
      if (dr + dc !== 1) return false;
      const cellIdx = b.r * gridSize + b.c;
      if (owner[cellIdx] >= 0) return false;
      owner[cellIdx] = i;
    }
    const firstCell = arrow.cells[0];
    const firstCellIdx = firstCell.r * gridSize + firstCell.c;
    if (owner[firstCellIdx] >= 0 && owner[firstCellIdx] !== i) return false;
    owner[firstCellIdx] = i;

    const head = arrow.cells[arrow.cells.length - 1];
    const prev = arrow.cells[arrow.cells.length - 2];
    const expectedDir = getDirFromDelta(head.r - prev.r, head.c - prev.c);
    if (arrow.direction !== expectedDir) return false;
  }

  const analysis = analyzeLevelSolvability(level.arrows, gridSize);
  if (!analysis.solvable) return false;
  if (level.solutionOrder.length !== level.arrows.length) return false;
  if (new Set(level.solutionOrder).size !== level.arrows.length) return false;
  // Verify that the generated mask represents every occupied cell and no stray cells.
  let occupiedCount = 0;
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const occupied = owner[r * gridSize + c] >= 0;
      if (occupied) occupiedCount++;
      if (Boolean(level.playableMask[r]?.[c]) !== occupied) return false;
    }
  }
  if (occupiedCount !== level.playableCells.length) return false;
  return true;
}

const levelCache = new Map<number, LevelConfig>();

export function getLevel(
  levelNumber: number,
  options: { maxAttempts?: number; timeBudgetMs?: number } = {}
): LevelConfig {
  const safeLevel = Math.max(1, Math.min(500, Math.floor(levelNumber)));
  if (levelCache.has(safeLevel)) return levelCache.get(safeLevel)!;

  let bestCandidate: LevelConfig | null = null;
  const maxAttempts = options.maxAttempts ?? 20;
  let validFound = 0;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const candidate = buildSingleLevelCandidate(safeLevel, safeLevel * 7919 + attempt * 101);
    if (candidate && validateLevel(candidate)) {
      validFound++;
      if (!bestCandidate || candidate.stats.depth > bestCandidate.stats.depth) {
        bestCandidate = candidate;
      }
      // Evaluate 2 valid candidates when quick, keeping the deeper more interlocking puzzle.
      if (validFound >= 2 || bestCandidate.stats.depth >= 14) {
        levelCache.set(safeLevel, bestCandidate);
        return bestCandidate;
      }
    }
  }

  if (bestCandidate) {
    levelCache.set(safeLevel, bestCandidate);
    return bestCandidate;
  }

  // Never ship an invalid fallback puzzle: fail visibly so QA can catch and fix the seed.
  throw new Error(`Unable to generate a valid puzzle for level ${safeLevel} within ${maxAttempts} attempts`);
}
