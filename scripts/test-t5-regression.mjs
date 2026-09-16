import test from 'node:test';
import assert from 'node:assert/strict';
import { EVENTS } from '../dist/content/events/index.js';
import { SEED_CATALOG } from '../dist/catalog/seeds.js';
import { createInitialState } from '../dist/content/initial-state.js';
import { simulateCareer } from '../dist/simulation/career-simulator.js';
import { advanceWorldDayInPlace } from '../dist/simulation/world-simulator.js';
import { respondToOffer } from '../dist/simulation/offers.js';

const LIVE_SEED_STATES = new Set(['dormant', 'active', 'transformed']);
const TERMINAL_SEED_STATES = new Set(['resolved', 'expired']);
const phaseForAge = age => age < 20 ? '18_20' : age < 23 ? '20_23' : age < 26 ? '23_26' : age < 30 ? '26_30' : age < 34 ? '30_34' : '34_plus';

function withoutMicrofeedState(state) {
  const clone = structuredClone(state);
  delete clone.microfeeds;
  if (clone.rngState) delete clone.rngState.microfeed;
  return clone;
}

function assertSeedRuntimeInvariants(state, label) {
  const grouped = new Map();
  for (const seed of state.seeds) {
    const rows = grouped.get(seed.id) ?? [];
    rows.push(seed);
    grouped.set(seed.id, rows);
    assert.ok(LIVE_SEED_STATES.has(seed.state) || TERMINAL_SEED_STATES.has(seed.state), `${label}: estado de seed desconocido ${seed.id}/${seed.state}`);
    if (seed.state === 'resolved') assert.ok(seed.consumedBy, `${label}: ${seed.id} resuelta sin consumedBy`);
  }
  for (const [id, rows] of grouped) {
    const live = rows.filter(seed => LIVE_SEED_STATES.has(seed.state));
    assert.ok(live.length <= 1, `${label}: ${id} tiene ${live.length} instancias vivas`);
    const resolved = rows.filter(seed => seed.state === 'resolved');
    assert.ok(resolved.length <= 1, `${label}: ${id} fue consumida/resuelta ${resolved.length} veces`);
    assert.equal(state.flags[`HAS_${id}`] === true, live.length > 0, `${label}: flag HAS_${id} no coincide con el lifecycle real`);
  }
}

function assertMarketInvariants(state, label) {
  const market = state.market;
  assert.ok(market, `${label}: falta estado de mercado`);
  const ids = new Set();
  for (const decision of market.history) {
    const { offer, action, accepted } = decision;
    assert.ok(!ids.has(offer.id), `${label}: oferta duplicada ${offer.id}`);
    ids.add(offer.id);
    for (const [side, terms] of [['before', offer.before], ['terms', offer.terms]]) {
      assert.equal(terms.registrationClub, terms.club, `${label}: ${offer.id}/${side} registro y club divergen`);
      assert.equal(terms.tier, terms.leagueTier, `${label}: ${offer.id}/${side} tier incoherente`);
      assert.ok(Number.isFinite(terms.salary) && terms.salary >= 0, `${label}: ${offer.id}/${side} salario inválido`);
      assert.ok(Number.isFinite(terms.months) && terms.months >= 0, `${label}: ${offer.id}/${side} meses inválidos`);
      if (!terms.loan) assert.equal(terms.ownerClub, terms.club, `${label}: ${offer.id}/${side} ownerClub incoherente sin cesión`);
    }
    const delegatedAcceptance = action === 'delegate' && offer.terms.salary >= offer.before.salary && offer.terms.months >= 12 && offer.terms.leagueTier <= offer.before.leagueTier;
    assert.equal(accepted, action === 'accept' || delegatedAcceptance, `${label}: ${offer.id} decisión de mercado incoherente`);
  }
}

function assertEpilogueBackedByHistory(state, label) {
  assert.equal(state.retirement.status, 'closed', `${label}: carrera no cerrada`);
  assert.equal(state.epilogue.generated, true, `${label}: carrera cerrada sin epílogo`);
  assert.ok(state.epilogue.families.length >= 2 && state.epilogue.families.length <= 5, `${label}: familias de epílogo fuera de rango`);
  assert.equal(new Set(state.epilogue.families).size, state.epilogue.families.length, `${label}: familias de epílogo duplicadas`);
  const historyMilestones = new Set(state.history.map(h => `${h.season} · ${h.eventId} · ${h.choiceId}`));
  for (const milestone of state.epilogue.milestones) assert.ok(historyMilestones.has(milestone), `${label}: hito de epílogo no existe en historial: ${milestone}`);
}

