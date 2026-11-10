/**
 * Arrow Bloom - Thin Snake Line Arrow Component
 * Renders a thin glowing snake line with an attached solid arrowhead of identical color
 * (NO white outline, NO floating triangle), soft glow on dark theme, and escape animation.
 */
import React, { useMemo } from 'react';
import { ArrowData } from '../types.ts';
import { PALETTE, COLOR_BLIND_SYMBOLS, DIR_DELTA } from '../levelGenerator.ts';

interface ArrowPathProps {
  arrow: ArrowData;
  cellSize: number;
  isDarkTheme?: boolean;
  colorBlindMode?: boolean;
  isEscaping?: boolean;
  isShaking?: boolean;
  isFlashBlocked?: boolean;
  isHinted?: boolean;
  isTutorialTarget?: boolean;
  isFocused?: boolean;
  onSelect: (arrowId: string) => void;
}

export const ArrowPath: React.FC<ArrowPathProps> = React.memo(({
  arrow,
  cellSize,
  isDarkTheme = true,
  colorBlindMode = false,
  isEscaping = false,
  isShaking = false,
  isFlashBlocked = false,
  isHinted = false,
  isTutorialTarget = false,
  isFocused = false,
  onSelect,
}) => {
  const color = PALETTE[arrow.colorIndex % PALETTE.length] || '#FF2A85';
  const symbol = COLOR_BLIND_SYMBOLS[arrow.colorIndex % COLOR_BLIND_SYMBOLS.length];

  const headCell = arrow.cells[arrow.cells.length - 1];
  const [dr, dc] = DIR_DELTA[arrow.direction];

  // SVG Polyline Path through cell centers
  const bodyPath = useMemo(() => {
    if (arrow.cells.length === 0) return '';
    return arrow.cells.reduce((acc, cell, i) => {
      const x = (cell.c + 0.5) * cellSize;
      const y = (cell.r + 0.5) * cellSize;
      return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
    }, '');
  }, [arrow.cells, cellSize]);

  // Triangular Arrowhead: seamlessly attached to the head cell, same color
  const arrowheadPoints = useMemo(() => {
    const hx = (headCell.c + 0.5) * cellSize;
    const hy = (headCell.r + 0.5) * cellSize;

    const dx = dc;
    const dy = dr;
    const px = -dy;
    const py = dx;

    // Tip points straight forward
    const tipDist = cellSize * 0.44;
    const wingDist = cellSize * 0.32;
    const baseBack = cellSize * 0.08;

    const tipX = hx + dx * tipDist;
    const tipY = hy + dy * tipDist;

    const leftX = hx - dx * baseBack + px * wingDist;
    const leftY = hy - dy * baseBack + py * wingDist;

    const rightX = hx - dx * baseBack - px * wingDist;
    const rightY = hy - dy * baseBack - py * wingDist;

    return `${tipX},${tipY} ${leftX},${leftY} ${rightX},${rightY}`;
  }, [headCell, cellSize, dc, dr]);

  // Smooth slide-out along arrow direction
  const escapeTransform = useMemo(() => {
    if (!isEscaping) return '';
    const distance = cellSize * 28;
    const tx = dc * distance;
    const ty = dr * distance;
    return `translate(${tx}px, ${ty}px)`;
  }, [isEscaping, cellSize, dc, dr]);

  // Thin line: ~0.3 of cell size
  const strokeWidth = Math.max(2.4, cellSize * 0.30);

  // Active color
  const displayColor = isFlashBlocked
    ? '#FFFFFF' // Flash white when blocked!
    : color;

  return (
    <g
      id={`arrow-${arrow.id}`}
      className={`cursor-pointer select-none outline-none transition-all duration-300 ease-out ${
        isShaking ? 'animate-shake' : ''
      } ${isHinted || isTutorialTarget ? 'animate-pulse-glow' : ''}`}
      style={{
        transform: escapeTransform,
        opacity: isEscaping ? 0 : 1,
        transitionProperty: 'transform, opacity, filter',
        transitionDuration: isEscaping ? '480ms' : '150ms',
        filter: isFlashBlocked
          ? 'drop-shadow(0 0 10px #FFFFFF) brightness(2)'
          : isHinted || isTutorialTarget
          ? 'drop-shadow(0 0 12px #FFD000) brightness(1.4)'
          : isFocused
          ? 'drop-shadow(0 0 8px #FFFFFF)'
          : isDarkTheme
          ? `drop-shadow(0 0 4px ${color}88)`
          : `drop-shadow(0 1px 2px rgba(0,0,0,0.15))`,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(arrow.id);
      }}
      tabIndex={0}
      role="button"
      aria-label={`Arrow ${arrow.id}`}
    >
      {/* Glow path underlay on dark themes */}
      {isDarkTheme && !isFlashBlocked && (
        <path
          d={bodyPath}
          fill="none"
          stroke={displayColor}
          strokeWidth={strokeWidth + 3}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.3}
          className="pointer-events-none"
        />
      )}

      {/* Main Snake Line Body */}
      <path
        d={bodyPath}
        fill="none"
        stroke={displayColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-colors duration-100"
      />

      {/* Solid Integrated Arrowhead (same color, no white border) */}
      <polygon
        points={arrowheadPoints}
        fill={displayColor}
        stroke="none"
        className="transition-colors duration-100"
      />

      {/* Color-Blind Friendly Pattern Symbols */}
      {colorBlindMode &&
        arrow.cells.map((cell, idx) => {
          // Render symbol every 2 cells or on mid cell
          if (idx % 2 !== 0 && idx !== arrow.cells.length - 1) return null;
          const cx = (cell.c + 0.5) * cellSize;
          const cy = (cell.r + 0.5) * cellSize;
          return (
            <text
              key={`cb-${cell.r}-${cell.c}-${idx}`}
              x={cx}
              y={cy + 1}
              fill="#FFFFFF"
              fontSize={Math.max(8, cellSize * 0.28)}
              fontWeight="900"
              textAnchor="middle"
              dominantBaseline="middle"
              className="pointer-events-none drop-shadow select-none font-sans"
            >
              {symbol}
            </text>
          );
        })}

      {/* Tutorial Pointer Indicator on First Free Arrow */}
      {isTutorialTarget && (
        <g
          transform={`translate(${
            (headCell.c + 0.5) * cellSize + dc * (cellSize * 0.6)
          }, ${
            (headCell.r + 0.5) * cellSize + dr * (cellSize * 0.6)
          })`}
          className="pointer-events-none animate-bounce"
        >
          <circle r={cellSize * 0.3} fill="#FEF08A" opacity={0.9} />
          <text
            x={0}
            y={2}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={Math.max(12, cellSize * 0.4)}
          >
            👆
          </text>
        </g>
      )}
    </g>
  );
});

ArrowPath.displayName = 'ArrowPath';
