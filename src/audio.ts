/**
 * Web Audio API Sound Synthesizer & Procedural BGM
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private bgmInterval: number | null = null;
  private isBgmPlaying = false;
  private soundEnabled = true;
  private musicEnabled = true;
  private vibrationEnabled = true;
  private lastVibrationAt = 0;
  private activeVoices = new Set<OscillatorNode>();

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private createVoice(): OscillatorNode {
    if (this.activeVoices.size >= 4) {
      const oldest = this.activeVoices.values().next().value as OscillatorNode | undefined;
      if (oldest) { try { oldest.stop(); } catch { /* already stopped */ } }
    }
    const osc = this.createVoice();
    this.activeVoices.add(osc);
    osc.onended = () => this.activeVoices.delete(osc);
    return osc;
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    if (this.ctx && this.musicEnabled && !this.isBgmPlaying) this.startBGM();
  }

  public setPreferences(sound: boolean, music: boolean, vibration: boolean) {
    this.soundEnabled = sound;
    this.musicEnabled = music;
    this.vibrationEnabled = vibration;

    if (!music && this.isBgmPlaying) {
      this.stopBGM();
    } else if (music && !this.isBgmPlaying) {
      this.startBGM();
    }
  }

  public vibrate(pattern: number | number[] = 40) {
    if (!this.vibrationEnabled) return;
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(pattern);
      }
    } catch {
      // Ignore vibration errors
    }
  }

  /**
   * Soft cheerful pop sound when an arrow escapes.
   * Pitch rises slightly with combo count.
   */
  public playPop(combo: number = 0) {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.createVoice();
      const gain = this.ctx.createGain();

      // Pentatonic pitch increments based on combo (max combo 8)
      const baseFreq = 440; // A4
      const pentatonicMultipliers = [1, 1.125, 1.25, 1.5, 1.667, 2.0, 2.25, 2.5];
      const mult = pentatonicMultipliers[Math.min(combo, pentatonicMultipliers.length - 1)];
      const freq = baseFreq * mult;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.6, now + 0.12);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);

      // Short celebratory haptic
      this.vibrate(25);
    } catch {
      // Audio failed gracefully
    }
  }

  /**
   * Low buzz sound with warning feel when blocked.
   */
  public playBlocked() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.linearRampToValueAtTime(90, now + 0.22);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);

      this.vibrate([60, 40, 60]);
    } catch {
      // Audio failed gracefully
    }
  }

  /**
   * Win arpeggio fanfare
   */
  public playWin() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51]; // C5, E5, G5, C6, E6
      notes.forEach((freq, index) => {
        const now = this.ctx!.currentTime + index * 0.08;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.28, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now);
        osc.stop(now + 0.4);
      });

      this.vibrate([50, 40, 70, 40, 120]);
    } catch {
      // Audio failed gracefully
    }
  }

  /**
   * Sad descending tone when losing hearts
   */
  public playLoss() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const notes = [392.0, 349.23, 311.13, 261.63]; // G4, F4, Eb4, C4
      notes.forEach((freq, index) => {
        const now = this.ctx!.currentTime + index * 0.14;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now);
        osc.stop(now + 0.35);
      });

      this.vibrate([100, 50, 150]);
    } catch {
      // Audio failed gracefully
    }
  }

  /**
   * Click / Tap UI sound
   */
  public playClick() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // Audio failed gracefully
    }
  }

  /**
   * Hint chime
   */
  public playHint() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const notes = [880, 1174.66, 1760]; // A5, D6, A6
      notes.forEach((freq, index) => {
        const now = this.ctx!.currentTime + index * 0.09;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now);
        osc.stop(now + 0.45);
      });
      this.vibrate(40);
    } catch {
      // Audio failed gracefully
    }
  }

  /**
   * Procedural gentle pentatonic background music loop
   */
  public startBGM() {
    if (!this.musicEnabled || this.isBgmPlaying || !this.ctx) return;
    this.isBgmPlaying = true;
    this.initCtx();

    // C Major Pentatonic frequencies (soft marimba / celesta vibe)
    const scale = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25];
    const pattern = [0, 2, 4, 2, 5, 4, 3, 1, 0, 4, 3, 2, 7, 5, 4, 2];
    let step = 0;

    const playNote = () => {
      if (!this.musicEnabled || !this.isBgmPlaying || !this.ctx) return;

      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        const freq = scale[pattern[step % pattern.length]];
        step++;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        // Very soft, ambient volume
        gain.gain.setValueAtTime(0.035, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.7);
      } catch {
        // fail gracefully
      }
    };

    // Play a note every 450ms
    this.bgmInterval = window.setInterval(playNote, 450);
  }

  public stopBGM() {
    this.isBgmPlaying = false;
    if (this.bgmInterval !== null) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }
}

export const soundManager = new SoundManager();
