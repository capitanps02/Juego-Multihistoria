export type ExternalChoiceActionKind =
  | "read_only_fact"
  | "market_accept"
  | "market_reject"
  | "market_counter"
  | "market_defer"
  | "market_request"
  | "market_open_interest"
  | "national_materialize_publication"
  | "national_read"
  | "sport_read"
  | "rich_sport_read"
  | "coach_read"
  | "actor_read"
  | "peer_retirement_read"
  | "agent9_retirement_intent";

export interface ExternalChoiceAction {
  eventId:string;
  choiceId:string;
  kind:ExternalChoiceActionKind;
  authorityOwner:string;
  note:string;
}

const rows = [
["EVT_34_BRIDGE_001","A","market_accept","#157/#176","accept the real renewal only through market authority"],
["EVT_34_BRIDGE_001","B","market_counter","#157/#176","request role clarification/terms without direct contract mutation"],
["EVT_34_BRIDGE_001","C","market_defer","#157/#176","defer current negotiation"],
["EVT_34_BRIDGE_001","D","market_request","#157/#176","request an exit pathway; do not move club"],
["EVT_34_PAY_001","A","market_accept","#157/#176","accept the real pay-cut renewal"],
["EVT_34_PAY_001","B","market_counter","#157/#176","counter with supported bonus/term representation only"],
["EVT_34_PAY_001","C","market_reject","#157/#176","reject formal renewal"],
["EVT_34_PAY_001","D","market_open_interest","#157/#176","publicly listen; does not create another offer"],
["EVT_34_HOME_001","A","market_accept","#157/#176","accept real UDV offer"],
["EVT_34_HOME_001","B","market_counter","#157/#176","use only factual concurrent offers in negotiation"],
["EVT_34_HOME_001","C","market_counter","#157/#176","request supported sporting context/terms"],
["EVT_34_HOME_001","D","market_defer","#157/#176","defer without manufacturing next-year offer"],
["EVT_34_AGT_001","A","market_defer","#157/#176","wait while current real offer may expire"],
["EVT_34_AGT_001","B","market_accept","#157/#176","accept current eligible formal offer"],
["EVT_34_AGT_001","C","market_open_interest","#157/#176","contact does not manufacture future offer"],
["EVT_34_AGT_001","D","read_only_fact","active-agent authority","ask for evidence; no offer mutation"],
["EVT_34_CON_001","A","market_accept","#157/#176","accept only if conditional-exit term is authoritatively representable"],
["EVT_34_CON_001","B","market_counter","#157/#176","request bilateral exit semantics"],
["EVT_34_CON_001","C","market_counter","#157/#176","counter to one year"],
["EVT_34_CON_001","D","market_reject","#157/#176","reject offer"],
["EVT_34_MAR_001","A","market_request","#157/#176","request meeting"],
["EVT_34_MAR_001","B","market_open_interest","#157/#176","open outside negotiation without inventing offer"],
["EVT_34_MAR_001","C","market_defer","#157/#176","wait until April"],
["EVT_34_MAR_001","D","market_open_interest","#157/#176","public signal only"],
["EVT_35_MKT_001","A","market_accept","#157/#176","accept specialist offer only by exact offer id"],
["EVT_35_MKT_001","B","market_accept","#157/#176","accept starter-context offer only by exact offer id"],
["EVT_35_MKT_001","C","market_accept","#157/#176","accept UDV offer only by exact offer id"],
["EVT_35_MKT_001","D","market_defer","#157/#176","wait; no fourth offer is fabricated"],
["EVT_35_CON_001","A","market_accept","#157/#176","accept supported physical-objective terms only"],
["EVT_35_CON_001","B","market_counter","#157/#176","counter with supported collective-bonus structure"],
["EVT_35_CON_001","C","market_counter","#157/#176","counter guaranteed salary"],
["EVT_35_CON_001","D","market_reject","#157/#176","reject offer"],
["EVT_35_FAREWELL_001","A","market_reject","#157/#176","decline renewal / leave-club path only; never retire career"],
["EVT_35_FAREWELL_001","B","market_accept","#157/#176","accept real renewal"],
["EVT_35_FAREWELL_001","C","market_reject","#157/#176","leave without ceremony; never retire career"],
["EVT_35_FAREWELL_001","D","market_request","#157/#176","request homage independently of contract"],
["EVT_35_AGT_001","A","market_request","#157/#176","self-represented negotiation through formal market authority"],
["EVT_35_AGT_001","B","read_only_fact","active-agent authority","keep certified active agent"],
["EVT_35_AGT_001","C","read_only_fact","active-agent authority","change fee structure without inventing agent identity"],
["EVT_35_AGT_001","D","market_request","active-agent authority","request agent change; persistent replacement needs certification"],
["EVT_35_JAN_001","A","market_accept","#157/#176","accept real January offer"],
["EVT_35_JAN_001","B","market_reject","#157/#176","reject and remain"],
["EVT_35_JAN_001","C","market_counter","#157/#176","request supported short-loan terms"],
["EVT_35_JAN_001","D","market_defer","#157/#176","defer conditioned on future factual usage; no guarantee fabricated"],
["EVT_35_HOME_001","A","market_open_interest","#176","call UDV; this opens interest, not offer"],
["EVT_35_HOME_001","B","read_only_fact","#176","wait for factual UDV approach"],
["EVT_35_HOME_001","C","read_only_fact","#176","no market mutation"],
["EVT_35_HOME_001","D","market_open_interest","#176","public door-open signal only"],
["EVT_36_CON_001","A","market_accept","#157/#176","accept real two-year renewal"],
["EVT_36_CON_001","B","market_counter","#157/#176","counter to one year"],
["EVT_36_CON_001","C","market_defer","#157/#176","wait for market"],
["EVT_36_CON_001","D","market_counter","#157/#176","bilateral-exit term must be representable"],
["EVT_36_LOWER_001","A","market_accept","#157/#176","accept real lower-tier offer"],
["EVT_36_LOWER_001","B","agent9_retirement_intent","Agent9","record intent only; Agent 9 owns transition"],
["EVT_36_LOWER_001","C","market_open_interest","#176","seek UDV interest, no synthetic offer"],
["EVT_36_LOWER_001","D","market_defer","#157/#176","wait"],
["EVT_37_SHORT_001","A","market_accept","#157/#130/#176","accept real three-month offer while authoritatively unattached"],
["EVT_37_SHORT_001","B","market_reject","#157/#130/#176","reject offer"],
["EVT_37_SHORT_001","C","market_counter","#157/#130/#176","automatic option only if representable"],
["EVT_37_SHORT_001","D","market_accept","#157/#130/#176","accept current terms without future promise"],
["EVT_37_HOME_001","A","market_accept","#157/#130/#176","accept real UDV short-return offer"],
["EVT_37_HOME_001","B","market_counter","#157/#130/#176","request full-year terms"],
["EVT_37_HOME_001","C","market_reject","#157/#130/#176","remain outside UDV"],
["EVT_37_HOME_001","D","market_counter","#157/#130/#176","sporting-need condition only if authority can represent it"],
["EVT_38_RICH_001","A","market_accept","#157/#176","accept real high-value offer"],
["EVT_38_RICH_001","B","agent9_retirement_intent","Agent9","record refusal + retirement intent only"],
["EVT_38_RICH_001","C","market_counter","#157/#176/#207","minimum sporting calendar/role only if rich context supports it"],
["EVT_38_RICH_001","D","market_counter","#157/#176","counter to six months"],
["EVT_34_NT_001","A","national_materialize_publication","#174","persist canonical pre-list inclusion and stay available"],
["EVT_34_NT_001","B","national_materialize_publication","#174","persist pre-list inclusion and clarity request"],
["EVT_34_NT_001","C","read_only_fact","#174/Agent9-boundary","international retirement only; never career retirement"],
["EVT_34_NT_001","D","national_materialize_publication","#174","persist availability posture"],
["EVT_34_NT_002","A","national_materialize_publication","#174","persist factual omission then contact coach"],
["EVT_34_NT_002","B","national_materialize_publication","#174","persist factual omission and public support"],
["EVT_34_NT_002","C","read_only_fact","#174/Agent9-boundary","international retirement only"],
["EVT_34_NT_002","D","national_materialize_publication","#174","persist omission and wait"],
["EVT_35_NT_001","A","national_materialize_publication","#174","persist emergency call-up acceptance"],
["EVT_35_NT_001","B","national_materialize_publication","#174","persist declined emergency call-up"],
["EVT_35_NT_001","C","national_materialize_publication","#174","accept only competitive role if authority supports status"],
["EVT_35_NT_001","D","national_materialize_publication","#174","persist pending response window"],
["EVT_34_MATCH_001","A","rich_sport_read","#199","goal/result must already be factual; choice only changes stance"],
["EVT_34_MATCH_001","B","rich_sport_read","#199","consume factual decisive goal"],
["EVT_34_MATCH_001","C","rich_sport_read","#199","consume factual decisive goal"],
["EVT_34_MATCH_001","D","market_request","#199/#176","use factual performance to request renewal; no synthetic offer"],
["EVT_34_TRAVEL_001","A","rich_sport_read","#199","consume factual team win while omitted"],
["EVT_34_TRAVEL_001","B","sport_read","#124","request next role without writing start"],
["EVT_34_TRAVEL_001","C","read_only_fact","#124","keep plan"],
["EVT_34_TRAVEL_001","D","read_only_fact","#124","travel preference only"],
["EVT_35_TACT_001","A","rich_sport_read","#199","consume factual positive reinvention performance"],
["EVT_35_TACT_001","B","rich_sport_read","#199","keep versatility"],
["EVT_35_TACT_001","C","market_open_interest","#199/#176","seek club; no offer fabricated"],
["EVT_35_TACT_001","D","market_request","#199/#176","request renewal using factual performance"],
["EVT_35_RECORD_001","A","rich_sport_read","#199","consume factual record surpassed"],
["EVT_35_RECORD_001","B","rich_sport_read","#199","consume record fact"],
["EVT_35_RECORD_001","C","rich_sport_read","#199","consume record fact"],
["EVT_35_RECORD_001","D","actor_read","#199","generic actor allowed; record fact remains authoritative"],
["EVT_35_FINAL_001","A","sport_read","#124/#199","consume factual final/usage plan"],
["EVT_35_FINAL_001","B","sport_read","#124/#199","request readiness without changing lineup"],
["EVT_35_FINAL_001","C","sport_read","#124/#199","accept factual plan"],
["EVT_35_FINAL_001","D","market_open_interest","#124/#199/#176","post-final market interest only"],
["EVT_36_BODY_001","A","rich_sport_read","#199","consume factual congestion/performance pattern"],
["EVT_36_BODY_001","B","rich_sport_read","#199","consume pattern; staff selects later"],
["EVT_36_BODY_001","C","rich_sport_read","#199","competition priority requires factual schedule"],
["EVT_36_BODY_001","D","rich_sport_read","#199","league priority requires factual schedule"],
["EVT_36_RECORD_001","A","rich_sport_read","#199","consume factual 700-match milestone opportunity"],
["EVT_36_RECORD_001","B","rich_sport_read","#199","rest; milestone stays factual"],
["EVT_36_RECORD_001","C","sport_read","#124/#199","substitution only if actual match later permits it"],
["EVT_36_RECORD_001","D","read_only_fact","#199","do not communicate milestone"],
["EVT_37_PEN_001","A","rich_sport_read","#199","penalty assignment/opportunity must already be factual"],
["EVT_37_PEN_001","B","rich_sport_read","#199","same"],
["EVT_37_PEN_001","C","rich_sport_read","#199","same"],
["EVT_37_PEN_001","D","rich_sport_read","#199","same"],
["EVT_34_DORSAL_001","A","actor_read","club/squad authority","consume factual shirt request"],
["EVT_34_DORSAL_001","B","actor_read","club/squad authority","consume factual shirt request"],
["EVT_34_DORSAL_001","C","actor_read","club/squad authority","requires factual young player"],
["EVT_34_DORSAL_001","D","actor_read","club/squad authority","defer request"],
["EVT_34_MENTOR_001","A","actor_read","club/squad authority","consume factual young competitor request"],
["EVT_34_MENTOR_001","B","actor_read","club/squad authority","same"],
["EVT_34_MENTOR_001","C","actor_read","club/squad authority","same"],
["EVT_34_MENTOR_001","D","actor_read","club/squad authority","same"],
["EVT_35_DUAL_001","A","market_accept","#157/#176","accept player-liaison offer only if represented"],
["EVT_35_DUAL_001","B","market_counter","#157/#176","counter role/terms"],
["EVT_35_DUAL_001","C","market_reject","#157/#176","reject hybrid role"],
["EVT_35_DUAL_001","D","market_defer","#157/#176","defer"],
["EVT_36_CCH_001","A","coach_read","#169/PR210","consume factual recent coach change"],
["EVT_36_CCH_001","B","coach_read","#169/PR210","same"],
["EVT_36_CCH_001","C","coach_read","#169/PR210","same"],
["EVT_36_CCH_001","D","coach_read","#169/PR210","same"],
["EVT_36_PEER_001","A","peer_retirement_read","external peer history","exact peer + retirement history required"],
["EVT_36_PEER_001","B","peer_retirement_read","external peer history","same"],
["EVT_36_PEER_001","C","peer_retirement_read","external peer history","same"],
["EVT_36_PEER_001","D","peer_retirement_read","external peer history","same"],
["EVT_38_MARKET_001","A","market_accept","#157/#130/#176","accept factual lower-salary offer if one exists"],
["EVT_38_MARKET_001","B","market_accept","#157/#130/#176","accept factual lower-level offer if one exists"],
["EVT_38_MARKET_001","C","market_defer","#157/#130/#176","continue waiting with factual elapsed silence"],
["EVT_38_MARKET_001","D","agent9_retirement_intent","Agent9","retirement intent only; no A8 terminal transition"],
["EVT_38_MARKET_001","E","market_open_interest","#176","call UDV; no offer fabricated"]
] as const satisfies readonly (readonly [string,string,ExternalChoiceActionKind,string,string])[];

export const EXTERNAL_PRINCIPAL_CHOICE_ACTIONS:readonly ExternalChoiceAction[]=rows.map(
 ([eventId,choiceId,kind,authorityOwner,note])=>({eventId,choiceId,kind,authorityOwner,note})
);

export function externalChoiceAction(eventId:string,choiceId:string):ExternalChoiceAction|null{
 return EXTERNAL_PRINCIPAL_CHOICE_ACTIONS.find(row=>row.eventId===eventId&&row.choiceId===choiceId)??null;
}
