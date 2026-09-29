# MUIR P8 — Gate

P7 certified predecessor: `3f93206903441029d692eaa76def890ddc7a0cc0`  
P7 exact-head workflow: `36601414020` = SUCCESS  
Branch: `ui-a5/muir-p8-world-career`

## Pass 1 — certified baseline

P8 Pass 1: **PASS** on SHA `decc4d0e8f0cd483c1afda2487797652495e2446`.

Workflow: `36604587742` = **SUCCESS**  
Artifact digest: `sha256:a7b001c651c0575d3543fadf70d2ad3d973c05dea36fca86517b09cc3462db57`

Certified: exact predecessor, five-surface 360/390/412/tablet/landscape baseline, AXE serious/critical 0, horizontal overflow 0, internal IDs 0, save/import smoke, package graph and PlayCanvas.

## Pass 2 — Mundo

P8 Pass 2: **PASS** on SHA `7749344cba439838a1c42bcccf8304db43900d46`.

Workflow: `36606402032` = **SUCCESS**  
Artifact: `muir-p8-ef6ca8a6b9c74827eedafa128aa005b4b50a2506`  
Artifact digest: `sha256:f9ae00c8ae384a89fb55ed4cad6980580d70517eff6194ab2320a5ac18ad56eb`

Certified Mundo evidence:

- only public `news[].date/text` presentation: PASS
- P7 `NewsCard` reused: PASS
- world-empty: PASS
- world-one: PASS
- world-long + Unicode: PASS
- world-many, 80 public news without artificial truncation: PASS
- decorative pre-feed banner removed: PASS
- standings/classification/global market/next-match surfaces introduced: 0
- 360×800 / 390×844 / 412×915 / tablet / landscape: PASS
- text scale 100/130/180%: PASS
- horizontal overflow findings: 0
- AXE serious/critical: 0
- global secondary-surface regression: PASS
- save/import regression: PASS
- PlayCanvas package smoke: PASS
- DB/PlayerView/gameplay/save authority changes: 0

## Current state

**IN_PROGRESS — PASS 3 CARRERA**

Authorized product files remain presentation-only:

- `web/game-ui.js`
- `web/game-ui.css`

Pass 3 must prove:

- `LatestMatchCard` is identifiable before season history;
- `CareerSeasonCard` supports early, one-season and long-career states;
- presentation-only `MilestoneCard` uses factual public milestones only;
- `OfferCard` remains the offer-history renderer;
- decisions and Player Actions share a factual timeline without panel-inside-panel;
- retirement/history remains usable with a 20-season test career;
- no XP/levels/artificial progression is introduced;
- required phone/tablet/landscape viewports and 100/130/180% text remain usable;
- AXE serious/critical remains 0;
- P7 DB/market/gameplay authority remains unchanged.

The full persistence stress test remains scheduled for P8.5/P8.7.

P8 remains IN_PROGRESS. P9 is not authorized.
