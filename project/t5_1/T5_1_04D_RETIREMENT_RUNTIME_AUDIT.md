# T5.1 Batch 04D — retirement runtime audit against canonical FSM

Generated: 2026-09-16  
Baseline: `chore/chatgpt-codex-workflow`  
Canonical authority: `T5_1_SEMANTIC_MAP_26_RETIREMENT.md` + `T5_1_COMPLETION_GATE.md`.

## Canonical state contract

Canonical terminal model is monotonic:

`playing -> decided -> announced -> closed`

Ordinary forbidden transitions/behaviors include:
- `playing -> closed`;
- `playing -> announced` without explicit announcement responsibility;
- `decided -> closed` while canonical announcement/closure remains available;
- `closed -> *`;
- retirement discussion/marketing/peer events deciding retirement by themselves;
- no-market auto-closure before player-agency path;
- epilogue before `closed`;
- last-match closure before announcement.

## Executive result

Current runtime has useful terminal infrastructure and several canonical-looking events, but **04D does not pass**.

High-priority runtime conflicts found:

1. no-market simulation can set `playing -> decided` automatically without surfacing the canonical agency choices first;
2. a 45-day fallback can set `decided -> announced` without resolving the canonical announcement event;
3. announced state can auto-close as `no_last_match` on time/contract thresholds without fact-driven last-match closure;
4. headless career simulator can call `closeCareer()` directly when `EARLY_RETIRED_30_34` is set, bypassing decision/announcement states;
5. `reverseRetirement()` and conditional `CEVT_RET_RECONSIDER` allow non-monotonic return to `playing` from `announced`/`decided`;
6. principal terminal events are simplified technical approximations of canonical terminal scenes and omit required player choices/semantics;
7. current last-match principal event can manufacture `LAST_MATCH_PLAYED` purely from the player selecting PLAY and can close `no_last_match` without proving why the match did not occur.

## Runtime engine findings

### RTE-01 — no-market auto-decision bypasses agency

`lateCareerPreseason()` can set retirement status to `decided` with reason `no_market` when:
- contract months <= 0;
- no veteran offer;
- enough no-market windows;
- veteran market demand below thresholds.

This happens automatically in simulation.

Canonical map instead requires the late no-market route to surface player options such as:
- lower salary;
- lower level;
- wait;
- retire;
- proactively contact home/specific club.

Only an explicit retire choice, or a later failed search after the selected strategy, may lead to a no-market retirement reason.

Disposition: **canonical agency violation**.

### RTE-02 — 45-day administrative announcement bypass

`lateCareerWeek()` automatically calls `setStatus(state,"announced")` after `decided` has remained for >=45 days and sets `ADMIN_ANNOUNCEMENT_FALLBACK`.

Canonical map assigns announcement responsibility to `EVT_RET_ANNOUNCE_001` and says every valid announcement path resolves `decided -> announced` with a chosen public/private/family/media path.

A timer may be useful as a deadlock guard, but it cannot silently become the normal canonical announcement without preserving the missing player communication choice/history.

Disposition: **terminal narrative responsibility bypass**.

### RTE-03 — administrative no-last-match auto-close

While `announced`, the engine closes automatically when:
- days in announced >=120; or
- contract has ended and days in announced >=90.

It calls `closeCareer(...,"no_last_match")`.

Canonical map permits no-last-match, but closure shape must be driven by actual health/technical/context facts and the final sporting window. Time passing alone is not the canonical reason.

Disposition: **closure cause laundering / last-match responsibility bypass**.

### RTE-04 — early-retirement direct close in headless simulator

`simulateCareer()` checks `EARLY_RETIRED_30_34` and, if retirement is not already closed, directly calls:

`closeCareer(state,"early_retirement_30_34","early_retirement")`

This can skip `decided` and `announced` entirely.

Canonical completion gate prohibits ordinary `playing -> closed` and requires semantic distinction between decision, communication and sporting closure wherever possible even for early/emergency routes.

Disposition: **direct terminal bypass**.

### RTE-05 — non-monotonic `reverseRetirement()`

`reverseRetirement()` accepts status `announced` or `decided` and sets it back to `playing` while clearing announcement/decision context.

This is used by the current reconsideration path and contradicts the canonical semantic map’s statement that the product retirement model is monotonic.

There is also a source-level tension with canonical conditional `CEVT_38_RETIREMENT_REVERSAL`, which describes a possible return after retirement. That tension requires explicit canon resolution; current reverse function cannot be accepted merely because it exists.

Disposition: **blocked pending canonical state-model decision**.

## Principal terminal-event review

### `EVT_RET_HOME_001` — technical candidate for family retirement conversation

Current choices:
- KEEP — continue;
- DECIDE — retire/decide.

