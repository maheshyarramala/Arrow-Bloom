import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { ArrowData, FloatingScoreItem } from '../types.ts';
import { PALETTE, COLOR_BLIND_SYMBOLS, DIR_DELTA } from '../levelGenerator.ts';

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
  performanceMode?: boolean;
  onPerformanceModeChange?: (enabled: boolean) => void;
  onDraggingChange?: (dragging: boolean) => void;
  debugOverlay?: boolean;
  generationMs?: number;
}

interface Particle { x: number; y: number; vx: number; vy: number; life: number; color: string; size: number; active: boolean; }

const MAX_PARTICLES = 60;
const BURST_COLORS = ['#FF2A85', '#FFD000', '#10E7A1', '#00E5FF', '#FFFFFF', '#FFAA00'];

export const Board: React.FC<BoardProps> = React.memo((props) => {
  const {
    gridSize, playableMask, arrows, isDarkTheme = true, colorBlindMode = false,
    escapingArrowId, shakingArrowId, flashBlockedArrowId, hintedArrowId,
    tutorialArrowId, comboCount, showComboPill, floatingScores, zoomLevel,
    panOffset, onZoomChange, onPanChange, onArrowSelect, performanceMode = false,
  } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const staticRef = useRef<HTMLCanvasElement>(null);
  const dynamicRef = useRef<HTMLCanvasElement>(null);
  const sizeRef = useRef({ width: 360, height: 360, board: 344, dpr: 1 });
  const transformRef = useRef({ zoom: zoomLevel, x: panOffset.x, y: panOffset.y });
  const ownerRef = useRef<Int16Array>(new Int16Array(0));
  const rafRef = useRef<number>(0);
  const animationStartRef = useRef(0);
  const particlesRef = useRef<Particle[]>(Array.from({ length: MAX_PARTICLES }, () => ({ x: 0, y: 0, vx: 0, vy: 0, life: 0, color: '#FFFFFF', size: 2, active: false })));
  const frameMonitorRef = useRef({ last: 0, average: 16.7, slowSince: 0 });
  const focusedArrowIndexRef = useRef(0);
  const focusActiveRef = useRef(false);
  const pointerRef = useRef({ down: false, dragging: false, x: 0, y: 0, startX: 0, startY: 0 });
  const fpsLabelRef = useRef<HTMLDivElement>(null);
  const fpsStatsRef = useRef({ last: 0, frames: 0, badSince: 0 });
  const cellSizeRef = useRef(1);

  const arrowById = useMemo(() => new Map(arrows.map(arrow => [arrow.id, arrow])), [arrows]);

  const arrowsByColor = useMemo(() => {
    const groups: ArrowData[][] = Array.from({ length: PALETTE.length }, () => []);
    for (const arrow of arrows) groups[((arrow.colorIndex % PALETTE.length) + PALETTE.length) % PALETTE.length].push(arrow);
    return groups;
  }, [arrows]);

  const updateWrapperTransform = useCallback(() => {
    const t = transformRef.current;
    if (wrapperRef.current) {
      wrapperRef.current.style.transform = `translate(${t.x}px, ${t.y}px) scale(${t.zoom})`;
    }
  }, []);

  const resizeCanvas = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    const board = Math.max(220, Math.min(width - 16, height - 16));
    const dpr = Math.min(performanceMode ? 1.5 : 2, window.devicePixelRatio || 1);
    sizeRef.current = { width, height, board, dpr };
    cellSizeRef.current = board / gridSize;
    for (const canvas of [staticRef.current, dynamicRef.current]) {
      if (!canvas) continue;
      canvas.width = Math.round(board * dpr);
      canvas.height = Math.round(board * dpr);
      canvas.style.width = board + 'px';
      canvas.style.height = board + 'px';
    }
    if (wrapperRef.current) {
      wrapperRef.current.style.width = board + 'px';
      wrapperRef.current.style.height = board + 'px';
    }
    updateWrapperTransform();
    drawStatic();
    drawDynamic(performance.now());
  }, [gridSize, performanceMode, updateWrapperTransform]);

  const drawArrow = useCallback((
    ctx: CanvasRenderingContext2D, arrow: ArrowData, cell: number, alpha = 1,
    offsetX = 0, offsetY = 0, glow = false, white = false
  ) => {
    const color = white ? '#FFFFFF' : (PALETTE[arrow.colorIndex % PALETTE.length] || '#FF2A85');
    const cells = arrow.cells;
    if (!cells.length) return;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(2.4, cell * 0.30);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (glow && !performanceMode) {
      ctx.beginPath();
      for (let i = 0; i < cells.length; i++) {
        const x = (cells[i].c + 0.5) * cell + offsetX;
        const y = (cells[i].r + 0.5) * cell + offsetY;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.lineWidth += 3;
      ctx.globalAlpha *= 0.22;
      ctx.stroke();
      ctx.globalAlpha = alpha;
      ctx.lineWidth = Math.max(2.4, cell * 0.30);
    }
    ctx.beginPath();
    for (let i = 0; i < cells.length; i++) {
      const x = (cells[i].c + 0.5) * cell + offsetX;
      const y = (cells[i].r + 0.5) * cell + offsetY;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    const head = cells[cells.length - 1];
    const [dr, dc] = DIR_DELTA[arrow.direction];
    const hx = (head.c + 0.5) * cell + offsetX;
    const hy = (head.r + 0.5) * cell + offsetY;
    const px = -dr;
    const py = dc;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(hx + dc * cell * 0.44, hy + dr * cell * 0.44);
    ctx.lineTo(hx - dc * cell * 0.08 + px * cell * 0.32, hy - dr * cell * 0.08 + py * cell * 0.32);
    ctx.lineTo(hx - dc * cell * 0.08 - px * cell * 0.32, hy - dr * cell * 0.08 - py * cell * 0.32);
    ctx.closePath();
    ctx.fill();
    if (colorBlindMode) {
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `900 ${Math.max(8, cell * 0.28)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const symbol = COLOR_BLIND_SYMBOLS[arrow.colorIndex % COLOR_BLIND_SYMBOLS.length];
      for (let i = 0; i < cells.length; i += 2) {
        ctx.fillText(symbol, (cells[i].c + 0.5) * cell + offsetX, (cells[i].r + 0.5) * cell + offsetY + 1);
      }
    }
    ctx.restore();
  }, [colorBlindMode, performanceMode]);

  const drawStatic = useCallback(() => {
    const canvas = staticRef.current;
    if (!canvas) return;
    const { board, dpr } = sizeRef.current;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, board, board);
    const cell = board / gridSize;
    ctx.fillStyle = isDarkTheme ? 'rgba(255,255,255,0.22)' : 'rgba(51,65,85,0.25)';
    const radius = Math.max(1.2, cell * 0.08);
    for (let r = 0; r < gridSize; r++) {
      const row = playableMask[r];
      for (let c = 0; c < gridSize; c++) {
        if (row?.[c]) {
          ctx.beginPath();
          ctx.arc((c + 0.5) * cell, (r + 0.5) * cell, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    for (let color = 0; color < arrowsByColor.length; color++) {
      const group = arrowsByColor[color];
      for (let i = 0; i < group.length; i++) {
        const arrow = group[i];
        if (arrow.id !== escapingArrowId && arrow.id !== shakingArrowId) {
          drawArrow(ctx, arrow, cell, 1, 0, 0, isDarkTheme);
        }
      }
    }
  }, [gridSize, playableMask, isDarkTheme, arrowsByColor, escapingArrowId, shakingArrowId, drawArrow]);

  const drawDynamic = useCallback((now: number) => {
    const canvas = dynamicRef.current;
    if (!canvas) return;
    const { board, dpr } = sizeRef.current;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, board, board);
    const cell = board / gridSize;
    let active = false;
    const monitor = frameMonitorRef.current;
    if (monitor.last) {
      const delta = now - monitor.last;
      monitor.average = monitor.average * 0.9 + delta * 0.1;
      if (monitor.average > 28) {
        if (!monitor.slowSince) monitor.slowSince = now;
        if (now - monitor.slowSince > 2000 && !performanceMode) onPerformanceModeChange?.(true);
      } else monitor.slowSince = 0;
    }
    monitor.last = now;
    if (debugOverlay) {
      const stats = fpsStatsRef.current;
      stats.frames++;
      if (stats.last && now - stats.last >= 500) {
        const fps = Math.round(stats.frames * 1000 / (now - stats.last));
        if (fpsLabelRef.current) fpsLabelRef.current.textContent = `${fps} FPS · Gen ${generationMs} ms`;
        stats.frames = 0; stats.last = now;
      } else if (!stats.last) stats.last = now;
    }
    if (escapingArrowId) {
      const arrow = arrowById.get(escapingArrowId);
      if (arrow) {
        const elapsed = Math.max(0, now - animationStartRef.current);
        const progress = Math.min(1, elapsed / 450);
        const [dr, dc] = DIR_DELTA[arrow.direction];
        drawArrow(ctx, arrow, cell, 1 - progress, dc * cell * 28 * progress, dr * cell * 28 * progress);
        active ||= progress < 1;
      }
    }
    if (shakingArrowId) {
      const arrow = arrowById.get(shakingArrowId);
      if (arrow) {
        const elapsed = Math.max(0, now - animationStartRef.current);
        const progress = Math.min(1, elapsed / 420);
        const shake = Math.sin(progress * Math.PI * 10) * cell * 0.12 * (1 - progress);
        drawArrow(ctx, arrow, cell, 1, shake, -shake * 0.4, false, flashBlockedArrowId === arrow.id);
        active ||= progress < 1;
      }
    }
    const hintId = hintedArrowId || tutorialArrowId;
    if (hintId) {
      const arrow = arrowById.get(hintId);
      if (arrow) {
        const pulse = performanceMode ? 1 : 0.65 + Math.sin(now / 180) * 0.2;
        drawArrow(ctx, arrow, cell, 1, 0, 0, true);
        if (tutorialArrowId === arrow.id) {
          const head = arrow.cells[arrow.cells.length - 1];
          const [dr, dc] = DIR_DELTA[arrow.direction];
          ctx.fillStyle = '#FEF08A';
          ctx.globalAlpha = pulse;
          ctx.beginPath();
          ctx.arc((head.c + 0.5 + dc * 0.6) * cell, (head.r + 0.5 + dr * 0.6) * cell, cell * 0.3, 0, Math.PI * 2);
          ctx.fill();
          ctx.font = `${Math.max(12, cell * 0.4)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('👆', (head.c + 0.5 + dc * 0.6) * cell, (head.r + 0.5 + dr * 0.6) * cell);
          ctx.globalAlpha = 1;
        }
        active ||= !performanceMode && Boolean(hintedArrowId || tutorialArrowId);
      }
    }
    const particles = particlesRef.current;
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      if (!p.active) continue;
      p.x += p.vx; p.y += p.vy; p.vy += 0.12; p.life -= 0.055;
      if (p.life <= 0) { p.active = false; continue; }
      ctx.globalAlpha = p.life; ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
      active = true;
    }
    const focusedArrow = focusActiveRef.current ? arrows[focusedArrowIndexRef.current] : null;
    if (focusedArrow) drawArrow(ctx, focusedArrow, cell, 0.9, 0, 0, true);
    ctx.globalAlpha = 1;
    if (floatingScores.length) {
      ctx.font = '900 12px Fredoka, sans-serif';
      ctx.textAlign = 'center';
      for (let i = 0; i < Math.min(3, floatingScores.length); i++) {
        const item = floatingScores[i];
        const elapsed = Math.max(0, now - (item.createdAt ?? animationStartRef.current));
        if (elapsed >= 600) continue;
        ctx.fillStyle = item.color;
        ctx.globalAlpha = Math.max(0, 1 - elapsed / 600);
        ctx.fillText(item.text, item.x, item.y - elapsed * 0.035);
        active = true;
      }
      ctx.globalAlpha = 1;
    }
    if (active && !rafRef.current) rafRef.current = requestAnimationFrame(tick);
  }, [gridSize, arrows, escapingArrowId, shakingArrowId, flashBlockedArrowId, hintedArrowId, tutorialArrowId, floatingScores, showComboPill, comboCount, drawArrow, performanceMode, onPerformanceModeChange, debugOverlay, generationMs, arrowById]);

  const tick = useCallback((now: number) => {
    rafRef.current = 0;
    drawDynamic(now);
  }, [drawDynamic]);

  const rebuildOwner = useCallback(() => {
    const owner = new Int16Array(gridSize * gridSize);
    owner.fill(-1);
    for (let i = 0; i < arrows.length; i++) {
      const cells = arrows[i].cells;
      for (let j = 0; j < cells.length; j++) owner[cells[j].r * gridSize + cells[j].c] = i;
    }
    ownerRef.current = owner;
  }, [arrows, gridSize]);

  useEffect(() => { rebuildOwner(); drawStatic(); }, [rebuildOwner, drawStatic]);
  useEffect(() => {
    if (escapingArrowId || shakingArrowId || hintedArrowId || tutorialArrowId || floatingScores.length || showComboPill) {
      animationStartRef.current = performance.now();
      if (escapingArrowId) {
        const arrow = arrows.find(a => a.id === escapingArrowId);
        if (arrow) {
          const head = arrow.cells[arrow.cells.length - 1];
          const cx = (head.c + 0.5) * cellSizeRef.current;
          const cy = (head.r + 0.5) * cellSizeRef.current;
          const count = performanceMode ? 6 : 12;
          for (let i = 0; i < count; i++) {
            const particle = particlesRef.current.find(item => !item.active);
            if (!particle) break;
            const angle = Math.PI * 2 * i / count + (Math.random() - 0.5);
            const speed = Math.random() * 3 + 1.5;
            particle.x = cx; particle.y = cy; particle.vx = Math.cos(angle) * speed; particle.vy = Math.sin(angle) * speed;
            particle.life = 1; particle.color = BURST_COLORS[(Math.random() * BURST_COLORS.length) | 0]; particle.size = Math.random() * 4 + 2; particle.active = true;
          }
        }
      }
      if (!rafRef.current) rafRef.current = requestAnimationFrame(tick);
    }
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); rafRef.current = 0; };
  }, [escapingArrowId, shakingArrowId, hintedArrowId, tutorialArrowId, floatingScores, showComboPill, tick, arrows, performanceMode]);

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => { rafRef.current = 0; resizeCanvas(); });
    });
    if (containerRef.current) observer.observe(containerRef.current);
    resizeCanvas();
    return () => { observer.disconnect(); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [resizeCanvas]);

  useEffect(() => {
    transformRef.current = { zoom: zoomLevel, x: panOffset.x, y: panOffset.y };
    updateWrapperTransform();
  }, [zoomLevel, panOffset, updateWrapperTransform]);

  const cellOwnerAt = useCallback((row: number, col: number): string | null => {
    const owner = ownerRef.current;
    if (row < 0 || col < 0 || row >= gridSize || col >= gridSize) return null;
    let index = owner[row * gridSize + col];
    if (index < 0) {
      if (row > 0 && (index = owner[(row - 1) * gridSize + col]) >= 0) { /* direct neighbour */ }
      else if (row + 1 < gridSize && (index = owner[(row + 1) * gridSize + col]) >= 0) { /* neighbour */ }
      else if (col > 0 && (index = owner[row * gridSize + col - 1]) >= 0) { /* neighbour */ }
      else if (col + 1 < gridSize && (index = owner[row * gridSize + col + 1]) >= 0) { /* neighbour */ }
    }
    return index >= 0 ? arrows[index]?.id || null : null;
  }, [gridSize, arrows]);

  const handlePointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const { board } = sizeRef.current;
    const t = transformRef.current;
    const x = (event.clientX - rect.left - rect.width / 2 - t.x) / t.zoom + board / 2;
    const y = (event.clientY - rect.top - rect.height / 2 - t.y) / t.zoom + board / 2;
    const cell = board / gridSize;
    const col = Math.floor(x / cell);
    const row = Math.floor(y / cell);
    const target = cellOwnerAt(row, col);
    if (target) {
      event.preventDefault();
      onArrowSelect(target);
      return;
    }
    pointerRef.current = { down: true, dragging: false, x: event.clientX, y: event.clientY, startX: t.x, startY: t.y };
    (event.currentTarget as HTMLDivElement).setPointerCapture(event.pointerId);
  }, [gridSize, cellOwnerAt, onArrowSelect]);

  const handlePointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const p = pointerRef.current;
    if (!p.down || transformRef.current.zoom <= 1) return;
    const dx = event.clientX - p.x;
    const dy = event.clientY - p.y;
    if (Math.abs(dx) + Math.abs(dy) > 3 && !p.dragging) { p.dragging = true; onDraggingChange?.(true); }
    if (!p.dragging) return;
    const board = sizeRef.current.board;
    const maxPan = (board * (transformRef.current.zoom - 1)) / 2 + 50;
    const x = Math.max(-maxPan, Math.min(maxPan, p.startX + dx));
    const y = Math.max(-maxPan, Math.min(maxPan, p.startY + dy));
    transformRef.current.x = x;
    transformRef.current.y = y;
    updateWrapperTransform();
    drawDynamic(performance.now());
  }, [updateWrapperTransform, drawDynamic, onDraggingChange]);

  const handlePointerUp = useCallback(() => {
    const p = pointerRef.current;
    if (p.down && p.dragging) onPanChange({ x: transformRef.current.x, y: transformRef.current.y });
    if (p.dragging) onDraggingChange?.(false);
    pointerRef.current.down = false;
    pointerRef.current.dragging = false;
  }, [onPanChange, onDraggingChange]);

  const handleWheel = useCallback((event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    const t = transformRef.current;
    const nextZoom = Math.min(4, Math.max(1, t.zoom * (event.deltaY < 0 ? 1.15 : 0.87)));
    const maxPan = (sizeRef.current.board * (nextZoom - 1)) / 2 + 50;
    const x = nextZoom === 1 ? 0 : Math.max(-maxPan, Math.min(maxPan, t.x));
    const y = nextZoom === 1 ? 0 : Math.max(-maxPan, Math.min(maxPan, t.y));
    transformRef.current = { zoom: nextZoom, x, y };
    updateWrapperTransform();
    onZoomChange(nextZoom);
    onPanChange({ x, y });
  }, [onZoomChange, onPanChange, updateWrapperTransform]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!arrows.length) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      focusedArrowIndexRef.current = (focusedArrowIndexRef.current + 1) % arrows.length;
      focusActiveRef.current = true;
      drawDynamic(performance.now());
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      focusedArrowIndexRef.current = (focusedArrowIndexRef.current - 1 + arrows.length) % arrows.length;
      focusActiveRef.current = true;
      drawDynamic(performance.now());
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const arrow = arrows[focusedArrowIndexRef.current];
      if (arrow) onArrowSelect(arrow.id);
    }
  }, [arrows, onArrowSelect, drawDynamic]);

  return (
    <div ref={containerRef} className="relative flex-1 w-full h-full flex items-center justify-center overflow-hidden select-none outline-none" style={{ touchAction: 'none' }} tabIndex={0} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp} onWheel={handleWheel} onKeyDown={handleKeyDown}>
      {debugOverlay && <div ref={fpsLabelRef} className="absolute left-2 top-2 z-50 rounded bg-black/80 px-2 py-1 text-[10px] font-mono text-lime-300 pointer-events-none">-- FPS · Gen {generationMs} ms</div>}
      <div ref={wrapperRef} className="relative select-none" style={{ transformOrigin: 'center center', willChange: 'transform' }}>
        <canvas ref={staticRef} className="absolute inset-0 pointer-events-none" />
        <canvas ref={dynamicRef} className="absolute inset-0 pointer-events-none" />
      </div>
      {showComboPill && comboCount > 1 && <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 pointer-events-none rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black text-xs px-3 py-1 border border-yellow-200">🔥 COMBO x{comboCount}!</div>}
    </div>
  );
});
Board.displayName = 'Board';
