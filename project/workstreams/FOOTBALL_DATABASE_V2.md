# FOOTBALL DATABASE V2 — Architecture and Integration Contract

Status: ARCHITECTURE FROZEN candidate  
Owner: DB-A0  
Baseline: main@b72cb81f993634667ba699086ba8714240d8a27b  
Captured: 2026-09-28 00:04 CEST  
Branch: db-a0/football-database-v2-architecture

## 1. Purpose

Football Database V2 replaces new synthetic football identities with a stable fictional world catalog while preserving every higher-priority invariant of the current game:

1. save compatibility;
2. determinism;
3. authority boundaries;
4. Player Actions;
5. runtime behavior;
6. football data;
7. presentation;
8. polish.

The V2 target is Player Actions + Football Catalog. It is never Player Actions OR Football Catalog.

DB-A0 does not implement the large catalog, balance, market runtime, save migration, platform packaging or mass QA. It freezes the contracts those owners must follow.

---

## 2. Baseline

| Item | Baseline |
| --- | --- |
| MAIN_SHA | b72cb81f993634667ba699086ba8714240d8a27b |
| main timestamp | 2026-09-27 20:52 CEST |
| DB-A0 branch | db-a0/football-database-v2-architecture |
| Player Actions | integrated and certified through PR #822 |
| Player Actions merge commit | 761d14021e00f10b4f7cbf82ffeedd58533c0a4c |
| Old catalog stack head | 1c23712fe88dde8e6cb405de1c48be96ab71b017 |
| Old stack merge-base | 659f23124cfbaf00c6cb956c37cce8473bb6ddd8 |
| Stack divergence vs current main | 68 ahead / 103 behind |
| Initial risk | HIGH |

All PRs #790, #791, #792, #793 and #794 remain open drafts. They are evidence and source material, not an integration branch.

### Initial blockers

- P0: Android offline package does not copy web/club-names.js although web/game-ui.js imports it. V2 would add another dependency if catalog names remain a separate module.
- P1: old #792 uses a fixed age-18 summer external threshold, while current main uses transferRequestExternalMarketThreshold(state, 38) from Player Actions.
- P1: current save format has no footballCatalogVersion contract.
- P1: current save/runtime validation has no catalog referential-integrity contract.
- P1: #794 does not cover all active current-main special identities.
- P2: V1 club prestige and adjacent attributes use per-club variation broad enough to blur intended hierarchy.
- P2: V1 one-club-per-city ID generation cannot represent multi-club cities without an explicit identity extension.

No blocker is ownerless after this document.

---

## 3. Current inventory

### 3.1 Current main

Current main has no integrated world football catalog and no FOOTBALL_CATALOG_VERSION / footballCatalogVersion implementation.

Current authoritative save schema is schemaVersion 8. Player Actions are optional/lazy state on historical saves and are already part of current validation and session behavior.

### 3.2 V1 source inventory

The #790 source contains:

- 528 fictional clubs;
- 17 countries;
- 27 divisions;
- UEFA, CONCACAF, CONMEBOL, AFC and CAF;
- stable-looking club IDs separated from visible names;
- division and country indexes;
- club attributes for prestige, finance, youth, development, pressure and international attraction;
- deterministic generation with no GameState RNG consumption;
- working visible names marked working_name_unchecked.

The V1 structure is reusable. V1 balance, legal-name status and one-club-per-city identity generation are not certified as V2.

### 3.3 Club identity consumers on current main

