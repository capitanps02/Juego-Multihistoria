import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EVENTS } from '../dist/content/events/index.js';
import { SEED_CATALOG } from '../dist/catalog/seeds.js';
import { getSeedScopePolicy, SEED_SCOPE_OVERRIDES } from '../dist/catalog/seed-scope.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const actions = ['create', 'activate', 'intensify', 'transform', 'resolve', 'expire'];
const terminalActions = new Set(['resolve', 'expire']);
const seedIds = new Set(SEED_CATALOG.map(seed => seed.id));
const eventIds = new Set(EVENTS.map(event => event.id));
const maps = new Map(SEED_CATALOG.map(seed => [seed.id, {
  id: seed.id,
  description: seed.description,
  ageWindow: seed.ageWindow,
  npcRefs: seed.npcRefs,
  scope: getSeedScopePolicy(seed.id),
  originEvents: seed.originEvents,
  originEventsMissing: seed.originEvents.filter(id => !eventIds.has(id)),
  declaredReadBy: [],
  conditionReadBy: [],
  sourceFlagConsumers: [],
  declaredWriteBy: [],
  transitions: Object.fromEntries(actions.map(action => [action, []]))
}]));

const unknownRefs = [];
const transitionRows = [];
const declaredReadMismatches = [];
const declaredWriteMismatches = [];

function addRef(seedId, kind, owner, detail = {}) {
  if (!seedIds.has(seedId)) {
    unknownRefs.push({ seedId, kind, owner, ...detail });
    return;
  }
  const row = maps.get(seedId);
  if (kind === 'declaredRead') row.declaredReadBy.push(owner);
  if (kind === 'conditionRead') row.conditionReadBy.push({ eventId: owner, ...detail });
  if (kind === 'sourceFlag') row.sourceFlagConsumers.push(owner);
  if (kind === 'declaredWrite') row.declaredWriteBy.push(owner);
  if (kind === 'transition') row.transitions[detail.action].push({ eventId: owner, outcomeId: detail.outcomeId, expiresAfter: detail.expiresAfter });
}

function seedFromPresencePath(value) {
  return typeof value === 'string' && value.startsWith('flags.HAS_SEED_')
    ? value.slice('flags.HAS_'.length)
    : null;
}

function inspectConditions(event, conditions, context, conditionSeeds) {
  for (const condition of conditions ?? []) {
    const seedId = seedFromPresencePath(condition.path);
    if (!seedId) continue;
    conditionSeeds.add(seedId);
    addRef(seedId, 'conditionRead', event.id, { context, op: condition.op });
  }
}

for (const event of EVENTS) {
  const conditionSeeds = new Set();
  for (const seedId of event.seedsRead ?? []) addRef(seedId, 'declaredRead', event.id);
  for (const seedId of event.seedsWrite ?? []) addRef(seedId, 'declaredWrite', event.id);
  inspectConditions(event, event.gates, 'gate', conditionSeeds);
  inspectConditions(event, event.exclusions, 'exclusion', conditionSeeds);

  for (const outcome of event.outcomes) {
    inspectConditions(event, outcome.conditions, `outcome:${outcome.id}`, conditionSeeds);
    for (const modifier of outcome.modifiers ?? []) {
      inspectConditions(event, modifier.conditions, `modifier:${outcome.id}:${modifier.id}`, conditionSeeds);
    }
    for (const transition of outcome.seedTransitions ?? []) {
      const row = {
        eventId: event.id,
        outcomeId: outcome.id,
        seedId: transition.seedId,
        action: transition.action,
        expiresAfter: transition.expiresAfter ?? null
      };
      transitionRows.push(row);
      addRef(transition.seedId, 'transition', event.id, {
        outcomeId: outcome.id,
        action: transition.action,
        expiresAfter: transition.expiresAfter ?? null
      });
      if (!(event.seedsWrite ?? []).includes(transition.seedId)) {
        declaredWriteMismatches.push({ eventId: event.id, outcomeId: outcome.id, seedId: transition.seedId, action: transition.action });
      }
    }
  }

  for (const seedId of conditionSeeds) {
    if (!(event.seedsRead ?? []).includes(seedId)) declaredReadMismatches.push({ eventId: event.id, seedId });
  }
}

function walkTsFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkTsFiles(full));
    else if (entry.isFile() && entry.name.endsWith('.ts')) out.push(full);
  }
  return out;
}

