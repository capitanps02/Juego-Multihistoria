# MUIR P8 — Gate

P7 certified predecessor: `3f93206903441029d692eaa76def890ddc7a0cc0`  
P7 exact-head workflow: `36601414020` = SUCCESS  
Branch: `ui-a5/muir-p8-world-career`

## Pass 1 — certified baseline

P8 Pass 1 is **PASS** on product/evidence SHA `decc4d0e8f0cd483c1afda2487797652495e2446`.

Workflow: `36604587742` = **SUCCESS**  
Artifact: `muir-p8-baseline-e24b9206e73e390f112e45db2bf704665245816a`  
Artifact digest: `sha256:a7b001c651c0575d3543fadf70d2ad3d973c05dea36fca86517b09cc3462db57`

Certified baseline evidence:

- exact P7 predecessor / P8 scope smoke: PASS
- P7 semantic regression: PASS
- Football DB public regressions: PASS
- save/import smoke: PASS
- Mundo/Carrera/Relaciones/Perfil/Tu partida Chromium baseline: PASS
- 360×800: PASS
- 390×844: PASS
- 412×915: PASS
- tablet 768×1024: PASS
- landscape 844×390: PASS
- horizontal overflow findings: 0
- AXE serious/critical: 0
- visible internal IDs: 0
- shared UI package graph: PASS
- PlayCanvas package smoke: PASS

The full persistence stress test is intentionally retained for P8.5/P8.7; it is not used as a Pass-1 smoke substitute.

## Current state

**IN_PROGRESS — PASS 2 MUNDO**

Authorized product files remain presentation-only:

- `web/game-ui.js`
- `web/game-ui.css`

Pass 2 must prove:

- only public `news[].date/text` is rendered;
- P7 `NewsCard` is reused;
- 0/1/many/long/Unicode news states work;
- no artificial 30-news truncation;
- no standings/classification, global results, market, competitions or next-match surface is introduced;
- required mobile/tablet/landscape viewports remain usable;
- AXE serious/critical remains 0;
- P7 DB/market/gameplay authority remains unchanged.

P8 remains IN_PROGRESS. P9 is not authorized.
