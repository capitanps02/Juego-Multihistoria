# T5.1 Batch 05A — exact-ID conditional semantic foundation

Generated: 2026-09-16  
Baseline: `chore/chatgpt-codex-workflow`

## Purpose

Establish what an exact canonical conditional ID proves — and what it does **not** prove — before any runtime implementation batch treats `canonStatus` or ID equality as semantic certification.

Canonical conditional total: **134**.  
Exact canonical IDs present in the P1/runtime baseline: **47**.  
Identity drift rows: **87**.

An exact ID is accepted as **identity evidence only**. It is not equivalent to `canonical_verified_full`.

## Exact-ID inventory by phase

| Phase | Exact IDs | Foundation disposition |
|---|---:|---|
| 18–20 | 14 | `candidate_for_field_review` — individually authored scenes, but technical choice adaptations still require field-by-field certification. |
| 20–23 | 3 | `semantic_shell_fail` — all rows use a shared generic callback body and generic A/B/C decisions. |
| 23–26 | 20 | `semantic_shell_fail` — exact IDs/titles/gates sit on one shared generic callback scene and generic A/B/C decisions. |
| 26–30 | 5 | `semantic_shell_fail` — the five exact age-29 rows are marked `verified`, but still use the shared generic factory body and choices. |
| 30–34 | 0 | Covered separately by Batch 05D review; no exact IDs in P1. |
| 34+ | 5 | `semantic_review_fail_or_partial` — generic shells and retirement-specific mismatches prevent automatic full certification. |
| **Total** | **47** | **0 automatically promoted to `canonical_verified_full`.** |

## 18–20: strongest candidates, still not auto-certified

Exact IDs:
- `CEVT_18_EARLY_01`
- `CEVT_18_NODEBUT_01`
- `CEVT_18_BRUNO_01`
- `CEVT_18_VELA_01`
- `CEVT_18_CCH_01`
- `CEVT_18_RELEG_01`
- `CEVT_18_PLAYOFF_01`
- `CEVT_19_BIG_01`
- `CEVT_19_AGENT_01`
- `CEVT_19_INJ_01`
- `CEVT_19_ABROAD_01`
- `CEVT_19_SOCIAL_01`
- `CEVT_19_NANO_01`
- `CEVT_19_RETURN_01`

The source explicitly states that triggers/titles/function come from canon and that choices are technical adaptations when the canonical table does not enumerate complete buttons. Unlike later phases, these events are authored individually with scene-specific body/intel/choices.

Therefore these 14 are the only exact-ID group currently suitable for direct **field-by-field semantic certification** without first replacing a generic factory scene. They remain `semantic_review_required`, not certified.

## 20–23: exact ID does not rescue generic semantics

Exact IDs:
- `CEVT_21_ABR_01`
- `CEVT_21_MEDIA_01`
- `CEVT_22_FREE_01`

All 18 runtime rows in the phase share the body “Una consecuencia del historial previo...” and the choices `Actuar ahora / Esperar / Moverlo por otro canal`.

Disposition for the 3 exact IDs: identity exact; scene/decision semantics incomplete. Repair belongs in Batch 05B after its principal dependencies are stable.

## 23–26: 20 exact identities, 20 generic scene shells

Exact IDs:
- `CEVT_23_RIVAS_02`
- `CEVT_23_MENA_02`
- `CEVT_23_VELA_02`
- `CEVT_23_BRUNO_03`
- `CEVT_23_ADR_03`
- `CEVT_23_NANO_02`
- `CEVT_23_CLARA_03`
- `CEVT_23_AGENT_03`
- `CEVT_23_MED_02`
- `CEVT_23_UDV_02`
- `CEVT_24_CHAT_01`
- `CEVT_24_TOURN_01`
- `CEVT_24_TOURN_02`
- `CEVT_24_OWNER_02`
- `CEVT_24_SPONSOR_02`
- `CEVT_24_FAM_02`
- `CEVT_25_STAR_01`
- `CEVT_25_AGENT_04`
- `CEVT_25_BODY_02`
- `CEVT_25_SHOCK_02`

