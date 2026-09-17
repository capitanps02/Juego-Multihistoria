# Retirement / epilogue blockers

Coordination snapshot: 2026-09-17.

Runtime head audited: `c3afca7e63cdc7833518c5746814919998267dce` against `main@fa3c8bae524fef62e4eb9802e895df88588998c4` (**74 ahead / 0 behind** at that snapshot).

The previous exact-head terminal workflow on `3c42379a…` was green (**42/42**). `c3afca7e…` adds only the terminal conditional canonical-accreditation ratchet + its focused tests/workflow registration; certify its own exact-head runs before integration claims.

The previous terminal candidate hash `4f7c7835…` is historical only. The accreditation ratchet changes active catalog metadata, so Repository Integrity may produce a new provisional identity. **Do not freeze any provisional terminal identity.**

## 1. Terminal lineage / ordinary 34+ predecessor — RET-011

The multi-hop migration engine is already integrated in `main`; #59 is not blocked on graph machinery. The remaining ownership is serial registration/freeze of each real future generation in canonical order.

### #180 / PR #191 — seed catalog

PR #191 (`t5/seed-34plus-catalog`) is a certified, unmerged candidate:

- HEAD `d8f724893cfcb40d2b81f995d8ed08179bbd6f52`;
- **3 ahead / 0 behind** the audited main;
- focused run `35246851382`: SUCCESS;
- Repository Integrity `35246851472`: SUCCESS;
- 54 exact canonical Pasada-7 seeds = **45 ordinary + 9 terminal**;
- 14 bridge-memory concepts remain inherited/derived compatibility facts;
- no fuzzy aliases, history rewrite, `EVENTS`, RNG, schema or lineage change.

This resolves the catalog/provenance implementation candidate for #180, but it is not yet integrated and must enter at the correct serial point.

### PR #15 — ordinary 34+ preparation

Current audited PR #15 head: `0a199462e3b70791284796bcdfd4639a5f6b8a5b`.

- **73 ahead / 0 behind** audited main;
- ordinary canonical cards prepared: **43/43**;
- authority matrix: **43/43**;
- ordinary principals registered/implemented at runtime on this branch: **0/43**;
- active content therefore remains the previous certified generation until activation work actually lands.

The bottleneck has moved from design to activation/dependency closure.

### #192 — exact Pasada-7 conditional deck

Canonical conditionals: **32**.

- engine rows: 32;
- exact-ID overlap: 5;
- semantically accredited exact overlaps: **0**;
- canonical exact IDs missing from engine: 27;
- technical engine extras absent from canon: 27.

Terminal/shared rows stay Agent-9-owned; ordinary rows belong #192/Agent 8. Equal counts are not semantic coverage.

### Required lineage sequence

1. integrate the remaining canonical predecessor generations in their real order;
2. integrate #191 at the correct serial point;
3. implement/accredit #192 and activate/integrate the 43 ordinary 34+ principals only against real shared authority;
4. freeze that exact ordinary 34+ generation and register its adjacent edge through #59;
5. re-ground PR #118 on the exact frozen predecessor;
6. only then calculate/freeze terminal contentIdentity and register the single adjacent ordinary34plus -> terminal edge.

Status: **hard blocked upstream by generation order and ordinary 34+ activation, not by missing migration infrastructure**.

## 2. Full last-match authority / terminal factual conditionals — RET-005

Producer candidate: PR #156 / `t5/authoritative-match-model`.

Latest audited producer:

- HEAD `54a84694ffa6dcd42a7d87b985db2db95047b9e4`;
- **2 ahead / 0 behind** audited main;
- Repository Integrity run `35258290496` is still in progress at the latest check;
- the latest producer commit only extends workflow timeout to 60 minutes; it does not change match-model semantics.

Candidate facts supplied by #156 include fixture id/date, club/opponent/home-away/league competition, call-up/bench/start/appearance/minutes/injuryUnavailable, next/previous fixture and remaining official/league fixture counts.

Still missing for a complete retirement LastMatchFact:

- public read-only latest match where `player.appeared === true` (previous fixture may be a non-appearance);
- authoritative final result;
- goals;
- assists/cards;
- suspension authority where canonical no-last-match requires suspension.

### Canonical terminal conditional ratchet

PR #118 now enforces fail-closed accreditation in `retirement-terminal-canonical-guard.ts`.

These rows remain `technical_adaptation` until their exact canonical factual contract exists:

- `CEVT_38_OFFER_AFTER_RETIREMENT_ANNOUNCED` — real CareerOffer handling exists, but terminal reversal semantics are a separate canonical contract;
- `CEVT_RET_RECONSIDER` — legacy pre-announcement ID, **not** canonical `CEVT_38_RETIREMENT_REVERSAL`; no silent alias;
- `CEVT_RET_NO_LAST_MATCH` — current 60-day/no-appearance closure is compatibility behavior and does **not** prove canonical injury/suspension causation;
- `CEVT_RET_STORYBOOK_LAST_GOAL` — non-synthetic/evidence-gated, but no authoritative last-goal producer exists yet.

The focused ratchet test is `scripts/test-t536-canonical-accreditation.mjs`.

Status: **partially unblocked; factual LastMatchFact and canonical no-last-match/last-goal accreditation remain blocked**.

## 3. Fixture-aware closure boundary — RET-007 IMPLEMENTED

Implemented in `38f6294aa262b16151bc0ad6a1df35ab7edf03c6`:

- authoritative `remainingOfficialMatches > 0` keeps an announced career open;
- authoritative `remainingOfficialMatches === 0` permits terminal closure;
- unavailable/invalid authority retains the legacy administrative fallback only;
- no private match-store shape and no extra RNG.

Current main still reports this field unavailable. Integrating a compatible sport producer activates the already-written authoritative branch; no new RET-007 implementation is required.

## 4. 30–34 early-retirement compatibility — resolved as bounded bridge

`EVT_33_RET_001` choice A has been semantically audited. It means closing at season end and its copy explicitly says the announcement occurs, while current 30–34 runtime persists only `EARLY_RETIRED_30_34=true` plus `world.retirementReason="voluntary_30_34"`.

Therefore the narrow legacy bridge in PR #118 is intentional compatibility, not an open terminal-design blocker. Do not broaden it. Remove it only after the 30–34 owner writes explicit phases and migration evidence.

## Repository-integrity rule

Do not weaken the active-source freeze sentinel. Any future terminal identity emitted after `c3afca7e…` remains provisional until the immediately preceding ordinary 34+ generation is integrated and frozen. A failure before that sentinel is a real regression; a failure at that sentinel is expected fail-closed lineage protection.
