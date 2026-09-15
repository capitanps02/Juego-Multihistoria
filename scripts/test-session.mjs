import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { GameSession } from '../dist/session/game-session.js';
import { EVENTS } from '../dist/content/events/index.js';
import { createInitialState } from '../dist/content/initial-state.js';
import { scheduleEvent } from '../dist/narrative/scheduler.js';
import { resolveChoiceInPlace } from '../dist/narrative/resolver.js';
import { advanceWorldDayInPlace } from '../dist/simulation/world-simulator.js';
import { respondToOffer } from '../dist/simulation/offers.js';
import { simulateCareer } from '../dist/simulation/career-simulator.js';
import { validateBuild } from '../dist/validation/build-validation.js';

const command = (s, type, extra = {}) => ({ type, commandId: crypto.randomUUID(), expectedRevision: s.getView().revision, ...extra });
async function pending(s) {
  for (let i = 0; i < 100; i++) {
    if (s.getView().screen === 'decision') return s.getView().decision;
    assert.notEqual(s.getView().screen, 'epilogue');
    if(s.getView().screen==='offer'){await s.dispatch(command(s,'offer',{offerId:s.getView().offer.id,action:'accept'}));continue;}
    await s.dispatch(command(s, s.getView().screen === 'result' ? 'acknowledge' : 'continue'));
  }
  throw Error('No decision within bounded test horizon');
}
const choiceCommand = (s, p) => command(s, 'choose', { pendingInstanceId: p.instanceId, choiceId: p.choices[0].id });
const errorCode = code => e => e.code === code;

test('100 view reads and mutations of returned copies do not alter state, scene or RNG', async () => {
  const s = await GameSession.create(424242);
  await pending(s);
  const before = s.exportSnapshot();
  for (let i = 0; i < 100; i++) {
    const view = s.getView();
    view.decision.choices[0].label = 'changed externally';
    view.journal.push({ title: 'foreign' });
    const exported = s.exportSnapshot();
    exported.state.rngState.narrative.draws++;
  }
  assert.deepEqual(s.exportSnapshot(), before);
  const view = JSON.stringify(s.getView());
  for (const hidden of ['rngState', 'baseWeight', 'privateAgenda', 'outcomeIds', 'seedTransitions', 'professional', 'intentTags']) assert.ok(!view.includes(`"${hidden}"`));
});

test('same command concurrently and after resume returns one persisted receipt/effect', async () => {
  let saved;
  const commit = async snapshot => { saved = snapshot; };
  let s = await GameSession.create(24, { commit });
  const p = await pending(s), c = choiceCommand(s, p);
  const [a, b] = await Promise.all([s.dispatch(c), s.dispatch(c)]);
  assert.equal(a.replayed, false);
  assert.equal(b.replayed, true);
  assert.deepEqual(a.receipt, b.receipt);
  assert.equal(saved.state.history.length, 1);
  s = await GameSession.resume(saved, { commit });
  const before = s.exportSnapshot();
  assert.equal((await s.dispatch(c)).replayed, true);
  assert.deepEqual(s.exportSnapshot(), before);
});

test('different double-click commands with same revision allow only one effect', async () => {
  const s = await GameSession.create(22), p = await pending(s);
  const c = choiceCommand(s, p);
  const results = await Promise.allSettled([s.dispatch(c), s.dispatch({ ...c, commandId: 'second-click' })]);
  assert.equal(results[0].status, 'fulfilled');
  assert.equal(results[1].reason.code, 'STALE_REVISION');
  assert.equal(s.exportSnapshot().state.history.length, 1);
});

test('command ID reuse, unknown choice and stale instance are rejected without mutation', async () => {
  const s = await GameSession.create(42), p = await pending(s);
  const before = s.exportSnapshot();
  await assert.rejects(s.dispatch({ ...choiceCommand(s, p), choiceId: 'no-such-choice' }), errorCode('INVALID_CHOICE'));
  await assert.rejects(s.dispatch({ ...choiceCommand(s, p), pendingInstanceId: 'old-scene' }), errorCode('STALE_DECISION'));
  assert.deepEqual(s.exportSnapshot(), before);
  const c = choiceCommand(s, p);
  await s.dispatch(c);
  const after = s.exportSnapshot();
  await assert.rejects(s.dispatch({ ...c, choiceId: p.choices[1].id }), errorCode('COMMAND_ID_REUSED'));
  assert.deepEqual(s.exportSnapshot(), after);
});

