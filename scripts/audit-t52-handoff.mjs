import fs from 'node:fs';
import {
  SEED_CATALOG,
  SEED_CATALOG_18_20,
  SEED_CATALOG_23_26,
  SEED_CATALOG_26_30,
  SEED_CATALOG_30_34,
  SEED_CATALOG_34_PLUS
} from '../dist/catalog/seeds.js';

const lifecyclePath = 'analysis/T5.2/seed-lifecycle.json';
const outputPath = 'analysis/T5.2/seed-handoff.json';
const lifecycle = JSON.parse(fs.readFileSync(lifecyclePath, 'utf8'));
const rows = new Map(lifecycle.seeds.map(seed => [seed.id, seed]));

const groups = [
  {
    owner: 't51/canon-18-23',
    canonicalBlocks: ['18-20', '20-23'],
    catalogSegments: ['SEED_CATALOG_18_20'],
    seeds: SEED_CATALOG_18_20
  },
  {
    owner: 't51/canon-23-30',
    canonicalBlocks: ['23-26', '26-30'],
    catalogSegments: ['SEED_CATALOG_23_26', 'SEED_CATALOG_26_30'],
    seeds: [...SEED_CATALOG_23_26, ...SEED_CATALOG_26_30]
  },
  {
    owner: 't51/canon-30-34',
    canonicalBlocks: ['30-34'],
    catalogSegments: ['SEED_CATALOG_30_34'],
    seeds: SEED_CATALOG_30_34
  },
  {
    owner: 't51/canon-34plus',
    canonicalBlocks: ['34+'],
    catalogSegments: ['SEED_CATALOG_34_PLUS'],
    seeds: SEED_CATALOG_34_PLUS
  }
];

function summarize(group) {
  const seedRows = group.seeds.map(seed => {
    const row = rows.get(seed.id);
    if (!row) throw new Error(`Seed ${seed.id} is missing from ${lifecyclePath}`);
    return row;
  });

  const ids = seedRows.map(seed => seed.id);
  const withoutRuntimeProducer = seedRows.filter(seed => !seed.lifecycle.hasRuntimeProducer).map(seed => seed.id);
  const withoutAnyConsumer = seedRows.filter(seed => !seed.lifecycle.hasConsumer).map(seed => seed.id);
  const withoutExplicitTerminal = seedRows.filter(seed => !seed.lifecycle.hasExplicitTerminalTransition).map(seed => seed.id);
  const openEndedWithoutTerminalTransition = seedRows
    .filter(seed => seed.lifecycle.openEndedWithoutTerminalTransition)
    .map(seed => seed.id);
  const finiteAgeWindow = seedRows.filter(seed => seed.lifecycle.finiteAgeWindow).map(seed => seed.id);
  const originEventsMissing = seedRows
    .filter(seed => seed.originEventsMissing.length > 0)
    .map(seed => ({ id: seed.id, originEventsMissing: seed.originEventsMissing }));
  const declaredReadMismatches = lifecycle.summary.declaredReadMismatches
    .filter(item => ids.includes(item.seedId));

  const noProducerAndNoConsumer = seedRows
    .filter(seed => !seed.lifecycle.hasRuntimeProducer && !seed.lifecycle.hasConsumer)
    .map(seed => seed.id);

  return {
    owner: group.owner,
    canonicalBlocks: group.canonicalBlocks,
    catalogSegments: group.catalogSegments,
    counts: {
      total: ids.length,
      runtimeProduced: ids.length - withoutRuntimeProducer.length,
      withoutRuntimeProducer: withoutRuntimeProducer.length,
      withAnyConsumer: ids.length - withoutAnyConsumer.length,
      withoutAnyConsumer: withoutAnyConsumer.length,
      withExplicitTerminal: ids.length - withoutExplicitTerminal.length,
      withoutExplicitTerminal: withoutExplicitTerminal.length,
      finiteAgeWindow: finiteAgeWindow.length,
      openEndedWithoutTerminalTransition: openEndedWithoutTerminalTransition.length,
      noProducerAndNoConsumer: noProducerAndNoConsumer.length,
      originEventsMissing: originEventsMissing.length,
      declaredReadMismatches: declaredReadMismatches.length
    },
    seeds: ids,
    withoutRuntimeProducer,
    withoutAnyConsumer,
    withoutExplicitTerminal,
    finiteAgeWindow,
    openEndedWithoutTerminalTransition,
    noProducerAndNoConsumer,
    originEventsMissing,
    declaredReadMismatches
  };
}

const ownership = groups.map(summarize);
const assigned = ownership.flatMap(group => group.seeds);
const assignedCounts = new Map();
for (const id of assigned) assignedCounts.set(id, (assignedCounts.get(id) ?? 0) + 1);
const duplicates = [...assignedCounts.entries()].filter(([, count]) => count !== 1).map(([id, count]) => ({ id, count }));
const assignedSet = new Set(assigned);
const unassigned = SEED_CATALOG.map(seed => seed.id).filter(id => !assignedSet.has(id));
const unknownAssigned = assigned.filter(id => !SEED_CATALOG.some(seed => seed.id === id));

const coverage = {
  catalogSeeds: SEED_CATALOG.length,
  assignedEntries: assigned.length,
  assignedUnique: assignedSet.size,
  duplicates,
  unassigned,
  unknownAssigned,
  exactPartition: assigned.length === SEED_CATALOG.length
    && assignedSet.size === SEED_CATALOG.length
    && duplicates.length === 0
    && unassigned.length === 0
    && unknownAssigned.length === 0
};

if (!coverage.exactPartition) {
  throw new Error(`T5.2 handoff ownership is not an exact seed partition: ${JSON.stringify(coverage)}`);
}

const report = {
  task: 'T5.2 canonical handoff',
  generatedAt: new Date().toISOString(),
  source: lifecyclePath,
  principle: 'ownership follows canonical catalog block, not only numeric age at runtime',
  coverage,
  ownership
};

fs.writeFileSync(outputPath, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({
  output: outputPath,
  coverage,
  ownership: ownership.map(group => ({ owner: group.owner, ...group.counts }))
}, null, 2));
