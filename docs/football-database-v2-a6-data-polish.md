# DB-A6 — Football Database V2 · G6 data polish / expansion

## Final serialized baseline

- Main baseline: `b72cb81f993634667ba699086ba8714240d8a27b`
- G1 / A1: `db-a1/football-catalog-integrity`
- G2 / A2 regrounded: `26c4fa6c09e0fb1191dadf289f622be0604d9ba4`
- G3 / A3 regrounded: `3d4c42e73115c664f6762ea2bc16ffb0cbe8a788`
- G4 / A4 certified: `f93953d377d5203078cca0668330a522f8f65604`
- G5 / A5 regrounded predecessor: `f7c33e44230604ecb3694de28f002d4a812708b0`
- G6 branch: `db-a6/football-data-polish-final-g5`

Catalog scope before/after G6:

- clubs: 528 → 528
- countries: 17 → 17
- divisions: 27 → 27
- existing IDs changed: 0
- existing IDs removed/recycled: 0
- selector-pool cardinality change: 0

## Pass 1 — data quality audit — COMPLETE

All 528 generated clubs were reviewed.

Measured findings before polish:

- duplicate full names: 0
- duplicate short names: 0
- duplicate-like high-similarity pairs (threshold 0.84): 2
- names above the 22-character short-name budget: 11
- mechanically truncated / awkward short names: 11

The duplicate-like pairs were:

- Chester Riverside / Colchester Riverside
- Guangzhou Northern / Hangzhou Northern

Required multi-club city candidates were reviewed:

- Madrid
- London
- Buenos Aires
- Istanbul
- Ciudad de México
- Tokyo
- Barcelona
- Manchester
- Roma
- Milano
- Paris

Each remains represented by one catalog club in G6.

## Pass 2 — names / short names / multi-club review — COMPLETE

Mechanical short-name token slicing is removed.

Every current overflow has a human-reviewed compact label:

- Wolverhampton Riverside → W'hampton Riverside
- Clermont-Ferrand Étoile → Clermont Étoile
- Castelo Branco Navegante → C. Branco Navegante
- Viana do Castelo Ribeira → Viana Castelo Ribeira
- Alphen aan den Rijn Noord → Alphen Rijn Noord
- Ciudad de México Estrella → México Estrella
- San Miguel de Tucumán Plata → Tucumán Plata
- Santiago del Estero Central → Sgo. Estero Central
- San Salvador de Jujuy Cóndor → Jujuy Cóndor
- Comodoro Rivadavia Horizonte → C. Rivadavia Horizonte
- Pietermaritzburg Plains → PMB Plains

Any future >22-character overflow without an explicit reviewed label now fails catalog construction.

Duplicate-like names were explicitly disambiguated:

- Chester Riverside → Chester Crown
- Guangzhou Northern → Guangzhou Jade

After polish:

- exact duplicate names: 0
- exact duplicate short names: 0
- pairs at similarity >= 0.84: 0

The A1 explicit immutable multi-club identity mechanism remains available, but G6 adds no second-city clubs because that would alter division/selector pools and require new deterministic baselines. Multi-club expansion is deferred to V2.1 unless explicitly approved.

## Pass 3 — geographic expansion / legal-risk lint — COMPLETE

No country is added in G6.

Primary V2.1 candidate:

1. Brazil

Secondary candidates:

- Austria
- Switzerland
- Denmark
- Croatia
- Greece
- Colombia
- Chile
- South Korea
- Saudi Arabia

A country addition must include coherent division structure, city set, club distribution, attributes, names and selector regression. Token map expansion is rejected.

Legal-risk lint covers normalized forms of:

- well-known real-club identities
- major competition identities
- governing bodies
- obvious sponsor / brand tokens

This is risk detection only.

All catalog entries remain:

`working_name_unchecked`

No legal clearance is claimed.

## Identity / determinism

The sorted 528-ID set remains pinned to FNV-1a:

`0de3b9f6`

G6 tests fail on accidental ID rename/removal/recycling.

Catalog source tests also reject:

- `Math.random`
- `rng.next/float/int`
- `GameStateRng`

RNG impact:

`0 new GameState draws`

Save schema:

`UNCHANGED by A6`

Market runtime:

`UNCHANGED by A6`

Player Actions authority:

`UNCHANGED by A6`

## Cross-agent evidence

A6 QA probe #847 on certified G4 passed:

- G6 catalog/name quality
- A2 balance
- A3 runtime integration
- A4 save/versioning integration
- Player Actions content

The final G6 branch is stacked directly on the official regrounded G5 predecessor and runs those checks again plus:

- PlayCanvas presentation
- Android offline presentation

## Pass 4 — final certification

Final gate:

`Football Database V2 · G6 final certification`

Required steps:

1. catalog / G6 data quality
2. A2 balance
3. A3 runtime
4. A4 save/versioning
5. A5 PlayCanvas + Android presentation
6. Player Actions content

G6 may be declared `CERTIFIED` only when this exact final HEAD is green and there are 0 A6-owned P0/P1 findings.
