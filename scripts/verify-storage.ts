import assert from 'node:assert/strict';

class MemoryStorage {
  private values = new Map<string, string>();
  get length() { return this.values.size; }
  clear() { this.values.clear(); }
  getItem(key: string) { return this.values.get(key) ?? null; }
  key(index: number) { return Array.from(this.values.keys())[index] ?? null; }
  removeItem(key: string) { this.values.delete(key); }
  setItem(key: string, value: string) { this.values.set(key, String(value)); }
}

const memoryStorage = new MemoryStorage();
Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: memoryStorage });

const storage = await import('../src/storage.ts');
const initial = {
  unlockedLevel: 18,
  totalScore: 9200,
  levelData: {
    1: { unlocked: true, stars: 3, highScore: 700, cleared: true },
    18: { unlocked: true, stars: 2, highScore: 8500, cleared: true },
  },
  stats: { arrowsCleared: 480, bestCombo: 7, perfectLevels: 3, dailyChallengesCompleted: 2, lastPlayedAt: Date.now() },
};
storage.saveProgress(initial);
assert.equal(storage.loadProgress().unlockedLevel, 18, 'normal progress load failed');

// Corrupt the primary record; the rolling backup must recover it.
memoryStorage.setItem('arrow_bloom_progress', '{invalid json');
assert.equal(storage.loadProgress().unlockedLevel, 18, 'rolling backup recovery failed');

// Include a mid-level checkpoint and settings in an export.
storage.saveMidLevelState({
  levelNumber: 18,
  activeArrows: [{ id: 'test', cells: [{ r: 0, c: 0 }, { r: 0, c: 1 }], direction: 'right', colorIndex: 0, order: 0 }],
  score: 1200,
  mistakes: 1,
  hintsLeft: 2,
  hearts: 2,
  savedAt: Date.now(),
});
const backup = storage.createProgressBackup();
assert.ok(backup.includes('Arrow Bloom'), 'backup export missing app signature');

storage.resetProgress();
assert.equal(storage.loadProgress().unlockedLevel, 1, 'reset should clear primary and rolling backup');
const restored = storage.restoreProgressBackup(backup);
assert.ok(restored, 'valid backup should restore');
assert.equal(storage.loadProgress().unlockedLevel, 18, 'restored progress level mismatch');
assert.equal(storage.loadMidLevelState(18)?.score, 1200, 'mid-level checkpoint was not restored');
assert.equal(storage.loadProgress().stats?.arrowsCleared, 480, 'player statistics were not restored');
assert.equal(storage.restoreProgressBackup('{broken'), null, 'invalid backup must be rejected');

console.log('PASS: progress load, automatic backup recovery, export/import, mid-level resume and invalid backup rejection');
