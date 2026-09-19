import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialState } from '../dist/content/initial-state.js';
import { T540_STAGED_PRINCIPAL_EVENTS } from '../dist/content/events/26_30/t540-staged-principal-events.js';
import { eventGatesPass } from '../dist/narrative/event-gates.js';

const byId=id=>{const e=T540_STAGED_PRINCIPAL_EVENTS.find(row=>row.id===id);assert.ok(e,id);return e;};

test('t540 closes the three missing age-27 principal identities',()=>{
  assert.deepEqual(T540_STAGED_PRINCIPAL_EVENTS.map(e=>e.id),['EVT_27_AGT_001','EVT_27_MONEY_001','EVT_27_HOME_001']);
  assert.deepEqual(byId('EVT_27_AGT_001').choices.map(c=>c.label),['Pedir salir en público','Filtrar deseo sin declaración directa','Seguir solo por vía privada','Dar un plazo a ambos clubes antes de hablar']);
  assert.deepEqual(byId('EVT_27_MONEY_001').choices.map(c=>c.label),['Profesionalizar todo','Mantener inversiones simples y líquidas','Dejar parte con familia y parte profesional','Posponer un año']);
  assert.deepEqual(byId('EVT_27_HOME_001').choices.map(c=>c.label),['Invertir','Donar a cantera sin entrar en propiedad','Esperar a la retirada','Entrar solo mediante vehículo independiente y sin cargo público']);
});

test('t540 fails closed without market, wealth and home authorities',()=>{
  for(const e of T540_STAGED_PRINCIPAL_EVENTS){
    const s=createInitialState(54001);s.age=27;s.phase='26_30';s.reputation.marketHeat=100;s.professional.moneyComfort=100;s.flags.HAS_SEED_HOME_INSTITUTION=true;
    assert.equal(eventGatesPass(s,e),false,e.id);
    assert.ok(e.tags?.includes('a6_ready_external_blocker'),e.id);
  }
});

test('t540 records narrative decisions but does not mutate club or invent external facts',()=>{
  for(const e of T540_STAGED_PRINCIPAL_EVENTS){
    const effects=[...e.choices.flatMap(c=>c.immediateEffects??[]),...e.outcomes.flatMap(o=>o.effects??[])];
    const paths=effects.map(x=>x.kind==='flag'?'flags.'+x.flag:x.path);
    assert.ok(paths.every(p=>p!=='club'&&!String(p).startsWith('facts.')&&!String(p).startsWith('market.')),e.id);
  }
});

test('age-27 seeds are explicitly handed to A2 for canonical origin realignment',()=>{
  assert.ok(byId('EVT_27_AGT_001').tags?.includes('needs_a2_seed_origin_realign_evt27_agent'));
  assert.ok(byId('EVT_27_MONEY_001').tags?.includes('needs_a2_seed_origin_realign_evt27_money'));
  assert.ok(byId('EVT_27_HOME_001').tags?.includes('needs_a2_seed_origin_realign_evt27_home'));
});
