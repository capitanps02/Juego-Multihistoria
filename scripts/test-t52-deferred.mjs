import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  auditSimulationSeedConsumerRegistry,
  buildDeferredConsequenceReport,
  temporalFeasibility
} from './audit-t52-deferred.mjs';
import { seedPresencePolarity } from './t52-seed-condition-polarity.mjs';

test('deferred chain: later consumer before finite seed expiry is feasible', () => {
  const result = temporalFeasibility([18, 26], [18, 20], [23, 26]);
  assert.equal(result.feasible, true);
  assert.equal(result.kind, 'strictly_deferred');
  assert.equal(result.earliestProducerAge, 18);
  assert.equal(result.earliestConsumptionAge, 23);
});

test('deferred chain: consumer starting after seed max age is impossible', () => {
  assert.deepEqual(
    temporalFeasibility([18, 20], [18, 20], [21, 23]),
    { feasible: false, reason: 'consumer_after_seed_expiry' }
  );
});

test('deferred chain: a consumer window entirely before the producer cannot consume that instance', () => {
  assert.deepEqual(
    temporalFeasibility([18, null], [23, 26], [18, 20]),
    { feasible: false, reason: 'consumer_window_before_producer' }
  );
});

test('deferred chain: producer starting after finite seed expiry is impossible', () => {
  assert.deepEqual(
    temporalFeasibility([18, 20], [21, 23], [21, 23]),
    { feasible: false, reason: 'producer_after_seed_expiry' }
  );
});

test('deferred chain: overlapping producer and consumer windows remain valid', () => {
  const result = temporalFeasibility([18, null], [18, 23], [20, 26]);
  assert.equal(result.feasible, true);
  assert.equal(result.kind, 'overlap_or_same_window');
  assert.equal(result.earliestConsumptionAge, 20);
});

test('choice eligibility using HAS_SEED_* is counted as a runtime deferred consumer', () => {
  const seed = { id: 'SEED_SYNTHETIC_CHOICE', ageWindow: [18, 26] };
  const producer = {
    id: 'EVT_SYNTH_PRODUCER', phase: 'rise', family: 'sport', ageWindow: [18, 20], choices: [],
    outcomes: [{ id: 'CREATE_OUT', seedTransitions: [{ action: 'create', seedId: seed.id }] }]
  };
  const consumer = {
    id: 'EVT_SYNTH_CONSUMER', phase: 'prime', family: 'sport', ageWindow: [23, 26],
    choices: [{ id: 'SEED_ONLY_OPTION', eligibility: [{ path: 'flags.HAS_SEED_SYNTHETIC_CHOICE', op: 'eq', value: true }] }],
    outcomes: []
  };

  const report = buildDeferredConsequenceReport([producer, consumer], [seed]);
  const row = report.rows[0];
  assert.equal(row.runtimeConsumerCount, 1);
  assert.equal(row.runtimeConsumers[0].eventId, consumer.id);
  assert.equal(row.runtimeConsumers[0].context, 'choice:SEED_ONLY_OPTION');
  assert.equal(row.strictDeferredPairCount, 1);
  assert.equal(row.impossibleRuntimeChain, false);
  assert.deepEqual(row.metadataOnlyReaders, []);
});

test('choice eligibility detects a producer→consumer chain that is only available after seed expiry', () => {
  const seed = { id: 'SEED_SYNTHETIC_EXPIRED_CHOICE', ageWindow: [18, 20] };
  const producer = {
    id: 'EVT_SYNTH_PRODUCER_EXP', phase: 'rise', family: 'sport', ageWindow: [18, 20], choices: [],
    outcomes: [{ id: 'CREATE_OUT', seedTransitions: [{ action: 'create', seedId: seed.id }] }]
  };
  const consumer = {
    id: 'EVT_SYNTH_CONSUMER_EXP', phase: 'prime', family: 'sport', ageWindow: [21, 23],
    choices: [{ id: 'TOO_LATE_OPTION', eligibility: [{ path: 'flags.HAS_SEED_SYNTHETIC_EXPIRED_CHOICE', op: 'eq', value: true }] }],
    outcomes: []
  };

  const report = buildDeferredConsequenceReport([producer, consumer], [seed]);
  assert.deepEqual(report.impossibleRuntimeChains, [seed.id]);
  assert.equal(report.rules.hardPass, false);
  assert.equal(report.rows[0].unreachableEdges[0].reason, 'consumer_after_seed_expiry');
});

