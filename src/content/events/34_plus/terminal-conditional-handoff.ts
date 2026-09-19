export type TerminalConditionalId =
  | "CEVT_38_OFFER_AFTER_RETIREMENT_ANNOUNCED"
  | "CEVT_38_RETIREMENT_REVERSAL"
  | "CEVT_RET_NO_LAST_MATCH"
  | "CEVT_RET_STORYBOOK_LAST_GOAL";

export interface TerminalConditionalHandoff {
  id: TerminalConditionalId;
  status: "HANDED_OFF_TERMINAL";
  owner: "agent9";
  requirements: readonly string[];
  forbiddenA8Actions: readonly string[];
  migrationExpectation: string;
}

export const TERMINAL_CONDITIONAL_HANDOFFS: readonly TerminalConditionalHandoff[] = [
  {
    id:"CEVT_38_OFFER_AFTER_RETIREMENT_ANNOUNCED",
    status:"HANDED_OFF_TERMINAL",
    owner:"agent9",
    requirements:[
      "retirement.status is authoritatively announced",
      "a real formal CareerOffer or owner-approved market emergency approach exists",
      "the offer remains eligible against live CareerTerms",
      "reconsideration cost/history is persisted by Agent 9"
    ],
    forbiddenA8Actions:["set retirement.status","invent POST_ANNOUNCE_OFFER","manufacture CareerOffer","reopen career"],
    migrationExpectation:"Preserve any historical technical row; canonical exact ID becomes the terminal/shared successor only through the authorized contentIdentity generation."
  },
  {
    id:"CEVT_38_RETIREMENT_REVERSAL",
    status:"HANDED_OFF_TERMINAL",
    owner:"agent9",
    requirements:[
      "prior retirement announcement/closure history allowed by Agent-9 state machine",
      "motivation/reconsideration state is factual",
      "a concrete external opportunity exists when canon requires it",
      "reversal count and public-cost provenance survive save/load"
    ],
    forbiddenA8Actions:["alias CEVT_RET_RECONSIDER automatically","set retirement.status","clear terminal history","invent offer"],
    migrationExpectation:"No fuzzy alias from CEVT_RET_RECONSIDER; Agent 9 must approve any explicit replacement/migration evidence."
  },
  {
    id:"CEVT_RET_NO_LAST_MATCH",
    status:"HANDED_OFF_TERMINAL",
    owner:"agent9",
    requirements:[
      "retirement is already in the Agent-9 terminal flow",
      "injury episode or authoritative suspension fact prevents the final sporting opportunity",
      "sport history proves no later appearance",
      "career closure uses Agent-9 closeCareer authority"
    ],
    forbiddenA8Actions:["close career by elapsed timer","write LAST_MATCH_PLAYED=false by fiat","invent injury or suspension","set retirement.status"],
    migrationExpectation:"Replace timer-based technical semantics only through terminal content migration; preserve historical saves/journal entries."
  },
  {
    id:"CEVT_RET_STORYBOOK_LAST_GOAL",
    status:"HANDED_OFF_TERMINAL",
    owner:"agent9",
    requirements:[
      "actual last player appearance is identified",
      "rich sporting history proves playerGoals > 0 in that exact fixture",
      "goal was produced by sport authority before narrative resolution",
      "career closure remains Agent-9-owned"
    ],
    forbiddenA8Actions:["create a goal from a narrative choice","set STORYBOOK_LAST_GOAL as sporting truth","close career","set retirement.status"],
    migrationExpectation:"Exact canonical ID may consume the factual last-goal row once #199/A9 authority exists; never reinterpret a technical forced-goal outcome."
  }
];
