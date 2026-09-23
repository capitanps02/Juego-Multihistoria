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

const playerFacingForbidden = [
  { code: 'internal_callback', pattern: /\bcallback\b/i },
  { code: 'internal_authority', pattern: /\bauthority\b/i },
  { code: 'internal_seed_origin', pattern: /\bseedOrigin\b/i },
  { code: 'internal_state20', pattern: /\bSTATE20_[A-Z0-9_]*\b/ },
  { code: 'internal_nano_shadow', pattern: /\bNANO_SHADOW\b/ },
  { code: 'internal_old_network_favor', pattern: /\bOLD_NETWORK_FAVOR\b/ },
  { code: 'internal_career_offer_type', pattern: /\bCareerOffer\b/ },
  { code: 'internal_factual_copy', pattern: /\bfactual(?:es)?\b/i },
  { code: 'internal_agent_number', pattern: /\bAgent 9\b/i },
  { code: 'internal_a8_label', pattern: /\bA8\b/ },
  { code: 'internal_market_heat', pattern: /\bmarketHeat\b/ },
  { code: 'internal_months_remaining', pattern: /\bmonthsRemaining\b/ },
  { code: 'internal_national_standing', pattern: /\bnationalStanding\b/ },
  { code: 'internal_role_score', pattern: /\broleScore\b/ },
  { code: 'internal_retirement_status', pattern: /\bretirement\.status\b/ },
  { code: 'placeholder_token', pattern: /\b(?:TODO|TBD|PLACEHOLDER|XXX|Lorem)\b/ },
  { code: 'placeholder_copy', pattern: /\b(?:texto pendiente|escena pendiente)\b/i }
];

function playerFacingStrings(event) {
  const rows = [];
  const add = (field, value) => {
    if (typeof value === 'string' && value.trim()) rows.push({ field, value });
  };
  add('text.title', event.text?.title);
  add('text.body', event.text?.body);
  for (const [index, value] of (event.intel?.visible ?? []).entries()) add(`intel.visible[${index}]`, value);
  for (const [index, value] of (event.intel?.uncertain ?? []).entries()) add(`intel.uncertain[${index}]`, value);
  for (const [index, choice] of event.choices.entries()) {
    add(`choices[${index}].label`, choice.label);
    add(`choices[${index}].primaryMessage`, choice.primaryMessage);
    add(`choices[${index}].secondaryMessage`, choice.secondaryMessage);
  }
  for (const [index, outcome] of event.outcomes.entries()) {
    for (const [messageIndex, value] of (outcome.messages ?? []).entries()) {
      add(`outcomes[${index}].messages[${messageIndex}]`, value);
    }
  }
  return rows;
}

function auditPlayerFacingText(event) {
  for (const row of playerFacingStrings(event)) {
    for (const rule of playerFacingForbidden) {
      if (rule.pattern.test(row.value)) {
        hardErrors.push({
          code: 'player_facing_internal_text',
          subtype: rule.code,
          eventId: event.id,
          field: row.field,
          sample: row.value
        });
      }
    }
  }
}

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

for (const event of EVENTS) {
  auditPlayerFacingText(event);
  for (const npcId of event.npcRefs ?? []) if (!npcIds.has(npcId)) hardErrors.push({ code: 'unknown_npc_reference', npcId, owner: event.id });
  for (const seedId of event.seedsRead ?? []) seedRef(seedId, 'read', event.id);
  for (const seedId of event.seedsWrite ?? []) seedRef(seedId, 'write', event.id);
  for (const outcome of event.outcomes) for (const transition of outcome.seedTransitions ?? []) {
    if (!actions.includes(transition.action)) hardErrors.push({ code: 'unknown_seed_action', action: transition.action, eventId: event.id, outcomeId: outcome.id });
    seedRef(transition.seedId, 'transition', event.id, { outcomeId: outcome.id, action: transition.action });
  }
}

const nanoPayoffIds = ['CEVT_23_NANO_02', 'CEVT_27_NANO_01', 'CEVT_34_NANO_DIRECTOR'];
for (const eventId of nanoPayoffIds) {
  const event = EVENTS.find(candidate => candidate.id === eventId);
  if (!event) {
    hardErrors.push({ code: 'nano_payoff_missing', eventId });
    continue;
  }
  if (!event.text?.body?.includes('Nano')) {
    hardErrors.push({ code: 'nano_payoff_not_narrative', eventId });
  }
  if (!(event.npcRefs ?? []).includes('NPC_PLR_14')) {
    hardErrors.push({ code: 'nano_payoff_missing_npc_ref', eventId });
  }
  const labels = event.choices.map(choice => choice.label);
  if (new Set(labels).size !== labels.length) {
    hardErrors.push({ code: 'nano_payoff_duplicate_choices', eventId });
  }
  const outcomeMessages = event.outcomes.flatMap(outcome => outcome.messages ?? []);
  if (outcomeMessages.length < 2 || new Set(outcomeMessages).size < 2) {
    hardErrors.push({ code: 'nano_payoff_generic_outcomes', eventId });
  }
  const effectSignatures = event.outcomes.map(outcome => JSON.stringify(outcome.effects ?? []));
  if (effectSignatures.length > 1 && new Set(effectSignatures).size < 2) {
    hardErrors.push({ code: 'nano_payoff_undifferentiated_effects', eventId });
  }
}


