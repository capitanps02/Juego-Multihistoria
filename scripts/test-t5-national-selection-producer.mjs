import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../dist/content/initial-state.js';
import {
  getNationalSelectionAuthorityStore,
  resolveNationalSelectionFacts
} from '../dist/simulation/national-team-authority.js';
import {
  NATIONAL_FINAL_PUBLICATION_DELAY_DAYS,
  publishNationalSelectionFactsInPlace
} from '../dist/simulation/national-selection-producer.js';
import { loadSave, serializeSave } from '../dist/save/save.js';
import { advanceWorldDayInPlace as advanceCoreWorldDayInPlace } from '../dist/simulation/world-simulator-core.js';
import { advanceWorldDayInPlace } from '../dist/simulation/world-simulator.js';

function addDays(iso,days){
  const d=new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate()+days);
  return d.toISOString().slice(0,10);
}

function cycleState(seed=17400){
  const s=createInitialState(seed);
  s.age=32;
  s.phase='30_34';
  s.flags.NATIONAL_RETIRED=false;
  s.flags.NATIONAL_TOURNAMENT_CYCLE=true;
  s.flags.NATIONAL_GATE_OPEN=true;
  return s;
}

test('national producer/1 cycle opening publishes one selected preliminary fact',()=>{
  const s=cycleState(17401);
  const rng=structuredClone(s.rngState);
  publishNationalSelectionFactsInPlace(s,false);
  const facts=resolveNationalSelectionFacts(s);
  assert.equal(facts.preselected30,true);
  assert.equal(facts.preliminaryMembership,'selected');
  assert.equal(facts.finalMembership,null);
  assert.match(facts.cycleId,/^NT_MAJOR_32:/);
  assert.equal(facts.tournamentId,'NT_MAJOR_32');
  assert.deepEqual(s.rngState,rng);
});

test('national producer/2 aggregate proxies without publication boundary never create membership',()=>{
  const s=createInitialState(17402);
  s.age=32;
  s.phase='30_34';
  s.professional.nationalStanding=100;
  s.professional.nationalCaps=80;
  s.professional.nationalRole='regular';
  s.reputation.prestige=100;
  s.flags.NATIONAL_CALLED=true;
  s.flags.NATIONAL_GATE_OPEN=true;
  s.flags.NATIONAL_TOURNAMENT_CYCLE=false;
  publishNationalSelectionFactsInPlace(s,false);
  assert.equal(s.world.nationalSelectionAuthority,undefined);
  assert.equal(resolveNationalSelectionFacts(s).preselected30,false);
});

test('national producer/3 already-open legacy cycle is not backfilled',()=>{
  const s=cycleState(17403);
  publishNationalSelectionFactsInPlace(s,true);
  assert.equal(s.world.nationalSelectionAuthority,undefined);
});

test('national producer/4 preliminary publication is immutable across later gate changes',()=>{
  const s=cycleState(17404);
  publishNationalSelectionFactsInPlace(s,false);
  const first=structuredClone(s.world.nationalSelectionAuthority);
  s.flags.NATIONAL_GATE_OPEN=false;
  publishNationalSelectionFactsInPlace(s,true);
  assert.deepEqual(s.world.nationalSelectionAuthority,first);
  assert.equal(resolveNationalSelectionFacts(s).preliminaryMembership,'selected');
});

test('national producer/5 final 26 publishes separately after exact delay',()=>{
  const s=cycleState(17405);
  publishNationalSelectionFactsInPlace(s,false);
  const pre=resolveNationalSelectionFacts(s);
  s.runtime.day += NATIONAL_FINAL_PUBLICATION_DELAY_DAYS-1;
  s.date=addDays(s.date,NATIONAL_FINAL_PUBLICATION_DELAY_DAYS-1);
  publishNationalSelectionFactsInPlace(s,true);
  assert.equal(resolveNationalSelectionFacts(s).finalMembership,null);

  s.runtime.day += 1;
  s.date=addDays(s.date,1);
  publishNationalSelectionFactsInPlace(s,true);
  const facts=resolveNationalSelectionFacts(s);
  assert.equal(facts.preliminaryPublicationDate,pre.preliminaryPublicationDate);
  assert.equal(facts.finalMembership,'selected');
  assert.equal(facts.selectedFinal26,true);
  assert.equal(facts.finalRole,null);
});

