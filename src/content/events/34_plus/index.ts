import { PRINCIPAL_EVENTS_34_PLUS } from "./principal-events.js";
import { CONDITIONAL_EVENTS_34_PLUS } from "./conditional-events.js";
import { applyCanonical34PlusTerminalOverrides } from "./canonical-terminal-overrides.js";

applyCanonical34PlusTerminalOverrides(PRINCIPAL_EVENTS_34_PLUS,CONDITIONAL_EVENTS_34_PLUS);

const canonicalReplacements=[
  ["EVT_38_MKT_001","EVT_38_MARKET_001"],
  ["EVT_RET_HOME_001","EVT_RET_FAM_001"],
  ["EVT_RET_LAST_001","EVT_RET_LASTMATCH_001"]
] as const;

for(const [legacyId,canonicalId] of canonicalReplacements){
  if(PRINCIPAL_EVENTS_34_PLUS.some(event=>event.id===canonicalId)){
    throw new Error(`Duplicate canonical 34+ event id ${canonicalId}`);
  }
  const event=PRINCIPAL_EVENTS_34_PLUS.find(candidate=>candidate.id===legacyId);
  if(!event) throw new Error(`Missing legacy source event ${legacyId} for canonical replacement ${canonicalId}`);
  event.id=canonicalId;
  event.tags=[
    ...(event.tags??[]).filter(tag=>!tag.startsWith("canonical_alias:")&&!tag.startsWith("legacy_history_only:")),
    `legacy_history_only:${legacyId}`,
    "t51_canonical"
  ];
  event.canonStatus="verified";
}

export const EVENTS_34_PLUS=[...PRINCIPAL_EVENTS_34_PLUS,...CONDITIONAL_EVENTS_34_PLUS];
