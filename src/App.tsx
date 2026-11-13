/**
 * Arrow Bloom - Main Application Controller
 * Handles screen transitions, mid-level resume persistence, Capacitor mobile back-button navigation,
 * 5-second rewarded video ads, ₹99 Lifetime Ad-Free pass, Google Play Games Hub, and legal pages.
 */
import React, { useState, useEffect, useCallback, useReducer, useRef } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import {
  ArrowData,
  CollectionConfig,
  FloatingScoreItem,
  GameSettings,
  LevelConfig,
  PlayerProgress,
  ScreenState,
} from './types.ts';
import { COLLECTIONS } from './levelGenerator.ts';
import {
  checkArrowRay,
  getHintArrow,
  calculateStars,
  computeArrowScore,
} from './gameLogic.ts';
import { soundManager } from './audio.ts';
import {
  loadProgress,
  loadSettings,
  saveSettings,
  updateLevelCompletion,
  resetProgress,
  saveMidLevelState,
  loadMidLevelState,
  clearMidLevelState,
  isAdFreePurchased,
} from './storage.ts';

// Core Components
import { Background } from './components/Background.tsx';
import { TopBar } from './components/TopBar.tsx';
import { ProgressBar } from './components/ProgressBar.tsx';
import { Board } from './components/Board.tsx';
import { BottomBar } from './components/BottomBar.tsx';
import { Home } from './components/Home.tsx';
import { LevelList } from './components/LevelList.tsx';
import { Settings } from './components/Settings.tsx';
import { HowToPlay } from './components/HowToPlay.tsx';
import {
  LevelCompleteModal,
  GameOverModal,
  CollectionCompleteModal,
} from './components/Popups.tsx';
import { LevelWinConfetti } from './components/LevelWinConfetti.tsx';
import { AdModal } from './components/AdModal.tsx';
import { BannerAd } from './components/BannerAd.tsx';
import { ShopModal } from './components/ShopModal.tsx';
import { GameCenterModal } from './components/GameCenterModal.tsx';
import { LegalPagesModal, LegalTab } from './components/LegalPagesModal.tsx';
import { DailyMissionsModal } from './components/DailyMissionsModal.tsx';
import { recordMissionEvent, consumeScoreMultiplier, getTodayDateString, getDailyChallengeLevel } from './dailyMissions.ts';
import { saveProgress } from './storage.ts';

// Score Reducer
type ScoreAction =
  | { type: 'ADD_SCORE'; points: number }
  | { type: 'RESET_SCORE' }
  | { type: 'SET_SCORE'; score: number };

function scoreReducer(state: number, action: ScoreAction): number {
  switch (action.type) {
    case 'ADD_SCORE':
      return state + action.points;
    case 'RESET_SCORE':
      return 0;
    case 'SET_SCORE':
      return action.score;
    default:
      return state;
  }
}