test('national producer/6 selected preliminary can be omitted from final if producer gate closes',()=>{
  const s=cycleState(17406);
  publishNationalSelectionFactsInPlace(s,false);
  s.runtime.day += NATIONAL_FINAL_PUBLICATION_DELAY_DAYS;
  s.date=addDays(s.date,NATIONAL_FINAL_PUBLICATION_DELAY_DAYS);
  s.flags.NATIONAL_GATE_OPEN=false;
  publishNationalSelectionFactsInPlace(s,true);
  assert.equal(resolveNationalSelectionFacts(s).finalMembership,'omitted');
  assert.equal(resolveNationalSelectionFacts(s).selectedFinal26,false);
});

test('national producer/7 international retirement after preselection publishes withdrawal',()=>{
  const s=cycleState(17407);
  publishNationalSelectionFactsInPlace(s,false);
  s.runtime.day += NATIONAL_FINAL_PUBLICATION_DELAY_DAYS;
  s.date=addDays(s.date,NATIONAL_FINAL_PUBLICATION_DELAY_DAYS);
  s.flags.NATIONAL_RETIRED=true;
  s.flags.NATIONAL_GATE_OPEN=false;
  publishNationalSelectionFactsInPlace(s,true);
  assert.equal(resolveNationalSelectionFacts(s).finalMembership,'withdrawn');
});

test('national producer/8 omitted preliminary never fabricates a final list',()=>{
  const s=cycleState(17408);
  s.flags.NATIONAL_GATE_OPEN=false;
  publishNationalSelectionFactsInPlace(s,false);
  assert.equal(resolveNationalSelectionFacts(s).preliminaryMembership,'omitted');
  s.runtime.day += 40;
  s.date=addDays(s.date,40);
  s.flags.NATIONAL_GATE_OPEN=true;
  publishNationalSelectionFactsInPlace(s,true);
  assert.equal(resolveNationalSelectionFacts(s).finalMembership,null);
});

test('national producer/9 produced facts survive save/load with exact provenance',()=>{
  const s=cycleState(17409);
  publishNationalSelectionFactsInPlace(s,false);
  const store=getNationalSelectionAuthorityStore(s);
  assert.equal(store.cycles[0].preliminary.source.kind,'simulation_publication');
  assert.equal(store.cycles[0].preliminary.source.producerId,'world_national_selection_v1');
  const restored=loadSave(serializeSave(s));
  assert.deepEqual(restored.world.nationalSelectionAuthority,s.world.nationalSelectionAuthority);
  assert.deepEqual(resolveNationalSelectionFacts(restored),resolveNationalSelectionFacts(s));
});


test('national producer/10 wrapper observes real core cycle opening without extra RNG',()=>{
  const base=createInitialState(17410);
  base.age=32;
  base.phase='30_34';
  base.date='2026-02-10';
  base.season='2025-26';
  base.professional.initializedAt20=true;
  base.professional.initializedAt23=true;
  base.professional.initializedAt26=true;
  base.professional.initializedAt30=true;
  base.professional.nationalStanding=80;
  base.professional.nationalHeat=90;
  base.professional.leagueTier=1;
  base.sport.roleScore=80;
  base.sport.form=65;
  base.flags.NATIONAL_RETIRED=false;
  base.flags.NATIONAL_TOURNAMENT_CYCLE=false;
  base.flags.NATIONAL_GATE_OPEN=false;

  const coreOnly=structuredClone(base);
  const wrapped=structuredClone(base);
  let opened=false;

  for(let day=0; day<70; day+=1){
    const beforeCycle=coreOnly.flags.NATIONAL_TOURNAMENT_CYCLE===true;
    advanceCoreWorldDayInPlace(coreOnly);
    advanceWorldDayInPlace(wrapped);

    assert.equal(wrapped.date,coreOnly.date);
    assert.equal(wrapped.flags.NATIONAL_TOURNAMENT_CYCLE,coreOnly.flags.NATIONAL_TOURNAMENT_CYCLE);
    assert.equal(wrapped.flags.NATIONAL_GATE_OPEN,coreOnly.flags.NATIONAL_GATE_OPEN);
    assert.deepEqual(wrapped.rngState,coreOnly.rngState,'producer wrapper must not consume additional RNG');

    if(!beforeCycle && coreOnly.flags.NATIONAL_TOURNAMENT_CYCLE===true){
      opened=true;
      assert.equal(coreOnly.world.nationalSelectionAuthority,undefined,'core alone does not materialize shared authority');
      const facts=resolveNationalSelectionFacts(wrapped);
      assert.notEqual(facts.cycleId,null);
      assert.equal(facts.preselected30,wrapped.flags.NATIONAL_GATE_OPEN===true);
      break;
    }
  }

  assert.equal(opened,true,'direct core must eventually open the factual age-32 tournament cycle');
});
