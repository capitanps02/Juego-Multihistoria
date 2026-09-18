import test from 'node:test';
import assert from 'node:assert/strict';
import { EVENTS } from '../dist/content/events/index.js';
import { createInitialState } from '../dist/content/initial-state.js';
import { eventGatesPass } from '../dist/narrative/event-gates.js';
import { certifyPlayerClubLeadershipInPlace } from '../dist/simulation/player-leadership-authority.js';

const event = EVENTS.find(row => row.id === 'EVT_30_CCH_001');

test('EVT_30_CCH_001 is an active canonical addition with the four master choices', () => {
  assert.ok(event);
  assert.equal(event.text.title, 'Te enteras por la pizarra');
  assert.deepEqual(event.choices.map(choice => choice.id), ['A','B','C','D']);
  assert.deepEqual(event.choices.map(choice => choice.label), [
    'Hablar con el entrenador después del partido',
    'Preguntar antes de salir al calentamiento',
    'No decir nada y responder en el campo cuando toque',
    'Pedir a un líder del vestuario que aclare el criterio general'
  ]);
  assert.equal(event.canonStatus, 'technical_adaptation');
});

test('EVT_30_CCH_001 uses only current-club main-captain authority for its currently enabled trigger route', () => {
  const state=createInitialState(300301);
  state.age=30;
  state.phase='30_34';
  state.professional.initializedAt30=true;
  state.professional.statusInertia=100;
  assert.equal(eventGatesPass(state,event), false, 'status inertia alone has no canonical threshold and must not be guessed');

  certifyPlayerClubLeadershipInPlace(state,'secondary_captain','TEST','B');
  assert.equal(eventGatesPass(state,event), false);
  certifyPlayerClubLeadershipInPlace(state,'captain','TEST','A');
  assert.equal(eventGatesPass(state,event), true);
});

test('EVT_30_CCH_001 writes SEED_ROLE_COMMUNICATION for every canonical response and invents no coach NPC identity', () => {
  assert.deepEqual(event.seedsWrite, ['SEED_ROLE_COMMUNICATION']);
  assert.deepEqual(event.npcRefs ?? [], []);
  for (const choice of event.choices) {
    const outcomes=event.outcomes.filter(outcome=>choice.outcomeIds.includes(outcome.id));
    assert.equal(outcomes.length,2);
    for (const outcome of outcomes) {
      const transition=(outcome.seedTransitions ?? []).find(row=>row.seedId==='SEED_ROLE_COMMUNICATION');
      assert.ok(transition, `${choice.id}: missing role-communication memory`);
      assert.equal(transition.action,'create');
      assert.equal(transition.payload.choice,choice.id);
    }
  }
});


test('shifted canonical bridge scenes replace their legacy shells in the active catalog', () => {
  const bridge=EVENTS.find(row=>row.id==='EVT_30_BRIDGE_001');
  const finish=EVENTS.find(row=>row.id==='EVT_33_FIN_001');
  assert.ok(bridge);
  assert.ok(finish);
  assert.equal(EVENTS.some(row=>row.id==='EVT_30_IDN_001'),false);
  assert.equal(EVENTS.some(row=>row.id==='EVT_33_END_001'),false);
  assert.deepEqual(bridge.choices.map(choice=>choice.id),['A','B','C','D']);
  assert.deepEqual(bridge.seedsRead,['SEED_AGE30_PRIORITY']);
  assert.deepEqual(bridge.seedsWrite,['SEED_VETERAN_LABEL']);
  assert.deepEqual(finish.choices.map(choice=>choice.id),['A','B','C','D','E','F']);
  assert.deepEqual(finish.seedsWrite,['SEED_AGE34_PRIORITY','SEED_RETIREMENT_DISTANCE_PROFILE']);
});

test('EVT_33_FIN_001 retirement reflection stays non-terminal', () => {
  const finish=EVENTS.find(row=>row.id==='EVT_33_FIN_001');
  const choice=finish.choices.find(row=>row.id==='F');
  const outcomes=finish.outcomes.filter(outcome=>choice.outcomeIds.includes(outcome.id));
  assert.equal(outcomes.length,2);
  for(const outcome of outcomes){
    assert.equal(JSON.stringify(outcome.effects ?? []).includes('EARLY_RETIRED_30_34'),false);
    assert.equal((outcome.seedTransitions ?? []).some(row=>row.seedId==='SEED_RETIREMENT_DISTANCE_PROFILE'),true);
  }
});
