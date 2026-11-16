/**
 * Arrow Bloom - Canvas-based Level Win Confetti Explosion
 * Renders smooth 60fps celebratory confetti onto a single lightweight canvas
 * without triggering DOM churn or GPU compositor whiteouts on mobile WebViews.
 */
import React, { useEffect, useRef } from 'react';
import { PALETTE } from '../levelGenerator.ts';

interface LevelWinConfettiProps {
  active: boolean;
  colorIndices?: number[];
  onComplete?: () => void;
}

interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  vRot: number;
  shape: 'rect' | 'circle' | 'star';
}

export const LevelWinConfetti: React.FC<LevelWinConfettiProps> = ({
  active,
  colorIndices = [0, 2, 4, 5, 8],
  onComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!active || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const width = window.innerWidth || 360;
    const height = window.innerHeight || 640;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const uniqueIndices = Array.from(new Set(colorIndices));
    const paletteColors =
      uniqueIndices.length > 0
        ? uniqueIndices.map((idx) => PALETTE[Math.abs(idx) % PALETTE.length])
        : ['#FF2A85', '#FFD000', '#10E7A1', '#00E5FF', '#AF52DE', '#FF7A00'];

    const cx = width * 0.5;
    const cy = height * 0.45;
    const count = 65;
    const shapes: Array<'rect' | 'circle' | 'star'> = ['rect', 'circle', 'star'];
    const particles: ConfettiParticle[] = [];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 11 + 4;
      particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        color: paletteColors[i % paletteColors.length],
        size: Math.random() * 7 + 5,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.28,
        shape: shapes[i % shapes.length],
      });
    }

    let rafId = 0;
    const startTime = performance.now();
    const duration = 1700;

    const render = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      ctx.clearRect(0, 0, width, height);

      if (progress < 1) {
        const alpha = progress < 0.7 ? 1 : 1 - (progress - 0.7) / 0.3;
        ctx.globalAlpha = Math.max(0, alpha);

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.34;
          p.vx *= 0.965;
          p.rotation += p.vRot;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.fillStyle = p.color;

          if (p.shape === 'rect') {
            ctx.fillRect(-p.size * 0.5, -p.size * 0.3, p.size, p.size * 0.6);
          } else if (p.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(0, 0, p.size * 0.4, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.font = `bold ${Math.round(p.size * 1.2)}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('★', 0, 0);
          }
          ctx.restore();
        }
        rafId = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, width, height);
        onCompleteRef.current?.();
      }
    };

    rafId = requestAnimationFrame(render);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      ctx.clearRect(0, 0, width, height);
    };
  }, [active, colorIndices]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full z-[60] pointer-events-none"
      aria-hidden="true"
    />
  );
};
