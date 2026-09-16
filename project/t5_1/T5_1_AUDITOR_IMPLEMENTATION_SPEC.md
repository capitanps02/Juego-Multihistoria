# T5.1 — Canonical auditor implementation specification

Generated: 2026-09-16

## Purpose

Turn T5.1 from a narrative checklist into an enforceable engineering gate.

The auditor must distinguish four different questions:

1. **Identity** — is the active runtime event one of the 388 canonical IDs?
2. **Semantic fidelity** — does the event implement the canonical trigger, information, decision, resolution and memory contract?
3. **Migration truthfulness** — can an old runtime ID be migrated without claiming the player saw a different scene?
4. **Causal continuity** — do seeds/NPC memory and terminal responsibilities still work years later and after save/resume?

A green build is not enough. A title match is not enough. The old `verified` flag is not enough.

## Canonical inputs

Use these generated artifacts as machine-readable inputs:

- `T5_1_CANONICAL_IDENTITY_MANIFEST_388.json`
- `T5_1_CANONICAL_EVENT_VERIFICATION.schema.json`
- `T5_1_LEGACY_ID_CROSSWALK_TEMPLATE.json`
- `T5_1_CONDITIONAL_RECONCILIATION_MANIFEST.json`
- `T5_1_GLOBAL_RECONCILIATION_MANIFEST.json`
- `T5_1_COMPLETION_GATE.md`

The Documento Maestro remains the human source of truth. Generated manifests are derived evidence and must be regenerated/audited when the source changes.

## Proposed runtime audit output

The auditor should emit one record per canonical event:

```json
{
  "canonicalId": "EVT_...",
  "runtimeId": "EVT_...",
  "kind": "principal",
  "phase": "26_30",
  "identity": "exact_id",
  "semantic": {
    "trigger": "pass",
    "visibleInfo": "pass",
    "uncertainInfo": "pass",
    "choices": "pass",
    "resolution": "pass",
    "seeds": "pass",
    "npcRefs": "not_applicable",
    "transition": "pass"
  },
  "migration": {
    "required": false,
    "historyTruthPreserved": true,
    "pendingEventHandled": true,
    "seedOriginsHandled": true
  },
  "verificationStatus": "canonical_verified_full",
  "evidence": ["..."]
}
```

## Identity gate

Final target:

- 254 active principal IDs exactly equal the canonical principal set.
- 134 active conditional IDs exactly equal the canonical conditional set.
- 388 active IDs total.
- zero duplicates.
- zero active runtime-only IDs.
- zero canonical IDs missing.

Legacy IDs are allowed only in migration tables, compatibility readers, historical save fixtures or explicit archival evidence. They must not count as active canonical content.

Before final migration is complete, an old runtime ID must be in the explicit crosswalk with a reviewed decision.

## Crosswalk states

Every one of the 174 baseline runtime-only IDs starts as `unresolved`.

Allowed decisions:

### `same_scene_rewrite_and_id_migration`
Use only after proving that the legacy event and canonical event are the same scene contract, not merely the same theme/title.

Requirements:
- trigger/context compatible;
- visible/uncertain information compatible;
- choices preserve the same player decision;
- outcome intent compatible;
- seed/NPC responsibility compatible;
- age/phase movement explicitly reviewed.

### `retire_technical_keep_history_only`
The technical event is removed from active canonical content, but old history remains truthful as a legacy fact.

Do **not** manufacture `SEEN_<canonicalId>`.

### `retain_noncanonical_outside_canonical_set`
Only for explicitly approved auxiliary/noncanonical content that is excluded from the 254+134 canonical event inventory and cannot interfere with canonical counts/scheduling. Requires explicit design approval.

### `no_mapping`
There is no canonical counterpart. The old ID remains understandable only to legacy migration/history compatibility code.

### `unresolved`
Blocks T5.1 completion.

## Pending-event migration

`pendingEventId` is more sensitive than historical `eventHistory`.

For a pending legacy event:

1. If decision = `same_scene_rewrite_and_id_migration`, map it to the canonical ID only when semantic identity is proven.
2. Otherwise, do **not** replace it with a different canonical scene.
3. Preferred compatibility strategies, in order:
   - resolve the pending legacy scene through a legacy compatibility definition, then continue on canonical content;
   - preserve a compatibility snapshot sufficient to resolve the already-presented decision;
   - if neither is technically possible, fail resume explicitly rather than silently substituting another decision.

