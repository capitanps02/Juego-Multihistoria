import type { SeedDefinition } from "../core/types.js";

export type Seed34PlusProducerOwner = "agent8" | "agent9";
export type Seed34PlusBridgeClassification = "pre34_canonical_memory" | "derived_projection";

export const SEED_34_PLUS_BRIDGE_COMPATIBILITY = [
  { seedId: "SEED_FORM_VS_PLAN", classification: "pre34_canonical_memory", treatment: "preserve_provenance_do_not_reorigin_at_34" },
  { seedId: "SEED_PEAK_BODY_MEMORY", classification: "derived_projection", treatment: "derive_from_injury_body_and_canonical_body_history" },
  { seedId: "SEED_PEAK_ROLE_LEGACY", classification: "derived_projection", treatment: "derive_from_role_history_and_legacy_facts" },
  { seedId: "SEED_CONTRACT_REPUTATION", classification: "derived_projection", treatment: "derive_from_career_offer_contract_and_negotiation_history" },
  { seedId: "SEED_PUBLIC_POLARIZATION", classification: "derived_projection", treatment: "derive_from_reputation_and_media_history" },
  { seedId: "SEED_CLUB_POWER_MEMORY", classification: "derived_projection", treatment: "derive_from_club_relationship_and_institutional_history" },
  { seedId: "SEED_FINALS_MEMORY", classification: "derived_projection", treatment: "derive_from_authoritative_competition_match_and_trophy_history" },
  { seedId: "SEED_NATIONAL_LEGACY", classification: "derived_projection", treatment: "derive_from_national_team_and_selection_history" },
  { seedId: "SEED_WEALTH_LEGACY", classification: "derived_projection", treatment: "derive_from_salary_money_and_finance_history" },
  { seedId: "SEED_AGENT_ENDGAME", classification: "derived_projection", treatment: "derive_from_certified_agent_and_agent_memory_history" },
  { seedId: "SEED_FAMILY_RELOCATION", classification: "derived_projection", treatment: "derive_from_established_family_and_relocation_history" },
  { seedId: "SEED_VETERAN_MARKET_SIGNAL", classification: "derived_projection", treatment: "derive_from_formal_offer_history_not_market_heat" },
  { seedId: "SEED_MEDICAL_LONG_MEMORY", classification: "derived_projection", treatment: "derive_from_medical_injury_and_canonical_body_history" },
  { seedId: "SEED_HOME_RETURN_SIGNAL", classification: "derived_projection", treatment: "derive_from_former_club_exit_style_and_real_return_interest" }
] as const satisfies readonly { seedId: string; classification: Seed34PlusBridgeClassification; treatment: string }[];

export const SEED_CATALOG_34_PLUS_BRIDGE_COMPATIBILITY: SeedDefinition[] = SEED_34_PLUS_BRIDGE_COMPATIBILITY.map(row => ({
  id: row.seedId,
  originEvents: [],
  npcRefs: [],
  ageWindow: [34, null],
  description: row.classification === "pre34_canonical_memory"
    ? "Memoria pre-34 preservada por compatibilidad; no se reorigina al entrar en 34+."
    : "Proyección derivada preservada por compatibilidad; no es una nueva fuente persistida de verdad."
}));

const COMPATIBILITY_ONLY_34_PLUS_IDS = new Set<string>(SEED_34_PLUS_BRIDGE_COMPATIBILITY.map(row => row.seedId));

export function isCompatibilityOnly34PlusSeed(seedId: string): boolean {
  return COMPATIBILITY_ONLY_34_PLUS_IDS.has(seedId);
}