| Surface | Current authority / usage | V2 rule |
| --- | --- | --- |
| state.club | compatibility/display/current-career mirror used widely by narrative and simulation | must resolve to known current identity or approved legacy identity |
| professional.registrationClub | sporting registration; match/coach/team context | primary sporting club reference |
| professional.ownerClub | contractual owner, especially loans | primary ownership reference |
| world.ownerClub | legacy mirror used by older content and migrations | preserve compatibility; never let it disagree after authoritative transitions |
| fixtures / match-model | club + opponent string; current opponent producer is SIM_OPP_* | new fixtures must carry a catalog opponent identity while historical rows remain loadable |
| offers / CareerTerms | club, ownerClub, registrationClub | catalog supplies identity only; offer authority remains in offers/market |
| market history | persisted before/after terms and destinations | all new V2 catalog references must validate |
| career history | HistoryEntry.club | historical legacy IDs remain accepted |
| age milestones | persisted club snapshots | historical legacy IDs remain accepted |
| injury facts | registrationClub | validate new references; preserve old facts |
| veteran market | approach.club and current employment context | catalog cannot manufacture approach existence |
| epilogue / career summary | aggregates clubs from history/current/market | presentation must resolve both V2 and legacy IDs |
| NPC authority / knowledge | club-scoped authority and memories | compare stable IDs, not display names |
| Player Actions | target eligibility and causal facts use current club/market context | zero authority regression; catalog cannot turn intent into an offer |
| Web / PlayCanvas | formatClubName and generated bundle | presentation names never become persisted identity |
| saves | schema 2–8 input today | V2 persists catalog version and validates references with legacy mode |
| Android | offline ESM graph | every imported presentation module must be packaged and tested |

### 3.4 Legacy and synthetic identity registry

Classification is against current main before V2.

| Identity family | Current classification | Current producer / source | V2 target |
| --- | --- | --- | --- |
| SIM_OPP_* | runtime active | match-model fixtureProjection | compatibility only after G3; no new production |
| Development_* | runtime active | age-18 January loan market | compatibility only after G3 |
| Domestic_* | runtime active | age-18 January transfer market | compatibility only after G3 |
| Summer_* | runtime active | age-18 summer transfer market | compatibility only after G3 |
| Foreign_* | runtime active | continuous market | compatibility only after G3 |
| Loan_* | runtime active | continuous market | compatibility only after G3 |
| Club N · M | runtime active fallback | offer normalization | compatibility only after G3 |
| NEW_CLUB | active canonical narrative alias | 18–20 content | canonical alias, materialize at resolution without editing canonical content |
| DEVELOPMENT_CLUB | active canonical narrative alias | 18–20 content | canonical alias, materialize at resolution |
| HIGHER_CLUB | active canonical narrative alias | 18–20 content | canonical alias, materialize at resolution |
| BIG_CLUB | active alias plus legacy runtime checks | 18–20 content / state classifiers | canonical alias/compatibility; BIG_CLUB flag remains semantic |
| DEVELOPMENT_CLUB_2 | active canonical narrative alias | 18–20 conditional content | canonical alias; missing from old #794 and must be covered |
| FOREIGN_DEV_CLUB | active canonical narrative alias | 18–20 conditional content | canonical alias; missing from old #794 and must be covered |
| Aurora CF | runtime active special identity | professional-adapter STATE20_BIG_RESERVE | must be grounded to V2 catalog identity by DB-A3; old saves keep compatibility |
| UDV | canonical special identity | initial state and many contracts | permanently known canonical special ID; never remap by visible name |

Tests, QA snapshots and historical saves also contain arbitrary fixture/test identities. Those are not production catalog entries and must not be admitted into new production merely because tests use them.

### 3.5 Legacy policy

A1 must provide one explicit reference classifier with at least:

- catalog;
- canonical_special;
- narrative_alias;
- legacy_compat;
- invalid.

Regex alone is insufficient because current main contains named/special identities outside the five generated families.

New V2 production may persist only catalog or canonical_special identities. narrative_alias values may exist physically in canonical content but must materialize before they become a newly persisted career identity. legacy_compat values may be read from old saves/history but may not be newly generated.

---

## 4. Audit of #790–#794

