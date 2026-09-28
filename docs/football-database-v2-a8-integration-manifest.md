# DB-A8 — Football Database V2 final integration manifest

Status: **PASS 1 COMPLETE**

- Progress: **25%**
- Passes: **1 / 4**
- Estimated passes remaining: **3**
- Clean A8 branch: `db-a8/football-database-v2-release-main2`
- A8 branch base: `main@1c31c97b7c5cd415e470e41c1935627b0d78aed4`
- Certified product integration vehicle: PR **#862**
- Certified product HEAD: `4602df6df376c02ea50e8c5bba1c8b093d2c4770`
- G7 certification evidence: PR **#863**
- G7 QA HEAD: `632f04e5f90e3c1deac128a09abdf7c04e46b28b`
- G7 result: **15/15 PASS**
- Release-blocking findings at G7: **P0 = 0 known, P1 = 0 known**

This document records provenance and drift. It does not introduce gameplay,
balance, market, save, RNG, presentation, PlayCanvas or Android authority.

## Canonical current-main integration vehicle

PR #862 is the product integration vehicle that reconciled the complete
Football Database V2 payload onto the then-current main.

- branch: `db-v2/reconcile-main-full-stack-20260928`
- base: `main@112bd95279f1397c54f69f3d17c25871035bba48`
- HEAD: `4602df6df376c02ea50e8c5bba1c8b093d2c4770`
- merge commit: `f3d8b1f90e70d0e2daeb4e2fbae35173f18a3923`
- state: **MERGED**
- exact-head dedicated V2 gates: **ALL GREEN**
- Repository Integrity run `36403916827`: **SUCCESS**
- files changed: 43
- role: carries the current-main A2/A3 core plus the A4–A6 reconciliation
  while preserving unrelated current-main product work.

Historical generation PRs remain provenance/certification records where
explicitly noted below; they are not replayed over current main.

## G0 — DB-A0 architecture

- PR: **#860**
- branch: `db-a0/football-database-v2-architecture-main2`
- HEAD: `20e42b1c8df976d3819213758ea393918a870b02`
- base: `main@112bd95279f1397c54f69f3d17c25871035bba48`
- merge commit: `7b1026a0a11dc0e9192fa44476cf406b0e07dac9`
- merge status: **MERGED**
- certified status: **GREEN / INTEGRATED**
- files changed: architecture/workstream documentation plus Repository
  Integrity workflow completion support
- tests: Repository Integrity **SUCCESS** plus exact-head T5/Player Actions
  regression workflows **SUCCESS**
- dependency: current-main baseline
- authority: architecture/integration contract only; no runtime product logic.

## G1 — DB-A1 schema / integrity

- PR: **#861**
- branch: `db-a1/football-catalog-integrity-main2`
- HEAD: `3a4a461d652b234d4fb20389c5031bac1599928f`
- base: `main@7b1026a0a11dc0e9192fa44476cf406b0e07dac9`
- merge commit: `1c31c97b7c5cd415e470e41c1935627b0d78aed4`
- merge status: **MERGED**
- certified status: **G1 CERTIFIED**
- files changed: 4
- tests: **13/13 SUCCESS**, Repository Integrity **SUCCESS**, catalog
  integrity **SUCCESS**
- P0/P1 unresolved: **0 / 0**
- dependency: G0 merged and green
- product note: strict-ID fixture edits are test-only; runtime and save
  implementation are unchanged.

Historical G1 PR #827 @
`1b0992bc6df38d05a4b8061c748ff17aa08a3d65` is superseded for
integration purposes.

## G2 — DB-A2 balance

- historical PR: **#839**
- branch: `db-a2/football-balance-regrounded`
- HEAD: `26c4fa6c09e0fb1191dadf289f622be0604d9ba4`
- base: G1 historical HEAD
  `1b0992bc6df38d05a4b8061c748ff17aa08a3d65`
- merge status: **CLOSED / NOT MERGED / SUPERSEDED AS MERGE VEHICLE**
- files changed: 5
- tests/evidence: Player Actions A5, offer/session bridge and T51 A5 K
  exact-head regressions **SUCCESS**; full current-main A2 contract was
  re-grounded through #856 and integrated by #862
