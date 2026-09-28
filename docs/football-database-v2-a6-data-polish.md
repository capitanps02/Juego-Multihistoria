# DB-A6 — Football Database V2 · Data polish / expansion

## Regrounded baseline

- Main baseline: `b72cb81f993634667ba699086ba8714240d8a27b`
- Current A1 HEAD: `1b0992bc6df38d05a4b8061c748ff17aa08a3d65`
- Current regrounded A2 HEAD: `26c4fa6c09e0fb1191dadf289f622be0604d9ba4`
- Branch: `db-a6/football-data-polish-regrounded`
- Catalog: 528 clubs, 27 divisions, 17 countries, 5 confederations.
- Existing IDs are immutable.
- Market runtime, saves, Player Actions authority and GameState RNG are out of scope.

The previous A6 draft (#831) proved the same data-polish patch against the older A2 stack and its triggered catalog/balance and Player Actions workflows passed. This branch ports the patch onto the regrounded A1/A2 chain.

## Pass 1 — data-quality audit

All 528 generated clubs were reviewed.

Measured findings:

- duplicate full names: 0;
- duplicate short names: 0;
- duplicate-like high-similarity pairs (threshold 0.84): 2 before polish, 0 after polish;
- names above the 22-character mobile short-name budget: 11;
- mechanically truncated / awkward short names: 11;
- required multi-club review cities currently contain one catalog club each;
- Brazil is the clearest high-value geographic gap.

The 11 overflows are:

1. Wolverhampton Riverside
2. Clermont-Ferrand Étoile
3. Castelo Branco Navegante
4. Viana do Castelo Ribeira
5. Alphen aan den Rijn Noord
6. Ciudad de México Estrella
7. San Miguel de Tucumán Plata
8. Santiago del Estero Central
9. San Salvador de Jujuy Cóndor
10. Comodoro Rivadavia Horizonte
11. Pietermaritzburg Plains

## Pass 2 — names / short names / multi-club review

Mechanical token slicing is removed. Every current overflow has an explicit human-reviewed compact label. Any future overflow without an explicit reviewed label fails fast during catalog construction.

Reviewed labels:

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

Two duplicate-like visible names are explicitly disambiguated:
- `Chester Riverside` → `Chester Crown`;
- `Guangzhou Northern` → `Guangzhou Jade`.

No club ID, city, division, coefficient, archetype or selector contract is changed. The 528-ID fingerprint remains identical.

Multi-club candidates reviewed:

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

Decision: do not add second clubs during this G6 port. A1's explicit immutable-ID mechanism is present and verified, but adding clubs now would alter division sizes and selector pools and would require A7 to regenerate deterministic selector baselines. Candidate additions are deferred to V2.1 unless explicitly approved in the merge train.

## Pass 3 — geographic expansion / legal-risk lint

No country is added in G6.

Priority for V2.1:

1. Brazil
2. Austria / Switzerland / Denmark / Croatia / Greece
3. Colombia / Chile
4. South Korea / Saudi Arabia

A country addition is considered valid only with coherent division structure, city set, club-band/profile distribution, names, attributes and selector regression. Token expansion for map coverage alone is rejected.

Legal-risk lint covers normalized forms of:

- well-known real-club identities;
- major competition names;
- governing-body names;
- obvious sponsor/brand tokens.

This is risk detection only. Every club remains `working_name_unchecked`; no legal clearance is claimed.

## Identity / determinism

The sorted set of the 528 existing catalog club IDs has FNV-1a fingerprint:

`0de3b9f6`

G6 tests pin this value.

G6 also statically rejects use of:

- `Math.random`;
- `rng.next/float/int`;
- `GameStateRng`

inside the catalog generator.

RNG impact: 0 new GameState draws.

## G5 dependency status

A5 now has a new draft PR (#842) on top of A4, but its current football catalog source still reflects an older implementation than the regrounded A1/A2 chain. It is therefore not yet a valid final G5 predecessor for G6 certification.

G6 may validate independently on A2 because its patch is additive/presentation-only and does not change selector pools. Final Pass 4 certification still requires the serialized G5 stack and exact final-stack CI.

## Pass 4 — certification status

Independent G6 gate covers:

- build;
- A1 catalog/integrity regression;
- A2 balance regression;
- G6 short-name regression;
- duplicate-like name disambiguation regression;
- stable existing-ID fingerprint;
- legal-risk lint;
- 0 GameState RNG draws;
- Player Actions content regression.

Final G6 state remains `BLOCKED` until the correct G5 predecessor is available and final stacked CI is green.


## Final-stack restack — 2026-09-28

G6 has been reapplied on the exact G5 candidate `993cb1d69c2481515e1af3d273dbcfd5141745c0`.

Verified before port:
- `src/catalog/football/world.ts` blob was identical in A2 and G5;
- `scripts/test-football-catalog.mjs` blob was identical in A2 and G5;
- therefore the G6 patch does not overwrite A3/A4/A5-owned changes.

Final-stack certification now reruns catalog, balance, runtime, saves, presentation/Android offline and Player Actions content before G6 can be declared ready.