export const CANONICAL_34_PLUS_SEED_PRODUCERS = [
  { seedId: "SEED_AGE34_REALITY", producerEventId: "EVT_34_BRIDGE_001", owner: "agent8" },
  { seedId: "SEED_VETERAN_PAYCUT", producerEventId: "EVT_34_PAY_001", owner: "agent8" },
  { seedId: "SEED_FINAL_NT_POSTURE", producerEventId: "EVT_34_NT_001", owner: "agent8" },
  { seedId: "SEED_FINAL_HOME_WINDOW", producerEventId: "EVT_34_HOME_001", owner: "agent8" },
  { seedId: "SEED_LAST_AGENT_GAMBLE", producerEventId: "EVT_34_AGT_001", owner: "agent8" },
  { seedId: "SEED_28_MATCH_PLAN", producerEventId: "EVT_34_LOAD_001", owner: "agent8" },
  { seedId: "SEED_FINAL_DORSAL", producerEventId: "EVT_34_DORSAL_001", owner: "agent8" },
  { seedId: "SEED_DIGNIFIED_EXIT_CLAUSE", producerEventId: "EVT_34_CON_001", owner: "agent8" },
  { seedId: "SEED_FINAL_ROLE_ACCEPTANCE", producerEventId: "EVT_34_ROLE_001", owner: "agent8" },
  { seedId: "SEED_SUCCESSOR_ALLIANCE", producerEventId: "EVT_34_MENTOR_001", owner: "agent8" },
  { seedId: "SEED_POST_MATCH_PAIN", producerEventId: "EVT_34_BODY_001", owner: "agent8" },
  { seedId: "SEED_LAST_HERO_MOMENT", producerEventId: "EVT_34_MATCH_001", owner: "agent8" },
  { seedId: "SEED_NT_FIRST_OMISSION_LATE", producerEventId: "EVT_34_NT_002", owner: "agent8" },
  { seedId: "SEED_FAREWELL_CROWD_POWER", producerEventId: "EVT_34_FAN_001", owner: "agent8" },
  { seedId: "SEED_TEAM_WINS_WITHOUT_YOU", producerEventId: "EVT_34_TRAVEL_001", owner: "agent8" },
  { seedId: "SEED_MARCH_SILENCE", producerEventId: "EVT_34_MAR_001", owner: "agent8" },
  { seedId: "SEED_THREE_VERSIONS_35", producerEventId: "EVT_35_MKT_001", owner: "agent8" },
  { seedId: "SEED_AVAILABILITY_CONTRACT", producerEventId: "EVT_35_CON_001", owner: "agent8" },
  { seedId: "SEED_FINAL_RELOCATION_TRADEOFF", producerEventId: "EVT_35_FAM_001", owner: "agent8" },
  { seedId: "SEED_FAREWELL_AS_LEVERAGE", producerEventId: "EVT_35_FAREWELL_001", owner: "agent8" },
  { seedId: "SEED_PUBLIC_MYTH_FINAL", producerEventId: "EVT_35_FAREWELL_001", owner: "agent8" },
  { seedId: "SEED_PLAYER_LIAISON_ROLE", producerEventId: "EVT_35_DUAL_001", owner: "agent8" },
  { seedId: "SEED_SLOW_PRESEASON_35", producerEventId: "EVT_35_BODY_001", owner: "agent8" },
  { seedId: "SEED_FINAL_AGENT_STRUCTURE", producerEventId: "EVT_35_AGT_001", owner: "agent8" },
  { seedId: "SEED_FINAL_REINVENTION", producerEventId: "EVT_35_TACT_001", owner: "agent8" },
  { seedId: "SEED_FIVE_MATCHES_UNUSED", producerEventId: "EVT_35_BENCH_001", owner: "agent8" },
  { seedId: "SEED_RECORD_PASSED", producerEventId: "EVT_35_RECORD_001", owner: "agent8" },
  { seedId: "SEED_EMERGENCY_NT_RETURN", producerEventId: "EVT_35_NT_001", owner: "agent8" },
  { seedId: "SEED_LAST_JANUARY_MOVE", producerEventId: "EVT_35_JAN_001", owner: "agent8" },
  { seedId: "SEED_LAST_FINAL_BENCH", producerEventId: "EVT_35_FINAL_001", owner: "agent8" },
  { seedId: "SEED_HOME_SUCCESS_WITHOUT_YOU", producerEventId: "EVT_35_HOME_001", owner: "agent8" },
  { seedId: "SEED_RETIREMENT_MARKETING", producerEventId: "EVT_35_IMG_001", owner: "agent8" },
  { seedId: "SEED_AGE36_LONG_DEAL", producerEventId: "EVT_36_CON_001", owner: "agent8" },
  { seedId: "SEED_COMPETITION_SELECTIVITY", producerEventId: "EVT_36_BODY_001", owner: "agent8" },
  { seedId: "SEED_YOUNGER_COACH", producerEventId: "EVT_36_CCH_001", owner: "agent8" },
  { seedId: "SEED_700_MATCH_CHOICE", producerEventId: "EVT_36_RECORD_001", owner: "agent8" },
  { seedId: "SEED_PEER_RETIREMENT_MIRROR", producerEventId: "EVT_36_PEER_001", owner: "agent8" },
  { seedId: "SEED_DROP_LEVEL_TO_PLAY", producerEventId: "EVT_36_LOWER_001", owner: "agent8" },
  { seedId: "SEED_POST_CAREER_BODY_RISK", producerEventId: "EVT_36_MED_001", owner: "agent8" },
  { seedId: "SEED_THREE_MONTH_CONTRACT", producerEventId: "EVT_37_SHORT_001", owner: "agent8" },
  { seedId: "SEED_TEN_MATCH_HOME_RETURN", producerEventId: "EVT_37_HOME_001", owner: "agent8" },
  { seedId: "SEED_FAREWELL_PENALTY", producerEventId: "EVT_37_PEN_001", owner: "agent8" },
  { seedId: "SEED_LAST_HUGE_OFFER", producerEventId: "EVT_38_RICH_001", owner: "agent8" },
  { seedId: "SEED_MARKET_SILENCE_END", producerEventId: "EVT_38_MARKET_001", owner: "agent8" },
  { seedId: "SEED_MARKET_FLOOR_FINAL", producerEventId: "EVT_38_MARKET_001", owner: "agent8" },
  { seedId: "SEED_FAREWELL_ANNOUNCEMENT_TIMING", producerEventId: "EVT_37_ANNOUNCE_001", owner: "agent9" },
  { seedId: "SEED_FINAL_FAMILY_CONVERSATION", producerEventId: "EVT_RET_FAM_001", owner: "agent9" },
  { seedId: "SEED_LAST_REHAB_DECISION", producerEventId: "EVT_RET_BODY_001", owner: "agent9" },
  { seedId: "SEED_RETIRE_ON_HIGH_CHOICE", producerEventId: "EVT_RET_HIGH_001", owner: "agent9" },
  { seedId: "SEED_RETIRE_AFTER_LOW", producerEventId: "EVT_RET_LOW_001", owner: "agent9" },
  { seedId: "SEED_DISCARDED_REBIRTH_FINAL", producerEventId: "EVT_RET_LOW_001", owner: "agent9" },
  { seedId: "SEED_RETIREMENT_ANNOUNCEMENT_PATH", producerEventId: "EVT_RET_ANNOUNCE_001", owner: "agent9" },
  { seedId: "SEED_LAST_MATCH_SHAPE", producerEventId: "EVT_RET_LASTMATCH_001", owner: "agent9" },
  { seedId: "SEED_FAREWELL_CONTROL_FINAL", producerEventId: "EVT_RET_LASTMATCH_001", owner: "agent9" }
] as const satisfies readonly { seedId: string; producerEventId: string; owner: Seed34PlusProducerOwner }[];

