# Football Database V2 — DB-A1 G1 handoff

Status: candidate for **G1 — CATALOG / SCHEMA / INTEGRITY CERTIFIED**  
Owner: DB-A1  
Depends on: DB-A0 / PR #826

## What A1 owns

This handoff covers only catalog schema, stable identity, indexes, reference classification and structural integrity.

It does **not** change market authority, fixtures, saves, Player Actions, narrative resolution, PlayCanvas or Android.

## Active catalog

- Catalog version: `world-v2-a1-2026-09-28`
- Clubs: 528
- Countries: 17
- Divisions: 27
- Confederations: 5
- GameState RNG draws added by A1: 0

`UDV` remains outside the generated world array as a permanent `canonical_special` identity.

## Identity contract

Persisted identity is `FootballClub.id`. Never derive identity from:

- display name;
- short name;
- array position;
- prestige;
- division;
- tier;
- city alone.

Existing V1 IDs such as `ESP_MADRID` are preserved.

### Multi-club cities

Use `stableCatalogClubId(countryCode, city, occurrence, explicitId?)`.

The first club in an existing city keeps the legacy-compatible `COUNTRY_CITY` ID.

A second or later club in that city **must** receive an explicit immutable ID, for example:

```ts
stableCatalogClubId("ESP", "Madrid", 2, "ESP_MADRID_02");
```

Calling the same helper for occurrence 2 without an explicit ID fails fast. This prevents city-list edits from silently renumbering persisted identities.

The world catalog contains an `EXPLICIT_MULTI_CLUB_IDS` registry reserved for these additions.

## Reference kinds

`classifyFootballClubReference(value)` returns exactly one of:

- `catalog`
- `canonical_special`
- `narrative_alias`
- `legacy_compat`
- `invalid`

### Canonical special

Current registry:

- `UDV`

### Narrative aliases

Current registry:

- `NEW_CLUB`
- `DEVELOPMENT_CLUB`
- `DEVELOPMENT_CLUB_2`
- `HIGHER_CLUB`
- `BIG_CLUB`
- `FOREIGN_DEV_CLUB`

These may exist in canonical content. They are **not** valid newly persisted club identities.

### Legacy compatibility

Explicit named compatibility currently includes:

- `Aurora CF`

Historical generated families include:

- `SIM_OPP_*`
- `Development_*`
- `Domestic_*`
- `Summer_*`
- `Foreign_*`
- `Loan_*`
- `Club N · M`

Pre-V2 saves and certified regression fixtures also contain display-like opaque club names such as
`Destino`, `Destino FC`, `Development Club`, `Propietario`, `Parent Club` and `Loan Club`.
A narrow display-name compatibility lane classifies that legacy shape as `legacy_compat` only for
historical reads. Unknown V2-shaped IDs such as `ESP_FAKE_CLUB_999`, malformed underscored tokens,
aliases and lowercase/empty values still fail closed.

Legacy compatibility is read-only compatibility. It is never legal new V2 production.

## Context validation

Use `assertFootballClubReferenceForContext(value, context, path?)`.

### `new_production`

Allowed:

- `catalog`
- `canonical_special`

Rejected:

- `narrative_alias`
- `legacy_compat`
- `invalid`

### `historical_read`

Allowed:

- `catalog`
- `canonical_special`
- `legacy_compat`

Rejected:

- `narrative_alias`
- `invalid`

A4 should use this mode when validating historical persisted club references.

### `canonical_content`

Allowed:

- `catalog`
- `canonical_special`
- `narrative_alias`

Rejected:

- `legacy_compat`
- `invalid`

A3 should use this mode when validating canonical narrative content before alias materialization.

## Convenience APIs

- `isCatalogClubId`
- `isCanonicalSpecialClubId`
- `isNarrativeClubAlias`
- `isLegacyClubReference`
- `isNewFootballClubReference`
- `isLoadableFootballClubReference`
- `assertNewFootballClubReference`
- `assertLoadableFootballClubReference`

## Structural validation

`inspectFootballCatalogData(clubs, divisions)` validates arbitrary catalog snapshots.

`assertFootballCatalogData(clubs, divisions, label?)` fails closed and is called during active catalog construction.

Covered invariants include:

- non-empty and formatted IDs;
- duplicate club/division IDs;
- duplicate exact club names;
- country and confederation allowlists;
- club → division → country/confederation consistency;
- tier consistency;
- 0..100 numeric bounds;
- archetype allowlist;
- clearance allowlist;
- division counts;
- non-empty city/name/shortName constraints.

`inspectFootballCatalog()` additionally checks active runtime immutability and registry collisions.

## Indexes / lookup

Available indexed lookups:

- `clubById(id)`
- `divisionById(id)`
- `clubsForDivision(divisionId)`
- `clubsForCountry(countryCode)`
- `divisionsForCountry(countryCode)`
- `nearestDivisionForCountry(countryCode, tier)`

Grouped results are frozen.

## Determinism

Catalog construction uses deterministic static configuration and pure hashing only.

`footballCatalogStructuralFingerprint(clubs, divisions)` provides a reproducible structural fingerprint for QA. Dedicated tests audit the catalog sources for accidental GameState/global RNG use.

## Adding a club safely

1. Choose the correct country/division.
2. Reuse no existing `clubId`.
3. If the city is new, the first identity may retain the `COUNTRY_CITY` scheme.
4. If the city already exists, add an explicit immutable ID to the multi-club registry.
5. Never renumber/recycle an existing ID.
6. Keep attributes within 0..100 and archetypes/clearance on their allowlists.
7. Run `npm run test:football-catalog`.
8. Do not change market/fixture/save behavior in the catalog layer.

## Handoff to A3

A3 may consume the catalog and classifier after G1. It must preserve market/fixture authority and zero additional RNG draws. Narrative aliases must be materialized before a new persisted career identity is written.

## Handoff to A4

A4 owns `footballCatalogVersion` persistence and migration. A1 deliberately does not modify GameState/save schema. A4 should validate old persisted references in `historical_read` mode and all newly produced V2 references in `new_production` mode.

## G1 boundary

A1 may declare only:

**G1 — CATALOG / SCHEMA / INTEGRITY CERTIFIED**

It must not declare the full Football Database V2 complete.
