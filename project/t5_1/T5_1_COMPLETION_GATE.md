# T5.1 — Completion gate for canonical principal reconciliation

## Purpose
T5.1 is complete only when the engine's principal-event layer is both identity-complete and semantically faithful to the canonical source. Matching counts or literal IDs is not sufficient.

## Baseline
- Canonical principal events: 254
- Literal engine IDs found by the initial audit: 167
- Principal canonical IDs initially unresolved: 87
- Planned batch coverage: 87 / 87 unique unresolved IDs
  - 20–23: 6
  - 26–30: 26
  - 30–34: 22
  - 34+/terminal mismatch IDs: 33

The 87-ID manifest is machine-checked in `T5_1_GLOBAL_RECONCILIATION_MANIFEST.json`.

## Gate A — Identity completeness
PASS only if:
1. every one of the 254 canonical principal IDs exists exactly once in active principal content;
2. no canonical principal ID is only represented by an unapproved technical alias;
3. the unresolved list is empty;
4. exact-title candidates are either semantically migrated or explicitly rejected as aliases;
5. technical-only IDs receive an explicit disposition: migrated, retired, or retained as non-canonical content with a documented reason.

A count of 254/254 alone is not a pass.

## Gate B — Semantic verification
A principal event may be `canonStatus: verified` only after explicit comparison of:
- window / trigger;
- visible information;
- imperfect / uncertain information;
- hidden state actually used by implementation where representable;
- player choices and their distinct intent;
- immediate and deferred consequences;
- seed reads;
- seed writes / transitions;
- NPC references;
- age and phase placement;
- continuity with later events;
- retirement or phase-transition responsibility, when applicable.

Generic family text/choices cannot receive `verified` merely because title, age or theme is similar.

## Gate C — Seed chronology
PASS only if:
1. each canonical seed's `originEvents` matches the first canonical scene that creates it;
2. the lower bound of `ageWindow` is no later than the canonical origin year;
3. later technical events no longer falsely create seeds that should already exist;
4. a later canonical event reading a seed can observe it after save/resume;
5. removing a false writer does not erase an already-active seed from historical saves.

### Mandatory long-range chains
At minimum, automated tests must cover:
- age 26 record choice -> age 27 public record tone -> age 33 record/body conflict;
- age 27 successor -> age 28 succession decision -> age 31/32 succession pressure;
- age 27 parallel negotiation -> age 32 Bosman -> age 35 January move;
- age 27 wealth structure -> age 31 business reputation shock;
- age 26 big-game bench -> age 26 final bench -> age 30 big-game rotation;
- age 30 dorsal -> age 34 final dorsal;
- age 30 travel/load choices -> age 34 team-wins-without-you;
- age 34 hero moment -> retirement-on-high context;
- age 33 priority -> age 34 reality bridge without forced retirement.

## Gate D — Save and migration truthfulness
PASS only if:
- old technical event history remains old technical event history;
- migrations do not manufacture `SEEN_<canonicalId>` simply because an old event was conceptually similar;
- compatible active seeds survive migration;
- no weakening/removal of `contentIdentity` validation is used to hide content changes;
- save/resume works at relevant transition boundaries;
- command idempotency and revision checks remain intact.

## Gate E — Retirement state machine
Canonical terminal state remains monotonic:

`playing -> decided -> announced -> closed`

### Prohibited transitions
- `playing -> closed`
- `playing -> announced` without a resolved announcement step
- `decided -> closed` while canonical announcement/closure remains applicable
- `closed -> *`

### Semantic rules
- discussing retirement does not decide retirement;
- farewell marketing does not decide retirement;
- a club farewell offer does not decide retirement;
- peer retirement does not decide retirement;
- accepting a lower level, short contract, rich offer or veteran role keeps the career playable;
- `no_market` cannot bypass the canonical market-agency decision path when that path is eligible;
- the final match is not guaranteed;
- epilogue is exposed only after `closed`.

