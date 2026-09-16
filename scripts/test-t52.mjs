import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createInitialState } from '../dist/content/initial-state.js';
import { expireDueSeedsInPlace, resolveChoiceInPlace } from '../dist/narrative/resolver.js';
import { loadSave, serializeSave } from '../dist/save/save.js';
import { GameSession } from '../dist/session/game-session.js';

const report = JSON.parse(fs.readFileSync('analysis/T5.2/seed-lifecycle.json', 'utf8'));

function fixtureEvent(id, seedId, transition, options = {}) {
  const outcomeId = `${id}_OUT`;
  return {
    id,
    ageWindow: [18, null],
    phase: '18_20',
    family: 'conditional',
    gates: [],
    cooldown: 0,
    repeatable: true,
    weight: 1,
    text: { title: id, body: 'T5.2 fixture' },
    intel: { visible: [], uncertain: [] },
    choices: [{
      id: 'A', label: 'A', intentTags: ['t52_fixture'],
      immediateEffects: options.immediateEffects ?? [], outcomeIds: [outcomeId]
    }],
    outcomes: [{
      id: outcomeId, baseWeight: 1, effects: [], messages: ['ok'],
      seedTransitions: [{ seedId, ...transition }]
    }],
    seedsWrite: [seedId]
  };
}

function liveInstances(state, seedId) {
  return state.seeds.filter(seed => seed.id === seedId && !['resolved', 'expired'].includes(seed.state));
}

async function advanceSessionToDecision(session) {
  for (let i = 0; i < 60; i += 1) {
    const view = session.getView();
    if (view.screen === 'decision') return view;
    if (view.screen === 'offer') {
      await session.dispatch({
        type: 'offer', offerId: view.offer.id, action: 'reject',
        commandId: `t52-offer-${i}`, expectedRevision: view.revision
      });
      continue;
    }
    if (view.screen === 'result') {
      await session.dispatch({ type: 'acknowledge', commandId: `t52-ack-${i}`, expectedRevision: view.revision });
      continue;
    }
    await session.dispatch({ type: 'continue', maxDays: 30, commandId: `t52-advance-${i}`, expectedRevision: view.revision });
  }
  assert.fail('La fixture T5.2 no llegó a una decisión');
}

test('T5.2 inventario: las 210 seeds quedan trazadas sin referencias desconocidas', () => {
  assert.equal(report.summary.catalogSeeds, 210);
  assert.equal(report.summary.uniqueCatalogSeeds, 210);
  assert.equal(report.summary.eventCount, 388);
  assert.equal(report.summary.principalEvents, 254);
  assert.equal(report.summary.conditionalEvents, 134);
  assert.equal(report.summary.unknownReferences.length, 0);
  assert.equal(report.summary.unknownScopeOverrides.length, 0);
  assert.equal(report.rules.noUnknownReferences, true);
  assert.equal(report.rules.scopeOverridesAreKnownSeeds, true);
  assert.equal(report.rules.noDuplicateCatalogIds, true);
  assert.equal(report.rules.commandReplayOwnedByGameSession, true);
  assert.ok(report.summary.runtimeProducedSeeds > 0);
  assert.ok(report.summary.finiteAgeWindowSeeds > 0);
  assert.equal(report.summary.clubScopedSeeds, 5);
  for (const category of ['promises','injuries','operations','conflicts','relationships','reputation','contracts','money','family','agent','club','selection','careerDecisions']) {
    assert.ok(Array.isArray(report.categoryCoverage[category]), `Falta cobertura ${category}`);
  }
});

test('T5.2 creación y persistencia: create abre una única instancia viva y conserva memoria', () => {
  const state = createInitialState(5201);
  const event = fixtureEvent('T52_CREATE', 'SEED_RIVAS_TRUST', { action: 'create', intensity: 61, payload: { promise: 'kept' } });
  resolveChoiceInPlace(state, event, 'A');
  const seed = state.seeds.find(item => item.id === 'SEED_RIVAS_TRUST');
  assert.ok(seed);
  assert.equal(seed.state, 'dormant');
  assert.equal(seed.intensity, 61);
  assert.equal(seed.payload.promise, 'kept');
  assert.equal(state.flags.HAS_SEED_RIVAS_TRUST, true);

  state.age = 28;
  state.season = '2036-37';
  state.club = 'OTHER_CLUB';
  const rngBefore = structuredClone(state.rngState);
  expireDueSeedsInPlace(state);
  assert.equal(seed.state, 'dormant');
  assert.deepEqual(state.rngState, rngBefore, 'el lifecycle no consume RNG');
});

