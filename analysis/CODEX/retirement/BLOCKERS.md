# Retirement / epilogue blockers

Coordination snapshot: 2026-09-17.

Current retirement branch HEAD before this metadata refresh: `cb8e0b275a3ee70d92b88f66b4fea5f04b47fc83` against `main@fa3c8bae524fef62e4eb9802e895df88588998c4` (**75 ahead / 0 behind**).

Exact-head terminal workflow `35259606532` is green: build + **45/45 PASS**. Repository Integrity `35259606562` reaches only the expected active-source freeze sentinel after prior validation succeeds. Current provisional terminal catalog identity from that run is `06cebf93a642ff776670356449777255cb8afe009b424d9cb0a22b44e158dcb0`. **Do not freeze it.**

## 1. Terminal lineage / ordinary 34+ predecessor — RET-011

The multi-hop migration engine is already integrated in `main`; #59 is not blocked on graph machinery. Remaining work is serial registration/freeze of the real future generations in canonical order.

### #180 / PR #191 — seed catalog

PR #191 (`t5/seed-34plus-catalog`) remains a certified, unmerged candidate:

- HEAD `d8f724893cfcb40d2b81f995d8ed08179bbd6f52`;
- focused run `35246851382`: SUCCESS;
- Repository Integrity `35246851472`: SUCCESS;
- 54 exact canonical Pasada-7 seeds = **45 ordinary + 9 terminal**;
- 14 bridge-memory concepts remain inherited/derived compatibility facts;
- no fuzzy aliases, history rewrite, `EVENTS`, RNG, schema or lineage change.

It must still enter at the correct serial point.

### PR #15 — ordinary 34+ preparation

Current audited PR #15 head: `20f3b41cca5e4faf9f40d523ea256325891044da`.

- **79 ahead / 0 behind** current audited main;
- ordinary canonical cards prepared: **43/43**;
- authority matrix prepared: **43/43**;
- ordinary principals registered/implemented at runtime: **0/43**;
- exact-head Repository Integrity run `35259834450`: **SUCCESS**.

The bottleneck is activation/dependency closure, not design or branch health.

### #192 / #195 — exact Pasada-7 conditional deck

Canonical conditionals: **32**.

- engine rows: 32;
- exact-ID overlap: 5;
- semantically accredited exact overlaps: **0**;
- canonical exact IDs missing from engine: 27;
- technical engine extras absent from canon: 27.

Issue #195 now has an explicit coordination decision for its eight previously unowned factual domains: until a real factual producer lands, dependent rows are **unsupported/fail-closed for the current integration sequence** rather than implemented with local flags/proxies. Agent 8/#192 must encode that state in its authority matrix.

Terminal/shared rows remain Agent-9-owned; equal IDs/counts are never proof of semantic parity.

### Required lineage sequence

1. integrate remaining canonical predecessor generations in real order;
2. integrate #191 at the correct serial point;
3. apply #195 fail-closed routing, implement/accredit the supported #192 conditionals and activate/integrate ordinary 34+ principals only against real authority;
4. freeze that exact ordinary 34+ generation and register its adjacent edge through #59;
5. re-ground PR #118 on that exact frozen predecessor;
6. only then calculate/freeze terminal contentIdentity and register the single adjacent ordinary34plus -> terminal edge.

Status: **hard blocked upstream by generation order and ordinary 34+ runtime activation, not by missing migration infrastructure**.

## 2. Full last-match authority / terminal factual conditionals — RET-005

### Producer PR #156

Current producer candidate: PR #156 / `t5/authoritative-match-model`.

Latest audited producer:

- HEAD `bbb491fac05fe4d981ae9e6c518c0a2c5aa57de7`;
- **4 ahead / 0 behind** audited main;
- T5 Market Contract Authority exact-head: SUCCESS;
- Repository Integrity run `35259511375`: build, PlayCanvas, sport model, pre-freeze, determinism, age boundaries and content references passed; **T5 long careers is still in progress** at the latest check.

