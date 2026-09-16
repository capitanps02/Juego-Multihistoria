// Machine-readable T5 conditional canon matrix.
// Baseline: main@6cb81b63f03ce55776ca97075012cfaa22ac228d on 2026-09-16.
// Do not infer semantic identity from an equal string ID.

export const CONDITIONAL_CANON_FIELDS = [
  "id","phase","canonicalSource","runtimeSource","title","trigger","timeWindow","prerequisites",
  "seedReads","seedCreates","npc","knowledgeRequirements","relationRequirements","contractRequirements",
  "sportRequirements","publicPrivateStatus","choices","effects","expiry","incompatibilities",
  "legacyIdentity","migrationStatus","owner","implementationStatus"
];

const row = (id, phase, implementationStatus, extra = {}) => ({
  id, phase,
  canonicalSource: null,
  runtimeSource: null,
  title: null,
  trigger: [],
  timeWindow: null,
  prerequisites: [],
  seedReads: [],
  seedCreates: [],
  npc: [],
  knowledgeRequirements: [],
  relationRequirements: [],
  contractRequirements: [],
  sportRequirements: [],
  publicPrivateStatus: null,
  choices: [],
  effects: [],
  expiry: null,
  incompatibilities: [],
  legacyIdentity: null,
  migrationStatus: "not_started",
  owner: "t51/canon-conditionals",
  implementationStatus,
  ...extra
});

const C18 = "t51/canon-18-23:analysis/T5.1/canon-18-23-repair-plan.json + canon-18-23-conditionals.json";
const C2330 = "t51/canon-23-30:analysis/T5.1/canon-23-30-conditionals.json";
const R1820 = "src/content/events/18_20/conditional-events.ts";
const R2023 = "src/content/events/20_23/conditional-events.ts";
const R2326 = "src/content/events/23_26/conditional-events.ts";
const R2630 = "src/content/events/26_30/conditional-events.ts";
const R3034 = "src/content/events/30_34/conditional-events.ts";
const R34 = "src/content/events/34_plus/conditional-events.ts";

