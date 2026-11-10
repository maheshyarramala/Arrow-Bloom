import { getLevel } from '../src/levelGenerator.ts';
import { calculateStars, computeArrowScore, checkArrowRay, getHintArrow } from '../src/gameLogic.ts';
import type { ArrowData } from '../src/types.ts';

const levels = [1, 12, 30, 50];
for (const levelNumber of levels) {
  const started = performance.now();
  const level = getLevel(levelNumber, { maxAttempts: 20, timeBudgetMs: 400 });
  const elapsed = performance.now() - started;
  if (!level.arrows.length) throw new Error(`Level ${levelNumber} generated no arrows`);
  if (level.gridSize > 34) throw new Error(`Level ${levelNumber} grid exceeds 34`);
  if (level.stats.depth <= 0) throw new Error(`Level ${levelNumber} has no solution depth`);
  if (level.solutionOrder.length !== level.arrows.length) throw new Error(`Level ${levelNumber} solution order is incomplete`);
  if (elapsed > 500) throw new Error(`Level ${levelNumber} took ${Math.round(elapsed)}ms (limit 500ms)`);
}

if (calculateStars(0) !== 3 || calculateStars(1) !== 2 || calculateStars(2) !== 1) {
  throw new Error('Star calculation regression');
}
if (computeArrowScore(5, 1) !== 50 || computeArrowScore(5, 2) !== 80) {
  throw new Error('Score calculation regression');
}

const testArrows: ArrowData[] = [
  { id: 'a', cells: [{ r: 1, c: 1 }, { r: 1, c: 2 }], direction: 'right', colorIndex: 0, order: 0 },
  { id: 'b', cells: [{ r: 1, c: 4 }, { r: 1, c: 5 }], direction: 'right', colorIndex: 1, order: 1 },
];
if (checkArrowRay('a', testArrows, 8).isFree) throw new Error('Ray check failed to detect a blocker');
if (!checkArrowRay('b', testArrows, 8).isFree) throw new Error('Ray check incorrectly blocked a free arrow');
if (!getHintArrow(testArrows, ['b', 'a'], 8)) throw new Error('Hint selection failed');
