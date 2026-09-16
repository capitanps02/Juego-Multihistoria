# Codex execution queue

Maintained by ChatGPT coordinator. Operational truth is current GitHub code + exact-head CI.

`ejecuta Codex` launches **only the first READY item** unless Pedro explicitly names another READY item. Never launch DRAFT/BLOCKED items and never run overlapping write sets in parallel.

## Current context

The former PR #3/#7/#5 implementation queue is obsolete: those PRs were archived/superseded by the integrated canonical audits, current QA and the explicit content-migration critical path. Do not execute those historical tasks.

Coordinator reconciliation state:
- 388 canonical events = 254 principal + 134 conditional;
- 174/174 runtime-only legacy IDs have final disposition;
- all 174 = `retire_technical_keep_history_only`;
- 0 approved direct same-scene ID migrations;
- active catalog rewrites remain blocked until supported content/session migration exists.

## Current executable queue

### 1. READY — T5-MIG-01 · supported contentIdentity/session migration

PR: #30  
Branch: `integration/content-migration-t51-v2`  
Implementation prompt: `project/workstreams/T51_CONTENT_MIGRATION_CODEX_PROMPT.md`  
Contract: `project/workstreams/T51_CONTENT_MIGRATION.md`

Scope:
- implement an explicit migration registry from frozen pre-T5.1 content identity;
- preserve historical IDs/journal/receipts/RNG/seeds/NPC/market/retirement facts;
- preserve pending legacy scene definition/choices through compatibility-only frozen definitions;
- keep compatibility definitions outside active scheduler;
- reject unknown identities;
- make migration deterministic/idempotent and consume zero RNG/scheduling;
- add dedicated migration tests and run T5 save/freeze/integration/determinism gates.

Dependencies satisfied for starting implementation:
- frozen pre-T5.1 catalog exists in main;
- save baseline/test gate #23 integrated;
- QA cross-workstream gates integrated;
- legacy-only crosswalk is 174/174 reviewed;
- PR #27 supplies 23–30 migration handoff evidence.

Important: this task does **not** implement canonical scenes and does not merge to main.

After Codex finishes: ChatGPT must review diff, migration invariants and exact-head CI before state can advance to `READY_TO_MERGE`.

---

## Active non-Codex workstreams — do not duplicate

### T5.2 seed lifecycle — PR #19

Owner branch: `t5/seed-lifecycle`.
Current exact reviewed head: `ed46c92e7fda62946e6dc4c0b3b32994f81241d5` with Repository Integrity success.

Do not launch a parallel Codex task against resolver/seed lifecycle while #19 is active. Canonical producer/consumer wiring is intentionally deferred to content batches.

### T5.3 NPC knowledge — PR #9

Owner branch: `t5/npc-memory`.
Must re-ground after accepted T5.2 hardening and preserve combined resolver behavior. Do not launch overlapping NPC/resolver work until that integration point is resolved.

### Presentation/Android — PR #14

Independent presentation owner. Do not modify narrative canon from this queue.

---

## Future canonical runtime queue — BLOCKED by T5-MIG-01

These batches may be prepared/re-grounded, but must not change the active catalog in main before supported migration is reviewed and integrated.

### 2. BLOCKED-BY-T5-MIG-01 — canonical runtime 20–23

Scope: T5.5–T5.9 principals/conditionals, exact canonical IDs, legacy scheduler retirement, choice eligibility/OR gates where required, seed/NPC causal wiring.

Source audit: PR #10 / integrated central T5.1 evidence.

### 3. BLOCKED-BY-20-23 — canonical runtime 23–26

Scope: T5.10–T5.14. Use integrated PR #12 audit/readiness cards and PR #27 migration handoff. Exact-ID semantic collisions require provenance-aware migration.

### 4. BLOCKED-BY-23-26 — canonical runtime 26–30

Scope: T5.15–T5.21. Preserve age-26 seed chronology, documentary/successor/record chains and historical `seed.originEvent` truth.

### 5. BLOCKED-BY-26-30 — canonical runtime 30–34

Scope: T5.22–T5.28. Replace/certify 50 principals and 26 conditionals according to central semantic review. No generic shells may be called canonical solely from IDs/titles.

### 6. BLOCKED-BY-30-34 — canonical runtime 34+

Scope: T5.29–T5.35. Exact canonical IDs required; do not retain legacy IDs as aliases for different scenes. Late-career facts such as no-market, medical failure, derby/farewell outcomes must be causal.

### 7. BLOCKED-BY-34PLUS — retirement + epilogue

Scope: T5.36–T5.37.

Requirements:
- preserve `playing -> decided -> announced -> closed` terminal authority unless Pedro explicitly approves an amendment;
- `closed` remains terminal;
- last match/storybook/no-last-match must be fact-driven;
- legacy `CEVT_RET_RECONSIDER` is history-only and is not an alias for canonical reversal;
- future canonical `CEVT_38_RETIREMENT_REVERSAL` behavior still requires explicit product decision. Current source-fit recommendation is a bounded extension while remaining `announced`, preserving announcement history.

### 8. BLOCKED-BY-ALL-CONTENT — T5.38 final audit

Run final consolidated evidence:
- exact active 388 canonical identities;
- semantic/causal certification;
- 210-seed lifecycle classification;
- 20-NPC knowledge/relationship traceability;
- migration/save compatibility;
- RNG/determinism isolation;
- long-career and retirement/epilogue closure;
- no impossible states or blocked careers in required simulation profiles.

## State vocabulary

- `DRAFT`: specified but not executable.
- `READY`: dependencies satisfied; may be launched only on explicit `ejecuta Codex`.
- `BLOCKED-BY-X`: do not launch until dependency X is reviewed/integrated.
- `RUNNING`: Codex implementation active.
- `REVIEW`: implementation returned; ChatGPT inspecting diff/tests.
- `CHANGES_REQUESTED`: review found defects.
- `READY_TO_MERGE`: reviewed and green; still requires Pedro's explicit `fusiona`.
- `DONE`: merged/closed only under explicit merge instruction/confirmed integration.

## Safety rules

- Never auto-merge.
- Never launch Codex without explicit user request.
- Never launch two overlapping write sets.
- Never use green CI from an older HEAD as evidence for a newer one.
- Never weaken `contentIdentity`, save baselines or QA gates to make a task pass.
- Never rewrite old history/pending choices from title/theme similarity.
- Every future content batch must re-ground on the then-current integrated main immediately before implementation/review.
