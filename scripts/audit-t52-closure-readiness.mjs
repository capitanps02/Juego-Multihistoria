import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EVENTS } from '../dist/content/events/index.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const lifecyclePath = path.join(root, 'analysis/T5.2/seed-lifecycle.json');
const handoffPath = path.join(root, 'analysis/T5.2/seed-handoff.json');
const deferredPath = path.join(root, 'analysis/T5.2/deferred-consequences.json');
const outputPath = path.join(root, 'analysis/T5.2/closure-readiness.json');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function eventStatusMap(events) {
  return new Map(events.map(event => [event.id, event.canonStatus ?? null]));
}

function ownerMapFromHandoff(handoff) {
  const owners = new Map();
  for (const group of handoff.ownership ?? []) {
    for (const seedId of group.seeds ?? []) {
      if (owners.has(seedId)) throw new Error(`Seed ${seedId} has multiple canonical owners`);
      owners.set(seedId, group.owner);
    }
  }
  return owners;
}

function topologyFor(lifecycleRow, deferredRow) {
  const producer = lifecycleRow.lifecycle.hasRuntimeProducer;
  const consumer = deferredRow.runtimeConsumerCount > 0;
  if (producer && consumer) return deferredRow.feasiblePairCount > 0
    ? 'producer_consumer_feasible'
    : 'producer_consumer_impossible';
  if (producer) return 'producer_only';
  if (consumer) return 'consumer_only';
  return 'unwired';
}

function nextActionFor(row) {
  if (row.topology === 'producer_consumer_impossible') return 'fix_impossible_runtime_chain';
  if (row.topology === 'consumer_only') return 'implement_or_accredit_producer_or_retire_consumer';
  if (row.topology === 'producer_only') {
    return row.openEndedWithoutTerminalTransition
      ? 'justify_persistent_memory_or_add_canonical_consumer_or_expiry'
      : 'accredit_consumer_or_expiry_policy';
  }
  if (row.topology === 'unwired') return 'implement_or_accredit_canonical_origin_before_wiring';
  if (row.verifiedFeasiblePairCount > 0) return 'owner_classify_final_canonical_disposition';
  if (row.runtimeSimulationConsumerCount > 0 && row.runtimeEventConsumerCount === 0) {
    return 'verify_simulation_effect_is_sufficient_canonical_consequence';
  }
  return 'upgrade_runtime_endpoints_to_verified_canonical_evidence';
}

