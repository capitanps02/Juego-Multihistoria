# DB-A4 — Pass 1 persistence inventory

Status: G4 CERTIFIED — STACK READY
Progress: 100%
Passes certified: 5 / 5
Passes implemented: 5 / 5
Estimated remaining: 0 within DB-A4; merge-order only

## Baseline

- main baseline: `b72cb81f993634667ba699086ba8714240d8a27b`
- A0 contract: `eb6289594930f4419d42aa65a17ba11a4c98f1cb`
- A1 final contract: `1b0992bc6df38d05a4b8061c748ff17aa08a3d65`
- A2 regrounded balance: `26c4fa6c09e0fb1191dadf289f622be0604d9ba4`
- A3 regrounded runtime: `3d4c42e73115c664f6762ea2bc16ffb0cbe8a788`
- save schema: `8`
- supported raw save schemas: `2..8`
- catalog version authority: `FOOTBALL_CATALOG_VERSION = "world-v2-a2-2026-09-28"`
- DB-A4 branch: `db-a4/save-catalog-versioning-regrounded`

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

## Dependency / serialization status

The predecessor ambiguity has been resolved without rewriting old staging branches.

Canonical staged chain:
- G0: `db-a0/football-database-v2-architecture` @ `eb6289594930f4419d42aa65a17ba11a4c98f1cb`;
- G1: `db-a1/football-catalog-integrity` @ `1b0992bc6df38d05a4b8061c748ff17aa08a3d65`;
- G2: `db-a2/football-balance-regrounded` / PR #839 @ `26c4fa6c09e0fb1191dadf289f622be0604d9ba4`;
- G3: `db-a3/runtime-football-catalog-regrounded` / PR #840 @ `3d4c42e73115c664f6762ea2bc16ffb0cbe8a788`;
- G4: this regrounded A4 branch.

PRs #839 and #840 supersede the divergent historical A2/A3 staging PRs. The old A4 branch/PR #832 remains evidence of the first exact-head green implementation, but final G4 sign-off must come from this serialized regrounded branch. Merge to `main` still occurs in predecessor order.

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

## Pass 4 — validation / save-load replay — COMPLETE — EXACT-HEAD CI GREEN

Committed QA now covers:
- schema 2..8 frozen migration/round-trip baselines;
- exact schema-8 pre-catalog no-op load/re-save;
- supported A1 metadata preserved until explicit migration;
- invalid/future catalog generation rejection;
- active V2 invalid-ID injection;
- exact-ID migration idempotence and tombstones;
- ownerClub != registrationClub loan preservation;
- Player Actions club-scoped fact persistence;
- fresh V2 fixture production with catalog opponent identity;
- deterministic current-V2 replay across save/load;
- retirement save/load in playing / decided / announced / closed states.

No versioning or migration path consumes RNG.

## Pass 5 — minimum compatibility matrix — COMPLETE — G4 CERTIFIED

| Matrix row | Evidence |
| --- | --- |
| old schema 2..7 | `scripts/test-saves.mjs` frozen migration cases |
| schema-8 pre-V2 | exact fixture round-trip with missing catalog metadata |
| V2 A1 generation | supported compatibility generation + explicit A1→A2 migration |
| fresh current V2 | new-career metadata + save/load |
| transfer/current employment | market/current reference validation |
| loan owner != registration | dedicated A4 round-trip |
| historical fixture | missing `opponentClubId` remains loadable; no heuristic backfill |
| new fixture | runtime producer + A4 long-career assert stable `opponentClubId` |
| Player Actions | dedicated session persistence + club-fact reference validation |
| long career | seed 424242 through terminal career + final save/load |
| retirement | T5.36 states plus terminal long-career round-trip |

Important fixture rule: a migrated historical row may predate `opponentClubId`; the migration never fabricates one. New V2 fixture production is separately required and tested to write a stable catalog opponent ID.

## Current QA status

- Serialized ancestry is clean with `behind=0` at every edge: main→G0→G1→G2-regrounded→G3-regrounded→G4-regrounded.
- Regrounded code-bearing HEAD `760f6ad849bfdc342a1df050bf526e260245a66e` passed both A4 save/versioning workflows:
  - push run `36399590439`: SUCCESS;
  - PR run `36399633775`: SUCCESS.
- Exact integrated counts on the regrounded stack:
  - save/version/migration: 236/236;
  - football catalog: 11/11;
  - runtime/catalog regression: 41/41;
  - skipped: 0;
  - todo: 0.
- Player Actions A5 Content run `36399633795`: SUCCESS, including one-year anti-grind stress.
- T51 A5 K certification run `36399633637`: SUCCESS.
- T5.1 offer session bridge run `36399633676`: SUCCESS.
- P0: 0 known.
- P1: 0 known in DB-A4.
- G4 is technically certified and stack-ready. Merge remains serialized behind predecessor PRs; this is merge-order, not an A4 implementation blocker.