test('failed save rolls back world, decision, history and RNG; retry matches a clean run', async () => {
  let fail = false, saved;
  const commit = async snapshot => { if (fail) throw Error('disk full'); saved = snapshot; };
  const s = await GameSession.create(123, { commit });
  const p = await pending(s), before = s.exportSnapshot();
  const reference = await GameSession.resume(before);
  const c = choiceCommand(s, p);
  fail = true;
  await assert.rejects(s.dispatch(c), /disk full/);
  assert.deepEqual(s.exportSnapshot(), before);
  assert.deepEqual(saved, before);
  fail = false;
  await s.dispatch(c);
  await reference.dispatch(c);
  assert.deepEqual(s.exportSnapshot(), reference.exportSnapshot());
});

test('failed pending-scene commit does not consume selection RNG', async () => {
  let fail = false;
  const s = await GameSession.create(124, { commit: async () => { if (fail) throw Error('write failed'); } });
  const before = s.exportSnapshot(), c = command(s, 'continue');
  fail = true;
  await assert.rejects(s.dispatch(c), /write failed/);
  assert.deepEqual(s.exportSnapshot(), before);
  fail = false;
  await s.dispatch(c);
  const clean = await GameSession.resume(before);
  await clean.dispatch(c);
  assert.deepEqual(s.exportSnapshot(), clean.exportSnapshot());
});

test('queries observe confirmed state while async persistence is pending', async () => {
  let release, shouldBlock = false;
  const s = await GameSession.create(34, { commit: async () => { if (shouldBlock) await new Promise(r => { release = r; }); } });
  const before = s.exportSnapshot();
  shouldBlock = true;
  const task = s.dispatch(command(s, 'continue'));
  while (!release) await new Promise(r => setImmediate(r));
  assert.deepEqual(s.exportSnapshot(), before);
  release();
  await task;
  assert.equal(s.getView().revision, 1);
});

test('100 JSON save/resume cycles preserve pending scene, options and RNG exactly', async () => {
  let s = await GameSession.create(46);
  await pending(s);
  const before = s.exportSnapshot();
  const viewBefore = s.getView();
  for (let i = 0; i < 100; i++) s = await GameSession.resume(JSON.parse(JSON.stringify(s.exportSnapshot())));
  // JSON omits optional object properties whose value is undefined.
  assert.equal(JSON.stringify(s.exportSnapshot()), JSON.stringify(before));
  assert.deepEqual(s.getView(), viewBefore);
});

test('pending result survives reload; advancing cannot skip it or choose twice', async () => {
  let s = await GameSession.create(49), p = await pending(s);
  await s.dispatch(choiceCommand(s, p));
  const view = s.getView();
  s = await GameSession.resume(JSON.parse(JSON.stringify(s.exportSnapshot())));
  assert.deepEqual(s.getView(), view);
  await assert.rejects(s.dispatch(command(s, 'continue')), errorCode('PENDING_SCREEN'));
  await assert.rejects(s.dispatch(choiceCommand(s, p)), errorCode('STALE_DECISION'));
  await s.dispatch(command(s, 'acknowledge'));
  assert.equal(s.getView().screen, 'career');
  await assert.rejects(s.dispatch(command(s, 'acknowledge')), errorCode('NO_RESULT'));
});

test('catalog mutation and pending-event tampering cannot silently reinterpret a save', async () => {
  const events = structuredClone(EVENTS);
  const s = await GameSession.create(12, { events });
  events[0].text.title = 'outside mutation';
  await pending(s);
  const saved = s.exportSnapshot();
  await assert.rejects(GameSession.resume(saved, { events }), errorCode('CONTENT_CHANGED'));
  const broken = structuredClone(saved);
  broken.pendingDecision.event.choices[0].label = 'tampered';
  await assert.rejects(GameSession.resume(broken), errorCode('INVALID_SAVE'));
  assert.ok(!JSON.stringify(s.getView()).includes('outside mutation'));
});

