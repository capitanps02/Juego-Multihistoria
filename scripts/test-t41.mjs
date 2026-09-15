import test from 'node:test';
import assert from 'node:assert/strict';
import { EVENTS } from '../dist/content/events/index.js';
import { createInitialState } from '../dist/content/initial-state.js';
import { resolveChoiceInPlace } from '../dist/narrative/resolver.js';
import { scheduleEvent } from '../dist/narrative/scheduler.js';

const byId = id => {
  const event = EVENTS.find(candidate => candidate.id === id);
  assert.ok(event, `Falta evento ${id}`);
  return event;
};

test('T4.1 Nano: memoria creada, callback condicionado y cierre tras recarga JSON', () => {
  const origin = byId('EVT_18_PRE_001');
  const reappearance = byId('EVT_19_TEAM_001');
  const callback = byId('CEVT_19_NANO_01');
  let state;
  for (let seed = 0; seed < 2000 && !state; seed++) {
    const candidate = createInitialState(seed);
    resolveChoiceInPlace(candidate, origin, 'CALL_NANO');
    resolveChoiceInPlace(candidate, reappearance, 'MOVE_CONTACT');
    if (candidate.flags.UNSOLICITED_NANO_HELP) state = candidate;
  }
  assert.ok(state, 'No se encontró una semilla que active el callback de Nano');
  const memory = state.seeds.find(seed => seed.id === 'SEED_NANO_SHADOW');
  assert.equal(memory?.state, 'dormant');
  assert.equal(state.flags.HAS_SEED_NANO_SHADOW, true);
  assert.equal(state.history.length, 2);
  assert.ok(state.history.every(entry => entry.snapshot.npcRefs.includes('NPC_PLR_14')));

  const reloaded = JSON.parse(JSON.stringify(state));
  Object.assign(reloaded, { age: 19, phase: '18_20', date: '2027-07-01' });
  reloaded.runtime.day = 365;
  reloaded.runtime.seasonDay = 0;
  reloaded.runtime.daysSinceNarrative = 999;
  reloaded.runtime.eventsThisSeason = 0;
  const scheduled = scheduleEvent(reloaded, [callback], { ignoreRhythmGate: true });
  assert.equal(scheduled?.event.id, callback.id);

  resolveChoiceInPlace(reloaded, callback, 'WITHDRAW');
  const closed = reloaded.seeds.find(seed => seed.id === 'SEED_NANO_SHADOW');
  assert.equal(closed?.state, 'resolved');
  assert.equal(closed?.consumedBy, callback.id);
  assert.equal(reloaded.flags.HAS_SEED_NANO_SHADOW, false);
  assert.equal(reloaded.history.length, 3);

  const clean = createInitialState(1);
  Object.assign(clean, { age: 19, phase: '18_20', date: '2027-07-01' });
  clean.runtime.daysSinceNarrative = 999;
  assert.equal(scheduleEvent(clean, [callback], { ignoreRhythmGate: true }), null);
});
