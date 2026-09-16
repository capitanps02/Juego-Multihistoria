# T5.1 — canonical decision required: retirement reversal

Generated: 2026-09-16

## Why this decision is required

Two canonical handoff sources currently point in different directions:

### Conditional review matrix
Defines canonical `CEVT_38_RETIREMENT_REVERSAL` with the idea:
- prior retirement/announcement context;
- motivation returns;
- months later a concrete offer creates a possible return;
- reversal carries loss of rhythm/reputation/control and is not a simple undo button.

### Retirement semantic map / completion gate
Defines the product terminal model as monotonic:

`playing -> decided -> announced -> closed`

and explicitly prohibits:
- `closed -> *`.

Current runtime does not resolve the conflict cleanly. `reverseRetirement()` permits `announced` or `decided` to return to `playing`, and `CEVT_RET_RECONSIDER` uses the announced route.

## Decision that must be made before 04D/05E implementation

Choose and document exactly one canonical interpretation (or provide another explicit model).

### Option A — reconsideration is pre-closure only
Interpret “retirement reversal” as reconsidering **after public announcement but before sporting closure**.

State behavior could remain monotonic only if the model is explicitly amended to allow a reversible `announced` window, because `announced -> playing` is backwards relative to the current monotonic contract.

Required clarification:
- is `announced -> playing` now an approved exceptional transition?
- what announcement/history remains immutable?
- can the player announce retirement again later?
- how is epilogue prevented during the reversible window?

### Option B — introduce an explicit reversible/intermediate state
Add a non-terminal state representing post-announcement / temporarily retired / reconsiderable status while keeping `closed` terminal.

This is a state-model change and requires:
- schema/save migration;
- scheduler/session validation changes;
- explicit transition table;
- epilogue guard rules;
- tests for old announced/closed saves.

### Option C — `closed` remains terminal; remove post-closure comeback from playable canon
Treat the matrix wording “months after retiring” as narrative intent that must be adapted to a pre-closure offer, while `closed` remains irreversible.

This preserves the current canonical FSM authority but requires an explicit canonical amendment to `CEVT_38_RETIREMENT_REVERSAL` wording/trigger.

### Option D — allow `closed -> playing` as an exceptional comeback
This directly changes the current terminal contract.

If chosen, it requires explicit redesign of:
- epilogue immutability/regeneration;
- final statistics/records;
- save compatibility;
- closed-session commands;
- career simulation termination;
- offer generation;
- terminal history;
- all assumptions that `closed` is immutable.

This option has the largest blast radius and must never be inferred implicitly.

## What implementation must NOT do before the decision

- do not keep current `announced -> playing` merely because runtime already supports it;
- do not implement `closed -> playing` from the matrix wording;
- do not delete reversal content silently to satisfy the monotonic FSM;
- do not make epilogue reversible without explicit design approval;
- do not migrate old announced/closed saves into a new model without dedicated compatibility rules.

## Temporary audit disposition

Until a canonical decision is recorded:
- `CEVT_38_RETIREMENT_REVERSAL`: `blocked_canonical_state_model_conflict`;
- `CEVT_RET_RECONSIDER`: runtime technical behavior, **not canonically approved**;
- Batch 04D may audit/repair all other FSM issues but must not finalize reversal semantics;
- Batch 05E must remain HARD-BLOCKED on this point;
- Gate E cannot PASS.

## Status

**CANON_DECISION_REQUIRED — NO IMPLEMENTATION ASSUMPTION APPROVED**