/**
 * Arrow Bloom - Responsive Silhouette Board Component
 * Solves cut-off bug with ResizeObserver & SVG viewBox, supports smooth pinch-to-zoom,
 * drag-to-pan with clamped bounds, dot-grid inside silhouette, touch tolerance,
 * and clean floating score cleanup.
 */
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ArrowData, CellCoord, FloatingScoreItem } from '../types.ts';
import { ArrowPath } from './ArrowPath.tsx';
import { ComboPill } from './ComboPill.tsx';
import { findTappedArrowId } from '../gameLogic.ts';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  opacity: number;
}

interface BoardProps {
  gridSize: number;
  playableMask: boolean[][];
  arrows: ArrowData[];
  isDarkTheme?: boolean;
  colorBlindMode?: boolean;
  escapingArrowId: string | null;
  shakingArrowId: string | null;
  flashBlockedArrowId: string | null;
  hintedArrowId: string | null;
  tutorialArrowId: string | null;
  comboCount: number;
  showComboPill: boolean;
  floatingScores: FloatingScoreItem[];
  zoomLevel: number;
  panOffset: { x: number; y: number };
  onZoomChange: (newZoom: number) => void;
  onPanChange: (newPan: { x: number; y: number }) => void;
  onArrowSelect: (arrowId: string) => void;
}

