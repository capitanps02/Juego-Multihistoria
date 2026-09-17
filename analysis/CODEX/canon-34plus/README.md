# Canon 34+ — Agent 8

Runtime re-grounded on `main@182d5e6abc4f7c98eeb95703a4bc6c3560a4bcde` on 2026-09-17. Identity reconciliation remains the audited 50/50 classification; the latest upstream PRS23 generation does not alter the 34+ canonical principal inventory.

## Scope
- Canonical principals in source block 34+: **50**.
- Agent 8 ordinary late-career ownership: **43**.
- Agent 9 terminal/retirement ownership: **7** (`EVT_37_ANNOUNCE_001` plus six `EVT_RET_*`).
- Engine 34+ conditionals: **32**; there is still no canonical conditional-ID inventory, so semantic completion cannot be inferred from the count.
- Historical engine-only principal extras: **30**.
- Identity reconciliation: **50/50 classified** (4 same-identity, 3 replacements, 13 needs-reimplementation, 30 canonical-missing).

## Runtime status on this branch
This branch intentionally contains **no new active 34+ canonical event implementation yet**. The old branch mixed Agent-8 content with terminal retirement code; the active tree is re-grounded on current `main`, while terminal implementation remains owned by Agent 9 / PR #118.

Strict integration-ready count is currently **0/43 ordinary principals**. All 43 ordinary scenes have explicit Codex task rows and authority classification, but activation still depends on shared content lineage and on correcting the 34+ seed catalog/migration from the owner decision in `SEED_OWNERSHIP.md` / `T52_SEED_HANDOFF.json`.

## Authorities now available on main
- Market: `CareerOffer`, offer queries, `respondToOffer()` and offer bridge.
- Current limitation: `clubWantsRenewal()` still returns false for `age >= 34`; therefore veteran renewal **generation** is not solved even though shared renewal-intent infrastructure has advanced.
- Sport: `getSportContext()` / `getCurrentMatchContext()` are integrated and fail closed for fixture/minutes/start/bench/goal/selection facts that do not exist.
- Football moments: persisted authority exists only for explicitly registered moments; current registry does not cover 34+ scenes.
- NPC: `resolveActiveAgent()` is integrated; missing authority returns null. Late-career club institutional/squad actors remain incomplete.
- Seeds: scope-aware live/historical projections, closure-readiness audit and explicit owner-classification infrastructure are integrated. The 54 exact Pasada-7 identities are still absent from `main`; the Agent-8 handoff is prepared but not yet applied by T5.2.
- Shared role-expectation facts exist for earlier PRS23 integration; they do not prove current 34+ starts, minutes, bench status or veteran role.

## Seed ownership handoff
Agent 8 classified the 14 34+ bridge-memory concepts and reconciled the **54 exact Pasada-7 canonical seed identities**:
- 14 inherited/derived bridge concepts are **not** automatic age-34 producers;
- 45 canonical seeds are produced by ordinary Agent-8 principals;
- 9 canonical seeds are produced by Agent-9 terminal principals.

Human-readable decision: `SEED_OWNERSHIP.md`.  
Machine-readable handoff for T5.2: `T52_SEED_HANDOFF.json`.

## Complete dependency coverage
`UNLOCK_WAVES.md` and `AUTHORITY_MATRIX.json` now cover **43/43 ordinary principals with no gaps**.

Wave counts:
- Wave A — 4 context scenes;
- Wave B — 17 market/contract scenes;
- Wave C — 16 sport/usage/selection scenes;
- Wave D — 7 NPC/squad-identity scenes;
- Wave E — 1 free-agency/market-silence scene.

Intentional overlaps:
- `EVT_35_AGT_001` requires B + D;
- `EVT_35_RECORD_001` requires C + D.

This fixes an earlier handoff gap where `EVT_34_BODY_001` was omitted from Wave C and `EVT_35_RECORD_001` was not explicitly marked as both sporting + identity dependent.

## Prepared Wave A
The first ordinary batch has been reduced to implementation-complete handoff material, without registering it into runtime:

- `EVT_35_FAM_001` — family / relocation tradeoff;
- `EVT_35_BODY_001` — reduced preseason / body-management choice;
- `EVT_35_IMG_001` — late commercial campaign framing;
- `EVT_36_MED_001` — post-career body-risk conversation.

`WAVE_A_IMPLEMENTATION.json` contains exact choice IDs, canonical seed payloads, required factual gates and forbidden mutations. `WAVE_A_TEST_MATRIX.md` contains negative-authority tests plus save/load, migration, determinism and retirement-boundary checks.

These four are **prepared, not active**. Wave 0 must land first: issue #59 lineage, T5.2 seed-catalog/provenance application and valid predecessor memory.

## Why #59 still blocks activation
The shared lineage workstream explicitly says 34+ must remain outside the active migration chain until all predecessor generations, especially 30–34, are authoritative. Any current 34+ content identity is provisional composition evidence only. Agent 8 must re-ground on the definitive predecessor and calculate a single adjacent source→target edge at that time; it must not freeze a shortcut now.

## Main remaining blockers
1. successive content lineage / issue #59 and unfinished predecessor generations;
2. T5.2 catalog + migration application of `T52_SEED_HANDOFF.json` and subsequent closure-registry entries where evidence permits;
3. veteran offer generation for 34+;
4. free-agency employment semantics;
5. fixture/match/squad/recent-minutes and national-selection authority;
6. late-career institutional/squad NPC authority;
7. terminal retirement remains Agent 9.

## Hard boundary
Agent 8 may create veteran pressure, uncertainty, adaptation and explicit decisions to continue. It must not announce/close retirement, fabricate last match/goal/selection, turn no-offer into retirement, infer NPC identities, or mutate club/contract outside authoritative market APIs.
