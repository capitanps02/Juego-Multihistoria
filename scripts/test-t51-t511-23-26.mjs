import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialState } from '../dist/content/initial-state.js';
import { EVENTS_23_26 } from '../dist/content/events/23_26/index.js';
import { eventGatesPass, gateAlternatives } from '../dist/narrative/event-gates.js';
import { resolveChoice } from '../dist/narrative/resolver.js';

const IDS = ['EVT_23_MONEY_001', 'EVT_23_HOME_001', 'EVT_23_EUR_001'];

const byId = id => {
  const rows = EVENTS_23_26.filter(event => event.id === id);
  assert.equal(rows.length, 1, `${id} must have exactly one active definition`);
  return rows[0];
};

const labels = event => event.choices.map(choice => choice.label);
const transitions = event => event.outcomes.flatMap(outcome => outcome.seedTransitions ?? []);
const effectPaths = event => event.outcomes.flatMap(outcome => outcome.effects ?? []).map(effect => effect.kind === 'flag' ? `flags.${effect.flag}` : effect.path);

const money = () => byId('EVT_23_MONEY_001');
const home = () => byId('EVT_23_HOME_001');
const europe = () => byId('EVT_23_EUR_001');

test('T5.11 activates the exact canonical titles and decision labels', () => {
  assert.equal(money().text.title, 'El asesor de tu padre');
  assert.deepEqual(labels(money()), [
    'Invertir la cantidad completa',
    'Entrar con una fracción',
    'Rechazar y contratar a Irene para ordenar patrimonio',
    'No invertir pero prestar dinero a tu padre para que él decida'
  ]);

  assert.equal(home().text.title, 'Tu nombre en Cerro Alto');
  assert.deepEqual(labels(home()), [
    'Aceptar sin cobrar',
    'Aceptar con una aportación a cantera',
    'Pedir que no usen tu nombre todavía',
    'Ceder imagen cobrando como cualquier campaña'
  ]);

  assert.equal(europe().text.title, 'La lista continental');
  assert.deepEqual(labels(europe()), [
    'Pedir respuesta antes del cierre',
    'No presionar y confiar',
    'Si quedas fuera, pedir salida o cesión inmediata',
    'Aceptar quedar fuera si prometen rol doméstico alto'
  ]);

  for (const id of IDS) assert.equal(byId(id).canonStatus, 'verified');
});

test('money scene is reachable by wealth signal OR first-big-money precedent and never guarantees returns', () => {
  const event = money();
  assert.deepEqual(event.gates, []);
  assert.deepEqual(gateAlternatives(event), [
    [{ path: 'professional.moneyComfort', op: 'gte', value: 36 }],
    [{ path: 'flags.HAS_SEED_FIRST_BIG_MONEY', op: 'eq', value: true }]
  ]);
  assert.deepEqual(event.seedsRead, ['SEED_FIRST_BIG_MONEY', 'SEED_FAMILY_MONEY']);
  assert.deepEqual(event.seedsWrite, ['SEED_FAMILY_BUSINESS']);
  assert.ok(event.npcRefs?.includes('NPC_FAM_02'));
  assert.ok(transitions(event).every(row => row.seedId === 'SEED_FAMILY_BUSINESS' && row.action === 'create'));
  assert.ok(effectPaths(event).every(path => !path.startsWith('contract.') && path !== 'club' && !path.startsWith('market.')));
  assert.ok(event.outcomes.every(outcome => outcome.messages.every(message => !/rentabilidad garantizada|beneficio garantizado|ganas dinero seguro/i.test(message))));

  const state = createInitialState(51101);
  state.age = 23;
  state.phase = '23_26';
  state.professional.moneyComfort = 20;
  state.flags.HAS_SEED_FIRST_BIG_MONEY = false;
  assert.equal(eventGatesPass(state, event), false);
  state.professional.moneyComfort = 50;
  assert.equal(eventGatesPass(state, event), true);
  state.professional.moneyComfort = 20;
  state.flags.HAS_SEED_FIRST_BIG_MONEY = true;
  assert.equal(eventGatesPass(state, event), true);
});