| PR | Purpose | Reusable evidence/code | Obsolete / must reconstruct | Current conflict | V2 owner |
| --- | --- | --- | --- | --- | --- |
| #790 | world catalog V1 | schema shape, indexes, stable-ID intent, country/division structure, deterministic generation, tests | noisy balance, working names, one-club-per-city generated IDs, no save/version contract | must land on current main, not old base | A1 + A2 + A6 |
| #791 | fixture opponents | pure deterministic opponent selector, nearest represented division fallback, no RNG draw | direct patch to older match-model; historical store compatibility must be rechecked | modern match authority/store must remain unchanged except identity enrichment | A3 |
| #792 | early market + presentation | market destination selector, deterministic profiles, generated name table concept | fixed external threshold 38 is obsolete; old package/test wiring must be re-grounded | direct P1 conflict with Player Actions in early-career-market | A3 + A5 |
| #793 | continuous market | draw-to-roll reuse, foreign/loan/domestic catalog destinations without extra draw | direct old-branch runtime patch | must preserve current SUMMER_MARKET_MIN_INTEREST, offers authority and all modern runtime changes | A3 |
| #794 | narrative aliases | pure-hash materialization, no contentIdentity rewrite, zero narrative/football draws | alias set incomplete for current main; resolver patch predates later integrations | DEVELOPMENT_CLUB_2, FOREIGN_DEV_CLUB and Aurora CF are not closed by #794 | A3 |

### Integration decision

Default strategy for every old PR is RE-GROUND / PORT / RECONSTRUCT on current main.

A merge of #790–#794 into main is forbidden as a shortcut.

---

## 5. Conflict map

### 5.1 Textual overlap

Between the old stack unique file set and the 55 files changed on current main since the common merge-base, Git reports two direct overlap files:

- package.json
- src/simulation/early-career-market.ts

Textual overlap is not the full conflict set.

### 5.2 Semantic conflicts

| Severity | Area | Problem | Impact | Owner | Blocks |
| --- | --- | --- | --- | --- | --- |
| P0 | Android | game-ui.js imports club-names.js but build-android-offline does not copy it | offline runtime/publication failure; V2 can add another missing edge | A5 | G5 / DB-GATE-12 |
| P1 | Player Actions / early market | old #792 compares summer producer roll to fixed 38; current main uses transferRequestExternalMarketThreshold(state, 38) | loses certified Player Actions causal effect | A3 | G3 / DB-GATE-10 |
| P1 | save versioning | no footballCatalogVersion persisted | cannot prove catalog-aware deterministic restore/migration | A4 | G4 |
| P1 | referential integrity | current validation accepts club strings without catalog membership contract | invalid V2 IDs could persist silently | A1 + A4 | G1/G4 |
| P1 | aliases | old #794 misses active DEVELOPMENT_CLUB_2, FOREIGN_DEV_CLUB and Aurora CF | synthetic identities survive or become unresolved | A3 | G3 |
| P1 | fixture history | new opponent identity cannot invalidate existing match-model rows that only have opponent text | old saves could fail or be rewritten | A3 + A4 | G3/G4 |
| P1 | owner/registration | identity rewrite can collapse loan owner and registration club | career/contract corruption | A3 | G3 |
| P1 | market authority | catalog selector could accidentally become offer producer | Player Actions/market authority violation | A3 | G3 |
| P1 | RNG | selecting country/club with new draws would shift future careers | determinism regression | A3 + A7 | G3/G7 |
| P2 | balance | V1 deterministic variation can blur prestige hierarchy | implausible football world | A2 | G2 |
| P2 | identity | V1 derives one ID per city and forbids duplicates | cannot safely model multi-club cities | A1 + A6 | G1/G6 |
| P2 | names | all V1 names are working_name_unchecked | commercial/legal presentation risk | A6 | G6 |
| P3 | presentation | short names and locale consistency need final polish | UX only | A6 | G6 |

### Mandatory P1 preservation rule

In current main, age-18 summer market logic must retain:

transferRequestExternalMarketThreshold(state, 38)

The catalog may select the destination identity only after the existing market producer has decided that an external opportunity exists. It cannot replace, bypass or reinterpret that authority.

---

## 6. Football Database V2 contract

### 6.1 Identity

A club identity is an immutable internal ID.

Authority fields:

- FootballClub.id
- FootballClub.countryCode
- FootballClub.divisionId for catalog metadata
- ProfessionalState.registrationClub for sporting registration
- ProfessionalState.ownerClub for contractual ownership
- leagueTier in the live career for sporting level
- current authoritative offer/contract fields for transfer terms

Presentation-only fields:

- name
- shortName
- translated labels
- UI formatting

Never derive persisted identity from:

- visible name;
- division;
- array position;
- prestige;
- city alone.

Existing IDs are never recycled.

### 6.2 Canonical specials and compatibility

UDV is a permanently known canonical special identity even if it is represented outside the generated world array.

Legacy IDs remain readable through an explicit compatibility registry. They are not valid outputs for new V2 producers.

If a catalog ID is ever retired, it must remain as a tombstone/alias entry or receive an explicit immutable ID migration. Never remap a save by matching a display name.

### 6.3 Multi-club cities

A1 owns the stable-ID mechanism. A6 may add multiple clubs in one city only through explicit immutable IDs. It may not regenerate existing IDs from a changed city list.

### 6.4 Ownership model

current club, owner club, registration club and opponent club are different concepts.

- registrationClub answers where the player is registered/playing.
- ownerClub answers who owns the contract during a loan.
- state.club remains the current compatibility/current-career mirror expected by existing systems.
- opponentClubId identifies the opponent in new factual fixtures.

No V2 helper may infer ownerClub from registrationClub when LOAN_ACTIVE is true.

### 6.5 Catalog vs simulation authority

The catalog may provide:

- identity;
- geography;
- division metadata;
- base football attributes;
- selector metadata.

The catalog must not decide:

- whether an offer exists;
- whether the player accepts;
- salary;
- contract duration;
- transfer timing;
- match result;
- selection/captaincy;
- injury/medical clearance;
- retirement;
- narrative outcome.

### 6.6 Fixtures

For newly produced fixtures, DB-A3 must persist a valid catalog opponent identity.

Historical match-model rows without opponentClubId remain valid and immutable.

The current fixture ID, home/away derivation, result authority, stats authority and existing football-cycle cadence are not changed merely to add catalog identity.

### 6.7 Market

Catalog destination selection is an identity projection over an opportunity already authorized by market code.

Early career:

- preserve current producerRoll behavior;
- preserve transferRequestExternalMarketThreshold;
- use the already deterministic destination roll as selector input;
- no new GameState RNG draw.

Continuous market:

- preserve every existing draw and draw order;
- reuse existing destination draws as selector input;
- do not add a country draw and then a club draw;
- if a former unnamed domestic level change becomes named, derive identity from already-consumed values without additional draws.

Offers remain previews until accepted.

### 6.8 Narrative aliases

Canonical event files are not rewritten just to replace aliases.

DB-A3 materializes narrative club aliases at resolution time using a pure deterministic projection. The projection must include enough immutable context to be stable and must consume zero narrative/football RNG draws.

The V2 alias registry must cover all active current-main aliases, not only the four from #794.

contentIdentity and canonical event fingerprints must remain unchanged unless a separate, evidenced migration is approved.

### 6.9 Player Actions

Player Actions facts/intents remain causal signals, not football-world authority.

A transfer request may affect the existing market producer only through its certified bridge. The catalog then identifies a destination if that producer authorizes an opportunity.

The catalog must never turn:

- PLAYER_REQUESTED_TRANSFER
- renewal request
- agent market query
- coach conversation

directly into an offer, contract or transfer.

### 6.10 RNG

V2 selectors have two legal modes:

1. pure hash/projection: zero GameState RNG draws;
2. projection of an already-existing authoritative draw: same number and order of draws as baseline.

Forbidden:

- adding a narrative draw to select a club;
- adding a football draw where the baseline used a hash;
- consuming extra draws for country then club;
- changing draw order for convenience.

DB-GATE-06 compares draw counters and golden results at key market/fixture boundaries.

### 6.11 Determinism

Contract:

same normalized state + same RNG state/seed + same footballCatalogVersion = same selected identities and same subsequent outcome stream.

Catalog arrays and indexes must be immutable at runtime.

### 6.12 Catalog version in saves

footballCatalogVersion is a catalog compatibility version independent from schemaVersion.

Decision: do not bump the global save schema solely to add this field.

Rules:

