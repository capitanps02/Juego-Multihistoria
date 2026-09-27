# DB-A6 — Football Database V2 · Data polish / expansion

## Baseline

- BASE_SHA: `b72cb81f993634667ba699086ba8714240d8a27b`
- A1 contract/source reviewed: `9ef7369db5a0adc7bafc6c7b3ee0a81b8a725e66`
- A2 working HEAD used as data baseline: `14acd8dcf3fa048453047dab705beb98dccb7a6d`
- Branch: `db-a6/football-data-polish`
- Catalog baseline: 528 clubs, 27 divisions, 17 countries, 5 confederations.
- Existing IDs are immutable. Market runtime, saves, Player Actions and GameState RNG are out of scope.

## Pass 1 — data-quality audit

Reviewed all 528 generated clubs.

Findings:

- duplicate full names: 0;
- duplicate short names: 0;
- names longer than the mobile short-name budget: 11;
- mechanically truncated / awkward short names: 11;
- all required multi-club review cities currently have exactly one catalog club;
- current country set: ESP, ENG, ITA, DEU, FRA, PRT, NLD, BEL, USA, MEX, ARG, JPN, CHN, TUR, NOR, MAR, ZAF;
- Brazil is the clearest high-value geographic gap.

The 11 overflows were:

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

Mechanical slicing is removed. Every current overflow now has an explicit human-reviewed short label and any future unreviewed overflow fails fast during catalog construction.

No existing club ID, full display name, city, division, coefficient, archetype or selector contract is changed.

Multi-club opportunities reviewed:

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

Decision for V2 G6: **do not add second clubs yet**. Adding them now would change division sizes and selector pools while A2/A3 are still being certified and G5 presentation is not yet available. A1's explicit immutable-ID mechanism is already verified, so the capability is ready; actual additions are deferred to V2.1 unless the merge train explicitly approves the pool change and A7 re-certifies deterministic baselines.

## Pass 3 — geographic expansion / legal lint

### Country decision

No country is added in G6.

Brazil is the primary V2.1 candidate. Austria, Switzerland, Denmark, Croatia, Greece, Colombia, Chile, South Korea and Saudi Arabia remain secondary candidates.

Reason for deferral: a useful country addition requires a coherent division, club-band distribution, cities, names, coefficients and selector re-certification. Adding a token country solely to increase the map count is rejected.

### Legal-risk lint

The existing exact-name checks are retained and a normalized G6 lint adds detection coverage for:

- well-known real-club identities;
- major competition names;
- governing-body names;
- obvious sponsor/brand tokens.

This is risk detection only. Every club remains `working_name_unchecked`; no legal clearance is claimed.

## Identity / determinism guard

The sorted set of the 528 pre-G6 catalog club IDs has FNV-1a fingerprint:

`0de3b9f6`

G6 tests pin this fingerprint, so any accidental rename/removal/recycling of an existing ID fails.

G6 consumes 0 GameState RNG draws.

## Pass 4 — certification status

Repository-level certification must run on the exact final stacked HEAD after G5 is available. The branch already adds regression coverage for:

- explicit mobile short names;
- no mechanical truncation fallback;
- immutable existing ID set;
- legal-risk lint;
- existing A1/A2 catalog tests.

Until the exact final stacked CI is green, G6 must remain **BLOCKED**, not certified.
