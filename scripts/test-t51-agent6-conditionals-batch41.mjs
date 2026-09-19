import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialState } from '../dist/content/initial-state.js';
import { eventGatesPass } from '../dist/narrative/event-gates.js';
import { T541_STAGED_CONDITIONAL_EVENTS } from '../dist/content/events/23_26/t541-staged-conditional-events.js';

const ids=['CEVT_23_AGENT_03','CEVT_24_CHAT_01','CEVT_24_TOURN_02','CEVT_24_OWNER_02','CEVT_24_SPONSOR_02'];
const byId=id=>{const e=T541_STAGED_CONDITIONAL_EVENTS.find(x=>x.id===id);assert.ok(e,id);return e;};

test('batch41 has five scene-specific canonical conditional identities',()=>{
  assert.deepEqual(T541_STAGED_CONDITIONAL_EVENTS.map(e=>e.id),ids);
  for(const e of T541_STAGED_CONDITIONAL_EVENTS){
    assert.equal(e.canonStatus,'verified',e.id);
    assert.equal(e.choices.length,4,e.id);
    assert.ok(e.tags?.includes('a6_ready_external_blocker'),e.id);
    assert.notEqual(e.text.body,'Una causa previa de la carrera reaparece bajo un contexto adulto distinto. El callback solo existe porque el guardado conserva esa memoria.');
  }
});

test('CHAT24 consumes the exact prior A/B/C/D choice instead of seed presence only',()=>{
  const e=byId('CEVT_24_CHAT_01');
  assert.ok(e.seedsRead?.includes('SEED_PRIVATE_CHAT'));
  assert.deepEqual(e.gateAlternatives?.map(group=>group[0]?.value),['A','B','C','D']);
  const modifierConditions=e.outcomes.flatMap(o=>o.modifiers??[]).flatMap(m=>m.conditions);
  assert.ok(modifierConditions.some(c=>c.path==='facts.privateChatChoice'&&c.value==='A'));
  assert.ok(modifierConditions.some(c=>c.path==='facts.privateChatChoice'&&c.value==='B'));
  assert.ok(modifierConditions.some(c=>c.path==='facts.privateChatChoice'&&c.value==='C'));
  assert.ok(modifierConditions.some(c=>c.path==='facts.privateChatChoice'&&c.value==='D'));
});

test('TOURN02 explicitly requires omission and never NATIONAL_CALLED=true',()=>{
  const e=byId('CEVT_24_TOURN_02');
  assert.ok(e.gates.some(g=>g.path==='facts.currentTournamentFinalSquadOmission'&&g.value===true));
  assert.equal(e.gates.some(g=>g.path==='flags.NATIONAL_CALLED'&&g.value===true),false);
});

test('owner/sponsor/agent scenes fail closed without external facts',()=>{
  for(const id of ['CEVT_23_AGENT_03','CEVT_24_OWNER_02','CEVT_24_SPONSOR_02']){
    const e=byId(id),s=createInitialState(54101);s.age=id.startsWith('CEVT_23')?23:24;s.phase='23_26';
    s.professional.commercialPower=100;s.flags.HAS_SEED_FIRST_AGENT=true;s.flags.HAS_SEED_SPONSOR_IMAGE=true;s.flags.CLUB_OWNER_CHANGE=true;
    assert.equal(eventGatesPass(s,e),false,id);
  }
});
