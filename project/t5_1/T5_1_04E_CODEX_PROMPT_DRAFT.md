# DRAFT Codex task — T5.1 Batch 04E epilogue + terminal QA

**DO NOT EXECUTE while Batch 04E is DRAFT in `project/CODEX_QUEUE.md`.**

## Preconditions

Do not launch until:
- principal 04D retirement FSM is reviewed/integrated;
- conditional 05E 34+ reconciliation is reviewed/integrated;
- retirement-reversal canon decision is resolved and reflected in runtime/state migration;
- full canonical event set is ready for terminal/final QA.

## Objective

Make epilogue generation a truthful deterministic projection of immutable canonical terminal facts and run the final T5.1 terminal/388-event QA.

Primary authority:
- `project/t5_1/T5_1_04E_EPILOGUE_RUNTIME_AUDIT.md`
- `project/t5_1/T5_1_COMPLETION_GATE.md`
- `project/t5_1/T5_1_COMPLETION_STATUS_2026-09-16.md`
- `project/t5_1/T5_1_AUDITOR_IMPLEMENTATION_SPEC.md`
- reviewed 04D/05E implementation artifacts.

## Preserve the good invariant

Current `generateEpilogue()` only generates when `retirement.status === "closed"`.

Preserve this. Do not broaden epilogue eligibility to compensate for upstream retirement bugs.

## Required terminal-fact contract

Epilogue scoring/copy must distinguish and truthfully consume at least:
- retirement age;
- primary retirement reason;
- decision origin/event/choice where available;
- announcement path/style;
- closure/last-match shape;
- final club and actual final route;
- body/health context;
- final national-team posture;
- actual home-finish truth vs home pull/history;
- succession/mentor state;
- records/legacy state;
- wealth/brand/business state;
- agent/self-representation state;
- family/post-career readiness;
- public/fan relationship.

Implementation may use a validated projection/helper rather than expanding persisted epilogue schema, but the dependency must be auditable and contradictions must be testable.

## Known epilogue issues to repair/verify

### Home truth
Do not classify/copy “finished at home” from `homePull`, an earlier home-return flag or route intent alone. Require actual final-home facts where the ending claims a final-home career.

### Reason vs closure shape
Keep separate:
- why retirement was decided (`no_market`, health, voluntary/high/low, etc.);
- how sporting closure occurred (`planned_last_match`, `no_last_match`, storybook/decisive, etc.).

Do not use one field as the other.

### Early retirement
Do not trust legacy direct-close `early_retirement` closure labels after 04D. Use canonical decision origin/reason.

### Reversal/comeback
Only score reversal/comeback endings from the explicitly approved canonical state model and truthful history. Do not keep legacy `reversals` flags as sufficient proof if 04D migrates/changes semantics.

### Storybook
Only score storybook farewell when 05E/04D establish a real played last match and actual sporting goal/decisive result. Never infer it from a narrative choice.

## Epilogue invariants

1. unavailable before `closed`;
2. generated exactly once for a closed immutable state;
3. generation does not mutate sporting/terminal/history/RNG facts;
4. same closed state -> identical epilogue;
5. announcement tone cannot rewrite sporting facts;
6. `no_last_match` and a played/storybook last match are mutually exclusive;
7. accepted playable contract/offer cannot coexist with immediate retirement epilogue;
8. home aspiration is not home finish;
9. marketing/farewell language is not proof of retirement;
10. milestones preserve actual historical event/choice IDs, including legacy IDs where appropriate.

## Final 388-event QA

After epilogue truthfulness is repaired, execute the final T5.1 gates.

### Identity
Require:
- 254/254 canonical principals exactly once;
- 134/134 canonical conditionals exactly once;
- 388/388 total;
- zero duplicate canonical IDs;
- zero active runtime-only conditional IDs;
- zero active runtime-only principal IDs unless explicitly approved and separated outside canonical scheduling/catalog;
- all baseline legacy drift IDs have reviewed dispositions.

### Semantic
Require every active canonical event to have full verification evidence or explicit approved exception.

No exact ID/title/runtime legacy `verified` status may substitute for semantic evidence.

### Migration/save
Require:
- historical truth preserved;
- pending scene truth preserved;
- compatible seeds preserved;
- no silent canonical SEEN/history laundering;
- save/resume deterministic at phase and terminal boundaries.

### Causal chains
Run all mandatory long-range seed/NPC chains from the completion gate and semantic map, before and after save/resume.

### Retirement
Run all 04D/05E state/closure/reversal tests.

### Determinism/RNG
Require:
- same seed + same commands/choices -> same strong narrative and terminal outcome;
- reads/UI render consume no RNG;
- microfeeds do not perturb strong narrative/retirement/epilogue outcome;
- RNG streams remain separated.

## Acceptance-batch requirements

After targeted suites are green:
1. run deterministic terminal replay;
2. run the repository’s 1000-career acceptance/QA batch;
3. regenerate final T5.1 audit artifacts;
4. require zero unresolved canonical IDs;
5. require zero unreviewed exact-title/legacy mappings;
6. require zero `canonical_verified_full` records with missing evidence;
7. require zero retirement deadlocks;
8. inspect closure-shape and ending-family coverage;
9. perform the small human-observation pass required by completion gate for late-career pacing and abrupt no-market/no-last-match behavior.

Do not use the large acceptance run as a substitute for targeted semantic tests.

## Suggested write scope

Primary:
- `src/epilogue/generator.ts` and narrowly necessary epilogue validation/helpers;
- final T5.1 audit/test scripts;
- terminal/epilogue fixtures;
- final analysis/audit artifacts.

Do not reopen canonical event content casually in 04E. If final audit reveals an event semantic failure, report/request a scoped correction rather than hiding it in epilogue code.

## Required commands

At minimum:

```text
npm run build
npm run validate
npm run test:session
npm run test:saves
npm run audit:t51
npm run test:t51
```

Plus all explicit T5.1 identity/semantic/migration/causal/retirement/full lanes introduced by 05A and later batches, followed by the final acceptance batch.

## Acceptance

04E is reviewable only when:
- epilogue consumes truthful canonical terminal facts;
- contradictions are impossible or explicitly rejected;
- generation remains closed-only and deterministic;
- final 388-event canonical audit is green;
- migration/save/causal/retirement/RNG gates are green;
- acceptance distribution has no retirement deadlocks;
- final evidence artifacts are regenerated from current implementation;
- no merge without Pedro’s explicit instruction.

## State

**DRAFT PROMPT — FINAL T5.1 TASK, BLOCKED BY 04D + 05E + ALL PRIOR CANONICAL RECONCILIATION**