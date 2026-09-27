# DB-A4 — Pass 1 persistence inventory

Status: IN PROGRESS — PASSES 1–3 COMPLETE
Progress: 65%
Passes: 3 / 5
Estimated remaining: 2

## Baseline

- main baseline: `b72cb81f993634667ba699086ba8714240d8a27b`
- A0 contract: `eb6289594930f4419d42aa65a17ba11a4c98f1cb`
- A1 contract: `9ef7369db5a0adc7bafc6c7b3ee0a81b8a725e66`
- A3 stacked runtime line: `db-a3/runtime-football-catalog`
- save schema: `8`
- supported raw save schemas: `2..8`
- catalog version authority: `FOOTBALL_CATALOG_VERSION = "world-v2-a2-2026-09-28"`
- DB-A4 branch: `db-a4/save-catalog-versioning`

## Compatibility rule

Pass 1 changes no save shape. Existing schema-8 fixtures must remain byte/JSON-shape stable on load. Missing catalog metadata therefore has an explicit semantic meaning in Pass 2: pre-football-catalog compatibility, without forcing a schema-version bump.

## Persisted football-reference surfaces

| Surface | Role | Legacy-capable | New-write validation |
| --- | --- | --- | --- |
| `state.club` | active identity | yes, pre-V2 | required |
| `professional.ownerClub` | active ownership | yes, pre-V2 | required |
| `professional.registrationClub` | active registration | yes, pre-V2 | required |
| `world.ownerClub` | active compatibility mirror | yes, pre-V2 | required |
| `npcs[].club` | live NPC club scope | yes | required when written in V2 |
| `history[].club` | historical narrative provenance | yes | historical-read policy |
| `ageMilestones[].club` | historical snapshot | yes | historical-read policy |
| `employment.previous.club` | historical employment | yes | historical-read policy |
| `employment.previous.ownerClub` | historical ownership | yes | historical-read policy |
| `employment.previous.registrationClub` | historical registration | yes | historical-read policy |
| `npcs[].knowledge[*].club` | historical knowledge provenance | yes | historical-read policy |
| market CareerTerms `.club` | current/future/history | yes in pre-V2 saves | required for V2 production |
| market CareerTerms `.ownerClub` | current/future/history | yes in pre-V2 saves | required for V2 production |
| market CareerTerms `.registrationClub` | current/future/history | yes in pre-V2 saves | required for V2 production |
| `market.futureNegotiations[].destination` | future destination | yes in pre-V2 saves | required |
| `world.sportMatchModel.fixtures[].club` | historical fixture club | yes | V2 rows required valid |
| `world.sportMatchModel.fixtures[].opponentClubId` | stable opponent ID | absent historically | required for new V2 rows |
| `world.sportMatchModel.objective.club` | season objective | yes | required for V2 production |
| `world.sportCompetitionMoments.moments[].club` | historical competition fact | yes | required for V2 production |
| `world.sportPenaltySetups.contexts[].club` | historical fixture context | yes | required for V2 production |
| `world.veteranMarketApproaches[].club` | historical market approach | yes | required for V2 production |
| `world.playerClubLeadershipAuthority.currentLeadership.clubId` | current leadership scope | yes | required for V2 production |
| `world.playerClubLeadershipAuthority.history[].clubId` | historical leadership | yes | historical-read policy |
| `world.playerClubLeadershipAuthority.successor.clubId` | certified successor scope | yes | required for V2 production |
| `world.coachChangeAuthority.history[].clubId` | historical coach-change scope | yes | historical-read policy |
| `world.injuryEpisodes.episodes[].registrationClub` | historical injury scope | yes | required for V2 production |
| `playerActions.facts[].payload.club` | club-scoped player intent | yes | required for V2 production |
| offer history/closures `offer.before.*Club` | historical market provenance | yes | historical-read policy |
| offer history/closures `offer.terms.*Club` | historical market provenance | yes | historical-read policy |
| future agreements `terms.*Club` | future employment identity | yes in pre-V2 saves | required |

No explicit club identity was found in `footballMomentResults`, national-selection authority, representation authority, or sport-achievement authority.

## Existing legacy identities

The A1 classifier recognizes:
- `UDV` as canonical special;
- `Aurora CF` as legacy compatibility;
- `SIM_OPP_*`;
- `Development_*`, `Domestic_*`, `Summer_*`, `Foreign_*`, `Loan_*`;
- `Club N · M`;
- bounded opaque historical display strings as compatibility identities;
- narrative aliases including `BIG_CLUB`, `NEW_CLUB`, `HIGHER_CLUB`, `DEVELOPMENT_CLUB`, `DEVELOPMENT_CLUB_2`, `FOREIGN_DEV_CLUB`.

