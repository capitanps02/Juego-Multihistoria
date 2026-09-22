import test from 'node:test';
import assert from 'node:assert/strict';
import { GameSession } from '../dist/session/game-session.js';
import { EVENTS } from '../dist/content/events/index.js';
import { createInitialState } from '../dist/content/initial-state.js';
import { advanceWorldDayInPlace } from '../dist/simulation/world-simulator.js';

const command = (session, action, extra = {}) => ({
  type: 'auto',
  action,
  commandId: crypto.randomUUID(),
  expectedRevision: session.getView().revision,
  ...extra
});

async function blankSession(seed, sessionId = `a14-${seed}`) {
  return GameSession.create(seed, { events: [], microfeeds: false, sessionId });
}

async function resumeMutatedBlank(seed, mutate, sessionId = `a14-mut-${seed}`) {
  const created = await blankSession(seed, sessionId);
  const snapshot = created.exportSnapshot();
  mutate(snapshot.state);
  return GameSession.resume(snapshot, { events: [] });
}

async function finishAutoBlock(session, maxSteps = 20) {
  for (let i = 0; i < maxSteps && session.getView().simulation.mode === 'auto_simulating'; i += 1) {
    await session.dispatch(command(session, 'step'));
  }
  return session.getView();
}

function findJanuaryOfferSeed() {
  for (let seed = 1; seed <= 500; seed += 1) {
    const state = createInitialState(seed);
    state.date = '2027-01-07';
    state.runtime.day = 190;
    state.runtime.seasonDay = 190;
    advanceWorldDayInPlace(state);
    if (state.market?.pending) return seed;
  }
  throw new Error('No deterministic January offer seed found');
}

function findInjurySeed() {
  for (let seed = 1; seed <= 5000; seed += 1) {
    const state = createInitialState(seed);
    state.runtime.day = 6;
    state.runtime.seasonDay = 6;
    state.body.risk = 100;
    advanceWorldDayInPlace(state);
    if (Number(state.world.injuryWeeksRemaining ?? 0) >= 3) return seed;
  }
  throw new Error('No deterministic injury seed found');
}

for (const weeks of [4, 6, 8]) {
  test(`A14 max auto weeks=${weeks} is balanceable and stops with an exact summary`, async () => {
    const session = await blankSession(424242 + weeks, `a14-max-${weeks}`);
    await session.dispatch(command(session, 'start', { maxWeeks: weeks }));
    const view = await finishAutoBlock(session);
    assert.equal(view.screen, 'summary');
    assert.equal(view.simulation.mode, 'showing_summary');
    assert.equal(view.simulation.interruption?.type, 'max_auto_weeks');
    assert.equal(view.simulation.elapsedDays, weeks * 7);
    assert.equal(view.simulation.summary?.daysSimulated, weeks * 7);
    assert.equal(view.simulation.summary?.weeksSimulated, weeks);
    assert.equal(session.exportSnapshot().state.runtime.day, weeks * 7);
  });
}

test('A14 pause is a safe persisted boundary; resume continues from the same weekly state', async () => {
  let session = await blankSession(42, 'a14-pause');
  await session.dispatch(command(session, 'start', { maxWeeks: 6 }));
  const dayAtBoundary = session.exportSnapshot().state.runtime.day;
  assert.equal(dayAtBoundary, 7);

  await session.dispatch(command(session, 'pause'));
  assert.equal(session.getView().simulation.mode, 'paused');
  assert.equal(session.exportSnapshot().state.runtime.day, dayAtBoundary);

  const saved = JSON.parse(JSON.stringify(session.exportSnapshot()));
  session = await GameSession.resume(saved, { events: [] });
  assert.equal(session.getView().simulation.mode, 'paused');
  assert.equal(session.exportSnapshot().state.runtime.day, dayAtBoundary);

  await session.dispatch(command(session, 'resume'));
  await session.dispatch(command(session, 'step'));
  assert.equal(session.exportSnapshot().state.runtime.day, 14);

  const reference = await blankSession(42, 'a14-reference');
  await reference.dispatch(command(reference, 'start', { maxWeeks: 6 }));
  await reference.dispatch(command(reference, 'step'));
  assert.deepEqual(session.exportSnapshot().state, reference.exportSnapshot().state);
});

test('A14 double-click/reentry allows at most one active temporal unit', async () => {
  const session = await blankSession(777, 'a14-lock');
  await session.dispatch(command(session, 'start', { maxWeeks: 6 }));
  const revision = session.getView().revision;
  const a = { type: 'auto', action: 'step', commandId: 'a14-step-a', expectedRevision: revision };
  const b = { type: 'auto', action: 'step', commandId: 'a14-step-b', expectedRevision: revision };
  const results = await Promise.allSettled([session.dispatch(a), session.dispatch(b)]);
  assert.equal(results.filter(row => row.status === 'fulfilled').length, 1);
  const rejected = results.find(row => row.status === 'rejected');
  assert.equal(rejected?.reason?.code, 'STALE_REVISION');
  assert.equal(session.exportSnapshot().state.runtime.day, 14);
});

