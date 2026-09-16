# T5.1 Batch 05E — semantic review of conditional events ages 34+

Generated: 2026-09-16  
Baseline reviewed: `chore/chatgpt-codex-workflow`  
Canonical sources: `T5_1_CONDITIONAL_REVIEW_MATRIX.csv` and `T5_1_SEMANTIC_MAP_26_RETIREMENT.md` from the T5.1 handoff.

## Scope

Review the **32 canonical conditional callbacks** for phase 34+ against the **32 runtime callbacks** in `src/content/events/34_plus/conditional-events.ts`, with additional retirement-state validation against the canonical semantic map.

Runtime structure:
- 29 callbacks originate from a generic late-career factory;
- 3 retirement-terminal callbacks are individually authored;
- one generic callback (`CEVT_38_OFFER_AFTER_RETIREMENT_ANNOUNCED`) receives custom choices after construction.

The generic factory supplies the same four choices to unrelated scenes: `Aceptar el nuevo contexto / Proteger tu posición / Priorizar el cuerpo / No precipitar nada`.

## Executive result

- Canonical callbacks reviewed: **32/32**.
- Runtime callbacks reviewed: **32/32**.
- Exact canonical IDs present: **5/32**.
- Exact IDs safe for automatic `canonical_verified_full`: **0/5**.
- Safe direct same-scene migrations inferred solely from title/theme: **0**.
- Retirement/FSM issues requiring explicit repair or source reconciliation: **4 high-priority findings**.

Implementation conclusion: late-career generic callbacks must be replaced/reviewed scene by scene, and retirement callbacks must be treated as state-machine logic rather than ordinary narrative content.

## Canonical retirement-state authority

The semantic map defines the product state model as:

`playing -> decided -> announced -> closed`

and calls it **monotonic**. It also states:
- ordinary `playing -> closed` is prohibited;
- ordinary `playing -> announced` without explicit announcement is prohibited;
- `decided -> closed` while canonical announcement remains possible is prohibited;
- `closed -> *` is prohibited;
- epilogue is unavailable before `closed`;
- the last match is not guaranteed;
- a storybook last appearance is a possible closure shape, not something the system should manufacture.

Those rules are binding for 05E/04D integration.

## Exact-ID review

### `CEVT_34_MAJOR_COMEBACK`
Canonical condition: severe injury + successful rehabilitation.  
Canonical scene: return after 7–10 months and perform better than expected for several weeks.  
Runtime: generic factory gated by `MAJOR_COMEBACK_CONTEXT`, with generic four-choice scene.

Disposition: `exact_identity_generic_scene_fail`.

The context flag may eventually prove causal eligibility, but the runtime callback does not yet implement the canonical comeback scene/function.

### `CEVT_36_NO_MEDICAL_CLEARANCE`
Canonical condition: extreme body redline.  
Canonical scene: an interested club fails the medical or requests special conditions.  
Runtime: generic factory gated by `LATE_BODY_REDLINE`, with title “Esta vez no hay alta” but no interested-club medical negotiation scene.

Disposition: `exact_identity_generic_scene_fail`.

### `CEVT_38_OFFER_AFTER_RETIREMENT_ANNOUNCED`
Canonical condition: retirement announced + market emergency.  
Canonical scene: a club calls after the public announcement and asks whether the player would reconsider.  
Runtime: generic factory initially, then custom choices `LISTEN` and `DECLINE`; `LISTEN` opens `RECONSIDERATION_WINDOW`.

Disposition: `partial_customization_requires_fsm_repair`.

The custom choice contract is closer than the generic late-career shells, but body/intel still remain generic and the downstream reconsideration currently transitions from `announced` back to `playing`, conflicting with the monotonic retirement model described by the semantic map.

### `CEVT_RET_NO_LAST_MATCH`
Canonical matrix condition: retirement + injury/suspension.  
Canonical scene: career ends without a final on-field match.  
Runtime condition: `retirement.status == announced` + `retirement.daysInStatus >= 60`.

Disposition: `exact_id_condition_mismatch_despite_verified`.

The semantic map allows a no-last-match closure for health, technical or contextual reasons, but it must arise from the actual closure facts. A generic 60-day timeout is not equivalent to the canonical matrix’s injury/suspension trigger and must not fabricate the reason.

### `CEVT_RET_STORYBOOK_LAST_GOAL`
Canonical scene/function: the player **scores in the last match**; the storybook outcome may happen but must never be forced.  
Runtime: player choice `TAKE` directly sets `STORYBOOK_LAST_GOAL=true` and immediately closes with `closureType="storybook"`.

Disposition: `exact_id_outcome_function_mismatch_despite_verified`.

This turns an emergent sporting outcome into a selectable deterministic result. The semantic map explicitly requires last-match variants to preserve uncertainty and forbids manufacturing a cinematic appearance.

## Retirement/FSM high-priority findings

### R1 — `CEVT_RET_RECONSIDER` breaks monotonic state semantics
Runtime gate: `retirement.status == announced` + `RECONSIDERATION_WINDOW`.  
Runtime `RETURN` choice sets `retirement.status = playing`.

