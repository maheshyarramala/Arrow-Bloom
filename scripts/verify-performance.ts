import { getLevel, analyzeLevelSolvability, getLevelParams, getDifficultyProfile, COLLECTIONS } from '../src/levelGenerator.ts';
import { SHAPE_DEFINITIONS } from '../src/shapes.ts';
import { calculateStars, computeArrowScore, checkArrowRay, getHintArrow } from '../src/gameLogic.ts';
import type { ArrowData } from '../src/types.ts';

const startedAll = performance.now();
const seenShapeWorlds = new Set<number>();
let totalArrows = 0;
let maxGrid = 0;
let maxGenerationMs = 0;
let previousTierDepth = 0;
const tierDepths: number[] = [];

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

assert(COLLECTIONS.length === 50, `Expected 50 collections, got ${COLLECTIONS.length}`);
assert(Object.keys(SHAPE_DEFINITIONS).length >= 500, 'All 500 levels must have a registered silhouette');
assert(new Set(Array.from({ length: 500 }, (_, i) => SHAPE_DEFINITIONS[i + 1]?.name)).size === 500,
  'Each of the 500 levels must have a distinct silhouette name');
const tierSamples = [1, 11, 51, 101, 181, 251, 351, 431].map(getDifficultyProfile);
assert(tierSamples.map(t => t.turnChance).every((v, i, a) => i === 0 || v > a[i - 1]),
  'Difficulty turn complexity must increase at each tier');
assert(tierSamples.map(t => t.gridSize).every((v, i, a) => i === 0 || v > a[i - 1]),
  'Difficulty board size must increase at each tier');
assert(COLLECTIONS.every((collection, index) =>
  collection.id === index + 1 &&
  collection.levels.length === 10 &&
  collection.levels.every((level, i) => level === index * 10 + i + 1)
), 'Collection mapping must cover levels 1–500 exactly once');

for (let levelNumber = 1; levelNumber <= 500; levelNumber++) {
  const started = performance.now();
  const level = getLevel(levelNumber, { maxAttempts: 20, timeBudgetMs: 1200 });
  const elapsed = performance.now() - started;
  maxGenerationMs = Math.max(maxGenerationMs, elapsed);
  assert(level.levelNumber === levelNumber, `Level identity mismatch at ${levelNumber}`);
  assert(level.arrows.length > 60, `Level ${levelNumber} generated only ${level.arrows.length} arrows (must be > 60)`);
  assert(level.gridSize >= 1 && level.gridSize <= 76, `Level ${levelNumber} grid out of bounds`);
  assert(level.playableMask.length === level.gridSize, `Level ${levelNumber} mask height mismatch`);
  assert(level.playableMask.every(row => row.length === level.gridSize), `Level ${levelNumber} mask width mismatch`);
  assert(level.stats.depth > 0, `Level ${levelNumber} has no solution depth`);
  assert(level.solutionOrder.length === level.arrows.length, `Level ${levelNumber} solution order incomplete`);
  assert(new Set(level.solutionOrder).size === level.arrows.length, `Level ${levelNumber} solution order has duplicates`);

  const occupied = new Map<string, string>();
  for (const arrow of level.arrows) {
    assert(arrow.cells.length >= 4, `Level ${levelNumber} arrow ${arrow.id} is too short`);
    for (let i = 0; i < arrow.cells.length; i++) {
      const cell = arrow.cells[i];
      assert(Number.isInteger(cell.r) && Number.isInteger(cell.c), `Level ${levelNumber} has non-integer cell`);
      assert(cell.r >= 0 && cell.r < level.gridSize && cell.c >= 0 && cell.c < level.gridSize,
        `Level ${levelNumber} arrow ${arrow.id} leaves grid`);
      assert(level.playableMask[cell.r][cell.c], `Level ${levelNumber} arrow ${arrow.id} leaves silhouette`);
      const key = `${cell.r},${cell.c}`;
      assert(!occupied.has(key), `Level ${levelNumber} overlap at ${key}`);
      occupied.set(key, arrow.id);
      if (i > 0) {
        const distance = Math.abs(cell.r - arrow.cells[i - 1].r) + Math.abs(cell.c - arrow.cells[i - 1].c);
        assert(distance === 1, `Level ${levelNumber} arrow ${arrow.id} has a non-adjacent segment`);
      }
    }
    const head = arrow.cells[arrow.cells.length - 1];
    const before = arrow.cells[arrow.cells.length - 2];
    const dr = head.r - before.r;
    const dc = head.c - before.c;
    const expected = dr === -1 ? 'up' : dr === 1 ? 'down' : dc === -1 ? 'left' : 'right';
    assert(arrow.direction === expected, `Level ${levelNumber} arrow ${arrow.id} head direction mismatch`);
  }

  const analysis = analyzeLevelSolvability(level.arrows, level.gridSize);
  assert(analysis.solvable, `Level ${levelNumber} fails independent solvability analysis`);
  assert(analysis.depth === level.stats.depth, `Level ${levelNumber} depth metric mismatch`);

  // Replay the advertised solution order against live ray checks.
  let remaining: ArrowData[] = [...level.arrows];
  for (const arrowId of level.solutionOrder) {
    const ray = checkArrowRay(arrowId, remaining, level.gridSize);
    assert(ray.isFree, `Level ${levelNumber} solution order is blocked at arrow ${arrowId}`);
    remaining = remaining.filter(arrow => arrow.id !== arrowId);
  }
  assert(remaining.length === 0, `Level ${levelNumber} solution replay did not clear board`);

  const params = getLevelParams(levelNumber);
  assert(params.collection.id === Math.floor((levelNumber - 1) / 10) + 1,
    `Level ${levelNumber} assigned to wrong collection`);
  seenShapeWorlds.add(params.collection.id);
  totalArrows += level.arrows.length;
  maxGrid = Math.max(maxGrid, level.gridSize);

  if (levelNumber % 10 === 0) {
    tierDepths.push(level.stats.depth);
    console.log(`Validated levels ${levelNumber - 9}–${levelNumber}: depth=${level.stats.depth}, arrows=${level.arrows.length}, grid=${level.gridSize}`);
  }
}

assert(seenShapeWorlds.size === 50, 'Not all 50 worlds were exercised');
assert(calculateStars(0) === 3 && calculateStars(1) === 2 && calculateStars(2) === 1, 'Star calculation regression');
assert(computeArrowScore(5, 1) === 50 && computeArrowScore(5, 2) === 80, 'Score calculation regression');

const testArrows: ArrowData[] = [
  { id: 'a', cells: [{ r: 1, c: 1 }, { r: 1, c: 2 }], direction: 'right', colorIndex: 0, order: 0 },
  { id: 'b', cells: [{ r: 1, c: 4 }, { r: 1, c: 5 }], direction: 'right', colorIndex: 1, order: 1 },
];
assert(!checkArrowRay('a', testArrows, 8).isFree, 'Ray check failed to detect a blocker');
assert(checkArrowRay('b', testArrows, 8).isFree, 'Ray check incorrectly blocked a free arrow');
assert(getHintArrow(testArrows, ['b', 'a'], 8), 'Hint selection failed');

console.log(`PASS: all 500 levels; ${totalArrows} arrows; max grid ${maxGrid}; max generation ${Math.round(maxGenerationMs)}ms; total ${Math.round(performance.now() - startedAll)}ms`);
