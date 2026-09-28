/** Scene-specific epistemic channels for Agent 5 canonical 20–23 microbatches. */
export const NPC_EVENT_KNOWLEDGE_RULES_18_23 = [
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
    },
    {
        eventId: "EVT_21_CAP_001",
        choiceIds: ["PARTICIPATE_VOTE", "LISTEN_NO_NAME", "DISSENT_MINORITY", "DECLINE_FOR_NOW"],
        outcomeIds: [
            "PARTICIPATE_VOTE__PRIMARY",
            "PARTICIPATE_VOTE__SECONDARY",
            "LISTEN_NO_NAME__PRIMARY",
            "LISTEN_NO_NAME__SECONDARY",
            "DISSENT_MINORITY__PRIMARY",
            "DISSENT_MINORITY__SECONDARY",
            "DECLINE_FOR_NOW__PRIMARY",
            "DECLINE_FOR_NOW__SECONDARY"
        ],
        npcIds: [],
        targetSlots: ["captain"],
        source: "witnessed",
        certainty: 100,
        memory: "strong",
        relationshipMemory: true
    },
    {
        eventId: "EVT_21_PRS_001",
        choiceIds: ["CORRECT_WITH_NUMBER", "DENY_NO_NUMBER"],
        npcIds: ["NPC_PRS_01"],
        source: "public",
        certainty: 100,
        memory: "strong",
        relationshipMemory: false
    }
];
