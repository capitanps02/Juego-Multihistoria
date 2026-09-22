import test from 'node:test';
import assert from 'node:assert/strict';
import { GameSession } from '../dist/session/game-session.js';
import { EVENTS } from '../dist/content/events/index.js';
import {
  auditDecisionFeedback,
  consequencesFromStructuredSportDeltas,
  DEFERRED_CONSEQUENCE_MESSAGE,
  NO_IMMEDIATE_CHANGE_MESSAGE
} from '../dist/narrative/consequences.js';

const command = (s, type, extra = {}) => ({
  type,
  commandId: crypto.randomUUID(),
  expectedRevision: s.getView().revision,
  ...extra
});

function event({
  id = 'T16_TEST',
  immediateEffects = [],
  hiddenCosts = [],
  followUps = [],
  effects = [],
  messages = ['La decisión tiene una consecuencia comprensible.']
} = {}) {
  return {
    id,
    ageWindow: [18, 18],
    phase: '18_20',
    family: 'team',
    gates: [],
    cooldown: 99999,
    weight: 100,
    text: { title: 'Prueba de consecuencias', body: 'Escena sintética A16.' },
    intel: { visible: [], uncertain: [] },
    choices: [{
      id: 'A',
      label: 'Elegir A',
      intentTags: ['test'],
      immediateEffects,
      hiddenCosts,
      followUps,
      outcomeIds: ['OUT']
    }],
    outcomes: [{
      id: 'OUT',
      baseWeight: 1,
      effects,
      messages
    }],
    tags: ['t55_a16_test'],
    canonStatus: 'technical_adaptation'
  };
}

async function reachDecision(s) {
  for (let i = 0; i < 20; i++) {
    const v = s.getView();
    if (v.screen === 'decision') return v.decision;
    assert.equal(v.screen, 'career');
    await s.dispatch(command(s, 'continue', { maxDays: 1 }));
  }
  throw new Error('Synthetic A16 event was not scheduled');
}

async function resolveSynthetic(definition) {
  const s = await GameSession.create(160016, { events: [definition], microfeeds: false });
  const p = await reachDecision(s);
  const choose = command(s, 'choose', { pendingInstanceId: p.instanceId, choiceId: 'A' });
  await s.dispatch(choose);
  return { s, choose, view: s.getView(), snapshot: s.exportSnapshot() };
}

test('T16.1 Forma +3 se muestra con delta real', async () => {
  const { view } = await resolveSynthetic(event({ effects: [{ kind: 'numeric', path: 'sport.form', delta: 3 }] }));
  assert.ok(view.result.visibleEffects.some(effect => effect.label === 'Forma' && effect.delta === 3 && effect.favorable === true));
});

test('T16.2 Fatiga +4 conserva semántica perjudicial', async () => {
  const { view } = await resolveSynthetic(event({ effects: [{ kind: 'numeric', path: 'body.fatigue', delta: 4 }] }));
  assert.ok(view.result.visibleEffects.some(effect => effect.label === 'Fatiga' && effect.delta === 4 && effect.direction === 'up' && effect.favorable === false));
});

test('T16.3 relación muestra nombre humano y no NPC id', async () => {
  const { view } = await resolveSynthetic(event({ effects: [{ kind: 'numeric', path: 'rel.NPC_PLR_14.trust', delta: 5 }] }));
  const effect = view.result.visibleEffects.find(row => row.category === 'relationship');
  assert.ok(effect);
  assert.equal(effect.delta, 5);
  assert.doesNotMatch(effect.label, /NPC_/);
});

test('T16.4 efecto puramente narrativo aparece como narrativeEffect', async () => {
  const message = 'Nano agradece que hayas hablado con él directamente.';
  const { view } = await resolveSynthetic(event({ messages: [message] }));
  assert.deepEqual(view.result.narrativeEffects, [message]);
});

test('T16.5/T16.6 flags y callbacks internos nunca son player-facing', async () => {
  const { view } = await resolveSynthetic(event({
    immediateEffects: [{ kind: 'flag', flag: 'NANO_SHADOW', value: true }],
    followUps: ['callback_INTERNAL_ONLY'],
    messages: ['Has tomado una decisión.']
  }));
  const json = JSON.stringify(view);
  assert.doesNotMatch(json, /NANO_SHADOW|callback_INTERNAL_ONLY|callback/i);
  assert.ok(view.result.hiddenEffects.includes(DEFERRED_CONSEQUENCE_MESSAGE));
});

test('T16.7 una consecuencia futura recibe feedback diferido', async () => {
  const { view } = await resolveSynthetic(event({ followUps: ['future_resolution'], messages: ['Has tomado una decisión.'] }));
  assert.deepEqual(view.result.hiddenEffects, [DEFERRED_CONSEQUENCE_MESSAGE]);
});

