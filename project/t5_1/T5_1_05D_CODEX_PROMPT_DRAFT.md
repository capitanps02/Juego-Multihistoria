# DRAFT Codex task — T5.1 Batch 05D conditionals ages 30–34

**DO NOT EXECUTE while Batch 05D is DRAFT in `project/CODEX_QUEUE.md`.**

## Preconditions

Do not launch until:
- 05C runtime reconciliation is reviewed/integrated;
- principal Batch 03B (ages 31–33, with stable age-30/34 boundaries) is reviewed/integrated;
- branch is regrounded on that state.

## Objective

Replace the 26 current technical/generic 30–34 callbacks with the **26 canonical 30–34 callbacks**, preserving old history and pending legacy decisions truthfully.

Primary review authority:
- `project/t5_1/T5_1_05D_SEMANTIC_REVIEW.md`
- `project/t5_1/T5_1_05D_SEMANTIC_REVIEW.json`
- `project/t5_1/T5_1_AUDITOR_IMPLEMENTATION_SPEC.md`
- canonical conditional source preserved under `project/t5_1/source_archives/`.

## Critical audit conclusion

P1/runtime had **0/26 exact canonical IDs** in this phase.

The semantic review examined all 26 technical shells and approved:
- **0/26** as `same_scene_rewrite_and_id_migration`;
- **0/26** for historical ID rewriting;
- **0/26** for direct pending-event substitution.

Some old shells show design lineage, but lineage is not migration proof.

## Migration default for all 26 old technical IDs

Unless a later explicit review overrides an individual row with stronger evidence, use the reviewed disposition:

- `decision = retire_technical_keep_history_only`
- `same_scene_migration_allowed = false`
- `history_event_id_rewrite_allowed = false`
- `pending_event_id_direct_rewrite_allowed = false`
- `canonical_replacement_required = true`

Do not create fuzzy/title aliases.

## Runtime problem

`src/content/events/30_34/conditional-events.ts` creates every current callback from one generic factory:
- generic body;
- generic visible/uncertain info;
- choices `Intervenir ahora / Aceptar el cambio de contexto / Ganar tiempo`.

The old rows change ID/title/gates but do not implement canonical decisions.

## Canonical implementation rule

Use the canonical 30–34 rows literally for:
- canonical ID;
- condition/trigger;
- scene;
- narrative function/pattern;
- relevant seed/NPC memory;
- downstream purpose.

Canonical source may not provide a standalone title for some 30+ rows. **Do not invent a title and then use title matching as identity proof.** Runtime UI text may need authored presentation copy, but audit identity must come from the actual semantic contract.

## Important canonical concepts with no trustworthy old equivalent

Do not assume generic shells already cover:
- `CEVT_30_LATE_BALLON`
- `CEVT_30_RELEGATION_ICON`
- `CEVT_30_NT_FAREWELL`
- `CEVT_30_NT_RECALL`
- `CEVT_30_MEDICAL_FAIL`
- `CEVT_30_BRUNO_AGENT`
- `CEVT_30_MENA_RIVAL`
- `CEVT_30_SPONSOR_EXIT`
- `CEVT_30_TEAMMATE_SCANDAL`
- `CEVT_30_EARLY_RETIRE_BODY`
- `CEVT_30_EARLY_RETIRE_MOTIVATION`
- `CEVT_30_CHILDHOOD_COACH_LOSS`
- `CEVT_30_TACTICAL_SECOND_PEAK`
- `CEVT_30_HOME_EUROPE`

Other canonical concepts may have a recognizable technical ancestor but still require complete rewrite.

## Examples of lineage that is NOT alias approval

- old `CEVT_31_RIVAS_01` gestures toward canonical `CEVT_30_RIVAS_EXEC`;
- old `CEVT_31_SURGERY_01` is aftermath related to canonical major injury, not the same scene;
- old `CEVT_32_BOSMAN_01` is contract-cycle lineage, not canonical free-agent summer;
- old `CEVT_33_RECORD_01` is generic record chase and does not prove national-team record identity;
- old `CEVT_33_RET_01` is media pressure about retirement, not canonical motivational early-retirement decision.

Keep these as authoring evidence only.

## External-state / causal requirements

Canonical callbacks must rely on real facts rather than thematic seeds when they require:
- injury/surgery/recovery state;
- actual successor sale;
- coach discard/rebirth offer;
- national record proximity;
- home-club sporting achievement;
- sponsor/business shock;
- free-agent market state;
- registration exclusion;
- public reconciliation;
- voluntary retirement motivations.

A seed may condition the scene; it must not manufacture the external event.

## Pending legacy compatibility

This batch has the highest identity drift inside 30–34.

For any old pending technical callback:
1. preserve the already-shown generic scene/choices through legacy compatibility if possible;
2. after resolution, continue with canonical content;
3. if legacy resolution cannot be preserved, fail resume explicitly rather than swapping in a canonical scene;
4. never rewrite historical old IDs into canonical IDs the player never saw.

Do not consume RNG to reconstruct pending content.

## Tests

Required targeted coverage:
- active canonical set for phase = 26 exact canonical IDs, no active technical extras;
- all 26 old legacy dispositions represented in migration/crosswalk evidence;
- pending old generic callback survives save/reload with exact old decision contract;
- new canonical callback survives save/reload with exact new decision contract;
- positive/negative eligibility for all canonical conditions;
- real external facts required where specified;
- seed/NPC memory changes opportunity/information without dictating outcome;
- no history ID laundering;
- deterministic same-seed replay;
- UI/read/microfeed isolation from strong narrative RNG.

Mandatory causal examples:
- dorsal succession age30 -> age34 final dorsal;
- travel/load age30 -> age34 team-wins-without-you;
- successor pressure into 31/32 callbacks;
- record/body tension into age33;
- home-route callbacks use actual home state;
- early-retirement callbacks do not bypass explicit player retirement agency.

## Allowed write scope

Primary:
- `src/content/events/30_34/conditional-events.ts` or a clean phase-local split;
- narrowly necessary phase helpers;
- targeted tests/fixtures;
- legacy compatibility definitions required by approved migration architecture.

Do not edit 34+ retirement state machine in this batch.

## Required commands

```text
npm run build
npm run validate
npm run test:session
npm run test:saves
npm run audit:t51
npm run test:t51
```

Plus 05D migration/causal/RNG targeted tests.

## Acceptance

- 26/26 canonical 30–34 callbacks active exactly once;
- zero active old technical 30–34 IDs in canonical catalog;
- all old technical history remains truthful;
- pending legacy scenes never silently become new canonical decisions;
- canonical functions/gates are scene-specific;
- causal/save/RNG tests pass;
- no retirement-FSM edits outside scope;
- no merge without Pedro’s explicit instruction.

## State

**DRAFT PROMPT — NOT READY TO EXECUTE**