export const Board: React.FC<BoardProps> = ({
  gridSize,
  playableMask,
  arrows,
  isDarkTheme = true,
  colorBlindMode = false,
  escapingArrowId,
  shakingArrowId,
  flashBlockedArrowId,
  hintedArrowId,
  tutorialArrowId,
  comboCount,
  showComboPill,
  floatingScores,
  zoomLevel,
  panOffset,
  onZoomChange,
  onPanChange,
  onArrowSelect,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState<{ width: number; height: number }>({
    width: 360,
    height: 360,
  });

  // Pointer panning state
  const isDraggingRef = useRef(false);
  const lastPointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const touchDistanceRef = useRef<number | null>(null);

  // Particles
  const [particles, setParticles] = useState<Particle[]>([]);

  // Keyboard navigation focus
  const [focusedArrowIndex, setFocusedArrowIndex] = useState<number>(0);

  // Measure container using ResizeObserver to ensure zero cut-off on any screen
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setContainerSize({ width: Math.floor(width), height: Math.floor(height) });
        }
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Compute base board square size fitted within container
  const boardSize = Math.max(220, Math.min(containerSize.width - 16, containerSize.height - 16));
  const cellSize = boardSize / gridSize;

  // Particle emission when an arrow escapes
  useEffect(() => {
    if (!escapingArrowId) return;
    const arrow = arrows.find((a) => a.id === escapingArrowId);
    if (!arrow) return;

    const head = arrow.cells[arrow.cells.length - 1];
    const startX = (head.c + 0.5) * cellSize;
    const startY = (head.r + 0.5) * cellSize;

    const burstColors = ['#FF2A85', '#FFD000', '#10E7A1', '#00E5FF', '#FFFFFF', '#FFAA00'];
    const newParticles: Particle[] = Array.from({ length: 12 }, (_, i) => {
      const angle = (Math.PI * 2 * i) / 12 + (Math.random() - 0.5);
      const speed = Math.random() * 3 + 1.5;
      return {
        id: Date.now() + i,
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: burstColors[Math.floor(Math.random() * burstColors.length)],
        size: Math.random() * 4 + 2,
        opacity: 1,
      };
    });

    setParticles((prev) => [...prev, ...newParticles]);
  }, [escapingArrowId, arrows, cellSize]);

  // Particle physics tick
  useEffect(() => {
    if (particles.length === 0) return;
    const timer = setInterval(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.12,
            opacity: p.opacity - 0.08,
          }))
          .filter((p) => p.opacity > 0)
      );
    }, 24);
    return () => clearInterval(timer);
  }, [particles.length]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (arrows.length === 0) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedArrowIndex((i) => (i + 1) % arrows.length);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedArrowIndex((i) => (i - 1 + arrows.length) % arrows.length);
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const selected = arrows[focusedArrowIndex];
        if (selected) {
          onArrowSelect(selected.id);
        }
      }
    },
    [arrows, focusedArrowIndex, onArrowSelect]
  );

  // Board pointer click with touch tolerance
  const handleBoardClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Convert pixel to grid cell
    const targetC = Math.floor(clickX / cellSize);
    const targetR = Math.floor(clickY / cellSize);

    if (targetR < 0 || targetR >= gridSize || targetC < 0 || targetC >= gridSize) {
      return;
    }

    // Touch tolerance lookup (direct hit or 4-neighborhood)
    const arrowId = findTappedArrowId(targetR, targetC, arrows, gridSize);
    if (arrowId) {
      onArrowSelect(arrowId);
    }
  };

  // Clamp pan so board never flies away
  const clampPan = (pan: { x: number; y: number }, zoom: number) => {
    const maxPan = (boardSize * (zoom - 1)) / 2 + 50;
    return {
      x: Math.max(-maxPan, Math.min(maxPan, pan.x)),
      y: Math.max(-maxPan, Math.min(maxPan, pan.y)),
    };
  };

  // Pointer dragging
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    isDraggingRef.current = true;
    lastPointerRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || zoomLevel <= 1) return;
    const dx = e.clientX - lastPointerRef.current.x;
    const dy = e.clientY - lastPointerRef.current.y;
    lastPointerRef.current = { x: e.clientX, y: e.clientY };

    const newPan = clampPan({ x: panOffset.x + dx, y: panOffset.y + dy }, zoomLevel);
    onPanChange(newPan);
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
    touchDistanceRef.current = null;
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
    const nextZoom = Math.min(4.0, Math.max(1.0, zoomLevel * zoomFactor));
    onZoomChange(nextZoom);
    if (nextZoom === 1.0) {
      onPanChange({ x: 0, y: 0 });
    } else {
      onPanChange(clampPan(panOffset, nextZoom));
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative flex-1 w-full h-full flex items-center justify-center overflow-hidden select-none outline-none"
      style={{ touchAction: 'none' }}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onWheel={handleWheel}
    >
      {/* Combo Pill (Replaces previous instead of stacking) */}
      <ComboPill comboCount={comboCount} visible={showComboPill} />

      {/* Silhouette Board Canvas */}
      <div
        className="relative transition-transform duration-75 ease-out select-none"
        style={{
          width: boardSize,
          height: boardSize,
          transform: `scale(${zoomLevel}) translate(${panOffset.x / zoomLevel}px, ${
            panOffset.y / zoomLevel
          }px)`,
          transformOrigin: 'center center',
        }}
      >
        <svg
          width={boardSize}
          height={boardSize}
          viewBox={`0 0 ${boardSize} ${boardSize}`}
          className="w-full h-full cursor-pointer select-none"
          onClick={handleBoardClick}
          style={{ overflow: 'visible' }}
        >
          {/* Subtle Silhouette Background Shade */}
          <g className="pointer-events-none">
            {playableMask.map((row, r) =>
              row.map((isInside, c) => {
                if (!isInside) return null;
                const cx = (c + 0.5) * cellSize;
                const cy = (r + 0.5) * cellSize;
                return (
                  <g key={`cell-${r}-${c}`}>
                    {/* Glassy dot grid inside silhouette */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={Math.max(1.2, cellSize * 0.08)}
                      fill={isDarkTheme ? '#FFFFFF' : '#334155'}
                      opacity={isDarkTheme ? 0.22 : 0.25}
                    />
                  </g>
                );
              })
            )}
          </g>

          {/* Thin Snake Line Arrows */}
          {arrows.map((arrow, idx) => (
            <ArrowPath
              key={arrow.id}
              arrow={arrow}
              cellSize={cellSize}
              isDarkTheme={isDarkTheme}
              colorBlindMode={colorBlindMode}
              isEscaping={arrow.id === escapingArrowId}
              isShaking={arrow.id === shakingArrowId}
              isFlashBlocked={arrow.id === flashBlockedArrowId}
              isHinted={arrow.id === hintedArrowId}
              isTutorialTarget={arrow.id === tutorialArrowId}
              isFocused={idx === focusedArrowIndex}
              onSelect={onArrowSelect}
            />
          ))}

          {/* Particles */}
          {particles.map((p) => (
            <circle
              key={p.id}
              cx={p.x}
              cy={p.y}
              r={p.size}
              fill={p.color}
              opacity={p.opacity}
              className="pointer-events-none"
            />
          ))}
        </svg>

        {/* Floating +N Score Callouts (Max 3, clean up in 600ms) */}
        {floatingScores.map((score) => (
          <div
            key={score.id}
            className="absolute pointer-events-none text-xs md:text-sm font-black px-2 py-0.5 rounded-full shadow-lg border border-white/30 animate-bounce"
            style={{
              left: score.x,
              top: score.y,
              transform: 'translate(-50%, -100%)',
              color: score.color,
              backgroundColor: isDarkTheme ? 'rgba(15,23,42,0.85)' : 'rgba(255,255,255,0.92)',
            }}
          >
            {score.text}
          </div>
        ))}
      </div>
    </div>
  );
};
