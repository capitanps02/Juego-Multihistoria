# DRAFT Codex task — T5.1 Batch 05E conditionals ages 34+

**DO NOT EXECUTE while Batch 05E is DRAFT in `project/CODEX_QUEUE.md`.**

## HARD BLOCKER BEFORE EXECUTION

Canonical source tension must be explicitly resolved before this task can become READY:

- conditional matrix includes `CEVT_38_RETIREMENT_REVERSAL`, described as considering a return months after retirement;
- canonical semantic map defines retirement as monotonic `playing -> decided -> announced -> closed` and prohibits `closed -> *`;
- current runtime `CEVT_RET_RECONSIDER` performs `announced -> playing`.

Do **not** let Codex invent a state-model compromise. The approved canonical interpretation must be written into the task/base first.

## Other preconditions

Do not launch until:
- 05D runtime reconciliation is reviewed/integrated;
- principal Batch 04D retirement state machine is reviewed/integrated;
- terminal responsibility and content-identity migration architecture are stable;
- task branch is regrounded on that reviewed base.

## Objective

Implement/reconcile the **32 canonical 34+ conditional callbacks**, including retirement/last-match callbacks, while preserving terminal-state truth, old pending decisions and epilogue invariants.

Primary authority:
- `project/t5_1/T5_1_05E_SEMANTIC_REVIEW_34_PLUS.md`
- `project/t5_1/T5_1_COMPLETION_GATE.md`
- `project/t5_1/T5_1_AUDITOR_IMPLEMENTATION_SPEC.md`
- `project/t5_1/T5_1_SEMANTIC_MAP_26_RETIREMENT.md` source preserved under `source_archives/`.

## Current runtime structure

- 29 late-career callbacks originate from one generic factory with four generic choices;
- three terminal callbacks are individually authored;
- `CEVT_38_OFFER_AFTER_RETIREMENT_ANNOUNCED` gets custom choices after generic construction.

P1 identity:
- canonical callbacks: 32;
- exact IDs: 5;
- identity drifts: 27.

Exact ID is not enough for any of the five.

## Five exact-ID requirements

### `CEVT_34_MAJOR_COMEBACK`
Implement severe injury + successful rehab + 7–10 month return + unexpectedly good short-term performance. Do not use a generic comeback-context callback.

### `CEVT_36_NO_MEDICAL_CLEARANCE`
Implement interested-club external medical assessment / special conditions. Extreme body state alone is not the scene.

### `CEVT_38_OFFER_AFTER_RETIREMENT_ANNOUNCED`
Implement post-announcement market emergency and explicit reconsideration cost/history. Downstream state transition must follow the canonically resolved reversal model; do not retain `announced -> playing` automatically.

### `CEVT_RET_NO_LAST_MATCH`
Closure must be driven by actual health/technical/context facts. Do not use a generic announced-days timeout as the canonical reason.

### `CEVT_RET_STORYBOOK_LAST_GOAL`
Storybook goal is a plausible sporting **outcome**, not a player-selectable guaranteed result. Do not let a choice set the goal directly.

## Terminal state invariants

Unless canonical authority is explicitly amended before execution, preserve:

`playing -> decided -> announced -> closed`

Forbidden ordinary behavior:
- `playing -> closed`;
- `playing -> announced` without resolved announcement;
- `decided -> closed` while announcement step remains applicable;
- `closed -> *`;
- epilogue before `closed`;
- announcement twice;
- last-match closure before announcement.

Retirement discussion/marketing/peer retirement/farewell offers do not equal a retirement decision.

Accepting a lower level, short contract, rich offer or playable veteran role keeps the career playable.

## Last-match closure model

Canonical closure must support fact-driven variants such as:
- planned meaningful appearance;
- short/conditional appearance;
- storybook decisive appearance when the sporting result actually occurs;
- no appearance because health/technical/context prevents it.

Do not manufacture a cinematic match or goal.

Closure facts must be mutually coherent; `no_last_match` and storybook appearance cannot both be true.