export function buildClosureReadinessReport({ lifecycle, handoff, deferred, events = EVENTS }) {
  const eventStatuses = eventStatusMap(events);
  const owners = ownerMapFromHandoff(handoff);
  const deferredRows = new Map((deferred.rows ?? []).map(row => [row.id, row]));
  const unknownOwners = [];
  const missingDeferredRows = [];

  const rows = (lifecycle.seeds ?? []).map(seed => {
    const owner = owners.get(seed.id) ?? null;
    if (!owner) unknownOwners.push(seed.id);
    const d = deferredRows.get(seed.id);
    if (!d) {
      missingDeferredRows.push(seed.id);
      return {
        id: seed.id,
        owner,
        topology: 'missing_deferred_evidence',
        nextAction: 'repair_audit_coverage'
      };
    }

    const producerEventIds = [...seed.runtimeCreateEvents];
    const verifiedProducerEventIds = producerEventIds.filter(id => eventStatuses.get(id) === 'verified');
    const runtimeEventConsumerIds = [...new Set((d.runtimeEventConsumers ?? []).map(item => item.eventId))];
    const verifiedRuntimeEventConsumerIds = runtimeEventConsumerIds.filter(id => eventStatuses.get(id) === 'verified');
    const verifiedFeasiblePairs = (d.feasiblePairs ?? []).filter(pair => (
      eventStatuses.get(pair.producerEventId) === 'verified' &&
      pair.consumerKind !== 'simulation' &&
      eventStatuses.get(pair.consumerEventId) === 'verified'
    ));

    const row = {
      id: seed.id,
      owner,
      description: seed.description,
      ageWindow: seed.ageWindow,
      scope: seed.scope,
      topology: topologyFor(seed, d),
      runtimeProducerCount: producerEventIds.length,
      runtimeConsumerCount: d.runtimeConsumerCount,
      runtimeEventConsumerCount: d.runtimeEventConsumerCount,
      runtimeSimulationConsumerCount: d.runtimeSimulationConsumerCount,
      feasiblePairCount: d.feasiblePairCount,
      strictDeferredPairCount: d.strictDeferredPairCount,
      verifiedProducerEventIds,
      verifiedRuntimeEventConsumerIds,
      verifiedFeasiblePairCount: verifiedFeasiblePairs.length,
      verifiedFeasiblePairs,
      explicitTerminalTransition: seed.lifecycle.hasExplicitTerminalTransition,
      finiteAgeWindow: seed.lifecycle.finiteAgeWindow,
      explicitExpiryAssignments: seed.lifecycle.explicitExpiryAssignments,
      openEndedWithoutTerminalTransition: seed.lifecycle.openEndedWithoutTerminalTransition,
      clubScoped: seed.scope.club === 'origin_club',
      seasonScoped: seed.scope.season === 'origin_season',
      scopeProofRequired: d.proofObligations?.clubContinuity === true || d.proofObligations?.seasonContinuity === true,
      impossibleRuntimeChain: d.impossibleRuntimeChain === true,
      canonicalClosure: 'requires_owner_classification'
    };
    row.nextAction = nextActionFor(row);
    return row;
  });

  const topologyCounts = Object.fromEntries(
    ['producer_consumer_feasible', 'producer_consumer_impossible', 'producer_only', 'consumer_only', 'unwired', 'missing_deferred_evidence']
      .map(kind => [kind, rows.filter(row => row.topology === kind).length])
  );
  const ownersInRows = [...new Set(rows.map(row => row.owner).filter(Boolean))].sort();
  const ownerSummary = Object.fromEntries(ownersInRows.map(owner => [owner, {
    total: rows.filter(row => row.owner === owner).length,
    feasibleRuntimeChain: rows.filter(row => row.owner === owner && row.topology === 'producer_consumer_feasible').length,
    verifiedFeasiblePair: rows.filter(row => row.owner === owner && row.verifiedFeasiblePairCount > 0).length,
    producerOnly: rows.filter(row => row.owner === owner && row.topology === 'producer_only').length,
    consumerOnly: rows.filter(row => row.owner === owner && row.topology === 'consumer_only').length,
    unwired: rows.filter(row => row.owner === owner && row.topology === 'unwired').length,
    openEndedNeedsRationale: rows.filter(row => row.owner === owner && row.openEndedWithoutTerminalTransition).length
  }]));

  const catalogSeeds = lifecycle.summary?.catalogSeeds ?? rows.length;
  const exactCoverage = rows.length === catalogSeeds
    && owners.size === catalogSeeds
    && deferredRows.size === catalogSeeds
    && unknownOwners.length === 0
    && missingDeferredRows.length === 0;
  const impossibleRuntimeChains = rows.filter(row => row.impossibleRuntimeChain).map(row => row.id);

  return {
    task: 'T5.2 seed closure readiness',
    generatedAt: new Date().toISOString(),
    model: {
      purpose: 'combine lifecycle, canonical ownership and deferred runtime evidence without auto-declaring canonical closure',
      verifiedEndpoint: 'an event endpoint counts as canonically verified only when active EventDefinition.canonStatus === "verified"',
      verifiedPair: 'both producer and non-simulation event consumer are verified and the temporal pair is feasible',
      simulationRule: 'simulation effects are valid runtime consequences but do not by themselves certify final canonical disposition',
      canonicalClosure: 'always remains owner-classified; this audit supplies evidence and next action only'
    },
    summary: {
      catalogSeeds,
      rows: rows.length,
      exactCoverage,
      topologyCounts,
      runtimeFeasibleChainSeeds: rows.filter(row => row.topology === 'producer_consumer_feasible').length,
      verifiedProducerSeeds: rows.filter(row => row.verifiedProducerEventIds?.length > 0).length,
      verifiedEventConsumerSeeds: rows.filter(row => row.verifiedRuntimeEventConsumerIds?.length > 0).length,
      verifiedFeasiblePairSeeds: rows.filter(row => row.verifiedFeasiblePairCount > 0).length,
      simulationConsumerSeeds: rows.filter(row => row.runtimeSimulationConsumerCount > 0).length,
      explicitTerminalSeeds: rows.filter(row => row.explicitTerminalTransition).length,
      finiteAgeWindowSeeds: rows.filter(row => row.finiteAgeWindow).length,
      scopeProofRequiredSeeds: rows.filter(row => row.scopeProofRequired).length,
      openEndedNeedsCanonicalRationale: rows.filter(row => row.openEndedWithoutTerminalTransition).length,
      impossibleRuntimeChains: impossibleRuntimeChains.length,
      canonicalClosureClassified: 0,
      canonicalClosurePending: rows.length
    },
    ownerSummary,
    unknownOwners,
    missingDeferredRows,
    impossibleRuntimeChains,
    rows,
    rules: {
      exactCoverage,
      noUnknownOwners: unknownOwners.length === 0,
      noMissingDeferredRows: missingDeferredRows.length === 0,
      noImpossibleRuntimeChains: impossibleRuntimeChains.length === 0,
      structuralPass: exactCoverage && unknownOwners.length === 0 && missingDeferredRows.length === 0 && impossibleRuntimeChains.length === 0,
      canonicalClosureComplete: false
    }
  };
}

function main() {
  const lifecycle = readJson(lifecyclePath);
  const handoff = readJson(handoffPath);
  const deferred = readJson(deferredPath);
  const report = buildClosureReadinessReport({ lifecycle, handoff, deferred });
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ output: path.relative(root, outputPath), ...report.summary, structuralPass: report.rules.structuralPass }, null, 2));
  if (!report.rules.structuralPass) process.exitCode = 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
