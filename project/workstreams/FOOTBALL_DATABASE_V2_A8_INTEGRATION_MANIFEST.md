# DB-A8 — Football Database V2 Integration Manifest

## A8 start

- MAIN_SHA: `f3d8b1f90e70d0e2daeb4e2fbae35173f18a3923`
- certified product SHA: `4602df6df376c02ea50e8c5bba1c8b093d2c4770`
- G7 certified QA SHA: `632f04e5f90e3c1deac128a09abdf7c04e46b28b`
- branch: `db-a8/football-database-v2-release`
- catalog: 528 clubs / 17 countries / 27 divisions
- footballCatalogVersion: `world-v2-a2-2026-09-28`
- known P0: 0
- known P1: 0

The product stack was integrated to `main` through PR #862. The A7 branch remains QA/evidence only and is not a product merge vehicle.

## Generation manifest

### G0 — DB-A0 architecture

- PR: #860
- branch: `db-a0/football-database-v2-architecture-main2`
- current HEAD: `20e42b1c8df976d3819213758ea393918a870b02`
- original current-main base: `112bd95279f1397c54f69f3d17c25871035bba48`
- merge status: open / not merged directly
- certified/integration status: architecture evidence; direct merge superseded by full-stack reconciliation #862
- files changed: `.github/workflows/repository-integrity.yml`, `project/workstreams/FOOTBALL_DATABASE_V2.md`
- tests/evidence: T51 A5 K PASS, Player Actions A5 PASS, targeted T5 authority suites PASS; repository-integrity rerun on the evidence branch is non-product
- dependency: current-main architecture contract

### G1 — DB-A1 schema / integrity

- PR: #861
- branch: `db-a1/football-catalog-integrity-main2`
- current HEAD: `230a68d193a88266eca8a8b3ec62b46c2b4f5789`
- base: G0 branch
- merge status: open / not merged directly
- certified/integration status: Football catalog PASS; product realization is included through #862
- files changed: catalog workflow, A1 handoff, catalog tests, identity/index/integrity/types/world
- tests/evidence: Football catalog PASS, T51 A5 K PASS, Player Actions A5 PASS
- dependency: G0 contract

### G2 — DB-A2 balance

- PR: #829 (historical full A2 contract)
- branch: `db-a2/football-data-balance`
- certified HEAD: `ee5e0bd15bbce97c43f1b6f584e06b93c8ccc3a4`
- base at latest PR state: current main baseline
- merge status: open / not merged directly
- certified/integration status: Balance PASS + Catalog integrity PASS + Repository integrity PASS; current-main realization carried by #856 and integrated through #862
- files changed: balance/catalog workflows and tests, balance + catalog identity/integrity/types/world, package/docs
- tests/evidence: Football Database V2 Balance PASS, Catalog integrity PASS, Repository integrity PASS, Player Actions regressions PASS
- dependency: G1 schema/integrity

### G3 — DB-A3 runtime

- PR: #856
- branch: `db-a3/runtime-football-v2-main-reground`
- certified HEAD: `d2873bb60fea8eec249bd5e1531240753a15d418`
- base: `main@112bd95279f1397c54f69f3d17c25871035bba48`
- merge status: open / not merged directly; source overlaid into #862
- certified status: CERTIFIED on current-main realization
- files changed: V2 runtime/balance/integrity tests and workflows; catalog selectors/aliases; narrative resolver; employment/offers/professional/world simulation
- tests/evidence: Main reground PASS, Repository integrity PASS, Market Contract Authority PASS, catalog PASS, targeted T5 suites PASS
- dependency: G1 + G2 contracts

### G4 — DB-A4 save / versioning

- PR: #845
- branch: `db-a4/save-catalog-versioning-regrounded`
- certified HEAD: `f93953d377d5203078cca0668330a522f8f65604`
- base: G3 regrounded chain
- merge status: open / not merged directly; current-main equivalent integrated through #862
- certified status: G4 CERTIFIED
- files changed: save workflow, package, A4 workstream doc, save/version tests, initial state/core types, catalog reference validation/version/save/validation
- tests/evidence: Save versioning PASS, Player Actions A5 PASS, T51 A5 K PASS, offer-session bridge PASS
- dependency: G3 runtime

### G5 — DB-A5 platforms

