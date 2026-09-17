# Canon 34+ blockers

Every ordinary Agent-8 principal now has a canonical card. Remaining blockers are shared-authority or lineage work and must be consumed from their named owner contracts rather than solved with narrative proxies.

## B1 — Successive content lineage
**Owner:** shared integration.  
**Issue:** **#59**.  
**Missing contract:** deterministic successive content migration/source evidence through the actual immediately preceding canonical generation. Current main has certified earlier generation H plus shared non-content authorities, but final canonical 30–34 is not yet the authoritative immediate predecessor of 34+.  
**Effect:** all 43 ordinary cards are prepared, but Agent 8 must not freeze/register a provisional 34+ content identity, migration shortcut or history rewrite.

## B2 — 34+ seed catalog/lifecycle integration
**Owner:** T5.2 / Agent 2.  
**Issue:** **#180 — apply canonical Pasada-7 34+ seed catalog and provenance handoff**.  
**Evidence:** `SEED_OWNERSHIP.md` and `T52_SEED_HANDOFF.json`.  
**Missing contract:** apply the owner classification: 14 bridge-memory technical concepts are not automatic age-34 producers; Pasada 7 has 54 exact canonical seed identities (45 ordinary producers, 9 terminal producers). Catalog/migration must preserve historical provenance and avoid heuristic aliases.  
**Prepared:** exact producer ownership and canonical seed list are resolved. A representative exact Pasada-7 ID is still absent from current `main`, so #180 remains open.

## B3 — Match, usage, record and concrete national-selection facts
**Owner:** shared sport/national authority.  
**Relevant downstream work:** **#174** for concrete national-team preselection/final squad facts; **#124** for shared factual match/calendar/competition context; **PR #156** is the current shared authoritative weekly match-history/sport-context candidate listed by coordination #138.  
**Current progress on main:** `resolveNationalTeamAuthority()` certifies historical national-team participation, simulator-pool state, aggregate role/standing, tournament-cycle window and international-retirement state. International retirement stops future national caps/windows while leaving `retirement.status == "playing"`.  
**Still missing:** the resolver deliberately reports `concreteCallupKnown=false` and `tournamentSquadKnown=false`. A current prelist, call-up, omission or tournament squad cannot be inferred from caps, standing, role, gate or cycle flags. Fixture/current competition, recent starts/minutes/bench, goals/results, final participation, records and penalty opportunities must likewise come from factual producers.  
**Affected Wave-C examples:** `EVT_34_ROLE_001`, `EVT_34_LOAD_001`, `EVT_34_BODY_001`, `EVT_34_MATCH_001`, `EVT_34_NT_001`, `EVT_34_NT_002`, `EVT_34_FAN_001`, `EVT_34_TRAVEL_001`, `EVT_35_TACT_001`, `EVT_35_BENCH_001`, `EVT_35_RECORD_001`, `EVT_35_NT_001`, `EVT_35_FINAL_001`, `EVT_36_BODY_001`, `EVT_36_RECORD_001`, `EVT_37_PEN_001`.

## B4 — Veteran offer generation / contract representability
**Owner:** shared market/contract authority.  
**Issue:** **#176 — authoritative veteran 34+ `CareerOffer` generation and late-career terms**.  
**Related shared lifecycle candidate:** coordination #138 tracks **PR #173** for stale-offer hardening / offer-kind facts; #176 remains the missing veteran-generation/term-semantics contract.  
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
**Current progress on main:** `main@da3b356ac1c9c3376052189573e5a30f89b71cf0` integrates the shared player-club-leadership authority. Agent 8 may now consume `resolveCurrentPlayerClubLeadership()`, historical leadership certifications and `resolveCertifiedPlayerLeadershipSuccessor()` fail-closed. The successor resolver returns a named same-club active NPC only after an explicit certification; it never guesses from relationships, `npcRefs`, prominence, recency, age or seeds. The audited earlier canon does not supply a general main-captain writer and its audited succession actors remain generic/non-persistent unless future canon explicitly identifies one.  
**What this does not yet prove:** `EVT_34_DORSAL_001` still needs a factual young signing/successor plus shirt/campaign context; `EVT_34_MENTOR_001` still needs a factual current younger teammate and competitor/successor relation. A null certified successor remains valid and must fail closed. Current coach/coach-change, veteran peer retirement, institutional counterparty and record-breaking young-player identity remain separate factual needs.  
**Related work:** **#169** covers coach chronology. #177 remains the 34+ composition contract for the remaining coach/young-competitor/successor/peer/institutional identity facts.  
`resolveActiveAgent()` remains authoritative for the current representative and may return null.  
**Affected:** `EVT_34_DORSAL_001`, `EVT_34_MENTOR_001`, `EVT_35_DUAL_001`, `EVT_35_AGT_001`, `EVT_35_RECORD_001`, `EVT_36_CCH_001`, `EVT_36_PEER_001`.

## B7 — Terminal career retirement
**Owner:** Agent 9 / **PR #118**.  
Terminal-owned principals: `EVT_37_ANNOUNCE_001`, `EVT_RET_FAM_001`, `EVT_RET_BODY_001`, `EVT_RET_HIGH_001`, `EVT_RET_LOW_001`, `EVT_RET_ANNOUNCE_001`, `EVT_RET_LASTMATCH_001`.  
Agent 8 may expose ordinary scenes whose choices include a career-retirement option, but the terminal state transition/announcement/closure is delegated to Agent 9. International retirement is separate and represented by shared national-team authority.

## Closure rule for Agent 8
Agent 8 does not close these shared issues by adding proxies to narrative content. An ordinary scene becomes eligible for implementation only when Wave 0 plus every named downstream authority in `AUTHORITY_MATRIX.json` is factual on the current integration base. Until then its canonical card remains prepared-but-blocked.
