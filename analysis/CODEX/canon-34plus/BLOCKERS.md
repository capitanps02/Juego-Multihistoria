# Canon 34+ blockers

Every ordinary Agent-8 principal now has a canonical card. Remaining blockers are shared-authority or lineage work and must be consumed from their named owner contracts rather than solved with narrative proxies.

## B1 — Successive content lineage
**Owner:** shared integration.  
**Issue:** **#59**.  
**Missing contract:** deterministic successive content migration/source evidence through the actual immediately preceding canonical generation.  
**Effect:** all 43 ordinary cards are prepared, but Agent 8 must not freeze/register a provisional 34+ content identity, migration shortcut or history rewrite before final 30–34 is authoritative.

## B2 — 34+ seed catalog/lifecycle integration
**Owner:** T5.2 / Agent 2 with Agent-8 owner decision supplied.  
**Evidence:** `SEED_OWNERSHIP.md` and `T52_SEED_HANDOFF.json`.  
**Missing contract:** apply the owner classification: 14 bridge-memory technical concepts are not automatic age-34 producers; Pasada 7 has 54 exact canonical seed identities (45 ordinary producers, 9 terminal producers). Catalog/migration must preserve historical provenance and avoid heuristic aliases.  
**Prepared:** exact producer ownership and canonical seed list are resolved. A representative exact Pasada-7 ID is still absent from current `main`, so this handoff has not yet landed.

## B3 — Match, usage, record and concrete national-selection facts
**Owner:** shared sport/national authority.  
**Relevant downstream issues:** **#174** for concrete national-team preselection/final squad facts; **#124** for shared factual match/calendar/competition context. Richer authoritative club fixture participation is also being developed in the shared match-authority workstream referenced by Agent 9 / PR #118.  
**Current progress on main:** `resolveNationalTeamAuthority()` certifies historical national-team participation, simulator-pool state, aggregate role/standing, tournament-cycle window and international-retirement state. International retirement stops future national caps/windows while leaving `retirement.status == "playing"`.  
**Still missing:** the resolver deliberately reports `concreteCallupKnown=false` and `tournamentSquadKnown=false`. A current prelist, call-up, omission or tournament squad cannot be inferred from caps, standing, role, gate or cycle flags. Fixture/current competition, recent starts/minutes/bench, goals/results, final participation, records and penalty opportunities must likewise come from factual producers.  
**Affected Wave-C examples:** `EVT_34_ROLE_001`, `EVT_34_LOAD_001`, `EVT_34_BODY_001`, `EVT_34_MATCH_001`, `EVT_34_NT_001`, `EVT_34_NT_002`, `EVT_34_FAN_001`, `EVT_34_TRAVEL_001`, `EVT_35_TACT_001`, `EVT_35_BENCH_001`, `EVT_35_RECORD_001`, `EVT_35_NT_001`, `EVT_35_FINAL_001`, `EVT_36_BODY_001`, `EVT_36_RECORD_001`, `EVT_37_PEN_001`.

## B4 — Veteran offer generation / contract representability
**Owner:** shared market/contract authority.  
**Issue:** **#176 — authoritative veteran 34+ `CareerOffer` generation and late-career terms**.  
**Missing contract:** authoritative generation of veteran renewals/transfers/short offers plus an explicit representability decision for canonical bonus/exit/role/liaison/ambassador semantics that are not fully encoded in current `CareerTerms`.  
`CareerOffer` and `respondToOffer()` are authoritative, but normal club renewal intent still rejects `age >= 34`; narrative content must never manufacture the missing offer.  
**Wave-B coverage:** 18 scenes, including `EVT_35_DUAL_001` as B+D and `EVT_37_SHORT_001` as B+E. Full membership lives in `WAVE_B_COMPLETE_INDEX.json`.

## B5 — Free agency / expired employment
**Owner:** shared market/employment state.  
**Issue:** **#130 — contract-expiry zombie / authoritative free-agency semantics**.  
**Missing contract:** authoritative unattached-player state including club/owner/registration/salary/sporting semantics.  
`monthsRemaining <= 0` is deliberately `expired_pending_resolution`, not free agency.  
**Affected:** `EVT_37_SHORT_001` requires an actual free agent 37+ before its three-month offer premise can exist; `EVT_38_MARKET_001` requires actual free agency plus weeks of factual market silence. No-offer must never imply retirement.

## B6 — Late-career NPC/squad authority
**Owner:** shared T5.3 / NPC / affiliation authority.  
**Issue:** **#177 — authoritative late-career coach, successor, peer and institutional NPC identity**.  
`resolveActiveAgent()` is integrated and may be used fail-closed. Current-club institutional NPC certification remains sparse and does not cover ordinary 34+ clubs. Successor/current-coach/peer identities require factual affiliation/career evidence.  
**Affected:** `EVT_34_DORSAL_001`, `EVT_34_MENTOR_001`, `EVT_35_DUAL_001`, `EVT_35_AGT_001`, `EVT_35_RECORD_001`, `EVT_36_CCH_001`, `EVT_36_PEER_001`. Agent scenes may use a certified `activeAgent`; they cannot fabricate a replacement representative.

## B7 — Terminal career retirement
**Owner:** Agent 9 / **PR #118**.  
Terminal-owned principals: `EVT_37_ANNOUNCE_001`, `EVT_RET_FAM_001`, `EVT_RET_BODY_001`, `EVT_RET_HIGH_001`, `EVT_RET_LOW_001`, `EVT_RET_ANNOUNCE_001`, `EVT_RET_LASTMATCH_001`.  
Agent 8 may expose ordinary scenes whose choices include a career-retirement option, but the terminal state transition/announcement/closure is delegated to Agent 9. International retirement is separate and represented by shared national-team authority.

## Closure rule for Agent 8
Agent 8 does not close these shared issues by adding proxies to narrative content. An ordinary scene becomes eligible for implementation only when Wave 0 plus every named downstream authority in `AUTHORITY_MATRIX.json` is factual on the current integration base. Until then its canonical card remains prepared-but-blocked.
