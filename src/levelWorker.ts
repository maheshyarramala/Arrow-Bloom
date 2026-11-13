import { getLevel } from './levelGenerator.ts';
import type { LevelConfig } from './types.ts';

const DB_NAME = 'arrow-bloom-level-cache';
const STORE = 'levels';
const GENERATOR_VERSION = 10;

function openCache(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    try {
      if (typeof indexedDB === 'undefined') return resolve(null);
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE);
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch { resolve(null); }
  });
}

async function readCached(levelNumber: number): Promise<LevelConfig | null> {
  const db = await openCache();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const request = db.transaction(STORE, 'readonly').objectStore(STORE).get(`v${GENERATOR_VERSION}:${levelNumber}`);
      request.onsuccess = () => resolve((request.result as LevelConfig) || null);
      request.onerror = () => resolve(null);
    } catch { resolve(null); }
  });
}

async function writeCached(level: LevelConfig): Promise<void> {
  const db = await openCache();
  if (!db) return;
  await new Promise<void>((resolve) => {
    try {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put(level, `v${GENERATOR_VERSION}:${level.levelNumber}`);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch { resolve(); }
  });
}

const pending = new Map<number, Promise<LevelConfig>>();
const generationTimes = new Map<number, number>();
async function generate(levelNumber: number): Promise<LevelConfig> {
  const started = performance.now();
  const cached = await readCached(levelNumber);
  if (cached) { if (!generationTimes.has(levelNumber)) generationTimes.set(levelNumber, 0); return cached; }
  const result = getLevel(levelNumber, { maxAttempts: 35, timeBudgetMs: 800 });
  generationTimes.set(levelNumber, Math.round(performance.now() - started));
  await writeCached(result);
  return result;
}

self.onmessage = async (event: MessageEvent<{ levelNumber: number }>) => {
  const levelNumber = Math.max(1, Math.min(500, Math.floor(event.data.levelNumber)));
  try {
    const requestStarted = performance.now();
    let task = pending.get(levelNumber);
    if (!task) {
      task = generate(levelNumber);
      pending.set(levelNumber, task);
    }
    const level = await task;
    pending.delete(levelNumber);
    self.postMessage({ levelNumber, level, generationMs: generationTimes.get(levelNumber) ?? Math.round(performance.now() - requestStarted) });
    if (levelNumber < 500 && !pending.has(levelNumber + 1)) {
      const next = generate(levelNumber + 1).finally(() => pending.delete(levelNumber + 1));
      pending.set(levelNumber + 1, next);
    }
  } catch (error) {
    pending.delete(levelNumber);
    self.postMessage({ levelNumber, error: error instanceof Error ? error.message : 'Level generation failed' });
  }
};
