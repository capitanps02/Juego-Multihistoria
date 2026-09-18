import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../dist/content/initial-state.js';
import { narrativeCausalFacts } from '../dist/simulation/club-contract-intent.js';
import {
  inspectNationalSelectionAuthorityStore,
  recordNationalFinalSquadInPlace,
  recordNationalPreselectionInPlace,
  resolveNationalSelectionFacts
} from '../dist/simulation/national-team-authority.js';
import { loadSave, serializeSave } from '../dist/save/save.js';

const SIM_SOURCE = { kind: 'simulation_publication', producerId: 'test-publication-boundary' };
const EVENT_SOURCE = { kind: 'canonical_event', eventId: 'EVT_32_NAT_001', choiceId: 'ACCEPT_ROLE', outcomeId: 'ACCEPT_ROLE__PRIMARY' };

function addDays(iso, days) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function state32(seed = 17400) {
  const state = createInitialState(seed);
  state.age = 32;
  state.phase = '30_34';
  state.flags.NATIONAL_TOURNAMENT_CYCLE = true;
  state.flags.NATIONAL_GATE_OPEN = true;
  state.flags.NATIONAL_CALLED = true;
  return state;
}

function preselect(state, membership = 'selected') {
  return recordNationalPreselectionInPlace(state, {
    cycleId: 'NT_MAJOR_32',
    tournamentId: 'MAJOR_32',
    membership,
    source: SIM_SOURCE
  });
}

test('national selection/1 aggregate proxies and cycle window never fabricate concrete membership', () => {
  const state = state32(17401);
  state.professional.nationalStanding = 100;
  state.professional.nationalCaps = 100;
  state.professional.nationalRole = 'regular';
  state.reputation.prestige = 100;
  const before = structuredClone(state);
  const facts = resolveNationalSelectionFacts(state);
  assert.equal(facts.preselected30, false);
  assert.equal(facts.selectedFinal26, false);
  assert.equal(facts.cycleId, null);
  assert.deepEqual(state, before);
});

test('national selection/2 preselection is factual, immutable, idempotent and 0-RNG', () => {
  const state = state32(17402);
  const rng = structuredClone(state.rngState);
  const first = preselect(state, 'selected');
  assert.ok(first);
  assert.equal(first.squadSize, 30);
  assert.equal(first.membership, 'selected');
  assert.deepEqual(recordNationalPreselectionInPlace(state, {
    cycleId: 'NT_MAJOR_32',
    tournamentId: 'MAJOR_32',
    membership: 'selected',
    source: EVENT_SOURCE
  }), first, 'same factual membership replays existing publication instead of rewriting provenance');
  assert.equal(recordNationalPreselectionInPlace(state, {
    cycleId: 'NT_MAJOR_32',
    tournamentId: 'MAJOR_32',
    membership: 'omitted',
    source: SIM_SOURCE
  }), null, 'published membership cannot be rewritten');
  assert.equal(resolveNationalSelectionFacts(state).preselected30, true);
  assert.equal(resolveNationalSelectionFacts(state).selectedFinal26, false);
  assert.deepEqual(state.rngState, rng);
});

test('national selection/3 final 26 is separately persisted and never implied by preselection', () => {
  const state = state32(17403);
  preselect(state);
  assert.equal(resolveNationalSelectionFacts(state).finalMembership, null);
  state.runtime.day += 7;
  state.date = addDays(state.date, 7);
  const final = recordNationalFinalSquadInPlace(state, {
    cycleId: 'NT_MAJOR_32',
    membership: 'selected',
    role: 'rotation',
    source: EVENT_SOURCE
  });
  assert.ok(final);
  assert.equal(final.squadSize, 26);
  assert.equal(final.membership, 'selected');
  assert.equal(resolveNationalSelectionFacts(state).selectedFinal26, true);
  assert.equal(resolveNationalSelectionFacts(state).finalRole, 'rotation');
});

test('national selection/4 omission and withdrawal stay distinct from selected final squad', () => {
  const omitted = state32(17404);
  preselect(omitted);
  const out = recordNationalFinalSquadInPlace(omitted, {
    cycleId: 'NT_MAJOR_32',
    membership: 'omitted',
    source: EVENT_SOURCE
  });
  assert.equal(out?.membership, 'omitted');
  assert.equal(resolveNationalSelectionFacts(omitted).selectedFinal26, false);

  const retired = state32(17405);
  preselect(retired);
  retired.flags.NATIONAL_RETIRED = true;
  assert.equal(recordNationalFinalSquadInPlace(retired, {
    cycleId: 'NT_MAJOR_32',
    membership: 'selected',
    role: 'veteran_role',
    source: EVENT_SOURCE
  }), null, 'international retirement blocks future selected status');
  const withdrawal = recordNationalFinalSquadInPlace(retired, {
    cycleId: 'NT_MAJOR_32',
    membership: 'withdrawn',
    source: EVENT_SOURCE
  });
  assert.equal(withdrawal?.membership, 'withdrawn');
  assert.equal(resolveNationalSelectionFacts(retired).finalMembership, 'withdrawn');
});

test('national selection/5 omitted preliminary list cannot acquire a final-squad fact', () => {
  const state = state32(17406);
  preselect(state, 'omitted');
  assert.equal(recordNationalFinalSquadInPlace(state, {
    cycleId: 'NT_MAJOR_32',
    membership: 'selected',
    role: 'starter_candidate',
    source: EVENT_SOURCE
  }), null);
  assert.equal(resolveNationalSelectionFacts(state).preselected30, false);
});

test('national selection/6 exact facts survive save/load and are exposed through facts.nationalSelection', () => {
  const state = state32(17407);
  preselect(state);
  const beforeRng = structuredClone(state.rngState);
  const projected = narrativeCausalFacts(state).nationalSelection;
  assert.equal(projected.preselected30, true);
  assert.deepEqual(state.rngState, beforeRng);
  const restored = loadSave(serializeSave(state));
  assert.deepEqual(resolveNationalSelectionFacts(restored), resolveNationalSelectionFacts(state));
  assert.deepEqual(restored.world.nationalSelectionAuthority, state.world.nationalSelectionAuthority);
});

test('national selection/7 malformed or contradictory persisted records fail closed at save boundary', () => {
  const state = state32(17408);
  state.world.nationalSelectionAuthority = {
    version: 1,
    cycles: [{
      cycleId: 'BROKEN',
      tournamentId: 'MAJOR_32',
      season: state.season,
      openedDate: state.date,
      preliminary: null,
      final: {
        date: state.date,
        runtimeDay: state.runtime.day,
        squadSize: 26,
        membership: 'selected',
        role: 'rotation',
        source: SIM_SOURCE
      }
    }]
  };
  assert.ok(inspectNationalSelectionAuthorityStore(state.world.nationalSelectionAuthority, state.date));
  assert.throws(() => serializeSave(state));
});

test('national selection/8 legacy saves with no selection store remain unknown, not backfilled', () => {
  const state = state32(17409);
  delete state.world.nationalSelectionAuthority;
  const restored = loadSave(serializeSave(state));
  assert.equal(restored.world.nationalSelectionAuthority, undefined);
  assert.deepEqual(resolveNationalSelectionFacts(restored), {
    cycleId: null,
    tournamentId: null,
    preliminaryMembership: null,
    preliminaryPublicationDate: null,
    preselected30: false,
    finalMembership: null,
    finalPublicationDate: null,
    selectedFinal26: false,
    finalRole: null
  });
});
