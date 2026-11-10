/**
 * Arrow Bloom - Game Popups & Modals (Level Complete, Game Over, Collection Milestone)
 * Includes revealed colorful silhouette celebration on Win!
 */
import React, { useEffect } from 'react';
import { Star, RotateCcw, Play, Home, Trophy, Sparkles, HeartCrack, Lightbulb } from 'lucide-react';
import { CollectionConfig } from '../types.ts';
import { SHAPE_DEFINITIONS, getShapeThumbnailPath } from '../shapes.ts';
import { fireLevelWinConfetti, fireGrandFinaleConfetti } from './Confetti.tsx';

interface LevelCompleteModalProps {
  levelNumber: number;
  shapeName: string;
  stars: number;
  score: number;
  mistakes: number;
  isNewHigh: boolean;
  hasNextLevel: boolean;
  onNextLevel: () => void;
  onReplay: () => void;
  onHome: () => void;
}

export const LevelCompleteModal: React.FC<LevelCompleteModalProps> = ({
  levelNumber,
  shapeName,
  stars,
  score,
  mistakes,
  isNewHigh,
  hasNextLevel,
  onNextLevel,
  onReplay,
  onHome,
}) => {
  const shapeDef = SHAPE_DEFINITIONS[levelNumber];

  useEffect(() => {
    fireLevelWinConfetti();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-sm rounded-3xl bg-slate-900/95 border-4 border-amber-400/40 p-5 shadow-2xl text-center flex flex-col items-center gap-3 text-white">
        {/* Header Tag */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 text-xs font-black uppercase tracking-wider shadow-md">
          <Sparkles className="w-3.5 h-3.5 fill-current" />
          <span>Level {levelNumber} Cleared!</span>
        </div>

        {/* Revealed Colorful Silhouette Celebration Picture */}
        {shapeDef && (
          <div className="relative w-28 h-28 my-1 rounded-2xl bg-slate-950/80 border border-white/20 p-2 flex items-center justify-center shadow-inner overflow-hidden animate-pulse">
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_12px_#FF2A85]">
              <defs>
                <linearGradient id="winShapeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FF2A85" />
                  <stop offset="50%" stopColor="#FFD000" />
                  <stop offset="100%" stopColor="#00E5FF" />
                </linearGradient>
              </defs>
              <path
                d={getShapeThumbnailPath(shapeDef, 100)}
                fill="url(#winShapeGrad)"
                stroke="#FFFFFF"
                strokeWidth="2"
              />
            </svg>
          </div>
        )}

        <h3 className="text-lg font-black text-white">
          {shapeName} Completed!
        </h3>

        {/* 3 Animated Stars */}
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3].map((starIdx) => {
            const isEarned = starIdx <= stars;
            return (
              <div
                key={starIdx}
                className={`transition-all duration-500 transform ${
                  isEarned
                    ? 'scale-110 drop-shadow-[0_0_12px_rgba(250,204,21,0.8)]'
                    : 'scale-90 opacity-30 grayscale'
                }`}
                style={{ transitionDelay: `${starIdx * 120}ms` }}
              >
                <Star
                  className={`w-9 h-9 ${
                    isEarned
                      ? 'fill-amber-400 text-yellow-200 animate-bounce'
                      : 'fill-slate-600 text-slate-500'
                  }`}
                  style={{ animationIterationCount: 2 }}
                />
              </div>
            );
          })}
        </div>

        {/* Score & Mistake Stats */}
        <div className="w-full bg-white/10 rounded-2xl p-2.5 border border-white/15 flex flex-col gap-1 text-left">
          <div className="flex justify-between items-center text-xs">
            <span className="text-white/80 font-semibold">Level Score:</span>
            <span className="font-black text-amber-300 text-base tabular-nums">
              {score.toLocaleString()} pts
            </span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-white/70">Accuracy:</span>
            <span className="font-bold text-emerald-400">
              {mistakes === 0 ? '✨ Perfect (0 mistakes)' : `${mistakes} ${mistakes === 1 ? 'mistake' : 'mistakes'}`}
            </span>
          </div>
          {isNewHigh && (
            <div className="text-[10px] text-center font-extrabold text-yellow-300 uppercase tracking-wider bg-yellow-500/20 py-0.5 rounded border border-yellow-400/30">
              🎉 New High Score!
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="w-full flex flex-col gap-2 mt-1">
          {hasNextLevel ? (
            <button
              onClick={onNextLevel}
              className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400 active:scale-95 text-slate-950 font-black text-base shadow-lg border border-emerald-200 flex items-center justify-center gap-2 transition-transform"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Next Level</span>
            </button>
          ) : (
            <button
              onClick={onHome}
              className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-black text-base shadow-lg border border-purple-300 flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <Trophy className="w-5 h-5" />
              <span>Grand Finale Conquered!</span>
            </button>
          )}

          <div className="flex gap-2">
            <button
              onClick={onReplay}
              className="flex-1 py-2 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 text-white font-bold text-xs border border-white/15 flex items-center justify-center gap-1 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Replay</span>
            </button>
            <button
              onClick={onHome}
              className="flex-1 py-2 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 text-white font-bold text-xs border border-white/15 flex items-center justify-center gap-1 transition-all"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface GameOverModalProps {
  levelNumber: number;
  onRetry: () => void;
  onFreeHintRetry: () => void;
  onHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  levelNumber,
  onRetry,
  onFreeHintRetry,
  onHome,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-sm rounded-3xl bg-slate-900/95 border-4 border-rose-500/40 p-5 shadow-2xl text-center flex flex-col items-center gap-3 text-white">
        <div className="w-14 h-14 rounded-full bg-rose-500/20 border-2 border-rose-500/40 flex items-center justify-center">
          <HeartCrack className="w-8 h-8 text-rose-400 animate-pulse" />
        </div>

        <div>
          <h2 className="text-xl font-black text-white">Out of Hearts!</h2>
          <p className="text-xs text-white/70 mt-1 leading-relaxed">
            Level {levelNumber} is tricky! Remember to inspect the straight ray from the arrowhead out to the edge.
          </p>
        </div>

        <div className="w-full flex flex-col gap-2 mt-1">
          <button
            onClick={onRetry}
            className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 active:scale-95 text-white font-black text-sm shadow-md border border-rose-300 flex items-center justify-center gap-2 transition-transform"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again</span>
          </button>

          <button
            onClick={onFreeHintRetry}
            className="w-full py-2.5 px-4 rounded-2xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-black text-xs border border-amber-200 flex items-center justify-center gap-1.5 transition-transform shadow-md"
          >
            <Lightbulb className="w-4 h-4 fill-current" />
            <span>Retry with Free Hint</span>
          </button>

          <button
            onClick={onHome}
            className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white/70 hover:text-white font-bold text-xs transition-all"
          >
            Home Menu
          </button>
        </div>
      </div>
    </div>
  );
};

interface CollectionCompleteModalProps {
  completedCollection: CollectionConfig;
  nextCollection?: CollectionConfig | null;
  isGameFinale?: boolean;
  onContinue: () => void;
  onHome: () => void;
}

export const CollectionCompleteModal: React.FC<CollectionCompleteModalProps> = ({
  completedCollection,
  nextCollection,
  isGameFinale = false,
  onContinue,
  onHome,
}) => {
  useEffect(() => {
    fireGrandFinaleConfetti();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-sm rounded-3xl bg-slate-900/95 border-4 border-yellow-400/60 p-6 shadow-2xl text-center flex flex-col items-center gap-4 text-white">
        <div className="w-18 h-18 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center shadow-lg border-2 border-yellow-200 transform -rotate-3 animate-bounce">
          <Trophy className="w-9 h-9 text-slate-950" />
        </div>

        <div>
          <span className="text-xs font-black uppercase tracking-widest text-amber-300">
            {isGameFinale ? '🌟 GRAND MASTER CONQUERED 🌟' : 'COLLECTION CLEARED!'}
          </span>
          <h2 className="text-2xl font-black text-white mt-1">
            {isGameFinale ? 'Arrow Bloom Champion!' : completedCollection.name}
          </h2>
          <p className="text-xs text-white/80 mt-2 px-2 leading-relaxed">
            {isGameFinale
              ? 'You have solved all 150 silhouette puzzles! You have mastered the Grand Master Maze!'
              : `You have cleared all 10 puzzles in ${completedCollection.name}! ${
                  nextCollection ? `Next up: ${nextCollection.name}!` : ''
                }`}
          </p>
        </div>

        <div className="w-full flex flex-col gap-2 mt-2">
          <button
            onClick={onContinue}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 active:scale-95 text-slate-950 font-black text-base shadow-xl border border-yellow-100 flex items-center justify-center gap-2 transition-transform"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>{isGameFinale ? 'Browse All Levels' : `Enter ${nextCollection?.name || 'Next'}`}</span>
          </button>
          <button
            onClick={onHome}
            className="w-full py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs"
          >
            Home Menu
          </button>
        </div>
      </div>
    </div>
  );
};
