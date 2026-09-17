# Canon 34+ — Agent 8

Runtime re-grounded on `main@d9cd3cf3b9d1f23ab2f082b66ef4a01f6177e7f2` on 2026-09-17. Identity reconciliation remains the audited 50/50 classification; the new shared national-team authority changes factual availability, not the 34+ principal inventory.

## Scope
- Canonical principals in source block 34+: **50**.
- Agent 8 ordinary late-career ownership: **43**.
- Agent 9 terminal/retirement ownership: **7** (`EVT_37_ANNOUNCE_001` plus six `EVT_RET_*`).
- Engine 34+ conditionals: **32**; there is still no authoritative canonical conditional-ID inventory, so semantic completion cannot be inferred from the count.
- Historical engine-only principal extras: **30**.
- Identity reconciliation: **50/50 classified** (4 same-identity, 3 replacements, 13 needs-reimplementation, 30 canonical-missing).

## Runtime vs preparation
This branch intentionally contains **no new active 34+ canonical event implementation yet**. Terminal retirement remains owned by Agent 9 / PR #118.

- ordinary canonical runtime implemented on Agent-8 branch: **0/43**;
- strict integration/Codex-ready: **0/43** while Wave 0 remains incomplete;
- canonical-card preparation: **43/43 = 100%**;
- authority classification: **43/43**;
- exact Pasada-7 seed ownership classified: **54/54** plus 14 inherited/derived bridge-memory concepts.

Preparation is complete; activation is blocked by shared lineage/seed migration and per-scene authorities, not by missing canonical cards.

## Authorities available on current main
- Market: `CareerOffer`, eligible offer queries, `respondToOffer()` and offer bridge.
- Veteran renewal limitation: `clubWantsRenewal()` still fails closed for `age >= 34`; veteran renewal **generation** therefore remains missing.
- Contract employment: `contractEmploymentStatus()` exists, but `monthsRemaining <= 0` is still `expired_pending_resolution`, not authoritative free agency.
- Sport: `getSportContext()` / `getCurrentMatchContext()` fail closed for unsupported fixture, starts, recent minutes, bench, goals/results and other concrete match facts.
- Football moments: only explicitly registered moment IDs are factual; no generic 34+ cinematic moment authority exists.
- National team: `resolveNationalTeamAuthority()` now gives factual historical/pool/retirement/cycle information and enforces that international retirement does not retire the club career. It deliberately exposes `concreteCallupKnown=false` and `tournamentSquadKnown=false`, so it still cannot prove a current prelist, call-up, omission or tournament squad.
- NPC: `resolveActiveAgent()` is authoritative and may return null. Ordinary late-career institutional/squad/coach/successor/peer identity remains incomplete.
- Seeds: scope-aware live/historical projections and owner-classification infrastructure exist. The 54 exact Pasada-7 identities are still not applied to `main`; `T52_SEED_HANDOFF.json` is the Agent-8 owner input.

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

Detailed canonical cards and QA packages now exist for Waves A–E. `WAVE_B_COMPLETE_INDEX.json` composes the market wave without duplicating the full `EVT_35_DUAL_001` card stored in Wave D.

## Wave 0 — mandatory before runtime activation
No ordinary 34+ principal should be registered until all common prerequisites are satisfied:
1. issue #59 successive content lineage reaches the actual authoritative predecessor, especially final 30–34;
2. T5.2 applies `T52_SEED_HANDOFF.json` and preserves provenance/migration semantics;
3. predecessor memories consumed by 34+ are canonical and use the correct live/historical semantics;
4. pending/history/event fingerprints remain migration-safe.

The 34+ content identity must not be frozen as a shortcut before its predecessor generation is authoritative.

## First activation batch after Wave 0
Wave A remains the first safe target:
- `EVT_35_FAM_001`;
- `EVT_35_BODY_001`;
- `EVT_35_IMG_001`;
- `EVT_36_MED_001`.

They are fully specified in `WAVE_A_IMPLEMENTATION.json` and `WAVE_A_TEST_MATRIX.md`, but remain inactive until Wave 0 lands.

## Remaining shared blockers
1. successive content lineage / issue #59 and unfinished predecessor generations;
2. T5.2 application of the 34+ seed owner handoff;
3. veteran offer generation and incomplete representation of some canonical veteran terms;
4. authoritative free agency / unattached-player state;
5. concrete fixture/usage/result/record/current call-up or omission authority;
6. ordinary 34+ institutional/squad/coach/successor/peer identity;
7. terminal career retirement remains Agent 9.

## Hard boundary
Agent 8 may create veteran pressure, uncertainty, adaptation, international-retirement choices and explicit decisions to continue. It must not announce/close **career** retirement, fabricate last match/goal/selection, turn no-offer into retirement, infer NPC identities, or mutate club/contract outside authoritative market APIs.