- every newly serialized V2 save includes footballCatalogVersion equal to the active V2 catalog version;
- pre-V2 saves may omit it on input;
- A4 validates legacy references in compatibility mode before normalizing the in-memory state to the active V2 catalog version;
- a save that declares a known prior catalog version is migrated only through stable identity or an explicit ID migration table;
- display-name matching is forbidden;
- after successful normalization, the next serialized save writes the active V2 version;
- a future unknown catalog version fails with an actionable compatibility error rather than silently reinterpreting IDs.

If A4 discovers a proven format constraint that requires a global schema bump, that is an architecture change and must be reported before implementation.

### 6.13 Referential integrity

A1 owns a single validation API used by runtime producers and A4 save validation.

At minimum new V2 references in these surfaces must be checked:

- state.club;
- professional.ownerClub;
- professional.registrationClub;
- new fixture opponentClubId;
- offer CareerTerms club/owner/registration;
- market history/future agreements;
- persisted injury registrationClub;
- veteran market club;
- new history or milestone club references when produced after V2.

Negative certification case:

ESP_FAKE_CLUB_999 must fail when presented as a new V2 catalog reference.

Historical legacy values remain loadable only through explicit compatibility classification.

### 6.14 Balance

A2 owns balance, not A1 and not A3.

The V2 hierarchy must encode at least:

- league strength;
- club prestige;
- finance;
- youth;
- development;
- pressure;
- international attraction;
- selector archetypes.

Variation may be deterministic but must not overwhelm tier/league/club hierarchy. A2 must publish distribution tests and boundary examples.

---

## 7. Ownership freeze

### DB-A1 — Schema / Catalog Integrity

Owns:

- types;
- stable IDs;
- indexes;
- invariants;
- catalog lookup;
- known-reference classifier;
- validators;
- country/division/club referential integrity.

Forbidden: market behavior, offer probability, save migration policy implementation.

### DB-A2 — Football Data / Balance

Owns:

- prestige;
- league strength;
- archetypes;
- finance;
- youth;
- development;
- elite/continental profiles;
- selector profile calibration.

Forbidden: runtime market authority.

### DB-A3 — Runtime / Market / Player Actions

Owns:

- fixtures/opponents;
- early market destination identity;
- continuous market identity;
- aliases;
- Aurora CF and other active synthetic producer closure;
- Player Actions compatibility;
- RNG preservation;
- owner/registration semantics.

Forbidden: changing Player Actions authority, save schema/version policy, broad UI/Android work.

### DB-A4 — Save / Versioning / Migration

Owns:

- footballCatalogVersion persistence;
- pre-V2 and prior-catalog normalization;
- backwards compatibility;
- reference migrations/tombstones;
- catalog-aware save validation.

Forbidden: balance and market tuning.

### DB-A5 — PlayCanvas / Android / Presentation

Owns:

- visible club names;
- generated catalog-name presentation data;
- browser/PlayCanvas bundle;
- Android offline module graph;
- APK packaging;
- platform tests.

Mandatory first platform fix: package web/club-names.js and any V2 catalog-name module in Android, and add an import-graph assertion.

### DB-A6 — Data Expansion / Polish

Owns:

- multi-club cities;
- short names;
- justified additional countries;
- legal-name lint;
- presentation/data polish.

May not rename or recycle an existing stable ID.

### DB-A7 — QA / Stress Certification

Owns:

- structural QA;
- saves;
- RNG;
- deterministic replay;
- fixtures;
- market;
- Player Actions;
- browser/PlayCanvas/Android;
- long-career stress;
- final gate report.

A7 does not add features.

### DB-A8 — Final Integration

Owns:

- clean integration branch;
- serialized merge train;
- release candidate;
- final gate aggregation.

A8 implements no new feature.

---

## 8. Dependency DAG

A6 is deliberately decoupled from the critical path to A3, with an additive-only constraint.

A0
├── A1
├── A2
└── A6

A1 + A2
    ↓
   A3
  ├── A4
  └── A5

A1 → A6

A4 + A5 + A6
      ↓
     A7
      ↓
     A8
      ↓
     main

Reason for decoupling A6:

A3 needs a frozen schema/index contract and calibrated selector semantics, but does not need final short names or every optional country. A6 may work in parallel after A1. After G1 it is additive-only: no existing ID rename/removal/recycling. If A6 changes selector pools, A7 must regenerate deterministic V2 baselines before certification.

