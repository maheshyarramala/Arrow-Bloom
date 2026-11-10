/**
 * Arrow Bloom - Animated Hearts Display Component
 */
import React from 'react';
import { Heart } from 'lucide-react';

interface HeartsProps {
  hearts: number; // 0 to 3
  maxHearts?: number;
}

export const Hearts: React.FC<HeartsProps> = ({ hearts, maxHearts = 3 }) => {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-black/35 backdrop-blur-md border border-white/15 shadow-inner">
      {Array.from({ length: maxHearts }).map((_, idx) => {
        const isAlive = idx < hearts;
        return (
          <div
            key={idx}
            className={`transition-all duration-300 transform ${
              isAlive
                ? 'scale-100'
                : 'scale-90 opacity-40 grayscale rotate-12'
            }`}
          >
            <Heart
              className={`w-6 h-6 transition-all duration-200 ${
                isAlive
                  ? 'fill-rose-500 text-rose-300 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]'
                  : 'fill-slate-600 text-slate-500'
              }`}
            />
          </div>
        );
      })}
    </div>
  );
};