test('event gateAlternatives using HAS_SEED_* are counted as runtime deferred consumers', () => {
  const seed = { id: 'SEED_SYNTHETIC_OR_ROUTE', ageWindow: [18, 26] };
  const producer = {
    id: 'EVT_SYNTH_OR_PRODUCER', phase: 'rise', family: 'team', ageWindow: [18, 20], choices: [],
    outcomes: [{ id: 'CREATE_OUT', seedTransitions: [{ action: 'create', seedId: seed.id }] }]
  };
  const consumer = {
    id: 'EVT_SYNTH_OR_CONSUMER', phase: 'prime', family: 'team', ageWindow: [23, 26], gates: [],
    gateAlternatives: [
      [{ path: 'flags.HAS_SEED_SYNTHETIC_OR_ROUTE', op: 'eq', value: true }],
      [{ path: 'sport.form', op: 'gte', value: 80 }]
    ],
    choices: [], outcomes: []
  };

  const report = buildDeferredConsequenceReport([producer, consumer], [seed]);
  const row = report.rows[0];
  assert.equal(row.runtimeConsumerCount, 1);
  assert.equal(row.runtimeConsumers[0].eventId, consumer.id);
  assert.equal(row.runtimeConsumers[0].context, 'gateAlternative:0');
  assert.equal(row.strictDeferredPairCount, 1);
  assert.equal(row.impossibleRuntimeChain, false);
});

test('event gateAlternatives detect a seed route that exists only after seed expiry', () => {
  const seed = { id: 'SEED_SYNTHETIC_OR_EXPIRED', ageWindow: [18, 20] };
  const producer = {
    id: 'EVT_SYNTH_OR_PRODUCER_EXP', phase: 'rise', family: 'team', ageWindow: [18, 20], choices: [],
    outcomes: [{ id: 'CREATE_OUT', seedTransitions: [{ action: 'create', seedId: seed.id }] }]
  };
  const consumer = {
    id: 'EVT_SYNTH_OR_CONSUMER_EXP', phase: 'prime', family: 'team', ageWindow: [21, 23],
    gateAlternatives: [[{ path: 'flags.HAS_SEED_SYNTHETIC_OR_EXPIRED', op: 'eq', value: true }]],
    choices: [], outcomes: []
  };

  const report = buildDeferredConsequenceReport([producer, consumer], [seed]);
  assert.deepEqual(report.impossibleRuntimeChains, [seed.id]);
  assert.equal(report.rules.hardPass, false);
  assert.equal(report.rows[0].runtimeConsumers[0].context, 'gateAlternative:0');
  assert.equal(report.rows[0].unreachableEdges[0].reason, 'consumer_after_seed_expiry');
});

test('HAS_SEED boolean comparators are classified by actual presence semantics', () => {
  const positive = [
    { op: 'eq', value: true },
    { op: 'neq', value: false },
    { op: 'in', value: [true] },
    { op: 'notIn', value: [false] }
  ];
  const negative = [
    { op: 'eq', value: false },
    { op: 'neq', value: true },
    { op: 'in', value: [false] },
    { op: 'notIn', value: [true] }
  ];

  for (const condition of positive) assert.equal(seedPresencePolarity(condition), 'positive', JSON.stringify(condition));
  for (const condition of negative) assert.equal(seedPresencePolarity(condition), 'negative', JSON.stringify(condition));
  assert.equal(seedPresencePolarity({ op: 'exists' }), 'neutral');
  assert.equal(seedPresencePolarity({ op: 'gte', value: 1 }), 'neutral');
});

test('absence/suppression predicates do not create positive producer→consumer edges', () => {
  const seed = { id: 'SEED_SYNTHETIC_ABSENCE', ageWindow: [18, 26] };
  const producer = {
    id: 'EVT_SYNTH_ABSENCE_PRODUCER', phase: '18_20', family: 'career', ageWindow: [18, 18], choices: [],
    outcomes: [{ id: 'CREATE', seedTransitions: [{ seedId: seed.id, action: 'create' }] }]
  };
  const consumer = {
    id: 'EVT_SYNTH_ABSENCE_CONSUMER', phase: '18_20', family: 'career', ageWindow: [19, 19], seedsRead: [seed.id],
    choices: [{
      id: 'ONLY_WHEN_ABSENT',
      eligibility: [{ path: `flags.HAS_${seed.id}`, op: 'eq', value: false }]
    }],
    outcomes: []
  };

  const report = buildDeferredConsequenceReport([producer, consumer], [seed]);
  const row = report.rows[0];
  assert.equal(row.runtimeConsumerCount, 0);
  assert.equal(row.feasiblePairCount, 0);
  assert.equal(row.negativeDependencyCount, 1);
  assert.equal(row.negativeDependencies[0].context, 'choice:ONLY_WHEN_ABSENT');
  assert.deepEqual(row.metadataOnlyReaders, []);
  assert.equal(row.impossibleRuntimeChain, false);
});