The semantic map defines a monotonic `playing -> decided -> announced -> closed` lifecycle. Therefore `announced -> playing` cannot be accepted as ordinary behavior without an explicit canonical state-model amendment.

### R2 — canonical matrix vs semantic map tension on `CEVT_38_RETIREMENT_REVERSAL`
The conditional matrix describes `CEVT_38_RETIREMENT_REVERSAL` as contemplating a return months after retirement because motivation returns and a concrete offer appears.

The semantic map simultaneously prohibits `closed -> *` and defines closure as terminal.

This is a **source-level semantic tension**, not something implementation should silently resolve. Before 05E runtime work, the canonical authority must specify whether the reversal:
- occurs after announcement but before `closed`;
- uses a distinct non-closed retired state not present today;
- or requires an explicit exception/amendment to the monotonic model.

Until then, no runtime alias/migration for the reversal is approved.

### R3 — last-match closure must be fact-driven
Runtime `CEVT_RET_NO_LAST_MATCH` can close after 60 announced days without proving why no final match exists. Runtime storybook closure can be selected directly.

Canonical semantic map requires closure shape to be driven by actual sporting/health/context facts and allows at least:
- meaningful planned last match;
- short/conditional appearance;
- storybook decisive appearance;
- no appearance because health/technical/context prevents it.

05E must not collapse these into player-selected labels.

### R4 — post-announcement offers cannot bypass terminal responsibility
A post-announcement offer is canonical, but it must not make epilogue available early, rewrite the announcement as if it never happened, or silently reopen long-horizon arcs. Any reconsideration path must preserve explicit public-history facts and resolve consistently with the state authority.

## Row-by-row 34+ canonical review

