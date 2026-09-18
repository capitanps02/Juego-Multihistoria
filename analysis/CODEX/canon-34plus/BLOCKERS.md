# Canon 34+ blockers — post sport-authority integration / #177 closed

Base: `main@5f4d14bca4d696cfafadb58b64034c7cd40cc147`. Updated 2026-09-18.

Agent 8 has complete canonical preparation for 43 ordinary principals and 32 conditionals. PR #156 / #124 is integrated, so basic fixture/calendar/usage facts are no longer an upstream blocker. Runtime remains 0 because serialized lineage/seed Wave 0 and richer authorities are still open.

## B1 — Serialized content lineage
**Owner:** #59.  
Migration graph/path support exists. The remaining block is generation serialization. 34+ is not authorized to create a successor from H; final 30–34 must first become authoritative.

## B2 — Exact 34+ seeds
**Owner:** #180 / PR #191.  
PR #191 contains the exact 54 Pasada-7 IDs, 45+9 producer split and 14 bridge dispositions. It had green exact-head QA on its previous base but is not integrated into the current main after #156. Wave 0 remains open until the current integration candidate is valid and landed.

## B3 — Rich formal-offer context
**Owner:** #175 / PR #207.  
Coordinator requires this before #157. PR #207 adds validated optional `CareerOffer.context` for explicit rich side terms and is Ready/green but not integrated. It does not manufacture a concrete offer.

**Reason for ordering:** MarketState v2 must preserve this context natively through multi-offer persistence/migration instead of requiring a second migration.

## B4 — MarketState v2
**Owner:** #157.  
Wait for #207 integration/re-ground. Then implement one authoritative 0..N formal-offer collection with exact offer IDs, deterministic v1 migration including `CareerOffer.context`, durable system-closure provenance and ambiguity-fail-closed selectors. Do not build veteran market against singular `market.pending` first.

## B5 — Employment / unattached state
**Owner:** #130.  
Contract is implementation-ready against integrated sport authority, but coordinate with #157. Required states: `contracted | unattached | expired_pending_resolution`. New-game natural expiry must transition once, deterministically and with 0 RNG. Ambiguous old zero-month saves fail closed.

## B6 — Veteran 34+ market
**Owner:** #176.  
Wait for #157/#130. Current exact eligible-offer reads are factual but do not generate the missing veteran market. #176 owns veteran offers plus factual market approach/medical-assessment history. A failed medical is not a synthetic `CareerOffer`.

Unsupported semantics remain fail-closed unless a dedicated authority exists: guaranteed minutes, bonuses, bilateral termination distinct from a numeric release clause, liaison role and ambassador/commercial role.

## B7 — Concrete national selection
**Owner:** #174.  
Now unblocked by #156. Persist actual ordinary list publications and tournament preliminary/final squad decisions. Aggregate caps/standing/role/age/form/seeds are not concrete selection.

## B8 — Rich sporting history / records / awards
**Owner:** #199.  
Now unblocked by #156. Own factual result/goals/assists/cards where produced plus award and record definition/holder/progress/surpass facts. Required by decisive-goal, team-result, record, penalty and award content.

## B9 — Injury episode / rehabilitation history
**Owner:** #200.  
Now unblocked by #156. Aggregate injury counts/risk do not prove an episode, long rehab or successful return. Persist factual chronology and link it to real post-return appearances; compose with #199 where richer performance is needed.

## B10 — Club-world incidents — coordination closed
**Design gate:** #201 (**closed completed**).  
No generic random incident engine is authorized. Canonical decisions are now explicit:
- `CEVT_35_UDV_FINANCIAL_CRISIS`: the exact conditional occurrence may establish the financial-crisis fact;
- `CEVT_35_SPONSOR_EXIT`: unsupported/fail-closed without a factual active sponsor deal;
- `CEVT_35_SPONSOR_LATE_BOOM`: the exact conditional may establish the new campaign after a factual viral/new-market trigger;
- `CEVT_37_EMPTY_STADIUM_FAREWELL`: unsupported/fail-closed without a factual external venue restriction bound to the fixture;
- `CEVT_37_PLAYER_COACH_EMERGENCY`: unsupported/fail-closed without a factual staff crisis.

Closing #201 resolves producer design only; it does not runtime-accredit these rows.

## B11 — Actor/identity routing — coordination closed
**Historical guard:** #177 (**closed completed**); coach tenure #169 remains factual authority where consumed.  
Agent 8 has refreshed all 43 ordinary routes, so no standalone generic NPC subsystem remains. Existing agent authority, generic institutional voices, non-persistent actors where canon permits, #169 coach chronology and #199 record truth cover the former Wave-D routing questions. `EVT_36_PEER_001` remains fail-closed until exact peer identity + causal peer-retirement history exists; that missing scene fact does **not** reopen #177.

## B12 — Exact conditional deck
**Owner:** #192; terminal boundary PR #118.  
32 canonical IDs are reconciled and authority-routed; **0/32 runtime accredited**. #195 is closed only because its eight domains route to #176/#199/#200/#201.

## B13 — Terminal protagonist retirement
**Owner:** Agent 9 / PR #118.  
Agent 8 never owns terminal retirement state changes, announcement, terminal last-match closure or epilogues.

## Closure rule
A principal/conditional is executable only when #59 authorizes the actual 34+ generation, the exact seed authority is integrated into the current main, every scene-specific factual owner exists, save/history/pending provenance is safe and exact-head QA is green. Missing authority is not replaced by a proxy.

## QA note
Exact HEAD `aed49c362e6dda02bc981e0ea8d83d152604f840` passed Repository Integrity run `35263846340`. This documentation refresh creates a newer HEAD, so that run is historical evidence only until the refreshed HEAD is certified.
