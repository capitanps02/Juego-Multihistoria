# DB-A4 — Pass 1 persistence inventory

Status: COMPLETE
Progress: 20%
Passes: 1 / 5
Estimated remaining: 4

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