- PR: #851
- branch: `db-a5/football-presentation-g5-regrounded`
- certified HEAD: `993cb1d69c2481515e1af3d273dbcfd5141745c0`
- base: G4 certified HEAD
- merge status: open / not merged directly; current-main equivalent integrated through #862
- certified status: G5 CERTIFIED
- files changed: platforms workflow, package, Android/PlayCanvas build scripts, platform/name tests, `web/club-names.js`
- tests/evidence: Presentation/platforms PASS, Player Actions A5 PASS, T51 A5 K PASS, offer-session bridge PASS
- dependency: G4 save/versioning

### G6 — DB-A6 data polish

- PR: #854
- branch: `db-a6/football-data-polish-g5-regrounded`
- certified HEAD: `14dcb9fabd8ed3ac1d5d4164492cadf1e2960616`
- base: G5 certified HEAD
- merge status: open / not merged directly; current-main equivalent integrated through #862
- certified status: G6 CERTIFIED
- files changed: data-polish workflow/doc, catalog test, `src/catalog/football/world.ts`
- tests/evidence: G6 final-stack PASS, Player Actions A5 PASS, T51 A5 K PASS
- dependency: G5 platforms

### G7 — DB-A7 QA evidence

- PR: #863
- branch: `db-a7/football-v2-final-certification-full-stack`
- certified HEAD: `632f04e5f90e3c1deac128a09abdf7c04e46b28b`
- base: certified product branch #862 at `4602df6df376c02ea50e8c5bba1c8b093d2c4770`
- merge status: open / QA-only, intentionally not merged as product
- certified status: **G7 CERTIFIED — 15/15 PASS, P0=0, P1=0**
- files changed: final-full-stack workflow, A7 certification doc, producer audit
- tests/evidence: Final 15/15 certification run `36404241968` PASS; Player Actions A5 PASS; T51 A5 K PASS
- dependency: exact #862 product candidate

## Product integration vehicle

### #862 — full current-main reconciliation

- branch: `db-v2/reconcile-main-full-stack-20260928`
- certified product HEAD: `4602df6df376c02ea50e8c5bba1c8b093d2c4770`
- base: `main@112bd95279f1397c54f69f3d17c25871035bba48`
- merge status: **MERGED**
- main merge SHA: `f3d8b1f90e70d0e2daeb4e2fbae35173f18a3923`
- merge method: merge commit
- repository integrity run `36403916827`: PASS
- dedicated Football Database V2 gates: PASS
- downstream G7: 15/15 PASS

This PR is the actual product integration vehicle. Historical generation PRs are provenance/evidence, not additional merge inputs for A8.

## Main drift analysis

### Certified product → current main

Compare:

`4602df6df376c02ea50e8c5bba1c8b093d2c4770` → `f3d8b1f90e70d0e2daeb4e2fbae35173f18a3923`

- commit drift: +1 merge commit
- file drift: **0 files**
- Player Actions drift: none
- market drift: none
- saves drift: none
- PlayCanvas drift: none
- Android drift: none
- classification: **SAFE**

### Current main ↔ G7 QA evidence

G7 contains exactly three QA-only additions not present in product main:

- `.github/workflows/football-database-v2-final-full-stack.yml`
- `docs/football-database-v2-a7-final-full-stack.md`
- `scripts/audit-football-v2-producers.mjs`

These are QA/evidence files. They are not required product runtime.

Classification: **RETEST_ONLY / QA-ONLY**

## Drift classification

- SAFE: merge-commit-only drift between certified product and current main; zero file differences
- RETEST_ONLY: G7 QA workflow/doc/audit remain outside product main
- SEMANTIC_CONFLICT: none
- BLOCKER: none

## Clean merge plan

1. Use current `main@f3d8b1f90e70d0e2daeb4e2fbae35173f18a3923` as the A8 release base.
2. Do not merge historical G0–G6 branches again; their product content is already reconciled by #862.
3. Keep G7 as QA/evidence; do not import QA-only runtime by default.
4. Rebuild PlayCanvas, presentation manifests and Android offline assets from the A8 release branch.
5. Verify generated artifact freshness and package equivalence.
6. Freeze an exact A8 release-candidate SHA.
7. Run final release regression on that exact SHA.
8. Open the final release PR only after Pass 3 is green.

## Pass 1 result

DB-A8 — PASS 1 COMPLETE

- PROGRESS: **25%**
- PASSES: **1 / 4**
- PASSES ESTIMATED REMAINING: **3**
- semantic changes added by A8: **0**
- blockers: **0**
- next: **Build clean release candidate**