## External facts required

Do not create late-career scenes from seeds alone when they require real state for:
- award win;
- successful rehab;
- old coach becoming director;
- Rivas/Nano role changes;
- club relegation/promotion;
- manager dismissal after promise;
- successor injury;
- UDV financial/cup outcomes;
- national tournament injury/final result;
- sponsor exit/late boom;
- youngster assist/replacement;
- record broken by another player;
- continental run;
- staff crisis;
- empty-stadium cause;
- last derby availability;
- post-announcement market emergency.

## Canonical-source tension handling

Before writing code for `CEVT_38_RETIREMENT_REVERSAL`, require a reviewed decision file or task amendment that states:
- allowed source state;
- allowed target state;
- whether `closed` remains terminal;
- what public announcement/history remains immutable;
- how epilogue generation is prevented during any reversible window;
- migration behavior for saves already in `announced` or `closed`.

If that decision is absent, stop the task and report the blocker rather than implementing a guess.

## Migration/save requirements

Retirement pending content is highest-risk migration data.

Preserve exactly:
- state when decision was presented;
- event/content identity;
- ordered choices;
- announcement facts;
- retirement reason;
- closure shape;
- final-match facts;
- RNG state.

Never turn an old generic/technical pending callback into a new terminal decision after reload.

Never rewrite a technical historical retirement scene into a canonical scene the player did not see.

## Tests

Mandatory targeted tests:

1. 32/32 canonical 34+ IDs active exactly once after reconciliation.
2. No active technical extras in canonical 34+ catalog.
3. State transition tests for every retirement action.
4. `closed` cannot reopen unless the resolved canonical model explicitly changes that invariant.
5. No epilogue before `closed`.
6. No-market path preserves player agency before closure.
7. Peer retirement does not decide player retirement.
8. Late rich offer can keep player `playing` when accepted under canonical path.
9. `CEVT_RET_NO_LAST_MATCH` requires actual closure cause/facts.
10. Storybook goal cannot be forced by choice; same seed/commands reproduce the sporting outcome.
11. At least planned, short, storybook/decisive and no-last-match closure shapes can be reproduced without deadlock.
12. Announcement occurs once.
13. Pending terminal decisions survive save/reload exactly.
14. Same seed + same decisions yields identical retirement reason, announcement path, closure shape and terminal facts.
15. Reads/UI/microfeeds consume no strong narrative/terminal RNG.
16. Accepted playable offers do not coexist immediately with retirement epilogue.

Also cover canonical long-range chains from the semantic map:
- late hero moment -> retirement-high;
- drop-level route remains playable;
- short contract returns to market/retirement logic without deadlock;
- home closure does not itself force retirement;
- national-team late cycle;
- mentor/successor late chain.

## Allowed write scope

Primary:
- `src/content/events/34_plus/conditional-events.ts` or a clean phase-local split;
- terminal/retirement code only as required by the already reviewed principal 04D design;
- targeted retirement/conditional tests and fixtures;
- approved compatibility/migration definitions.

Do not modify epilogue semantics beyond what is necessary to enforce “only after closed”; full epilogue truthfulness belongs to 04E.

## Required commands

```text
npm run build
npm run validate
npm run test:session
npm run test:saves
npm run audit:t51
npm run test:t51
```

Plus dedicated retirement, migration, causal and deterministic replay tests introduced by 04D/05E.

## Acceptance

- canonical source tension resolved before code for reversal;
- 32/32 canonical callbacks semantically implemented;
- five exact-ID callbacks no longer launder incorrect semantics through ID/status;
- terminal state behavior matches approved FSM;
- closure shape is fact-driven;
- epilogue remains unavailable before closure;
- legacy history/pending terminal truth preserved;
- deterministic/save/RNG tests pass;
- no merge without Pedro’s explicit instruction.

## State

**DRAFT PROMPT — HARD-BLOCKED BY CANONICAL FSM REVERSAL DECISION AND 04D/05D DEPENDENCIES**