# Retirement / epilogue blockers

Coordination snapshot: 2026-09-17.

Last exact retirement runtime/content certification before this documentation refresh: `8d2a872b18da9e773be2fd5bae2909a229d792f1` against `main@fa3c8bae524fef62e4eb9802e895df88588998c4`.

- dedicated T5.36/T5.37 run `35261462069`: **SUCCESS, 45/45 PASS**;
- Repository Integrity run `35261462040`: reaches only the intentional active-source freeze sentinel after prior validation succeeds;
- provisional terminal identity: `06cebf93a642ff776670356449777255cb8afe009b424d9cb0a22b44e158dcb0` — **do not freeze**.

Documentation commits after that certified head must be re-certified on their final exact HEAD before integration.

## 1. Terminal lineage / ordinary 34+ predecessor — RET-011

The multi-hop migration engine is already integrated in `main`; #59 is not blocked on graph machinery. Remaining work is serial registration/freeze of real future generations in canonical order.

### #180 / PR #191 — seed catalog

Certified, unmerged candidate:

- HEAD `d8f724893cfcb40d2b81f995d8ed08179bbd6f52`;
- focused run `35246851382`: SUCCESS;
- Repository Integrity `35246851472`: SUCCESS;
- 54 exact canonical Pasada-7 seeds = **45 ordinary + 9 terminal**;
- 14 bridge-memory concepts remain inherited/derived compatibility facts.

It must enter only at the correct serial point.

### PR #15 — ordinary 34+ preparation

Current audited head: `c99fce052918540a52c3992ccd8152282f26a34b`.

- 43/43 ordinary canonical cards prepared;
- 43/43 principal authority matrix coverage;
- **0/43 ordinary principal runtime activations**;
- 32/32 canonical conditionals classified;
- **0/32 canonical conditionals runtime-accredited**;
- **0 unresolved shared authority domains** after routing;
- Repository Integrity run `35262171147`: **SUCCESS on exact head**.

Issue #195 is now **closed/completed**. Its eight former gaps are explicitly routed to factual owners rather than local proxies:

- veteran market / club medical clearance: #176;
- rich sporting history, results, goals, awards and records: #199;
- injury/rehab chronology: #200;
- club-world finance/sponsor/stadium/staff incidents: #201.

This removes an ownership ambiguity, not the runtime blockers. Missing owner facts remain fail-closed.

### Required lineage sequence

1. integrate remaining canonical predecessor generations in real order;
2. integrate #191 at the correct serial point;
3. integrate the factual owners actually required by each supported 34+ scene;
4. implement/accredit supported #192 conditionals and activate ordinary 34+ principals;
5. freeze that exact ordinary 34+ generation and register its adjacent edge through #59;
6. re-ground PR #118 on that exact frozen predecessor;
7. only then calculate/freeze terminal contentIdentity and register the single adjacent ordinary34plus -> terminal edge.

Status: **hard blocked upstream by generation order and ordinary 34+ runtime activation/freeze, not by migration infrastructure or unowned factual domains**.

## 2. Full last-match authority / terminal factual conditionals — RET-005

### PR #156 — authoritative match producer

Current certified producer candidate:

- HEAD `bbb491fac05fe4d981ae9e6c518c0a2c5aa57de7`;
- 4 ahead / 0 behind audited main;
- Repository Integrity run `35259511375`: **SUCCESS**;
- PlayCanvas, authoritative sport model, determinism, long careers, lifecycle, integration probes and stratified simulation all pass.

#156 is certified but unmerged. Candidate facts include fixture id/date, club/opponent/home-away/league competition, call-up/bench/start/appearance/minutes/injuryUnavailable, next/previous fixture and remaining fixture counts.

### PR #202 — shared latest-player-appearance read

Stacked on the exact #156 head:

- HEAD `e8a6585d7d47cf9089f161bf6a126d777dbd1444`;
- mergeable=true at latest audit;
- focused workflow `35260631695`: **SUCCESS**;
- build green;
- match/sport suite **18/18 PASS**.

