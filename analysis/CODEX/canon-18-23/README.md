# Agent 5 — Canon 18–23 / Codex handoff

Base audited during this pass: `main@2b4e0e1697dec5cc4376957228cafe9988b7d0a2` (re-check main before integration).
Branch: `t51/canon-18-23-agent5`.
PR: #155.

## Scope

Owned canonical content: inicio, 18–20 and 20–23. 23+ is continuity-only.
Canonical inventory: **95** scenes = 63 principals + 32 conditionals.

## Current classification

- `verified_equivalent`: **26**
- `implemented`: **19**
- `codex_ready`: **5**
- `blocked_shared_authority`: **44**
- `blocked_canon`: **1**
- ambiguous/TODO/partial: **0**

Functional completion = **45/95 = 47.37%**.
Functional + implementation-ready = **50/95 = 52.63%**.

Principals: 21 verified + 12 implemented = **33/63 = 52.38% functional**; +4 ready = **58.73% prepared**.
Conditionals: 5 verified + 7 implemented = **12/32 = 37.50% functional**; +1 ready = **40.63% prepared**.

## Implemented in this functional branch

18–20 repairs:
- `EVT_18_PRS_002`
- `EVT_19_SUM_001`
- `CEVT_18_BRUNO_01`
- `CEVT_18_CCH_01`
- `CEVT_18_RELEG_01`
- `CEVT_19_INJ_01`
- `CEVT_19_RETURN_01`

20–23 canonical microbatches:
- `EVT_20_LIFE_001`
- `EVT_20_ABR_001`
- `EVT_21_RIV_001`
- `CEVT_21_ABR_01`
- `CEVT_21_MEDIA_01`
- `EVT_21_CAP_001`
- `EVT_21_PRS_001`
- `EVT_22_CON_001`
- `EVT_22_CON_002`
- `EVT_20_STATUS_001`
- `EVT_20_LOCK_001`
- `EVT_20_LOCK_002`

The five #125 callbacks consume scope-aware live SeedInstance payload projections through `facts.*`; terminal/historical instances are not promoted to live causal facts. No extra RNG stream, proxy flag or duplicate memory authority was introduced.

## Identity / migration

Same string ID is not semantic identity. The T5.5/T5.6 same-ID rewrites are `distinct_scene` mappings and require coordinator-owned adjacent contentIdentity integration. Pending/history must retain saved source identity + fingerprint. Do not create aliases or PRE→latest shortcuts.

**EVENTS changes in this branch require coordinator content-generation integration.**

## Files

- `CANON_STATUS.json`: one row per canonical scene.
- `implementation-ready.json`: only tasks implementable without architecture research.
- `BLOCKERS.md`: exact shared/canon dependencies.
- `CONTINUITY_CHAINS.md`: causal chains and completion state.
- `CODEX_PROMPT.md`: copy/paste implementation prompt.

## Rules for continuation

1. Use current shared authorities; APIs that return null/unavailable do not unblock a scene.
2. `marketHeat` is not a CareerOffer.
3. `seedsRead` is not causal consumption.
4. No guessed captain, active agent or current-club institutional NPC.
5. No narrative RNG for facts owned by sport/market/medical simulation.
6. New/rewritten EVENTS require adjacent contentIdentity handoff; Agent 5 does not register the global route.
