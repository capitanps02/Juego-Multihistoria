import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialState } from '../dist/content/initial-state.js';
import { STAGED_MEMORY_CONDITIONALS,isMemoryConditionalEligible } from '../dist/content/events/34_plus/staged-conditional-memory.js';

const seed=(id,originEvent)=>({id,state:'dormant',intensity:60,originEvent,originSeason:'2030-2031',npcRefs:[],payload:{},lastTouchedDate:'2040-01-01'});
const stateAt=age=>{const s=createInitialState(16000+age);s.age=age;s.phase='34_plus';s.retirement.status='playing';return s;};

test('three causal-memory conditionals are exact and scene-specific',()=>{assert.deepEqual(STAGED_MEMORY_CONDITIONALS.map(e=>e.id),['CEVT_34_FAMILY_CLUB_BUYIN','CEVT_34_CLARA_EXCLUSIVE','CEVT_35_PUBLIC_FEUD_RETURNS']);for(const e of STAGED_MEMORY_CONDITIONALS){assert.equal(e.canonStatus,'verified');assert.equal(e.choices.length,4);assert.ok(e.tags.includes('memory_causal'));}});
test('family buy-in needs real ownership or family-business memory',()=>{const s=stateAt(34);assert.equal(isMemoryConditionalEligible(s,'CEVT_34_FAMILY_CLUB_BUYIN'),false);s.seeds.push(seed('SEED_HOME_OWNERSHIP','EVT_28_HOME_001'));assert.equal(isMemoryConditionalEligible(s,'CEVT_34_FAMILY_CLUB_BUYIN'),true);});
test('Clara exclusive needs historical channel plus near-retirement posture but never announcement',()=>{const s=stateAt(34);s.professional.retirementDistance=60;assert.equal(isMemoryConditionalEligible(s,'CEVT_34_CLARA_EXCLUSIVE'),false);s.seeds.push(seed('SEED_CLARA_CHANNEL','EVT_18_PRS_001'));assert.equal(isMemoryConditionalEligible(s,'CEVT_34_CLARA_EXCLUSIVE'),true);assert.equal(s.retirement.status,'playing');});
test('public feud return needs the exact rivalry memory',()=>{const s=stateAt(35);assert.equal(isMemoryConditionalEligible(s,'CEVT_35_PUBLIC_FEUD_RETURNS'),false);s.seeds.push(seed('SEED_PUBLIC_RIVALRY','EVT_27_RIV_001'));assert.equal(isMemoryConditionalEligible(s,'CEVT_35_PUBLIC_FEUD_RETURNS'),true);});
test('memory conditionals never mutate terminal retirement status',()=>{for(const e of STAGED_MEMORY_CONDITIONALS)for(const o of e.outcomes)assert.equal(o.effects.some(x=>'path' in x&&x.path==='retirement.status'),false);});