test('T5 determinism matrix: same seed/options are byte-stable and microfeeds cannot perturb strong narrative', () => {
  const seeds = [1, 42, 424242];
  const strategies = ['first', 'balanced', 'random'];
  for (const seed of seeds) for (const choiceStrategy of strategies) {
    const label = `seed=${seed}/strategy=${choiceStrategy}`;
    const options = { seed, days: 5000, choiceStrategy, microfeeds: true };
    const a = simulateCareer(options);
    const b = simulateCareer(options);
    const noFeeds = simulateCareer({ ...options, microfeeds: false });
    assert.equal(a.signature, b.signature, `${label}: firma no determinista`);
    assert.deepEqual(a.state, b.state, `${label}: estado final no determinista`);
    assert.equal(a.narrativeSignature, noFeeds.narrativeSignature, `${label}: microfeed alteró la narrativa fuerte`);
    assert.deepEqual(withoutMicrofeedState(a.state), withoutMicrofeedState(noFeeds.state), `${label}: microfeed contaminó un stream/estado fuerte`);
  }
});

test('T5 age boundaries: phase and adapters survive every canonical crossing without skipping', () => {
  const state = createInitialState(90125);
  const reached = new Set([state.age]);
  let guard = 0;
  while (state.age < 34 && guard++ < 6500) {
    if (state.market?.pending) respondToOffer(state, state.market.pending.id, 'reject');
    advanceWorldDayInPlace(state);
    reached.add(state.age);
    assert.equal(state.phase, phaseForAge(state.age), `fase incorrecta a edad ${state.age} / ${state.date}`);
    if (state.age >= 20) assert.equal(state.professional.initializedAt20, true, `adaptador 20 no inicializado en ${state.date}`);
    if (state.age >= 23) assert.equal(state.professional.initializedAt23, true, `adaptador 23 no inicializado en ${state.date}`);
    if (state.age >= 26) assert.equal(state.professional.initializedAt26, true, `adaptador 26 no inicializado en ${state.date}`);
    if (state.age >= 30) assert.equal(state.professional.initializedAt30, true, `adaptador 30 no inicializado en ${state.date}`);
  }
  assert.ok(state.age >= 34, 'no se alcanzó 34 dentro del horizonte acotado');
  for (const age of [20, 23, 26, 30, 34]) assert.ok(reached.has(age), `se saltó el cruce de edad ${age}`);
});

test('T5 content references: events, seeds and NPC references are structurally closed', () => {
  const eventIds = EVENTS.map(event => event.id);
  const seedIds = SEED_CATALOG.map(seed => seed.id);
  assert.equal(new Set(eventIds).size, eventIds.length, 'IDs de evento duplicados');
  assert.equal(new Set(seedIds).size, seedIds.length, 'IDs de seed duplicados');
  const seedSet = new Set(seedIds);
  const npcSet = new Set(createInitialState(1).npcs.map(npc => npc.id));
  const unknownSeedRefs = [];
  const unknownNpcRefs = [];
  for (const event of EVENTS) {
    for (const seedId of [...(event.seedsRead ?? []), ...(event.seedsWrite ?? [])]) if (!seedSet.has(seedId)) unknownSeedRefs.push(`${event.id}:${seedId}`);
    for (const outcome of event.outcomes) for (const transition of outcome.seedTransitions ?? []) if (!seedSet.has(transition.seedId)) unknownSeedRefs.push(`${event.id}/${outcome.id}:${transition.seedId}`);
    for (const npcId of event.npcRefs ?? []) if (!npcSet.has(npcId)) unknownNpcRefs.push(`${event.id}:${npcId}`);
  }
  for (const seed of SEED_CATALOG) for (const npcId of seed.npcRefs ?? []) if (!npcSet.has(npcId)) unknownNpcRefs.push(`${seed.id}:${npcId}`);
  assert.deepEqual(unknownSeedRefs, [], `referencias a seeds inexistentes: ${unknownSeedRefs.join(', ')}`);
  assert.deepEqual(unknownNpcRefs, [], `referencias a NPC inexistentes: ${unknownNpcRefs.join(', ')}`);
});

test('T5 long careers: no terminal lock, absurd repeats, double-consumed seeds, market corruption or fictional epilogue milestones', () => {
  const definitions = new Map(EVENTS.map(event => [event.id, event]));
  for (const seed of [7, 19, 77]) for (const choiceStrategy of ['first', 'balanced']) {
    const label = `seed=${seed}/strategy=${choiceStrategy}`;
    const result = simulateCareer({ seed, choiceStrategy, untilRetirement: true, maxAge: 55, microfeeds: true });
    const counts = new Map();
    for (const entry of result.history) counts.set(entry.eventId, (counts.get(entry.eventId) ?? 0) + 1);
    for (const [eventId, count] of counts) {
      const definition = definitions.get(eventId);
      assert.ok(definition, `${label}: historial contiene evento desconocido ${eventId}`);
      if (!definition.repeatable) assert.ok(count <= 1, `${label}: evento no repetible ${eventId} apareció ${count} veces`);
    }
    assertSeedRuntimeInvariants(result.state, label);
    assertMarketInvariants(result.state, label);
    assertEpilogueBackedByHistory(result.state, label);
    assert.equal(result.state.market.pending, null, `${label}: carrera cerró con oferta pendiente`);
  }
});