## Gate F — Epilogue truthfulness
The epilogue reads immutable terminal facts. It must not invent a more cinematic ending.

Required inputs include:
- retirement age and primary reason;
- decision origin;
- announcement path;
- closure / last-match shape;
- final club/route;
- body/health context;
- national-team final posture;
- home-return truth;
- succession/mentor state;
- records/legacy;
- wealth/brand/business;
- agent/self-representation;
- family/post-career readiness;
- public/fan relationship.

Compatibility examples:
- `no_last_match` and `storybook_last_match` are mutually exclusive;
- an accepted late rich offer cannot immediately coexist with a retirement epilogue;
- wanting a home finish is not the same as actually finishing at home;
- marketing about "last years" is context, not proof of retirement.

## Gate G — Determinism and RNG
PASS only if:
- same seed + same commands/choices => same strong narrative/terminal result;
- reads/UI rendering consume no RNG;
- toggling microfeeds does not perturb strong narrative/retirement outcomes;
- scheduling changes preserve separate narrative/football/microfeed/qa RNG streams.

## Required commands per implementation batch
```bash
npm run build
npm run validate
npm run test:session
npm run test:saves
npm run audit:t51
npm run test:t51
```

Add targeted tests appropriate to each batch. Do not run the expensive 1000-career batch after every small batch unless required to diagnose distribution.

## Final T5.1 evidence run
After all principal batches and terminal reconciliation are integrated:
1. run the complete targeted suite;
2. run deterministic terminal replay;
3. run the 1000-career acceptance batch;
4. regenerate T5.1 audit artifacts;
5. require zero unresolved principal IDs;
6. require zero unreviewed exact-title candidates;
7. require zero `verified` events lacking semantic evidence;
8. require zero retirement deadlocks;
9. inspect closure-shape and epilogue-family coverage;
10. run a small human-observation pass for late-career pacing and abrupt no-market/no-last-match endings.

## Conditional-content gate — now unblocked
The canonical Documento Maestro has now been parsed into **134 unique `CEVT_*` IDs**. Cross-check against the P1 v0.14 runtime matrix shows:
- canonical conditionals: 134;
- runtime conditionals: 134;
- exact conditional IDs: 47;
- canonical conditional IDs missing from that runtime baseline: 87;
- runtime-only conditional IDs: 87.

Therefore T5.1 must not stop after principal reconciliation. Conditional reconciliation is part of the completion gate.

Additional conditional rules:
- before age 30, validate canonical `ID + title + condition + scene/decision + function`;
- at age 30+, canonical conditional tables may omit a title, so never invent a title or use title matching as proof of identity;
- every legacy conditional ID requires explicit semantic crosswalk before migration;
- the 47 exact-ID callbacks also require semantic review because exact ID equality is not full fidelity;
- terminal callbacks (`RET_NO_LAST_MATCH`, `RET_STORYBOOK_LAST_GOAL`, reversal callbacks) must obey retirement-state and epilogue invariants.

## Gate H — Full 388-event identity
PASS only if:
- principal canonical IDs: 254/254 exactly once;
- conditional canonical IDs: 134/134 exactly once;
- active runtime-only principal IDs: 0 unless explicitly approved non-canonical content is separated from the canonical catalog;
- active runtime-only conditional IDs: 0;
- duplicate canonical IDs: 0;
- every migration from legacy IDs is backed by explicit semantic evidence.

## Final statuses
- `NOT_READY`: identity or semantic evidence missing.
- `PRINCIPALS_RECONCILED`: all 254 principal events pass Gates A–G, but T5.1 is not complete yet.
- `CONDITIONALS_RECONCILED`: all 134 conditional events pass the conditional gate.
- `T5.1_COMPLETE`: all **388/388** canonical events pass identity + semantic + causal + migration + deterministic QA gates, and terminal/epilogue QA is green.