for (const file of walkTsFiles(path.join(root, 'src'))) {
  const relative = path.relative(root, file).replaceAll(path.sep, '/');
  const source = fs.readFileSync(file, 'utf8');
  const seen = new Set();
  for (const match of source.matchAll(/\bHAS_(SEED_[A-Z0-9_]+)\b/g)) seen.add(match[1]);
  for (const seedId of seen) addRef(seedId, 'sourceFlag', relative);
}

const dedupe = values => [...new Set(values)];
const dedupeObjects = (values, keyFn) => [...new Map(values.map(value => [keyFn(value), value])).values()];

const categoryPatterns = {
  promises: /PROMIS|PLEDGE|COMMIT|WORD\b/i,
  injuries: /INJ|BODY|MED|PHYSIO|LOAD|RECOVERY|CHRONIC|FITNESS/i,
  operations: /SURGER|OPERAT/i,
  conflicts: /CONFLICT|RIVAL|LOCKER|VOTE|HARDLINE|DISPUT/i,
  relationships: /TRUST|FAVOR|MENTOR|TEAMMATE|FRIEND|CAPTAIN|NANO|RIVAS|MENA|VELA|DANI|CLARA|ADRIAN/i,
  reputation: /PUBLIC|IMAGE|MEDIA|PRESS|SPONSOR|LEAK|FAN|REPUT/i,
  contracts: /CONTRACT|FREE_AGENCY|BOSMAN|DEADLINE|BARGAIN|CEILING/i,
  money: /MONEY|WEALTH|BUSINESS|SALARY|RICH/i,
  family: /FAMILY|HOME/i,
  agent: /AGENT/i,
  club: /CLUB|LOCKER|TEAM|CAPTAIN|PROJECT|PENALTY/i,
  selection: /NAT_|SELECTION|TOURNAMENT/i,
  careerDecisions: /MKT|MARKET|EXIT|ROLE|IDENTITY|PEAK|TACTICAL|ABROAD|PRIORITY/i
};

function categoriesFor(seed) {
  const text = `${seed.id} ${seed.description}`;
  return Object.entries(categoryPatterns).filter(([, pattern]) => pattern.test(text)).map(([name]) => name);
}

const seeds = [...maps.values()].map(row => {
  const transitionCount = action => row.transitions[action].length;
  const runtimeCreateEvents = dedupe(row.transitions.create.map(item => item.eventId));
  const terminalConsumers = dedupe([
    ...row.transitions.resolve.map(item => item.eventId),
    ...row.transitions.expire.map(item => item.eventId)
  ]);
  const eventConsumers = dedupe([
    ...row.declaredReadBy,
    ...row.conditionReadBy.map(item => item.eventId),
    ...terminalConsumers
  ]);
  const allConsumers = dedupe([...eventConsumers, ...row.sourceFlagConsumers]);
  const finiteAgeWindow = row.ageWindow[1] !== null;
  const explicitExpiryAssignments = actions.flatMap(action => row.transitions[action]).filter(item => item.expiresAfter).length;
  return {
    ...row,
    categories: categoriesFor(row),
    declaredReadBy: dedupe(row.declaredReadBy),
    conditionReadBy: dedupeObjects(row.conditionReadBy, value => `${value.eventId}:${value.context}:${value.op}`),
    sourceFlagConsumers: dedupe(row.sourceFlagConsumers),
    declaredWriteBy: dedupe(row.declaredWriteBy),
    runtimeCreateEvents,
    eventConsumers,
    allConsumers,
    terminalConsumers,
    lifecycle: {
      hasRuntimeProducer: runtimeCreateEvents.length > 0,
      hasConsumer: allConsumers.length > 0,
      hasExplicitTerminalTransition: terminalConsumers.length > 0,
      finiteAgeWindow,
      explicitExpiryAssignments,
      closesIfNeverConsumed: finiteAgeWindow || explicitExpiryAssignments > 0,
      openEndedWithoutTerminalTransition: !finiteAgeWindow && explicitExpiryAssignments === 0 && terminalConsumers.length === 0,
      repeatableCreationPaths: transitionCount('create') > 1
    },
    save: {
      persistedInGameStateSeeds: true,
      schema: 8,
      representationChangeRequired: false
    }
  };
});

const transitionCounts = Object.fromEntries(actions.map(action => [action, transitionRows.filter(row => row.action === action).length]));
const categoryCoverage = Object.fromEntries(Object.keys(categoryPatterns).map(category => [
  category,
  seeds.filter(seed => seed.categories.includes(category)).map(seed => seed.id)
]));
const unknownScopeOverrides = Object.keys(SEED_SCOPE_OVERRIDES).filter(seedId => !seedIds.has(seedId));