Unknown V2-shaped IDs are reserved and invalid rather than silently accepted as legacy.

## Migration policy discovered in Pass 1

- Never map by display name, city, short name or array position.
- Historical legacy identities remain historical when no explicit mapping exists.
- Active owner and registration identities are independent; no migration may collapse a loan.
- Historical fixtures may omit `opponentClubId`.
- New V2 fixture production already emits `opponentClubId`.
- Player Actions schema is not changed; only the already-existing club-scoped payload is subject to reference validation.
- No RNG mutation is required for versioning or validation.

## Dependency risk

There are parallel A2 lines (#828 and #829). PR #830 currently declares #828 as its G2 dependency, while #829 is a later calibration line. DB-A4 must remain stacked on the exact A3/G3 line that is ultimately certified; final G4 certification is blocked until the serialized predecessor choice is resolved. This does not block implementing the additive save-version contract on the current stack.

## Pass 2 handoff

Implement:
1. optional persisted `footballCatalogVersion` metadata for backward compatibility;
2. new saves stamped with the authoritative catalog version;
3. missing metadata interpreted as `pre-football-catalog`;
4. present unsupported versions rejected;
5. no `schemaVersion` increment solely for this metadata.

## Pass 2 — catalog version contract — COMPLETE (42%)

- `GameState.footballCatalogVersion` is optional for backwards compatibility.
- new careers are stamped with `CURRENT_FOOTBALL_CATALOG_VERSION`;
- missing metadata reads as `pre-football-catalog`;
- load/save does not auto-upgrade or materialize missing metadata;
- current schema remains `8`;
- unsupported/future catalog generations fail closed;
- catalog version changes are not part of normal gameplay.

## Pass 3 — explicit migration / normalization — COMPLETE (65%)

- `world-v2-a1-2026-09-28 -> world-v2-a2-2026-09-28` is an explicit migration step with an empty ID map because stable IDs did not change.
- pre-catalog saves are not guessed into V2; they require a future audited explicit manifest before any upgrade.
- exact-ID migration supports explicit replacements and tombstones.
- migration never matches by display name, short name, city or array position.
- V2 active/new writes accept only catalog or canonical-special identities.
- historical provenance may retain explicit legacy-compatible references.
- narrative aliases are not valid new V2 identities.
- owner and registration are preserved independently.
- new V2 fixture rows require stable `opponentClubId`; pre-catalog/historical saves remain under their compatibility contract.
- Player Actions schema is unchanged; existing club-scoped fact payloads are validated only for V2 saves.
- no RNG stream is touched by versioning/migration.

## Current QA status

Dedicated regression: `scripts/test-football-catalog-save-versioning.mjs`.

Coverage includes:
- new-save metadata;
- exact pre-catalog round trip;
- active legacy pre-catalog identity;
- invalid V2 identity injection;
- historical legacy provenance;
- owner/registration loan preservation;
- unsupported version rejection;
- Player Actions fact persistence;
- exact-ID mapping and tombstones.

CI workflow: `Football Database V2 · Save versioning`.

Pass 4 and Pass 5 remain open until the exact PR HEAD has green save/load replay, migration idempotence, Player Actions persistence, catalog/runtime regressions and repository CI. G4 is not certified while predecessor G3 is still unresolved.

## DB-A4 status

```text
DB-A4 — STATUS

PROGRESO:
65%

PASADAS COMPLETADAS:
3 / 5

PASADAS ESTIMADAS RESTANTES:
2

SAVE VERSIONS:
schema 2..8 supported; schema 8 current

FOOTBALL CATALOG:
world-v2-a2-2026-09-28 current
missing => pre-football-catalog

MIGRATIONS:
explicit ID-only; A1 -> A2 path defined; pre-V2 implicit upgrade forbidden

VALIDATION:
V2 contextual reference validation implemented

TESTS:
dedicated suite + CI gate committed; exact-head certification pending

BLOQUEADORES:
serialized G3 predecessor + exact-head CI

RIESGOS:
parallel predecessor/A2 lines must be resolved before G4 certification

SIGUIENTE:
Pass 4 — save/load replay, invalid-ID injection, idempotence, Player Actions regression.
```