test('T16.8 una decisión realmente sin efecto declara que no hay cambios inmediatos', async () => {
  const { view } = await resolveSynthetic(event({ messages: ['Has tomado una decisión.'] }));
  assert.deepEqual(view.result.hiddenEffects, [NO_IMMEDIATE_CHANGE_MESSAGE]);
});

test('T16.9/T16.10 save-load conserva feedback y no reaplica efectos', async () => {
  const definition = event({ effects: [{ kind: 'numeric', path: 'sport.form', delta: 3 }] });
  const { s, choose, snapshot } = await resolveSynthetic(definition);
  const form = snapshot.state.sport.form;
  const feedback = structuredClone(snapshot.pendingResult);
  const restored = await GameSession.resume(JSON.parse(JSON.stringify(snapshot)), { events: [definition] });
  assert.deepEqual(restored.exportSnapshot().pendingResult, feedback);
  assert.equal(restored.exportSnapshot().state.sport.form, form);
  const replay = await restored.dispatch(choose);
  assert.equal(replay.replayed, true);
  assert.equal(restored.exportSnapshot().state.sport.form, form);
  assert.deepEqual(restored.exportSnapshot().pendingResult, feedback);
  assert.deepEqual(s.getView().result, restored.getView().result);
});

test('T16.11 reabrir/leer el resultado no duplica efectos', async () => {
  const { s } = await resolveSynthetic(event({ effects: [{ kind: 'numeric', path: 'sport.form', delta: 2 }] }));
  const before = s.exportSnapshot();
  const a = s.getView();
  const b = s.getView();
  assert.deepEqual(a, b);
  assert.deepEqual(s.exportSnapshot(), before);
});

test('T16.12 resultado combina visible y narrativo sin duplicar aplicación', async () => {
  const message = 'El entrenador aprecia que hayas sido directo.';
  const { view } = await resolveSynthetic(event({
    effects: [{ kind: 'numeric', path: 'rel.NPC_CCH_01.trust', delta: 4 }],
    messages: [message]
  }));
  assert.ok(view.result.visibleEffects.some(effect => effect.delta === 4));
  assert.deepEqual(view.result.narrativeEffects, [message]);
});

test('T16.13 constantes internas se filtran de result y journal públicos', async () => {
  const raw = 'STATE20_HOME_ROTATION callback seedOrigin EVT_20_TEST NPC_PLR_14 NANO_SHADOW';
  const { view, snapshot } = await resolveSynthetic(event({ messages: [raw] }));
  assert.match(JSON.stringify(snapshot.pendingResult.messages), /STATE20_HOME_ROTATION/);
  const publicJson = JSON.stringify({ result: view.result, journal: view.journal });
  for (const token of ['STATE20_HOME_ROTATION','callback','seedOrigin','EVT_20_TEST','NPC_PLR_14','NANO_SHADOW']) {
    assert.equal(publicJson.includes(token), false, token);
  }
});

test('legacy PendingResult sin arrays nuevas carga con defaults seguros', async () => {
  const definition = event({ messages: ['El vestuario reacciona a tu decisión.'] });
  const { snapshot } = await resolveSynthetic(definition);
  delete snapshot.pendingResult.visibleEffects;
  delete snapshot.pendingResult.narrativeEffects;
  delete snapshot.pendingResult.hiddenEffects;
  const restored = await GameSession.resume(snapshot, { events: [definition] });
  assert.ok(Array.isArray(restored.getView().result.visibleEffects));
  assert.ok(restored.getView().result.narrativeEffects.length > 0);
});

test('T16.14 consume deltas deportivos estructurados de A15 sin recalcular deporte', () => {
  const feedback = consequencesFromStructuredSportDeltas({
    formDelta: 3,
    fatigueDelta: 4,
    fitnessDelta: -2,
    coachTrustDelta: 5,
    roleChange: 'Pasas a ser titular habitual.',
    careerMilestone: 'Alcanzas tu partido número 100.'
  });
  assert.deepEqual(feedback.visibleEffects.map(effect => [effect.label, effect.delta]), [
    ['Forma', 3],
    ['Fatiga', 4],
    ['Estado físico', -2],
    ['Confianza del entrenador', 5]
  ]);
  assert.equal(feedback.visibleEffects.find(effect => effect.label === 'Fatiga').favorable, false);
  assert.equal(feedback.narrativeEffects.length, 2);
});

test('T16.15 auditoría estructural garantiza feedback para todo choice→outcome del catálogo', () => {
  const audit = auditDecisionFeedback(EVENTS);
  console.log('A16_FEEDBACK_AUDIT ' + JSON.stringify(audit));
  assert.ok(audit.choices > 0);
  assert.ok(audit.resolutions >= audit.choices);
  assert.deepEqual(audit.missing, []);
  assert.equal(audit.playerFacingJargonLeaks, 0);
});
