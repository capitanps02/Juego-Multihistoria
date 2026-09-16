import type { NpcKnowledgeSource, NpcMemoryClass } from "../core/npc-knowledge.js";

export type NpcKnowledgeTargetSlot = "captain" | "star";

export interface NpcEventKnowledgeRule {
  eventId: string;
  choiceIds?: string[];
  outcomeIds?: string[];
  /** Explicit persistent NPC targets known at authoring time. */
  npcIds: string[];
  /**
   * Optional role-based recipients resolved from authoritative runtime contracts.
   * These are live-resolution targets, never inferred from npcRefs, seeds, role
   * text or relationship magnitude.
   */
  targetSlots?: NpcKnowledgeTargetSlot[];
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
    eventId: "EVT_18_CAP_001",
    choiceIds: ["PUBLIC_SUPPORT"],
    outcomeIds: ["PUBLIC_SUPPORT__PRIMARY"],
    npcIds: ["NPC_PLR_10"],
    source: "witnessed",
    certainty: 100,
    memory: "strong",
    relationshipMemory: true
  },
  {
    eventId: "EVT_18_MED_001",
    choiceIds: ["TELL_COACH"],
    outcomeIds: ["TELL_COACH__SECONDARY"],
    npcIds: ["NPC_MED_01"],
    source: "reported",
    certainty: 100,
    memory: "strong",
    relationshipMemory: true
  },
  {
    eventId: "EVT_18_PRS_002",
    choiceIds: ["DENY"],
    outcomeIds: ["DENY__SECONDARY"],
    npcIds: ["NPC_PRS_01"],
    source: "witnessed",
    certainty: 100,
    memory: "strong",
    relationshipMemory: true
  },
  {
    eventId: "EVT_18_TEAM_001",
    choiceIds: ["HELP_REASONABLE"],
    outcomeIds: ["HELP_REASONABLE__PRIMARY"],
    npcIds: ["NPC_PLR_12"],
    source: "witnessed",
    certainty: 100,
    memory: "strong",
    relationshipMemory: true
  },
  {
    eventId: "EVT_18_TEAM_001",
    choiceIds: ["AGREE_BUT_SELF"],
    outcomeIds: ["AGREE_BUT_SELF__SECONDARY"],
    npcIds: ["NPC_PLR_12"],
    source: "witnessed",
    certainty: 100,
    memory: "strong",
    relationshipMemory: true
  },
  {
    eventId: "EVT_18_TEAM_001",
    choiceIds: ["TELL_MENA"],
    outcomeIds: ["TELL_MENA__SECONDARY"],
    npcIds: ["NPC_PLR_12"],
    source: "reported",
    certainty: 100,
    memory: "strong",
    relationshipMemory: true
  },
  {
    eventId: "EVT_18_END_002",
    choiceIds: ["DEFEND"],
    outcomeIds: ["DEFEND__PRIMARY"],
    npcIds: ["NPC_CCH_01"],
    source: "public",
    certainty: 100,
    memory: "strong",
    relationshipMemory: true
  },
  {
    eventId: "EVT_18_MKT_001",
    choiceIds: ["SOFT_LEVERAGE"],
    outcomeIds: ["SOFT_LEVERAGE__SECONDARY"],
    npcIds: ["NPC_DIR_02"],
    source: "witnessed",
    certainty: 100,
    memory: "temporary",
    relationshipMemory: true
  },
  {
    eventId: "CEVT_18_VELA_01",
    choiceIds: ["DISTANCE"],
    outcomeIds: ["DISTANCE__SECONDARY"],
    npcIds: ["NPC_PLR_10"],
    source: "witnessed",
    certainty: 100,
    memory: "strong",
    relationshipMemory: true
  },
  {
    eventId: "EVT_19_JAN_001",
    choiceIds: ["FORCE_EXIT"],
    outcomeIds: ["FORCE_EXIT__SECONDARY"],
    npcIds: ["NPC_DIR_02"],
    source: "witnessed",
    certainty: 100,
    memory: "strong",
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
  },
  {
    eventId: "EVT_20_LIFE_001",
    choiceIds: ["STAY_HOME", "RENT_NEAR_CLUB", "SHARE_TEAMMATE", "CLUB_TEMPORARY"],
    npcIds: ["NPC_FAM_01", "NPC_FAM_02"],
    source: "informed",
    certainty: 100,
    memory: "strong",
    relationshipMemory: true
  },
  {
    eventId: "EVT_21_RIV_001",
    choiceIds: ["PRAISE_ADRIAN", "END_COMPARISONS", "SPORTING_RIVALRY"],
    npcIds: ["NPC_PLR_15"],
    source: "public",
    certainty: 100,
    memory: "strong",
    relationshipMemory: true
  },
  {
    eventId: "EVT_21_RIV_001",
    choiceIds: ["PRIVATE_MESSAGE"],
    npcIds: ["NPC_PLR_15"],
    source: "informed",
    certainty: 100,
    memory: "strong",
    relationshipMemory: true
  },
  {
    eventId: "CEVT_21_MEDIA_01",
    choiceIds: ["ASK_CLARA_CONTEXT", "CLARA_OFF_RECORD"],
    npcIds: ["NPC_PRS_01"],
    source: "informed",
    certainty: 100,
    memory: "strong",
    relationshipMemory: true
  },
  {
    eventId: "CEVT_21_MEDIA_01",
    choiceIds: ["PUBLIC_CORRECTION"],
    npcIds: ["NPC_PRS_01"],
    source: "public",
    certainty: 100,
    memory: "temporary",
    relationshipMemory: false
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
