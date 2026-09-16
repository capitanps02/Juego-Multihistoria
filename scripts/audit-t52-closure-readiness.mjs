import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EVENTS } from '../dist/content/events/index.js';
import { validateSeedClosureClassifications } from './t52-seed-closure-classifications.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const lifecyclePath = path.join(root, 'analysis/T5.2/seed-lifecycle.json');
const handoffPath = path.join(root, 'analysis/T5.2/seed-handoff.json');
const deferredPath = path.join(root, 'analysis/T5.2/deferred-consequences.json');
const classificationsPath = path.join(root, 'analysis/T5.2/seed-closure-classifications.json');
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

export function buildClosureReadinessReport({ lifecycle, handoff, deferred, events = EVENTS, classifications = [] }) {
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
        canonicalClosure: 'requires_owner_classification',
        canonicalClosureEvidence: null,
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
      canonicalClosure: 'requires_owner_classification',
      canonicalClosureEvidence: null
    };
    row.nextAction = nextActionFor(row);
    return row;
  });

  const classificationValidation = validateSeedClosureClassifications(classifications, rows);
  const acceptedClassifications = new Map(classificationValidation.accepted.map(entry => [entry.seedId, entry]));
  for (const row of rows) {
    const classification = acceptedClassifications.get(row.id);
    if (!classification) continue;
    row.canonicalClosure = classification.disposition;
    row.canonicalClosureEvidence = {
      owner: classification.owner,
      rationale: classification.rationale,
      evidenceRefs: classification.evidenceRefs,
      ...(classification.producerEventId ? { producerEventId: classification.producerEventId } : {}),
      ...(classification.consumerEventId ? { consumerEventId: classification.consumerEventId } : {}),
      ...(classification.expiryBasis ? { expiryBasis: classification.expiryBasis } : {})
    };
    row.nextAction = 'canonical_closure_classified';
  }

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
    openEndedNeedsRationale: rows.filter(row => row.owner === owner && row.openEndedWithoutTerminalTransition).length,
    closureClassified: rows.filter(row => row.owner === owner && row.canonicalClosure !== 'requires_owner_classification').length
  }]));

  const catalogSeeds = lifecycle.summary?.catalogSeeds ?? rows.length;
  const exactCoverage = rows.length === catalogSeeds
    && owners.size === catalogSeeds
    && deferredRows.size === catalogSeeds
    && unknownOwners.length === 0
    && missingDeferredRows.length === 0;
  const impossibleRuntimeChains = rows.filter(row => row.impossibleRuntimeChain).map(row => row.id);
  const canonicalClosureClassified = rows.filter(row => row.canonicalClosure !== 'requires_owner_classification').length;
  const canonicalClosurePending = rows.length - canonicalClosureClassified;
  const structuralPass = exactCoverage
    && unknownOwners.length === 0
    && missingDeferredRows.length === 0
    && impossibleRuntimeChains.length === 0
    && classificationValidation.valid;
  const canonicalClosureComplete = structuralPass && canonicalClosurePending === 0;

  return {
    task: 'T5.2 seed closure readiness',
    generatedAt: new Date().toISOString(),
    model: {
      purpose: 'combine lifecycle, canonical ownership and deferred runtime evidence without auto-declaring canonical closure',
      verifiedEndpoint: 'an event endpoint counts as canonically verified only when active EventDefinition.canonStatus === "verified"',
      verifiedPair: 'both producer and non-simulation event consumer are verified and the temporal pair is feasible',
      simulationRule: 'simulation effects are valid runtime consequences but do not by themselves certify final canonical disposition',
      canonicalClosure: 'closure is applied only from explicit owner-authored classifications that satisfy evidence-specific validation'
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
      canonicalClosureClassified,
      canonicalClosurePending
    },
    ownerSummary,
    classificationRegistry: {
      entries: classifications.length,
      accepted: classificationValidation.accepted.length,
      valid: classificationValidation.valid,
      errors: classificationValidation.errors
    },
    unknownOwners,
    missingDeferredRows,
    impossibleRuntimeChains,
    rows,
    rules: {
      exactCoverage,
      noUnknownOwners: unknownOwners.length === 0,
      noMissingDeferredRows: missingDeferredRows.length === 0,
      noImpossibleRuntimeChains: impossibleRuntimeChains.length === 0,
      classificationRegistryValid: classificationValidation.valid,
      structuralPass,
      canonicalClosureComplete
    }
  };
}

function main() {
  const lifecycle = readJson(lifecyclePath);
  const handoff = readJson(handoffPath);
  const deferred = readJson(deferredPath);
  const classificationRegistry = readJson(classificationsPath);
  const report = buildClosureReadinessReport({
    lifecycle,
    handoff,
    deferred,
    classifications: classificationRegistry.classifications ?? []
  });
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({
    output: path.relative(root, outputPath),
    ...report.summary,
    classificationRegistryValid: report.rules.classificationRegistryValid,
    structuralPass: report.rules.structuralPass,
    canonicalClosureComplete: report.rules.canonicalClosureComplete
  }, null, 2));
  if (!report.rules.structuralPass) process.exitCode = 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