test('T5.2 reapertura: una seed terminal puede iniciar una nueva instancia sin borrar la anterior', () => {
  const state = createInitialState(5202);
  const create = fixtureEvent('T52_REOPEN_CREATE', 'SEED_NANO_SHADOW', { action: 'create', intensity: 50 });
  const resolve = fixtureEvent('T52_REOPEN_RESOLVE', 'SEED_NANO_SHADOW', { action: 'resolve' });
  resolveChoiceInPlace(state, create, 'A');
  resolveChoiceInPlace(state, resolve, 'A');
  assert.equal(state.seeds.filter(seed => seed.id === 'SEED_NANO_SHADOW' && seed.state === 'resolved').length, 1);

  state.date = '2026-07-02';
  resolveChoiceInPlace(state, create, 'A');
  assert.equal(state.seeds.filter(seed => seed.id === 'SEED_NANO_SHADOW').length, 2);
  assert.equal(liveInstances(state, 'SEED_NANO_SHADOW').length, 1);
  assert.equal(state.flags.HAS_SEED_NANO_SHADOW, true);
});

test('T5.2 consumo: resolve es terminal e idempotente sobre la seed aunque el resolver se invoque otra vez', () => {
  const state = createInitialState(5203);
  const create = fixtureEvent('T52_CONSUME_CREATE', 'SEED_NANO_SHADOW', { action: 'create' });
  const consume = fixtureEvent('T52_CONSUME_RESOLVE', 'SEED_NANO_SHADOW', { action: 'resolve' });
  resolveChoiceInPlace(state, create, 'A');
  resolveChoiceInPlace(state, consume, 'A');
  const seed = state.seeds.find(item => item.id === 'SEED_NANO_SHADOW');
  assert.equal(seed?.state, 'resolved');
  assert.equal(seed?.consumedBy, 'T52_CONSUME_RESOLVE');
  assert.equal(seed?.payload.__t52TerminalReason, 'resolved');
  assert.equal(state.flags.HAS_SEED_NANO_SHADOW, false);

  const terminalSnapshot = structuredClone(seed);
  resolveChoiceInPlace(state, consume, 'A');
  assert.deepEqual(seed, terminalSnapshot, 'un segundo resolve no vuelve a consumir ni mutar la seed terminal');
  assert.equal(liveInstances(state, 'SEED_NANO_SHADOW').length, 0);
});

test('T5.2 caducidad explícita: expiresAfter cierra la seed al cruzar la fecha', () => {
  const state = createInitialState(5204);
  state.date = '2026-07-01';
  const create = fixtureEvent('T52_DATE_CREATE', 'SEED_NANO_SHADOW', { action: 'create', expiresAfter: '2026-07-02' });
  resolveChoiceInPlace(state, create, 'A');
  state.date = '2026-07-02';
  const expired = expireDueSeedsInPlace(state);
  const seed = state.seeds.find(item => item.id === 'SEED_NANO_SHADOW');
  assert.ok(expired.includes('SEED_NANO_SHADOW'));
  assert.equal(seed?.state, 'expired');
  assert.equal(seed?.payload.__t52TerminalReason, 'explicit_date');
  assert.equal(state.flags.HAS_SEED_NANO_SHADOW, false);
});

test('T5.2 transición de edad: el máximo del catálogo es una política real de caducidad', () => {
  const state = createInitialState(5205);
  const create = fixtureEvent('T52_AGE_CREATE', 'SEED_MENA_EARLY_READ', { action: 'create' });
  resolveChoiceInPlace(state, create, 'A');
  state.age = 30;
  expireDueSeedsInPlace(state);
  assert.equal(liveInstances(state, 'SEED_MENA_EARLY_READ').length, 1);
  state.age = 31;
  expireDueSeedsInPlace(state);
  const seed = state.seeds.find(item => item.id === 'SEED_MENA_EARLY_READ');
  assert.equal(seed?.state, 'expired');
  assert.equal(seed?.payload.__t52TerminalReason, 'age_window');
});

test('T5.2 cambio de club: memoria global persiste y memoria local caduca', () => {
  const state = createInitialState(5206);
  const globalCreate = fixtureEvent('T52_GLOBAL_CREATE', 'SEED_RIVAS_TRUST', { action: 'create' });
  const localCreate = fixtureEvent('T52_LOCAL_CREATE', 'SEED_PRIVATE_CHAT', { action: 'create' });
  resolveChoiceInPlace(state, globalCreate, 'A');
  resolveChoiceInPlace(state, localCreate, 'A');
  const originClub = state.club;
  const local = state.seeds.find(seed => seed.id === 'SEED_PRIVATE_CHAT');
  assert.equal(local?.payload.__t52OriginClub, originClub);

  state.club = 'TRANSFER_DESTINATION';
  expireDueSeedsInPlace(state);
  assert.equal(liveInstances(state, 'SEED_RIVAS_TRUST').length, 1);
  assert.equal(local?.state, 'expired');
  assert.equal(local?.payload.__t52TerminalReason, 'club_scope');
});

