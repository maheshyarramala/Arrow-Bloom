/**
 * Arrow Bloom - Illustrated How To Play Modal
 */
import React, { useState } from 'react';
import { X, CheckCircle, AlertTriangle, Sparkles, Heart } from 'lucide-react';

interface HowToPlayProps {
  onClose: () => void;
}

export const HowToPlay: React.FC<HowToPlayProps> = ({ onClose }) => {
  const [practiceStep, setPracticeStep] = useState(0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900/95 border-4 border-white/20 p-6 shadow-2xl text-white flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <h2 className="text-2xl font-black text-white">How to Play</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close rules"
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center active:scale-90 transition-transform"
          >
            <X className="w-5 h-5 text-white/80" />
          </button>
        </div>

        {/* 3 Steps */}
        <div className="flex flex-col gap-4 text-sm">
          {/* Step 1 */}
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-pink-500 font-black text-xs flex items-center justify-center shadow-md">
                1
              </span>
              <h3 className="font-black text-base text-pink-300">Snake Arrows</h3>
            </div>
            <p className="text-white/80 text-xs leading-relaxed">
              The board is tangled with colorful arrows of 2 to 8 connected cells. The last cell is the arrowhead pointing straight outwards.
            </p>
            {/* Visual Mini Diagram */}
            <div className="h-16 rounded-xl bg-slate-950/60 flex items-center justify-center p-2">
              <svg viewBox="0 0 160 50" className="w-36 h-12">
                <path d="M 20,25 L 100,25" stroke="#FF4D8D" strokeWidth="12" strokeLinecap="round" />
                <path d="M 20,25 L 100,25" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
                <polygon points="120,25 102,15 102,35" fill="#FF4D8D" stroke="#FFF" strokeWidth="1.5" />
              </svg>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-500 font-black text-xs flex items-center justify-center shadow-md">
                2
              </span>
              <h3 className="font-black text-base text-emerald-300">Tap to Free</h3>
            </div>
            <p className="text-white/80 text-xs leading-relaxed">
              Tap an arrow when its straight ray towards the board edge is completely unobstructed. It will slither off the board and earn you points!
            </p>
            {/* Mini diagram */}
            <div className="h-16 rounded-xl bg-slate-950/60 flex items-center justify-center gap-3 px-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="text-xs font-bold text-emerald-300">
                Clear Ray = Escapes with combo points!
              </span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-rose-500 font-black text-xs flex items-center justify-center shadow-md">
                3
              </span>
              <h3 className="font-black text-base text-rose-300">Beware Obstacles!</h3>
            </div>
            <p className="text-white/80 text-xs leading-relaxed">
              If an arrow collides with another arrow along its path, it bounces back and you lose 1 heart. You have 3 hearts to solve the puzzle!
            </p>
            <div className="h-14 rounded-xl bg-slate-950/60 flex items-center justify-center gap-3 px-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              <span className="text-xs font-bold text-rose-300">
                Blocked Ray = Shakes & loses 1 Heart
              </span>
              <Heart className="w-4 h-4 fill-rose-500 text-rose-400" />
            </div>
          </div>
        </div>

        {/* Guided practice: the player must tap through a tiny example. */}
        <section className="rounded-2xl border border-cyan-400/30 bg-cyan-500/10 p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-sm text-cyan-200">Try a mini puzzle</h3>
            <span className="text-[10px] font-black text-cyan-200">{practiceStep}/2 complete</span>
          </div>
          <p className="text-xs text-white/70">
            {practiceStep === 0
              ? 'First, tap the green arrow. Its path to the edge is clear.'
              : practiceStep === 1
              ? 'Great! The pink arrow was blocking the blue one. Tap the pink arrow to clear the way.'
              : 'Perfect! Removing a blocker opens a path for the arrows behind it.'}
          </p>
          <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-950/70 p-3">
            <div className="col-span-3 flex items-center justify-center gap-2">
              <span className="text-[10px] text-white/35">BOARD EDGE ↑</span>
            </div>
            <button
              type="button"
              onClick={() => setPracticeStep(1)}
              disabled={practiceStep !== 0}
              className={`rounded-xl p-3 text-xl font-black border transition-all ${
                practiceStep === 0 ? 'bg-emerald-500/25 border-emerald-300 text-emerald-200 animate-pulse' : 'bg-white/5 border-white/10 text-white/25'
              }`}
              aria-label="Tap the free green arrow"
            >↑</button>
            <div className="rounded-xl p-3 flex items-center justify-center text-xs text-white/35">↗</div>
            <button
              type="button"
              onClick={() => setPracticeStep(2)}
              disabled={practiceStep !== 1}
              className={`rounded-xl p-3 text-xl font-black border transition-all ${
                practiceStep === 1 ? 'bg-pink-500/25 border-pink-300 text-pink-200 animate-pulse' : 'bg-white/5 border-white/10 text-white/25'
              }`}
              aria-label="Tap the pink blocking arrow"
            >→</button>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 flex-1 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-300 transition-all" style={{ width: `${practiceStep * 50}%` }} />
            </div>
            <button
              type="button"
              onClick={() => setPracticeStep(0)}
              className="text-[10px] font-bold text-white/55 underline"
            >Reset</button>
          </div>
        </section>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 text-white font-black text-base shadow-lg border border-white/30 active:scale-95 transition-transform"
        >
          Let's Play!
        </button>
      </div>
    </div>
  );
};
