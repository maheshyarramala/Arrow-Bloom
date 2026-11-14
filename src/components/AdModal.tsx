/**
 * Arrow Bloom - Rewarded AdMob Video Player Component
 * Plays 5-second standard rewarded ads or 60-second long AdMob video ads for Free Hits continue,
 * with countdown, audio ping, linear progress bar, and claim-reward callback.
 */
import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, CheckCircle2, Crown, ExternalLink } from 'lucide-react';
import { soundManager } from '../audio.ts';

interface AdModalProps {
  reason: 'hint' | 'free_hits' | 'double_score' | 'interstitial';
  onReward: () => void;
  onClose: () => void;
  onOpenShop?: () => void;
}

export const AdModal: React.FC<AdModalProps> = ({
  reason,
  onReward,
  onClose,
  onOpenShop,
}) => {
  const totalDuration = reason === 'free_hits' ? 60 : 5;
  const [secondsLeft, setSecondsLeft] = useState(totalDuration);
  const [isCompleted, setIsCompleted] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Dynamic sponsor mockup rotation
  const adCreatives = [
    {
      title: 'Google Play Games',
      tagline: 'Track achievements, unlock cloud saves & compete globally!',
      cta: 'Explore Play Games',
      bgGrad: 'from-blue-600 via-indigo-600 to-purple-700',
      icon: '🎮',
    },
    {
      title: 'Arrow Bloom VIP Pass',
      tagline: 'Enjoy lifetime zero ads, infinite instant hints & free continues!',
      cta: 'Get Ad-Free for ₹499',
      isVipAd: true,
      bgGrad: 'from-amber-500 via-rose-500 to-pink-600',
      icon: '👑',
    },
    {
      title: 'Pixel Bloom Odyssey',
      tagline: 'Over 1,000 peaceful bloom puzzles waiting for you.',
      cta: 'Discover More',
      bgGrad: 'from-emerald-600 via-teal-600 to-cyan-700',
      icon: '🌸',
    },
  ];

  const currentAd =
    reason === 'free_hits' ? adCreatives[1] : adCreatives[0];

  useEffect(() => {
    setSecondsLeft(totalDuration);
    setIsCompleted(false);
    timerRef.current = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setIsCompleted(true);
          soundManager.playPop(3);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [totalDuration]);

  const handleClaim = () => {
    soundManager.playWin();
    onReward();
    onClose();
  };

  const getReasonLabel = () => {
    switch (reason) {
      case 'hint':
        return 'Rewarding: Free Solution Hint';
      case 'free_hits':
        return 'Rewarding: 3 Free Hits / Continue';
      case 'double_score':
        return 'Rewarding: 2x Level Score';
      default:
        return 'Sponsored Video Ad';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-sm rounded-3xl bg-slate-900 border-2 border-white/20 shadow-2xl overflow-hidden text-white flex flex-col">
        {/* Ad Header / Status Bar */}
        <div className="bg-slate-950/90 px-4 py-2.5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-400 text-slate-950 tracking-wider">
              Ad
            </span>
            <span className="text-xs font-semibold text-white/80 truncate">
              {getReasonLabel()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!isCompleted ? (
              <span className="text-xs font-black text-amber-300 tabular-nums bg-white/10 px-2 py-0.5 rounded-full border border-amber-400/30">
                Reward in {secondsLeft}s
              </span>
            ) : (
              <span className="text-xs font-black text-emerald-400 flex items-center gap-1 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-400/40">
                <CheckCircle2 className="w-3.5 h-3.5" /> Ready!
              </span>
            )}
          </div>
        </div>

        {/* Linear Ad Progress Bar */}
        <div className="w-full h-1 bg-white/10 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-pink-500 via-amber-400 to-emerald-400 transition-all duration-1000 ease-linear"
            style={{ width: `${((totalDuration - secondsLeft) / totalDuration) * 100}%` }}
          />
        </div>

        {/* Video / Ad Creative Container */}
        <div
          className={`p-6 flex flex-col items-center justify-center text-center bg-gradient-to-br ${currentAd.bgGrad} relative overflow-hidden min-h-[220px]`}
        >
          {/* Background Decorative Rings */}
          <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-white/10 blur-xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-36 h-36 rounded-full bg-black/20 blur-xl pointer-events-none" />

          {/* Ad Icon */}
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-3xl shadow-xl mb-3 animate-pulse">
            {currentAd.icon}
          </div>

          <h3 className="text-lg font-black tracking-tight text-white drop-shadow-md">
            {currentAd.title}
          </h3>
          <p className="text-xs text-white/90 mt-1.5 max-w-[260px] leading-relaxed drop-shadow">
            {currentAd.tagline}
          </p>

          {currentAd.isVipAd && onOpenShop && (
            <button
              onClick={() => {
                onClose();
                onOpenShop();
              }}
              className="mt-4 px-4 py-1.5 rounded-full bg-white text-slate-900 font-black text-xs shadow-lg active:scale-95 transition-transform flex items-center gap-1.5"
            >
              <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              Remove All Ads Forever ₹499
            </button>
          )}
        </div>

        {/* Ad Bottom Footer / Claim Button */}
        <div className="p-4 bg-slate-900 flex flex-col gap-2">
          {isCompleted ? (
            <button
              onClick={handleClaim}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-slate-950 font-black text-sm shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2 animate-bounce"
            >
              <Sparkles className="w-4 h-4 fill-current" />
              <span>Claim Reward & Continue</span>
            </button>
          ) : (
            <div className="w-full py-3 px-4 rounded-2xl bg-white/10 text-white/50 font-bold text-xs flex items-center justify-center gap-2 cursor-wait">
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Reward unlocking in {secondsLeft}s...</span>
            </div>
          )}

          <div className="flex items-center justify-between text-[11px] text-white/40 pt-1 px-1">
            <span>Verified Google AdMob Partner</span>
            {onOpenShop && (
              <button
                onClick={() => {
                  onClose();
                  onOpenShop();
                }}
                className="text-amber-400 hover:text-amber-300 font-bold underline flex items-center gap-0.5"
              >
                <span>Hate ads? Go Ad-Free ₹499</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
