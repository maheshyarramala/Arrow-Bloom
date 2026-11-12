/**
 * Arrow Bloom - Level Win Confetti Explosion Component
 * Triggers an explosion of colored particles at the center of the board when a level is cleared,
 * matching the level's color palette.
 */
import React, { useEffect, useState } from 'react';
import { PALETTE } from '../levelGenerator.ts';

interface LevelWinConfettiProps {
  active: boolean;
  colorIndices?: number[];
  onComplete?: () => void;
}

interface ConfettiParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  vRot: number;
  shape: 'rect' | 'circle' | 'star';
  life: number;
}

export const LevelWinConfetti: React.FC<LevelWinConfettiProps> = ({
  active,
  colorIndices = [0, 2, 4, 5, 8],
  onComplete,
}) => {
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);

  useEffect(() => {
    if (!active) {
      setParticles([]);
      return;
    }

    const paletteColors = colorIndices.length > 0
      ? colorIndices.map(idx => PALETTE[idx % PALETTE.length])
      : ['#FF2A85', '#FFD000', '#10E7A1', '#00E5FF', '#AF52DE', '#FF7A00'];

    const count = 75;
    const newParticles: ConfettiParticle[] = [];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 12 + 4;
      const shapes: Array<'rect' | 'circle' | 'star'> = ['rect', 'circle', 'star'];
      newParticles.push({
        id: i,
        x: 0, // centered
        y: 0,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        color: paletteColors[Math.floor(Math.random() * paletteColors.length)],
        size: Math.random() * 8 + 6,
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 15,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        life: 1.0,
      });
    }

    setParticles(newParticles);

    let rafId: number;
    let startTime = performance.now();
    const duration = 1800; // 1.8s explosion

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);

      if (progress < 1) {
        setParticles(prev =>
          prev.map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.35, // gravity
            vx: p.vx * 0.96, // drag
            rotation: p.rotation + p.vRot,
            life: 1 - progress,
          }))
        );
        rafId = requestAnimationFrame(animate);
      } else {
        setParticles([]);
        onComplete?.();
      }
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [active, colorIndices, onComplete]);

  if (!active || particles.length === 0) return null;

  return (
    <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center overflow-hidden">
      <div className="relative w-0 h-0">
        {particles.map(p => (
          <div
            key={p.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${p.x}px`,
              top: `${p.y}px`,
              opacity: p.life,
              transform: `translate(-50%, -50%) rotate(${p.rotation}deg) scale(${p.life})`,
            }}
          >
            {p.shape === 'rect' && (
              <div
                className="rounded-xs shadow-md"
                style={{
                  width: `${p.size}px`,
                  height: `${p.size * 0.6}px`,
                  backgroundColor: p.color,
                }}
              />
            )}
            {p.shape === 'circle' && (
              <div
                className="rounded-full shadow-md"
                style={{
                  width: `${p.size * 0.8}px`,
                  height: `${p.size * 0.8}px`,
                  backgroundColor: p.color,
                }}
              />
            )}
            {p.shape === 'star' && (
              <div
                className="text-xs font-bold filter drop-shadow"
                style={{ color: p.color, fontSize: `${p.size * 1.2}px` }}
              >
                ★
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