---

## 9. Serialized merge train

### G0 — Architecture contracts — DB-A0

Predecessor: main@b72cb81f993634667ba699086ba8714240d8a27b

Allowed:

- project/workstreams/FOOTBALL_DATABASE_V2.md
- architecture-only CI/docs if strictly necessary

Forbidden:

- runtime feature ports;
- balance changes;
- save schema changes.

Tests: documentation/integrity checks only.  
Migration impact: none.  
RNG impact: none.  
Save impact: none.

### G1 — Catalog / schema — DB-A1

Predecessor: G0

Allowed:

- src/catalog/football/**
- catalog structural tests/workflow
- narrow shared type additions required by catalog contract

Forbidden:

- market/simulation behavior;
- save migration implementation;
- UI/Android.

Expected tests:

- unique stable IDs;
- division/country consistency;
- index immutability;
- invalid reference rejection;
- canonical-special and legacy classification.

Migration impact: contract only, no bulk rewrite.  
RNG impact: zero.  
Save impact: no save mutation.

### G2 — Data / balance — DB-A2

Predecessor: G1

Allowed:

- catalog data and attribute calibration;
- balance fixtures/tests.

Forbidden:

- market producer logic;
- Player Actions;
- saves;
- platforms.

Expected tests:

- league hierarchy distributions;
- prestige ordering;
- selector profile sanity;
- deterministic data generation.

Migration impact: none.  
RNG impact: zero GameState draws.  
Save impact: none.

### G3 — Runtime integration — DB-A3

Predecessor: G2

Allowed, narrowly:

- src/simulation/match-model.ts
- src/simulation/early-career-market.ts
- src/simulation/world-simulator-core.ts
- required offer/employment/professional-adapter integration
- src/narrative/resolver.ts
- catalog runtime selectors
- targeted tests

Forbidden:

- global save migration policy;
- Android packaging;
- broad balance changes;
- Player Actions authority redesign.

Expected tests:

- fixture IDs/home-away/results/stats unchanged except identity enrichment;
- no new SIM_OPP/new synthetic market IDs;
- transferRequestExternalMarketThreshold preserved;
- offer existence/salary/duration authority unchanged;
- all active aliases materialize;
- exact RNG draw-count comparisons;
- zero-action Player Actions equivalence.

Migration impact: none yet; historical rows remain readable.  
RNG impact: must be draw-equivalent to baseline.  
Save impact: new runtime rows may contain V2 IDs; G4 follows before release.

### G4 — Persistence / versioning — DB-A4

Predecessor: G3

Allowed:

- src/save/**
- GameState field required for footballCatalogVersion
- migration fixtures/tests
- explicit club-ID compatibility registry integration

Forbidden:

- market tuning;
- balance;
- presentation.

Expected tests:

- schema 2–8 legacy load;
- representative legacy synthetic IDs;
- missing footballCatalogVersion normalization;
- prior known catalog version;
- unknown catalog version failure;
- save/load replay.

Migration impact: explicit.  
RNG impact: zero draws.  
Save impact: footballCatalogVersion persisted on new writes.

### G5 — Platforms / presentation — DB-A5

Predecessor in merge train: G4. Development may start after G3 in parallel with A4 and rebase before merge.

Allowed:

- web/club-names.js
- generated catalog-name module/generator
- scripts/build-playcanvas.mjs
- PlayCanvas manifest/artifact generation
- scripts/build-android-offline.mjs
- Android platform tests/assets packaging
- presentation tests

Forbidden:

- market authority;
- save migration semantics;
- club balance.

Expected tests:

- 100% active catalog IDs resolve to presentation names;
- legacy IDs still format safely;
- PlayCanvas bundle includes catalog names;
- Android complete ESM import graph;
- offline/no-network contract;
- APK build.

Migration impact: none.  
RNG impact: none.  
Save impact: presentation never writes names as identity.

### G6 — Data polish — DB-A6

Predecessor: G5

Allowed:

- additive explicit club identities;
- multi-club-city additions;
- short names;
- legal-name lint;
- justified country additions;
- data/presentation tests.

Forbidden:

- rename/recycle existing IDs;
- runtime market behavior.

Expected tests:

- legal-name lint;
- unique IDs/names as defined;
- stable existing identity snapshot;
- no illegal selector mutation.

Migration impact: none unless an explicit architecture exception is approved.  
RNG impact: no new draws; selector output baselines may change because pool contents change and must be re-certified.  
Save impact: existing IDs remain valid.

### G7 — QA fixes / certification — DB-A7

Predecessor: G6

Allowed:

- QA tests/workflows/reports;
- minimal owner-approved fixes.

Forbidden:

- features;
- silent authority redesign.

Expected tests: DB-GATE-01 through DB-GATE-15.

Migration impact: validation only.  
RNG impact: certified.  
Save impact: certified.

### G8 — Release candidate — DB-A8

Predecessor: G7

Allowed:

- clean integration/rebase;
- release evidence;
- no-feature conflict resolution.

Forbidden: new features.

Expected tests: all 15 gates on exact release SHA.  
Migration impact: none beyond G4.  
RNG impact: unchanged from certified G7.  
Save impact: unchanged from certified G7.

No generation may skip its predecessor or absorb another owner's feature work without an explicit architecture note.

---

## 10. Acceptance gates

### DB-GATE-01 BUILD

npm run build passes on exact candidate SHA.

### DB-GATE-02 CATALOG STRUCTURE

- unique immutable IDs;
- valid visible and short names;
- valid divisions;
- country/confederation consistency;
- index immutability.

### DB-GATE-03 REFERENTIAL INTEGRITY

- every new V2 club reference is known;
- ESP_FAKE_CLUB_999 is rejected as a new V2 catalog reference;
- no new producer emits an unclassified club identity.

### DB-GATE-04 LEGACY SAVE

- supported historical schema 2–8 fixtures load;
- representative SIM_OPP, Development, Domestic, Summer, Foreign, Loan, narrative aliases and named legacy cases load in compatibility mode;
- no history rewrite by visible name.

### DB-GATE-05 CATALOG VERSIONING

- new saves persist footballCatalogVersion;
- missing pre-V2 field normalizes;
- known prior version migrates explicitly;
- unknown future version fails safely.

### DB-GATE-06 RNG

- no new narrative/football draws from pure catalog reads;
- every old market draw retained in count/order;
- golden draw counters pass at market and fixture boundaries.

### DB-GATE-07 DETERMINISM

Same normalized state + same seed/RNG state + same catalog version produces identical catalog identities and subsequent replay.

### DB-GATE-08 FIXTURES

- new opponents are valid catalog identities;
- no new SIM_OPP production;
- fixture.id, homeAway, result and stat authority remain stable;
- historical rows without opponentClubId remain valid.

### DB-GATE-09 MARKET

- new destinations are valid;
- no new Development_, Domestic_, Summer_, Foreign_, Loan_ or Club N · M production;
- offer existence, salary, duration, accept/reject and loan ownership remain authoritative;
- current SUMMER_MARKET_MIN_INTEREST behavior retained.

### DB-GATE-10 PLAYER ACTIONS

- transferRequestExternalMarketThreshold preserved;
- zero-action equivalence passes;
- Player Actions facts remain facts/intents;
- no Player Action directly synthesizes offer/contract/transfer through catalog code;
- existing Player Actions certified suites remain green.

### DB-GATE-11 PLAYCANVAS

- generated bundle is fresh;
- catalog presentation data included;
- club formatter resolves new and legacy identities;
- Player Actions UI remains green.

### DB-GATE-12 ANDROID

- offline ESM dependency graph complete;
- club-names and catalog-name dependencies packaged;
- no network dependency;
- offline tests pass;
- APK build passes.

### DB-GATE-13 LONG CAREERS

Full careers reach terminal/epilogue without invalid club references, crashes or synthetic new-production leakage.

### DB-GATE-14 SAVE/LOAD REPLAY

Save/load preserves current, owner, registration and opponent identity plus catalog version and deterministic continuation.

### DB-GATE-15 FULL REGRESSION

Repository integrity and existing full suites pass on exact release candidate SHA.

---

## 11. QA contract for DB-A7

### 11.1 PR suite

Target: 600 complete careers if CI cost permits.

Six policies, 100 seeds each:

1. zero Player Actions;
2. low-frequency optional actions;
3. transfer-request-heavy;
4. contract/agent-heavy;
5. loan/abroad-biased state setup;
6. long-career/veteran-heavy.

Add directed fixtures for every legacy identity family and every active narrative alias.

### 11.2 Certification suite

Target: 6,000 complete careers; acceptable range 5,000–10,000 if infrastructure permits.

Suggested split:

- 1,000 zero-action;
- 1,000 normal mixed Player Actions;
- 1,000 transfer-request/market;
- 1,000 loan/abroad;
- 1,000 save/reload checkpoints;
- 1,000 veteran/retirement.

Stratify seeds across early, middle and late career outcomes rather than one contiguous lucky range.

### 11.3 Required probes

- structural catalog lint;
- all lookup/index invariants;
- negative invalid-ID injection;
- schema 2–8 save fixtures;
- pre-V2 and prior-version catalog normalization;
- fixture stress;
- early and continuous market stress;
- alias materialization;
- Player Actions zero-action and causal market bridge;
- RNG draw counters;
- deterministic replay;
- browser;
- PlayCanvas;
- Android offline;
- APK;
- epilogue/career-summary club aggregation;
- 5k–10k full careers in certification workflow.

### 11.4 Failure policy

P0/P1 failure blocks certification.

A7 must identify owner and reproduce before a fix. A7 may make only narrow QA/integration-owned fixes; feature-level repair returns to A1–A6 and requires re-certification of affected downstream generations.

---

## 12. Frozen architectural decisions

1. Old #790–#794 are source/evidence, not merge vehicles.
2. V2 is rebuilt on current main.
3. Player Actions behavior is preserved.
4. Catalog supplies identity/metadata, never offer or narrative authority.
5. No new RNG draw is introduced to select clubs/opponents.
6. All active synthetic producers are closed, including identities not covered by #794.
7. Canonical narrative content is not rewritten merely to replace aliases.
8. New V2 production uses catalog/canonical-special IDs; legacy values are read-only compatibility.
9. footballCatalogVersion is persisted independently from schemaVersion.
10. No ID is derived from display name, division or array index.
11. No existing stable ID is recycled.
12. Android import graph is a release gate.
13. A6 is non-blocking for A3 only while additive-only.
14. A8 integrates; it does not invent features.

---

## 13. DB-A0 handoff

Immediately unblocked after G0:

- DB-A1 — Schema / Catalog Integrity
- DB-A2 — Football Data / Balance
- DB-A6 — Data Expansion / Polish, subject to A1 identity contract

DB-A3 begins only after G1 + G2 are integrated on the serialized train.

DB-A4 and DB-A5 may develop in parallel after G3, then merge serially as G4 and G5.

DB-A7 begins after G4 + G5 + G6 are integrated.

DB-A8 begins only after A7 certification.

---

## 14. DB-A0 Definition of Done checklist

- [x] current main HEAD identified
- [x] #790–#794 status and code audited
- [x] stack divergence measured
- [x] current Player Actions integration identified
- [x] catalog/runtime inventory completed
- [x] authoritative club consumers grouped
- [x] active legacy/synthetic identities classified
- [x] textual and semantic conflicts mapped
- [x] Android packaging issue assigned
- [x] catalog versioning contract defined
- [x] referential-integrity contract defined
- [x] ownership A1–A8 frozen
- [x] dependency DAG frozen
- [x] merge train defined
- [x] DB-GATE-01..15 defined
- [x] QA contract defined
- [x] architecture documentation created
- [ ] architecture PR opened
- [ ] PR CI green on exact HEAD
- [x] zero architecture blockers without owner

DB-A0 becomes COMPLETE only after the last two unchecked items are satisfied.

FOOTBALL DATABASE V2 is not complete at DB-A0. That declaration is reserved for DB-A7 + DB-A8 final certification.
