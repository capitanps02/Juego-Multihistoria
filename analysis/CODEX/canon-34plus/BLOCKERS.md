# Canon 34+ blockers

## B1 — Content lineage
**Owner:** shared integration / issue #59.  
All new/reimplemented canonical scenes change the active content catalog. Scene code may be prepared on the branch, but no contentIdentity freeze, source-evidence registration or global migration edge belongs here.

## B2 — 34+ seed lifecycle
**Owner:** Agent 2.  
The T5.2 handoff still reports all 68 declared 34+ seeds without accredited runtime producers and consumers, with placeholder `PASADA_7_34_PLUS` origins. Exact canonical source seed names must be mapped to runtime identities/scopes/closure classes before an event can be credited complete.

## B3 — Sport / match / selection facts
**Owner:** Agent 4 (`t5/sport-context`, PR/issue chain referenced by Agent 9).  
Current main lacks an authoritative fixture, match, squad-call, recent-minutes, start/bench, goal/result and current selection store. Aggregate appearances are not a substitute.

## B4 — Active agent / institutional NPC authority
**Owner:** NPC shared authority.  
`resolveActiveAgent()` exists off-main and fails closed. Do not infer active agent from `agentControl`, contact flags or seeds. Late-career director/coach/captain identities also require certification.

## B5 — Free agency / expired contract
**Owner:** market/shared state.  
`CareerOffer` queries and `respondToOffer()` are now on main, but `contractEmploymentStatus()` intentionally classifies `monthsRemaining <= 0` as `expired_pending_resolution`, not free agency. Scenes that require an unattached player remain blocked.

## B6 — Terminal retirement
**Owner:** Agent 9 / PR #118.  
`EVT_37_ANNOUNCE_001`, `EVT_RET_FAM_001`, `EVT_RET_BODY_001`, `EVT_RET_HIGH_001`, `EVT_RET_LOW_001`, `EVT_RET_ANNOUNCE_001`, `EVT_RET_LASTMATCH_001` are terminal-owned. Agent 8 only supplies pre-terminal facts/pressure.