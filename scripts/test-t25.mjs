import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createInitialState } from '../dist/content/initial-state.js';
import { advanceWorldDayInPlace } from '../dist/simulation/world-simulator.js';
import { respondToOffer } from '../dist/simulation/offers.js';
import { assertAgeMilestones } from '../dist/simulation/age-milestones.js';

function mature(seed) { const s=createInitialState(seed); while(s.age<35){if(s.market?.pending)respondToOffer(s,s.market.pending.id,'accept');advanceWorldDayInPlace(s);} return s; }
test('crossing each age records one immutable historical snapshot',()=>{
  const s=mature(424242); assert.deepEqual(s.ageMilestones.map(x=>x.age),[20,23,26,30,34]); assertAgeMilestones(s);
  const saved=structuredClone(s.ageMilestones); for(let i=0;i<400;i++){if(s.market?.pending)respondToOffer(s,s.market.pending.id,'accept');advanceWorldDayInPlace(s);} assert.deepEqual(s.ageMilestones,saved);
  for(const m of saved){assert.equal(m.date,`${2026+m.age-18}-07-01`);assert.ok(m.tags.length);assert.ok(m.signature);}
});
test('milestones survive JSON save and reject tampering',()=>{
  const s=mature(7),copy=JSON.parse(JSON.stringify(s)); assert.deepEqual(copy.ageMilestones,s.ageMilestones); copy.ageMilestones[2].age=23; assert.throws(()=>assertAgeMilestones(copy),/orden|repetida/); const missing=JSON.parse(JSON.stringify(s)); missing.ageMilestones.pop(); assert.throws(()=>assertAgeMilestones(missing),/Falta/);
});
test('gate exits non-zero when a required milestone is missing',()=>{
  const result=spawnSync(process.execPath,['scripts/t25-gate.mjs','--negative'],{encoding:'utf8'}); assert.equal(result.status,2); assert.match(result.stdout,/"passed": false/);
});
