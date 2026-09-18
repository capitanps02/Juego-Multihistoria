import type { NpcEventKnowledgeRule } from "./npc-knowledge-rules.js";

/**
 * Epistemic rules for staged A5 external-blocked principals.
 * Only already-certified recipients are named. Missing external actors remain absent
 * until their owner supplies identity/provenance; npcRefs never substitute for that.
 */
export const A5_EXTERNAL_PRINCIPAL_KNOWLEDGE_RULES: NpcEventKnowledgeRule[] = [
  {
    eventId:"EVT_20_AGT_001",
    choiceIds:["BROAD_CONTROL","REPORT_ALL","SPLIT_FUNCTIONS","NO_CENTRALIZE"],
    outcomeIds:[
      "BROAD_CONTROL__PRIMARY","BROAD_CONTROL__SECONDARY","REPORT_ALL__PRIMARY","REPORT_ALL__SECONDARY",
      "SPLIT_FUNCTIONS__PRIMARY","SPLIT_FUNCTIONS__SECONDARY","NO_CENTRALIZE__PRIMARY","NO_CENTRALIZE__SECONDARY"
    ],
    npcIds:[], targetSlots:["activeAgent"], source:"informed", certainty:100, memory:"strong", relationshipMemory:true
  },
  {
    eventId:"EVT_20_BRUNO_001",
    choiceIds:["AUTHORIZE_NOTIFY","AUTHORIZE_PRIVATE","ASK_DETAILS","DECLINE_HELP"],
    outcomeIds:[
      "AUTHORIZE_NOTIFY__PRIMARY","AUTHORIZE_NOTIFY__SECONDARY","AUTHORIZE_PRIVATE__PRIMARY","AUTHORIZE_PRIVATE__SECONDARY",
      "ASK_DETAILS__PRIMARY","ASK_DETAILS__SECONDARY","DECLINE_HELP__PRIMARY","DECLINE_HELP__SECONDARY"
    ],
    npcIds:["NPC_PLR_12"], source:"informed", certainty:100, memory:"strong", relationshipMemory:true
  },
  {
    eventId:"EVT_20_BRUNO_001",
    choiceIds:["AUTHORIZE_NOTIFY"],
    outcomeIds:["AUTHORIZE_NOTIFY__PRIMARY","AUTHORIZE_NOTIFY__SECONDARY"],
    npcIds:[], targetSlots:["activeAgent"], source:"informed", certainty:100, memory:"strong", relationshipMemory:true
  },
  {
    eventId:"EVT_21_AGT_001",
    choiceIds:["ACCEPT_TARGETS","KEEP_TERMS","SOUND_OTHER","SPLIT_IMAGE"],
    outcomeIds:[
      "ACCEPT_TARGETS__PRIMARY","ACCEPT_TARGETS__SECONDARY","KEEP_TERMS__PRIMARY","KEEP_TERMS__SECONDARY",
      "SOUND_OTHER__PRIMARY","SOUND_OTHER__SECONDARY","SPLIT_IMAGE__PRIMARY","SPLIT_IMAGE__SECONDARY"
    ],
    npcIds:[], targetSlots:["activeAgent"], source:"informed", certainty:100, memory:"strong", relationshipMemory:true
  },
  {
    eventId:"EVT_21_NAT_001",
    choiceIds:["DO_MORE","MERIT_FIELD"],
    outcomeIds:["DO_MORE__PRIMARY","DO_MORE__SECONDARY","MERIT_FIELD__PRIMARY","MERIT_FIELD__SECONDARY"],
    npcIds:["NPC_PRS_01"], source:"public", certainty:100, memory:"temporary", relationshipMemory:false
  },
  {
    eventId:"EVT_21_NAT_001",
    choiceIds:["PRIVATE_INFO"],
    outcomeIds:["PRIVATE_INFO__PRIMARY","PRIVATE_INFO__SECONDARY"],
    npcIds:[], targetSlots:["activeAgent"], source:"informed", certainty:100, memory:"temporary", relationshipMemory:false
  },
  {
    eventId:"EVT_21_CCH_002",
    choiceIds:["AGENT_SOUND"],
    outcomeIds:["AGENT_SOUND__PRIMARY","AGENT_SOUND__SECONDARY"],
    npcIds:[], targetSlots:["activeAgent"], source:"informed", certainty:100, memory:"strong", relationshipMemory:true
  },
  {
    eventId:"EVT_22_LOCK_001",
    choiceIds:["MEETING"],
    outcomeIds:["MEETING__PRIMARY","MEETING__SECONDARY"],
    npcIds:[], targetSlots:["currentClubInstitutional"], source:"informed", certainty:100, memory:"strong", relationshipMemory:true
  },
  {
    eventId:"EVT_22_TACT_001",
    choiceIds:["SCOUT_CONTEXT"],
    outcomeIds:["SCOUT_CONTEXT__PRIMARY","SCOUT_CONTEXT__SECONDARY"],
    npcIds:[], targetSlots:["activeAgent"], source:"informed", certainty:100, memory:"temporary", relationshipMemory:false
  }
];
