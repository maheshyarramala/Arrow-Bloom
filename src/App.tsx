/**
 * Arrow Bloom - Main Application Controller
 * Handles screen transitions, live score reducer, combo timers, zoom/pan state,
 * and popup milestones.
 */
import React, { useState, useEffect, useCallback, useReducer, useRef } from 'react';
import {
  ArrowData,
  CollectionConfig,
  FloatingScoreItem,
  GameSettings,
  LevelConfig,
  PlayerProgress,
  ScreenState,
} from './types.ts';
import {
  getLevel,
  COLLECTIONS,
  preloadAndVerifyAllLevels,
} from './levelGenerator.ts';
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
  saveProgress,
  saveSettings,
  updateLevelCompletion,
  resetProgress,
} from './storage.ts';

// Components
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

// Score Action & Reducer to ensure score NEVER stays at 0
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

  // Active Level Data
  const [levelConfig, setLevelConfig] = useState<LevelConfig>(() => getLevel(1));
  const [activeArrows, setActiveArrows] = useState<ArrowData[]>(() => levelConfig.arrows);

  // Score Reducer
  const [score, dispatchScore] = useReducer(scoreReducer, 0);

  // In-Game Stats
  const [hearts, setHearts] = useState<number>(3);
  const [mistakes, setMistakes] = useState<number>(0);
  const [comboCount, setComboCount] = useState<number>(0);
  const [showComboPill, setShowComboPill] = useState<boolean>(false);
  const comboHideTimerRef = useRef<number | null>(null);
  const lastClearTimeRef = useRef<number>(0);

  // Floating score bubbles (max 3, cleaned up after 600ms)
  const [floatingScores, setFloatingScores] = useState<FloatingScoreItem[]>([]);
  const floatingTimeoutRefs = useRef<number[]>([]);

  // Undo History & Hints
  const [undoHistory, setUndoHistory] = useState<ArrowData[]>([]);
  const [hintsLeft, setHintsLeft] = useState<number>(3);
  const [hintedArrowId, setHintedArrowId] = useState<string | null>(null);

  // Animations & Interaction lock
  const [escapingArrowId, setEscapingArrowId] = useState<string | null>(null);
  const [shakingArrowId, setShakingArrowId] = useState<string | null>(null);
  const [flashBlockedArrowId, setFlashBlockedArrowId] = useState<string | null>(null);
  const isInteractingRef = useRef<boolean>(false);

  // Zoom & Pan state
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Popups
  const [showLevelComplete, setShowLevelComplete] = useState<boolean>(false);
  const [showGameOver, setShowGameOver] = useState<boolean>(false);
  const [showCollectionComplete, setShowCollectionComplete] = useState<boolean>(false);
  const [completedCollection, setCompletedCollection] = useState<CollectionConfig | null>(null);
  const [nextCollection, setNextCollection] = useState<CollectionConfig | null>(null);
  const [isGrandFinale, setIsGrandFinale] = useState<boolean>(false);
  const [isNewHighScore, setIsNewHighScore] = useState<boolean>(false);

  // Startup verification
  useEffect(() => {
    soundManager.setPreferences(
      settings.soundEnabled,
      settings.musicEnabled,
      settings.vibrationEnabled
    );
    setTimeout(() => {
      preloadAndVerifyAllLevels();
    }, 150);
  }, []);

  // Sync settings & sound
  useEffect(() => {
    soundManager.setPreferences(
      settings.soundEnabled,
      settings.musicEnabled,
      settings.vibrationEnabled
    );
    saveSettings(settings);
  }, [settings]);

  // Cleanup floating timers on unmount
  useEffect(() => {
    return () => {
      floatingTimeoutRefs.current.forEach((t) => clearTimeout(t));
      if (comboHideTimerRef.current) clearTimeout(comboHideTimerRef.current);
    };
  }, []);

  const currentCollection =
    COLLECTIONS.find((c) => c.id === levelConfig.collectionId) || COLLECTIONS[0];

  // Start Level
  const startLevel = useCallback((lvlNum: number, extraHint = false) => {
    const config = getLevel(lvlNum);
    setLevelConfig(config);
    setActiveArrows(config.arrows.map((a) => ({ ...a, cells: [...a.cells] })));
    setCurrentLevelNumber(lvlNum);
    setHearts(3);
    setMistakes(0);
    dispatchScore({ type: 'RESET_SCORE' });
    setComboCount(0);
    setShowComboPill(false);
    lastClearTimeRef.current = 0;
    setUndoHistory([]);
    setHintsLeft(extraHint ? 4 : 3);
    setHintedArrowId(null);
    setEscapingArrowId(null);
    setShakingArrowId(null);
    setFlashBlockedArrowId(null);
    setFloatingScores([]);
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setShowLevelComplete(false);
    setShowGameOver(false);
    setShowCollectionComplete(false);
    isInteractingRef.current = false;
    setScreen('game');
  }, []);

  // Arrow Tap / Click handling
  const handleArrowSelect = useCallback(
    (arrowId: string) => {
      if (isInteractingRef.current || escapingArrowId || hearts <= 0) return;

      const rayResult = checkArrowRay(arrowId, activeArrows, levelConfig.gridSize);

      if (rayResult.isFree) {
        // Arrow is FREE!
        isInteractingRef.current = true;
        setEscapingArrowId(arrowId);

        // Combo check (within 1.2s = 1200ms)
        const now = performance.now();
        const diff = now - lastClearTimeRef.current;
        let nextCombo = 1;
        if (lastClearTimeRef.current > 0 && diff < 1200) {
          nextCombo = comboCount + 1;
        }
        setComboCount(nextCombo);
        lastClearTimeRef.current = now;

        // Show non-stacking combo pill (auto-hides after 700ms)
        if (nextCombo > 1) {
          setShowComboPill(true);
          if (comboHideTimerRef.current) clearTimeout(comboHideTimerRef.current);
          comboHideTimerRef.current = window.setTimeout(() => {
            setShowComboPill(false);
          }, 700);
        }

        soundManager.playPop(nextCombo);

        // Score: 10 per cell + combo bonus
        const arrow = activeArrows.find((a) => a.id === arrowId);
        const cellCount = arrow?.cells.length || 3;
        const pts = computeArrowScore(cellCount, nextCombo);
        dispatchScore({ type: 'ADD_SCORE', points: pts });

        // Spawn small floating "+pts" (Max 3, clean up after 600ms)
        if (arrow) {
          const head = arrow.cells[arrow.cells.length - 1];
          const newFloatId = Date.now() + Math.random();
          const newFloat: FloatingScoreItem = {
            id: newFloatId,
            text: nextCombo > 1 ? `+${pts} COMBO!` : `+${pts}`,
            x: (head.c + 0.5) * (360 / levelConfig.gridSize),
            y: (head.r + 0.5) * (360 / levelConfig.gridSize),
            color: nextCombo > 1 ? '#FBBF24' : '#10E7A1',
          };

          setFloatingScores((prev) => [...prev.slice(-2), newFloat]);

          const timer = window.setTimeout(() => {
            setFloatingScores((prev) => prev.filter((f) => f.id !== newFloatId));
          }, 600);
          floatingTimeoutRefs.current.push(timer);

          // Add to undo history
          setUndoHistory((hist) => [...hist, arrow]);
        }

        // Slide-out duration
        setTimeout(() => {
          setActiveArrows((prev) => {
            const next = prev.filter((a) => a.id !== arrowId);

            // Win condition: board is empty!
            if (next.length === 0) {
              setTimeout(() => {
                const finalMistakes = mistakes;
                let finalScore = score + pts;
                if (finalMistakes === 0) {
                  finalScore += 500; // Perfect level bonus
                }
                const stars = calculateStars(finalMistakes);

                const prevRecord = progress.levelData[currentLevelNumber];
                const isNewHigh = !prevRecord || finalScore > (prevRecord.highScore || 0);
                setIsNewHighScore(isNewHigh);

                const nextProg = updateLevelCompletion(
                  progress,
                  currentLevelNumber,
                  stars,
                  finalScore
                );
                setProgress(nextProg);

                soundManager.playWin();

                // Collection complete check (every tenth level through 150)
                if (currentLevelNumber % 10 === 0) {
                  const colIdx = Math.floor((currentLevelNumber - 1) / 10);
                  const completed = COLLECTIONS[colIdx];
                  const nextCol = COLLECTIONS[colIdx + 1] || null;
                  const finale = currentLevelNumber === 150;

                  setCompletedCollection(completed);
                  setNextCollection(nextCol);
                  setIsGrandFinale(finale);
                  setShowCollectionComplete(true);
                } else {
                  setShowLevelComplete(true);
                }
              }, 200);
            }

            return next;
          });

          setEscapingArrowId(null);
          isInteractingRef.current = false;
        }, 450);
      } else {
        // Arrow is BLOCKED!
        setShakingArrowId(arrowId);
        if (rayResult.blockingArrowId) {
          setFlashBlockedArrowId(rayResult.blockingArrowId);
        }
        soundManager.playBlocked();

        setComboCount(0);
        setShowComboPill(false);
        setMistakes((m) => m + 1);

        setHearts((h) => {
          const nextH = Math.max(0, h - 1);
          if (nextH <= 0) {
            setTimeout(() => {
              soundManager.playLoss();
              setShowGameOver(true);
            }, 450);
          }
          return nextH;
        });

        setTimeout(() => {
          setShakingArrowId(null);
          setFlashBlockedArrowId(null);
        }, 420);
      }
    },
    [
      activeArrows,
      levelConfig.gridSize,
      escapingArrowId,
      hearts,
      comboCount,
      score,
      mistakes,
      currentLevelNumber,
      progress,
    ]
  );

  // Undo (Z)
  const handleUndo = useCallback(() => {
    if (undoHistory.length === 0 || escapingArrowId || isInteractingRef.current) return;
    const lastArrow = undoHistory[undoHistory.length - 1];
    setUndoHistory((hist) => hist.slice(0, -1));
    setActiveArrows((prev) => [...prev, lastArrow]);
    soundManager.playClick();
  }, [undoHistory, escapingArrowId]);

  // Hint (H)
  const handleHint = useCallback(() => {
    if (hintsLeft <= 0 || activeArrows.length === 0) return;
    const target = getHintArrow(activeArrows, levelConfig.solutionOrder, levelConfig.gridSize);
    if (target) {
      setHintsLeft((h) => h - 1);
      setHintedArrowId(target.id);
      soundManager.playHint();
      setTimeout(() => {
        setHintedArrowId(null);
      }, 2000);
    }
  }, [hintsLeft, activeArrows, levelConfig]);

  // Keyboard Shortcuts (R to restart, Z to undo, H for hint, Esc for back)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'r' || e.key === 'R') {
        if (screen === 'game') startLevel(currentLevelNumber);
      } else if (e.key === 'z' || e.key === 'Z') {
        if (screen === 'game') handleUndo();
      } else if (e.key === 'h' || e.key === 'H') {
        if (screen === 'game') handleHint();
      } else if (e.key === 'Escape') {
        if (screen === 'game') setScreen('levels');
        else if (screen !== 'home') setScreen('home');
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [screen, currentLevelNumber, startLevel, handleUndo, handleHint]);

  // Tutorial target: Level 1 free arrow glow
  const tutorialArrowId =
    currentLevelNumber === 1 && mistakes === 0 && undoHistory.length === 0
      ? getHintArrow(activeArrows, levelConfig.solutionOrder, levelConfig.gridSize)?.id || null
      : null;

  const isDark = settings.theme === 'dark';

  return (
    <main
      className={`relative w-full h-full flex flex-col overflow-hidden select-none font-['Fredoka',sans-serif] ${
        isDark ? 'text-white' : 'text-slate-800'
      }`}
    >
      {/* Themed Dynamic Animated Background */}
      <Background
        collection={screen === 'game' ? currentCollection : null}
        theme={settings.theme}
      />

      {/* Screen 1: Home Screen */}
      {screen === 'home' && (
        <Home
          progress={progress}
          isDarkTheme={isDark}
          onPlayLevel={(lvl) => startLevel(lvl)}
          onOpenLevelList={() => setScreen('levels')}
          onOpenHowToPlay={() => setScreen('how-to-play')}
          onOpenSettings={() => setScreen('settings')}
        />
      )}

      {/* Screen 2: Level List Screen */}
      {screen === 'levels' && (
        <LevelList
          progress={progress}
          isDarkTheme={isDark}
          onSelectLevel={(lvl) => startLevel(lvl)}
          onBack={() => setScreen('home')}
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
          onBack={() => setScreen('home')}
        />
      )}

      {/* Screen 4: How To Play Screen */}
      {screen === 'how-to-play' && (
        <HowToPlay onClose={() => setScreen('home')} />
      )}

      {/* Screen 5: Game Screen */}
      {screen === 'game' && (
        <div className="relative w-full h-full flex flex-col justify-between overflow-hidden z-10">
          {/* Compact Single-Row Header */}
          <TopBar
            levelNumber={currentLevelNumber}
            shapeName={levelConfig.shapeName}
            collectionName={currentCollection.name}
            score={score}
            theme={settings.theme}
            onToggleTheme={() =>
              setSettings((s) => ({ ...s, theme: s.theme === 'dark' ? 'light' : 'dark' }))
            }
            onOpenSettings={() => setScreen('settings')}
            onBack={() => setScreen('levels')}
          />

          {/* Sub-header: Hearts & Rainbow Progress Bar */}
          <ProgressBar
            hearts={hearts}
            remainingCount={activeArrows.length}
            initialCount={levelConfig.arrows.length}
            isDarkTheme={isDark}
          />

          {/* Interactive Silhouette Board */}
          <Board
            gridSize={levelConfig.gridSize}
            playableMask={levelConfig.playableMask}
            arrows={activeArrows}
            isDarkTheme={isDark}
            colorBlindMode={settings.colorBlindMode}
            escapingArrowId={escapingArrowId}
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
            onArrowSelect={handleArrowSelect}
          />

          {/* Compact Bottom Bar */}
          <BottomBar
            canUndo={undoHistory.length > 0}
            hintsLeft={hintsLeft}
            zoomLevel={zoomLevel}
            isDarkTheme={isDark}
            onUndo={handleUndo}
            onHint={handleHint}
            onZoomIn={() => setZoomLevel((z) => Math.min(4.0, z + 0.35))}
            onZoomOut={() => {
              setZoomLevel((z) => {
                const next = Math.max(1.0, z - 0.35);
                if (next === 1.0) setPanOffset({ x: 0, y: 0 });
                return next;
              });
            }}
            onZoomFit={() => {
              setZoomLevel(1.0);
              setPanOffset({ x: 0, y: 0 });
            }}
          />
        </div>
      )}

      {/* Popups */}
      {showLevelComplete && (
        <LevelCompleteModal
          levelNumber={currentLevelNumber}
          shapeName={levelConfig.shapeName}
          stars={calculateStars(mistakes)}
          score={score}
          mistakes={mistakes}
          isNewHigh={isNewHighScore}
          hasNextLevel={currentLevelNumber < 150}
          onNextLevel={() => startLevel(currentLevelNumber + 1)}
          onReplay={() => startLevel(currentLevelNumber)}
          onHome={() => setScreen('home')}
        />
      )}

      {showGameOver && (
        <GameOverModal
          levelNumber={currentLevelNumber}
          onRetry={() => startLevel(currentLevelNumber)}
          onFreeHintRetry={() => startLevel(currentLevelNumber, true)}
          onHome={() => setScreen('home')}
        />
      )}

      {showCollectionComplete && completedCollection && (
        <CollectionCompleteModal
          completedCollection={completedCollection}
          nextCollection={nextCollection}
          isGameFinale={isGrandFinale}
          onContinue={() => {
            if (isGrandFinale) {
              setScreen('levels');
            } else {
              startLevel(currentLevelNumber + 1);
            }
          }}
          onHome={() => setScreen('home')}
        />
      )}
    </main>
  );
}
