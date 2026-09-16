import assert from 'node:assert/strict';
import test from 'node:test';
import { GameSession } from '../dist/session/game-session.js';
import { careerTerms } from '../dist/simulation/offers.js';

let seq = 0;
const command = (session, type, extra = {}) => ({
  type,
  commandId: `offer-bridge-${++seq}`,
  expectedRevision: session.getView().revision,
  ...extra
});

function bridgeEvent(id = 'EVT_T51_OFFER_BRIDGE', overrides = {}) {
  const choices = [
    { id: 'ACCEPT', label: 'Aceptar', intentTags: ['accept'], outcomeIds: ['ACCEPT_OUT'] },
    { id: 'COUNTER', label: 'Contraofertar', intentTags: ['counter'], outcomeIds: ['COUNTER_OUT'] },
    { id: 'DEFER', label: 'Esperar', intentTags: ['defer'], outcomeIds: ['DEFER_OUT'] },
    { id: 'REJECT', label: 'Rechazar', intentTags: ['reject'], outcomeIds: ['REJECT_OUT'] }
  ];
  return {
    id,
    ageWindow: [20, 20],
    phase: '20_23',
    family: 'contract',
    gates: [{ path: 'market.pending', op: 'exists' }],
    cooldown: 99999,
    repeatable: false,
    weight: 100,
    text: { title: 'Oferta narrativa', body: 'La propuesta formal se convierte en una decisión narrativa.' },
    intel: { visible: ['Términos formales'], uncertain: ['Evolución futura'] },
    choices,
    outcomes: [
      { id: 'ACCEPT_OUT', baseWeight: 1, effects: [], messages: ['Decides firmar.'] },
      { id: 'COUNTER_OUT', baseWeight: 1, effects: [], messages: ['Pides otras condiciones.'] },
      { id: 'DEFER_OUT', baseWeight: 1, effects: [], messages: ['Decides esperar.'] },
      { id: 'REJECT_OUT', baseWeight: 1, effects: [], messages: ['Decides rechazar.'] }
    ],
    offerBridge: {
      choiceActions: { ACCEPT: 'accept', COUNTER: 'counter', DEFER: 'defer', REJECT: 'reject' }
    },
    ...overrides
  };
}

async function advanceUntil(session, screen, limit = 6) {
  for (let i = 0; i < limit; i++) {
    if (session.getView().screen === screen) return session;
    await session.dispatch(command(session, 'continue', { maxDays: 366 }));
  }
  assert.equal(session.getView().screen, screen, `No apareció la pantalla ${screen}`);
  return session;
}

async function bridgedSession(event = bridgeEvent(), options = {}) {
  const session = await GameSession.create(123, { events: [event], ...options });
  return advanceUntil(session, 'decision');
}

async function ordinaryOfferSession() {
  const session = await GameSession.create(123, { events: [] });
  return advanceUntil(session, 'offer');
}

test('formal offer promotes to narrative bridge without extra RNG and keeps public terms visible', async () => {
  const ordinary = await ordinaryOfferSession();
  const bridged = await bridgedSession();
  const ordinarySnapshot = ordinary.exportSnapshot();
  const bridgedSnapshot = bridged.exportSnapshot();
  assert.equal(ordinary.getView().screen, 'offer');
  assert.equal(bridged.getView().screen, 'decision');
  assert.ok(bridged.getView().offer, 'la decisión narrativa debe seguir exponiendo los términos públicos');
  assert.deepEqual(bridgedSnapshot.state.rngState, ordinarySnapshot.state.rngState, 'promover la oferta no consume RNG');
  assert.deepEqual(careerTerms(bridgedSnapshot.state), careerTerms(ordinarySnapshot.state));
  assert.deepEqual(bridged.getView().offer, ordinary.getView().offer);
});

test('pending offer bridge survives strict save/resume with the same decision and offer', async () => {
  const event = bridgeEvent();
  const session = await bridgedSession(event);
  const before = session.exportSnapshot();
  const restored = await GameSession.resume(before, { events: [event] });
  assert.deepEqual(restored.exportSnapshot(), before);
  assert.deepEqual(restored.getView(), session.getView());
});

