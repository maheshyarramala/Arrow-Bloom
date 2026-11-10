/**
 * Arrow Bloom - Settings Screen Component
 */
import React, { useState } from 'react';
import { GameSettings } from '../types.ts';
import { ChevronLeft, Volume2, Music, Smartphone, Eye, Sun, Moon, Gauge, Trash2, AlertCircle } from 'lucide-react';

interface SettingsProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
  onResetProgress: () => void;
  onBack: () => void;
}

export const Settings: React.FC<SettingsProps> = ({
  settings,
  onUpdateSettings,
  onResetProgress,
  onBack,
}) => {
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const isDark = settings.theme === 'dark';

  const toggle = (key: keyof Omit<GameSettings, 'theme'>) => {
    onUpdateSettings({
      ...settings,
      [key]: !settings[key],
    });
  };

  const toggleTheme = () => {
    onUpdateSettings({
      ...settings,
      theme: settings.theme === 'dark' ? 'light' : 'dark',
    });
  };

  return (
    <div className="relative w-full h-full flex flex-col pt-safe pb-safe px-4 z-10 overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between py-2 shrink-0">
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

      {/* Settings List */}
      <div className="flex-1 overflow-y-auto py-3 flex flex-col gap-3 max-w-md w-full mx-auto">
        {/* Visual Theme Toggle */}
        <div
          className={`rounded-2xl p-4 border flex items-center justify-between shadow-sm ${
            isDark ? 'bg-slate-900/60 border-white/15' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
              {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="font-black text-sm md:text-base">Appearance</h2>
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
          className={`rounded-2xl p-4 border flex items-center justify-between shadow-sm ${
            isDark ? 'bg-slate-900/60 border-white/15' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center text-pink-400">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-sm md:text-base">Sound Effects</h2>
              <p className="text-xs opacity-60">Pops, combo tones and error buzz</p>
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
          className={`rounded-2xl p-4 border flex items-center justify-between shadow-sm ${
            isDark ? 'bg-slate-900/60 border-white/15' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-sm md:text-base">Music</h2>
              <p className="text-xs opacity-60">Gentle ambient background melody</p>
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
          className={`rounded-2xl p-4 border flex items-center justify-between shadow-sm ${
            isDark ? 'bg-slate-900/60 border-white/15' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-sm md:text-base">Haptics</h2>
              <p className="text-xs opacity-60">Phone vibration on buzz & pop</p>
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

        {/* Color-Blind Friendly Mode */}
        <div
          className={`rounded-2xl p-4 border flex items-center justify-between shadow-sm ${
            isDark ? 'bg-slate-900/60 border-white/15' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-sm md:text-base">Color-Blind Mode</h2>
              <p className="text-xs opacity-60">Distinct patterns on each arrow</p>
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

        {/* Performance Mode */}
        <div className={`rounded-2xl p-4 border flex items-center justify-between shadow-sm ${isDark ? 'bg-slate-900/60 border-white/15' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-sm md:text-base">Performance Mode</h2>
              <p className="text-xs opacity-60">Reduce effects for smoother gameplay</p>
            </div>
          </div>
          <button onClick={() => toggle('performanceMode')} aria-pressed={settings.performanceMode} className={`w-12 h-7 rounded-full transition-colors p-1 flex items-center ${settings.performanceMode ? 'bg-emerald-500' : 'bg-black/20'}`}>
            <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${settings.performanceMode ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>

        {/* Reset Progress */}
        <div className="mt-2 pt-3 border-t border-white/10 flex flex-col gap-2">
          {!showConfirmReset ? (
            <button
              onClick={() => setShowConfirmReset(true)}
              className="w-full py-2.5 px-4 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 active:scale-95 text-rose-500 font-bold text-xs border border-rose-500/30 flex items-center justify-center gap-2 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              <span>Reset Game Progress</span>
            </button>
          ) : (
            <div className="bg-rose-950/80 border border-rose-500/40 rounded-xl p-3 flex flex-col gap-2 text-white">
              <div className="flex items-center gap-2 text-rose-300 text-xs font-black">
                <AlertCircle className="w-4 h-4" />
                <span>Reset all stars and progress?</span>
              </div>
              <p className="text-[11px] text-white/70">
                This locks levels 2–50. This cannot be undone.
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