test('negative HAS_SEED polarity is preserved inside gateAlternatives', () => {
  const seed = { id: 'SEED_SYNTHETIC_OR_ABSENCE', ageWindow: [18, 26] };
  const producer = {
    id: 'EVT_SYNTH_OR_ABSENCE_PRODUCER', phase: '18_20', family: 'team', ageWindow: [18, 18], choices: [],
    outcomes: [{ id: 'CREATE', seedTransitions: [{ seedId: seed.id, action: 'create' }] }]
  };
  const consumer = {
    id: 'EVT_SYNTH_OR_ABSENCE_CONSUMER', phase: '18_20', family: 'team', ageWindow: [19, 19],
    gateAlternatives: [[{ path: `flags.HAS_${seed.id}`, op: 'neq', value: true }]],
    choices: [], outcomes: []
  };

  const report = buildDeferredConsequenceReport([producer, consumer], [seed]);
  const row = report.rows[0];
  assert.equal(row.runtimeConsumerCount, 0);
  assert.equal(row.negativeDependencyCount, 1);
  assert.equal(row.negativeDependencies[0].context, 'gateAlternative:0');
  assert.equal(report.rules.hardPass, true);
});

test('registered simulation consumer participates in deferred temporal graph', () => {
  const seed = { id: 'SEED_SYNTHETIC_SIM', ageWindow: [18, 26] };
  const producer = {
    id: 'EVT_SYNTH_SIM_PRODUCER', phase: 'rise', family: 'sport', ageWindow: [18, 20], choices: [],
    outcomes: [{ id: 'CREATE_OUT', seedTransitions: [{ action: 'create', seedId: seed.id }] }]
  };
  const simulationConsumers = [{
    file: 'src/simulation/synthetic.ts',
    seedId: seed.id,
    ageWindow: [23, 26],
    surface: 'synthetic-runtime-effect',
    rationale: 'test'
  }];

  const report = buildDeferredConsequenceReport([producer], [seed], { simulationConsumers });
  const row = report.rows[0];
  assert.equal(row.runtimeEventConsumerCount, 0);
  assert.equal(row.runtimeSimulationConsumerCount, 1);
  assert.equal(row.runtimeConsumerCount, 1);
  assert.equal(row.strictDeferredPairCount, 1);
  assert.equal(row.runtimeSimulationConsumers[0].kind, 'simulation');
  assert.equal(row.runtimeSimulationConsumers[0].polarity, 'positive');
  assert.equal(row.impossibleRuntimeChain, false);
});

test('simulation consumer after finite seed expiry makes the chain impossible', () => {
  const seed = { id: 'SEED_SYNTHETIC_SIM_EXPIRED', ageWindow: [18, 20] };
  const producer = {
    id: 'EVT_SYNTH_SIM_PRODUCER_EXP', phase: 'rise', family: 'sport', ageWindow: [18, 20], choices: [],
    outcomes: [{ id: 'CREATE_OUT', seedTransitions: [{ action: 'create', seedId: seed.id }] }]
  };
  const simulationConsumers = [{
    file: 'src/simulation/synthetic.ts',
    seedId: seed.id,
    ageWindow: [21, 23],
    surface: 'too-late-runtime-effect',
    rationale: 'test'
  }];

  const report = buildDeferredConsequenceReport([producer], [seed], { simulationConsumers });
  assert.deepEqual(report.impossibleRuntimeChains, [seed.id]);
  assert.equal(report.rows[0].unreachableEdges[0].reason, 'consumer_after_seed_expiry');
  assert.equal(report.rules.hardPass, false);
});

test('current simulation HAS_SEED_* surface is completely registered', () => {
  const registry = auditSimulationSeedConsumerRegistry();
  assert.equal(registry.unregisteredUses.length, 0, JSON.stringify(registry.unregisteredUses));
  assert.equal(registry.staleRegistrations.length, 0, JSON.stringify(registry.staleRegistrations));
  assert.equal(registry.duplicateRegistrations.length, 0, JSON.stringify(registry.duplicateRegistrations));
  assert.equal(registry.invalidWindows.length, 0, JSON.stringify(registry.invalidWindows));
  assert.equal(registry.observedUses.length, 22);
  assert.equal(new Set(registry.observedUses.map(row => row.seedId)).size, 15);
});

test('current catalog deferred audit has no structurally impossible runtime chain', () => {
  const report = JSON.parse(fs.readFileSync('analysis/T5.2/deferred-consequences.json', 'utf8'));
  assert.equal(report.rules.noUnknownReferences, true);
  assert.equal(report.rules.noImpossibleRuntimeChains, true, JSON.stringify(report.impossibleRuntimeChains));
  assert.equal(report.rules.simulationSeedRegistryComplete, true, JSON.stringify(report.simulationRegistryAudit));
  assert.equal(report.rules.hardPass, true);
  assert.equal(report.summary.catalogSeeds, 210);
  assert.equal(report.summary.registeredSimulationConsumerEdges, 22);
  assert.equal(report.summary.runtimeSimulationConsumerSeeds, 15);
  assert.equal(report.impossibleRuntimeChains.length, 0);
});