Candidate facts supplied by #156 include fixture id/date, club/opponent/home-away/league competition, call-up/bench/start/appearance/minutes/injuryUnavailable, next/previous fixture and remaining official/league fixture counts.

### Stacked retirement-read candidate PR #202

PR #202 (`t5/sport-retirement-read-optimization`) is stacked on the current #156 head and adds the missing shared query rather than making retirement inspect producer-private storage.

- HEAD `e8a6585d7d47cf9089f161bf6a126d777dbd1444`;
- base: `t5/authoritative-match-model@bbb491f…`;
- mergeable: true;
- exact diff: 3 files;
- focused workflow `35260631695`: **SUCCESS**;
- build green;
- match/sport suite: **18/18 PASS**.

`getLastPlayerAppearanceContext(state)` distinguishes:

- historical save with no match store -> explicit unavailable;
- initialized authoritative store with no appearance -> authoritative `match:null`;
- real appearance history -> latest persisted official row where `player.appeared === true`, skipping newer non-appearances.

That is sufficient for retirement to determine whether the factual last appearance happened before or after announcement by comparing the returned match date with the announcement date.

The same PR removes duplicated calendar scans inside `getSportContext()` while preserving read-only/0-RNG semantics.

### Still missing for complete RET-005

Even after #202 is accepted into #156 and integrated, unsupported fields remain:

- authoritative per-match final result;
- goals;
- assists/cards;
- suspension authority when canonical no-last-match requires suspension.

Therefore rich final-appearance identity/date/opponent/competition/minutes becomes integration-ready through #202, but full canonical terminal facts do not.

### Canonical terminal conditional ratchet

PR #118 enforces fail-closed accreditation in `retirement-terminal-canonical-guard.ts`.

These rows remain `technical_adaptation` until their exact canonical contract exists:

- `CEVT_38_OFFER_AFTER_RETIREMENT_ANNOUNCED` — real CareerOffer handling exists, but canonical reversal semantics are separate;
- `CEVT_RET_RECONSIDER` — legacy pre-announcement ID, **not** canonical `CEVT_38_RETIREMENT_REVERSAL`; no silent alias;
- `CEVT_RET_NO_LAST_MATCH` — current no-appearance/timer compatibility closure does **not** prove canonical injury/suspension causation;
- `CEVT_RET_STORYBOOK_LAST_GOAL` — non-synthetic/evidence-gated, but no authoritative last-goal producer exists.

Focused ratchet: `scripts/test-t536-canonical-accreditation.mjs`.

Status: **partially unblocked; factual final-appearance lookup now has a focused-green shared candidate (#202), while result/goal/assist/suspension and terminal conditional accreditation remain blocked**.

## 3. Fixture-aware closure boundary — RET-007 IMPLEMENTED

Implemented in `38f6294aa262b16151bc0ad6a1df35ab7edf03c6`:

- authoritative `remainingOfficialMatches > 0` keeps an announced career open;
- authoritative `remainingOfficialMatches === 0` permits terminal closure;
- unavailable/invalid authority retains the legacy administrative fallback only;
- no private match-store shape and no extra RNG.

Current `main` still lacks the producer. Integrating a compatible #156 successor activates the already-written authoritative branch; no new RET-007 implementation is required.

## 4. 30–34 early-retirement compatibility — resolved as bounded bridge

`EVT_33_RET_001` choice A has been semantically audited. It means closing at season end and its copy explicitly says the announcement occurs, while current 30–34 runtime persists only `EARLY_RETIRED_30_34=true` plus `world.retirementReason="voluntary_30_34"`.

Therefore the narrow legacy bridge in PR #118 is intentional compatibility, not an open terminal-design blocker. Do not broaden it. Remove it only after the 30–34 owner writes explicit phases and migration evidence.

## Repository-integrity rule

Do not weaken the active-source freeze sentinel. `06cebf93…` remains provisional until the immediately preceding ordinary 34+ generation is integrated and frozen. A failure before that sentinel is a real regression; a failure at that sentinel is expected fail-closed lineage protection.
