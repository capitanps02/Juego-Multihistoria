import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../dist/content/initial-state.js';
import { careerSportMilestones, getSportMatchModelStore, recordOfficialMatchInPlace } from '../dist/simulation/match-model.js';
import { getSportContext } from '../dist/simulation/sport-context.js';
import { ensureEmploymentStateInPlace, transitionNaturalExpiryInPlace } from '../dist/simulation/employment.js';

function matchState(seed=9910){
  const s=createInitialState(seed);
  s.date='2026-08-05';
  s.season='2026-27';
  s.runtime.day=35;
  s.runtime.seasonDay=35;
  return s;
}

function addDays(iso,days){
  const d=new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate()+days);
  return d.toISOString().slice(0,10);
}

test('career milestones/1 aggregate counter cannot backfill missing persisted appearances',()=>{
  const s=matchState(9911);
  recordOfficialMatchInPlace(s,{appeared:true,debutOccurred:false,injuryUnavailable:false});
  s.sport.appearances=500;
  const facts=careerSportMilestones(s);
  assert.equal(facts.historyComplete,false);
  assert.equal(facts.appearances,null);
  assert.equal(facts.appearance500,null);
  assert.equal(facts.appearance700,null);
  assert.equal(facts.nextAppearanceOrdinal,null);
  assert.equal(getSportContext(s).careerMilestones,null);
  assert.equal(getSportContext(s).availability.careerMilestones,'unavailable');
});

test('career milestones/2 complete one-match ledger exposes exact totals and false threshold',()=>{
  const s=matchState(9912);
  const row=recordOfficialMatchInPlace(s,{appeared:true,debutOccurred:false,injuryUnavailable:false});
  assert.ok(row?.stats);
  s.sport.appearances=1;
  const facts=careerSportMilestones(s);
  assert.equal(facts.historyComplete,true);
  assert.equal(facts.appearances,1);
  assert.equal(facts.appearance500,false);
  assert.equal(facts.appearance700,false);
  assert.equal(facts.nextAppearanceOrdinal,2);
  assert.equal(facts.goals,row.stats.goals);
  assert.equal(facts.assists,row.stats.assists);
  assert.equal(facts.yellowCards,row.stats.yellowCards);
  assert.equal(facts.redCards,row.stats.redCards);
  assert.deepEqual(getSportContext(s).careerMilestones,facts);
  assert.equal(getSportContext(s).availability.careerMilestones,'known');
});

test('career milestones/3 500 factual persisted appearances cross the threshold without reputation/form proxies',()=>{
  const s=matchState(9913);
  const first=recordOfficialMatchInPlace(s,{appeared:true,debutOccurred:false,injuryUnavailable:false});
  assert.ok(first?.stats);
  const store=getSportMatchModelStore(s);
  assert.ok(store);
  const prototype=structuredClone(first);

  for(let i=1;i<500;i+=1){
    const date=addDays('2000-01-01',i);
    store.fixtures.push({
      ...structuredClone(prototype),
      id:`fixture:1999-00:${date}:UDV`,
      date,
      season:'1999-00',
      club:'UDV',
      player:{...prototype.player,appeared:true,calledUp:true,onBench:!prototype.player.started,minutes:prototype.player.minutes||1},
      stats:structuredClone(prototype.stats)
    });
  }
  // The reader consumes the in-memory factual ledger and aggregate count only;
  // save validation remains independently responsible for persisted row syntax.
  s.sport.appearances=500;
  const facts=careerSportMilestones(s);
  assert.equal(facts.historyComplete,true);
  assert.equal(facts.appearances,500);
  assert.equal(facts.appearance500,true);
});

test('career milestones/4 read is historical and remains available when unattached',()=>{
  const s=matchState(9914);
  recordOfficialMatchInPlace(s,{appeared:true,debutOccurred:false,injuryUnavailable:false});
  s.sport.appearances=1;
  const before=careerSportMilestones(s);
  ensureEmploymentStateInPlace(s);
  const previousMonths=Math.max(1,Number(s.contract.monthsRemaining));
  s.contract.monthsRemaining=0;
  assert.equal(transitionNaturalExpiryInPlace(s,previousMonths),true);
  const context=getSportContext(s);
  assert.deepEqual(context.careerMilestones,before);
  assert.equal(context.sportingClub,null);
  assert.equal(context.availability.careerMilestones,'known');
});

test('career milestones/5 read is 0-RNG and ignores form/reputation',()=>{
  const a=matchState(9915), b=matchState(9915);
  recordOfficialMatchInPlace(a,{appeared:true,debutOccurred:false,injuryUnavailable:false});
  recordOfficialMatchInPlace(b,{appeared:true,debutOccurred:false,injuryUnavailable:false});
  a.sport.appearances=b.sport.appearances=1;
  a.sport.form=1; a.reputation.prestige=1;
  b.sport.form=99; b.reputation.prestige=99;
  const rng=structuredClone(a.rngState);
  assert.deepEqual(careerSportMilestones(a),careerSportMilestones(b));
  assert.deepEqual(a.rngState,rng);
});


test('career milestones/6 complete 699 ledger exposes only a possible next appearance 700',()=>{
  const s=matchState(9916);
  const first=recordOfficialMatchInPlace(s,{appeared:true,debutOccurred:false,injuryUnavailable:false});
  assert.ok(first?.stats);
  const store=getSportMatchModelStore(s);
  assert.ok(store);
  const prototype=structuredClone(first);
  for(let i=1;i<699;i+=1){
    const date=addDays('1998-01-01',i);
    store.fixtures.push({
      ...structuredClone(prototype),
      id:`fixture:1997-98:${date}:UDV`,
      date,
      season:'1997-98',
      club:'UDV',
      player:{...prototype.player,appeared:true,calledUp:true,onBench:!prototype.player.started,minutes:prototype.player.minutes||1},
      stats:structuredClone(prototype.stats)
    });
  }
  s.sport.appearances=699;
  const facts=careerSportMilestones(s);
  assert.equal(facts.historyComplete,true);
  assert.equal(facts.appearances,699);
  assert.equal(facts.appearance700,false);
  assert.equal(facts.nextAppearanceOrdinal,700);
  // This is an ordinal fact only; the reader does not create a fixture or appearance.
  assert.equal(store.fixtures.length,699);
});
