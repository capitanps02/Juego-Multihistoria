# Canon 34+ — Agent 8

Runtime re-grounded on `main@6d2239ae1f89be97a7c5cf117d456cff9218aade` on 2026-09-17. Identity reconciliation remains the audited 50/50 classification produced before this re-ground; the intervening `main` commits add T5.2 provenance/closure infrastructure plus shared role-expectation facts and do not alter the 34+ canonical principal inventory.

## Scope
- Canonical principals in source block 34+: **50**.
- Agent 8 ordinary late-career ownership: **43**.
- Agent 9 terminal/retirement ownership: **7** (`EVT_37_ANNOUNCE_001` plus six `EVT_RET_*`).
- Engine 34+ conditionals: **32**; there is still no canonical conditional-ID inventory, so semantic completion cannot be inferred from the count.
- Historical engine-only principal extras: **30**.
- Identity reconciliation: **50/50 classified** (4 same-identity, 3 replacements, 13 needs-reimplementation, 30 canonical-missing).

## Runtime status on this branch
This branch intentionally contains **no new active 34+ canonical event implementation yet**. The old branch mixed Agent-8 content with terminal retirement code; the active tree is now re-grounded on current `main`, while terminal implementation remains owned by Agent 9 / PR #118.

Strict integration-ready count is currently **0/43 ordinary principals**. All 43 ordinary scenes have explicit Codex task rows, but activation still depends on shared content lineage and on correcting the 34+ seed catalog/migration from the owner decision in `SEED_OWNERSHIP.md`.

## Authorities now available on main
- Market: `CareerOffer`, offer queries, `respondToOffer()` and offer bridge.
- Sport: `getSportContext()` / `getCurrentMatchContext()` are integrated and fail closed for fixture/minutes/start/bench/goal/selection facts that do not exist.
- Football moments: persisted authority exists only for explicitly registered moments; current registry does not cover 34+ scenes.
- NPC: `resolveActiveAgent()` is integrated; missing authority returns null. Late-career club institutional actors are still uncertified.
- Seeds: scope-aware live/historical projections, closure-readiness audit and the explicit owner-classification registry are integrated. The registry mechanism is authoritative, but the 34+ catalog still contains technical placeholder identities; `SEED_OWNERSHIP.md` supplies the owner decision needed before those identities can be migrated/classified safely.
- Shared role expectation facts now exist for earlier PRS23 integration; they do not by themselves prove current 34+ starts, minutes, bench status or veteran role.

## Closed ownership question
Agent 8 classified the 14 34+ bridge-memory concepts and reconciled the **54 exact Pasada-7 canonical seed identities**. See `SEED_OWNERSHIP.md`. This removes the semantic ambiguity about “68 new seeds”: 14 are inherited/derived concepts and 54 are Pasada-7 memories, with **45 ordinary producers** and **9 terminal producers**.

## Prepared Wave A
`UNLOCK_WAVES.md` separates the 43 ordinary principals by shared authority dependency. The first ordinary batch has now been reduced to an implementation-complete handoff, without registering it into runtime:

- `EVT_35_FAM_001` — family / relocation tradeoff;
- `EVT_35_BODY_001` — reduced preseason / body-management choice;
- `EVT_35_IMG_001` — late commercial campaign framing;
- `EVT_36_MED_001` — post-career body-risk conversation.

`WAVE_A_IMPLEMENTATION.json` contains exact choice IDs, canonical seed payloads, required factual gates and forbidden mutations. `WAVE_A_TEST_MATRIX.md` contains negative authority tests plus save/load, migration, determinism and retirement-boundary checks.

These four are **prepared, not active**. Wave 0 must land first: issue #59 lineage, T5.2 seed-catalog/provenance application and valid predecessor memory.

## Main remaining blockers
1. successive content lineage / issue #59;
2. T5.2 catalog + migration application of `SEED_OWNERSHIP.md` and subsequent closure-registry entries where evidence permits;
3. veteran offer generation: ordinary renewal intent still stops at `age >= 34`, so `CareerOffer` can represent veteran terms but the world does not yet authoritatively generate the needed 34+ proposals;
4. free-agency employment semantics;
5. fixture/match/squad/recent-minutes and national-selection authority;
6. late-career institutional/squad NPC authority;
7. terminal retirement remains Agent 9.

## Hard boundary
Agent 8 may create veteran pressure, uncertainty, adaptation and explicit decisions to continue. It must not announce/close retirement, fabricate last match/goal/selection, turn no-offer into retirement, infer NPC identities, or mutate club/contract outside `CareerOffer`.
