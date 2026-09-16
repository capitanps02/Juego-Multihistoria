# T5.1 — Batch 02E semantic review of age-29 runtime-only principal IDs

Generated: 2026-09-16

## Scope

Review the eight runtime-only age-29 principal IDs assigned to Batch 02E against the two remaining missing canonical age-29 scenes:

Canonical targets:
- `EVT_29_TACT_001` — Reinventarte de verdad
- `EVT_29_NAT_002` — ¿Seguir con la selección a cualquier precio?

Runtime-only IDs:
- `EVT_29_CCH_001` — El entrenador y tu poder
- `EVT_29_FAN_001` — El estadio ya no está de acuerdo contigo
- `EVT_29_MED_001` — Operarte ahora o convivir con ello
- `EVT_29_NAT_001` — El brazalete de la selección
- `EVT_29_EUR_001` — Sacrificar números para ganar
- `EVT_29_REC_001` — El récord y el mal día del equipo
- `EVT_29_HOME_001` — Volver antes de que sea una despedida
- `EVT_29_FORM_001` — Tu primer bajón que no dura dos semanas

All eight runtime rows come from the generic 26–30 factory, so matching theme or seed name is not same-scene proof.

## Executive result

Reviewed: **8/8**.

Approved same-scene migrations: **0/8**.

Final planning disposition for all eight:

`retire_technical_keep_history_only`

None is canonical `EVT_29_TACT_001` or `EVT_29_NAT_002`. Their useful state responsibilities belong to earlier canonical scenes and must remain as causal memory, not as active displaced events.

## Per-ID disposition

### `EVT_29_CCH_001` — El entrenador y tu poder

Runtime creates `SEED_MANAGER_POWER` from a generic captaincy/family-style row.

Canonical owner is `EVT_27_LOCK_001` — El entrenador ha perdido a medio vestuario. Its source explicitly creates `SEED_MANAGER_POWER` from the private board/locker-room question.

`EVT_28_CLUB_001` later consumes that manager-power context when the president asks for public backing.

Disposition: `retire_technical_keep_history_only`.

### `EVT_29_FAN_001` — El estadio ya no está de acuerdo contigo

Runtime creates `SEED_FAN_FRACTURE` generically.

Canonical owner is `EVT_27_PRS_001` — Te silban en casa. The canonical scene owns the fan-fracture memory and its uncertainty about whether the reaction is a minority, genuine rupture or club protest.

Disposition: `retire_technical_keep_history_only`.

### `EVT_29_MED_001` — Operarte ahora o convivir con ello

Runtime creates `SEED_SURGERY_TIMING` from a generic medical row.

Canonical owner is exact-ID `EVT_27_MED_001` — La cirugía puede esperar. That canonical row creates `SEED_SURGERY_TIMING` with four specific surgery/conservative/specialist choices and later feeds age-30/31 medical scenes.

Disposition: `retire_technical_keep_history_only`.

### `EVT_29_NAT_001` — El brazalete de la selección

Runtime creates `SEED_NATIONAL_CAPTAINCY` generically.

Canonical owner is exact-ID `EVT_27_NAT_001` — El brazalete de tu país. That row creates `SEED_NATIONAL_CAPTAINCY`; age-28 tournament role later reads it.

This legacy row is also not canonical `EVT_29_NAT_002`, which is a separate availability/load policy decision and creates `SEED_NATIONAL_AVAILABILITY_30`.

Disposition: `retire_technical_keep_history_only`.

### `EVT_29_EUR_001` — Sacrificar números para ganar

Runtime creates `SEED_ELITE_SACRIFICE` generically.

Canonical owner is `EVT_27_EUR_001` — La semifinal que exige desaparecer, which explicitly creates `SEED_ELITE_SACRIFICE` from a high-level tactical-sacrifice dilemma.

This is related to adaptation but not canonical `EVT_29_TACT_001`, whose premise is physical/tactical reinvention into a mature role and creates `SEED_MATURE_REINVENTION`.

Disposition: `retire_technical_keep_history_only`.

### `EVT_29_REC_001` — El récord y el mal día del equipo

Runtime creates `SEED_RECORD_PUBLIC_TONE` generically.

Canonical owner is `EVT_27_MATCH_001` — El récord no se celebra, which creates that seed from the specific question of how to handle a record celebration after a poor collective result.

Disposition: `retire_technical_keep_history_only`.

### `EVT_29_HOME_001` — Volver antes de que sea una despedida

Runtime creates `SEED_EARLY_HOME_RETURN` and can move the player home through a generic age-29 callback.

Canonical owner is exact-ID `EVT_28_HOME_001` — Volver con 28 no es retirarte. It explicitly creates `SEED_EARLY_HOME_RETURN` and frames the move as a competitive project rather than an epilogue. `EVT_31_HOME_001` later consumes that memory.

Disposition: `retire_technical_keep_history_only`.

### `EVT_29_FORM_001` — Tu primer bajón que no dura dos semanas

Runtime creates `SEED_FIRST_PEAK_DIP` generically.

Canonical owner is `EVT_28_FORM_001` — Tres meses normales. That row creates `SEED_FIRST_PEAK_DIP` while explicitly warning against false causality between the response and subsequent performance.

Disposition: `retire_technical_keep_history_only`.

## Canonical age-29 scenes are distinct

### `EVT_29_TACT_001`

Canonical trigger: age 29 + `ROLE_ADAPTABILITY` gate.

It is a mature tactical reinvention decision with four explicit role choices and creates `SEED_MATURE_REINVENTION` while consuming `SEED_POSITIONAL_REINVENTION`.

None of the eight legacy rows implements that scene.

### `EVT_29_NAT_002`

Canonical trigger: medium/high national standing + age/load pressure.

It asks how available the player wants to remain for national-team windows and creates `SEED_NATIONAL_AVAILABILITY_30` while consuming international-load history.

`EVT_29_NAT_001` is not this scene: it is a displaced generic captaincy writer.

## Transition obligation

`EVT_29_FIN_001` remains the canonical hard-deadline owner of `SEED_AGE30_PRIORITY` / `world.age30Priority`.

Retiring these eight technical rows must not:
- duplicate that deadline;
- overwrite its priority;
- let a generic event displace it from the end-of-age window;
- create a new substitute seed for the age-30 bridge.

## Migration implications

For all eight legacy IDs:
- preserve completed history under the old ID;
- do not manufacture canonical `SEEN_*`;
- do not substitute an old pending choice set with a canonical scene;
- move future seed catalog origin to the reviewed canonical creator only after that creator is correctly implemented/certified;
- do not rewrite historical `seed.originEvent` automatically;
- compatibility-only legacy definitions never schedule in the active catalog.

## Status

**02E_LEGACY_REVIEW_COMPLETE — 8/8 RETIRE_HISTORY_ONLY — 0 SAME-SCENE MIGRATIONS**
