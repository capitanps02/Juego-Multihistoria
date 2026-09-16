import type { Condition, EventDefinition } from "../../../core/types.js";
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

const canonicalRenewalAlternatives:Condition[][]=[
  [{path:"contract.monthsRemaining",op:"lte",value:18}],
  [{path:"facts.clubWantsRenewal",op:"eq",value:true}]
];

/**
 * EVT_30_CON_001 canon: contract <=18 months OR the current club wants to renew.
 * The shared T5.1 condition root now exposes facts.clubWantsRenewal, so this event
 * can use the exact event-level OR contract instead of the previous reachability
 * proxy. Trigger parity alone does not prove full canonical identity.
 */
const applyCanonicalSharedTriggers=(event:EventDefinition):EventDefinition=>{
  if(event.id!=="EVT_30_CON_001") return event;
  return {
    ...event,
    gates:[],
    gateAlternatives:canonicalRenewalAlternatives,
    tags:(event.tags??[]).filter(tag=>
      tag!=="t51_trigger_approximation" && tag!=="t51_unmodelled_club_renewal_proxy"
    )
  } as EventDefinition & {gateAlternatives:Condition[][]};
};

const principal:EventDefinition[]=PRINCIPAL_EVENTS_30_34.map(original=>{
  const selected=overrides.get(original.id)??original;
  const event=applyCanonicalSharedTriggers(selected);
  if(!reimplementedIds.has(event.id)) return event;
  const tags=[...(event.tags??[]).filter(tag=>tag!=="t51_verified_same_identity"),"t51_canonical_reimplementation"];
  return {...event,canonStatus:"technical_adaptation",tags:[...new Set(tags)]};
});

export const EVENTS_30_34=[...principal,...CONDITIONAL_EVENTS_30_34];
