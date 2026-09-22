import test from 'node:test';
import assert from 'node:assert/strict';
import { GameSession } from '../dist/session/game-session.js';
import { EVENTS } from '../dist/content/events/index.js';

const command = (session, type, extra = {}) => ({
  type,
  commandId: crypto.randomUUID(),
  expectedRevision: session.getView().revision,
  ...extra
});

async function autoBlock(session, maxWeeks = 6) {
  await session.dispatch(command(session, 'auto', { action: 'start', maxWeeks }));
  for (let guard = 0; guard < 20 && session.getView().simulation.mode === 'auto_simulating'; guard += 1) {
    await session.dispatch(command(session, 'auto', { action: 'step' }));
  }
  assert.notEqual(session.getView().simulation.mode, 'auto_simulating', 'auto block did not stop');
  return session.getView();
}

async function emptySession(seed, sessionId = `a14-${seed}-${crypto.randomUUID()}`) {
  return GameSession.create(seed, { events: [], microfeeds: false, sessionId });
}

async function sessionFromMutatedState(seed, mutate, sessionId) {
  const base = await emptySession(seed, sessionId);
  const snapshot = base.exportSnapshot();
  mutate(snapshot.state);
  return GameSession.resume(snapshot, { events: [] });
}

async function januaryOfferSession() {
  for (let seed = 1; seed <= 80; seed += 1) {
    const session = await sessionFromMutatedState(seed, state => {
      state.date = '2027-01-07';
      state.runtime.day = 190;
      state.runtime.seasonDay = 190;
      state.runtime.daysSinceNarrative = 190;
      state.sport.roleScore = 18;
      state.sport.appearances = 0;
      state.flags.OFFICIAL_DEBUT = false;
      state.body.risk = 18;
    }, `a14-offer-${seed}`);
    await session.dispatch(command(session, 'auto', { action: 'start', maxWeeks: 2 }));
    if (session.getView().screen === 'offer') return session;
  }
  throw new Error('No deterministic January offer seed found');
}

async function importantInjurySession() {
  for (let seed = 1; seed <= 120; seed += 1) {
    const session = await sessionFromMutatedState(seed, state => {
      state.body.risk = 100;
      state.body.fatigue = 100;
      state.body.fitness = 35;
      state.sport.roleScore = 80;
    }, `a14-injury-${seed}`);
    const view = await autoBlock(session, 8);
    if (view.simulation.interruption?.type === 'important_injury') return session;
  }
  throw new Error('No deterministic important-injury seed found');
}

test('T14.1 AUTO-SIM advances several empty weeks without intervention', async () => {
  const session = await emptySession(1, 't14-1');
  const view = await autoBlock(session, 4);
  assert.equal(session.exportSnapshot().state.runtime.day, 28);
  assert.equal(view.simulation.summary.daysSimulated, 28);
  assert.equal(view.simulation.summary.weeksSimulated, 4);
});

test('T14.2 narrative decision stops AUTO-SIM exactly before player input', async () => {
  const event = structuredClone(EVENTS.find(row => row.id === 'EVT_18_PRE_001'));
  assert.ok(event);
  const session = await GameSession.create(42, { events: [event], microfeeds: false, sessionId: 't14-2' });
  await session.dispatch(command(session, 'auto', { action: 'start' }));
  const view = session.getView();
  assert.equal(view.screen, 'decision');
  assert.equal(view.simulation.mode, 'waiting_for_decision');
  assert.equal(view.simulation.interruption.type, 'decision');
  assert.equal(session.exportSnapshot().state.runtime.day, 0);
});

test('T14.3 a formal offer interrupts AUTO-SIM before another world day', async () => {
  const session = await januaryOfferSession();
  const view = session.getView();
  assert.equal(view.screen, 'offer');
  assert.equal(view.simulation.mode, 'waiting_for_decision');
  assert.equal(view.simulation.interruption.type, 'offer');
  assert.equal(session.exportSnapshot().state.date, '2027-01-08');
});

test('T14.4 an important injury interrupts AUTO-SIM on its authoritative world tick', async () => {
  const session = await importantInjurySession();
  const snapshot = session.exportSnapshot();
  assert.equal(session.getView().simulation.interruption.type, 'important_injury');
  assert.ok(Number(snapshot.state.world.injuryWeeksRemaining) >= 3);
  assert.equal(snapshot.state.body.acuteInjury, true);
});

