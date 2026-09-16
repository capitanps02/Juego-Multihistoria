# T5.1 Batch 05A — targeted test specification

Generated: 2026-09-16  
Status: audit/test design only; no runtime implementation authorized.

## Objective

Define the minimum executable evidence required before any exact-ID conditional callback can receive `canonical_verified_full`.

The current generic T5.1 test is insufficient: `scripts/audit-t51.mjs` and `scripts/test-t51.mjs` still model conditional reconciliation as `count_only_not_semantically_reconciled` because the older audit had no canonical conditional inventory. T5.1 now has a 134-row canonical conditional matrix, a 388-ID identity manifest, 05A exact-ID dispositions and the 05D 30–34 semantic review. The future auditor must consume those artifacts rather than retain the old count-only assumption.

## A. Auditor replacement tests

### A1 — canonical inventory loading
Assert:
- canonical principal IDs = 254;
- canonical conditional IDs = 134;
- total canonical IDs = 388;
- no duplicate canonical IDs;
- every runtime active event ID is compared against the appropriate canonical set.

### A2 — no status laundering
For an exact-ID event with runtime `canonStatus:"verified"`, deliberately fail one semantic field in an audit fixture and assert the final audit status is **not** `canonical_verified_full`.

Must cover at least:
- `CEVT_29_NAT_02` (runtime verified but generic factory);
- `CEVT_RET_NO_LAST_MATCH` (runtime verified but condition mismatch);
- `CEVT_RET_STORYBOOK_LAST_GOAL` (runtime verified but outcome/function mismatch).

### A3 — exact ID is identity only
Assert that exact-ID equality can satisfy `identity`, but cannot automatically satisfy:
- condition;
- scene;
- choices;
- outcomes;
- function;
- seeds/NPCs;
- migration/save behavior.

### A4 — conditional review completeness
Assert there is one reviewed disposition for every canonical conditional row before T5.1 can close.

Target count: **134/134**.

## B. 18–20 strong-candidate eligibility tests

Use deterministic fixtures rather than waiting for naturally occurring random careers whenever possible.

### B1 — `CEVT_18_NODEBUT_01`
Positive fixture:
- age 18;
- January;
- no official debut;
- role < 24.

Assert:
- `JAN_NO_DEBUT` is produced;
- callback is eligible in January;
- serializing/reloading the same state preserves eligibility and choices;
- no UI/view read changes football or narrative RNG.

Negative controls:
- official debut already happened;
- role >= 24;
- non-January month.

### B2 — `CEVT_19_BIG_01`
Fixture at age 19 with market heat >= 42 immediately before the simulator step that can create `BIG_CLUB_INTEREST`.

For a seed known to trigger the flag:
- advance once without save;
- clone the pre-step state via serialize/load and advance the clone;
- assert both produce identical flag state and identical RNG state after the step;
- once eligible, assert save/reload preserves the exact callback and choice IDs.

Negative control: market heat < 42 must not create the flag through this route.

### B3 — `CEVT_19_ABROAD_01`
Positive fixtures must separately cover:
1. active agent route;
2. `HAS_SEED_FIRST_AGENT` route.

Require market heat >= 30. For a deterministic triggering seed, save/reload immediately before the world step and assert identical `FOREIGN_DEV_INTEREST` result.

Negative controls:
- neither agent nor first-agent memory;
- market heat < 30.

### B4 — `CEVT_19_NANO_01`
Build the causal chain through actual event resolution rather than setting the final flag by hand:
1. create/intensify `SEED_NANO_SHADOW` through an earlier Nano interaction;
2. reach the principal scene containing `MOVE_CONTACT`;
3. choose `MOVE_CONTACT` and obtain the outcome that sets `UNSOLICITED_NANO_HELP`;
4. save/reload;
5. assert the seed payload/intensity and flag survive exactly;
6. assert `CEVT_19_NANO_01` eligibility survives exactly;
7. resolve each callback choice in isolated clones and confirm history records the actual callback ID/choice/outcome rather than a substituted scene.

Negative controls:
- unsolicited flag without seed;
- seed without unsolicited flag.

