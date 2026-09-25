import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../dist/content/initial-state.js';
import { recordOfficialMatchInPlace, currentCareerMatchResult, latestCareerMatchResult } from '../dist/simulation/match-model.js';
import { buildDecisionConsequences, DEFERRED_CONSEQUENCE_MESSAGE } from '../dist/narrative/consequences.js';

function matchState(){const s=createInitialState(7777);s.date='2026-08-05';s.runtime.day=35;s.runtime.seasonDay=35;return s;}
test('último encuentro persiste sin convertirlo en un encuentro del día',()=>{
 const s=matchState();const fixture=recordOfficialMatchInPlace(s,{appeared:true,debutOccurred:true,injuryUnavailable:false});
 const before=latestCareerMatchResult(s);assert.equal(before.matchId,fixture.id);assert.deepEqual(before.result,fixture.result);
 s.date='2026-08-06';s.runtime.day++;s.runtime.seasonDay++;
 const snapshot=JSON.stringify(s);assert.equal(currentCareerMatchResult(s),null);assert.deepEqual(latestCareerMatchResult(s),before);assert.equal(JSON.stringify(s),snapshot);
 assert.deepEqual(latestCareerMatchResult(JSON.parse(snapshot)),before);
 latestCareerMatchResult(s).result.homeGoals=99;assert.notEqual(fixture.result.homeGoals,99);
});
test('un partido sin participación sustituye al anterior y conserva cero minutos',()=>{
 const s=matchState();recordOfficialMatchInPlace(s,{appeared:true,debutOccurred:true,injuryUnavailable:false});
 s.date='2026-08-12';s.runtime.day+=7;s.runtime.seasonDay+=7;
 const fixture=recordOfficialMatchInPlace(s,{appeared:false,debutOccurred:false,injuryUnavailable:true});
 const latest=latestCareerMatchResult(s);assert.equal(latest.matchId,fixture.id);assert.equal(latest.available,false);assert.equal(latest.minutes,0);
 s.date='2026-08-06';assert.equal(latestCareerMatchResult(s).date,'2026-08-05');
});
test('sin registro no se inventa un partido',()=>assert.equal(latestCareerMatchResult(createInitialState()),null));
test('consecuencias mixtas muestran delta real y aviso diferido sin revelar ids',()=>{
 const before=createInitialState(),after=structuredClone(before);after.professional.recoveryDebt+=4;after.professional.motivationReserve-=3;after.professional.legacyCapital+=2;
 const effects=['recoveryDebt','motivationReserve','legacyCapital'].map(path=>({kind:'numeric',path:'professional.'+path,delta:99}));
 const event={id:'test',choices:[{id:'A',followUps:['internal_future'],immediateEffects:[]}],outcomes:[{id:'OUT',effects}]};
 const result=buildDecisionConsequences(before,after,event,'A','OUT',['El vestuario recuerda tu respuesta.']);
 assert.deepEqual(result.visibleEffects.map(x=>x.delta),[4,-3,2]);assert.deepEqual(result.visibleEffects.map(x=>x.favorable),[false,false,true]);
 assert.deepEqual(result.hiddenEffects,[DEFERRED_CONSEQUENCE_MESSAGE]);assert.ok(!JSON.stringify(result).includes('internal_future'));
});
test('efecto limitado a cero no se presenta como mejora',()=>{
 const before=createInitialState();before.professional.motivationReserve=100;const after=structuredClone(before);
 const event={id:'test',choices:[{id:'A'}],outcomes:[{id:'OUT',effects:[{kind:'numeric',path:'professional.motivationReserve',delta:5}]}]};
 assert.deepEqual(buildDecisionConsequences(before,after,event,'A','OUT',[]).visibleEffects,[]);
});
