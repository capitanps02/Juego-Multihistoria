# T5.1 — Batch 04A semantic review of age-34 runtime-only principal IDs

Generated: 2026-09-16  
Branch: `chore/chatgpt-codex-workflow`

## Result

Reviewed age-34 runtime-only IDs: **11/11**.  
Approved same-scene migrations: **0/11**.  
Disposition for all eleven: `retire_technical_keep_history_only`.

## Structural evidence

The baseline `src/content/events/34_plus/principal-events.ts` constructs all eleven IDs through the same `generic(...)` adapter. That adapter supplies:

- a broad late-career body;
- generic visible state: role, physical state, contract;
- generic uncertainty: market demand and club plans;
- the same four choices for every scene:
  - protect role;
  - accept adaptation;
  - prioritize body;
  - explore market;
- generic numeric consequences;
- no scene-specific canonical memory/seed contract.

This makes title/family proximity useful only as authoring lineage. It cannot prove that a legacy event is the same scene as any canonical age-34 event.

## Representative canonical contrasts

### `EVT_34_BRIDGE_001` — La reunión sin horizonte

Canon requires age 34 + active/negotiable contract, concrete role/salary/timing information and four contract-specific choices: sign one year, demand role clarity, wait until August, or request exit. It creates `SEED_AGE34_REALITY` and reads prior `SEED_AGE34_PRIORITY`.

No generic age-34 row exposes this contract.

### `EVT_34_NT_001` — Última ventana de selección

Canon requires national standing/cycle context and explicit national-team posture choices, including international retirement. It creates `SEED_FINAL_NT_POSTURE` and reads `SEED_NATIONAL_PHASEDOWN`.

`EVT_34_NAT_001` is broad lineage only, not the same scene.

### `EVT_34_LOAD_001` — El plan de 28 partidos

Canon uses `MATCH_SELECTIVITY`, a concrete workload plan and four plan-specific choices. It creates `SEED_28_MATCH_PLAN`.

`EVT_34_MED_001` is a generic recovery row and cannot be migrated into this identity.

### `EVT_34_DORSAL_001` — Tu dorsal en la tienda

Canon requires an iconic shirt number + strong successor and explicit public/private succession choices. It creates `SEED_FINAL_DORSAL` and consumes `SEED_DORSAL_SUCCESSION`.

No age-34 generic legacy row owns that scene.

### `EVT_34_MENTOR_001` — El joven te pide tus vídeos

Canon is a private request from the successor and distinguishes full help, limited help, refusal and staff-mediated work. It creates `SEED_SUCCESSOR_ALLIANCE` and reads `SEED_FORMAL_MENTOR`.

Generic `EVT_34_TEAM_001` / `EVT_34_LEG_001` do not prove identity.

### `EVT_34_TRAVEL_001` — El viaje que no haces

Canon is a consequence of prior match-selectivity/travel load: the team wins while you stay home. It creates `SEED_TEAM_WINS_WITHOUT_YOU` and reads `SEED_TRAVEL_LOAD`.

A generic body/role/market scene does not represent that causal callback.

## Legacy dispositions

- `EVT_34_PRE_001`: retire history only; no unique canonical counterpart.
- `EVT_34_MKT_001`: retire history only; generic veteran market, no unique same-scene target.
- `EVT_34_NAT_001`: retire history only; broad lineage to `EVT_34_NT_001` only.
- `EVT_34_TEAM_001`: retire history only; generic youth-generation context, not canonical mentor/succession scene.
- `EVT_34_FAM_001`: retire history only; no age-34 canonical same-scene proof.
- `EVT_34_IMG_001`: retire history only; broad status/image theme only.
- `EVT_34_MED_001`: retire history only; broad lineage to workload/recovery, not canonical `EVT_34_LOAD_001`.
- `EVT_34_COM_001`: retire history only; broad lineage to sporting resurgence/match context only.
- `EVT_34_LEG_001`: retire history only; broad legacy/mentor lineage only.
- `EVT_34_END_001`: retire history only; generic summer continuation cannot become a hidden transition/retirement scene.
- `EVT_34_PRS_001`: retire history only; generic press question, no unique canonical counterpart.

## Migration implications

- completed old history keeps the legacy ID;
- pending old content must retain its old A/B/C/D choice contract via compatibility or fail explicitly;
- no `SEEN_canonical` is inferred;
- no active legacy generic definition remains after canonical replacement;
- future canonical seeds are created by canonical scenes, not retroactively assigned to old generic history.

## Status

**04A_LEGACY_REVIEW_COMPLETE — 11/11 RETIRE_HISTORY_ONLY — 0 SAME-SCENE MIGRATIONS**
