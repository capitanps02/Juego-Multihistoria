# T5.1 — Batch 02D semantic review of age-28 runtime-only principal IDs

Generated: 2026-09-16  
Branch reviewed: `chore/chatgpt-codex-workflow`

## Scope

Review the seven runtime-only age-28 principal IDs assigned to Batch 02D against the five remaining missing canonical age-28 scenes after PR #5 owns canonical `EVT_28_RICH_001`.

Runtime-only IDs:
- `EVT_28_PRS_001` — La presión pública para salir
- `EVT_28_MONEY_001` — Tu dinero ya es una empresa
- `EVT_28_IMG_001` — Tu marca ya no quiere llevar el escudo
- `EVT_28_TACT_001` — Tu nueva posición
- `EVT_28_FINAL_001` — Una final no garantiza protagonismo
- `EVT_28_BODY_001` — La recuperación tarda un día más
- `EVT_28_JAN_001` — El invierno del segundo gran proyecto

Canonical 02D targets:
- `EVT_28_MEDIA_001` — El documental se estrena cuando ya eres otro
- `EVT_28_FORM_001` — Tres meses normales
- `EVT_28_STAR_001` — El chico ya no es promesa
- `EVT_28_MED_001` — No puedes jugar sesenta partidos
- `EVT_28_CLUB_001` — El presidente quiere tu apoyo

All seven runtime rows are generated through the generic 26–30 row factory. The review therefore separates useful seed lineage from scene identity.

## Executive result

Reviewed runtime-only IDs: **7/7**.  
Approved same-scene migrations: **0/7**.

Disposition for all seven:

`retire_technical_keep_history_only`

Four are clearly displaced seed writers for canonical age-27 scenes; one is a displaced writer for an age-26 scene; two have only broad thematic overlap with age-28 canon.

---

## `EVT_28_PRS_001` — La presión pública para salir

Runtime:
- age 28 generic press event;
- creates `SEED_PUBLIC_EXIT_PRESSURE`.

Canonical responsibility:
- exact canonical `EVT_27_AGT_001` — “Si no presionas, no te venden” — explicitly creates `SEED_PUBLIC_EXIT_PRESSURE` from the agent/public-pressure transfer dilemma.

Decision:
- age-28 runtime row is a displaced technical writer, not a missing age-28 canonical scene;
- future seed catalog origin belongs to canonical `EVT_27_AGT_001` after that event is semantically certified/repaired as needed.

Disposition: `retire_technical_keep_history_only`.

---

## `EVT_28_MONEY_001` — Tu dinero ya es una empresa

Runtime:
- age 28 generic money event;
- creates `SEED_WEALTH_STRUCTURE`.

Canonical responsibility:
- exact canonical `EVT_27_MONEY_001` has the same core wealth-structure premise and source traceability explicitly creates `SEED_WEALTH_STRUCTURE`.

The runtime-only age-28 row is not needed as a second canonical scene merely because it carries the same memory one year later. Its generic factory implementation is also not proof of equivalence to the canonical age-27 row.

Disposition: `retire_technical_keep_history_only`.

---

## `EVT_28_IMG_001` — Tu marca ya no quiere llevar el escudo

Runtime:
- age 28 generic image event;
- creates `SEED_PERSONAL_BRAND_INDEPENDENCE`.

Canonical responsibility:
- canonical `EVT_27_IMG_001` — “Tu nombre sin tu club” — explicitly creates `SEED_PERSONAL_BRAND_INDEPENDENCE` with a specific conflict between independent global branding and club commercial restrictions.

Decision:
- displaced technical writer, not same scene;
- 02C owns canonical `EVT_27_IMG_001` and should establish the future seed origin before 02D removes this age-28 writer.

Disposition: `retire_technical_keep_history_only`.

---

## `EVT_28_TACT_001` — Tu nueva posición

Runtime:
- age 28 generic tactical event;
- creates `SEED_POSITIONAL_REINVENTION`.