The rows have event-specific IDs/titles/gates, but `make()` supplies one generic causal-callback body, one generic visible/uncertain pair, and the same three decisions to all 20.

Disposition: exact identity is preserved, but canonical scene/function/choices are not proven. These rows require semantic rewrite/certification, not ID migration.

## 26–30: runtime `verified` is not an audit certificate

Exact IDs:
- `CEVT_29_NAT_02`
- `CEVT_29_HOME_03`
- `CEVT_29_BODY_04`
- `CEVT_29_RECORD_02`
- `CEVT_29_PROJECT_02`

Those five rows set `verified:true`, which causes runtime `canonStatus:"verified"`. Nevertheless, they are emitted by the same factory as the surrounding technical adaptations, with generic body/intel and generic `Intervenir / Esperar / Proteger tu posición` choices.

Decision: **do not map runtime `canonStatus:"verified"` to `canonical_verified_full`.** The auditor must certify semantic fields independently.

## 34+: exact-ID retirement examples prove why semantic gates are necessary

Exact IDs:
- `CEVT_34_MAJOR_COMEBACK`
- `CEVT_36_NO_MEDICAL_CLEARANCE`
- `CEVT_38_OFFER_AFTER_RETIREMENT_ANNOUNCED`
- `CEVT_RET_NO_LAST_MATCH`
- `CEVT_RET_STORYBOOK_LAST_GOAL`

Findings:

1. `CEVT_34_MAJOR_COMEBACK` and `CEVT_36_NO_MEDICAL_CLEARANCE` are created by the generic late-career factory, so their body and decisions are not canonical proof.
2. `CEVT_38_OFFER_AFTER_RETIREMENT_ANNOUNCED` starts from the same generic factory and later receives custom choices. This improves behavior but still requires scene/intel/function certification.
3. `CEVT_RET_NO_LAST_MATCH` is individually authored and marked `verified`, but the canonical matrix requires retirement plus injury/suspension causing no final match; runtime eligibility is instead `announced` plus `daysInStatus >= 60`. Exact ID and bespoke implementation therefore still do not prove the canonical condition.
4. `CEVT_RET_STORYBOOK_LAST_GOAL` is individually authored and marked `verified`, but the canonical matrix says the player **scores in the last match** and explicitly that the storybook ending may occur but must never be forced. Runtime choice `TAKE` directly sets `STORYBOOK_LAST_GOAL` and closes as `storybook`, which turns the desired emergent outcome into a player-selected deterministic result.

These cases are evidence that the final auditor must inspect condition, scene, choices, outcomes and function independently.

## Certification rule produced by 05A

For every exact-ID conditional event:

- `canonical_id_exact = true` may satisfy the **identity** field only;
- title equality is supporting evidence, not semantic certification;
- runtime `canonStatus` is advisory legacy metadata, not the audit result;
- `canonical_verified_full` requires explicit reviewed PASS for:
  - condition/eligibility;
  - scene/body and visible/uncertain information;
  - choices/intents;
  - primary/secondary outcomes;
  - canonical function;
  - seed reads/writes and NPC references where required;
  - save/resume behavior;
  - terminal/retirement invariants when applicable.

No exact-ID event should be auto-promoted by code simply because its ID exists or its runtime status says `verified`.

## Next audit step

The safe next semantic work is a field-level review of the 14 individually-authored 18–20 callbacks. Generic exact-ID rows should be repaired in their phase batches rather than “certified” as-is.

## Status

**05A_AUDIT_FOUNDATION_COMPLETE / RUNTIME_IMPLEMENTATION_DRAFT**

This closes the exact-ID certification rule and inventory. It does not authorize Codex execution, runtime edits or merge.