- certified status: **PAYLOAD RE-CERTIFIED IN #862 + G7**
- dependency: G1 identity/integrity contract
- integrated content: league groups, club bands, selector profiles and
  deterministic 528-club recalibration.

## G3 — DB-A3 runtime

- historical PR: **#840**
- branch: `db-a3/runtime-football-catalog-regrounded`
- HEAD: `3d4c42e73115c664f6762ea2bc16ffb0cbe8a788`
- base: G2 historical HEAD
  `26c4fa6c09e0fb1191dadf289f622be0604d9ba4`
- merge status: **CLOSED / NOT MERGED / SUPERSEDED AS MERGE VEHICLE**
- files changed: 15
- tests/evidence: Player Actions A5, offer/session bridge, T51 A5 K and
  T5.2 34+ exact-head regressions **SUCCESS**; current-main runtime core was
  re-grounded through #856 and integrated by #862
- certified status: **PAYLOAD RE-CERTIFIED IN #862 + G7**
- dependency: G2 balance contract
- integrated content: catalog-backed fixture/market/runtime identity,
  existing market authority preservation, zero-extra-RNG selection and
  deterministic narrative alias materialization.

## G4 — DB-A4 save / versioning

- PR: **#845**
- branch: `db-a4/save-catalog-versioning-regrounded`
- HEAD: `f93953d377d5203078cca0668330a522f8f65604`
- base: G3 historical HEAD
  `3d4c42e73115c664f6762ea2bc16ffb0cbe8a788`
- merge status: **OPEN HISTORICAL RECORD / NOT DIRECT-MAIN VEHICLE**
- files changed: 15
- certified status: **G4 CERTIFIED — 5/5**
- tests: save/version/migration **236/236**, football catalog **11/11**,
  runtime/catalog regression **41/41**, Player Actions/T51/offer bridges
  **SUCCESS**
- P0/P1: **0 / 0 known**
- dependency: serialized G0→G3 contract
- current-main integration: ported through #853 and merged by #862.

## G5 — DB-A5 platforms

- PR: **#851**
- branch: `db-a5/football-presentation-g5-regrounded`
- HEAD: `993cb1d69c2481515e1af3d273dbcfd5141745c0`
- base: G4 HEAD `f93953d377d5203078cca0668330a522f8f65604`
- merge status: **OPEN HISTORICAL RECORD / NOT DIRECT-MAIN VEHICLE**
- files changed: 7
- certified status: **EXACT-HEAD PLATFORM STACK GREEN; PAYLOAD
  RE-CERTIFIED IN #862 + G7**
- tests: Presentation/platforms, Player Actions A5, offer/session bridge and
  T51 A5 K exact-head workflows **SUCCESS**
- dependency: G4
- current-main integration: presentation / PlayCanvas / Android payload
  ported through #853 and merged by #862.

## G6 — DB-A6 data polish

- PR: **#854**
- branch: `db-a6/football-data-polish-g5-regrounded`
- HEAD: `14dcb9fabd8ed3ac1d5d4164492cadf1e2960616`
- base: G5 HEAD `993cb1d69c2481515e1af3d273dbcfd5141745c0`
- merge status: **OPEN CERTIFICATION RECORD / NOT DIRECT-MAIN VEHICLE**
- files changed: 4
- certified status: **G6 CERTIFIED — 4/4**
- tests: final-stack G6 workflow **SUCCESS**, Player Actions A5 **SUCCESS**,
  T51 A5 K **SUCCESS**
- P0/P1: **0 / 0 A6-owned**
- dependency: G5
- current-main integration: data-polish payload ported through #853 and
  merged by #862.

## G7 — DB-A7 QA evidence

- PR: **#863**
- branch: `db-a7/football-v2-final-certification-full-stack`
- HEAD: `632f04e5f90e3c1deac128a09abdf7c04e46b28b`
- base: certified product #862 HEAD
  `4602df6df376c02ea50e8c5bba1c8b093d2c4770`