const paulaClosure = EVENTS.find(event => event.id === 'CEVT_30_BODY_01');
if (!paulaClosure || !paulaClosure.text?.body?.includes('Paula')) {
  hardErrors.push({ code: 'paula_post26_resolution_missing', eventId: 'CEVT_30_BODY_01' });
} else {
  const preservesMedicalBoundary = paulaClosure.text.body.includes('sin formar parte de tu equipo médico')
    && (paulaClosure.intel?.visible ?? []).some(value => value.includes('ya no lleva tu recuperación'));
  if (!preservesMedicalBoundary) {
    hardErrors.push({ code: 'paula_post26_boundary_unclear', eventId: 'CEVT_30_BODY_01' });
  }
  const peakLoadGate = (paulaClosure.gates ?? []).some(gate =>
    gate.path === 'flags.HAS_SEED_PEAK_LOAD' && gate.op === 'eq' && gate.value === true
  );
  if (!peakLoadGate) {
    hardErrors.push({ code: 'paula_post26_causality_guard_missing', eventId: 'CEVT_30_BODY_01' });
  }
}

const clara = EVENTS.find(event => event.id === 'CEVT_23_CLARA_03');
if (!clara) {
  hardErrors.push({ code: 'clara_callback_missing', eventId: 'CEVT_23_CLARA_03' });
} else {
  const gates = clara.gates ?? [];
  const hasClaraMemory = gates.some(gate =>
    gate.path === 'flags.HAS_SEED_CLARA_CHANNEL' && gate.op === 'eq' && gate.value === true
  );
  const hasNationalGate = gates.some(gate =>
    gate.path === 'flags.NATIONAL_GATE_OPEN' && gate.op === 'eq' && gate.value === true
  );
  if (!hasClaraMemory || !hasNationalGate) {
    hardErrors.push({
      code: 'clara_callback_guard_regression',
      eventId: 'CEVT_23_CLARA_03',
      hasClaraMemory,
      hasNationalGate
    });
  }
}

for (const seed of SEED_CATALOG) {
  for (const npcId of seed.npcRefs ?? []) if (!npcIds.has(npcId)) hardErrors.push({ code: 'unknown_npc_reference', npcId, owner: seed.id });
}

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
  gate: 'T5-content',
  generatedAt: new Date().toISOString(),
  inventory: { events: EVENTS.length, seeds: SEED_CATALOG.length, npcs: NPC_CATALOG.length },
  metrics: {
    seedsWithReader: rows.filter(row => row.readers.length > 0).length,
    seedsWithWriter: rows.filter(row => row.writers.length > 0).length,
    seedsWithTerminalConsumer: rows.filter(row => row.terminalConsumers.length > 0).length,
    seedsWithoutReader: rows.filter(row => row.readers.length === 0).map(row => row.id),
    seedsWithoutWriter: rows.filter(row => row.writers.length === 0).map(row => row.id),
    seedsWithoutTerminalConsumer: rows.filter(row => row.terminalConsumers.length === 0).map(row => row.id),
    originsMissingFromInventory: rows.filter(row => row.originsMissingFromInventory.length > 0).map(row => ({ id: row.id, origins: row.originsMissingFromInventory }))
  },
  hardErrors,
  rows
};

if (process.env.T5_QA_OUTPUT) fs.writeFileSync(process.env.T5_QA_OUTPUT, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ gate: report.gate, inventory: report.inventory, metrics: {
  seedsWithReader: report.metrics.seedsWithReader,
  seedsWithWriter: report.metrics.seedsWithWriter,
  seedsWithTerminalConsumer: report.metrics.seedsWithTerminalConsumer,
  seedsWithoutReader: report.metrics.seedsWithoutReader.length,
  seedsWithoutWriter: report.metrics.seedsWithoutWriter.length,
  seedsWithoutTerminalConsumer: report.metrics.seedsWithoutTerminalConsumer.length,
  originsMissingFromInventory: report.metrics.originsMissingFromInventory.length
}, hardErrors }, null, 2));
if (hardErrors.length) process.exitCode = 1;
