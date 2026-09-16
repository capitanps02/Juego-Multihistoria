# DRAFT Codex task — T5.1 Batch 04D retirement state machine

**DO NOT EXECUTE while Batch 04D is DRAFT in `project/CODEX_QUEUE.md`.**

## Preconditions

Do not launch until:
- principal Batch 04C ages 36–38 is reviewed/integrated;
- task branch is regrounded on the reviewed principal chain;
- `project/t5_1/T5_1_CANON_DECISION_REQUIRED_RETIREMENT_REVERSAL.md` has an explicit approved resolution, or the task is formally scoped to defer reversal while preserving a hard failure for it.

## Objective

Make retirement state responsibility canonical and testable before 05E conditional retirement reconciliation.

Primary authority:
- `project/t5_1/T5_1_04D_RETIREMENT_RUNTIME_AUDIT.md`
- `project/t5_1/T5_1_COMPLETION_GATE.md`
- retirement semantic source under `project/t5_1/source_archives/`
- approved retirement-reversal decision file/amendment.

## Canonical state contract

Unless explicitly amended by the approved reversal decision:

`playing -> decided -> announced -> closed`

`closed` is terminal and epilogue is available only after truthful closure.

## Current runtime defects to repair

### 1. No-market automatic retirement decision
Current `lateCareerPreseason()` can set `playing -> decided` with reason `no_market` from demand/no-offer thresholds.

Repair: surface the canonical market-agency decision path first. Player must have options to lower salary/level, wait, retire or contact a target/home route. Only explicit retirement or a subsequent failed chosen search strategy may create no-market retirement.

### 2. Administrative `decided -> announced` fallback
Current `lateCareerWeek()` announces automatically after 45 days.

Repair: canonical announcement event owns ordinary `decided -> announced`. Any safety fallback must preserve player choice/history and cannot silently invent an announcement path.

### 3. Administrative no-last-match close
Current runtime auto-closes announced retirement after time/contract thresholds as `no_last_match`.

Repair: closure shape must be driven by sporting/health/technical/context facts and canonical final-window responsibility, not elapsed days alone.

### 4. Direct early-retirement close
Current headless simulator sees `EARLY_RETIRED_30_34` and calls `closeCareer()` from any non-closed state.

Repair: early/emergency routes must preserve decision, public announcement and sporting closure distinctions wherever canonically possible; do not allow ordinary `playing -> closed`.

### 5. Non-monotonic reversal
Current `reverseRetirement()` moves `decided`/`announced` back to `playing`.

Repair strictly according to the approved canonical reversal decision. If unresolved, keep this lane failing rather than inventing behavior.

## Canonical terminal events to implement/reconcile

### `EVT_RET_FAM_001` — family conversation
Required choices:
- prepare one last season -> `playing`;
- retire now -> `decided`;
- continue without date -> `playing`;
- wait for offers -> `playing`.

Do not silently alias current two-choice `EVT_RET_HOME_001` without migration/content-identity review.

### `EVT_RET_BODY_001`
Preserve distinct intents:
- rehab to return -> `playing`;
- operate and decide later -> normally `playing`;
- retire for health -> `decided`;
- rehab for health but not competition -> retirement commitment according to approved state model.

### `EVT_RET_HIGH_001`
Retire-on-high is one choice; continue one year / wait for offers / same-club condition remain distinct playable paths.

### `EVT_RET_LOW_001`
Retire is one choice; another club / drop level / wait for preseason remain distinct playable paths.

### `EVT_RET_ANNOUNCE_001`
Firm decision already exists. Every valid canonical announcement path must produce `decided -> announced` exactly once and record the path. Do not use a generic WAIT loop that delegates narrative responsibility to a timer fallback.

### `EVT_RET_LASTMATCH_001`
Last match is not guaranteed. Resolve actual facts rather than letting the player select whether the match “happened”. Support fact-driven closure shapes including:
- planned meaningful appearance;
- short/conditional appearance;
- storybook/decisive appearance if sporting outcome actually occurs;
- no appearance because health/technical/context prevents it.

Do not directly set a goal/appearance from a narrative label.

## State/history fields

On `decided`, persist at least:
- explicit reason;
- originating event/choice where schema supports it;
- decision date/age.

On `announced`, preserve:
- announcement date;
- announcement path/style;
- immutable fact that retirement was publicly announced even if approved reversal design permits later reconsideration.

On `closed`, preserve:
- closure date;
- closure/last-match shape;
- final sporting facts required by epilogue.

Do not use old `SEEN_*` flags as substitutes for these facts.

## Epilogue boundary

`generateEpilogue()` already checks `status === closed`; preserve or strengthen that guard.

Do not solve terminal bugs by making epilogue accept earlier states.

## Save/migration

Add migration/content-identity handling for old pending terminal events.

Required truth:
- old history remains the event/choice actually seen;
- a pending old technical terminal event keeps its old decision contract or fails resume explicitly;
- no migration upgrades old status/history into a more cinematic closure;
- old `closed` saves remain immutable unless the approved reversal decision explicitly redesigns that invariant.

## Tests

Mandatory:

1. No ordinary `playing -> closed`.
2. No ordinary `playing -> announced` without resolved announcement.
3. No `decided -> closed` while canonical announcement/final closure remains applicable.
4. `closed` terminal according to approved model.
5. Every retire-now choice produces `decided`, not closure.
6. Every continue/lower-level/short-contract/wait alternative stays playable.
7. No-market path surfaces agency before deciding retirement.
8. Announcement path happens exactly once and is persisted.
9. No timer invents announcement history.
10. Last-match availability/outcome comes from state/simulation facts.
11. No-last-match and storybook appearance are mutually exclusive.
12. Epilogue not generated/exposed before `closed`.
13. Save/reload at `playing`, pending retire decision, `decided`, pending announcement, `announced`, pending last match and `closed` is exact.
14. Deterministic terminal replay: same seed + same commands -> same reason, announcement path, closure shape and epilogue inputs.
15. UI/read/microfeed operations do not perturb terminal RNG.
16. Headless `simulateCareer` cannot bypass canonical terminal transitions just to ensure all QA careers eventually close.

## Allowed write scope

Likely:
- `src/simulation/late-career-engine.ts`;
- `src/simulation/career-simulator.ts` only where direct terminal bypass must be removed;
- `src/content/events/34_plus/principal-events.ts` for terminal principal events;
- narrowly necessary retirement state/types/save migration/validation;
- retirement-specific tests/fixtures.

Avoid 05E conditional rewrites in this task except minimal compile-safe separation. Avoid epilogue narrative-family redesign; that belongs to 04E.

## Required commands

```text
npm run build
npm run validate
npm run test:session
npm run test:saves
npm run audit:t51
npm run test:t51
```

Plus dedicated retirement FSM/migration/deterministic replay tests.

## Acceptance

- canonical state responsibility is explicit and executable;
- current automatic bypasses are removed/reframed canonically;
- canonical terminal choices are preserved distinctly;
- last-match closure is fact-driven;
- reversal follows an explicit approved model, never an implementation guess;
- save/history truth preserved;
- epilogue boundary remains `closed`;
- all targeted tests pass;
- no merge without Pedro’s explicit instruction.

## State

**DRAFT PROMPT — BLOCKED BY 04C AND RETIREMENT-REVERSAL CANON DECISION**