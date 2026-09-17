import assert from 'node:assert/strict';
import test from 'node:test';
import { GameSession } from '../dist/session/game-session.js';
import { contentIdentity } from '../dist/session/content-identity.js';
import { buildActiveEventEvidence } from '../dist/session/content-migration.js';

let seq = 0;
const command = (session, type, extra = {}) => ({
  type,
  commandId: `offer-bridge-provenance-${++seq}`,
  expectedRevision: session.getView().revision,
  ...extra
});

function bridgeEvent(id = 'EVT_T51_OFFER_BRIDGE_PROVENANCE', choiceActions = {}) {
  return {
    id,
    ageWindow: [20, 20],
    phase: '20_23',
    family: 'contract',
    gates: [{ path: 'market.pending', op: 'exists' }],
    cooldown: 99999,
    repeatable: false,
    weight: 100,
    text: { title: 'Oferta narrativa histórica', body: 'La propuesta formal se decide dentro de la escena.' },
    intel: { visible: ['Términos formales'], uncertain: ['Evolución futura'] },
    choices: [
      { id: 'ACCEPT', label: 'Aceptar', intentTags: ['accept'], outcomeIds: ['ACCEPT_OUT'] },
      { id: 'COUNTER', label: 'Contraofertar', intentTags: ['counter'], outcomeIds: ['COUNTER_OUT'] },
      { id: 'DEFER', label: 'Esperar', intentTags: ['defer'], outcomeIds: ['DEFER_OUT'] },
      { id: 'REJECT', label: 'Rechazar', intentTags: ['reject'], outcomeIds: ['REJECT_OUT'] }
    ],
    outcomes: [
      { id: 'ACCEPT_OUT', baseWeight: 1, effects: [], messages: ['Decides firmar.'] },
      { id: 'COUNTER_OUT', baseWeight: 1, effects: [], messages: ['Pides otras condiciones.'] },
      { id: 'DEFER_OUT', baseWeight: 1, effects: [], messages: ['Decides esperar.'] },
      { id: 'REJECT_OUT', baseWeight: 1, effects: [], messages: ['Decides rechazar.'] }
    ],
    offerBridge: {
      choiceActions: {
        ACCEPT: 'accept',
        COUNTER: 'counter',
        DEFER: 'defer',
        REJECT: 'reject',
        ...choiceActions
      }
    }
  };
}

async function advanceUntil(session, screen, limit = 10) {
  for (let i = 0; i < limit; i++) {
    const view = session.getView();
    if (view.screen === screen && view.age >= 20) return session;
    // Provenance fixtures target the generic age-20 bridge. Real age-18 offers are
    // valid product state and must be resolved through market authority before the
    // fixture can continue to its intended age window.
    if (view.screen === 'offer' && view.age < 20) {
      await session.dispatch(command(session, 'offer', { offerId: view.offer.id, action: 'reject' }));
      continue;
    }
    await session.dispatch(command(session, 'continue', { maxDays: 366 }));
  }
  assert.equal(session.getView().screen, screen, `No apareció la pantalla ${screen}`);
  assert.ok(session.getView().age >= 20, `La pantalla ${screen} apareció antes de la edad del fixture`);
  return session;
}

async function resolvedBridge(event, choiceId) {
  const session = await GameSession.create(123, { events: [event] });
  await advanceUntil(session, 'decision');
  const decision = session.getView().decision;
  await session.dispatch(command(session, 'choose', { pendingInstanceId: decision.instanceId, choiceId }));
  return session;
}

async function historicalSource(event, { includeBridge = true, fingerprintOverride } = {}) {
  const identity = await contentIdentity([event]);
  const events = await buildActiveEventEvidence([event], identity);
  const eventEvidence = events[event.id];
  const source = {
    contentIdentity: identity,
    engineBuild: '0.8.0-t2.5',
    sessionVersions: [3],
    events
  };
  if (includeBridge) {
    source.offerBridges = {
      [event.id]: {
        eventFingerprint: fingerprintOverride ?? eventEvidence.fingerprint,
        choiceActions: { ...event.offerBridge.choiceActions }
      }
    };
  }
  return [identity, source];
}

test('valid active ACCEPT -> accept remains resumable', async () => {
  const event = bridgeEvent();
  const session = await resolvedBridge(event, 'ACCEPT');
  const snapshot = session.exportSnapshot();
  assert.equal(snapshot.state.market.history[0].source.disposition, 'accept');
  const resumed = await GameSession.resume(snapshot, { events: [event] });
  assert.deepEqual(resumed.exportSnapshot(), snapshot);
});

