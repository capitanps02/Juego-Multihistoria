# Canon 34+ — Agent 8

Runtime re-grounded on `main@da3b356ac1c9c3376052189573e5a30f89b71cf0` on 2026-09-17. Current main includes certified canonical 18–23 **generation H** plus the shared player-club-leadership authority. This is real shared-authority progress, but 34+ still cannot freeze because its immediate predecessor — final canonical 30–34 — is not yet authoritative.

## Scope
- Canonical principals in source block 34+: **50**.
- Agent 8 ordinary late-career ownership: **43**.
- Agent 9 terminal/retirement ownership: **7** (`EVT_37_ANNOUNCE_001` plus six `EVT_RET_*`).
- Engine 34+ conditionals: **32**; there is still no authoritative canonical conditional-ID inventory, so semantic completion cannot be inferred from the count.
- Historical engine-only principal extras: **30**.
- Identity reconciliation: **50/50 classified** (4 same-identity, 3 replacements, 13 needs-reimplementation, 30 canonical-missing).

## Runtime vs preparation
This branch intentionally contains **no new active 34+ canonical event implementation yet**. Terminal career retirement remains owned by Agent 9 / PR #118.

- ordinary canonical runtime implemented on Agent-8 branch: **0/43**;
- strict integration/Codex-ready: **0/43** while Wave 0 remains incomplete;
- canonical-card preparation: **43/43 = 100%**;
- authority classification: **43/43**;
- exact Pasada-7 seed ownership classified: **54/54** plus 14 inherited/derived bridge-memory concepts.

Preparation is complete; activation is blocked by shared lineage/seed migration and scene-specific authorities, not by missing canonical cards.

## Current lineage position
Main has advanced through certified generation H for 18–23. The leadership-authority commit does not change `EVENTS`, content identity, RNG or schema. Agent 8 must still wait for all intervening canonical generations, especially 23–30 and final 30–34, to become authoritative. Issue #59 owns the multigeneration migration/evidence contract.

When 34+ genuinely becomes the next generation:
1. re-ground on that exact predecessor;
2. calculate the then-current content identity;
3. register only the adjacent predecessor→34+ edge;
4. preserve historical/pending/seed provenance;
5. never reuse a provisional hash from this handoff branch.

## Authorities available on current main
- Market: `CareerOffer`, eligible offer queries, `respondToOffer()` and offer bridge.
- Veteran renewal limitation: `clubWantsRenewal()` still fails closed for `age >= 34`; **issue #176** owns veteran 34+ offer generation and late-career term representability.
- Contract employment: `contractEmploymentStatus()` exists, but `monthsRemaining <= 0` is still `expired_pending_resolution`, not authoritative free agency; **issue #130** owns the unattached-player contract.
- Sport: `getSportContext()` / `getCurrentMatchContext()` fail closed for unsupported fixture, starts, recent minutes, bench, goals/results and other concrete match facts. Shared factual match/calendar work is tracked by **#124** and PR #156.
- National team: `resolveNationalTeamAuthority()` safely exposes historical/pool/cycle/international-retirement facts. It deliberately exposes `concreteCallupKnown=false` and `tournamentSquadKnown=false`; **issue #174** owns concrete preselection/final-squad authority.
- Agent identity: `resolveActiveAgent()` is authoritative and may return null.
- Player club leadership: `resolveCurrentPlayerClubLeadership()` and historical leadership facts are authoritative and fail closed. `resolveCertifiedPlayerLeadershipSuccessor()` may return a named same-club successor only when an explicit certification exists; the shared contract explicitly forbids inferring a successor from relationships, `npcRefs`, prominence, role text or recency.
- Leadership limitation for Wave D: the audited earlier canon supplies captaincy-group/secondary-captain facts but no general main-captain writer, and its audited succession actors are generic/non-persistent unless future canon explicitly identifies one. Therefore `EVT_34_DORSAL_001` and `EVT_34_MENTOR_001` remain blocked until their actual young signing/competitor/successor context exists; the new resolver is safe to consume but cannot manufacture that context.
- Other late-career NPC authority: current coach, veteran peer and ordinary institutional counterparty remain tracked by **#177** / #169.
- Football moments: only explicitly registered moment IDs are factual; no generic 34+ cinematic moment authority exists.
- Seeds: scope-aware live/historical projections and owner-classification infrastructure exist. The 54 exact Pasada-7 identities still require T5.2 application under **#180**.

## Complete ordinary dependency coverage
`CANONICAL_CARD_COVERAGE.json`, `UNLOCK_WAVES.md` and `AUTHORITY_MATRIX.json` cover all **43/43** ordinary principals.

Wave membership counts are dependency counts, so overlaps are intentional:
- Wave A — **4** context/body/family/image scenes;
- Wave B — **18** market/contract-dependent scenes;
- Wave C — **16** sport/usage/selection-dependent scenes;
- Wave D — **7** NPC/squad-identity-dependent scenes;
- Wave E — **2** free-agency-dependent scenes.

Cross-wave scenes:
- `EVT_35_AGT_001` = B + D;
- `EVT_35_DUAL_001` = B + D;
- `EVT_35_RECORD_001` = C + D;
- `EVT_37_SHORT_001` = B + E.

Detailed canonical cards and QA packages exist for Waves A–E. `WAVE_B_COMPLETE_INDEX.json` composes the market wave without duplicating the full `EVT_35_DUAL_001` card stored in Wave D.

## Wave 0 — mandatory before runtime activation
No ordinary 34+ principal should be registered until all common prerequisites are satisfied:
1. issue #59 reaches the actual authoritative immediate predecessor;
2. T5.2 / **#180** applies `T52_SEED_HANDOFF.json` and preserves provenance/migration semantics;
3. predecessor memories consumed by 34+ are canonical and use correct live/historical semantics;
4. pending/history/event fingerprints remain migration-safe.

## First activation batch after Wave 0
Wave A remains the first safe target:
- `EVT_35_FAM_001`;
- `EVT_35_BODY_001`;
- `EVT_35_IMG_001`;
- `EVT_36_MED_001`.

They are fully specified in `WAVE_A_IMPLEMENTATION.json` and `WAVE_A_TEST_MATRIX.md`, but remain inactive until Wave 0 lands.

## Shared owner routing
- lineage: **#59**;
- 34+ seed catalog/provenance: **#180**;
- match/calendar/competition facts: **#124** + PR #156;
- concrete national selection: **#174**;
- veteran 34+ offers/terms: **#176**;
- free agency: **#130**;
- late-career NPC identity: **#177** (player leadership/successor resolver partially integrated; remaining identity facts still fail closed);
- terminal career retirement: **PR #118 / Agent 9**.

## Hard boundary
Agent 8 may create veteran pressure, uncertainty, adaptation, international-retirement choices and explicit decisions to continue. It must not announce/close **career** retirement, fabricate last match/goal/selection, turn no-offer into retirement, infer NPC identities, or mutate club/contract outside authoritative market APIs.