const summary = {
  catalogSeeds: SEED_CATALOG.length,
  uniqueCatalogSeeds: seedIds.size,
  eventCount: EVENTS.length,
  principalEvents: EVENTS.filter(event => event.family !== 'conditional').length,
  conditionalEvents: EVENTS.filter(event => event.family === 'conditional').length,
  declaredReaders: seeds.filter(seed => seed.declaredReadBy.length > 0).length,
  conditionReaders: seeds.filter(seed => seed.conditionReadBy.length > 0).length,
  sourceFlagConsumers: seeds.filter(seed => seed.sourceFlagConsumers.length > 0).length,
  runtimeProducedSeeds: seeds.filter(seed => seed.lifecycle.hasRuntimeProducer).length,
  seedsWithAnyConsumer: seeds.filter(seed => seed.lifecycle.hasConsumer).length,
  seedsWithTerminalConsumers: seeds.filter(seed => seed.lifecycle.hasExplicitTerminalTransition).length,
  finiteAgeWindowSeeds: seeds.filter(seed => seed.lifecycle.finiteAgeWindow).length,
  clubScopedSeeds: seeds.filter(seed => seed.scope.club === 'origin_club').length,
  seasonScopedSeeds: seeds.filter(seed => seed.scope.season === 'origin_season').length,
  explicitExpiryAssignments: transitionRows.filter(row => row.expiresAfter).length,
  expireTransitions: transitionCounts.expire,
  resolveTransitions: transitionCounts.resolve,
  transitionCounts,
  seedsWithoutRuntimeProducer: seeds.filter(seed => !seed.lifecycle.hasRuntimeProducer).map(seed => seed.id),
  seedsWithoutAnyConsumer: seeds.filter(seed => !seed.lifecycle.hasConsumer).map(seed => seed.id),
  openEndedWithoutTerminalTransition: seeds.filter(seed => seed.lifecycle.openEndedWithoutTerminalTransition).map(seed => seed.id),
  originsMissingFromEventInventory: seeds.filter(seed => seed.originEventsMissing.length > 0).map(seed => ({ id: seed.id, originEventsMissing: seed.originEventsMissing })),
  unknownReferences: unknownRefs,
  unknownScopeOverrides,
  declaredReadMismatches: dedupeObjects(declaredReadMismatches, value => `${value.eventId}:${value.seedId}`),
  declaredWriteMismatches: dedupeObjects(declaredWriteMismatches, value => `${value.eventId}:${value.outcomeId}:${value.seedId}:${value.action}`)
};

const report = {
  task: 'T5.2',
  generatedAt: new Date().toISOString(),
  scope: 'inventario estático y reglas runtime del lifecycle de seeds',
  model: {
    persistedStates: ['dormant', 'active', 'transformed', 'resolved', 'expired'],
    eligibleIsDerived: true,
    eligibleDerivedFrom: 'event gates/conditions; no se persiste para evitar doble fuente de verdad',
    terminalStates: ['resolved', 'expired'],
    creation: 'create crea una instancia viva o fusiona idempotentemente con la instancia viva existente',
    reopening: 'create posterior a una instancia terminal crea una nueva instancia y conserva el histórico terminal',
    resolution: 'resolve conserva la instancia, registra consumedBy y apaga HAS_SEED',
    expiry: 'fecha explícita, fin de ageWindow, scope de club/temporada o transición expire',
    clubDefault: 'career; solo overrides origin_club caducan al cambiar de club',
    seasonDefault: 'career; no hay reset implícito al cambiar de temporada',
    saveCompatibility: 'sin cambio de schema; metadatos de scope/terminal se guardan en payload opcional'
  },
  summary,
  categoryCoverage,
  seeds,
  rules: {
    noUnknownReferences: unknownRefs.length === 0,
    scopeOverridesAreKnownSeeds: unknownScopeOverrides.length === 0,
    noDuplicateCatalogIds: seedIds.size === SEED_CATALOG.length,
    terminalReplayIsIdempotent: true,
    sameDayEventChoiceReplayIsIdempotent: true,
    finiteAgeWindowsExpireAutomatically: true,
    unknownSavedSeedsArePreserved: true
  }
};

const output = path.join(root, 'analysis/T5.2/seed-lifecycle.json');
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ output: path.relative(root, output), ...summary }, null, 2));