Never consume narrative RNG merely to reconstruct a pending decision.

## Historical event migration

Historical event facts are append-only truth.

- Preserve legacy history IDs or store an explicit `legacyId` alongside canonical/migration metadata.
- Do not rewrite a technical event to a canonical ID unless the exact scene identity has been proven.
- Do not create canonical `SEEN_*` flags from approximate thematic similarity.
- A seed can be preserved when its semantic state is still valid, even if its old `originEvent` metadata remains legacy-labelled. Migrate origin metadata only with reviewed evidence.

## `canonical_verified_full`

An event can receive this status only when:

- identity is `exact_id` or an approved same-scene migration;
- trigger/gates reviewed;
- visible information reviewed;
- uncertainty reviewed;
- choices reviewed;
- resolution/outcome intent reviewed;
- seeds read/write/origin reviewed;
- NPC refs reviewed or explicitly not applicable;
- transition/hard-deadline responsibility reviewed or explicitly not applicable;
- migration obligations passed;
- evidence points to the canonical source/review artifact.

Any `not_reviewed` or `fail` field blocks full verification.

## Conditional-specific rules

### Ages 18–29
Canonical tables usually expose ID, title, condition, scene and function. Compare all available fields.

### Ages 30+
Some canonical conditional tables intentionally do not provide a standalone title. Do not invent one and do not require a title equality check. Identity/crosswalk must be reviewed from:
- condition/trigger;
- scene;
- narrative function/pattern;
- seed/NPC memory;
- downstream purpose.

This is especially important for `30_34`, where the P1 baseline had 0/26 exact conditional IDs.

## Principal-specific rules

For principal events, compare:
- ID;
- phase and age/time window;
- family;
- trigger/gates;
- body/visible information;
- imperfect information;
- choice labels/count and intent;
- resolution semantics;
- seeds;
- NPC refs;
- transition/hard-deadline responsibility.

A shared helper is allowed for mechanical effects. Shared generic visible dilemmas are not sufficient when the canon defines scene-specific choices.

## Causal gate

Identity and local field fidelity are necessary but not sufficient.

Required targeted chains include:

- record: age 26 → 27 → 33;
- successor: age 27 → 28 → 31/32;
- agent/parallel negotiation: age 27 → 32 → 35;
- wealth/business: age 27 → 31;
- documentary: age 26 → 28;
- big-game bench: age 26 → final → veteran rotation;
- dorsal succession: age 30 → 34;
- travel/load: age 30 → 34;
- late hero moment → retirement-high context;
- age-33 priority → age-34 bridge.

Each chain should be tested:
1. before save;
2. after save/resume;
3. with microfeeds enabled;
4. with microfeeds disabled;
5. same seed produces same strong narrative outcome.

## Retirement gate

Allowed terminal progression:

`playing -> decided -> announced -> closed`

Forbidden:
- discussion/preparation directly to `closed`;
- retirement marketing directly to `decided`;
- peer retirement directly to `decided`;
- no-market auto-close while a canonical player choice remains eligible;
- epilogue before `closed`;
- announcement twice;
- last-match closure before announcement.

No last match is a valid closure shape.

## Suggested command surface

Keep existing commands and add explicit canonical gates, for example:

```bash
npm run audit:t51:identity
npm run audit:t51:semantic
npm run test:t51:migration
npm run test:t51:causal
npm run test:t51:retirement
npm run test:t51:full
```

`test:t51:full` should aggregate but not hide which lane failed.

## Suggested machine exit codes

- `0`: all requested checks pass.
- `2`: canonical identity mismatch / duplicate / extra.
- `3`: unresolved crosswalk mapping.
- `4`: semantic verification incomplete/failing.
- `5`: migration truthfulness failure.
- `6`: causal continuity failure.
- `7`: retirement/epilogue invariant failure.
- `8`: source manifest/version mismatch.

## Definition of done

T5.1 is complete only when:

- identity set is exactly 388 canonical events;
- all 174 baseline drift IDs have explicit reviewed disposition;
- every active event is `canonical_verified_full` or has an explicit approved exception;
- no generic technical template substitutes a canonical decision;
- save migration is truthful;
- seed chronology is validated longitudinally;
- retirement FSM and epilogue are validated;
- determinism and RNG separation remain intact;
- build/session/save/canonical gates pass on the implementation branch.

Do not report T5.1 complete merely because `unresolved IDs == 0`.
