# MUIR P7 — Gate

## Authority

- P6 certified / exact P7 predecessor: `e2b54ec654a32b8665925bec7811363003e482ed`
- P6 exact-head workflow: `36591367106` = **SUCCESS**
- P7 branch: `ui-a5/muir-p7-semantic-db`
- Football Database V2: `world-v2-a2-2026-09-28`

## Scope

P7 is presentation-semantic only.

Allowed product files:

- `web/game-ui.js`
- `web/game-ui.css`

Allowed evidence/test/docs/workflow files are limited to P7-specific paths plus `MUIR-RTM.md`.

Forbidden:

- any `src/**` modification
- Football Database mutation
- PlayerView expansion
- market/offer command change
- gameplay/RNG/persistence change
- invented standings/GRL/private relationship data

## Candidate components

- NewsCard
- LatestMatchCard
- CareerSeasonCard
- ContractSummary
- OfferCard
- PersonCard

## Executable gate

The P7 workflow executes:

1. exact predecessor + DB V2 baseline
2. semantic component/static authority audit
3. Football DB V2 / match / UI / offer regressions
4. Chromium semantic-component matrix
5. 360×800 / 390×844 / 412×915 / 768×1024
6. 100 / 130 / 180% text scale probes
7. AXE serious/critical audit
8. internal-ID / undefined/null / N/A / technical-dash visible-text audit
9. P6 Player Actions browser regression
10. PlayCanvas shared package regression
11. Android offline package/regression
12. exact-head final gate

P7 PR: #879

## Current certification state

**PASS CANDIDATE / FINAL EXACT-HEAD CLOSURE REQUIRED**

Candidate SHA `fc65d9b5c6da31b687ad855a3e3b56623af4a64b` completed workflow `36599864443` with **SUCCESS**. Artifact `muir-p7-fc65d9b5c6da31b687ad855a3e3b56623af4a64b` has digest `sha256:822e2c583c7aca99003f8169d6caa6a9af3bf02ca856c1f57f07742a1b99cf68`.

All P7 requirements are promoted to PASS in the RTM. P7 is final only after the exact-head workflow on the RTM/gate-closing commit also completes with SUCCESS. P8 must not begin before that final closure run succeeds.
