# Football Database V2 — DB-A2 G2 balance handoff

Status: candidate for **G2 — FOOTBALL DATA / BALANCE CERTIFIED**  
Owner: DB-A2  
Depends on: DB-A0 / PR #826 and DB-A1 / PR #827

## Baseline

- main when A2 started: `b72cb81f993634667ba699086ba8714240d8a27b`
- A0 contract: `eb6289594930f4419d42aa65a17ba11a4c98f1cb`
- A1 head used as catalog baseline: `9ef7369db5a0adc7bafc6c7b3ee0a81b8a725e66`
- catalog size: 528 clubs / 27 divisions / 17 countries / 5 confederations
- save schema: unchanged
- market runtime: unchanged
- Player Actions: unchanged
- new GameState RNG draws: 0

## Pass 1 — audit

A1's raw generator used a league/tier baseline plus independent deterministic flavour of ±7.

Observed pre-A2 prestige:
- min 48
- max 99
- mean 71.55
- median 70.5
- standard deviation 10.47
- P10 57
- P25 64
- P50 70.5
- P75 78
- P90 85
- P95 90.65

Known examples were reproduced on the real catalog:
- `ESP_CORDOBA`: 94
- `ESP_MADRID`: 84
- `ESP_BARCELONA`: 88
- `ENG_DERBY`: 99
- `ENG_MANCHESTER`: 91
- `ENG_LIVERPOOL`: 91

Root cause: club flavour could move a structurally identical first-tier club by fourteen total points, while no explicit club-level competitive band existed.

A second issue was semantic: the old `development` archetype was mostly random flavour. Its average `developmentBias` was about 75.6, so it could not safely power a DEVELOPMENT_CLUB selector.

## Pass 2 — hierarchy

A2 derives six stable bands without changing persisted club identity:

- elite
- continental
- upper
- mid
- lower
- development

Band assignment is constrained first by:
1. tier;
2. league-strength group;
3. a stable club-id hash bucket.

League groups are fictional game-design groups:

- A: strength >= 80
- B: 72..79
- C: 64..71
- D: < 64

This keeps the intended broad ordering while avoiding a copied external league ranking.

The development band is orthogonal to raw prestige. It intentionally trades some prestige/finance/pressure for youthQuality and developmentBias.

## Pass 3 — recalibration

A2 compresses each league/division coefficient before band modifiers are applied:

`clubBaseline = round(32 + 0.58 * structuralCoefficient)`

The old ±7 club flavour is reduced to ±3.

Band modifiers then create controlled separation instead of letting raw hash flavour define the hierarchy.

Expected post-A2 averages from the exact deterministic model:

| band | clubs | prestige | finance | youth | development | pressure | attraction |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| elite | 17 | 91.06 | 89.59 | 82.29 | 73.88 | 90.59 | 92.82 |
| continental | 25 | 84.92 | 83.68 | 83.12 | 77.60 | 86.08 | 88.28 |
| upper | 88 | 77.65 | 75.28 | 80.82 | 78.26 | 78.42 | 81.14 |
| mid | 168 | 71.86 | 72.52 | 77.85 | 77.31 | 74.05 | 75.80 |
| lower | 138 | 63.38 | 65.97 | 73.36 | 77.65 | 66.18 | 68.69 |
| development | 92 | 70.21 | 70.17 | 83.16 | 84.72 | 66.75 | 73.61 |

Expected prestige by tier:
- tier 1: 73.99
- tier 2: 68.41
- tier 3: 64.57

Expected top-tier prestige by league group:
- A: 84.39
- B: 75.79
- C: 69.01
- D: 62.58

The pre-A2 prestige range of 48..99 becomes 53..97. More importantly, high values are now explained by an explicit competitive band rather than ±7 raw flavour. The global prestige mean remains effectively stable (71.55 -> 71.56), so the recalibration changes hierarchy shape rather than inflating the whole world.

## Pass 4 — selector/profile contract

Derived profiles:

- elite
- ambitious
- balanced
- development
- lower_pressure
- financial

Expected profile population:
- elite: 17
- ambitious: 82
- balanced: 315
- development: 96
- lower_pressure: 10
- financial: 8

### BIG_CLUB

Metadata expectation:
- band = elite, or strict top continental;
- tier = 1;
- top-continental thresholds are fixed at prestige >= 88, internationalAttraction >= 84 and division strength >= 78.

The current deterministic catalog yields 17 elite clubs plus 9 qualifying top-continental clubs. BIG_CLUB must never mean a generic upper 60% of a division.

### DEVELOPMENT_CLUB

Primary band:
- development

A3 should additionally use:
- youthQuality;
- developmentBias;
- pressure;
- plausible minutes/context.

It must not simply choose the lowest-prestige club.

### AMBITIOUS

Expected bands:
- continental;
- upper.

It should favor prestige + finance + international attraction but remain distinct from BIG_CLUB. The A2 contract fixes the ambition composite floor at 76.

### HIGHER_CLUB

Relative selector.

A2 provides the hierarchy metadata only. A3 owns comparison with the current club and must require either at least +5 prestige points or a stronger competitive band supported by league context.

## Pass 5 — stress/certification

Dedicated QA adds:
- band ordering checks;
- tier ordering checks;
- league-group ordering checks;
- development-vs-elite semantic checks;
- selector-profile population checks;
- deterministic metadata checks;
- 0 runtime RNG source audit;
- deterministic 12,000-sample stress per selector profile;
- existing DB-A1 structural catalog tests.

No market runtime, save schema, fixtures, Player Actions, PlayCanvas or Android behavior is changed by A2.

## A3 handoff

A3 may consume:

- `footballLeagueGroupForStrength`
- `footballClubBandFor`
- `footballClubSelectorProfile`
- `footballClubBalanceMetadata`
- `FOOTBALL_SELECTOR_PROFILE_CONTRACT`

A3 must not reinterpret BIG_CLUB as a broad percentile selector.

## Merge order

A2 is based on the A1 head and must not merge before:
1. DB-A0 / G0;
2. DB-A1 / G1.

A2 authority ends at:

**G2 — FOOTBALL DATA / BALANCE CERTIFIED**
