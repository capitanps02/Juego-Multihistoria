import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { GameSession } from '../dist/session/game-session.js';
import { EVENTS } from '../dist/content/events/index.js';

const ui = fs.readFileSync('web/game-ui.js', 'utf8');

test('T4.7 resultado: la pantalla no depende de una decisión ya consumida', () => {
  assert.match(ui, /v\.resultCategory==='match'/);
  assert.doesNotMatch(ui, /if\(d\.family==='sport'\)/);
  assert.match(ui, /v\.result\.choiceLabel/);
  assert.match(ui, /button\('Continuar',\(\)=>run\('acknowledge'\)/);
});

test('T4.7 muestra el contexto de una escena sin exigir un descubrimiento adicional', () => {
  assert.match(ui, /intel\.open=true/);
  assert.match(ui, /Lo que sabes · lo que queda por descubrir/);
});

test('T4.7 conserva el resumen de partido cuando el resultado ya no tiene decisión pendiente', async () => {
  const event = structuredClone(EVENTS.find(candidate => candidate.family === 'sport'));
  assert.ok(event);
  event.gates = [];
  delete event.exclusions;
  delete event.timeWindow;
  event.ageWindow = [18, 18];
  const session = await GameSession.create(7, { events: [event] });
  await session.dispatch({ type: 'continue', maxDays: 1, commandId: 'advance', expectedRevision: 0 });
  const decision = session.getView().decision;
  assert.equal(session.getView().screen, 'decision');
  assert.ok(decision);
  await session.dispatch({ type: 'choose', pendingInstanceId: decision.instanceId, choiceId: decision.choices[0].id, commandId: 'choose', expectedRevision: 1 });
  const result = session.getView();
  assert.equal(result.decision, null);
  assert.equal(result.resultCategory, 'match');
});