test('T14.5 MAX_AUTO_WEEKS=6 stops an empty block at exactly 42 days', async () => {
  const session = await emptySession(42, 't14-5');
  const view = await autoBlock(session);
  assert.equal(view.simulation.interruption.type, 'max_auto_weeks');
  assert.equal(view.simulation.summary.daysSimulated, 42);
  assert.equal(session.exportSnapshot().state.runtime.day, 42);
});

test('T14.6 PAUSE is applied only after the current committed weekly unit', async () => {
  const session = await emptySession(777, 't14-6');
  await session.dispatch(command(session, 'auto', { action: 'start' }));
  assert.equal(session.exportSnapshot().state.runtime.day, 7);
  await session.dispatch(command(session, 'auto', { action: 'pause' }));
  assert.equal(session.getView().simulation.mode, 'paused');
  assert.equal(session.exportSnapshot().state.runtime.day, 7);
});

test('T14.7 RESUME continues from the exact paused state', async () => {
  const paused = await emptySession(777, 't14-7-paused');
  await paused.dispatch(command(paused, 'auto', { action: 'start' }));
  await paused.dispatch(command(paused, 'auto', { action: 'pause' }));
  await paused.dispatch(command(paused, 'auto', { action: 'resume' }));
  await paused.dispatch(command(paused, 'auto', { action: 'step' }));

  const continuous = await emptySession(777, 't14-7-continuous');
  await continuous.dispatch(command(continuous, 'auto', { action: 'start' }));
  await continuous.dispatch(command(continuous, 'auto', { action: 'step' }));

  assert.deepEqual(paused.exportSnapshot().state, continuous.exportSnapshot().state);
  assert.equal(paused.exportSnapshot().state.runtime.day, 14);
});

test('T14.8 PAUSED save/load/resume preserves the future result', async () => {
  let resumed = await emptySession(1, 't14-8');
  await resumed.dispatch(command(resumed, 'auto', { action: 'start' }));
  await resumed.dispatch(command(resumed, 'auto', { action: 'pause' }));
  const saved = JSON.parse(JSON.stringify(resumed.exportSnapshot()));
  resumed = await GameSession.resume(saved, { events: [] });
  await resumed.dispatch(command(resumed, 'auto', { action: 'resume' }));
  while (resumed.getView().simulation.mode === 'auto_simulating') {
    await resumed.dispatch(command(resumed, 'auto', { action: 'step' }));
  }

  const reference = await emptySession(1, 't14-8-ref');
  await autoBlock(reference, 6);
  assert.deepEqual(resumed.exportSnapshot().state, reference.exportSnapshot().state);
});

test('T14.9 WAITING_FOR_DECISION save/load preserves the exact pending decision', async () => {
  const event = structuredClone(EVENTS.find(row => row.id === 'EVT_18_PRE_001'));
  assert.ok(event);
  let session = await GameSession.create(42, { events: [event], microfeeds: false, sessionId: 't14-9' });
  await session.dispatch(command(session, 'auto', { action: 'start' }));
  const before = session.getView();
  session = await GameSession.resume(JSON.parse(JSON.stringify(session.exportSnapshot())), { events: [event] });
  const after = session.getView();
  assert.deepEqual(after.decision, before.decision);
  assert.equal(after.simulation.mode, 'waiting_for_decision');
  assert.deepEqual(after.simulation.interruption, before.simulation.interruption);
});

test('T14.10 concurrent AUTO step double-click cannot simulate two weeks', async () => {
  const session = await emptySession(1, 't14-10');
  await session.dispatch(command(session, 'auto', { action: 'start' }));
  const revision = session.getView().revision;
  const a = { type: 'auto', action: 'step', commandId: 't14-10-a', expectedRevision: revision };
  const b = { type: 'auto', action: 'step', commandId: 't14-10-b', expectedRevision: revision };
  const results = await Promise.allSettled([session.dispatch(a), session.dispatch(b)]);
  assert.equal(results.filter(row => row.status === 'fulfilled').length, 1);
  assert.equal(results.filter(row => row.status === 'rejected' && row.reason?.code === 'STALE_REVISION').length, 1);
  assert.equal(session.exportSnapshot().state.runtime.day, 14);
});

