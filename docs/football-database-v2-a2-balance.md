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


## Final league/country distribution

Post-calibration country averages:

| country | clubs | prestige | finance | youth | development | pressure | attraction |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| ESP | 62 | 72.81 | 73.34 | 76.24 | 75.19 | 73.37 | 75.24 |
| ENG | 68 | 74.62 | 77.97 | 75.13 | 72.99 | 75.35 | 77.51 |
| ITA | 40 | 78.00 | 75.60 | 79.40 | 74.90 | 78.83 | 80.83 |
| DEU | 36 | 76.14 | 78.08 | 79.69 | 79.83 | 75.00 | 79.67 |
| FRA | 36 | 76.56 | 77.00 | 80.14 | 79.67 | 74.86 | 79.64 |
| PRT | 36 | 70.58 | 66.69 | 80.03 | 81.64 | 69.58 | 75.72 |
| NLD | 38 | 69.92 | 67.58 | 81.63 | 83.76 | 66.50 | 75.32 |
| BEL | 32 | 64.75 | 62.94 | 78.66 | 81.94 | 62.69 | 69.94 |
| USA | 30 | 68.83 | 79.47 | 74.77 | 77.00 | 70.03 | 76.63 |
| MEX | 18 | 69.11 | 69.61 | 78.28 | 77.56 | 77.00 | 71.11 |
| ARG | 30 | 76.87 | 67.57 | 87.37 | 84.43 | 84.60 | 81.87 |
| JPN | 20 | 69.20 | 74.10 | 81.30 | 84.95 | 68.15 | 73.20 |
| CHN | 16 | 63.38 | 72.50 | 71.75 | 73.13 | 69.00 | 67.06 |
| TUR | 18 | 72.39 | 72.83 | 77.89 | 76.72 | 81.72 | 77.33 |
| NOR | 16 | 63.25 | 64.63 | 80.69 | 84.94 | 61.38 | 70.19 |
| MAR | 16 | 62.94 | 58.75 | 78.00 | 84.56 | 66.13 | 66.81 |
| ZAF | 16 | 60.75 | 59.56 | 74.31 | 79.56 | 65.38 | 64.06 |

Tier averages:

| tier | clubs | prestige | finance | youth | development | pressure | attraction |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 328 | 73.99 | 74.25 | 80.97 | 81.04 | 75.71 | 78.07 |
| 2 | 156 | 68.41 | 68.47 | 76.04 | 76.46 | 67.92 | 72.54 |
| 3 | 44 | 64.57 | 67.02 | 68.68 | 69.86 | 65.48 | 67.89 |

### Deterministic-flavour outliers

Before A2, 148/528 clubs had an absolute prestige flavour contribution of 6 or 7 points.
After A2 the raw deterministic flavour is hard-bounded to +/-3, therefore unexplained flavour contributions above 3 are structurally impossible. Competitive extremes must now come from league/tier structure plus an explicit club band.

### Prestige extremes after calibration

Top ten:
`ENG_PORTSMOUTH 97`, `ENG_WOLVERHAMPTON 96`, `ESP_VALLADOLID 95`,
`ENG_READING 95`, `ENG_HULL 94`, `ITA_CATANIA 94`, `DEU_HAMBURG 94`,
`DEU_ESSEN 94`, `ENG_BIRMINGHAM 93`, `ENG_COVENTRY 93`.

Bottom ten:
`BEL_DENDERMONDE 53`, `BEL_TURNHOUT 54`, `ZAF_GQEBERHA 54`,
`BEL_BEVEREN 55`, `ZAF_EAST_LONDON 55`, `CHN_CHONGQING 56`,
`NOR_STAVANGER 56`, `NOR_BOD 56`, `ZAF_RUSTENBURG 56`, `CHN_WUHAN 57`.

The lower extreme is dominated by the explicit lower band rather than uncontrolled hash noise.