test('tampered ACCEPT -> delegate is rejected even with a coherently changed persisted action', async () => {
  const event = bridgeEvent();
  const session = await resolvedBridge(event, 'ACCEPT');
  const bad = session.exportSnapshot();
  bad.state.market.history[0].source.disposition = 'delegate';
  bad.state.market.history[0].action = 'delegate';
  await assert.rejects(GameSession.resume(bad, { events: [event] }), { code: 'INVALID_SAVE' });
});

test('tampered COUNTER -> defer is rejected although both normalize to reject', async () => {
  const event = bridgeEvent();
  const session = await resolvedBridge(event, 'COUNTER');
  const bad = session.exportSnapshot();
  assert.equal(bad.state.market.history[0].action, 'reject');
  bad.state.market.history[0].source.disposition = 'defer';
  await assert.rejects(GameSession.resume(bad, { events: [event] }), { code: 'INVALID_SAVE' });
});

test('same-ID content migration validates the historical bridge mapping, never the active mapping', async () => {
  const oldEvent = bridgeEvent('EVT_T51_SAME_ID_BRIDGE');
  const oldSession = await resolvedBridge(oldEvent, 'COUNTER');
  const oldSnapshot = oldSession.exportSnapshot();
  const [oldIdentity, source] = await historicalSource(oldEvent);

  const newEvent = bridgeEvent('EVT_T51_SAME_ID_BRIDGE', { COUNTER: 'defer' });
  const newIdentity = await contentIdentity([newEvent]);
  assert.notEqual(newIdentity, oldIdentity);
  const migrated = await GameSession.migrateAndResume(oldSnapshot, {
    events: [newEvent],
    contentSources: { [oldIdentity]: source },
    migrationRoutes: [{ sourceContentIdentity: oldIdentity, targetContentIdentity: newIdentity }]
  });

  const after = migrated.exportSnapshot();
  assert.equal(after.contentIdentity, newIdentity);
  assert.equal(after.decisionProvenance[0].sourceContentIdentity, oldIdentity);
  assert.equal(after.state.market.history[0].source.disposition, 'counter');
});

test('historical narrative offer fails closed when its source has no bridge evidence', async () => {
  const oldEvent = bridgeEvent('EVT_T51_MISSING_BRIDGE_EVIDENCE');
  const oldSession = await resolvedBridge(oldEvent, 'COUNTER');
  const oldSnapshot = oldSession.exportSnapshot();
  const [oldIdentity, source] = await historicalSource(oldEvent, { includeBridge: false });
  const newEvent = bridgeEvent('EVT_T51_MISSING_BRIDGE_EVIDENCE', { COUNTER: 'defer' });
  const newIdentity = await contentIdentity([newEvent]);

  await assert.rejects(
    GameSession.migrateAndResume(oldSnapshot, {
      events: [newEvent],
      contentSources: { [oldIdentity]: source },
      migrationRoutes: [{ sourceContentIdentity: oldIdentity, targetContentIdentity: newIdentity }]
    }),
    { code: 'INVALID_SAVE' }
  );
});

test('historical bridge fingerprint mismatch fails closed', async () => {
  const oldEvent = bridgeEvent('EVT_T51_BRIDGE_FINGERPRINT');
  const oldSession = await resolvedBridge(oldEvent, 'COUNTER');
  const oldSnapshot = oldSession.exportSnapshot();
  const [oldIdentity, source] = await historicalSource(oldEvent, { fingerprintOverride: '0'.repeat(64) });
  const newEvent = bridgeEvent('EVT_T51_BRIDGE_FINGERPRINT', { COUNTER: 'defer' });
  const newIdentity = await contentIdentity([newEvent]);

  await assert.rejects(
    GameSession.migrateAndResume(oldSnapshot, {
      events: [newEvent],
      contentSources: { [oldIdentity]: source },
      migrationRoutes: [{ sourceContentIdentity: oldIdentity, targetContentIdentity: newIdentity }]
    }),
    { code: 'INVALID_SAVE' }
  );
});

test('ordinary offer command remains unaffected by bridge provenance validation', async () => {
  const session = await GameSession.create(123, { events: [] });
  await advanceUntil(session, 'offer');
  const offer = session.getView().offer;
  await session.dispatch(command(session, 'offer', { offerId: offer.id, action: 'reject' }));
  const snapshot = session.exportSnapshot();
  assert.equal(snapshot.state.market.history.at(-1).source, undefined);
  const resumed = await GameSession.resume(snapshot, { events: [] });
  assert.deepEqual(resumed.exportSnapshot(), snapshot);
});