Canonical responsibility:
- exact canonical `EVT_27_TACT_001` — “Cambiar para seguir arriba” — source traceability explicitly creates `SEED_POSITIONAL_REINVENTION` from the proposed positional reconversion;
- canonical `EVT_28_STAR_001` later **reads/uses** that memory while creating `SEED_SUCCESSION_DECISION`.

Decision:
- age-28 runtime row is a displaced technical writer;
- do not treat it as canonical `EVT_28_STAR_001`, whose trigger is `SUCCESSOR_PEAK` and whose dilemma is coexistence/competition with the now-established successor.

Disposition: `retire_technical_keep_history_only`.

---

## `EVT_28_FINAL_001` — Una final no garantiza protagonismo

Runtime:
- age 28 generic sport event;
- final-context gate;
- creates `SEED_FINAL_BENCH`.

Canonical chronology:
- PR #7 restores `SEED_BIG_GAME_BENCH` to `EVT_26_EUR_001` and `SEED_FINAL_BENCH` to canonical `EVT_26_FINAL_001`;
- the age-28 canonical target set contains no equivalent final-bench scene.

Decision:
- obsolete late writer in the age-26 final chain;
- PR #7 moves the seed origin but does not retire this ID because 02D owns final disposition.

Disposition: `retire_technical_keep_history_only`.

---

## `EVT_28_BODY_001` — La recuperación tarda un día más

Runtime:
- age 28 generic medical event;
- body-load gate;
- generic family choices/effects;
- no specific canonical memory contract.

Nearest canonical age-28 body scene:
- `EVT_28_MED_001` — “No puedes jugar sesenta partidos” — is a specific club/selection load-allocation dilemma under low recovery margin and high calendar load;
- choices distinguish reducing lower-priority NT matches, club rotation, accepting risk, or negotiating a joint club-selection plan;
- creates `SEED_LOAD_CHOICE_29` and reads `SEED_INTERNATIONAL_LOAD`.

Decision:
- broad body/load theme only; not same scene.

Disposition: `retire_technical_keep_history_only`.

---

## `EVT_28_JAN_001` — El invierno del segundo gran proyecto

Runtime:
- age 28 generic January market event;
- market-window gate;
- no canonical-specific scene/seed responsibility.

Canonical age-28 missing scenes concern documentary fallout, normal-form dip, successor peak, load choice and president/manager public backing. None is this generic second-project January market callback.

Decision:
- no canonical identity counterpart in the 02D target set.

Disposition: `retire_technical_keep_history_only`.

## Canonical age-28 causal obligations after retirement of legacy writers

02D must ensure:
- `EVT_28_MEDIA_001` consumes the documentary access created at 26 and creates `SEED_DOCUMENTARY_FALLOUT`;
- `EVT_28_FORM_001` creates `SEED_FIRST_PEAK_DIP` without pretending normal variance is caused by the player's choice;
- `EVT_28_STAR_001` consumes successor history and positional-reinvention context, creating `SEED_SUCCESSION_DECISION`;
- `EVT_28_MED_001` creates `SEED_LOAD_CHOICE_29` and respects prior international-load state;
- `EVT_28_CLUB_001` creates `SEED_PUBLIC_MANAGER_BACKING` and reads/uses manager-power/institutional context;
- PR #5's canonical `EVT_28_RICH_001` remains separate and no technical rich-offer duplicate remains active.

## Migration implications

For all seven legacy IDs:
- completed old history remains under the legacy ID;
- pending old scene keeps its exact old choice contract via supported content compatibility or fails explicitly;
- no canonical `SEEN_*` is manufactured;
- future seed catalog origin metadata moves to the reviewed canonical source without automatically rewriting historical `seed.originEvent`;
- compatibility-only definitions never enter active scheduling.

## Status

**02D_LEGACY_REVIEW_COMPLETE — 7/7 RETIRE_HISTORY_ONLY — 0 SAME-SCENE MIGRATIONS**
