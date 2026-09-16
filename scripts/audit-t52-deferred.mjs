import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EVENTS } from '../dist/content/events/index.js';
import { SEED_CATALOG } from '../dist/catalog/seeds.js';
import { getSeedScopePolicy } from '../dist/catalog/seed-scope.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputPath = path.join(root, 'analysis/T5.2/deferred-consequences.json');

function finiteMax(value) {
  return value === null || value === undefined ? Infinity : value;
}

/**
 * Necessary-condition temporal check only. It proves that at least one producer age and
 * one consumer age can exist in chronological order before automatic age-window expiry.
 * It deliberately does not infer club continuity, season continuity, exact calendar dates,
 * outcome probability or canonical semantic equivalence.
 */
export function temporalFeasibility(seedAgeWindow, producerAgeWindow, consumerAgeWindow) {
  const seedMax = finiteMax(seedAgeWindow?.[1]);
  const producerMin = producerAgeWindow[0];
  const producerMax = Math.min(finiteMax(producerAgeWindow[1]), seedMax);
  const consumerMin = consumerAgeWindow[0];
  const consumerMax = Math.min(finiteMax(consumerAgeWindow[1]), seedMax);

  if (producerMin > producerMax) {
    return { feasible: false, reason: 'producer_after_seed_expiry' };
  }
  if (consumerMin > consumerMax) {
    return { feasible: false, reason: 'consumer_after_seed_expiry' };
  }
  if (consumerMax < producerMin) {
    return { feasible: false, reason: 'consumer_window_before_producer' };
  }

  const earliestConsumptionAge = Math.max(consumerMin, producerMin);
  return {
    feasible: true,
    kind: consumerMin > producerMax ? 'strictly_deferred' : 'overlap_or_same_window',
    earliestProducerAge: producerMin,
    earliestConsumptionAge
  };
}

function dedupeRows(rows, keyFn) {
  return [...new Map(rows.map(row => [keyFn(row), row])).values()];
}