test('accept inside narrative choice signs exactly once and replays idempotently', async () => {
  const event = bridgeEvent();
  const session = await bridgedSession(event);
  const offer = structuredClone(session.exportSnapshot().state.market.pending);
  const decision = session.getView().decision;
  const choose = command(session, 'choose', { pendingInstanceId: decision.instanceId, choiceId: 'ACCEPT' });
  const [first, second] = await Promise.all([session.dispatch(choose), session.dispatch(choose)]);
  assert.equal(first.replayed, false);
  assert.equal(second.replayed, true);
  const after = session.exportSnapshot();
  assert.equal(after.state.market.pending, null);
  assert.deepEqual(careerTerms(after.state), offer.terms);
  assert.equal(after.state.market.history.length, 1);
  const history = after.state.market.history[0];
  assert.equal(history.action, 'accept');
  assert.equal(history.accepted, true);
  assert.deepEqual(history.source, {
    kind: 'narrative_choice', historyIndex: 0, eventId: event.id, choiceId: 'ACCEPT', disposition: 'accept'
  });
  assert.equal(after.pendingResult.messages.at(-1), history.explanation);
  const restored = await GameSession.resume(after, { events: [event] });
  assert.equal((await restored.dispatch(choose)).replayed, true);
  assert.deepEqual(restored.exportSnapshot(), after);
});

test('counter and defer close the proposal without mutating CareerTerms and preserve exact disposition', async () => {
  for (const disposition of ['COUNTER', 'DEFER']) {
    const event = bridgeEvent(`EVT_T51_OFFER_BRIDGE_${disposition}`);
    const session = await bridgedSession(event);
    const before = careerTerms(session.exportSnapshot().state);
    const decision = session.getView().decision;
    await session.dispatch(command(session, 'choose', { pendingInstanceId: decision.instanceId, choiceId: disposition }));
    const after = session.exportSnapshot();
    assert.deepEqual(careerTerms(after.state), before);
    assert.equal(after.state.market.pending, null);
    assert.equal(after.state.market.history.at(-1).action, 'reject');
    assert.equal(after.state.market.history.at(-1).accepted, false);
    assert.equal(after.state.market.history.at(-1).source.disposition, disposition.toLowerCase());
    await GameSession.resume(after, { events: [event] });
  }
});

test('ordinary offer command cannot bypass an active narrative bridge', async () => {
  const session = await bridgedSession();
  const offer = session.getView().offer;
  await assert.rejects(
    session.dispatch(command(session, 'offer', { offerId: offer.id, action: 'accept' })),
    { code: 'PENDING_SCREEN' }
  );
});

test('bridge rejects narrative effects that mutate contract authority and rolls back atomically', async () => {
  const bad = bridgeEvent('EVT_T51_BAD_OFFER_BRIDGE');
  bad.choices[0].immediateEffects = [{ kind: 'set', path: 'contract.salaryMonthly', value: 1 }];
  const session = await bridgedSession(bad);
  const before = session.exportSnapshot();
  const decision = session.getView().decision;
  await assert.rejects(
    session.dispatch(command(session, 'choose', { pendingInstanceId: decision.instanceId, choiceId: 'ACCEPT' })),
    { code: 'INVALID_OFFER_BRIDGE' }
  );
  assert.deepEqual(session.exportSnapshot(), before);
});

test('tampered narrative offer provenance is rejected on resume', async () => {
  const event = bridgeEvent();
  const session = await bridgedSession(event);
  const decision = session.getView().decision;
  await session.dispatch(command(session, 'choose', { pendingInstanceId: decision.instanceId, choiceId: 'ACCEPT' }));
  const bad = session.exportSnapshot();
  bad.state.market.history[0].source.choiceId = 'REJECT';
  await assert.rejects(GameSession.resume(bad, { events: [event] }), { code: 'INVALID_SAVE' });
});

test('ambiguous eligible offer bridges fail the command and leave the session untouched', async () => {
  const first = bridgeEvent('EVT_T51_OFFER_BRIDGE_A');
  const second = bridgeEvent('EVT_T51_OFFER_BRIDGE_B');
  const session = await GameSession.create(123, { events: [first, second] });
  for (let i = 0; i < 5; i++) {
    const before = session.exportSnapshot();
    try {
      await session.dispatch(command(session, 'continue', { maxDays: 366 }));
    } catch (error) {
      assert.match(String(error), /Ambiguous offer bridge/);
      assert.deepEqual(session.exportSnapshot(), before);
      return;
    }
  }
  assert.fail('Se esperaba un conflicto explícito entre bridges');
});
