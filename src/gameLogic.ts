/**
 * Arrow Bloom - Game Logic Rules (Ray Casting, Touch Tolerance, Scoring & Combo)
 */
import { ArrowData, CellCoord } from './types.ts';

export interface RayResult {
  isFree: boolean;
  blockingArrowId?: string;
  rayCells: CellCoord[];
}

/**
 * Checks whether an arrow has a completely unobstructed ray to escape off the board.
 * Correctly checks that other arrows block the ray (an arrow's own body does not block its escape).
 */
export function checkArrowRay(
  arrowId: string,
  allArrows: ArrowData[],
  gridSize: number
): RayResult {
  const target = allArrows.find((arrow) => arrow.id === arrowId);
  if (!target) return { isFree: false, rayCells: [] };

  const owner = new Int16Array(gridSize * gridSize);
  owner.fill(-1);
  for (let i = 0; i < allArrows.length; i++) {
    const arrow = allArrows[i];
    for (let j = 0; j < arrow.cells.length; j++) {
      const cell = arrow.cells[j];
      owner[cell.r * gridSize + cell.c] = i;
    }
  }

  const head = target.cells[target.cells.length - 1];
  const [dr, dc] = target.direction === 'up' ? [-1, 0] : target.direction === 'down' ? [1, 0] : target.direction === 'left' ? [0, -1] : [0, 1];
  let r = head.r + dr;
  let c = head.c + dc;

  while (r >= 0 && r < gridSize && c >= 0 && c < gridSize) {
    const occupant = owner[r * gridSize + c];
    if (occupant >= 0 && allArrows[occupant].id !== arrowId) {
      const rayCells: CellCoord[] = [];
      let rr = head.r + dr; let cc = head.c + dc;
      while (rr >= 0 && rr < gridSize && cc >= 0 && cc < gridSize) {
        rayCells.push({ r: rr, c: cc }); rr += dr; cc += dc;
      }
      return { isFree: false, blockingArrowId: allArrows[occupant].id, rayCells };
    }
    r += dr; c += dc;
  }
  return { isFree: true, rayCells: [] };
}

/**
 * Finds a free arrow for Hint
 */
export function getHintArrow(
  currentArrows: ArrowData[],
  solutionOrder: string[],
  gridSize: number
): ArrowData | null {
  if (currentArrows.length === 0) return null;

  for (const solId of solutionOrder) {
    const arrow = currentArrows.find((a) => a.id === solId);
    if (arrow) {
      const { isFree } = checkArrowRay(arrow.id, currentArrows, gridSize);
      if (isFree) return arrow;
    }
  }

  for (const arrow of currentArrows) {
    const { isFree } = checkArrowRay(arrow.id, currentArrows, gridSize);
    if (isFree) return arrow;
  }

  return null;
}

/**
 * Star rating based on mistakes
 */
export function calculateStars(mistakes: number): number {
  if (mistakes <= 0) return 3;
  if (mistakes === 1) return 2;
  return 1;
}

/**
 * Computes score earned: 10 per cell + combo bonus
 */
export function computeArrowScore(cellCount: number, comboCount: number): number {
  const base = cellCount * 10;
  const comboBonus = comboCount > 1 ? (comboCount - 1) * 30 : 0;
  return base + comboBonus;
}
