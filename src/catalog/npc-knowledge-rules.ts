import type { NpcKnowledgeSource, NpcMemoryClass } from "../core/npc-knowledge.js";

export interface NpcEventKnowledgeRule {
  eventId: string;
  choiceIds?: string[];
  outcomeIds?: string[];
  npcIds: string[];
  factId?: string;
  source: NpcKnowledgeSource;
  certainty?: number;
  memory?: NpcMemoryClass;
  expiresAfterDays?: number;
  relationshipMemory?: boolean;
}

export interface NpcEventKnowledgeRequirement {
  eventId: string;
  npcId: string;
  factId: string;
}

/**
 * Conservative knowledge registry.
 *
 * `npcRefs` must never be treated as witnesses. A fact is granted only through
 * an explicit rule in this registry (or a later call to informNpcOfEventInPlace).
 */
export const NPC_EVENT_KNOWLEDGE_RULES: NpcEventKnowledgeRule[] = [
  {
    eventId: "EVT_18_PRE_001",
    choiceIds: ["CALL_NANO"],
    npcIds: ["NPC_PLR_14"],
    source: "informed",
    certainty: 100,
    memory: "strong",
    relationshipMemory: true
  },
  {
    eventId: "EVT_18_PRE_001",
    choiceIds: ["CALL_RIVAS"],
    npcIds: ["NPC_ACA_01"],
    source: "informed",
    certainty: 100,
    memory: "strong",
    relationshipMemory: true
  },
  {
    eventId: "EVT_18_PRE_002",
    npcIds: ["NPC_PLR_10", "NPC_PLR_12", "NPC_MED_01"],
    source: "witnessed",
    certainty: 100,
    memory: "temporary",
    relationshipMemory: true
  },
  {
    eventId: "EVT_18_PRE_003",
    npcIds: ["NPC_CCH_02", "NPC_PLR_12"],
    source: "witnessed",
    certainty: 100,
    memory: "temporary",
    relationshipMemory: true
  },
  {
    eventId: "EVT_18_AGT_001",
    choiceIds: ["HECTOR_FIRST"],
    npcIds: ["NPC_AGT_01"],
    source: "informed",
    certainty: 100,
    memory: "temporary",
    relationshipMemory: true
  },
  {
    eventId: "EVT_18_AGT_001",
    choiceIds: ["LUCIA_FIRST"],
    npcIds: ["NPC_AGT_02"],
    source: "informed",
    certainty: 100,
    memory: "temporary",
    relationshipMemory: true
  },
  {
    eventId: "EVT_18_AGT_001",
    choiceIds: ["COMPARE"],
    npcIds: ["NPC_AGT_01", "NPC_AGT_02"],
    source: "informed",
    certainty: 100,
    memory: "temporary",
    relationshipMemory: true
  },
  {
    eventId: "EVT_19_TEAM_001",
    choiceIds: ["MOVE_CONTACT"],
    outcomeIds: ["MOVE_CONTACT__SECONDARY"],
    npcIds: ["NPC_PLR_14"],
    source: "reported",
    certainty: 100,
    memory: "strong",
    relationshipMemory: true
  }
];

/**
 * Some callbacks are reactions to prior facts. They are eligible only after the
 * reacting NPC actually knows the relevant fact; flags/seeds alone are not enough.
 */
export const NPC_EVENT_KNOWLEDGE_REQUIREMENTS: NpcEventKnowledgeRequirement[] = [
  { eventId: "CEVT_19_NANO_01", npcId: "NPC_PLR_14", factId: "EVT_19_TEAM_001" }
];

export function knowledgeRulesFor(eventId: string, choiceId: string, outcomeId: string): NpcEventKnowledgeRule[] {
  return NPC_EVENT_KNOWLEDGE_RULES.filter(rule =>
    rule.eventId === eventId &&
    (!rule.choiceIds || rule.choiceIds.includes(choiceId)) &&
    (!rule.outcomeIds || rule.outcomeIds.includes(outcomeId))
  );
}

export function knowledgeRequirementsFor(eventId: string): NpcEventKnowledgeRequirement[] {
  return NPC_EVENT_KNOWLEDGE_REQUIREMENTS.filter(rule => rule.eventId === eventId);
}
