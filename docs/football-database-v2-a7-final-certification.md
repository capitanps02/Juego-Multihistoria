# Football Database V2 — A7 final certification

## Purpose

A7 is certification-only. It introduces no gameplay, market, save, RNG or catalog-data authority.
Its job is to turn the Football Database V2 acceptance criteria into one reproducible 15/15 gate.

Baseline under certification:

- predecessor: `db-v2/reconcile-main-20260928` / PR #853;
- catalog scope: 528 clubs, 17 countries, 27 divisions;
- catalog version: `world-v2-a2-2026-09-28`;
- save schema: 8 with optional `footballCatalogVersion` for historical compatibility.

## 15 acceptance contracts

| ID | Contract | Automated evidence |
|---|---|---|
| C01 | TypeScript build and module graph compile | `npm run build` |
| C02 | Catalog scope, stable identity, structural integrity, corruption rejection and name-risk lint | `test-football-catalog.mjs` |
| C03 | Division hierarchy, coefficient variance and eight archetype families remain calibrated | `test-football-catalog-balance.mjs` |
| C04 | Fixtures select real catalog identities without new RNG authority | `test-catalog-fixture-opponents.mjs` |
| C05 | Market destinations select catalog clubs with deterministic existing rolls | `test-catalog-market-destinations.mjs` |
| C06 | Home/foreign/loan market routes remain covered by catalog identities | `test-catalog-world-market-routes.mjs` |
| C07 | All six canonical club aliases materialize deterministically and never persist as aliases | `test-catalog-narrative-club-aliases.mjs` |
| C08 | Offers and age-18 market authority remain formal-authority owned and catalog backed | offer + age-18 regression suites |
| C09 | Runtime contains zero synthetic club producers; only two certified `Foreign_*` legacy readers remain | `audit-football-v2-producers.mjs` |
| C10 | New V2 saves carry the catalog marker and reject illegal/synthetic persisted refs | V2 persistence regression |
| C11 | Historical schema-8 saves remain readable without heuristic club remapping | existing save/persistence regressions |
| C12 | Player Actions facts remain intents only and do not steal market authority | Player Actions narrative bridge regression |
| C13 | Shared UI renders all catalog IDs as fictional display names and hides unknown internal IDs | club-name regression |
| C14 | PlayCanvas package remains engine/state/RNG equivalent | PlayCanvas build + regression |
| C15 | Android offline package remains self-contained and equivalent, including club-name modules | Android offline build + regression |

## Fail-closed producer policy

The production sweep covers:

- `src/simulation/match-model.ts`;
- `src/simulation/early-career-market.ts`;
- `src/simulation/world-simulator-core.ts`;
- `src/simulation/offers.ts`;
- `src/simulation/professional-adapter.ts`;
- fixture, market and narrative-alias catalog selectors.

Forbidden producer families include:

- `SIM_OPP_*`;
- `Development_*`;
- `Domestic_*`;
- `Summer_*`;
- `Loan_*`;
- new `Foreign_*`;
- `Aurora CF`;
- formatted `Club N · M`.

The only allowed legacy `Foreign_*` occurrences are two read-only compatibility classifiers already audited in the runtime. Any additional occurrence fails C09.

## Certification rule

A7 is **15/15 only when every C01–C15 step is green on the exact A7 HEAD**.
No partial score is considered certified, and A7 must not be merged before predecessor #853 is green and integrated.