test('T14.11 AUTO-SIM is state-equivalent to manual canonical weekly simulation for reference seeds', async () => {
  for (const seed of [1, 42, 777, 424242]) {
    const automatic = await emptySession(seed, `t14-11-auto-${seed}`);
    await autoBlock(automatic, 6);

    const manual = await emptySession(seed, `t14-11-manual-${seed}`);
    for (let week = 0; week < 6; week += 1) {
      await manual.dispatch(command(manual, 'continue', { maxDays: 7 }));
    }

    assert.deepEqual(automatic.exportSnapshot().state, manual.exportSnapshot().state, `seed ${seed}`);
  }
});

test('T14.12 season transition is a safe AUTO-SIM boundary', async () => {
  const session = await sessionFromMutatedState(42, state => {
    state.date = '2027-06-30';
    state.runtime.day = 364;
    state.runtime.seasonDay = 364;
    state.runtime.daysSinceNarrative = 364;
  }, 't14-12');
  await session.dispatch(command(session, 'auto', { action: 'start', maxWeeks: 6 }));
  const view = session.getView();
  assert.equal(view.screen, 'summary');
  assert.equal(view.simulation.mode, 'season_transition');
  assert.equal(view.simulation.interruption.type, 'season_transition');
  assert.equal(view.simulation.summary.daysSimulated, 1);
  assert.equal(session.exportSnapshot().state.date, '2027-07-01');
  assert.equal(session.exportSnapshot().state.age, 19);
});

test('T14.13 closed retirement is terminal and rejects further AUTO-SIM', async () => {
  let session = await emptySession(1, 't14-13');
  const snapshot = session.exportSnapshot();
  snapshot.state.retirement.status = 'closed';
  snapshot.state.retirement.decidedDate = snapshot.state.date;
  snapshot.state.retirement.announcedDate = snapshot.state.date;
  snapshot.state.retirement.closedDate = snapshot.state.date;
  snapshot.state.retirement.decisionAge = snapshot.state.age;
  snapshot.state.retirement.reason = 'qa_terminal';
  snapshot.state.retirement.closureType = 'qa_terminal';
  session = await GameSession.resume(snapshot, { events: [] });
  assert.equal(session.getView().screen, 'epilogue');
  await assert.rejects(
    session.dispatch(command(session, 'auto', { action: 'start' })),
    error => error?.code === 'CAREER_CLOSED'
  );
  assert.equal(session.exportSnapshot().state.runtime.day, 0);
});

test('T14.14 PeriodSummary reports exactly the traversed interval', async () => {
  const session = await emptySession(1, 't14-14');
  const view = await autoBlock(session, 4);
  const summary = view.simulation.summary;
  assert.equal(summary.fromDate, '2026-07-01');
  assert.equal(summary.toDate, '2026-07-29');
  assert.equal(summary.fromWeek, 0);
  assert.equal(summary.toWeek, 4);
  assert.equal(summary.daysSimulated, 28);
  assert.equal(summary.weeksSimulated, 4);
});

test('T14.15 save/load cannot duplicate a simulated week', async () => {
  let session = await emptySession(42, 't14-15');
  await session.dispatch(command(session, 'auto', { action: 'start' }));
  await session.dispatch(command(session, 'auto', { action: 'pause' }));
  session = await GameSession.resume(JSON.parse(JSON.stringify(session.exportSnapshot())), { events: [] });
  await session.dispatch(command(session, 'auto', { action: 'resume' }));
  await session.dispatch(command(session, 'auto', { action: 'step' }));
  assert.equal(session.exportSnapshot().state.runtime.day, 14);

  const reference = await emptySession(42, 't14-15-ref');
  await reference.dispatch(command(reference, 'auto', { action: 'start' }));
  await reference.dispatch(command(reference, 'auto', { action: 'step' }));
  assert.deepEqual(session.exportSnapshot().state, reference.exportSnapshot().state);
});


test('T14.16 manual advance cannot interleave with an active AUTO-SIM block', async () => {
  const session = await emptySession(1, 't14-16');
  await session.dispatch(command(session, 'auto', { action: 'start' }));
  assert.equal(session.getView().simulation.mode, 'auto_simulating');
  const before = session.exportSnapshot();
  await assert.rejects(
    session.dispatch(command(session, 'continue', { maxDays: 7 })),
    error => error?.code === 'AUTO_STATE'
  );
  assert.deepEqual(session.exportSnapshot(), before);
});
