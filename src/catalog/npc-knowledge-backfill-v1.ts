import type { NpcEventKnowledgeRule } from "./npc-knowledge-rules.js";

/**
 * Immutable semantic baseline used only to reconstruct missing T5.3 knowledge
 * from historical saves. Live event resolution MUST continue to use
 * NPC_EVENT_KNOWLEDGE_RULES from npc-knowledge-rules.ts.
 *
 * Do not edit this v1 baseline in place when live rules evolve. If historical
 * backfill semantics must intentionally expand, add a new explicitly versioned
 * baseline/provenance decision instead. The SHA-256 ratchet is asserted by QA.
 */
export const NPC_KNOWLEDGE_BACKFILL_V1_SHA256 = "80187bea933b80035e0c5c02d28fffe2d5d7bea84df0f478288461214aaee4d6";

export const NPC_KNOWLEDGE_BACKFILL_RULES_V1: readonly NpcEventKnowledgeRule[] = [
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
  }
];

for (const rule of NPC_KNOWLEDGE_BACKFILL_RULES_V1) {
  Object.freeze(rule.npcIds);
  if (rule.choiceIds) Object.freeze(rule.choiceIds);
  if (rule.outcomeIds) Object.freeze(rule.outcomeIds);
  if (rule.targetSlots) Object.freeze(rule.targetSlots);
  Object.freeze(rule);
}
Object.freeze(NPC_KNOWLEDGE_BACKFILL_RULES_V1);

export function historicalKnowledgeRulesFor(
  eventId: string,
  choiceId: string,
  outcomeId: string
): NpcEventKnowledgeRule[] {
  return NPC_KNOWLEDGE_BACKFILL_RULES_V1.filter(rule =>
    rule.eventId === eventId
    && (!rule.choiceIds || rule.choiceIds.includes(choiceId))
    && (!rule.outcomeIds || rule.outcomeIds.includes(outcomeId))
  );
}
