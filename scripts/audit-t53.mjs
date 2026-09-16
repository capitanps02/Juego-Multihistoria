import {
  NPC_EVENT_KNOWLEDGE_REQUIREMENTS,
  NPC_EVENT_KNOWLEDGE_RULES
} from '../dist/catalog/npc-knowledge-rules.js';
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
  const declaredRefs = new Set(event.npcRefs ?? []);
  for (const npcId of rule.npcIds) {
    if (!npcIds.has(npcId)) invalidKnowledgeRules.push(`${rule.eventId}:${npcId}:unknown-npc`);
    else if (!declaredRefs.has(npcId)) invalidKnowledgeRules.push(`${rule.eventId}:${npcId}:knowledge-target-not-in-npcRefs`);
  }
  for (const choiceId of rule.choiceIds ?? []) {
    if (!event.choices.some(choice => choice.id === choiceId)) invalidKnowledgeRules.push(`${rule.eventId}:${choiceId}:unknown-choice`);
  }
  for (const outcomeId of rule.outcomeIds ?? []) {
    if (!event.outcomes.some(outcome => outcome.id === outcomeId)) invalidKnowledgeRules.push(`${rule.eventId}:${outcomeId}:unknown-outcome`);
  }
}

const invalidKnowledgeRequirements = [];
for (const requirement of NPC_EVENT_KNOWLEDGE_REQUIREMENTS) {
  const callback = eventById.get(requirement.eventId);
  if (!callback) invalidKnowledgeRequirements.push(`${requirement.eventId}:unknown-callback`);
  if (!npcIds.has(requirement.npcId)) invalidKnowledgeRequirements.push(`${requirement.eventId}:${requirement.npcId}:unknown-npc`);
  else if (callback && !(callback.npcRefs ?? []).includes(requirement.npcId)) {
    invalidKnowledgeRequirements.push(`${requirement.eventId}:${requirement.npcId}:required-npc-not-in-npcRefs`);
  }
  if (!eventIds.has(requirement.factId)) invalidKnowledgeRequirements.push(`${requirement.eventId}:${requirement.factId}:unknown-fact-event`);
}

function hasKnowledgeRule(eventId, choiceId, outcomeId, npcId) {
  return NPC_EVENT_KNOWLEDGE_RULES.some(rule =>
    rule.eventId === eventId &&
    rule.npcIds.includes(npcId) &&
    (!rule.choiceIds || rule.choiceIds.includes(choiceId)) &&
    (!rule.outcomeIds || rule.outcomeIds.includes(outcomeId))
  );
}

function hasAnyKnowledgeRuleForOutcomeTarget(event, outcome, npcId) {
  const choices = event.choices.filter(choice => choice.outcomeIds.includes(outcome.id));
  return choices.some(choice => hasKnowledgeRule(event.id, choice.id, outcome.id, npcId));
}

function hasKnowledgeRequirement(eventId, npcId) {
  return NPC_EVENT_KNOWLEDGE_REQUIREMENTS.some(rule => rule.eventId === eventId && rule.npcId === npcId);
}

// Narrow anti-omniscience lint: when copy explicitly says an NPC discovers,
// remembers, knows, detects, forgets or keeps a memory and that same outcome
// changes their relationship, the runtime must record a knowledge path.
const epistemicCopy = /\b(descubre|descubren|recuerda|recuerdan|sabe|sabía|conocía|detecta|detectan|memoria|olvida|olvidan)\b/i;
const reviewedEpistemicExceptions = new Map([
  [
    'EVT_19_AGENT_001:AUDIT:AUDIT__SECONDARY:NPC_AGT_01',
    'La revisión descubre más lagunas para el protagonista; el texto no afirma que el agente adquiera información nueva.'
  ]
]);
const epistemicRelationshipGaps = [];
const appliedEpistemicExceptions = [];
for (const event of EVENTS) {
  for (const outcome of event.outcomes) {
    if (!epistemicCopy.test((outcome.messages ?? []).join(' '))) continue;
    const choiceId = event.choices.find(choice => choice.outcomeIds.includes(outcome.id))?.id;
    if (!choiceId) continue;
    const targets = new Set(
      (outcome.effects ?? [])
        .filter(effect => effect.kind === 'numeric' && effect.path.startsWith('rel.NPC_'))
        .map(effect => effect.path.split('.')[1])
        .filter(Boolean)
    );
    for (const npcId of targets) {
      if (hasKnowledgeRule(event.id, choiceId, outcome.id, npcId)) continue;
      const key = `${event.id}:${choiceId}:${outcome.id}:${npcId}`;
      const reason = reviewedEpistemicExceptions.get(key);
      if (reason) appliedEpistemicExceptions.push({ key, reason });
      else epistemicRelationshipGaps.push(key);
    }
  }
}