test('bounded advance yields without inventing a decision or retirement', async () => {
  const s = await GameSession.create(2, { events: [] });
  await s.dispatch(command(s, 'continue', { maxDays: 12 }));
  assert.equal(s.exportSnapshot().state.runtime.day, 12);
  assert.equal(s.getView().screen, 'career');
  const before = s.exportSnapshot();
  await assert.rejects(s.dispatch(command(s, 'continue', { maxDays: Infinity })), errorCode('INVALID_COMMAND'));
  assert.deepEqual(s.exportSnapshot(), before);
});

test('error after an immediate effect cannot leak a partial resolution', async () => {
  const event = structuredClone(EVENTS.find(e => e.id === 'EVT_18_PRE_001'));
  event.choices[0].immediateEffects = [{ kind: 'numeric', path: 'finances.cash', delta: 99 }];
  event.choices[0].outcomeIds = [];
  const s = await GameSession.create(1, { events: [event] }), p = await pending(s);
  const before = s.exportSnapshot();
  await assert.rejects(s.dispatch(choiceCommand(s, p)), /No plausible outcomes/);
  assert.deepEqual(s.exportSnapshot(), before);
});

test('queued command and storage callback cannot mutate session-owned objects', async () => {
  const s = await GameSession.create(5, { commit: async snap => { snap.state.finances.cash = -1; } });
  assert.equal(s.exportSnapshot().state.finances.cash, 1200);
  const c = command(s, 'continue');
  const task = s.dispatch(c);
  c.expectedRevision = 999;
  await task;
  assert.equal(s.getView().screen, 'decision');
});

test('first 20 player choices match direct motor state and RNG at each decision boundary', async () => {
  const s = await GameSession.create(424242, { microfeeds: false });
  const reference = createInitialState(424242);
  for (let i = 0; i < 20; i++) {
    if (i) advanceWorldDayInPlace(reference);
    let selected;
    for (let day = 0; day < 1000; day++) {
      if(reference.market?.pending)respondToOffer(reference,reference.market.pending.id,'accept');
      selected = scheduleEvent(reference, EVENTS);
      if (selected) break;
      advanceWorldDayInPlace(reference);
    }
    assert.ok(selected);
    const p = await pending(s);
    assert.equal(s.exportSnapshot().pendingDecision.event.id, selected.event.id);
    resolveChoiceInPlace(reference, selected.event, selected.event.choices[0].id);
    await s.dispatch(choiceCommand(s, p));
    assert.deepEqual(s.exportSnapshot().state, reference);
  }
});

test('complete interactive career matches headless narrative and closes with persistent result', async () => {
  const s = await GameSession.create(424242);
  for (let i = 0; i < 3000 && s.getView().screen !== 'epilogue'; i++) {
    const v = s.getView();
    if(v.screen==='offer'){await s.dispatch(command(s,'offer',{offerId:v.offer.id,action:'accept'}));continue;}
    await s.dispatch(v.screen === 'decision' ? choiceCommand(s, v.decision) : command(s, v.screen === 'result' ? 'acknowledge' : 'continue'));
  }
  assert.equal(s.getView().screen, 'epilogue');
  const reference = simulateCareer({ seed: 424242, choiceStrategy: 'first', untilRetirement: true, maxAge: 55 });
  assert.deepEqual(s.exportSnapshot().state.history, reference.state.history);
  assert.deepEqual(s.exportSnapshot().state.rngState, reference.state.rngState);
  await assert.rejects(s.dispatch(command(s, 'continue')), errorCode('CAREER_CLOSED'));
});

test('existing catalog validates; updated headless offer policy is reproducible', () => {
  assert.equal(validateBuild(EVENTS).filter(x => x.level === 'error').length, 0);
  const baseline = JSON.parse(fs.readFileSync('examples/save-v08-seed-424242.json', 'utf8'));
  const now = simulateCareer({ seed: 424242, untilRetirement: true, maxAge: 55 }).state;
  assert.ok(baseline.history.length>0); // Historical v0.8 fixture stays untouched.
  assert.ok(now.market.history.length>0);
  assert.deepEqual(now,simulateCareer({seed:424242,untilRetirement:true,maxAge:55}).state);
});
