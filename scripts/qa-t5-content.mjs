import fs from 'node:fs';
import { EVENTS } from '../dist/content/events/index.js';
import { SEED_CATALOG } from '../dist/catalog/seeds.js';
import { NPC_CATALOG } from '../dist/catalog/npcs.js';

const actions = ['create', 'activate', 'intensify', 'transform', 'resolve', 'expire'];
const eventIds = new Set(EVENTS.map(event => event.id));
const seedIds = new Set(SEED_CATALOG.map(seed => seed.id));
const npcIds = new Set(NPC_CATALOG.map(npc => npc.id));
const refs = new Map(SEED_CATALOG.map(seed => [seed.id, { readers: new Set(), writers: new Set(), terminal: new Set(), transitions: [] }]));
const hardErrors = [];
const readDebtBaseline = JSON.parse(fs.readFileSync('qa/fixtures/t5-seed-read-debt.json', 'utf8'));
const debtKey = row => `${row.eventId}:${row.seedId}`;
const allowedReadDebt = new Set(readDebtBaseline.allowed.map(debtKey));
const actualReadDebt = new Map();

if (eventIds.size !== EVENTS.length) hardErrors.push({ code: 'duplicate_event_id', count: EVENTS.length - eventIds.size });
if (seedIds.size !== SEED_CATALOG.length) hardErrors.push({ code: 'duplicate_seed_id', count: SEED_CATALOG.length - seedIds.size });
if (npcIds.size !== NPC_CATALOG.length) hardErrors.push({ code: 'duplicate_npc_id', count: NPC_CATALOG.length - npcIds.size });

function seedRef(seedId, kind, eventId, detail = {}) {
  const row = refs.get(seedId);
  if (!row) {
    hardErrors.push({ code: 'unknown_seed_reference', seedId, kind, eventId, ...detail });
    return;
  }
  if (kind === 'read') row.readers.add(eventId);
  if (kind === 'write') row.writers.add(eventId);
  if (kind === 'transition') {
    row.transitions.push({ eventId, ...detail });
    if (detail.action === 'resolve' || detail.action === 'expire') row.terminal.add(eventId);
  }
}

function seedFromPresencePath(value) {
  return typeof value === 'string' && value.startsWith('flags.HAS_SEED_') ? value.slice('flags.HAS_'.length) : null;
}
function inspectReadConditions(event, conditions, context) {
  for (const condition of conditions ?? []) {
    const seedId = seedFromPresencePath(condition.path);
    if (!seedId || (event.seedsRead ?? []).includes(seedId)) continue;
    const row = { eventId: event.id, seedId, context };
    actualReadDebt.set(debtKey(row), row);
  }
}

for (const event of EVENTS) {
  for (const npcId of event.npcRefs ?? []) if (!npcIds.has(npcId)) hardErrors.push({ code: 'unknown_npc_reference', npcId, owner: event.id });
  for (const seedId of event.seedsRead ?? []) seedRef(seedId, 'read', event.id);
  for (const seedId of event.seedsWrite ?? []) seedRef(seedId, 'write', event.id);
  inspectReadConditions(event, event.gates, 'gate');
  inspectReadConditions(event, event.exclusions, 'exclusion');
  for (const [routeIndex, route] of (event.gateAlternatives ?? []).entries()) inspectReadConditions(event, route, `gateAlternative:${routeIndex}`);
  for (const choice of event.choices ?? []) inspectReadConditions(event, choice.eligibility, `choiceEligibility:${choice.id}`);
  for (const outcome of event.outcomes) {
    inspectReadConditions(event, outcome.conditions, `outcome:${outcome.id}`);
    for (const modifier of outcome.modifiers ?? []) inspectReadConditions(event, modifier.conditions, `modifier:${outcome.id}:${modifier.id}`);
    for (const transition of outcome.seedTransitions ?? []) {
      if (!actions.includes(transition.action)) hardErrors.push({ code: 'unknown_seed_action', action: transition.action, eventId: event.id, outcomeId: outcome.id });
      seedRef(transition.seedId, 'transition', event.id, { outcomeId: outcome.id, action: transition.action });
    }
  }
}
for (const seed of SEED_CATALOG) for (const npcId of seed.npcRefs ?? []) if (!npcIds.has(npcId)) hardErrors.push({ code: 'unknown_npc_reference', npcId, owner: seed.id });

const currentReadDebt = [...actualReadDebt.values()].sort((a, b) => debtKey(a).localeCompare(debtKey(b)));
const newReadDebt = currentReadDebt.filter(row => !allowedReadDebt.has(debtKey(row)));
const resolvedReadDebt = readDebtBaseline.allowed.filter(row => !actualReadDebt.has(debtKey(row)));
for (const row of newReadDebt) hardErrors.push({ code: 'new_declared_seed_read_mismatch', ...row });

const rows = SEED_CATALOG.map(seed => {
  const row = refs.get(seed.id);
  return {
    id: seed.id,
    readers: [...row.readers],
    writers: [...row.writers],
    terminalConsumers: [...row.terminal],
    transitionCounts: Object.fromEntries(actions.map(action => [action, row.transitions.filter(t => t.action === action).length])),
    originsMissingFromInventory: seed.originEvents.filter(id => !eventIds.has(id))
  };
});
const report = {
  gate: 'T5-content', generatedAt: new Date().toISOString(), inventory: { events: EVENTS.length, seeds: SEED_CATALOG.length, npcs: NPC_CATALOG.length },
  metrics: {
    seedsWithReader: rows.filter(row => row.readers.length > 0).length,
    seedsWithWriter: rows.filter(row => row.writers.length > 0).length,
    seedsWithTerminalConsumer: rows.filter(row => row.terminalConsumers.length > 0).length,
    seedsWithoutReader: rows.filter(row => row.readers.length === 0).map(row => row.id),
    seedsWithoutWriter: rows.filter(row => row.writers.length === 0).map(row => row.id),
    seedsWithoutTerminalConsumer: rows.filter(row => row.terminalConsumers.length === 0).map(row => row.id),
    originsMissingFromInventory: rows.filter(row => row.originsMissingFromInventory.length > 0).map(row => ({ id: row.id, origins: row.originsMissingFromInventory })),
    declaredReadDebt: { baseline: readDebtBaseline.allowed.length, current: currentReadDebt.length, resolved: resolvedReadDebt.length, new: newReadDebt.length, currentRows: currentReadDebt, resolvedRows: resolvedReadDebt, newRows: newReadDebt }
  }, hardErrors, rows
};
if (process.env.T5_QA_OUTPUT) fs.writeFileSync(process.env.T5_QA_OUTPUT, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ gate: report.gate, inventory: report.inventory, metrics: {
  seedsWithReader: report.metrics.seedsWithReader, seedsWithWriter: report.metrics.seedsWithWriter,
  seedsWithTerminalConsumer: report.metrics.seedsWithTerminalConsumer,
  seedsWithoutReader: report.metrics.seedsWithoutReader.length, seedsWithoutWriter: report.metrics.seedsWithoutWriter.length,
  seedsWithoutTerminalConsumer: report.metrics.seedsWithoutTerminalConsumer.length,
  originsMissingFromInventory: report.metrics.originsMissingFromInventory.length,
  declaredReadDebt: { baseline: report.metrics.declaredReadDebt.baseline, current: report.metrics.declaredReadDebt.current, resolved: report.metrics.declaredReadDebt.resolved, new: report.metrics.declaredReadDebt.new, newRows: report.metrics.declaredReadDebt.newRows }
}, hardErrors }, null, 2));
if (hardErrors.length) process.exitCode = 1;