export const SEED_CATALOG_34_PLUS_CANONICAL: SeedDefinition[] = CANONICAL_34_PLUS_SEED_PRODUCERS.map(row => ({
  id: row.seedId,
  originEvents: [row.producerEventId],
  npcRefs: [],
  ageWindow: [34, null],
  description: `Memoria canónica 34+ de Pasada 7; provenance autoritativa: ${row.producerEventId}.`
}));

export const LEGACY_34_PLUS_TECHNICAL_SEED_IDS = [
  "SEED_34_MARKET_SILENCE",
  "SEED_34_ROLE_FLOOR",
  "SEED_34_BODY_NEGOTIATION",
  "SEED_34_CONTRACT_FLEX",
  "SEED_34_LAST_SELECTION",
  "SEED_34_MENTORSHIP",
  "SEED_34_FAMILY_WEIGHT",
  "SEED_34_MEDIA_TONE",
  "SEED_34_HOME_PULL",
  "SEED_34_MEDICAL_REDLINE",
  "SEED_34_FINAL_OUTSIDE",
  "SEED_34_COMEBACK",
  "SEED_34_NO_CLEARANCE",
  "SEED_34_LATE_OFFER",
  "SEED_34_LEAGUE_DOWNGRADE",
  "SEED_34_STATUS_SACRIFICE",
  "SEED_35_YEAR_OPTION",
  "SEED_35_FINAL_ROLE",
  "SEED_35_BODY_PLAN",
  "SEED_35_MARKET_CALL",
  "SEED_35_NATIONAL_GOODBYE",
  "SEED_35_FAMILY_DECISION",
  "SEED_35_CLUB_FAREWELL",
  "SEED_35_HOME_LAST_WINDOW",
  "SEED_36_CONTRACT_MINUTES",
  "SEED_36_MEDICAL_CLEARANCE",
  "SEED_36_COMEBACK_FINAL",
  "SEED_36_MENTOR_ROLE",
  "SEED_36_RICH_LEAGUE_LAST",
  "SEED_36_NO_MARKET",
  "SEED_37_ANNOUNCEMENT_CONTROL",
  "SEED_37_LAST_PRESEASON",
  "SEED_37_LAST_DERBY",
  "SEED_37_PRIVATE_RETIREMENT",
  "SEED_38_POST_ANNOUNCE_OFFER",
  "SEED_38_RECONSIDERATION",
  "SEED_38_LAST_CONTRACT",
  "SEED_38_MARKET_SILENCE",
  "SEED_RET_HOME_CONVERSATION",
  "SEED_RET_BODY_DECISION",
  "SEED_RET_HIGH",
  "SEED_RET_LOW",
  "SEED_RET_ANNOUNCEMENT",
  "SEED_RET_LAST_MATCH",
  "SEED_RET_NO_LAST_MATCH",
  "SEED_RET_STORYBOOK",
  "SEED_RET_RECONSIDERED",
  "SEED_RET_MARKET_END",
  "SEED_RET_HEALTH_END",
  "SEED_RET_FAMILY_END",
  "SEED_RET_PUBLIC_TONE",
  "SEED_RET_PRIVATE_TONE",
  "SEED_EPILOGUE_LEGACY",
  "SEED_EPILOGUE_UNFINISHED"
] as const;