test('A14 narrative decision interrupts immediately and survives save/load', async () => {
  const event = structuredClone(EVENTS.find(row => row.id === 'EVT_18_PRE_001'));
  assert.ok(event);
  let session = await GameSession.create(1, { events: [event], microfeeds: false, sessionId: 'a14-decision' });
  await session.dispatch(command(session, 'start', { maxWeeks: 6 }));
  let view = session.getView();
  assert.equal(view.screen, 'decision');
  assert.equal(view.simulation.mode, 'waiting_for_decision');
  assert.equal(view.simulation.interruption?.type, 'decision');

  session = await GameSession.resume(JSON.parse(JSON.stringify(session.exportSnapshot())), { events: [event] });
  view = session.getView();
  assert.equal(view.screen, 'decision');
  assert.equal(view.simulation.interruption?.source, event.id);

  await session.dispatch({
    type: 'choose',
    commandId: 'a14-choose',
    expectedRevision: view.revision,
    pendingInstanceId: view.decision.instanceId,
    choiceId: view.decision.choices[0].id
  });
  assert.equal(session.getView().simulation.mode, 'waiting_for_decision');
  await session.dispatch({
    type: 'acknowledge',
    commandId: 'a14-ack',
    expectedRevision: session.getView().revision
  });
  assert.equal(session.getView().simulation.mode, 'auto_simulating');
});

test('A14 formal offer produced by the canonical world tick interrupts auto-simulation', async () => {
  const seed = findJanuaryOfferSeed();
  const session = await resumeMutatedBlank(seed, state => {
    state.date = '2027-01-07';
    state.runtime.day = 190;
    state.runtime.seasonDay = 190;
  }, 'a14-offer');
  await session.dispatch(command(session, 'start', { maxWeeks: 6 }));
  const view = session.getView();
  assert.equal(view.screen, 'offer');
  assert.equal(view.simulation.mode, 'waiting_for_decision');
  assert.equal(view.simulation.interruption?.type, 'offer');
  assert.equal(view.simulation.summary?.daysSimulated, 1);
});

test('A14 important injury interrupts on the exact world unit that creates it', async () => {
  const seed = findInjurySeed();
  const session = await resumeMutatedBlank(seed, state => {
    state.runtime.day = 6;
    state.runtime.seasonDay = 6;
    state.body.risk = 100;
  }, 'a14-injury');
  await session.dispatch(command(session, 'start', { maxWeeks: 6 }));
  const view = session.getView();
  assert.equal(view.screen, 'summary');
  assert.equal(view.simulation.interruption?.type, 'important_injury');
  assert.equal(view.simulation.summary?.daysSimulated, 1);
  assert.ok(Number(session.exportSnapshot().state.world.injuryWeeksRemaining ?? 0) >= 3);
});

test('A14 season transition is a hard safe boundary', async () => {
  const session = await resumeMutatedBlank(99, state => {
    state.date = '2027-06-29';
    state.runtime.day = 363;
    state.runtime.seasonDay = 363;
    state.season = '2026-27';
    state.age = 18;
    state.phase = '18_20';
  }, 'a14-season');
  await session.dispatch(command(session, 'start', { maxWeeks: 6 }));
  const view = session.getView();
  assert.equal(view.screen, 'summary');
  assert.equal(view.simulation.mode, 'season_transition');
  assert.equal(view.simulation.interruption?.type, 'season_transition');
  assert.equal(view.simulation.summary?.daysSimulated, 2);
  assert.equal(session.exportSnapshot().state.date, '2027-07-01');
  assert.equal(session.exportSnapshot().state.age, 19);
  assert.equal(session.exportSnapshot().state.season, '2027-28');
});

test('A14 retirement is terminal and no later week can be simulated', async () => {
  const session = await resumeMutatedBlank(123, state => {
    state.flags.EARLY_RETIRED_30_34 = true;
  }, 'a14-retirement');
  await session.dispatch(command(session, 'start', { maxWeeks: 6 }));
  assert.equal(session.getView().screen, 'epilogue');
  assert.equal(session.getView().simulation.mode, 'retirement');
  assert.equal(session.exportSnapshot().state.retirement.status, 'closed');
  await assert.rejects(session.dispatch(command(session, 'step')), error => error?.code === 'CAREER_CLOSED');
});

test('A14 auto-simulation is state-equivalent to six manual canonical weekly advances for reference seeds', async () => {
  for (const seed of [1, 42, 777, 424242]) {
    const auto = await blankSession(seed, `a14-auto-${seed}`);
    await auto.dispatch(command(auto, 'start', { maxWeeks: 6 }));
    await finishAutoBlock(auto);
    assert.equal(auto.getView().simulation.summary?.daysSimulated, 42);

    const manual = await blankSession(seed, `a14-manual-${seed}`);
    for (let week = 0; week < 6; week += 1) {
      await manual.dispatch({
        type: 'continue',
        maxDays: 7,
        commandId: `manual-${week}`,
        expectedRevision: manual.getView().revision
      });
    }

    assert.deepEqual(auto.exportSnapshot().state, manual.exportSnapshot().state, `seed ${seed}`);
  }
}
