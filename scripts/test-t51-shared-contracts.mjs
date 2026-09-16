import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialState } from '../dist/content/initial-state.js';
import { ambiguousEvent } from '../dist/content/events/18_20/helpers.js';
import { scheduleEvent } from '../dist/narrative/scheduler.js';
import { GameSession } from '../dist/session/game-session.js';

function baseEvent() {
  return {
    id: 'T51_CHOICE_ELIGIBILITY',
    ageWindow: [18, 18],
    phase: '18_20',
    family: 'market',
    gates: [],
    cooldown: 0,
    repeatable: false,
    weight: 100,
    text: { title: 'Elegibilidad', body: 'Fixture de contrato compartido.' },
    intel: { visible: [], uncertain: [] },
    choices: [
      { id: 'STAY', label: 'Quedarte', intentTags: [], outcomeIds: ['STAY_OUT'] },
      {
        id: 'LOAN',
        label: 'Aceptar cesión',
        intentTags: [],
        outcomeIds: ['LOAN_OUT'],
        eligibility: [{ path: 'flags.REAL_LOAN_AVAILABLE', op: 'eq', value: true }]
      }
    ],
    outcomes: [
      { id: 'STAY_OUT', baseWeight: 1, effects: [], messages: ['stay'] },
      { id: 'LOAN_OUT', baseWeight: 1, effects: [], messages: ['loan'] }
    ]
  };
}

function sched(state, event) {
  return scheduleEvent(state, [event], { ignoreRhythmGate: true });
}

test('choice eligibility hides an impossible option without mutating the canonical event', () => {
  const state = createInitialState(424242);
  state.flags.REAL_LOAN_AVAILABLE = false;
  const event = baseEvent();
  const scheduled = sched(state, event);
  assert.ok(scheduled);
  assert.deepEqual(scheduled.event.choices.map(choice => choice.id), ['STAY']);
  assert.deepEqual(event.choices.map(choice => choice.id), ['STAY', 'LOAN']);
});

test('choice eligibility exposes the option when its causal state exists', () => {
  const state = createInitialState(424242);
  state.flags.REAL_LOAN_AVAILABLE = true;
  const event = baseEvent();
  const scheduled = sched(state, event);
  assert.ok(scheduled);
  assert.deepEqual(scheduled.event.choices.map(choice => choice.id), ['STAY', 'LOAN']);
});

test('an event with no selectable choices is not schedulable', () => {
  const state = createInitialState(424242);
  state.flags.REAL_LOAN_AVAILABLE = false;
  const event = baseEvent();
  event.choices = [event.choices[1]];
  assert.equal(sched(state, event), null);
});

test('historical choices without eligibility remain fully backwards compatible', () => {
  const state = createInitialState(424242);
  const event = baseEvent();
  event.choices = [event.choices[0]];
  const scheduled = sched(state, event);
  assert.ok(scheduled);
  assert.equal(scheduled.event.choices.length, 1);
  assert.equal(scheduled.event.choices[0].id, 'STAY');
});

test('Session v3 persists the full canonical decision while exposing only eligible choices across resume', async () => {
  const event = baseEvent();
  const session = await GameSession.create(424242, { events: [event], sessionId: 't51-choice-session' });
  await session.dispatch({ type: 'continue', commandId: 'advance', expectedRevision: 0, maxDays: 1 });

  const view = session.getView();
  assert.equal(view.screen, 'decision');
  assert.deepEqual(view.decision.choices.map(choice => choice.id), ['STAY']);

  const snapshot = session.exportSnapshot();
  assert.deepEqual(
    snapshot.pendingDecision.event.choices.map(choice => choice.id),
    ['STAY', 'LOAN'],
    'pending snapshot must preserve the canonical definition for Session v3 fingerprint validation'
  );

  const before = structuredClone(snapshot);
  const restored = await GameSession.resume(snapshot, { events: [event] });
  assert.deepEqual(restored.getView().decision.choices.map(choice => choice.id), ['STAY']);
  assert.deepEqual(restored.exportSnapshot(), before);

  const restoredView = restored.getView();
  await assert.rejects(
    restored.dispatch({
      type: 'choose',
      commandId: 'hidden-choice',
      expectedRevision: restoredView.revision,
      pendingInstanceId: restoredView.decision.instanceId,
      choiceId: 'LOAN'
    }),
    error => error?.code === 'INVALID_CHOICE'
  );
  assert.deepEqual(restored.exportSnapshot(), before, 'hidden command must not mutate state');
});

test('ambiguousEvent preserves per-choice eligibility for canonical 18-20 content', () => {
  const event = ambiguousEvent({
    id: 'T51_HELPER_ELIGIBILITY',
    ageWindow: [18, 18],
    family: 'market',
    title: 'Helper',
    body: 'Helper fixture',
    visible: [],
    uncertain: [],
    choices: [{
      id: 'EXIT',
      label: 'Pedir salir',
      intentTags: ['agency'],
      eligibility: [{ path: 'flags.REAL_EXIT_AVAILABLE', op: 'eq', value: true }],
      primaryMessage: 'primary',
      secondaryMessage: 'secondary'
    }]
  });
  assert.deepEqual(event.choices[0].eligibility, [{ path: 'flags.REAL_EXIT_AVAILABLE', op: 'eq', value: true }]);
});
