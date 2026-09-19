import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialState } from '../dist/content/initial-state.js';
import { T535_STAGED_CONDITIONAL_EVENTS } from '../dist/content/events/26_30/t535-staged-conditional-events.js';
import { eventGatesPass } from '../dist/narrative/event-gates.js';
const byId=id=>{const e=T535_STAGED_CONDITIONAL_EVENTS.find(row=>row.id===id);assert.ok(e,id);return e;};
test('t535 adds five bespoke canonical callbacks',()=>{
 assert.deepEqual(T535_STAGED_CONDITIONAL_EVENTS.map(e=>e.id),['CEVT_28_MANAGER_03','CEVT_29_YOUTH_02','CEVT_29_NAT_02','CEVT_29_HOME_03','CEVT_29_BODY_04']);
 assert.deepEqual(byId('CEVT_29_YOUTH_02').choices.map(c=>c.label),['Abrazar la narrativa de mentoría','Reducir tu papel y devolverle el mérito','Recordar que ahora también compite contigo']);
});
test('t535 does not infer external world outcomes from seeds',()=>{
 for(const e of T535_STAGED_CONDITIONAL_EVENTS){const s=createInitialState(53501);s.age=e.ageWindow[0];s.phase='26_30';for(const g of e.gates??[])if(g.path.startsWith('flags.HAS_SEED_'))s.flags[g.path.slice(6)]=true;assert.equal(eventGatesPass(s,e),false,e.id);}
});
test('t535 external facts are never written as narrative effects',()=>{
 for(const e of T535_STAGED_CONDITIONAL_EVENTS){const paths=[...e.choices.flatMap(c=>c.immediateEffects??[]),...e.outcomes.flatMap(o=>o.effects??[])].map(x=>x.kind==='flag'?'flags.'+x.flag:x.path);assert.ok(paths.every(p=>!p.startsWith('facts.')),e.id);}
});
