import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialState } from '../dist/content/initial-state.js';
import { eventGatesPass } from '../dist/narrative/event-gates.js';
import { T542_STAGED_CONDITIONAL_EVENTS } from '../dist/content/events/23_26/t542-staged-conditional-events.js';

const ids=['CEVT_24_FAM_02','CEVT_25_STAR_01','CEVT_25_AGENT_04','CEVT_25_BODY_02','CEVT_25_SHOCK_02'];
const byId=id=>{const e=T542_STAGED_CONDITIONAL_EVENTS.find(x=>x.id===id);assert.ok(e,id);return e;};

test('batch42 closes the remaining five 23-26 conditional identities',()=>{
  assert.deepEqual(T542_STAGED_CONDITIONAL_EVENTS.map(e=>e.id),ids);
  for(const e of T542_STAGED_CONDITIONAL_EVENTS){
    assert.equal(e.canonStatus,'verified',e.id);
    assert.equal(e.choices.length,4,e.id);
    assert.ok(e.tags?.includes('a6_ready_external_blocker'),e.id);
  }
});

test('BODY25 consumes load-management payload.plan rather than HAS_SEED alone',()=>{
  const e=byId('CEVT_25_BODY_02');
  assert.ok(e.gates.some(g=>g.path==='flags.HAS_SEED_LOAD_MANAGEMENT'&&g.value===true));
  assert.ok(e.gates.some(g=>g.path==='facts.medicalRecurrenceAfterLoadPlan'&&g.value===true));
  assert.ok(e.tags?.includes('consumes_a2_pr217_load_management_payload_plan_fact'));
  assert.deepEqual(e.gateAlternatives?.map(group=>group[0]?.value),['weekly_prevention','full_load_until_pain','post_full_match','external_review_first']);
  const modifierConditions=e.outcomes.flatMap(o=>o.modifiers??[]).flatMap(m=>m.conditions);
  assert.ok(modifierConditions.every(c=>c.path==='facts.loadManagementPlan'));
});

test('family loss and third-party injury cannot be inferred from protagonist proxies',()=>{
  const fam=byId('CEVT_24_FAM_02'),star=byId('CEVT_25_STAR_01');
  assert.ok(fam.gates.some(g=>g.path==='facts.familyBusinessAdverseResult'));
  assert.ok(star.gates.some(g=>g.path==='facts.currentClubStarInjury'));
  const s=createInitialState(54201);s.age=25;s.phase='23_26';s.sport.roleScore=0;s.flags.HAS_SEED_FAMILY_BUSINESS=true;s.flags.HAS_SEED_STAR_COMPETITION=true;
  assert.equal(eventGatesPass(s,fam),false);
  assert.equal(eventGatesPass(s,star),false);
});

test('agent and coach callbacks require real external chronology',()=>{
  const agent=byId('CEVT_25_AGENT_04'),shock=byId('CEVT_25_SHOCK_02');
  assert.ok(agent.gates.some(g=>g.path==='facts.superAgentConcreteClubInterest'));
  assert.ok(shock.gates.some(g=>g.path==='facts.currentClubCoachDismissedByInstitutionalCrisis'));
  assert.ok(shock.gates.some(g=>g.path==='facts.majorFinalUpcoming'));
});