export function buildDeferredConsequenceReport(events = EVENTS, seeds = SEED_CATALOG) {
  const localSeedIds = new Set(seeds.map(seed => seed.id));
  const unknownRefs = [];
  const producers = [];
  const consumers = [];
  const declaredReaders = [];
  const sameOutcomeCreateTerminal = [];

  const seedFromPresencePath = value => (
    typeof value === 'string' && value.startsWith('flags.HAS_SEED_')
      ? value.slice('flags.HAS_'.length)
      : null
  );

  const collectConditions = (event, conditions, context) => {
    for (const condition of conditions ?? []) {
      const seedId = seedFromPresencePath(condition.path);
      if (!seedId) continue;
      if (!localSeedIds.has(seedId)) {
        unknownRefs.push({ seedId, eventId: event.id, kind: 'condition', context });
        continue;
      }
      consumers.push({
        seedId,
        eventId: event.id,
        kind: 'condition',
        context,
        ageWindow: event.ageWindow,
        phase: event.phase,
        family: event.family
      });
    }
  };

  for (const event of events) {
    for (const seedId of event.seedsRead ?? []) {
      if (!localSeedIds.has(seedId)) {
        unknownRefs.push({ seedId, eventId: event.id, kind: 'declared_read' });
        continue;
      }
      declaredReaders.push({ seedId, eventId: event.id, ageWindow: event.ageWindow });
    }

    collectConditions(event, event.gates, 'gate');
    collectConditions(event, event.exclusions, 'exclusion');

    // Choice eligibility is a first-class runtime gate. A seed used only to expose one
    // canonical option is still being consumed by behavior and must not be misclassified
    // as metadata-only just because the event itself is schedulable without the seed.
    for (const choice of event.choices ?? []) {
      collectConditions(event, choice.eligibility, `choice:${choice.id}`);
    }

    for (const outcome of event.outcomes) {
      collectConditions(event, outcome.conditions, `outcome:${outcome.id}`);
      for (const modifier of outcome.modifiers ?? []) {
        collectConditions(event, modifier.conditions, `modifier:${outcome.id}:${modifier.id}`);
      }

      const creates = new Set();
      const terminals = new Set();
      for (const transition of outcome.seedTransitions ?? []) {
        if (!localSeedIds.has(transition.seedId)) {
          unknownRefs.push({
            seedId: transition.seedId,
            eventId: event.id,
            kind: 'transition',
            action: transition.action,
            outcomeId: outcome.id
          });
          continue;
        }

        if (transition.action === 'create') {
          creates.add(transition.seedId);
          producers.push({
            seedId: transition.seedId,
            eventId: event.id,
            outcomeId: outcome.id,
            ageWindow: event.ageWindow,
            phase: event.phase,
            family: event.family,
            expiresAfter: transition.expiresAfter ?? null
          });
        }

        if (transition.action === 'resolve' || transition.action === 'expire') {
          terminals.add(transition.seedId);
          consumers.push({
            seedId: transition.seedId,
            eventId: event.id,
            kind: transition.action,
            context: `outcome:${outcome.id}`,
            ageWindow: event.ageWindow,
            phase: event.phase,
            family: event.family
          });
        }
      }

      for (const seedId of creates) {
        if (terminals.has(seedId)) {
          sameOutcomeCreateTerminal.push({ seedId, eventId: event.id, outcomeId: outcome.id });
        }
      }
    }
  }

  const runtimeConsumers = dedupeRows(
    consumers,
    row => `${row.seedId}:${row.eventId}:${row.kind}:${row.context}`
  );
  const runtimeProducers = dedupeRows(
    producers,
    row => `${row.seedId}:${row.eventId}:${row.outcomeId}`
  );
  const declared = dedupeRows(declaredReaders, row => `${row.seedId}:${row.eventId}`);

  const rows = seeds.map(seed => {
    const seedProducers = runtimeProducers.filter(row => row.seedId === seed.id);
    const seedConsumers = runtimeConsumers.filter(row => row.seedId === seed.id);
    const runtimeConsumerEvents = new Set(seedConsumers.map(row => row.eventId));
    const metadataOnlyReaders = declared
      .filter(row => row.seedId === seed.id && !runtimeConsumerEvents.has(row.eventId))
      .map(row => row.eventId);

    const pairs = [];
    for (const producer of seedProducers) {
      for (const consumer of seedConsumers) {
        const temporal = temporalFeasibility(seed.ageWindow, producer.ageWindow, consumer.ageWindow);
        pairs.push({
          producerEventId: producer.eventId,
          producerOutcomeId: producer.outcomeId,
          consumerEventId: consumer.eventId,
          consumerKind: consumer.kind,
          consumerContext: consumer.context,
          ...temporal
        });
      }
    }

    const feasiblePairs = pairs.filter(pair => pair.feasible);
    const strictDeferredPairs = feasiblePairs.filter(pair => pair.kind === 'strictly_deferred');
    const unreachableEdges = pairs.filter(pair => !pair.feasible);
    const scope = getSeedScopePolicy(seed.id);

    return {
      id: seed.id,
      ageWindow: seed.ageWindow,
      scope,
      producerCount: seedProducers.length,
      runtimeConsumerCount: seedConsumers.length,
      producers: seedProducers,
      runtimeConsumers: seedConsumers,
      metadataOnlyReaders,
      feasiblePairCount: feasiblePairs.length,
      strictDeferredPairCount: strictDeferredPairs.length,
      unreachableEdgeCount: unreachableEdges.length,
      feasiblePairs,
      strictDeferredPairs,
      unreachableEdges,
      proofObligations: {
        clubContinuity: scope.club === 'origin_club' && feasiblePairs.length > 0,
        seasonContinuity: scope.season === 'origin_season' && feasiblePairs.length > 0,
        explicitDateExpiry: seedProducers.some(row => row.expiresAfter !== null)
      },
      impossibleRuntimeChain: seedProducers.length > 0 && seedConsumers.length > 0 && feasiblePairs.length === 0
    };
  });

  const impossibleRuntimeChains = rows.filter(row => row.impossibleRuntimeChain).map(row => row.id);
  const seedsWithStrictDeferredPath = rows.filter(row => row.strictDeferredPairCount > 0).map(row => row.id);
  const seedsWithUnreachableEdges = rows.filter(row => row.unreachableEdgeCount > 0).map(row => row.id);
  const scopeProofRequired = rows
    .filter(row => row.proofObligations.clubContinuity || row.proofObligations.seasonContinuity)
    .map(row => ({ id: row.id, ...row.proofObligations }));
  const dateProofRequired = rows
    .filter(row => row.proofObligations.explicitDateExpiry)
    .map(row => row.id);

  return {
    task: 'T5.2 deferred consequences',
    generatedAt: new Date().toISOString(),
    model: {
      purpose: 'prove necessary temporal feasibility for runtime producer→consumer seed chains without inventing canonical semantics',
      consumerEvidence: 'runtime HAS_SEED_* conditions in events/outcomes/modifiers/choice eligibility plus resolve/expire transitions; seedsRead-only metadata is reported separately',
      ageExpiry: 'catalog max age is treated as terminal because expireDueSeedsInPlace expires live seeds when state.age > maxAge',
      chronology: 'a consumer must be schedulable at the same or later age than at least one producer occurrence',
      clubSeasonDate: 'reported as proof obligations, not inferred statically',
      canonicalIdentity: 'not inferred; temporal feasibility never authorizes wiring to a noncanonical scene'
    },
    summary: {
      catalogSeeds: seeds.length,
      eventCount: events.length,
      runtimeProducerSeeds: rows.filter(row => row.producerCount > 0).length,
      runtimeEventConsumerSeeds: rows.filter(row => row.runtimeConsumerCount > 0).length,
      seedsWithBothSides: rows.filter(row => row.producerCount > 0 && row.runtimeConsumerCount > 0).length,
      seedsWithStrictDeferredPath: seedsWithStrictDeferredPath.length,
      impossibleRuntimeChains: impossibleRuntimeChains.length,
      seedsWithUnreachableEdges: seedsWithUnreachableEdges.length,
      scopeProofRequired: scopeProofRequired.length,
      dateProofRequired: dateProofRequired.length,
      sameOutcomeCreateTerminal: sameOutcomeCreateTerminal.length,
      unknownReferences: unknownRefs.length
    },
    impossibleRuntimeChains,
    seedsWithStrictDeferredPath,
    seedsWithUnreachableEdges,
    scopeProofRequired,
    dateProofRequired,
    sameOutcomeCreateTerminal,
    unknownReferences: unknownRefs,
    rows,
    rules: {
      noUnknownReferences: unknownRefs.length === 0,
      noImpossibleRuntimeChains: impossibleRuntimeChains.length === 0,
      hardPass: unknownRefs.length === 0 && impossibleRuntimeChains.length === 0
    }
  };
}

function main() {
  const report = buildDeferredConsequenceReport();
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({
    output: path.relative(root, outputPath),
    ...report.summary,
    hardPass: report.rules.hardPass,
    impossibleRuntimeChains: report.impossibleRuntimeChains
  }, null, 2));
  if (!report.rules.hardPass) process.exitCode = 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