test('money choices record exposure structure without mutating historical family-money precedents', () => {
  const state = createInitialState(51102);
  state.age = 23;
  state.phase = '23_26';
  state.professional.moneyComfort = 60;
  state.seeds.push({
    id: 'SEED_FAMILY_MONEY', state: 'dormant', intensity: 50,
    originEvent: 'EVT_21_MONEY_001', originSeason: state.season,
    npcRefs: ['NPC_FAM_01', 'NPC_FAM_02'], payload: { old: true }
  });
  state.flags.HAS_SEED_FAMILY_MONEY = true;
  const result = resolveChoice(state, money(), 'B');
  const old = result.state.seeds.find(seed => seed.id === 'SEED_FAMILY_MONEY');
  const created = result.state.seeds.find(seed => seed.id === 'SEED_FAMILY_BUSINESS');
  assert.equal(old?.originEvent, 'EVT_21_MONEY_001');
  assert.equal(old?.payload.old, true);
  assert.equal(created?.originEvent, 'EVT_23_MONEY_001');
  assert.equal(created?.payload.structure, 'partial_investment');
});

test('home scene uses real home/reputation precedents and only records how the symbol is handled', () => {
  const event = home();
  assert.deepEqual(gateAlternatives(event), [
    [{ path: 'professional.publicMyth', op: 'gte', value: 28 }],
    [{ path: 'professional.homePull', op: 'gte', value: 32 }],
    [{ path: 'flags.HAS_SEED_HOME_DISTANCE', op: 'eq', value: true }]
  ]);
  assert.deepEqual(event.seedsRead, ['SEED_HOME_DISTANCE']);
  assert.deepEqual(event.seedsWrite, ['SEED_HOME_SYMBOL']);
  assert.ok(transitions(event).every(row => row.seedId === 'SEED_HOME_SYMBOL' && row.action === 'create'));
  assert.ok(effectPaths(event).every(path => !path.startsWith('contract.') && path !== 'club' && !path.startsWith('market.')));

  const state = createInitialState(51103);
  state.age = 23;
  state.phase = '23_26';
  state.professional.publicMyth = 5;
  state.professional.homePull = 5;
  state.flags.HAS_SEED_HOME_DISTANCE = false;
  assert.equal(eventGatesPass(state, event), false);
  state.flags.HAS_SEED_HOME_DISTANCE = true;
  assert.equal(eventGatesPass(state, event), true);

  const resolved = resolveChoice(state, event, 'D');
  const seed = resolved.state.seeds.find(row => row.id === 'SEED_HOME_SYMBOL');
  assert.equal(seed?.originEvent, 'EVT_23_HOME_001');
  assert.equal(seed?.payload.stance, 'commercial_license');
  assert.equal(seed?.payload.commercialUse, true);
});

test('continental-list scene requires continental context and does not decide registration itself', () => {
  const event = europe();
  assert.deepEqual(event.gates, [
    { path: 'flags.CONTINENTAL_CONTEXT', op: 'eq', value: true },
    { path: 'professional.roleSecurity', op: 'lte', value: 70 }
  ]);
  assert.deepEqual(event.timeWindow?.months, [8, 9]);
  assert.deepEqual(event.seedsRead, ['SEED_ELITE_ROLE_BARGAIN']);
  assert.deepEqual(event.seedsWrite, ['SEED_EURO_REGISTRATION']);
  assert.ok(transitions(event).every(row => row.seedId === 'SEED_EURO_REGISTRATION' && row.action === 'create'));
  assert.ok(transitions(event).every(row => row.payload?.registrationOutcome === 'unknown'));
  assert.ok(effectPaths(event).every(path => path !== 'flags.CONTINENTAL_REGISTERED' && path !== 'club' && !path.startsWith('contract.')));

  const state = createInitialState(51104);
  state.age = 23;
  state.phase = '23_26';
  state.date = '2026-08-20';
  state.flags.CONTINENTAL_CONTEXT = true;
  state.flags.CONTINENTAL_REGISTERED = false;
  state.professional.roleSecurity = 45;
  assert.equal(eventGatesPass(state, event), true);
  const beforeRegistration = state.flags.CONTINENTAL_REGISTERED;
  const result = resolveChoice(state, event, 'C');
  assert.equal(result.state.flags.CONTINENTAL_REGISTERED, beforeRegistration, 'narrative stance must not fabricate registration result');
  const seed = result.state.seeds.find(row => row.id === 'SEED_EURO_REGISTRATION');
  assert.equal(seed?.originEvent, 'EVT_23_EUR_001');
  assert.equal(seed?.payload.registrationOutcome, 'unknown');
});
