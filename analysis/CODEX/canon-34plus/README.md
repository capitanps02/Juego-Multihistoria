# Canon 34+ — Agent 8

Reconciled against `main@782b92c9a496293aeb33ad8b39f522a927374d6f` on 2026-09-17.

## Scope
- Canonical principals in source block 34+: **50**.
- Agent 8 ordinary late-career ownership: **43**.
- Agent 9 terminal/retirement ownership: **7** (`EVT_37_ANNOUNCE_001` plus six `EVT_RET_*`).
- Engine 34+ conditionals: **32**; no canonical conditional-ID inventory exists, so their semantic completion is not inferred from the count.
- Historical engine-only principal extras: **30**.

## Current conclusion
The historical `t51/canon-34plus` implementation mixed useful analysis with terminal retirement code that is now owned by PR #118. This re-ground keeps the branch history but drops superseded terminal implementation from the active tree and replaces it with an Agent-8-only Codex handoff.

`CareerOffer` authority is now on `main`; this unlocks preparation of veteran renewal/transfer scenes, but activation still requires exact canonical seed mapping and content-lineage integration. Free agency is not yet authoritative: an expired contract remains `expired_pending_resolution`.

Sporting facts remain the largest blocker: current main still has no authoritative fixture/match/squad/minutes store. Do not infer starts, bench use, goals, finals or call-ups from age, `roleScore`, form or reputation.

## Hard boundary
Agent 8 may create veteran pressure, uncertainty and explicit decisions to continue. It must not announce/close retirement, fabricate last match/goal, convert no-offer into retirement, or mutate club/contract outside `CareerOffer`.

Files in this folder are the current handoff for Codex and Agent 9.