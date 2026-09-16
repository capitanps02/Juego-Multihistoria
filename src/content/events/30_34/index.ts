import type { EventDefinition } from "../../../core/types.js";
import { PRINCIPAL_EVENTS_30_34 } from "./principal-events.js";
import { CONDITIONAL_EVENTS_30_34 } from "./conditional-events.js";
import { CANONICAL_REIMPLEMENTATIONS_30_34 } from "./canonical-reimplementations.js";
import { CANONICAL_REIMPLEMENTATIONS_31B } from "./canonical-reimplementations-31b.js";
import { CANONICAL_REIMPLEMENTATIONS_32A } from "./canonical-reimplementations-32a.js";
import { CANONICAL_REIMPLEMENTATIONS_33A } from "./canonical-reimplementations-33a.js";

const reimplementedIds=new Set([
  "EVT_30_CON_001","EVT_30_BODY_001","EVT_30_MKT_001","EVT_30_NAT_001",
  "EVT_30_FAM_001","EVT_30_MED_001","EVT_30_FORM_001","EVT_30_CAP_001",
  "EVT_31_MED_001","EVT_31_MKT_001","EVT_31_HOME_001","EVT_31_AGT_001",
  "EVT_31_LEGACY_001","EVT_31_RETURN_001","EVT_31_TACT_001","EVT_31_CCH_001",
  "EVT_31_NAT_001","EVT_31_FINAL_001",
  "EVT_32_CON_001","EVT_32_HOME_001","EVT_32_AGT_001","EVT_32_FAN_001","EVT_32_NAT_001",
  "EVT_33_BODY_001","EVT_33_CAP_001","EVT_33_MKT_001","EVT_33_PRS_001"
]);
const overrides=new Map([
  ...CANONICAL_REIMPLEMENTATIONS_30_34,
  ...CANONICAL_REIMPLEMENTATIONS_31B,
  ...CANONICAL_REIMPLEMENTATIONS_32A,
  ...CANONICAL_REIMPLEMENTATIONS_33A
].map(event=>[event.id,event]));

/**
 * The canonical trigger for EVT_30_CON_001 is
 * "contract <= 18 months OR club wants to renew". The current GameState has
 * no explicit club-renewal-intent signal. Requiring only monthsRemaining<=18
 * produced a false negative for existing deterministic careers that represent
 * the unmodelled second branch of the OR. Keep the event reachable until that
 * state exists; the event remains a technical adaptation, not verified canon.
 */
const preserveUnmodelledTriggerBranches=(event:EventDefinition):EventDefinition=>{
  if(event.id!=="EVT_30_CON_001") return event;
  return {
    ...event,
    gates:[],
    tags:[...new Set([
      ...(event.tags??[]),
      "t51_trigger_approximation",
      "t51_unmodelled_club_renewal_proxy"
    ])]
  };
};

const principal:EventDefinition[]=PRINCIPAL_EVENTS_30_34.map(original=>{
  const selected=overrides.get(original.id)??original;
  const event=preserveUnmodelledTriggerBranches(selected);
  if(!reimplementedIds.has(event.id)) return event;
  const tags=[...(event.tags??[]).filter(tag=>tag!=="t51_verified_same_identity"),"t51_canonical_reimplementation"];
  return {...event,canonStatus:"technical_adaptation",tags:[...new Set(tags)]};
});

export const EVENTS_30_34=[...principal,...CONDITIONAL_EVENTS_30_34];