const verified18 = ["CEVT_18_NODEBUT_01","CEVT_18_VELA_01","CEVT_19_BIG_01","CEVT_19_ABROAD_01","CEVT_19_NANO_01"];
const reimplement18 = ["CEVT_18_EARLY_01","CEVT_18_BRUNO_01","CEVT_18_CCH_01","CEVT_18_RELEG_01","CEVT_18_PLAYOFF_01","CEVT_19_AGENT_01","CEVT_19_INJ_01","CEVT_19_SOCIAL_01","CEVT_19_RETURN_01"];
const runtimeLegacy2023 = ["CEVT_20_ABR_01","CEVT_20_AGENT_01","CEVT_20_BODY_01","CEVT_20_BRUNO_01","CEVT_20_HOME_01","CEVT_20_LOAN_01","CEVT_21_ADRIAN_01","CEVT_21_CAPTAIN_01","CEVT_21_CONTRACT_01","CEVT_21_FAMILY_01","CEVT_21_NAT_01","CEVT_22_DEADLINE_01","CEVT_22_INJ_01","CEVT_22_LOANBUY_01","CEVT_22_RETURN_01"];
const canonicalMissing2023 = ["CEVT_20_RIVAS_01","CEVT_20_VELA_01","CEVT_20_PAULA_01","CEVT_20_NANO_01","CEVT_20_MONT_01","CEVT_20_ADR_01","CEVT_21_BIGCLUB_01","CEVT_21_LOAN_01","CEVT_21_AGENT_02","CEVT_21_INJ_01","CEVT_22_UDV_01","CEVT_22_BRUNO_02","CEVT_22_ADR_02","CEVT_22_SOC_02","CEVT_22_SHOCK_01"];
const reimplement2326 = ["CEVT_23_RIVAS_02","CEVT_23_MENA_02","CEVT_23_VELA_02","CEVT_23_BRUNO_03","CEVT_23_ADR_03","CEVT_23_NANO_02","CEVT_23_CLARA_03","CEVT_23_AGENT_03","CEVT_23_MED_02","CEVT_23_UDV_02","CEVT_24_CHAT_01","CEVT_24_TOURN_01","CEVT_24_TOURN_02","CEVT_24_OWNER_02","CEVT_24_SPONSOR_02","CEVT_24_FAM_02","CEVT_25_STAR_01","CEVT_25_AGENT_04","CEVT_25_BODY_02","CEVT_25_SHOCK_02"];
const exactRewrite2630 = ["CEVT_29_BODY_04","CEVT_29_HOME_03","CEVT_29_NAT_02","CEVT_29_PROJECT_02","CEVT_29_RECORD_02"];
const canonicalMissing2630 = ["CEVT_26_RIVAS_03","CEVT_26_MENA_03","CEVT_26_VELA_03","CEVT_26_BRUNO_04","CEVT_26_NANO_03","CEVT_26_CLARA_04","CEVT_26_AGENT_05","CEVT_26_FAMILY_03","CEVT_27_OWNER_03","CEVT_27_STAR_02","CEVT_27_BODY_03","CEVT_27_AWARD_02","CEVT_27_FINAL_02","CEVT_28_MEDIA_02","CEVT_28_TRANSFER_02","CEVT_28_DDL_02","CEVT_28_MANAGER_02","CEVT_28_MANAGER_03","CEVT_29_YOUTH_02"];
const runtimeOnly2630 = ["CEVT_26_AGENT_01","CEVT_26_BODY_01","CEVT_26_ELITE_01","CEVT_26_EUR_01","CEVT_26_HOME_01","CEVT_26_RIVAS_01","CEVT_27_CLUB_01","CEVT_27_FINAL_01","CEVT_27_MEDIA_01","CEVT_27_NANO_01","CEVT_27_RECORD_01","CEVT_27_SUCCESSOR_01","CEVT_28_BODY_01","CEVT_28_GALA_01","CEVT_28_HOME_01","CEVT_28_MKT_01","CEVT_28_NAT_01","CEVT_28_PROJECT_01","CEVT_29_WEALTH_01"];
const blocked3034 = ["CEVT_30_BODY_01","CEVT_30_PROJECT_01","CEVT_30_HOME_01","CEVT_30_NAT_01","CEVT_30_AGENT_01","CEVT_30_RIVAL_01","CEVT_30_FAN_01","CEVT_31_SURGERY_01","CEVT_31_SUCCESSOR_01","CEVT_31_COACH_01","CEVT_31_NTLOAD_01","CEVT_31_FINAL_01","CEVT_31_BUSINESS_01","CEVT_31_RIVAS_01","CEVT_32_RICH_01","CEVT_32_REPLACE_01","CEVT_32_HOME_01","CEVT_32_BOSMAN_01","CEVT_32_NT_01","CEVT_32_FAN_01","CEVT_33_RECOVERY_01","CEVT_33_RECORD_01","CEVT_33_RET_01","CEVT_33_HOME_01","CEVT_33_CONTRACT_01","CEVT_33_MARKET_01"];
const blocked34Career = ["CEVT_34_MAJOR_COMEBACK","CEVT_34_RENEWAL_GHOST","CEVT_34_ROLE_COLLAPSE","CEVT_34_HOME_CALL","CEVT_34_FAMILY_STOP","CEVT_34_MEDIA_END","CEVT_34_CAPTAIN_WITHOUT_MINUTES","CEVT_34_MARKET_DOWNGRADE","CEVT_35_BODY_SETBACK","CEVT_35_YOUNG_STARTER","CEVT_35_NT_EXCLUSION","CEVT_35_LATE_FINAL","CEVT_35_AGENT_SPLIT","CEVT_35_CLUB_LEGACY","CEVT_35_RICH_LAST","CEVT_35_INJURY_RETURN","CEVT_36_NO_MEDICAL_CLEARANCE","CEVT_36_COMEBACK_FINAL","CEVT_36_MARKET_SILENCE","CEVT_36_MENTOR_CONFLICT","CEVT_36_FAMILY_RETURN","CEVT_36_SELECTION_GOODBYE","CEVT_37_NO_LAST_DERBY","CEVT_37_RECORD_WINDOW","CEVT_37_HOME_CROWD","CEVT_37_PRIVATE_DOUBT"];
const terminal34 = ["CEVT_38_OFFER_AFTER_RETIREMENT_ANNOUNCED","CEVT_38_MEDIA_FAREWELL","CEVT_38_FAMILY_REVERSAL","CEVT_RET_RECONSIDER","CEVT_RET_STORYBOOK_LAST_GOAL","CEVT_RET_NO_LAST_MATCH"];

