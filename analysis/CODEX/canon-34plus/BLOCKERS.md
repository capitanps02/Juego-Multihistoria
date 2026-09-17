# Canon 34+ blockers

## B1 — Successive content lineage
**Owner:** shared integration.  
**Issue:** #59.  
**Missing contract:** deterministic A→B→C content migration/source evidence for successive canonical generations.  
**Effect:** 34+ scene code can be prepared, but no target contentIdentity, global migration edge, history rewrite or freeze belongs to this branch.

## B2 — 34+ seed catalog/lifecycle integration
**Owner:** T5.2 / Agent 2 with Agent-8 owner decision now supplied.  
**Evidence:** `SEED_OWNERSHIP.md`.  
**Missing contract:** apply the owner classification: 14 bridge-memory technical concepts are not 14 automatic age-34 producers; Pasada 7 has 54 exact canonical seed identities (45 ordinary producers, 9 terminal producers). Catalog/migration must preserve historical provenance and avoid heuristic aliases.  
**What is prepared:** exact producer ownership and canonical seed list are resolved.

## B3 — Match, usage and selection facts
**Owner:** sport authority / Agent 4.  
**Missing contract:** fixtures, current competition, squad call, recent starts/minutes/bench, goals/results, remaining matches and current national-selection facts.  
`getSportContext()` is now on main but intentionally returns these facts as unavailable. `football-moments` currently registers only specific earlier penalty moments and does not authorize synthetic 34+ matches.  
**Affected examples:** `EVT_34_ROLE_001`, `EVT_34_LOAD_001`, `EVT_34_MATCH_001`, `EVT_34_NT_001`, `EVT_34_NT_002`, `EVT_35_BENCH_001`, `EVT_35_NT_001`, `EVT_35_FINAL_001`, `EVT_36_BODY_001`, `EVT_36_RECORD_001`, `EVT_37_PEN_001`.

## B4 — Veteran offer generation / contract representability
**Owner:** market/shared authority.  
**Missing contract:** authoritative generation of veteran renewals/transfers/short offers plus any canonical role/objective clauses that are not representable in `CareerTerms`.  
`CareerOffer` and `respondToOffer()` are authoritative, but normal club renewal intent still rejects `age >= 34`; market handoff reports 34+ Codex-ready count 0.  
**Affected examples:** `EVT_34_BRIDGE_001`, `EVT_34_PAY_001`, `EVT_34_HOME_001`, `EVT_34_AGT_001`, `EVT_34_CON_001`, `EVT_34_MAR_001`, `EVT_35_MKT_001`, `EVT_35_CON_001`, `EVT_35_JAN_001`, `EVT_36_CON_001`, `EVT_36_LOWER_001`, `EVT_37_SHORT_001`, `EVT_37_HOME_001`, `EVT_38_RICH_001`.

## B5 — Free agency / expired employment
**Owner:** market/shared state.  
**Missing contract:** authoritative unattached player state including club/owner/registration/salary/sporting semantics.  
`monthsRemaining <= 0` is deliberately `expired_pending_resolution`, not free agency.  
**Affected:** especially `EVT_38_MARKET_001`; no-offer must not imply retirement.

## B6 — Late-career NPC/squad authority
**Owner:** NPC/locker shared authority.  
`resolveActiveAgent()` is now integrated and may be used fail-closed. Current-club institutional NPC certification is still sparse and does not cover ordinary 34+ clubs. Successor/current-coach/peer identities require factual affiliation/career evidence.  
**Affected examples:** `EVT_34_DORSAL_001`, `EVT_34_MENTOR_001`, `EVT_35_DUAL_001`, `EVT_35_RECORD_001`, `EVT_36_CCH_001`, `EVT_36_PEER_001`. Agent scenes may use `activeAgent`, but cannot fabricate a replacement representative.

## B7 — Terminal retirement
**Owner:** Agent 9 / PR #118.  
**Missing contract on Agent-8 branch:** none should be invented here.  
Terminal-owned principals: `EVT_37_ANNOUNCE_001`, `EVT_RET_FAM_001`, `EVT_RET_BODY_001`, `EVT_RET_HIGH_001`, `EVT_RET_LOW_001`, `EVT_RET_ANNOUNCE_001`, `EVT_RET_LASTMATCH_001`. Agent 8 only prepares factual pre-terminal state/pressure.