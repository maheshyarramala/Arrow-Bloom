/**
 * Arrow Bloom - Settings Screen Component
 * Includes audio/theme controls, How to Play & Rules, Legal & Ads Compliance,
 * and Developer Contact Details (devops.maheshbabu@gmail.com).
 */
import React, { useState } from 'react';
import { GameSettings } from '../types.ts';
import {
  ChevronLeft,
  Volume2,
  Music,
  Smartphone,
  Eye,
  Sun,
  Moon,
  Gauge,
  Trash2,
  AlertCircle,
  HelpCircle,
  Shield,
  FileText,
  Mail,
  Copy,
  Check,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { soundManager } from '../audio.ts';
import { LegalTab } from './LegalPagesModal.tsx';

interface SettingsProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
  onResetProgress: () => void;
  onOpenHowToPlay: () => void;
  onOpenLegal: (tab?: LegalTab) => void;
  onBack: () => void;
}

export const Settings: React.FC<SettingsProps> = ({
  settings,
  onUpdateSettings,
  onResetProgress,
  onOpenHowToPlay,
  onOpenLegal,
  onBack,
}) => {
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const isDark = settings.theme === 'dark';
  const developerEmail = 'devops.maheshbabu@gmail.com';

  const toggle = (key: keyof Pick<GameSettings, 'soundEnabled' | 'musicEnabled' | 'vibrationEnabled' | 'colorBlindMode' | 'performanceMode'>) => {
    soundManager.playClick();
    onUpdateSettings({
      ...settings,
      [key]: !settings[key],
    });
  };

  const toggleTheme = () => {
    soundManager.playClick();
    onUpdateSettings({
      ...settings,
      theme: settings.theme === 'dark' ? 'light' : 'dark',
    });
  };

  const copyEmail = () => {
    navigator.clipboard.writeText(developerEmail);
    soundManager.playPop(1);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  return (
    <div className="relative w-full h-full flex flex-col pt-safe pb-safe px-4 z-10 overflow-hidden select-none">
      {/* Header */}
      <header className="flex items-center justify-between py-2 shrink-0 max-w-md w-full mx-auto">
        <button
          onClick={onBack}
          aria-label="Back"
          className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all active:scale-95 border ${
            isDark
              ? 'bg-white/10 hover:bg-white/20 text-white border-white/15'
              : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200'
          }`}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl md:text-2xl font-black">Settings</h1>
        <div className="w-10" />
      </header>

      {/* Settings Scrollable Content */}
      <div className="flex-1 overflow-y-auto py-2 flex flex-col gap-4 max-w-md w-full mx-auto pr-0.5">
        {/* Section 1: Gameplay Audio & Visual Preferences */}
        <div className="space-y-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-pink-400 px-1">
            Preferences &amp; Audio
          </span>

          {/* Theme */}
          <div
            className={`rounded-2xl p-3.5 border flex items-center justify-between shadow-sm ${
              isDark ? 'bg-slate-900/60 border-white/15' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </div>
              <div>
                <h2 className="font-black text-sm">Theme</h2>
                <p className="text-xs opacity-60">
                  {isDark ? 'Dark Neon Glow' : 'Warm Cream & Pastel'}
                </p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs border transition-all active:scale-95 ${
                isDark
                  ? 'bg-white/15 hover:bg-white/25 text-yellow-300 border-white/20'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
              }`}
            >
              {isDark ? '🌙 Dark' : '☀️ Light'}
            </button>
          </div>

          {/* Sound Effects */}
          <div
            className={`rounded-2xl p-3.5 border flex items-center justify-between shadow-sm ${
              isDark ? 'bg-slate-900/60 border-white/15' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-pink-500/20 flex items-center justify-center text-pink-400">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-black text-sm">Sound Effects</h2>
                <p className="text-xs opacity-60">Pops, combo chimes &amp; buzzer</p>
              </div>
            </div>
            <button
              onClick={() => toggle('soundEnabled')}
              className={`w-12 h-7 rounded-full transition-colors p-1 flex items-center ${
                settings.soundEnabled ? 'bg-pink-500' : 'bg-black/20'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                  settings.soundEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Music */}
          <div
            className={`rounded-2xl p-3.5 border flex items-center justify-between shadow-sm ${
              isDark ? 'bg-slate-900/60 border-white/15' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Music className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-black text-sm">Background Music</h2>
                <p className="text-xs opacity-60">Relaxing ambient tones</p>
              </div>
            </div>
            <button
              onClick={() => toggle('musicEnabled')}
              className={`w-12 h-7 rounded-full transition-colors p-1 flex items-center ${
                settings.musicEnabled ? 'bg-indigo-500' : 'bg-black/20'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                  settings.musicEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Vibration Haptics */}
          <div
            className={`rounded-2xl p-3.5 border flex items-center justify-between shadow-sm ${
              isDark ? 'bg-slate-900/60 border-white/15' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-black text-sm">Haptics</h2>
                <p className="text-xs opacity-60">Vibration feedback on tap</p>
              </div>
            </div>
            <button
              onClick={() => toggle('vibrationEnabled')}
              className={`w-12 h-7 rounded-full transition-colors p-1 flex items-center ${
                settings.vibrationEnabled ? 'bg-cyan-500' : 'bg-black/20'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                  settings.vibrationEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Color-Blind Pattern Mode */}
          <div
            className={`rounded-2xl p-3.5 border flex items-center justify-between shadow-sm ${
              isDark ? 'bg-slate-900/60 border-white/15' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-black text-sm">Color-Blind Mode</h2>
                <p className="text-xs opacity-60">High contrast directional markings</p>
              </div>
            </div>
            <button
              onClick={() => toggle('colorBlindMode')}
              className={`w-12 h-7 rounded-full transition-colors p-1 flex items-center ${
                settings.colorBlindMode ? 'bg-amber-500' : 'bg-black/20'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                  settings.colorBlindMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Arrow Animation Speed */}
          <div
            className={`rounded-2xl p-3.5 border flex flex-col gap-3 shadow-sm ${
              isDark ? 'bg-slate-900/60 border-white/15' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Gauge className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-black text-sm">Arrow Animation Speed</h2>
                <p className="text-xs opacity-60">Choose how quickly arrows escape</p>
              </div>
            </div>
            <div className={`grid grid-cols-3 gap-2 rounded-xl p-1 ${isDark ? 'bg-black/25' : 'bg-slate-100'}`}>
              {(['slow', 'normal', 'fast'] as const).map((speed) => (
                <button
                  key={speed}
                  type="button"
                  aria-pressed={(settings.animationSpeed || 'slow') === speed}
                  onClick={() => {
                    soundManager.playClick();
                    onUpdateSettings({ ...settings, animationSpeed: speed });
                  }}
                  className={`py-2 rounded-lg text-xs font-black capitalize transition-all active:scale-95 ${
                    (settings.animationSpeed || 'slow') === speed
                      ? 'bg-cyan-500 text-slate-950 shadow'
                      : isDark ? 'text-white/65 hover:bg-white/10' : 'text-slate-600 hover:bg-white'
                  }`}
                >
                  {speed}
                </button>
              ))}
            </div>
          </div>

          {/* Performance Mode */}
          <div
            className={`rounded-2xl p-3.5 border flex items-center justify-between shadow-sm ${
              isDark ? 'bg-slate-900/60 border-white/15' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Gauge className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-black text-sm">Performance Mode</h2>
                <p className="text-xs opacity-60">Smooth 60fps on older devices</p>
              </div>
            </div>
            <button
              onClick={() => toggle('performanceMode')}
              aria-pressed={settings.performanceMode}
              className={`w-12 h-7 rounded-full transition-colors p-1 flex items-center ${
                settings.performanceMode ? 'bg-emerald-500' : 'bg-black/20'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                  settings.performanceMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Section 2: Rules & Game Guide */}
        <div className="space-y-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 px-1">
            Rules &amp; Guide
          </span>

          <button
            onClick={() => {
              soundManager.playClick();
              onOpenHowToPlay();
            }}
            className={`w-full rounded-2xl p-3.5 border flex items-center justify-between text-left transition-all active:scale-[0.98] ${
              isDark
                ? 'bg-slate-900/60 hover:bg-slate-900/80 border-white/15 text-white'
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800 shadow-sm'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-400/20 flex items-center justify-center text-amber-400">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-black text-sm">How to Play &amp; Rules</h2>
                <p className="text-xs opacity-60">Ray mechanics, combos &amp; controls</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 opacity-50" />
          </button>
        </div>

        {/* Section 3: Legal, Privacy & Ads Disclosures */}
        <div className="space-y-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-cyan-400 px-1">
            Legal, Ads &amp; Privacy
          </span>

          <div
            className={`rounded-2xl border divide-y overflow-hidden shadow-sm ${
              isDark
                ? 'bg-slate-900/60 border-white/15 divide-white/10'
                : 'bg-white border-slate-200 divide-slate-100'
            }`}
          >
            {/* Privacy Policy */}
            <button
              onClick={() => {
                soundManager.playClick();
                onOpenLegal('privacy');
              }}
              className="w-full p-3.5 flex items-center justify-between text-left hover:bg-white/5 active:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-cyan-400 shrink-0" />
                <div>
                  <h3 className="font-black text-xs">Privacy Policy</h3>
                  <p className="text-[11px] opacity-60">
                    Zero personal data collected • Local storage only
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 opacity-50 shrink-0" />
            </button>

            {/* Terms and Conditions */}
            <button
              onClick={() => {
                soundManager.playClick();
                onOpenLegal('terms');
              }}
              className="w-full p-3.5 flex items-center justify-between text-left hover:bg-white/5 active:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                <div>
                  <h3 className="font-black text-xs">Terms &amp; Conditions</h3>
                  <p className="text-[11px] opacity-60">
                    Virtual items, gameplay license &amp; rewarded ads
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 opacity-50 shrink-0" />
            </button>

            {/* Ads Policy & Google Play Data Safety */}
            <button
              onClick={() => {
                soundManager.playClick();
                onOpenLegal('datasafety');
              }}
              className="w-full p-3.5 flex items-center justify-between text-left hover:bg-white/5 active:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <h3 className="font-black text-xs">Ads Policy &amp; Data Safety</h3>
                  <p className="text-[11px] opacity-60">
                    Google AdMob disclosures, COPPA &amp; app-ads.txt
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 opacity-50 shrink-0" />
            </button>
          </div>
        </div>

        {/* Section 4: Developer Contact & Support */}
        <div className="space-y-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-pink-400 px-1">
            Developer Contact
          </span>

          <div
            className={`rounded-2xl p-4 border flex flex-col gap-3 shadow-sm ${
              isDark ? 'bg-slate-900/60 border-white/15' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-black text-sm">Official Support Email</h3>
                <p className="text-xs opacity-60 truncate">
                  Direct support for bugs, purchases &amp; questions
                </p>
              </div>
            </div>

            {/* Email Address & Copy */}
            <div
              className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
                isDark ? 'bg-slate-950 border-white/10' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <span className="font-mono text-xs font-bold text-pink-400 truncate">
                {developerEmail}
              </span>
              <button
                onClick={copyEmail}
                className="px-2.5 py-1 rounded-lg bg-pink-500 hover:bg-pink-400 active:scale-95 text-white font-black text-[11px] transition-all flex items-center gap-1 shrink-0"
              >
                {copiedEmail ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedEmail ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Direct Email Action Button */}
            <div className="flex gap-2">
              <a
                href={`mailto:${developerEmail}?subject=Arrow%20Bloom%20Support`}
                className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-center font-bold text-xs border border-white/10 transition-all flex items-center justify-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Open Mail App</span>
              </a>
              <button
                onClick={() => onOpenLegal('contact')}
                className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-center font-bold text-xs border border-white/10 transition-all"
              >
                View Support Info
              </button>
            </div>
          </div>
        </div>

        {/* Section 5: Reset Progress */}
        <div className="pt-2 pb-6 border-t border-white/10 flex flex-col gap-2">
          {!showConfirmReset ? (
            <button
              onClick={() => setShowConfirmReset(true)}
              className="w-full py-2.5 px-4 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 active:scale-95 text-rose-500 font-bold text-xs border border-rose-500/30 flex items-center justify-center gap-2 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              <span>Reset Game Progress</span>
            </button>
          ) : (
            <div className="bg-rose-950/80 border border-rose-500/40 rounded-xl p-3 flex flex-col gap-2 text-white animate-fade-in">
              <div className="flex items-center gap-2 text-rose-300 text-xs font-black">
                <AlertCircle className="w-4 h-4" />
                <span>Reset all stars and progress?</span>
              </div>
              <p className="text-[11px] text-white/70">
                This locks later levels and clears all scores. This cannot be undone.
              </p>
              <div className="flex gap-2 mt-1">
                <button
                  onClick={() => {
                    onResetProgress();
                    setShowConfirmReset(false);
                  }}
                  className="flex-1 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-black text-xs"
                >
                  Yes, Reset
                </button>
                <button
                  onClick={() => setShowConfirmReset(false)}
                  className="flex-1 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white font-bold text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