const exact2023 = [
  row("CEVT_21_ABR_01","20_23","needs_reimplementation",{
    canonicalSource:C18,runtimeSource:R2023,title:"Navidad solo",
    trigger:["ABROAD_ROUTE","foreignAdaptation < 60","short Christmas break"],
    timeWindow:{months:[12,1]},seedReads:["SEED_FOREIGN_ADAPT"],publicPrivateStatus:"private/social",
    choices:["return_home","stay_and_integrate","invite_or_create_local_company"],legacyIdentity:"same_id_distinct_scene",
    migrationStatus:"adjacent_contentIdentity_edge_required; preserve frozen legacy pending/history"
  }),
  row("CEVT_21_MEDIA_01","20_23","needs_reimplementation",{
    canonicalSource:C18,runtimeSource:R2023,title:"La frase recortada",
    trigger:["SEED_CLARA_CHANNEL OR PUBLIC/NATIONAL_HEAT high"],seedReads:["SEED_CLARA_CHANNEL"],npc:["NPC_PRS_01"],
    publicPrivateStatus:"public headline; private channel only if player uses it",
    choices:["publish_full_context","use_Clara_channel","do_not_amplify"],legacyIdentity:"same_id_distinct_scene",
    migrationStatus:"adjacent_contentIdentity_edge_required; preserve frozen legacy pending/history"
  }),
  row("CEVT_22_FREE_01","20_23","needs_reimplementation",{
    canonicalSource:C18,runtimeSource:R2023,title:"Oferta de enero para julio",
    trigger:["contract near expiry","formal interest required","buyer sporting crisis required"],
    contractRequirements:["contract.monthsRemaining <= 7","authoritative CareerOffer/formal interest"],
    incompatibilities:["monthsRemaining alone is insufficient"],legacyIdentity:"same_id_distinct_scene",
    migrationStatus:"shared_dependency: authoritative offer + buyer crisis facts required"
  })
];

