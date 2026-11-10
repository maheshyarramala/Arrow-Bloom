/**
 * Arrow Bloom - Game Logic Rules (Ray Casting, Touch Tolerance, Scoring & Combo)
 */
import { ArrowData, CellCoord } from './types.ts';
import { getRayCells } from './levelGenerator.ts';

export interface RayResult {
  isFree: boolean;
  blockingArrowId?: string;
  rayCells: CellCoord[];
}

/**
 * Checks whether an arrow has a completely unobstructed ray to escape off the board.
 */
export function checkArrowRay(
  arrowId: string,
  allArrows: ArrowData[],
  gridSize: number
): RayResult {
  const arrow = allArrows.find((a) => a.id === arrowId);
  if (!arrow) {
    return { isFree: false, rayCells: [] };
  }

  const head = arrow.cells[arrow.cells.length - 1];
  const ray = getRayCells(head, arrow.direction, gridSize);

  // Map occupied cells
  const cellToArrowId = new Map<string, string>();
  for (const other of allArrows) {
    if (other.id === arrowId) continue;
    for (const cell of other.cells) {
      cellToArrowId.set(`${cell.r},${cell.c}`, other.id);
    }
  }

  // Check each cell along ray
  for (const cell of ray) {
    const occupant = cellToArrowId.get(`${cell.r},${cell.c}`);
    if (occupant) {
      return {
        isFree: false,
        blockingArrowId: occupant,
        rayCells: ray,
      };
    }
  }

  return {
    isFree: true,
    rayCells: ray,
  };
}

/**
 * Maps tapped coordinate to an arrow id with 4-neighborhood touch tolerance
 */
export function findTappedArrowId(
  targetR: number,
  targetC: number,
  arrows: ArrowData[],
  gridSize: number
): string | null {
  const cellToArrow = new Map<string, string>();
  for (const arrow of arrows) {
    for (const cell of arrow.cells) {
      cellToArrow.set(`${cell.r},${cell.c}`, arrow.id);
    }
  }

  // Direct hit
  const direct = cellToArrow.get(`${targetR},${targetC}`);
  if (direct) return direct;

  // 4 neighboring cells tolerance
  const deltas = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  for (const [dr, dc] of deltas) {
    const nr = targetR + dr;
    const nc = targetC + dc;
    if (nr >= 0 && nr < gridSize && nc >= 0 && nc < gridSize) {
      const neighbor = cellToArrow.get(`${nr},${nc}`);
      if (neighbor) return neighbor;
    }
  }

  return null;
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

  // Check in solution order first
  for (const solId of solutionOrder) {
    const arrow = currentArrows.find((a) => a.id === solId);
    if (arrow) {
      const { isFree } = checkArrowRay(arrow.id, currentArrows, gridSize);
      if (isFree) return arrow;
    }
  }

  // Fallback to any free
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
