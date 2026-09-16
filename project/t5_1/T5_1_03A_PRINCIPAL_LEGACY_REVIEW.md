# T5.1 — Batch 03A semantic review of age-30 runtime-only principal IDs

Generated: 2026-09-16

## Scope

Runtime-only principal IDs assigned to 03A:
- `EVT_30_IDN_001` — La palabra veterano
- `EVT_30_AGT_001` — El incentivo del último gran contrato
- `EVT_30_TEAM_001` — Tu dorsal ya tiene heredero
- `EVT_30_LIFE_001` — Otra ciudad ya no cuesta lo mismo
- `EVT_30_FINAL_001` — La gran noche desde otro rol

Canonical 03A target set contains ten missing age-30 scenes, including `EVT_30_BRIDGE_001`, `EVT_30_STATUS_001` and `EVT_30_EUR_001`.

## Result

Reviewed: **5/5**.
Approved same-scene migrations: **0/5**.

Final planning disposition for all five:

`retire_technical_keep_history_only`

### `EVT_30_IDN_001`

Already reviewed in `T5_1_PRINCIPAL_TITLE_CANDIDATES_30_PLUS_REVIEW.md`.

It shares title/seed lineage with canonical `EVT_30_BRIDGE_001`, but the generic runtime scene/choices are not the canonical age-30 bridge. No history/pending migration is allowed.

### `EVT_30_AGT_001`

Runtime generic agent row creates `SEED_AGENT_LAST_CONTRACT`.

Canonical `EVT_30_MKT_001` — ¿El último mercado grande? — explicitly creates `SEED_LAST_BIG_MOVE_WINDOW` and `SEED_AGENT_LAST_CONTRACT` from a specific late-prime market decision. Canonical `EVT_31_AGT_001` later also uses/renews that agent-last-contract thread in a different negotiation scene.

The technical age-30 agent callback is not a missing canonical 03A scene and is not an alias for either canonical event.

Disposition: `retire_technical_keep_history_only`.

### `EVT_30_TEAM_001`

Runtime generic team row creates `SEED_DORSAL_SUCCESSION`.

Canonical owner is missing `EVT_30_STATUS_001` — El dorsal. The source explicitly creates `SEED_DORSAL_SUCCESSION` from the private request by the younger successor, with four specific symbolic/competitive choices. Age-34 `EVT_34_DORSAL_001` later consumes that memory.

Disposition: `retire_technical_keep_history_only`.

### `EVT_30_LIFE_001`

Runtime generic life row creates `SEED_RELOCATION_LIMIT`.

Canonical exact-ID `EVT_30_FAM_001` — Mudarse otra vez — explicitly creates both `SEED_FAMILY_ANCHOR` and `SEED_RELOCATION_LIMIT` from the concrete relocation/family tradeoff. Later age-31/35 family scenes consume that thread.

Disposition: `retire_technical_keep_history_only`.

### `EVT_30_FINAL_001`

Runtime generic sport/final row creates `SEED_BIG_GAME_ROTATION_30`.

Canonical owner is missing `EVT_30_EUR_001` — Semifinal, minuto cero. The source explicitly creates `SEED_BIG_GAME_ROTATION_30` and reads `SEED_BIG_GAME_BENCH`, with a specific tactical discussion about starting versus entering later.

Disposition: `retire_technical_keep_history_only`.

## Migration rules

For all five:
- old completed history remains under legacy ID;
- pending old decision contract is preserved through supported compatibility or resume fails explicitly;
- do not manufacture canonical `SEEN_*`;
- future seed catalog responsibility moves to canonical owner only after that scene is valid;
- historical `seed.originEvent` is not automatically relabelled;
- compatibility-only legacy definitions never enter scheduler candidates.

## Status

**03A_LEGACY_REVIEW_COMPLETE — 5/5 RETIRE_HISTORY_ONLY — 0 SAME-SCENE MIGRATIONS**
