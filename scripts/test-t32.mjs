import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const ui = fs.readFileSync(new URL('../web/game-ui.js', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../web/game-ui.css', import.meta.url), 'utf8');

test('T3.2 continuity controls are present in the player UI', () => {
  assert.match(ui, /paused=false/);
  assert.match(ui, /Pausar/);
  assert.match(ui, /blockedWhenPaused/);
  assert.match(ui, /addEventListener\?\.\('popstate'/);
  assert.match(ui, /history\.back\(\)/);
  assert.match(ui, /events\?\{events\}:\{\}/);
});

test('T3.2 long text and touch targets have containment and reduced-motion rules', () => {
  assert.match(css, /overflow-wrap:anywhere/);
  assert.match(css, /max-height:calc\(100% - 24px\);overflow:auto/);
  assert.match(css, /touch-action:manipulation/);
  assert.match(css, /summary\{[^}]*min-height:44px/);
  assert.match(css, /prefers-reduced-motion:reduce/);
});