- merge status: **OPEN DRAFT QA/EVIDENCE — NOT PRODUCT**
- files changed: 3, certification-only
- certified status: **G7 CERTIFIED**
- tests: **15/15 PASS**, Player Actions A5 **SUCCESS**, T51 A5 K
  **SUCCESS**
- P0/P1 at certification: **0 / 0 known**
- dependency: #862 exact product HEAD green and integrated
- product effect: none; G7 contributes QA/evidence, not runtime authority.

## Main drift since G7 product certification

Comparison:

- certified product: `4602df6df376c02ea50e8c5bba1c8b093d2c4770`
- A8 clean-branch base: `1c31c97b7c5cd415e470e41c1935627b0d78aed4`
- relation: current main is **12 commits ahead / 0 behind**
- merge-base: certified product HEAD

Changed paths after the certified product HEAD:

- `.github/workflows/football-database-v2-catalog.yml`
- `.github/workflows/repository-integrity.yml`
- `docs/football-database-v2-a1-handoff.md`
- `project/workstreams/FOOTBALL_DATABASE_V2.md`
- `scripts/test-t5-captain-gap-known-bug.mjs`
- `scripts/test-t5-offer-context-known-bug.mjs`

### Drift classification

**SAFE**

- `docs/football-database-v2-a1-handoff.md`
- `project/workstreams/FOOTBALL_DATABASE_V2.md`

These are documentation/contract additions only.

**RETEST_ONLY — already revalidated by G1 exact-head CI, and will be
retested again by A8**

- `.github/workflows/football-database-v2-catalog.yml`
- `.github/workflows/repository-integrity.yml`
- `scripts/test-t5-captain-gap-known-bug.mjs`
- `scripts/test-t5-offer-context-known-bug.mjs`

The two fixture edits replace invalid QA placeholder club references with a
valid catalog identity. PR #861 explicitly records them as test-only changes;
runtime and save implementation are unchanged.

**SEMANTIC_CONFLICT**

- none identified

**BLOCKER**

- none identified

### Sensitive-surface drift

- Player Actions runtime: **none**
- market/runtime authority: **none**
- save implementation: **none**
- PlayCanvas product files: **none**
- Android product files: **none**

## QA-only / stale branch handling

The earlier branch
`db-a8/football-database-v2-release@a730a3e596780152a31c91bbb4bfcf176f6ef53d`
is not used as the release candidate.

Relative to the #862 merge it contains only:

- 4 A8 workflows; and
- 296 generated Android asset files.

It is preserved as historical A8 preparation evidence. Its generated Android
tree is not copied into the clean release branch.

The old QA-only G4 recovery workflows are also not ported because G4 is
already integrated in the certified product and G7 is formally certified.
Only approved release tests/workflows/docs may be reused from QA preparation.

## Clean release plan

1. Start from the real current main:
   `1c31c97b7c5cd415e470e41c1935627b0d78aed4`.
2. Add A8 release-artifact workflow with read-only repository permissions.
3. Generate PlayCanvas and Android deployables in CI without auto-commit or
   auto-push.
4. Add A8 final release-regression workflow and run it on the exact A8 HEAD.
5. Inspect generated artifact diff before deciding whether any tracked
   deployable refresh is required.
6. Do not replay historical G0→G6 branches over current main.
7. Do not merge QA-only branches as product.

## PASS 1 closeout

DB-A8 — PASS 1 COMPLETE

- PROGRESS: **25%**
- PASSES: **1 / 4**
- PASSES ESTIMADAS RESTANTES: **3**
- G0: integrated / green
- G1: certified / merged
- G2: historical generation; payload integrated and G7 re-certified
- G3: historical generation; payload integrated and G7 re-certified
- G4: certified; payload integrated
- G5: exact-head platform stack green; payload integrated
- G6: certified; payload integrated
- G7: **CERTIFIED 15/15, P0=0, P1=0**
- MAIN DRIFT: docs/workflows/test-only; no product semantic drift
- SAFE: documentation additions
- RETEST_ONLY: CI/test-only changes; already green in G1, pending A8 sweep
- SEMANTIC CONFLICTS: **none**
- BLOCKERS: **none**
- SIGUIENTE: **Build clean release candidate**
