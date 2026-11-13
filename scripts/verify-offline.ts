import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync('src/App.tsx', 'utf8');
const worker = readFileSync('src/levelWorker.ts', 'utf8');
const logic = readFileSync('src/gameLogic.ts', 'utf8');
const generator = readFileSync('src/levelGenerator.ts', 'utf8');
const config = JSON.parse(readFileSync('capacitor.config.json', 'utf8'));

assert.ok(worker.includes("levelGenerator.ts"), 'Level generation must be bundled in the local worker');
assert.ok(config.webDir === 'dist', 'Capacitor must load the locally bundled web game');
assert.ok(app.includes("addEventListener('pagehide'"), 'App must save state when the WebView is discarded');
assert.ok(app.includes("addEventListener('visibilitychange'"), 'App must save state when backgrounded');
assert.ok(app.includes("addListener('appStateChange'"), 'App must save state on native Android lifecycle changes');

for (const [name, source] of [['level worker', worker], ['game logic', logic], ['level generator', generator]]) {
  assert.ok(!/\b(fetch|XMLHttpRequest|WebSocket)\s*\(/.test(source), `${name} must not require a network request`);
}
console.log('PASS: local worker/game bundle, offline puzzle logic and Android lifecycle checkpoints');
