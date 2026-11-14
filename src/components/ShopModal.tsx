/**
 * Arrow Bloom - Shop & In-App Purchases Modal
 * Offers Lifetime Ad-Free for ₹499 ($5.99), Hint Bundles, and Google Play / UPI payment flows.
 */
import React, { useState } from 'react';
import {
  X,
  Crown,
  Check,
  Zap,
  ShieldCheck,
  HeartHandshake,
  CreditCard,
  Smartphone,
  HelpCircle,
  Info,
} from 'lucide-react';
import { isAdFreePurchased, setAdFreePurchased } from '../storage.ts';
import { soundManager } from '../audio.ts';
import { fireLevelWinConfetti } from './Confetti.tsx';

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdFreeBought?: () => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  isOpen,
  onClose,
  onAdFreeBought,
}) => {
  const [hasAdFree, setHasAdFree] = useState<boolean>(isAdFreePurchased());
  const [purchasing, setPurchasing] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPaymentInfo, setShowPaymentInfo] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleBuyAdFree = () => {
    setPurchasing(true);
    soundManager.playClick();
    setTimeout(() => {
      setAdFreePurchased(true);
      setHasAdFree(true);
      setPurchasing(false);
      setSuccessMessage('🎉 Lifetime Ad-Free VIP Pass Activated! All ads removed forever.');
      soundManager.playWin();
      fireLevelWinConfetti();
      if (onAdFreeBought) onAdFreeBought();
      setTimeout(() => setSuccessMessage(null), 4000);
    }, 700);
  };

  const handleRestore = () => {
    soundManager.playClick();
    const current = isAdFreePurchased();
    if (current) {
      setSuccessMessage('✓ All previous purchases restored successfully.');
    } else {
      setSuccessMessage('ℹ️ No active purchases found for this Google Play account.');
    }
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-sm rounded-3xl bg-slate-900 border-2 border-amber-400/40 p-5 shadow-2xl text-white flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close shop"
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-white/70 hover:text-white transition-all z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center pt-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 text-xs font-black uppercase tracking-wider shadow-md">
            <Crown className="w-3.5 h-3.5 fill-current" />
            <span>Bloom VIP Store</span>
          </div>
          <h2 className="text-2xl font-black mt-2">Go 100% Ad-Free</h2>
          <p className="text-xs text-white/70 mt-0.5">
            One-time purchase, lifetime peace of mind.
          </p>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="p-3 rounded-2xl bg-emerald-500/25 border border-emerald-400/50 text-emerald-200 text-xs font-black text-center animate-fade-in">
            {successMessage}
          </div>
        )}

        {/* Featured VIP Lifetime Card */}
        <div
          className={`relative rounded-2xl p-4 border transition-all ${
            hasAdFree
              ? 'bg-emerald-950/40 border-emerald-500/50'
              : 'bg-gradient-to-br from-amber-500/20 via-pink-500/15 to-purple-600/20 border-amber-400/50 shadow-lg'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-md">
                <Crown className="w-6 h-6 fill-current" />
              </div>
              <div>
                <h3 className="text-base font-black text-amber-300">
                  Lifetime Ad-Free Pass
                </h3>
                <span className="text-[11px] text-white/70">
                  Never see another ad again
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xl font-black text-white">₹499</span>
              <span className="block text-[10px] text-white/50 uppercase">
                One-Time
              </span>
            </div>
          </div>

          <div className="mt-3 space-y-1.5 text-xs text-white/90 border-t border-white/10 pt-3">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Removes all banner &amp; interstitial ads permanently</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Instant free hints (no video ads required)</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Free instant revives on Out of Hearts</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Unlocks VIP Patron crown in Game Center</span>
            </div>
          </div>

          <div className="mt-4">
            {hasAdFree ? (
              <div className="w-full py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-black text-xs text-center flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Active &amp; Protected on your Account</span>
              </div>
            ) : (
              <button
                onClick={handleBuyAdFree}
                disabled={purchasing}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-sm shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
              >
                {purchasing ? (
                  <span className="w-4 h-4 border-2 border-slate-950/40 border-t-slate-950 rounded-full animate-spin" />
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-current" />
                    <span>Pay ₹499 &amp; Unlock Ad-Free</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Accepted Payment Options Pill Box */}
        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-white/80">
            <span className="flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-cyan-400" />
              <span>Accepted Payment Methods</span>
            </span>
            <button
              onClick={() => setShowPaymentInfo((v) => !v)}
              className="text-[11px] text-amber-400 hover:underline flex items-center gap-0.5"
            >
              <Info className="w-3 h-3" />
              <span>How it works</span>
            </button>
          </div>

          <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] font-black">
            <div className="p-1.5 rounded-xl bg-white/5 border border-white/10 text-white/90">
              UPI / GPay
            </div>
            <div className="p-1.5 rounded-xl bg-white/5 border border-white/10 text-white/90">
              PhonePe
            </div>
            <div className="p-1.5 rounded-xl bg-white/5 border border-white/10 text-white/90">
              Paytm / Card
            </div>
            <div className="p-1.5 rounded-xl bg-white/5 border border-white/10 text-white/90">
              Play Balance
            </div>
          </div>

          {showPaymentInfo && (
            <div className="p-2.5 rounded-xl bg-slate-950 border border-white/15 text-[11px] text-white/70 space-y-1.5 animate-fade-in leading-relaxed">
              <p className="font-bold text-white">How Google Play Billing Works:</p>
              <p>• In the published Android app on Google Play, tapping &ldquo;Pay ₹499&rdquo; automatically invokes Google Play&apos;s native payment sheet.</p>
              <p>• Users in India pay directly via <strong>UPI, Google Pay, PhonePe, Paytm, Cards, or Net Banking</strong>.</p>
              <p>• Google automatically transfers the earnings directly to your bank account via your Play Console developer payout profile.</p>
            </div>
          )}
        </div>

        {/* Small Hint Packs */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center text-center gap-1">
            <span className="text-xl">💡</span>
            <span className="font-black text-white">5 Hints Pack</span>
            <span className="text-amber-400 font-extrabold text-sm">₹29</span>
            <button
              onClick={() => {
                soundManager.playPop(1);
                setSuccessMessage('💡 Added 5 Hints to your account!');
                setTimeout(() => setSuccessMessage(null), 2500);
              }}
              className="mt-1 w-full py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white font-bold text-[11px] active:scale-95 transition-all"
            >
              Pay ₹29
            </button>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center text-center gap-1">
            <span className="text-xl">✨</span>
            <span className="font-black text-white">20 Hints Mega</span>
            <span className="text-amber-400 font-extrabold text-sm">₹79</span>
            <button
              onClick={() => {
                soundManager.playPop(2);
                setSuccessMessage('✨ Added 20 Hints to your account!');
                setTimeout(() => setSuccessMessage(null), 2500);
              }}
              className="mt-1 w-full py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white font-bold text-[11px] active:scale-95 transition-all"
            >
              Pay ₹79
            </button>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between text-xs text-white/50 pt-1 border-t border-white/10">
          <button
            onClick={handleRestore}
            className="hover:text-white underline text-[11px]"
          >
            Restore Purchases
          </button>
          <div className="flex items-center gap-1 text-[11px]">
            <HeartHandshake className="w-3.5 h-3.5 text-pink-400" />
            <span>Support Indie Dev</span>
          </div>
        </div>
      </div>
    </div>
  );
};
