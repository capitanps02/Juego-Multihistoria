import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EVENTS } from '../dist/content/events/index.js';
import { SEED_CATALOG } from '../dist/catalog/seeds.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const actions = ['create', 'activate', 'intensify', 'transform', 'resolve', 'expire'];
const seedIds = new Set(SEED_CATALOG.map(seed => seed.id));
const eventIds = new Set(EVENTS.map(event => event.id));
const maps = new Map(SEED_CATALOG.map(seed => [seed.id, {
  id: seed.id,
  ageWindow: seed.ageWindow,
  originEvents: seed.originEvents,
  originEventsMissing: seed.originEvents.filter(id => !eventIds.has(id)),
  readBy: [],
  writeBy: [],
  transitions: Object.fromEntries(actions.map(action => [action, []]))
}]));
const unknownRefs = [];
const transitionRows = [];

function addRef(seedId, kind, eventId, detail = {}) {
  if (!seedIds.has(seedId)) {
    unknownRefs.push({ seedId, kind, eventId, ...detail });
    return;
  }
  const row = maps.get(seedId);
  if (kind === 'read') row.readBy.push(eventId);
  if (kind === 'write') row.writeBy.push(eventId);
  if (kind === 'transition') row.transitions[detail.action].push({ eventId, outcomeId: detail.outcomeId });
}

for (const event of EVENTS) {
  for (const seedId of event.seedsRead ?? []) addRef(seedId, 'read', event.id);
  for (const seedId of event.seedsWrite ?? []) addRef(seedId, 'write', event.id);
  for (const outcome of event.outcomes) {
    for (const transition of outcome.seedTransitions ?? []) {
      const row = { eventId: event.id, outcomeId: outcome.id, seedId: transition.seedId, action: transition.action };
      transitionRows.push(row);
      addRef(transition.seedId, 'transition', event.id, { outcomeId: outcome.id, action: transition.action });
    }
  }
}

const dedupe = values => [...new Set(values)];
const seeds = [...maps.values()].map(row => ({
  ...row,
  readBy: dedupe(row.readBy),
  writeBy: dedupe(row.writeBy),
  transitions: Object.fromEntries(actions.map(action => [action, row.transitions[action]]))
}));
const summary = {
  catalogSeeds: SEED_CATALOG.length,
  uniqueCatalogSeeds: seedIds.size,
  eventCount: EVENTS.length,
  principalEvents: EVENTS.filter(event => event.family !== 'conditional').length,
  conditionalEvents: EVENTS.filter(event => event.family === 'conditional').length,
  declaredReaders: seeds.filter(seed => seed.readBy.length > 0).length,
  declaredWriters: seeds.filter(seed => seed.writeBy.length > 0).length,
  transitionSeeds: seeds.filter(seed => actions.some(action => seed.transitions[action].length > 0)).length,
  explicitExpiryDefinitions: 0,
  expireTransitions: transitionRows.filter(row => row.action === 'expire').length,
  resolveTransitions: transitionRows.filter(row => row.action === 'resolve').length,
  transitionCounts: Object.fromEntries(actions.map(action => [action, transitionRows.filter(row => row.action === action).length])),
  seedsWithoutDeclaredReader: seeds.filter(seed => seed.readBy.length === 0).map(seed => seed.id),
  seedsWithoutDeclaredWriter: seeds.filter(seed => seed.writeBy.length === 0).map(seed => seed.id),
  seedsWithoutRuntimeTransition: seeds.filter(seed => !actions.some(action => seed.transitions[action].length > 0)).map(seed => seed.id),
  originsMissingFromEventInventory: seeds.filter(seed => seed.originEventsMissing.length > 0).map(seed => ({ id: seed.id, originEventsMissing: seed.originEventsMissing })),
  unknownReferences: unknownRefs,
  lifecycleGaps: {
    expiryPolicy: 'missing',
    expiryAssignment: 'missing',
    dailyExpirySweep: 'missing',
    resolvedOrExpiredRecreationPolicy: 'implicit_recreate_on_create'
  }
};
const report = {
  task: 'T5.2',
  generatedAt: new Date().toISOString(),
  scope: 'auditoria estática de consumidores, escritores y transiciones de semillas',
  summary,
  seeds,
  rules: {
    noUnknownReferences: unknownRefs.length === 0,
    noSilentLifecycleClaims: true,
    expiryRequiresExplicitDate: true,
    terminalStatesAreResolvedOrExpired: true
  }
};

const output = path.join(root, 'analysis/2026-09-15/T5.2-seed-lifecycle.json');
fs.writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ output, ...summary }, null, 2));
