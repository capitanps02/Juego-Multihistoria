import type { NpcEventKnowledgeRule } from "./npc-knowledge-rules.js";

/**
 * Staged Agent-5 epistemic rules. They are not added to the live registry until J is
 * the active predecessor. Dynamic recipients come only from A1 authority slots.
 */
export const A5_READY_NPC_KNOWLEDGE_RULES: NpcEventKnowledgeRule[] = [
  {
    eventId:"EVT_20_BRIDGE_001",
    choiceIds:["WRITTEN_PLAN","MONEY_FIRST","ASK_PRICE","LISTEN_AND_CHECK"],
    outcomeIds:[
      "WRITTEN_PLAN__PRIMARY","WRITTEN_PLAN__SECONDARY","MONEY_FIRST__PRIMARY","MONEY_FIRST__SECONDARY",
      "ASK_PRICE__PRIMARY","ASK_PRICE__SECONDARY","LISTEN_AND_CHECK__PRIMARY","LISTEN_AND_CHECK__SECONDARY"
    ],
    npcIds:[],targetSlots:["currentClubInstitutional","activeAgent"],source:"witnessed",certainty:100,memory:"strong",relationshipMemory:false
  },
  {
    eventId:"EVT_20_CCH_001",choiceIds:["ASK_DIRECTOR"],
    outcomeIds:["ASK_DIRECTOR__PRIMARY","ASK_DIRECTOR__SECONDARY"],
    npcIds:[],targetSlots:["currentClubInstitutional"],source:"informed",certainty:100,memory:"strong",relationshipMemory:true
  },
  {
    eventId:"EVT_20_CCH_001",choiceIds:["AGENT_SOUND"],
    outcomeIds:["AGENT_SOUND__PRIMARY","AGENT_SOUND__SECONDARY"],
    npcIds:[],targetSlots:["activeAgent"],source:"informed",certainty:100,memory:"strong",relationshipMemory:true
  },
  {
    eventId:"EVT_21_SOC_001",choiceIds:["BACK_AGENT","APOLOGIZE_LIMIT","MEDIATE"],
    outcomeIds:[
      "BACK_AGENT__PRIMARY","BACK_AGENT__SECONDARY","APOLOGIZE_LIMIT__PRIMARY","APOLOGIZE_LIMIT__SECONDARY",
      "MEDIATE__PRIMARY","MEDIATE__SECONDARY"
    ],
    npcIds:["NPC_SOC_01"],targetSlots:["activeAgent"],source:"informed",certainty:100,memory:"strong",relationshipMemory:true
  },
  {
    eventId:"EVT_21_PRS_002",choiceIds:["EXACT_DURATION","RANGE","PUBLICABLE_ONLY"],
    outcomeIds:[
      "EXACT_DURATION__PRIMARY","EXACT_DURATION__SECONDARY","RANGE__PRIMARY","RANGE__SECONDARY",
      "PUBLICABLE_ONLY__PRIMARY","PUBLICABLE_ONLY__SECONDARY"
    ],
    npcIds:["NPC_PRS_01"],source:"informed",certainty:100,memory:"strong",relationshipMemory:true
  },
  {
    eventId:"EVT_21_PRS_002",choiceIds:["PASS_TO_AGENT"],
    outcomeIds:["PASS_TO_AGENT__PRIMARY","PASS_TO_AGENT__SECONDARY"],
    npcIds:["NPC_PRS_01"],targetSlots:["activeAgent"],source:"informed",certainty:100,memory:"strong",relationshipMemory:true
  },
  {
    eventId:"EVT_20_AGT_001",choiceIds:["BROAD_CONTROL","INFORM_FIRST","SPLIT_IMAGE","NO_CENTRALIZE"],
    outcomeIds:[
      "BROAD_CONTROL__PRIMARY","BROAD_CONTROL__SECONDARY","INFORM_FIRST__PRIMARY","INFORM_FIRST__SECONDARY",
      "SPLIT_IMAGE__PRIMARY","SPLIT_IMAGE__SECONDARY","NO_CENTRALIZE__PRIMARY","NO_CENTRALIZE__SECONDARY"
    ],
    npcIds:[],targetSlots:["activeAgent"],source:"informed",certainty:100,memory:"strong",relationshipMemory:true
  },
  {
    eventId:"EVT_20_BRUNO_001",choiceIds:["AUTHORIZE_NOTIFY","AUTHORIZE_PRIVATE","ASK_MORE","DECLINE_HELP_OTHER"],
    outcomeIds:[
      "AUTHORIZE_NOTIFY__PRIMARY","AUTHORIZE_NOTIFY__SECONDARY","AUTHORIZE_PRIVATE__PRIMARY","AUTHORIZE_PRIVATE__SECONDARY",
      "ASK_MORE__PRIMARY","ASK_MORE__SECONDARY","DECLINE_HELP_OTHER__PRIMARY","DECLINE_HELP_OTHER__SECONDARY"
    ],
    npcIds:["NPC_PLR_12"],source:"informed",certainty:100,memory:"strong",relationshipMemory:true
  },
  {
    eventId:"EVT_20_BRUNO_001",choiceIds:["AUTHORIZE_NOTIFY"],
    outcomeIds:["AUTHORIZE_NOTIFY__PRIMARY","AUTHORIZE_NOTIFY__SECONDARY"],
    npcIds:[],targetSlots:["activeAgent"],source:"informed",certainty:100,memory:"strong",relationshipMemory:true
  },
  {
    eventId:"EVT_21_AGT_001",choiceIds:["ACCEPT_TARGETS","KEEP_TERMS","SOUND_OTHER_AGENCY","SPLIT_RIGHTS"],
    outcomeIds:[
      "ACCEPT_TARGETS__PRIMARY","ACCEPT_TARGETS__SECONDARY","KEEP_TERMS__PRIMARY","KEEP_TERMS__SECONDARY",
      "SOUND_OTHER_AGENCY__PRIMARY","SOUND_OTHER_AGENCY__SECONDARY","SPLIT_RIGHTS__PRIMARY","SPLIT_RIGHTS__SECONDARY"
    ],
    npcIds:[],targetSlots:["activeAgent"],source:"informed",certainty:100,memory:"strong",relationshipMemory:true
  },
  {
    eventId:"EVT_21_NAT_001",choiceIds:["AGENT_PRIVATE"],
    outcomeIds:["AGENT_PRIVATE__PRIMARY","AGENT_PRIVATE__SECONDARY"],
    npcIds:[],targetSlots:["activeAgent"],source:"informed",certainty:100,memory:"temporary",relationshipMemory:false
  },
  {
    eventId:"EVT_21_CCH_002",choiceIds:["SOUND_MARKET"],
    outcomeIds:["SOUND_MARKET__PRIMARY","SOUND_MARKET__SECONDARY"],
    npcIds:[],targetSlots:["activeAgent"],source:"informed",certainty:100,memory:"strong",relationshipMemory:true
  },
  {
    eventId:"EVT_22_LOCK_001",choiceIds:["MEETING"],
    outcomeIds:["MEETING__PRIMARY","MEETING__SECONDARY"],
    npcIds:[],targetSlots:["currentClubInstitutional"],source:"informed",certainty:100,memory:"strong",relationshipMemory:true
  },
  {
    eventId:"EVT_22_TACT_001",choiceIds:["AGENT_CONTEXT"],
    outcomeIds:["AGENT_CONTEXT__PRIMARY","AGENT_CONTEXT__SECONDARY"],
    npcIds:[],targetSlots:["activeAgent"],source:"informed",certainty:100,memory:"temporary",relationshipMemory:false
  },
  {
    eventId: "EVT_21_NAT_001",
    choiceIds: ["AGENT_PRIVATE"],
    outcomeIds: ["AGENT_PRIVATE__PRIMARY", "AGENT_PRIVATE__SECONDARY"],
    npcIds: [],
    targetSlots: ["activeAgent"],
    source: "informed",
    certainty: 100,
    memory: "temporary",
    relationshipMemory: false
  },
  {
    eventId: "EVT_22_TACT_001",
    choiceIds: ["AGENT_CONTEXT"],
    outcomeIds: ["AGENT_CONTEXT__PRIMARY", "AGENT_CONTEXT__SECONDARY"],
    npcIds: [],
    targetSlots: ["activeAgent"],
    source: "informed",
    certainty: 100,
    memory: "temporary",
    relationshipMemory: false
  }
];