| Canonical ID | Runtime lineage candidate | Classification | Review |
|---|---|---|---|
| `CEVT_34_LATE_BALLON_WIN` | — | `no_runtime_counterpart` | No callback models a first major individual award at 34–36 creating market pressure to remain a starter. |
| `CEVT_34_MAJOR_COMEBACK` | same ID | `exact_identity_generic_scene_fail` | Exact ID/title family, but generic late-career choices do not implement successful 7–10 month comeback. |
| `CEVT_34_COACH_BECOMES_DIRECTOR` | — | `no_runtime_counterpart` | No old-coach-to-sporting-director memory callback. |
| `CEVT_34_RIVAS_RETURNS` | — | `no_runtime_counterpart` | No Rivas-trust callback in 34+ runtime. |
| `CEVT_34_CLARA_EXCLUSIVE` | `CEVT_38_MEDIA_FAREWELL` | `weak_lineage_only` | Farewell/media theme exists, but no Clara channel, embargo or exclusive-announcement negotiation. |
| `CEVT_34_NANO_DIRECTOR` | — | `no_runtime_counterpart` | No inversion where Nano holds professional power over a possible offer. |
| `CEVT_34_ADRIAN_LAST_DERBY` | `CEVT_37_NO_LAST_DERBY` | `related_not_same` | Runtime treats being left out of a derby; canon is perhaps the final on-field meeting with Adrián. |
| `CEVT_34_FAMILY_CLUB_BUYIN` | `CEVT_34_FAMILY_STOP` | `related_not_same` | Family context exists, but refusing another relocation is not investing in a sports project while still playing. |
| `CEVT_34_CLUB_RELEGATION` | `CEVT_34_MARKET_DOWNGRADE` | `weak_lineage_only` | A lower-level offer may be a consequence, but runtime does not prove current-club relegation or stay/exit decision. |
| `CEVT_34_CLUB_PROMOTION` | — | `no_runtime_counterpart` | No callback models a lower-tier project unexpectedly reaching the top category. |
| `CEVT_34_MANAGER_SACKED_AFTER_PROMISE` | `CEVT_34_RENEWAL_GHOST` | `weak_lineage_only` | Cooling renewal promise is not the coach who justified renewal being dismissed. |
| `CEVT_34_SUCCESSOR_INJURED` | `CEVT_35_YOUNG_STARTER` | `related_opposite` | Young starter pressure exists, but canon is external injury restoring the veteran’s starting role. |
| `CEVT_35_UDV_FINANCIAL_CRISIS` | `CEVT_34_HOME_CALL` / `CEVT_36_FAMILY_RETURN` | `ambiguous_home_lineage` | Home pull exists; no runtime shell proves UDV financial cuts and salary/teammate-sale trade-off. |
| `CEVT_35_UDV_CUP_RUN` | — | `no_runtime_counterpart` | No historical cup-run callback tied to UDV and increased load. |
| `CEVT_35_NT_TOURNAMENT_INJURY` | `CEVT_35_BODY_SETBACK` / `CEVT_35_LATE_FINAL` | `ambiguous_partial_lineage` | Body setback/final contexts exist separately, not last NT tournament + minor injury. |
| `CEVT_35_NT_FINAL_GOAL` | `CEVT_35_LATE_FINAL` | `design_lineage_only` | Late final context exists, but generic choices cannot represent scoring/assisting decisively. |
| `CEVT_35_NT_FINAL_BENCH` | `CEVT_35_LATE_FINAL` | `design_lineage_only` | Same runtime shell would have to represent the opposite sporting experience: winning without playing. |
| `CEVT_35_PUBLIC_FEUD_RETURNS` | `CEVT_38_MEDIA_FAREWELL` | `weak_lineage_only` | Farewell publicity exists, but no old public rivalry/reactor reopens a specific dispute. |
| `CEVT_35_SPONSOR_EXIT` | — | `no_runtime_counterpart` | No sponsor non-renewal callback. |
| `CEVT_35_SPONSOR_LATE_BOOM` | — | `no_runtime_counterpart` | No unexpected late commercial-market boom callback. |
| `CEVT_36_YOUTH_ASSIST` | `CEVT_36_MENTOR_CONFLICT` | `related_not_same` | Mentored youngster exists, but conflict for minutes is not the youngster assisting a decisive late goal. |
| `CEVT_36_YOUTH_REPLACES_YOU` | `CEVT_35_YOUNG_STARTER` / `CEVT_36_MENTOR_CONFLICT` | `ambiguous_design_lineage` | Youth succession pressure exists but not the canonical coexistence of mentorship and stable displacement. |
| `CEVT_36_RECORD_BROKEN_BY_OTHER` | `CEVT_37_RECORD_WINDOW` | `related_not_same` | Being two matches from a record is not another player surpassing the target before you can reach it. |
| `CEVT_36_NO_MEDICAL_CLEARANCE` | same ID | `exact_identity_generic_scene_fail` | Extreme body flag exists; actual interested-club medical failure/special-condition scene is absent. |
| `CEVT_36_ONE_LAST_CHAMPIONS_RUN` | — | `no_runtime_counterpart` | No continental semifinal/final run postponing future decisions. |
| `CEVT_37_PLAYER_COACH_EMERGENCY` | — | `no_runtime_counterpart` | No small-club staff crisis leading to temporary informal tactical duties. |
| `CEVT_37_EMPTY_STADIUM_FAREWELL` | — | `no_runtime_counterpart` | No external sanction/construction cause that removes expected farewell atmosphere. |
| `CEVT_37_LAST_DERBY` | `CEVT_37_NO_LAST_DERBY` | `related_opposite` | Canon provides the last derby after announcement; runtime is exclusion from that derby. |
| `CEVT_38_OFFER_AFTER_RETIREMENT_ANNOUNCED` | same ID | `partial_customization_requires_fsm_repair` | Offer/listen/decline path exists, but generic scene and announced->playing reconsideration conflict require repair. |
| `CEVT_38_RETIREMENT_REVERSAL` | `CEVT_RET_RECONSIDER` | `state_model_conflict` | Runtime offers announced->playing; canonical matrix and monotonic semantic map need reconciliation before implementation. |
| `CEVT_RET_NO_LAST_MATCH` | same ID | `exact_id_condition_mismatch_despite_verified` | 60 announced days is not canonical injury/suspension and does not prove the closure cause. |
| `CEVT_RET_STORYBOOK_LAST_GOAL` | same ID | `exact_id_outcome_function_mismatch_despite_verified` | Player can force the storybook goal rather than the sporting outcome emerging. |

## Migration policy for 34+

### History
Never rewrite a generic technical late-career callback into a canonical scene the player did not see.

### Pending generic callback
Do not swap generic old A/B/C/D choices for scene-specific canonical choices on reload. A compatibility/content-identity strategy is mandatory.

### Pending retirement callback
Treat retirement pending content as highest-risk migration data because it can alter state transitions and terminal facts. Preserve:
- the state when the choice was shown;
- the exact choice contract;
- announcement history;
- retirement reason;
- closure shape;
- last-match facts.

A migration must never make epilogue reachable sooner or convert an unplayed final match into a played/storybook one.

## Future 05E implementation contract

1. Resolve the `CEVT_38_RETIREMENT_REVERSAL` source-level state-model tension before coding.
2. Integrate only after principal 04D retirement FSM is stable.
3. Replace generic late-career factories with scene-specific canonical callbacks or explicitly certify every field.
4. Keep world/external facts causal: relegation, promotion, cup run, medical failure, staff crisis and final-match availability must be simulated/proven facts, not cosmetic tags.
5. Preserve `playing -> decided -> announced -> closed` authority unless the canonical source is explicitly amended.
6. Storybook/no-last-match are closure outcomes shaped by sporting/context facts, not free labels.
7. Keep epilogue inaccessible until `closed`.
8. Add deterministic replay tests for retirement reason, announcement path, closure shape and last-match facts.
9. Add migration tests for pending `announced` callbacks and every exact-ID semantic rewrite.

## Status

**05E_SEMANTIC_REVIEW_COMPLETE / FSM_SOURCE_TENSION_OPEN / RUNTIME_IMPLEMENTATION_BLOCKED**