Canonical `EVT_RET_FAM_001` requires a richer agency set:
- prepare one last season -> remain playing;
- retire now -> decided;
- continue without date -> remain playing;
- wait for offers -> remain playing.

The semantic map explicitly says `EVT_RET_HOME_001` is an exact-title technical candidate but **not a direct alias** until semantic review.

Disposition: `technical_candidate_rewrite_required`.

### `EVT_RET_BODY_001`

Current choices:
- HEALTH — decided for health;
- ONE_MORE — continue.

Canonical scene distinguishes:
- rehab to return -> playing;
- surgery/operate and decide later -> normally playing;
- retire -> decided health;
- rehab for health but not competition -> semantically retirement commitment/decided unless an explicit intermediate state exists.

Current two-choice version collapses materially different intents.

Disposition: `semantic_choice_compression`.

### `EVT_RET_HIGH_001`

Current choices:
- HIGH — decided retire_on_high;
- CONTINUE — continue.

Canonical scene includes several continue variants (one year / wait for offers / same-club condition) that affect future route/market meaning.

Disposition: `semantic_choice_compression`.

### `EVT_RET_LOW_001`

Current choices:
- LOW — decided retire_on_low;
- FIGHT — seek another place.

Canonical scene includes distinct alternatives:
- another club;
- drop level;
- wait for preseason;
- retire.

Those branches are not interchangeable because later market/route logic differs.

Disposition: `semantic_choice_compression`.

### `EVT_RET_ANNOUNCE_001`

Current choices:
- PUBLIC -> announced;
- PRIVATE -> announced;
- WAIT -> remains decided.

Canonical semantic map says every valid announcement choice transitions `decided -> announced` after its outcome resolves; announcement style affects tone/relationships, not whether the already-firm retirement decision exists.

Current WAIT branch keeps the player indefinitely in decided unless timer fallback moves them, which shifts canonical announcement responsibility from choice to timer.

Disposition: `announcement_contract_mismatch`.

### `EVT_RET_LAST_001` — technical last-match candidate

Current choices:
- PLAY -> directly sets `LAST_MATCH_PLAYED`, closes with `planned_last_match`;
- NO_MATCH -> closes with `no_last_match`.

Problems:
- player selecting PLAY manufactures that the appearance occurs even though label says “if body and coach allow”; no external body/coach result is resolved;
- player selecting NO_MATCH can choose no appearance without a causal health/technical/context blocker;
- closure shape has only two outcomes;
- semantic map requires fact-driven possibilities including meaningful match, short/conditional appearance, storybook decisive appearance and no appearance;
- technical `EVT_RET_LAST_001` is explicitly not approved as alias to canonical last-match responsibility until semantic repair.

Disposition: `terminal_scene_rewrite_required`.

## Epilogue observation

`generateEpilogue()` itself guards on `retirement.status === "closed"`, which is consistent with the canonical epilogue timing rule.

However that guard does not rescue upstream invalid transitions: if runtime reaches `closed` through an illegitimate bypass, epilogue will faithfully summarize an already-wrong terminal state.

Therefore Gate F depends on Gate E terminal truth, not just the generator’s status check.

## Required 04D repair responsibilities

A future 04D implementation must:

1. eliminate automatic no-market retirement decision before canonical agency is exhausted;
2. make canonical retirement-choice events responsible for `playing -> decided`;
3. make canonical announcement event responsible for `decided -> announced` under ordinary flow;
4. replace timer fallback with either a non-semantic safety mechanism that preserves player choice/history or an explicitly approved exceptional rule;
5. make final sporting closure fact-driven;
6. prevent direct early-retirement `playing -> closed` where semantic decision/announcement distinction can be preserved;
7. implement canonical terminal event choice sets and seed responsibilities;
8. resolve the retirement-reversal canonical tension before accepting any backwards state transition;
9. preserve old pending terminal decision content during migration;
10. keep epilogue inaccessible until truthful `closed` state.

## Required tests

At minimum:
- every canonical retire-now choice reaches `decided`, never `closed` directly;
- every non-retire alternative remains `playing` and stays playable;
- no-market low demand surfaces choices before retirement;
- announcement happens through canonical event and exactly once;
- no timer silently manufactures announcement history;
- planned/short/storybook/no-last closure shapes are fact-driven and deterministic;
- no appearance/goal is produced merely by selecting a label;
- `closed` is terminal under the approved state model;
- early/emergency retirement preserves decision/announcement/closure semantics wherever possible;
- save/reload at playing/decided/announced/pending-last-match boundaries is identical;
- same seed + same choices produces identical terminal reason/path/closure;
- microfeeds/UI reads do not perturb terminal outcome.

## Status

**04D_RUNTIME_AUDIT_COMPLETE / CURRENT_FSM_NOT_CANONICAL / SOURCE_REVERSAL_TENSION_OPEN**