test('T5.2 temporadas largas: no existe reset implícito de seeds career-scoped', () => {
  const state = createInitialState(5207);
  const create = fixtureEvent('T52_LONG_CREATE', 'SEED_FAMILY_MONEY', { action: 'create' });
  resolveChoiceInPlace(state, create, 'A');
  for (const season of ['2028-29','2030-31','2034-35','2038-39']) {
    state.season = season;
    expireDueSeedsInPlace(state);
  }
  assert.equal(liveInstances(state, 'SEED_FAMILY_MONEY').length, 1);
});

test('T5.2 save/restore: una seed pendiente sobrevive y se consume después de restaurar', () => {
  const state = createInitialState(5208);
  const create = fixtureEvent('T52_SAVE_CREATE', 'SEED_PRIVATE_CHAT', { action: 'create', payload: { clue: 'locker' } });
  resolveChoiceInPlace(state, create, 'A');
  const restored = loadSave(serializeSave(state));
  const pending = restored.seeds.find(seed => seed.id === 'SEED_PRIVATE_CHAT');
  assert.ok(pending);
  assert.equal(pending.payload.clue, 'locker');
  assert.equal(typeof pending.payload.__t52OriginClub, 'string');

  const consume = fixtureEvent('T52_SAVE_RESOLVE', 'SEED_PRIVATE_CHAT', { action: 'resolve' });
  resolveChoiceInPlace(restored, consume, 'A');
  assert.equal(pending.state, 'resolved');
  assert.equal(pending.consumedBy, 'T52_SAVE_RESOLVE');
  const roundTrip = loadSave(serializeSave(restored));
  assert.equal(roundTrip.seeds.find(seed => seed.id === 'SEED_PRIVATE_CHAT')?.state, 'resolved');
});

test('T5.2 doble comando: GameSession aplica una sola vez el mismo commandId, incluso tras restore', async () => {
  const event = fixtureEvent('T52_DOUBLE', 'SEED_NANO_SHADOW', { action: 'create', intensity: 57 }, {
    immediateEffects: [{ kind: 'numeric', path: 'control.career', delta: 5 }]
  });
  const session = await GameSession.create(5209, { events: [event], sessionId: 't52-idempotence' });
  const decision = await advanceSessionToDecision(session);
  const before = session.exportSnapshot();
  const command = {
    type: 'choose', pendingInstanceId: decision.decision.instanceId, choiceId: 'A',
    commandId: 't52-double-command', expectedRevision: decision.revision
  };

  const [first, second] = await Promise.all([session.dispatch(command), session.dispatch(command)]);
  assert.deepEqual([first.replayed, second.replayed], [false, true]);
  const after = session.exportSnapshot();
  assert.equal(after.state.control.career, before.state.control.career + 5);
  assert.equal(after.state.history.length, before.state.history.length + 1);
  assert.equal(liveInstances(after.state, 'SEED_NANO_SHADOW').length, 1);
  assert.equal(after.receipts.filter(receipt => receipt.commandId === command.commandId).length, 1);

  const restored = await GameSession.resume(after, { events: [event] });
  const beforeReplay = restored.exportSnapshot();
  const replay = await restored.dispatch(command);
  assert.equal(replay.replayed, true);
  assert.deepEqual(restored.exportSnapshot(), beforeReplay, 'el replay tras restore no altera estado ni RNG');
});

test('T5.2 seed incompatible en save: se preserva y el sweep no rompe una partida futura/antigua', () => {
  const state = createInitialState(5210);
  state.seeds.push({
    id: 'SEED_FUTURE_VERSION', state: 'active', intensity: 50,
    originEvent: 'FUTURE_EVENT', originSeason: state.season,
    npcRefs: [], payload: {}, lastTouchedDate: state.date
  });
  assert.doesNotThrow(() => expireDueSeedsInPlace(state));
  assert.equal(state.flags.HAS_SEED_FUTURE_VERSION, true);
  const restored = loadSave(serializeSave(state));
  assert.equal(restored.seeds.some(seed => seed.id === 'SEED_FUTURE_VERSION'), true);
});

test('T5.2 seed inexistente en contenido nuevo: create falla de forma explícita', () => {
  const state = createInitialState(5211);
  const event = fixtureEvent('T52_UNKNOWN_CREATE', 'SEED_DOES_NOT_EXIST', { action: 'create' });
  assert.throws(() => resolveChoiceInPlace(state, event, 'A'), /Unknown seed SEED_DOES_NOT_EXIST/);
});
