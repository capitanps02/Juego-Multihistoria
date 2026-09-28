# DB-A7 — Final certification evidence

Status: PENDING FINAL EXACT-HEAD CI

## Frozen dependency chain

- G1 / A1: `1b0992bc6df38d05a4b8061c748ff17aa08a3d65`
- G2 / A2: `26c4fa6c09e0fb1191dadf289f622be0604d9ba4`
- G3 / A3: `3d4c42e73115c664f6762ea2bc16ffb0cbe8a788`
- G4 / A4: `f93953d377d5203078cca0668330a522f8f65604`
- G5 / A5: `993cb1d69c2481515e1af3d273dbcfd5141745c0`
- G6 / A6: `14dcb9fabd8ed3ac1d5d4164492cadf1e2960616`

## Pass 6 contract

No product feature changes are allowed in Pass 6.

Final exact-head CI must prove:

1. BUILD
2. CATALOG STRUCTURE
3. REFERENTIAL INTEGRITY
4. LEGACY SAVE
5. CATALOG VERSIONING
6. RNG
7. DETERMINISM
8. FIXTURES
9. MARKET
10. PLAYER ACTIONS
11. PLAYCANVAS
12. ANDROID
13. LONG CAREERS
14. SAVE/LOAD REPLAY
15. FULL REGRESSION

The final certification workflow runs six independent 1,000-career shards for a total of 6,000 full-career certification cases.

## Release rule

G7 may be declared CERTIFIED only if:

- all 15 gates are green;
- 6,000 / 6,000 certification careers complete;
- crashes = 0;
- invalid new references = 0;
- synthetic new-production leakage = 0;
- unauthorized RNG draws = 0;
- P0 = 0;
- P1 = 0;
- the exact final HEAD is unchanged after CI;
- the certification PR remains open and records the final run evidence.

Until then, this document is preparation only and does not claim G7 certification.