export default function App() {
  // Navigation & Settings
  const [screen, setScreen] = useState<ScreenState>('home');
  const [currentLevelNumber, setCurrentLevelNumber] = useState<number>(1);
  const [settings, setSettings] = useState<GameSettings>(loadSettings);
  const [progress, setProgress] = useState<PlayerProgress>(loadProgress);
  const [isAdFree, setIsAdFree] = useState<boolean>(isAdFreePurchased);
  const [isDailyChallenge, setIsDailyChallenge] = useState(false);

  // Active Level Data
  const EMPTY_LEVEL: LevelConfig = {
    levelNumber: 1,
    collectionId: 1,
    shapeName: '',
    gridSize: 10,
    playableMask: [],
    playableCells: [],
    arrows: [],
    solutionOrder: [],
    stats: { depth: 0, initialFreeCount: 0, coveragePct: 0, trapPct: 0, avgLength: 0 },
  };
  const [levelConfig, setLevelConfig] = useState<LevelConfig>(EMPTY_LEVEL);
  const [activeArrows, setActiveArrows] = useState<ArrowData[]>([]);
  const [isPreparingLevel, setIsPreparingLevel] = useState(false);
  const [generationMs, setGenerationMs] = useState(0);
  const [showPerfOverlay, setShowPerfOverlay] = useState(false);
  const [isBoardDragging, setIsBoardDragging] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  const prefetchedLevelsRef = useRef<Map<number, LevelConfig>>(new Map());
  const pendingLevelsRef = useRef<
    Map<number, Array<{ resolve: (level: LevelConfig) => void; reject: (error: Error) => void }>>
  >(new Map());
  const levelRequestIdRef = useRef(0);

  // Score Reducer
  const [score, dispatchScore] = useReducer(scoreReducer, 0);

  // In-Game Stats
  const [hearts, setHearts] = useState<number>(3);
  const [mistakes, setMistakes] = useState<number>(0);
  const [comboCount, setComboCount] = useState<number>(0);
  const [showComboPill, setShowComboPill] = useState<boolean>(false);
  const comboHideTimerRef = useRef<number | null>(null);
  const lastClearTimeRef = useRef<number>(0);

  // Floating score bubbles
  const [floatingScores, setFloatingScores] = useState<FloatingScoreItem[]>([]);

  // Undo History & Hints
  const [undoHistory, setUndoHistory] = useState<ArrowData[]>([]);
  const [hintsLeft, setHintsLeft] = useState<number>(3);
  const [hintedArrowId, setHintedArrowId] = useState<string | null>(null);

  // Animations & Board Interaction
  const [escapingArrows, setEscapingArrows] = useState<
    Array<{ arrow: ArrowData; startedAt: number; duration: number }>
  >([]);
  const [shakingArrowId, setShakingArrowId] = useState<string | null>(null);
  const [flashBlockedArrowId, setFlashBlockedArrowId] = useState<string | null>(null);

  // Zoom & Pan state
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Popups & Dialogs
  const [showLevelComplete, setShowLevelComplete] = useState<boolean>(false);
  const [showGameOver, setShowGameOver] = useState<boolean>(false);
  const [showCollectionComplete, setShowCollectionComplete] = useState<boolean>(false);
  const [completedCollection, setCompletedCollection] = useState<CollectionConfig | null>(null);
  const [nextCollection, setNextCollection] = useState<CollectionConfig | null>(null);
  const [isGrandFinale, setIsGrandFinale] = useState<boolean>(false);
  const [isNewHighScore, setIsNewHighScore] = useState<boolean>(false);

  // Monetization & Legal Modals
  const [showShop, setShowShop] = useState<boolean>(false);
  const [showGameCenter, setShowGameCenter] = useState<boolean>(false);
  const [showLegal, setShowLegal] = useState<boolean>(false);
  const [legalInitialTab, setLegalInitialTab] = useState<LegalTab>('privacy');
  const [showDailyMissions, setShowDailyMissions] = useState<boolean>(false);
  const [adState, setAdState] = useState<{
    isOpen: boolean;
    reason: 'hint' | 'free_hits' | 'double_score' | 'interstitial';
    onReward?: () => void;
  }>({
    isOpen: false,
    reason: 'hint',
  });

  // Level worker setup
  useEffect(() => {
    const worker = new Worker(new URL('./levelWorker.ts', import.meta.url), { type: 'module' });
    workerRef.current = worker;
    worker.onmessage = (
      event: MessageEvent<{
        levelNumber: number;
        level?: LevelConfig;
        error?: string;
        generationMs?: number;
      }>
    ) => {
      const pending = pendingLevelsRef.current.get(event.data.levelNumber);
      if (!pending) {
        if (event.data.level) prefetchedLevelsRef.current.set(event.data.levelNumber, event.data.level);
        return;
      }
      pendingLevelsRef.current.delete(event.data.levelNumber);
      if (event.data.level) {
        setGenerationMs(event.data.generationMs || 0);
        pending.forEach((item) => item.resolve(event.data.level!));
      } else {
        pending.forEach((item) =>
          item.reject(new Error(event.data.error || 'Level generation failed'))
        );
      }
    };
    // Warm the next playable puzzle while the player is still on the home screen.
    worker.postMessage({ levelNumber: Math.max(1, Math.min(300, progress.unlockedLevel || 1)) });
    worker.onerror = () => {
      pendingLevelsRef.current.forEach((resolvers) =>
        resolvers.forEach((item) => item.reject(new Error('Level worker failed')))
      );
      pendingLevelsRef.current.clear();
    };
    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, []);

  const togglePerfOverlay = useCallback(() => setShowPerfOverlay((value) => !value), []);
  const enablePerformanceMode = useCallback(
    () => setSettings((current) => (current.performanceMode ? current : { ...current, performanceMode: true })),
    []
  );
  const handleDraggingChange = useCallback((dragging: boolean) => setIsBoardDragging(dragging), []);

  const requestLevel = useCallback(
    (levelNumber: number) => {
      const prefetched = prefetchedLevelsRef.current.get(levelNumber);
      if (prefetched) {
        prefetchedLevelsRef.current.delete(levelNumber);
        return Promise.resolve(prefetched);
      }
      return new Promise<LevelConfig>((resolve, reject) => {
        const worker = workerRef.current;
        if (!worker) {
          reject(new Error('Level worker is not ready'));
          return;
        }
        const waiting = pendingLevelsRef.current.get(levelNumber) || [];
        waiting.push({ resolve, reject });
        pendingLevelsRef.current.set(levelNumber, waiting);
        worker.postMessage({ levelNumber });
      });
    },
    []
  );

  // Sync settings & sound
  useEffect(() => {
    soundManager.setPreferences(
      settings.soundEnabled,
      settings.musicEnabled,
      settings.vibrationEnabled
    );
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    return () => {
      if (comboHideTimerRef.current) clearTimeout(comboHideTimerRef.current);
    };
  }, []);

  const currentCollection =
    COLLECTIONS.find((c) => c.id === levelConfig.collectionId) || COLLECTIONS[0];

  const activeArrowsRef = useRef<ArrowData[]>(activeArrows);
  activeArrowsRef.current = activeArrows;
  const removedArrowIdsRef = useRef<Set<string>>(new Set());
  const escapeTimersRef = useRef<Map<string, number>>(new Map());
  const completionCommittedRef = useRef(false);

  // Start Level: Supports Mid-Level Resume Persistence!
  const startLevel = useCallback(
    async (lvlNum: number, fromScratch = false, extraHint = false, dailyChallenge = false) => {
      const requestId = ++levelRequestIdRef.current;
      setIsDailyChallenge(dailyChallenge);
      setIsPreparingLevel(true);
      // Start each puzzle in a predictable fit-to-screen view.
      setZoomLevel(1);
      setPanOffset({ x: 0, y: 0 });
      setActiveArrows([]);
      setLevelConfig(EMPTY_LEVEL);
      setCurrentLevelNumber(lvlNum);
      setScreen('game');

      try {
        const config = await requestLevel(lvlNum);
        if (requestId !== levelRequestIdRef.current) return;
        setLevelConfig(config);

        // Check if there is an in-progress board saved for this level
        const savedMidState = fromScratch ? null : loadMidLevelState(lvlNum);

        if (savedMidState && savedMidState.activeArrows && savedMidState.activeArrows.length > 0) {
          // RESUME EXACTLY WHERE PLAYER LEFT OFF
          setActiveArrows(savedMidState.activeArrows.map((a) => ({ ...a, cells: a.cells })));
          activeArrowsRef.current = savedMidState.activeArrows;
          setHearts(Math.max(1, savedMidState.hearts || 3));
          setMistakes(savedMidState.mistakes || 0);
          dispatchScore({ type: 'SET_SCORE', score: savedMidState.score || 0 });
          setHintsLeft(extraHint ? (savedMidState.hintsLeft || 3) + 1 : savedMidState.hintsLeft || 3);
        } else {
          // Fresh board start
          clearMidLevelState();
          setActiveArrows(config.arrows.map((a) => ({ ...a, cells: a.cells })));
          activeArrowsRef.current = config.arrows;
          setHearts(3);
          setMistakes(0);
          dispatchScore({ type: 'RESET_SCORE' });
          const missionBonusHints = progress.dailyMissions?.bonusHintsBank || 0;
          setHintsLeft(extraHint ? 4 + missionBonusHints : 3 + missionBonusHints);
        }

        setComboCount(0);
        setShowComboPill(false);
        lastClearTimeRef.current = 0;
        setUndoHistory([]);
        setHintedArrowId(null);
        setEscapingArrows([]);
        completionCommittedRef.current = false;
        removedArrowIdsRef.current.clear();
        escapeTimersRef.current.forEach((timer) => window.clearTimeout(timer));
        escapeTimersRef.current.clear();
        setShakingArrowId(null);
        setFlashBlockedArrowId(null);
        setFloatingScores([]);
        setZoomLevel(1);
        setPanOffset({ x: 0, y: 0 });
        setShowLevelComplete(false);
        setShowGameOver(false);
        setShowCollectionComplete(false);
      } catch {
        setScreen('home');
      } finally {
        if (requestId === levelRequestIdRef.current) setIsPreparingLevel(false);
      }
    },
    [requestLevel]
  );

  // Arrow selection
  const handleArrowSelect = useCallback(
    (arrowId: string) => {
      const boardNow = activeArrowsRef.current;
      if (hearts <= 0 || completionCommittedRef.current || removedArrowIdsRef.current.has(arrowId))
        return;
      const arrow = boardNow.find((item) => item.id === arrowId);
      if (!arrow) return;

      const rayResult = checkArrowRay(arrowId, boardNow, levelConfig.gridSize);
      if (!rayResult.isFree) {
        setShakingArrowId(arrowId);
        setFlashBlockedArrowId(rayResult.blockingArrowId || null);
        soundManager.playBlocked();
        setComboCount(0);
        setShowComboPill(false);
        setMistakes((value) => value + 1);
        setHearts((value) => {
          const next = Math.max(0, value - 1);
          if (next === 0) {
            window.setTimeout(() => {
              soundManager.playLoss();
              // Persist current board state so "Retry with Free Hits" continues right here!
              saveMidLevelState({
                levelNumber: currentLevelNumber,
                activeArrows: boardNow,
                score,
                mistakes: mistakes + 1,
                hintsLeft,
                hearts: 0,
                savedAt: Date.now(),
              });
              setShowGameOver(true);
            }, 450);
          }
          return next;
        });
        window.setTimeout(() => {
          setShakingArrowId(null);
          setFlashBlockedArrowId(null);
        }, 420);
        return;
      }

      // Remove from occupancy immediately
      removedArrowIdsRef.current.add(arrowId);
      const nextBoard = boardNow.filter((item) => item.id !== arrowId);
      activeArrowsRef.current = nextBoard;
      setActiveArrows(nextBoard);

      const now = performance.now();
      const speed = settings.animationSpeed || 'slow';
      const speedMultiplier = speed === 'fast' ? 0.62 : speed === 'normal' ? 0.82 : 1;
      const animationDuration = Math.round(
        Math.min(3400, Math.max(1300, 950 + arrow.cells.length * 42)) * speedMultiplier
      );
      setEscapingArrows((current) => [
        ...current.filter((item) => item.arrow.id !== arrowId),
        { arrow, startedAt: now, duration: animationDuration },
      ]);
      const diff = now - lastClearTimeRef.current;
      const nextCombo = lastClearTimeRef.current > 0 && diff < 1200 ? comboCount + 1 : 1;
      setComboCount(nextCombo);
      lastClearTimeRef.current = now;
      if (nextCombo > 1) {
        setShowComboPill(true);
        if (comboHideTimerRef.current) clearTimeout(comboHideTimerRef.current);
        comboHideTimerRef.current = window.setTimeout(() => setShowComboPill(false), 700);
      }
      soundManager.playPop(nextCombo);
      const scoreMultiplier = progress.dailyMissions?.activeScoreMultiplier || 1;
      const basePts = computeArrowScore(arrow.cells.length, nextCombo);
      const pts = basePts * scoreMultiplier;
      dispatchScore({ type: 'ADD_SCORE', points: pts });
      const nextTotalScore = score + pts;

      // Track mission progress for arrows cleared and combos reached
      let progNow = progress;
      const { updatedProgress: pArrows } = recordMissionEvent(progNow, { type: 'ARROWS_CLEARED', count: 1 });
      progNow = {
        ...pArrows,
        stats: {
          arrowsCleared: (pArrows.stats?.arrowsCleared || 0) + 1,
          bestCombo: Math.max(pArrows.stats?.bestCombo || 0, nextCombo),
          perfectLevels: pArrows.stats?.perfectLevels || 0,
          lastPlayedAt: Date.now(),
        },
      };
      if (nextCombo >= 4) {
        const { updatedProgress: pCombo } = recordMissionEvent(progNow, { type: 'COMBO_REACHED', comboCount: nextCombo });
        progNow = pCombo;
      }
      setProgress(progNow);
      saveProgress(progNow);

      // Persist mid-level state on every arrow clear
      if (nextBoard.length > 0) {
        saveMidLevelState({
          levelNumber: currentLevelNumber,
          activeArrows: nextBoard,
          score: nextTotalScore,
          mistakes,
          hintsLeft,
          hearts,
          savedAt: Date.now(),
        });
      }

      const head = arrow.cells[arrow.cells.length - 1];
      const floatText =
        scoreMultiplier > 1
          ? nextCombo > 1
            ? `+${pts} (${scoreMultiplier}x COMBO!)`
            : `+${pts} (${scoreMultiplier}x!)`
          : nextCombo > 1
          ? `+${pts} COMBO!`
          : `+${pts}`;

      const floatItem: FloatingScoreItem = {
        id: now,
        text: floatText,
        x: (head.c + 0.5) * (360 / levelConfig.gridSize),
        y: (head.r + 0.5) * (360 / levelConfig.gridSize),
        color: scoreMultiplier > 1 ? '#00E5FF' : nextCombo > 1 ? '#FBBF24' : '#10E7A1',
        createdAt: now,
      };
      setFloatingScores((prev) => [...prev.slice(-2), floatItem]);
      setUndoHistory((hist) => [...hist, arrow]);

      const finishAnimation = () => {
        removedArrowIdsRef.current.delete(arrowId);
        setEscapingArrows((current) => current.filter((item) => item.arrow.id !== arrowId));
        escapeTimersRef.current.delete(arrowId);
        if (
          activeArrowsRef.current.length !== 0 ||
          escapeTimersRef.current.size > 0 ||
          completionCommittedRef.current
        )
          return;

        // Level Complete: Clear mid-level state
        clearMidLevelState();
        completionCommittedRef.current = true;
        const finalMistakes = mistakes;
        const finalScore = nextTotalScore + (finalMistakes === 0 ? 500 : 0);
        const stars = calculateStars(finalMistakes);
        const previous = progress.levelData[currentLevelNumber];
        setIsNewHighScore(!previous || finalScore > (previous.highScore || 0));

        // Record daily mission for level cleared & flawless clear, and consume multiplier
        const { updatedProgress: pWin } = recordMissionEvent(progress, {
          type: 'LEVEL_CLEARED',
          levelNumber: currentLevelNumber,
          mistakes: finalMistakes,
          stars,
        });
        const pConsumedBase = consumeScoreMultiplier(pWin);
        const pConsumed: PlayerProgress = {
          ...pConsumedBase,
          stats: {
            arrowsCleared: pConsumedBase.stats?.arrowsCleared || 0,
            bestCombo: Math.max(pConsumedBase.stats?.bestCombo || 0, comboCount),
            perfectLevels: (pConsumedBase.stats?.perfectLevels || 0) + (finalMistakes === 0 ? 1 : 0),
            lastPlayedAt: Date.now(),
          },
        };
        let nextSavedProgress: PlayerProgress;
        if (isDailyChallenge) {
          const today = getTodayDateString();
          const alreadyClaimed = pConsumed.dailyChallenge?.date === today && pConsumed.dailyChallenge.completed;
          nextSavedProgress = {
            ...pConsumed,
            dailyChallenge: { date: today, levelNumber: currentLevelNumber, completed: true },
            dailyMissions: pConsumed.dailyMissions
              ? { ...pConsumed.dailyMissions, bonusHintsBank: pConsumed.dailyMissions.bonusHintsBank + (alreadyClaimed ? 0 : 2) }
              : pConsumed.dailyMissions,
          };
          saveProgress(nextSavedProgress);
        } else {
          nextSavedProgress = updateLevelCompletion(pConsumed, currentLevelNumber, stars, finalScore);
        }
        setProgress(nextSavedProgress);
        soundManager.playWin();

        if (currentLevelNumber % 10 === 0) {
          const index = Math.floor((currentLevelNumber - 1) / 10);
          setCompletedCollection(COLLECTIONS[index] || null);
          setNextCollection(COLLECTIONS[index + 1] || null);
          setIsGrandFinale(currentLevelNumber === 300);
          setShowCollectionComplete(true);
        } else {
          setShowLevelComplete(true);
        }
      };
      const timer = window.setTimeout(finishAnimation, animationDuration);
      escapeTimersRef.current.set(arrowId, timer);
    },
    [hearts, levelConfig.gridSize, comboCount, mistakes, score, hintsLeft, progress, currentLevelNumber, settings.animationSpeed, isDailyChallenge]
  );

  const handleArrowSelectRef = useRef<(arrowId: string) => void>(() => {});
  handleArrowSelectRef.current = handleArrowSelect;
  const handleArrowSelectStable = useCallback(
    (arrowId: string) => handleArrowSelectRef.current(arrowId),
    []
  );

  const toggleTheme = useCallback(() => {
    setSettings((current) => ({
      ...current,
      theme: current.theme === 'dark' ? 'light' : 'dark',
    }));
  }, []);

  const openSettings = useCallback(() => setScreen('settings'), []);
  const zoomIn = useCallback(() => setZoomLevel((current) => Math.min(4, current + 0.35)), []);
  const zoomOut = useCallback(() => {
    setZoomLevel((current) => {
      const next = Math.max(1, current - 0.35);
      if (next === 1) setPanOffset({ x: 0, y: 0 });
      return next;
    });
  }, []);
  const zoomFit = useCallback(() => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  }, []);

  // Undo (Z)
  const handleUndo = useCallback(() => {
    if (undoHistory.length === 0) return;
    const lastArrow = undoHistory[undoHistory.length - 1];
    const timer = escapeTimersRef.current.get(lastArrow.id);
    if (timer !== undefined) window.clearTimeout(timer);
    escapeTimersRef.current.delete(lastArrow.id);
    removedArrowIdsRef.current.delete(lastArrow.id);
    setEscapingArrows((current) => current.filter((item) => item.arrow.id !== lastArrow.id));
    setUndoHistory((hist) => hist.slice(0, -1));
    const restored = [...activeArrowsRef.current, lastArrow];
    activeArrowsRef.current = restored;
    setActiveArrows(restored);
    soundManager.playClick();

    // Update mid-level state
    saveMidLevelState({
      levelNumber: currentLevelNumber,
      activeArrows: restored,
      score,
      mistakes,
      hintsLeft,
      hearts,
      savedAt: Date.now(),
    });
  }, [undoHistory, currentLevelNumber, score, mistakes, hintsLeft, hearts]);

  // Execute Hint Action
  const executeHintAction = useCallback(() => {
    const boardNow = activeArrowsRef.current;
    if (boardNow.length === 0 || isPreparingLevel) return;
    const target = getHintArrow(boardNow, levelConfig.solutionOrder, levelConfig.gridSize);
    if (!target) {
      soundManager.playBlocked();
      return;
    }
    setHintedArrowId(target.id);
    soundManager.playHint();
    window.setTimeout(
      () => setHintedArrowId((current) => (current === target.id ? null : current)),
      2800
    );
  }, [levelConfig, isPreparingLevel]);

  // Hint handler with Rewarded Ad & VIP support
  const handleHint = useCallback(() => {
    const boardNow = activeArrowsRef.current;
    if (boardNow.length === 0 || isPreparingLevel) return;

    if (isAdFree) {
      // VIP: Instant free hints forever!
      executeHintAction();
      return;
    }

    if (hintsLeft > 0) {
      // Use standard banked hint
      setHintsLeft((rem) => {
        const next = Math.max(0, rem - 1);
        saveMidLevelState({
          levelNumber: currentLevelNumber,
          activeArrows: boardNow,
          score,
          mistakes,
          hintsLeft: next,
          hearts,
          savedAt: Date.now(),
        });
        return next;
      });
      executeHintAction();
    } else {
      // Out of hints: Trigger 5-second rewarded video ad!
      setAdState({
        isOpen: true,
        reason: 'hint',
        onReward: () => {
          executeHintAction();
        },
      });
    }
  }, [isAdFree, hintsLeft, isPreparingLevel, executeHintAction, currentLevelNumber, score, mistakes, hearts]);

  // "Continue with Free Hits" on Game Over:
  // Starts game right where it ended, restores 3 hearts, and plays 5s ad (or instant for VIP)!
  const handleContinueWithFreeHits = useCallback(() => {
    const performContinue = () => {
      setHearts(3);
      setShowGameOver(false);
      soundManager.playWin();
      // Update saved mid-level state with restored hearts
      saveMidLevelState({
        levelNumber: currentLevelNumber,
        activeArrows: activeArrowsRef.current,
        score,
        mistakes,
        hintsLeft,
        hearts: 3,
        savedAt: Date.now(),
      });
    };

    if (isAdFree) {
      performContinue();
    } else {
      setAdState({
        isOpen: true,
        reason: 'free_hits',
        onReward: performContinue,
      });
    }
  }, [isAdFree, currentLevelNumber, score, mistakes, hintsLeft]);

  // 2x Score Ad Bonus on Level Complete
  const handleDoubleScoreAd = useCallback(() => {
    const performDouble = () => {
      dispatchScore({ type: 'ADD_SCORE', points: score });
      soundManager.playWin();
    };

    if (isAdFree) {
      performDouble();
    } else {
      setAdState({
        isOpen: true,
        reason: 'double_score',
        onReward: performDouble,
      });
    }
  }, [isAdFree, score]);

  // Centralized Navigation
  const goHome = useCallback(() => {
    setShowLevelComplete(false);
    setShowGameOver(false);
    setShowCollectionComplete(false);
    setIsPreparingLevel(false);
    setScreen('home');
  }, []);

  const goLevels = useCallback(() => {
    // Save mid-level state if active board
    if (activeArrowsRef.current.length > 0 && hearts > 0) {
      saveMidLevelState({
        levelNumber: currentLevelNumber,
        activeArrows: activeArrowsRef.current,
        score,
        mistakes,
        hintsLeft,
        hearts,
        savedAt: Date.now(),
      });
    }
    setShowLevelComplete(false);
    setShowGameOver(false);
    setShowCollectionComplete(false);
    setIsPreparingLevel(false);
    setScreen('home');
  }, [currentLevelNumber, score, mistakes, hintsLeft, hearts]);

  // Hardware Back Button Handler (Capacitor & Web popstate)
  // Ensures pressing back navigates UI cleanly rather than killing the app!
  const stateSnapshotRef = useRef({
    screen,
    adOpen: adState.isOpen,
    showShop,
    showGameCenter,
    showLegal,
    showDailyMissions,
    showLevelComplete,
    showGameOver,
    showCollectionComplete,
  });

  stateSnapshotRef.current = {
    screen,
    adOpen: adState.isOpen,
    showShop,
    showGameCenter,
    showLegal,
    showDailyMissions,
    showLevelComplete,
    showGameOver,
    showCollectionComplete,
  };

  const handleBackNavigation = useCallback(() => {
    const s = stateSnapshotRef.current;

    // 1. Close open full-screen modals first
    if (s.adOpen) {
      setAdState((prev) => ({ ...prev, isOpen: false }));
      return true;
    }
    if (s.showDailyMissions) {
      setShowDailyMissions(false);
      return true;
    }
    if (s.showShop) {
      setShowShop(false);
      return true;
    }
    if (s.showGameCenter) {
      setShowGameCenter(false);
      return true;
    }
    if (s.showLegal) {
      setShowLegal(false);
      return true;
    }
    if (s.showLevelComplete || s.showGameOver || s.showCollectionComplete) {
      goLevels();
      return true;
    }

    // 2. Screen hierarchy navigation
    if (s.screen === 'game') {
      goLevels();
      return true;
    }
    if (s.screen === 'levels' || s.screen === 'settings' || s.screen === 'how-to-play') {
      goHome();
      return true;
    }

    // 3. At Home: let default action occur
    return false;
  }, [goHome, goLevels]);

  // Register Capacitor native backButton listener
  useEffect(() => {
    let backListenerHandle: { remove: () => void } | null = null;
    CapacitorApp.addListener('backButton', ({ canGoBack }) => {
      const handled = handleBackNavigation();
      if (!handled && !canGoBack) {
        // At home screen, exit app if no more history
        CapacitorApp.exitApp();
      }
    }).then((handle) => {
      backListenerHandle = handle;
    });

    return () => {
      if (backListenerHandle) backListenerHandle.remove();
    };
  }, [handleBackNavigation]);

  // Web fallback popstate
  useEffect(() => {
    window.history.pushState({ arrowBloom: true }, '');
    const onPopState = () => {
      window.history.pushState({ arrowBloom: true }, '');
      handleBackNavigation();
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [handleBackNavigation]);

  // Keyboard Shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'r' || e.key === 'R') {
        if (screen === 'game') startLevel(currentLevelNumber, true);
      } else if (e.key === 'z' || e.key === 'Z') {
        if (screen === 'game') handleUndo();
      } else if (e.key === 'h' || e.key === 'H') {
        if (screen === 'game') handleHint();
      } else if (e.key === 'Escape') {
        handleBackNavigation();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [screen, currentLevelNumber, startLevel, handleUndo, handleHint, handleBackNavigation]);

  // Tutorial arrow highlight on Level 1
  const tutorialArrowId =
    currentLevelNumber === 1 && mistakes === 0 && undoHistory.length === 0
      ? getHintArrow(activeArrows, levelConfig.solutionOrder, levelConfig.gridSize)?.id || null
      : null;

  const isDark = settings.theme === 'dark';

  return (
    <main
      className={`relative w-full h-[100dvh] flex flex-col justify-between overflow-hidden select-none font-['Fredoka',sans-serif] pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] ${
        isDark ? 'text-white' : 'text-slate-800'
      }`}
    >
      {/* Dynamic Animated Background */}
      <Background
        collection={screen === 'game' ? currentCollection : null}
        theme={settings.theme}
        performanceMode={settings.performanceMode}
        paused={isBoardDragging || (screen === 'game' && levelConfig.gridSize >= 20)}
      />

      {/* Screen 1: Home Screen */}
      {screen === 'home' && (
        <Home
          progress={progress}
          isDarkTheme={isDark}
          onPlayLevel={(lvl) => startLevel(lvl)}
          dailyChallengeLevel={getDailyChallengeLevel()}
          dailyChallengeCompleted={progress.dailyChallenge?.date === getTodayDateString() && progress.dailyChallenge.completed}
          onPlayDailyChallenge={() => startLevel(getDailyChallengeLevel(), true, false, true)}
          onOpenSettings={() => setScreen('settings')}
          onOpenShop={() => setShowShop(true)}
          onOpenGameCenter={() => setShowGameCenter(true)}
          onOpenDailyMissions={() => setShowDailyMissions(true)}
        />
      )}

      {/* Screen 2: Level List Screen */}
      {screen === 'levels' && (
        <LevelList
          progress={progress}
          isDarkTheme={isDark}
          onSelectLevel={(lvl) => startLevel(lvl)}
          onBack={goHome}
        />
      )}

      {/* Screen 3: Settings Screen */}
      {screen === 'settings' && (
        <Settings
          settings={settings}
          onUpdateSettings={(newSettings) => setSettings(newSettings)}
          onResetProgress={() => {
            const fresh = resetProgress();
            setProgress(fresh);
            soundManager.playClick();
          }}
          onOpenHowToPlay={() => setScreen('how-to-play')}
          onOpenLegal={(tab) => {
            setLegalInitialTab(tab || 'privacy');
            setShowLegal(true);
          }}
          onBack={() => setScreen('home')}
        />
      )}

      {/* Screen 4: How To Play Screen */}
      {screen === 'how-to-play' && <HowToPlay onClose={() => setScreen('settings')} />}

      {/* Screen 5: Game Screen */}
      {screen === 'game' && (
        <div className="relative w-full h-full flex flex-col justify-between overflow-hidden z-10">
          {/* Compact Top Bar */}
          <TopBar
            levelNumber={currentLevelNumber}
            shapeName={levelConfig.shapeName}
            collectionName={currentCollection.name}
            score={score}
            theme={settings.theme}
            isAdFree={isAdFree}
            scoreMultiplier={progress.dailyMissions?.activeScoreMultiplier || 1}
            onToggleTheme={toggleTheme}
            onOpenSettings={openSettings}
            onOpenShop={() => setShowShop(true)}
            onBack={goLevels}
            onToggleDebug={import.meta.env.DEV ? togglePerfOverlay : undefined}
          />

          {/* Hearts & Rainbow Progress Bar */}
          <ProgressBar
            hearts={hearts}
            remainingCount={activeArrows.length}
            initialCount={levelConfig.arrows.length}
            isDarkTheme={isDark}
          />

          {isPreparingLevel && (
            <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
              <div className="flex items-center gap-2 rounded-full px-4 py-2 bg-slate-950/85 text-cyan-300 text-xs font-bold border border-cyan-400/30">
                <span className="w-4 h-4 rounded-full border-2 border-cyan-300/30 border-t-cyan-300 animate-spin" />
                Preparing level...
              </div>
            </div>
          )}

          {/* High-Resolution Dynamic Scaled Board */}
          <Board
            gridSize={levelConfig.gridSize}
            playableMask={levelConfig.playableMask}
            arrows={activeArrows}
            isDarkTheme={isDark}
            colorBlindMode={settings.colorBlindMode}
            escapingArrows={escapingArrows}
            shakingArrowId={shakingArrowId}
            flashBlockedArrowId={flashBlockedArrowId}
            hintedArrowId={hintedArrowId}
            tutorialArrowId={tutorialArrowId}
            comboCount={comboCount}
            showComboPill={showComboPill}
            floatingScores={floatingScores}
            zoomLevel={zoomLevel}
            panOffset={panOffset}
            onZoomChange={setZoomLevel}
            onPanChange={setPanOffset}
            onArrowSelect={handleArrowSelectStable}
            performanceMode={settings.performanceMode}
            onPerformanceModeChange={enablePerformanceMode}
            onDraggingChange={handleDraggingChange}
            debugOverlay={import.meta.env.DEV && showPerfOverlay}
            generationMs={generationMs}
          />

          {/* In-Game Bottom Bar */}
          <BottomBar
            canUndo={undoHistory.length > 0}
            hintsLeft={hintsLeft}
            zoomLevel={zoomLevel}
            isDarkTheme={isDark}
            isAdFree={isAdFree}
            onUndo={handleUndo}
            onHint={handleHint}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            onZoomFit={zoomFit}
          />
        </div>
      )}

      {/* Persistent Bottom Banner Ad (Hidden if Lifetime Ad-Free is purchased) */}
      <BannerAd
        isAdFree={isAdFree}
        isDarkTheme={isDark}
        onOpenShop={() => setShowShop(true)}
      />

      {/* Level Complete Celebration Confetti */}
      <LevelWinConfetti
        active={showLevelComplete || showCollectionComplete}
        colorIndices={levelConfig.arrows.map((a) => a.colorIndex)}
      />

      {/* Level Complete Modal */}
      {showLevelComplete && (
        <LevelCompleteModal
          levelNumber={currentLevelNumber}
          shapeName={levelConfig.shapeName}
          stars={calculateStars(mistakes)}
          score={score}
          mistakes={mistakes}
          isNewHigh={isNewHighScore}
          hasNextLevel={currentLevelNumber < 300}
          isAdFree={isAdFree}
          isDailyChallenge={isDailyChallenge}
          arrowsCleared={levelConfig.arrows.length}
          solutionDepth={levelConfig.stats.depth}
          gridSize={levelConfig.gridSize}
          onNextLevel={() => isDailyChallenge ? goHome() : startLevel(currentLevelNumber + 1)}
          onReplay={() => startLevel(currentLevelNumber, true)}
          onHome={goHome}
          onDoubleScoreAd={handleDoubleScoreAd}
        />
      )}

      {/* Game Over Modal (Supports Continuing with Free Hits right where ended!) */}
      {showGameOver && (
        <GameOverModal
          levelNumber={currentLevelNumber}
          remainingArrowsCount={activeArrows.length}
          isAdFree={isAdFree}
          onContinueWithFreeHits={handleContinueWithFreeHits}
          onRestartFromScratch={() => startLevel(currentLevelNumber, true)}
          onHome={goLevels}
        />
      )}

      {/* Collection Complete Modal */}
      {showCollectionComplete && completedCollection && (
        <CollectionCompleteModal
          completedCollection={completedCollection}
          nextCollection={nextCollection}
          isGameFinale={isGrandFinale}
          onContinue={() => {
            if (isGrandFinale) {
              setScreen('home');
            } else {
              startLevel(currentLevelNumber + 1);
            }
          }}
          onHome={goHome}
        />
      )}

      {/* 5-Second Rewarded Video Ad Modal */}
      {adState.isOpen && (
        <AdModal
          reason={adState.reason}
          onReward={() => {
            if (adState.onReward) adState.onReward();
          }}
          onClose={() => setAdState((prev) => ({ ...prev, isOpen: false }))}
          onOpenShop={() => setShowShop(true)}
        />
      )}

      {/* Shop & ₹99 Lifetime Ad-Free Modal */}
      <ShopModal
        isOpen={showShop}
        onClose={() => setShowShop(false)}
        onAdFreeBought={() => {
          setIsAdFree(true);
        }}
      />

      {/* Google Play Games Center Hub */}
      <GameCenterModal
        isOpen={showGameCenter}
        progress={progress}
        onClose={() => setShowGameCenter(false)}
        onOpenShop={() => {
          setShowGameCenter(false);
          setShowShop(true);
        }}
      />

      {/* Legal, Privacy & Compliance Hub */}
      <LegalPagesModal
        isOpen={showLegal}
        initialTab={legalInitialTab}
        onClose={() => setShowLegal(false)}
      />

      {/* Daily Missions & Retention Modal */}
      <DailyMissionsModal
        isOpen={showDailyMissions}
        progress={progress}
        onUpdateProgress={setProgress}
        onClose={() => setShowDailyMissions(false)}
      />
    </main>
  );
}
