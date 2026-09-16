# T5.1 — Conditional reconciliation plan (134/134)

## Confirmed baseline

The Documento Maestro contains exactly **134 unique `CEVT_*` IDs**. The P1 runtime baseline also contains 134 conditional EventDefinition rows, but only **47 IDs match canon literally**. Therefore **87 canonical conditional IDs are missing and 87 runtime conditional IDs are technical-only/legacy** in that baseline. This is a structural identity debt, not a count deficit.

| Phase | Canon | Runtime baseline | Exact IDs | Drift |
|---|---:|---:|---:|---:|
| 18_20 | 14 | 14 | 14 | 0 |
| 20_23 | 18 | 18 | 3 | 15 |
| 23_26 | 20 | 20 | 20 | 0 |
| 26_30 | 24 | 24 | 5 | 19 |
| 30_34 | 26 | 26 | 0 | 26 |
| 34_plus | 32 | 32 | 5 | 27 |

## Important contract difference at age 30+
Before age 30, canonical conditional tables normally provide `ID + title + condition + scene/decision + function`. From 30 onward, the canonical tables use `ID + condition + scene + pattern/function`; a title is not always canonical data. **Do not invent titles and do not use title similarity as an identity proof for 30+ callbacks.**

## Batches

### C0 — exact-ID semantic foundation (18–20 and 23–26)
- 34 conditionals have exact IDs, but P1 marks all 34 as `technical_adaptation`.
- Review canonical condition/scene/function, gates, seeds, NPCs and outcome semantics.
- Use this batch to establish the machine-readable conditional validator before migrating drifted IDs.

### C1 — phase 20–23
- 18 canonical conditionals.
- 3 exact IDs, 15 identity drifts.
- Run only after principal Batch 01 so the seeds/state gates used by these callbacks are stable.

### C2 — phase 26–30
- 24 canonical conditionals.
- 5 exact IDs, 19 identity drifts.
- Run after principal Batches 02A–02E and seed chronology repair.

### C3 — phase 30–34
- 26 canonical conditionals.
- **0 exact IDs** in P1 baseline.
- Highest identity-risk block. Do not fuzzy-rename. Build an explicit legacy→canonical crosswalk from condition/scene/function semantics.

### C4 — 34+ / retirement
- 32 canonical conditionals.
- 5 exact IDs, 27 identity drifts.
- Run after principal 04A–04D and before 04E epilogue/terminal QA.
- Includes `CEVT_38_RETIREMENT_REVERSAL`, `CEVT_RET_NO_LAST_MATCH`, and `CEVT_RET_STORYBOOK_LAST_GOAL`; these must respect retirement-state and closure-shape invariants.

## Full semantic rule
A callback is not complete because it shares an ID or a generic callback body. It must preserve the canonical condition that makes it possible, the actual scene/context created by the past, and the function of that callback in separating otherwise-similar careers. Generic choices such as “intervene / wait / protect position” require replacement when the canon describes a specific decision.

## Legacy migration rule
For every legacy conditional ID that changes:
1. build an explicit mapping only after semantic review;
2. migrate `pendingEventId` when the pending event is genuinely the same canonical callback;
3. preserve old `history.eventId` as historical truth or version it explicitly—do not pretend the user saw a canonical callback they never saw;
4. migrate seed origin/consumedBy references only when semantic identity is established;
5. never create `SEEN_<canonical>` solely from fuzzy/title similarity.

## Acceptance
- exact canonical conditional ID set is 134/134;
- zero runtime-only conditional IDs in the active catalog;
- zero duplicate conditional IDs;
- all 134 have semantic evidence against the correct canonical table row;
- zero `technical_adaptation` unless an explicit approved exception remains;
- deterministic eligibility/resolution after save/resume;
- microfeed toggle does not change strong callback trajectory;
- terminal callbacks preserve `playing -> decided -> announced -> closed`;
- final 388-event manifest validates 254 principal + 134 conditional IDs exactly.
