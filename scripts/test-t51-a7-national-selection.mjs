import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../dist/content/initial-state.js';
import { eventGatesPass } from '../dist/narrative/event-gates.js';
import { resolveChoiceInPlace } from '../dist/narrative/resolver.js';
import {
  recordNationalPreselectionInPlace,
  resolveNationalSelectionFacts
} from '../dist/simulation/national-team-authority.js';
import { CANONICAL_REIMPLEMENTATIONS_32A } from '../dist/content/events/30_34/canonical-reimplementations-32a.js';

const event=CANONICAL_REIMPLEMENTATIONS_32A.find(e=>e.id==='EVT_32_NAT_001');
assert.ok(event);

function baseState(seed){
  const s=createInitialState(seed);
  s.age=32;
  s.phase='30_34';
  s.professional.nationalStanding=100;
  s.professional.nationalCaps=80;
  s.professional.nationalRole='regular';
  s.flags.NATIONAL_TOURNAMENT_CYCLE=true;
  s.flags.NATIONAL_GATE_OPEN=true;
  return s;
}

function writePreselection(s,membership){
  const row=recordNationalPreselectionInPlace(s,{
    cycleId:`NT_MAJOR_32:${s.season}`,
    tournamentId:'NT_MAJOR_32',
    membership,
    source:{kind:'simulation_publication',producerId:'test-a7-national'}
  });
  assert.ok(row);
}

test('A7 national/1 standing caps role and reputation cannot unlock without exact preselection',()=>{
  const s=baseState(3201);
  s.reputation.prestige=100;
  const before=structuredClone(s.rngState);
  assert.equal(eventGatesPass(s,event),false);
  assert.deepEqual(s.rngState,before);
});

test('A7 national/2 selected preliminary 30 unlocks exact consumer gate',()=>{
  const s=baseState(3202);
  writePreselection(s,'selected');
  assert.equal(resolveNationalSelectionFacts(s).preselected30,true);
  assert.equal(eventGatesPass(s,event),true);
});

test('A7 national/3 omitted preliminary list stays fail-closed even with maximal aggregates',()=>{
  const s=baseState(3203);
  writePreselection(s,'omitted');
  assert.equal(resolveNationalSelectionFacts(s).preselected30,false);
  assert.equal(eventGatesPass(s,event),false);
});

test('A7 national/4 retirement choice records retirement intent but does not fabricate final-26 publication',()=>{
  const s=baseState(3204);
  writePreselection(s,'selected');
  const result=resolveChoiceInPlace(s,event,'D',true);
  assert.equal(result.eventId,event.id);
  assert.equal(s.flags.NATIONAL_RETIRED,true);
  assert.equal(s.flags.AGE32_NT_RETIRE_BEFORE_LIST,true);
  assert.equal(resolveNationalSelectionFacts(s).finalMembership,null);
});

test('A7 national/5 gate evaluation is read-only and consumes zero RNG',()=>{
  const s=baseState(3205);
  writePreselection(s,'selected');
  const before=structuredClone(s);
  assert.equal(eventGatesPass(s,event),true);
  assert.deepEqual(s,before);
});