`getLastPlayerAppearanceContext(state)` distinguishes historical unavailable storage from authoritative `match:null`, otherwise returns the latest persisted official row with `player.appeared === true`, skipping newer non-appearances. It also removes duplicate calendar scans from `getSportContext()`.

Owner must still accept #202 into #156 (or provide equivalent public API) and re-certify/integrate the resulting producer.

### #199 — rich sporting history

Issue #199 owns factual final result/goals/assists/cards plus award/record history on top of #156. Agent-9 consumer contract comment `5719715820` requires `CEVT_RET_STORYBOOK_LAST_GOAL` to read a goal from the **exact factual latest-appearance fixture**, never roll or write it narratively.

Until #199 lands, result/goals/assists/cards stay unavailable/fail-closed.

### #200 — factual injury chronology

Issue #200 owns persisted injury/rehab episodes. Agent-9 consumer contract `5719718516` defines a canonical injury route for `CEVT_RET_NO_LAST_MATCH`: announced retirement + factual active unavailability + no later appearance + terminal sporting boundary. The event may not create or extend the injury.

Canon is disjunctive (`injury OR suspension`), so a fully factual injury path can become supported before disciplinary suspension exists.

### Suspension

No authoritative suspension/ban producer was found on current main. A card count is not a suspension. #199 must either expose an explicit persisted ban/suspension fact when its discipline model exists or suspension remains unsupported.

Status: **partially unblocked**. Fixture/appearance authority is certified upstream and the public latest-appearance read is focused-green; rich result/goal facts and factual injury/suspension causes are still pending their owners.

## 3. Canonical exceptional comeback — RET-012

Canonical `CEVT_38_RETIREMENT_REVERSAL` is **not** legacy `CEVT_RET_RECONSIDER`.

Current market `proposeCareerChange()` refuses ordinary generation when `retirement.status !== "playing"`, so no normal authoritative post-announcement CareerOffer producer exists.

Agent-9 contract to #176: comment `5719664852`.

Required market behavior is a **narrow dedicated post-announcement emergency CareerOffer producer**, not a global relaxation of ordinary market rules and never retirement-state mutation.

The retirement-side implementation contract is now:

`analysis/CODEX/retirement/CANONICAL_REVERSAL_CONTRACT.md`

Key rules:

- keep `closed` terminal; never erase a generated epilogue;
- any future exception is a narrowly authorized `announced -> playing` before closure;
- Stage A `CEVT_38_OFFER_AFTER_RETIREMENT_ANNOUNCED` and Stage B `CEVT_38_RETIREMENT_REVERSAL` must have mutually exclusive safe offer-bridge eligibility;
- a deferred/rejected offer cannot later be silently signed; a comeback requires a concrete compatible offer/provenance;
- accepted terms flow only through `respondToOffer()`;
- rhythm/reputation/control costs apply exactly once;
- fake flags, stale offers, marketHeat, age or RNG cannot authorize reversal.

Status: **design-ready, runtime blocked by #176 factual producer/provenance and ambiguity-safe offer staging**.

## 4. Fixture-aware closure boundary — RET-007 IMPLEMENTED

Implemented in `38f6294aa262b16151bc0ad6a1df35ab7edf03c6`:

- authoritative `remainingOfficialMatches > 0` keeps an announced career open;
- authoritative `remainingOfficialMatches === 0` permits terminal closure;
- unavailable/invalid authority retains legacy administrative fallback only;
- no private match-store shape and no extra RNG.

Integrating a compatible #156 successor activates the already-written authoritative branch; no new RET-007 implementation is required.

## 5. 30–34 early-retirement compatibility — resolved as bounded bridge

`EVT_33_RET_001` choice A has been semantically audited as decision + announcement + end-of-season closure intent, while current 30–34 runtime persists only `EARLY_RETIRED_30_34=true` plus `world.retirementReason="voluntary_30_34"`.

The narrow legacy bridge in PR #118 is therefore intentional compatibility, not an open terminal-design blocker. Do not broaden it.

## Repository-integrity rule

Do not weaken the active-source freeze sentinel. `06cebf93…` remains provisional until the immediately preceding ordinary 34+ generation is integrated and frozen. A failure before that sentinel is a real regression; a failure at that sentinel is expected fail-closed lineage protection.