const staleEpistemicExceptions = [...reviewedEpistemicExceptions.keys()].filter(
  key => !appliedEpistemicExceptions.some(exception => exception.key === key)
);

// Callback-level lint. We only infer the reacting NPC when the event is
// conditional and has exactly one npcRef; this deliberately avoids guessing
// among multi-NPC scenes or technical_adaptation rows without npcRefs.
const callbackEpistemicCopy = /\b(descubre|recuerda|sabe|conoce|detecta)\b|\bse entera\b/i;
const epistemicCallbackGaps = [];
for (const event of EVENTS) {
  const refs = event.npcRefs ?? [];
  if (event.family !== 'conditional' || refs.length !== 1) continue;
  const copy = [event.text?.title, event.text?.body, ...(event.intel?.visible ?? [])].filter(Boolean).join(' ');
  if (!callbackEpistemicCopy.test(copy)) continue;
  const npcId = refs[0];
  if (!hasKnowledgeRequirement(event.id, npcId)) epistemicCallbackGaps.push(`${event.id}:${npcId}`);
}

// Structural coverage metric: changing an NPC relationship while omitting that
// NPC from the event refs is suspicious, but not automatically an epistemic bug.
// It remains non-blocking because institutional/indirect consequences can be
// legitimate and the content owner must decide whether the NPC was present,
// informed later, or should not receive the relational effect at all.
const relationshipOutcomeTargets = [];
const relationshipEffectTargetsMissingRefs = [];
for (const event of EVENTS) {
  const refs = new Set(event.npcRefs ?? []);
  for (const outcome of event.outcomes) {
    const targetAxes = new Map();
    for (const effect of outcome.effects ?? []) {
      if (effect.kind !== 'numeric' || !effect.path.startsWith('rel.NPC_')) continue;
      const [, npcId, axis] = effect.path.split('.');
      if (!npcId || !axis) continue;
      const axes = targetAxes.get(npcId) ?? new Set();
      axes.add(axis);
      targetAxes.set(npcId, axes);
    }
    for (const [npcId, axes] of targetAxes) {
      const row = {
        eventId: event.id,
        outcomeId: outcome.id,
        npcId,
        axes: [...axes].sort(),
        declaredNpcRef: refs.has(npcId),
        explicitKnowledgeRule: hasAnyKnowledgeRuleForOutcomeTarget(event, outcome, npcId),
        canonStatus: event.canonStatus ?? null
      };
      relationshipOutcomeTargets.push(row);
      if (npcIds.has(npcId) && !row.declaredNpcRef) relationshipEffectTargetsMissingRefs.push(row);
    }
  }
}

// Cross-workstream debt detector. Some callbacks name a persistent NPC in
// visible copy but do not declare that NPC in `npcRefs`. Without the ref T5.3
// cannot safely infer identity or attach a knowledge gate. This is reported but
// deliberately does not fail T5.3: fixing content belongs to canonical
// reconciliation and may affect contentIdentity.
const aliasOwners = new Map();
for (const npc of NPC_CATALOG) {
  for (const token of new Set(npc.name.match(/\p{L}+/gu) ?? [])) {
    if (token.length < 4) continue;
    const owners = aliasOwners.get(token) ?? new Set();
    owners.add(npc.id);
    aliasOwners.set(token, owners);
  }
}
const uniqueNpcAliases = new Map(
  [...aliasOwners.entries()]
    .filter(([, owners]) => owners.size === 1)
    .map(([alias, owners]) => [alias, [...owners][0]])
);

