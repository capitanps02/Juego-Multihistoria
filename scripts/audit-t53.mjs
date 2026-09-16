import { NPC_EVENT_KNOWLEDGE_RULES } from '../dist/catalog/npc-knowledge-rules.js';
import { NPC_CATALOG } from '../dist/catalog/npcs.js';
import { SEED_CATALOG } from '../dist/catalog/seeds.js';
import { EVENTS } from '../dist/content/events/index.js';

const npcIds = new Set(NPC_CATALOG.map(npc => npc.id));
const eventIds = new Set(EVENTS.map(event => event.id));
const eventById = new Map(EVENTS.map(event => [event.id, event]));

const unknownEventNpcRefs = [];
for (const event of EVENTS) {
  for (const npcId of event.npcRefs ?? []) if (!npcIds.has(npcId)) unknownEventNpcRefs.push(`${event.id}:${npcId}`);
}

const unknownSeedNpcRefs = [];
for (const seed of SEED_CATALOG) {
  for (const npcId of seed.npcRefs ?? []) if (!npcIds.has(npcId)) unknownSeedNpcRefs.push(`${seed.id}:${npcId}`);
}

const invalidKnowledgeRules = [];
for (const rule of NPC_EVENT_KNOWLEDGE_RULES) {
  const event = eventById.get(rule.eventId);
  if (!eventIds.has(rule.eventId) || !event) {
    invalidKnowledgeRules.push(`${rule.eventId}:unknown-event`);
    continue;
  }
  for (const npcId of rule.npcIds) if (!npcIds.has(npcId)) invalidKnowledgeRules.push(`${rule.eventId}:${npcId}:unknown-npc`);
  for (const choiceId of rule.choiceIds ?? []) {
    if (!event.choices.some(choice => choice.id === choiceId)) invalidKnowledgeRules.push(`${rule.eventId}:${choiceId}:unknown-choice`);
  }
  for (const outcomeId of rule.outcomeIds ?? []) {
    if (!event.outcomes.some(outcome => outcome.id === outcomeId)) invalidKnowledgeRules.push(`${rule.eventId}:${outcomeId}:unknown-outcome`);
  }
}

const npcs = NPC_CATALOG.map(npc => ({
  id: npc.id,
  name: npc.name,
  role: npc.role,
  initialClub: npc.initialClub,
  eventIds: EVENTS.filter(event => event.npcRefs?.includes(npc.id)).map(event => event.id),
  seedIds: SEED_CATALOG.filter(seed => seed.npcRefs?.includes(npc.id)).map(seed => seed.id),
  knowledgeRuleEvents: [...new Set(NPC_EVENT_KNOWLEDGE_RULES.filter(rule => rule.npcIds.includes(npc.id)).map(rule => rule.eventId))]
}));

const unreferencedNpcIds = npcs.filter(npc => npc.eventIds.length === 0 && npc.seedIds.length === 0).map(npc => npc.id);
const report = {
  workstream: 'T5.3',
  source: 'runtime catalogs after TypeScript build',
  npcCount: NPC_CATALOG.length,
  eventCount: EVENTS.length,
  seedCount: SEED_CATALOG.length,
  knowledgeRuleCount: NPC_EVENT_KNOWLEDGE_RULES.length,
  unknownEventNpcRefs,
  unknownSeedNpcRefs,
  invalidKnowledgeRules,
  unreferencedNpcIds,
  npcs,
  passed: NPC_CATALOG.length === 20 && unknownEventNpcRefs.length === 0 && unknownSeedNpcRefs.length === 0 && invalidKnowledgeRules.length === 0
};

console.log(JSON.stringify(report, null, 2));
if (process.argv.includes('--check') && !report.passed) process.exitCode = 1;