const records = [
  ...verified18.map(id => row(id,"18_20","verified_same_identity",{
    canonicalSource:C18,runtimeSource:R1820,legacyIdentity:"same_string_id",migrationStatus:"none_required_while_definition_unchanged",
    ...(id==="CEVT_19_NANO_01" ? {title:"No me llames para arreglarme la vida",trigger:["UNSOLICITED_NANO_HELP","HAS_SEED_NANO_SHADOW"],seedReads:["SEED_NANO_SHADOW"],seedCreates:["SEED_NANO_SHADOW"],npc:["NPC_PLR_14"],knowledgeRequirements:["NPC_PLR_14 knows EVT_19_TEAM_001"],publicPrivateStatus:"private",choices:["APOLOGIZE","DEFEND","WITHDRAW"]} : {})
  })),
  ...reimplement18.map(id => row(id,"18_20","needs_reimplementation",{canonicalSource:C18,runtimeSource:R1820,legacyIdentity:"same_id_content_sensitive",migrationStatus:"same_id_rewrite_requires_adjacent_contentIdentity_edge_and_frozen_pending_legacy"})),
  ...runtimeLegacy2023.map(id => row(id,"20_23","engine_only_noncanonical",{canonicalSource:C18,runtimeSource:R2023,legacyIdentity:"runtime_only_legacy",migrationStatus:"retire_or_replace_safely; preserve history/pending"})),
  ...exact2023,
  ...canonicalMissing2023.map(id => row(id,"20_23","canonical_missing",{canonicalSource:C18,runtimeSource:null,legacyIdentity:"canonical_only",migrationStatus:"new_definition_requires_adjacent_contentIdentity_edge"})),
  ...reimplement2326.map(id => row(id,"23_26","needs_reimplementation",{canonicalSource:C2330,runtimeSource:R2326,legacyIdentity:"exact_id_runtime_not_certified",migrationStatus:"same_id_rewrite_requires_adjacent_contentIdentity_edge_and_pending_fingerprint"})),
  ...exactRewrite2630.map(id => row(id,"26_30","needs_reimplementation",{canonicalSource:C2330,runtimeSource:R2630,legacyIdentity:"exact_id_semantic_rewrite",migrationStatus:"same_id_distinct_scene_requires_frozen_pending_legacy"})),
  ...canonicalMissing2630.map(id => row(id,"26_30","canonical_missing",{canonicalSource:C2330,runtimeSource:null,legacyIdentity:"canonical_only_nonmapped",migrationStatus:"new_definition_requires_adjacent_contentIdentity_edge"})),
  ...runtimeOnly2630.map(id => row(id,"26_30","engine_only_noncanonical",{canonicalSource:C2330,runtimeSource:R2630,legacyIdentity:"runtime_lineage_candidate_or_legacy_only",migrationStatus:"no_alias; retire_or_replace_only_after_explicit_mapping"})),
  ...blocked3034.map(id => row(id,"30_34","blocked",{canonicalSource:"PR#13: authoritative conditional canon unavailable",runtimeSource:R3034,legacyIdentity:"runtime_identity_unresolved",migrationStatus:"blocked_until_authoritative_canonical_inventory"})),
  ...blocked34Career.map(id => row(id,"34_plus","blocked",{canonicalSource:"No authoritative nonterminal 34+ conditional canon artifact located",runtimeSource:R34,legacyIdentity:"runtime_identity_unresolved",migrationStatus:"blocked_until_authoritative_canonical_inventory"})),
  ...terminal34.map(id => row(id,"34_plus","terminal_owned_elsewhere",{canonicalSource:"Agent 14 / retirement terminal ownership",runtimeSource:R34,owner:"t5/retirement-epilogues (Agent 14)",legacyIdentity:"terminal_runtime_identity",migrationStatus:"terminal_owner_controls_migration"}))
];

const byStatus = Object.fromEntries([...new Set(records.map(r => r.implementationStatus))].sort().map(status => [status, records.filter(r => r.implementationStatus === status).length]));

export const CONDITIONAL_CANON_MATRIX = {
  schemaVersion: 1,
  generatedAt: "2026-09-16",
  repository: "capitanps02/Juego-Multihistoria",
  branch: "t51/canon-conditionals",
  baselineMainSha: "6cb81b63f03ce55776ca97075012cfaa22ac228d",
  runtimeActiveCount: 134,
  reconciliationUniverseCount: 168,
  reconciliationUniverseRule: "Union of identifiable canonical and runtime conditional identities. 30–34 and nonterminal 34+ are blocked rather than guessed, so 168 is the currently identifiable reconciliation universe.",
  phaseSummary: {
    "18_23": {runtimeActive:32,canonical:32,union:47},
    "23_26": {runtimeActive:20,canonical:20,union:20},
    "26_30": {runtimeActive:24,canonical:24,union:43},
    "30_34": {runtimeActive:26,canonical:"blocked_unknown_authoritative_inventory",unionIdentified:26},
    "34_plus": {runtimeActive:32,terminalExcluded:6,nonterminalBlocked:26,unionIdentified:32}
  },
  statusSummary: byStatus,
  records
};

export default CONDITIONAL_CANON_MATRIX;
