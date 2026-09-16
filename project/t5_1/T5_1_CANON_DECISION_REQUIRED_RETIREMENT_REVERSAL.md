# T5.1 — canonical decision required: retirement reversal

Generated: 2026-09-16

## Why this decision is required

Two canonical handoff sources currently point in different directions.

### Conditional review matrix

Defines:
- `CEVT_38_OFFER_AFTER_RETIREMENT_ANNOUNCED`
  - condition: retirement announced + market emergency;
  - scene: a club calls after the announcement and asks whether the player would reconsider;
  - function: the public decision creates a cost of reversal, not a physical impossibility.
- `CEVT_38_RETIREMENT_REVERSAL`
  - condition: prior announcement + motivation returns;
  - scene: months later the player contemplates returning for a concrete offer;
  - function: an exceptional return with loss of rhythm/reputation/control, never a simple undo button.

### Retirement semantic map / completion gate

Defines the product state model as:

`playing -> decided -> announced -> closed`

and explicitly requires T5.1 to **preserve that monotonic model**.

It also states:
- `announced` means retirement is public **but the sporting career has not necessarily ended**;
- the player may still train/play while `announced`;
- no new long-horizon transfer/career arcs should normally open;
- `closed -> *` is prohibited;
- epilogue is unavailable before `closed`.

Current runtime does not resolve the conflict cleanly. `reverseRetirement()` permits `announced` or `decided` to return to `playing`, and `CEVT_RET_RECONSIDER` uses the announced route.

## Source-derived constraints

Any approved interpretation must satisfy all of the following unless the canon is explicitly amended:

1. the public announcement remains a historical fact once made;
2. `closed` remains terminal;
3. epilogue remains inaccessible before `closed`;
4. an offer after announcement must be playable in some form because the conditional matrix explicitly defines it;
5. reconsideration must have costs/consequences rather than behave as a free undo;
6. no silent `announced -> playing` transition may survive merely because the current runtime already has it;
7. save/resume must preserve the state and announcement history exactly;
8. last-match/closure logic must remain fact-driven and not be manufactured by reversal handling.

## Decision that must be made before 04D/05E implementation

Choose and document exactly one canonical interpretation, or provide another explicit model.

### Option A — reconsideration is pre-closure and may exceptionally return to `playing`

Interpret the reversal as reconsidering **after public announcement but before sporting closure**, and explicitly approve an exceptional `announced -> playing` transition.

Required clarification:
- is `announced -> playing` a single exceptional transition or generally legal?
- what public announcement/history remains immutable?
- can retirement later be announced again?
- does the original announcement remain part of epilogue/history?
- how are duplicate announcement events prevented?

Impact: medium/high. Preserves the four-state schema but breaks monotonicity.

### Option B — introduce an explicit reversible/intermediate state

Add a non-terminal state representing post-announcement reconsideration or temporary retirement while keeping `closed` terminal.

Requires:
- state/schema/save migration;
- scheduler/session validation changes;
- explicit transition table;
- epilogue guard rules;
- migration tests for old `announced`/`closed` saves.

Impact: high. Semantically expressive but changes the canonical state model.

### Option C — `closed` remains terminal; adapt the reversal to a pre-closure offer

Treat matrix wording such as “months after retiring” as loose narrative wording and constrain the playable reversal to the period after announcement but before closure.

This preserves `closed -> *` prohibition, but still needs an answer for what happens to `retirement.status` if the player genuinely cancels the announced retirement.

Impact: medium. Preserves terminality but does not by itself resolve the `announced` state semantics.

### Option D — allow `closed -> playing` as an exceptional comeback

This directly changes the current terminal contract.

Requires redesign of:
- epilogue immutability/regeneration;
- final statistics/records;
- save compatibility;
- closed-session commands;
- career simulation termination;
- offer generation;
- terminal history.

Impact: very high. This option has the largest blast radius and must never be inferred implicitly.

### Option E — preserve the monotonic FSM; accept the offer as an announced-career extension without returning to `playing`

Interpret `retirement.status` as the **retirement-process state**, not simply “is currently playing football”.

Under this model:
- the player has already publicly announced retirement, so `status` stays `announced`;
- the announcement remains immutable historical truth;
- accepting the emergency offer creates an explicit extension/reconsideration memory and delays the sporting closure;
- the player may train/play under the accepted short/exceptional contract because the semantic map already says an `announced` player may still play;
- closure happens later through canonical terminal logic;
- `closed` remains terminal;
- no `announced -> playing` rollback occurs;
- epilogue remains unavailable until eventual `closed`.

To avoid turning `announced` into an unlimited second career, implementation would need bounded rules such as:
- accepted post-announcement offer must be short/exceptional or tied to the concrete emergency context;
- do not reopen ordinary long-horizon transfer arcs;
- retain the original announcement date/path;
- create explicit reconsideration/extension history and costs;
- once the extension ends, return to terminal sporting-closure responsibility rather than a fresh generic career loop.

Impact: low/medium relative to the other playable-reversal models. It preserves the explicit monotonic FSM and `closed` terminality while still honoring the matrix requirement that a post-announcement offer can be reconsidered.

## Constraint-fit comparison

| Option | Honors post-announcement offer | Preserves monotonic four-state FSM | Keeps `closed` terminal | Requires schema-state expansion | Main risk |
|---|---:|---:|---:|---:|---|
| A | yes | no | yes | no | backward transition / duplicate retirement lifecycle |
| B | yes | no, model changes | yes | yes | broad migration/state complexity |
| C | partly | not fully resolved | yes | no | leaves status semantics ambiguous |
| D | yes | no | no | probably | terminal/epilogue invalidation |
| E | yes | **yes** | **yes** | no new retirement status required | must tightly bound extension so `announced` is not a new indefinite career mode |

## Current planning recommendation — not canonical approval

**Option E is the strongest fit with the two supplied sources as currently written.**

Reason:
- the matrix explicitly wants reconsideration after announcement;
- the semantic map explicitly says `announced` may still include training/playing;
- the semantic map explicitly requires preserving the monotonic four-state model;
- `closed -> *` stays prohibited;
- public announcement remains historical truth rather than being erased.

This is a technical/semantic recommendation only. It is **not** recorded as an approved canon decision until Pedro explicitly approves it or another interpretation.

## What implementation must NOT do before approval

- do not keep current `announced -> playing` merely because runtime already supports it;
- do not implement `closed -> playing` from the matrix wording;
- do not delete reversal content silently to satisfy the monotonic FSM;
- do not make epilogue reversible without explicit design approval;
- do not migrate old announced/closed saves into a new model without dedicated compatibility rules;
- do not treat this document's Option E recommendation as user approval.

## Temporary audit disposition

Until a canonical decision is explicitly recorded:
- `CEVT_38_RETIREMENT_REVERSAL`: `blocked_canonical_state_model_conflict`;
- `CEVT_RET_RECONSIDER`: runtime technical behavior, **not canonically approved**;
- Batch 04D may audit/repair all other FSM issues but must not finalize reversal semantics;
- Batch 05E remains HARD-BLOCKED on this point;
- Gate E cannot PASS.

## Status

**CANON_DECISION_REQUIRED — OPTION E CURRENTLY BEST SOURCE-FIT, NOT APPROVED**