test('scope proof registry covers every deferred origin scope obligation exactly', async () => {
  const { SEED_SCOPE_PROOFS } = await import('./t52-seed-scope-proofs.mjs');
  const report = JSON.parse(fs.readFileSync('analysis/T5.2/deferred-consequences.json', 'utf8'));
  const requiredIds = report.scopeProofRequired.map(row => row.id).sort();
  const registeredIds = [...new Set(SEED_SCOPE_PROOFS.map(row => row.seedId))].sort();
  assert.deepEqual(registeredIds, requiredIds, 'cada obligación de scope debe tener una prueba registrada y no puede haber pruebas stale');
  assert.equal(
    new Set(SEED_SCOPE_PROOFS.map(row => `${row.seedId}:${row.producerEventId}:${row.consumerEventId}`)).size,
    SEED_SCOPE_PROOFS.length,
    'no se admiten pruebas de scope duplicadas'
  );

  for (const proof of SEED_SCOPE_PROOFS) {
    const row = report.rows.find(item => item.id === proof.seedId);
    assert.ok(row, `seed ausente del audit: ${proof.seedId}`);
    if (proof.scope === 'origin_club') assert.equal(row.scope.club, 'origin_club');
    else if (proof.scope === 'origin_season') assert.equal(row.scope.season, 'origin_season');
    else assert.fail(`scope de prueba no soportado: ${proof.scope}`);
    assert.ok(row.producers.some(item => item.eventId === proof.producerEventId), `productor no acreditado: ${proof.producerEventId}`);
    assert.ok(row.runtimeEventConsumers.some(item => item.eventId === proof.consumerEventId), `consumidor no acreditado: ${proof.consumerEventId}`);
    assert.equal(proof.proofType, 'scope_expiry_blocks_consumer');
  }
});

test('origin-club proof: private chat callback becomes unreachable after transfer scope expiry', async () => {
  const { EVENTS } = await import('../dist/content/events/index.js');
  const { createInitialState } = await import('../dist/content/initial-state.js');
  const { expireDueSeedsInPlace } = await import('../dist/narrative/resolver.js');
  const { eventGatesPass } = await import('../dist/narrative/event-gates.js');
  const { SEED_SCOPE_PROOFS } = await import('./t52-seed-scope-proofs.mjs');

  const proof = SEED_SCOPE_PROOFS.find(row => row.seedId === 'SEED_PRIVATE_CHAT');
  assert.ok(proof);
  const producer = EVENTS.find(event => event.id === proof.producerEventId);
  const consumer = EVENTS.find(event => event.id === proof.consumerEventId);
  assert.ok(producer, 'falta el productor canónico del chat privado');
  assert.ok(consumer, 'falta el callback canónico del chat privado');
  assert.ok(
    producer.outcomes.some(outcome => (outcome.seedTransitions ?? []).some(transition => transition.seedId === proof.seedId && transition.action === 'create')),
    'el productor acreditado debe crear SEED_PRIVATE_CHAT'
  );

  const state = createInitialState(5263);
  state.age = 24;
  state.date = '2032-10-01';
  state.club = 'ORIGIN_SCOPE_CLUB';
  state.professional.ownerClub = state.club;
  state.professional.registrationClub = state.club;
  state.world.ownerClub = state.club;
  state.seeds.push({
    id: proof.seedId,
    state: 'active',
    intensity: 50,
    originEvent: proof.producerEventId,
    originSeason: state.season,
    npcRefs: [],
    payload: { __t52OriginClub: state.club },
    lastTouchedDate: state.date
  });
  state.flags.HAS_SEED_PRIVATE_CHAT = true;

  assert.equal(eventGatesPass(state, consumer), true, 'mientras sigue en el club de origen la memoria puede habilitar el callback');

  state.club = 'TRANSFER_DESTINATION';
  expireDueSeedsInPlace(state);
  const seed = state.seeds.find(item => item.id === proof.seedId);
  assert.equal(seed?.state, 'expired');
  assert.equal(seed?.payload.__t52TerminalReason, 'club_scope');
  assert.equal(state.flags.HAS_SEED_PRIVATE_CHAT, false);
  assert.equal(eventGatesPass(state, consumer), false, 'tras cambiar de club la consecuencia local no puede filtrarse al nuevo vestuario');
});
