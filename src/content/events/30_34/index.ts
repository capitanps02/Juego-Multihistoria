import type { EventDefinition } from "../../../core/types.js";
import { PRINCIPAL_EVENTS_30_34 } from "./principal-events.js";
import { CONDITIONAL_EVENTS_30_34 } from "./conditional-events.js";
import { CANONICAL_REIMPLEMENTATIONS_30_34 } from "./canonical-reimplementations.js";
import { CANONICAL_REIMPLEMENTATIONS_31B } from "./canonical-reimplementations-31b.js";

const reimplementedIds=new Set([
  "EVT_30_CON_001","EVT_30_BODY_001","EVT_30_MKT_001","EVT_30_NAT_001",
  "EVT_30_FAM_001","EVT_30_MED_001","EVT_30_FORM_001","EVT_30_CAP_001",
  "EVT_31_MED_001","EVT_31_MKT_001","EVT_31_HOME_001","EVT_31_AGT_001",
  "EVT_31_LEGACY_001","EVT_31_RETURN_001","EVT_31_TACT_001","EVT_31_CCH_001",
  "EVT_31_NAT_001","EVT_31_FINAL_001"
]);
const overrides=new Map([...CANONICAL_REIMPLEMENTATIONS_30_34,...CANONICAL_REIMPLEMENTATIONS_31B].map(event=>[event.id,event]));
const principal:EventDefinition[]=PRINCIPAL_EVENTS_30_34.map(original=>{
  const event=overrides.get(original.id)??original;
  if(!reimplementedIds.has(event.id)) return event;
  const tags=[...(event.tags??[]).filter(tag=>tag!=="t51_verified_same_identity"),"t51_canonical_reimplementation"];
  return {...event,canonStatus:"technical_adaptation",tags:[...new Set(tags)]};
});

export const EVENTS_30_34=[...principal,...CONDITIONAL_EVENTS_30_34];
