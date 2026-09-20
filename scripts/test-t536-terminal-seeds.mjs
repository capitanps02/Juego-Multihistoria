import test from 'node:test';
import assert from 'node:assert/strict';
import { CANONICAL_34_PLUS_SEED_PRODUCERS } from '../dist/catalog/seed-34plus.js';
import { EVENTS } from '../dist/content/events/index.js';
import { createInitialState } from '../dist/content/initial-state.js';
import { resolveChoiceInPlace } from '../dist/narrative/resolver.js';

const expected = new Map([
  ['EVT_37_ANNOUNCE_001',['SEED_FAREWELL_ANNOUNCEMENT_TIMING']],
  ['EVT_RET_FAM_001',['SEED_FINAL_FAMILY_CONVERSATION']],
  ['EVT_RET_BODY_001',['SEED_LAST_REHAB_DECISION']],
  ['EVT_RET_HIGH_001',['SEED_RETIRE_ON_HIGH_CHOICE']],
  ['EVT_RET_LOW_001',['SEED_RETIRE_AFTER_LOW','SEED_DISCARDED_REBIRTH_FINAL']],
  ['EVT_RET_ANNOUNCE_001',['SEED_RETIREMENT_ANNOUNCEMENT_PATH']],
  ['EVT_RET_LASTMATCH_001',['SEED_LAST_MATCH_SHAPE','SEED_FAREWELL_CONTROL_FINAL']]
]);

const event = id => {
  const found = EVENTS.find(row => row.id === id);
  assert.ok(found, `missing terminal event ${id}`);
  return found;
};

test('T5.36 terminal seed catalog exposes exactly the nine Agent-9 canonical producers', () => {
  const rows = CANONICAL_34_PLUS_SEED_PRODUCERS.filter(row => row.owner === 'agent9');
  assert.equal(rows.length, 9);
  const catalog = new Map();
  for (const row of rows) {
    if (!catalog.has(row.producerEventId)) catalog.set(row.producerEventId, []);
    catalog.get(row.producerEventId).push(row.seedId);
  }
  for (const [eventId, seedIds] of expected) {
    assert.deepEqual([...catalog.get(eventId)].sort(), [...seedIds].sort(), eventId);
  }
  assert.equal(EVENTS.some(row => row.id === 'EVT_RET_HOME_001'), false, 'legacy family ID must not own canonical seed provenance');
  assert.equal(EVENTS.some(row => row.id === 'EVT_RET_LAST_001'), false, 'legacy last-match ID must not own canonical seed provenance');
});

test('T5.36 terminal seed writers are exact create-only producers with no invented payload/expiry', () => {
  for (const [eventId, seedIds] of expected) {
    const definition = event(eventId);
    assert.deepEqual([...(definition.seedsWrite ?? [])].sort(), [...seedIds].sort(), `${eventId} seedsWrite`);
    const transitions = definition.outcomes.flatMap(outcome => outcome.seedTransitions ?? [])
      .filter(row => seedIds.includes(row.seedId));
    for (const seedId of seedIds) {
      assert.ok(transitions.some(row => row.seedId === seedId), `${eventId} missing ${seedId}`);
    }
    for (const row of transitions) {
      assert.equal(row.action, 'create');
      assert.equal(row.intensity, undefined);
      assert.equal(row.payload, undefined);
      assert.equal(row.expiresAfter, undefined);
    }
  }
});

test('T5.36 terminal seed provenance uses exact canonical event IDs and does not duplicate live instances', () => {
  const cases = [
    ['EVT_37_ANNOUNCE_001','A',['SEED_FAREWELL_ANNOUNCEMENT_TIMING'],'playing'],
    ['EVT_RET_FAM_001','LAST_SEASON',['SEED_FINAL_FAMILY_CONVERSATION'],'playing'],
    ['EVT_RET_BODY_001','REHAB_RETURN',['SEED_LAST_REHAB_DECISION'],'playing'],
    ['EVT_RET_HIGH_001','RETIRE',['SEED_RETIRE_ON_HIGH_CHOICE'],'playing'],
    ['EVT_RET_LOW_001','RETIRE',['SEED_RETIRE_AFTER_LOW'],'playing'],
    ['EVT_RET_LOW_001','OTHER_CLUB',['SEED_DISCARDED_REBIRTH_FINAL'],'playing'],
    ['EVT_RET_ANNOUNCE_001','DIRECT_VIDEO',['SEED_RETIREMENT_ANNOUNCEMENT_PATH'],'decided'],
    ['EVT_RET_LASTMATCH_001','REQUEST_PLAY',['SEED_LAST_MATCH_SHAPE','SEED_FAREWELL_CONTROL_FINAL'],'announced']
  ];

  for (const [eventId, choiceId, seedIds, status] of cases) {
    const state = createInitialState(536500 + cases.indexOf(cases.find(row => row[0]===eventId && row[1]===choiceId)));
    state.age = 38;
    state.phase = '34_plus';
    state.retirement.status = status;
    if (status === 'decided') {
      state.retirement.decidedDate = state.date;
      state.retirement.decisionAge = state.age;
      state.retirement.reason = 'voluntary';
    }
    if (status === 'announced') {
      state.retirement.decidedDate = state.date;
      state.retirement.announcedDate = state.date;
      state.retirement.decisionAge = state.age;
      state.retirement.reason = 'voluntary';
    }

    resolveChoiceInPlace(state, event(eventId), choiceId);
    for (const seedId of seedIds) {
      const instances = state.seeds.filter(seed => seed.id === seedId && !['resolved','expired'].includes(seed.state));
      assert.equal(instances.length, 1, `${eventId}/${choiceId} duplicated ${seedId}`);
      assert.equal(instances[0].originEvent, eventId);
      assert.equal(instances[0].originSeason, state.season);
    }

    if (eventId === 'EVT_RET_LASTMATCH_001') {
      resolveChoiceInPlace(state, event(eventId), choiceId);
      for (const seedId of seedIds) {
        assert.equal(state.seeds.filter(seed => seed.id === seedId && !['resolved','expired'].includes(seed.state)).length, 1);
      }
    }
  }
});