### B5 — `CEVT_18_VELA_01`
Start from the established Vela/director tension state immediately before an eligible escalation world step. With a seed that produces `VELA_SEPARATED`:
- compare uninterrupted versus save/reload continuation;
- assert identical escalation result and football RNG state;
- assert event eligibility appears only after separation.

Negative control: no `VELA_SEPARATED` means no callback even if the general board tension exists.

### B6 — `CEVT_18_EARLY_01`
Positive causal fixture must prove:
- age 18;
- official debut;
- early season day;
- form >= 60;
- media heat sufficient for the callback exclusion;
- deterministic RNG route produces `EARLY_BREAKOUT`.

Compare uninterrupted and save/reload before the trigger.

Negative controls:
- no debut;
- season day >= 150;
- form < 60;
- callback-time media heat < 12.

This test should explicitly document that runtime is stricter than the broad canonical trigger because it adds form and stochastic materialization.

## C. Partial causal proof test

### C1 — `CEVT_19_INJ_01`
Prove current runtime behavior before deciding whether it is canonically sufficient:
- risk < 43 cannot enter the ordinary injury creation branch;
- long injury creation requires risk >= 58 and the long-injury RNG branch;
- when a long injury is created, `LONG_INJURY` survives save/reload and produces callback eligibility.

Separate semantic assertion (expected FAIL until repaired/proven): prior treatment/body-memory must measurably affect the canonical complication path. Merely listing `SEED_BODY_PRECEDENT` or `SEED_PHYSIO_CONFIDENCE` in `seedsRead` is not sufficient.

## D. Known expected-failure semantic tests

These should be encoded as audit failures or repair tests rather than accepted behavior.

### D1 — `CEVT_19_SOCIAL_01`
Canonical eligibility has two routes:
- night photo;
- high exposure + recent conflict.

Test cases must demonstrate current mismatch:
- `NIGHT_PHOTO=true` with media heat below runtime threshold is rejected today even though the canonical photo route should be sufficient;
- high exposure + recent conflict without `NIGHT_PHOTO` cannot trigger today though canon permits it.

Repair acceptance requires both canonical routes and no accidental third route.

### D2 — seed metadata is not a modifier
For `CEVT_18_BRUNO_01`, `CEVT_18_CCH_01`, `CEVT_18_RELEG_01`, `CEVT_19_RETURN_01` and other function-gap callbacks:
- prepare two states differing only in the relevant seed memory;
- if runtime behavior/eligibility/outcome distribution is identical, auditor must keep the canonical function field FAIL/UNVERIFIED;
- after repair, assert the required memory changes the intended behavior without dictating the outcome.

## E. RNG isolation tests

For each deterministic fixture above:
1. take a snapshot of all RNG streams;
2. call event eligibility/scheduling views that are meant to be read-only;
3. render/extract decision intel if the API exposes it;
4. toggle microfeed-equivalent non-causal presentation state where available;
5. assert relevant RNG streams did not advance.

Then execute exactly one world simulation step and assert only the intended simulation stream changes according to existing RNG contracts.

## F. Pending-scene save truthfulness

For every callback selected for certification:
1. produce the event as a pending decision;
2. serialize the session/save before choosing;
3. reload;
4. assert same event ID, title, body/intel and same ordered choice IDs/labels;
5. resolve the same choice in original and reloaded copies;
6. assert identical outcome ID, effects, seed transitions, history entry and resulting RNG states.

This is especially important before any future content-identity migration. A pending legacy scene may never be silently swapped for a semantically different canonical scene.

## G. Commands required when 05A runtime work eventually occurs

At minimum:
```text
npm run build
npm run validate
npm run test:session
npm run test:saves
npm run audit:t51
npm run test:t51
```

The revised `audit:t51` / `test:t51` must no longer assert `count_only_not_semantically_reconciled` for conditionals.

## Completion rule for this test slice

05A targeted QA passes only when:
- the canonical 134 conditional inventory is loaded by the auditor;
- exact ID cannot launder semantic failures;
- the six strong 18–20 candidates pass causal/save/RNG tests;
- known mismatches remain failing until explicitly repaired;
- pending decision truth is preserved;
- no test relies on a stale pre-conditional T5.1 report.

## Status

**TEST_SPEC_COMPLETE / EXECUTION_DEFERRED_TO_IMPLEMENTATION**