const textualNpcMentionsMissingRefs = [];
for (const event of EVENTS) {
  if (event.family !== 'conditional') continue;
  const refs = new Set(event.npcRefs ?? []);
  const copy = [
    event.text?.title,
    event.text?.body,
    ...(event.intel?.visible ?? []),
    ...(event.intel?.uncertain ?? []),
    ...event.choices.map(choice => choice.label),
    ...event.outcomes.flatMap(outcome => outcome.messages ?? [])
  ].filter(Boolean).join(' ');
  const copyTokens = new Set(copy.match(/\p{L}+/gu) ?? []);
  const mentions = new Map();
  for (const token of copyTokens) {
    const npcId = uniqueNpcAliases.get(token);
    if (!npcId || refs.has(npcId)) continue;
    const aliases = mentions.get(npcId) ?? [];
    aliases.push(token);
    mentions.set(npcId, aliases);
  }
  for (const [npcId, aliases] of mentions) {
    textualNpcMentionsMissingRefs.push({
      eventId: event.id,
      npcId,
      aliases: [...new Set(aliases)].sort(),
      canonStatus: event.canonStatus ?? null,
      declaredNpcRefs: [...refs]
    });
  }
}

const npcs = NPC_CATALOG.map(npc => ({
  id: npc.id,
  name: npc.name,
  role: npc.role,
  initialClub: npc.initialClub,
  eventIds: EVENTS.filter(event => event.npcRefs?.includes(npc.id)).map(event => event.id),
  seedIds: SEED_CATALOG.filter(seed => seed.npcRefs?.includes(npc.id)).map(seed => seed.id),
  knowledgeRuleEvents: [...new Set(NPC_EVENT_KNOWLEDGE_RULES.filter(rule => rule.npcIds.includes(npc.id)).map(rule => rule.eventId))],
  knowledgeRequiredForEvents: NPC_EVENT_KNOWLEDGE_REQUIREMENTS.filter(rule => rule.npcId === npc.id).map(rule => rule.eventId)
}));

const unreferencedNpcIds = npcs.filter(npc => npc.eventIds.length === 0 && npc.seedIds.length === 0).map(npc => npc.id);
const relationshipTargetsWithKnowledgeRule = relationshipOutcomeTargets.filter(row => row.explicitKnowledgeRule).length;
const report = {
  workstream: 'T5.3',
  source: 'runtime catalogs after TypeScript build',
  npcCount: NPC_CATALOG.length,
  eventCount: EVENTS.length,
  seedCount: SEED_CATALOG.length,
  knowledgeRuleCount: NPC_EVENT_KNOWLEDGE_RULES.length,
  knowledgeRequirementCount: NPC_EVENT_KNOWLEDGE_REQUIREMENTS.length,
  relationshipOutcomeTargetCount: relationshipOutcomeTargets.length,
  relationshipTargetsWithKnowledgeRule,
  relationshipKnowledgeCoverage: relationshipOutcomeTargets.length === 0 ? 1 : Number((relationshipTargetsWithKnowledgeRule / relationshipOutcomeTargets.length).toFixed(4)),
  unknownEventNpcRefs,
  unknownSeedNpcRefs,
  invalidKnowledgeRules,
  invalidKnowledgeRequirements,
  epistemicRelationshipGaps,
  epistemicCallbackGaps,
  relationshipEffectTargetsMissingRefs,
  textualNpcMentionsMissingRefs,
  appliedEpistemicExceptions,
  staleEpistemicExceptions,
  unreferencedNpcIds,
  npcs,
  passed: NPC_CATALOG.length === 20 && unknownEventNpcRefs.length === 0 && unknownSeedNpcRefs.length === 0 && invalidKnowledgeRules.length === 0 && invalidKnowledgeRequirements.length === 0 && epistemicRelationshipGaps.length === 0 && epistemicCallbackGaps.length === 0 && staleEpistemicExceptions.length === 0
};

console.log(JSON.stringify(report, null, 2));
if (process.argv.includes('--check') && !report.passed) process.exitCode = 1;
