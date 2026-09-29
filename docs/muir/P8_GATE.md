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

## Pass 3 — Carrera

P8 Pass 3: **PASS** on SHA `cc56708c95a53a7876be3c3cac25e1fc26dcbc69`.

Workflow: `36608026921` = **SUCCESS**  
Artifact: `muir-p8-3d9ce88f98eb84550ed1415806380ce049ea4055`  
Artifact digest: `sha256:02678e17a575bd50a8ba1e72fa99f38fe64e6c53a2564239a3181e5caade3cd1`

Certified Carrera evidence:

- early career / one season / 20-season long career: PASS
- `LatestMatchCard` before season history: PASS
- factual public `MilestoneCard`: PASS
- public offer history through `OfferCard`: PASS
- decisions + voluntary actions timeline, 60 entries: PASS
- panel-inside-panel findings: 0
- retirement closed state with 20 seasons: PASS
- artificial XP/levels/loot: 0
- 360×800 / 390×844 / 412×915 / tablet / landscape: PASS
- text scale 100/130/180%: PASS
- horizontal overflow findings: 0
- AXE serious/critical: 0
- P7 semantic / Football DB / save-import / package graph / PlayCanvas: PASS
- DB/PlayerView/gameplay/save authority changes: 0

## Pass 4 — Relaciones / Perfil

P8 Pass 4: **PASS** on SHA `5291e3fe34c7f8055565aea0a898a05219ea83a1`.

Workflow: `36610621251` = **SUCCESS**  
Artifact: `muir-p8-01491623dde3fa318105f4bee933f8f282eb06d2`  
Artifact digest: `sha256:fb23f26bf785742832462206054f6571cb9b43ef1cfb5bfc2687e3f23ccdd63c`

Certified Relaciones / Perfil evidence:

- Relaciones empty / one / long Unicode / 24-contact states: PASS
- P7 `PersonCard` reused: PASS
- private trust/affinity/reliability/influence/probability/bond type visible: 0
- Perfil public identity / condition / contract fields only: PASS
- profile nested-panel findings: 0
- long player name / long formatted club: PASS
- GRL / invented attributes / fake tabs / nationality / market value introduced: 0
- 360×800 / 390×844 / 412×915 / tablet / landscape: PASS
- text scale 100/130/180%: PASS
- horizontal layout overflow findings: 0
- form controls escaping main viewport: 0
- AXE serious/critical: 0
- P7 semantic / Football DB / save-import / package graph / PlayCanvas: PASS
- DB/PlayerView/gameplay/save authority changes: 0

## Pass 5 — Tu partida

P8 Pass 5: **PASS** on SHA `c9402fd317786d2d109d89435a1ccb3316fc603b`.

Workflow: `36612633876` = **SUCCESS**  
Artifact: `muir-p8-b93ca2c811623163a26063e755f8e2b1c5c404aa`  
Artifact digest: `sha256:a33a33f207f1d5eec04cc4e6a18a090be610073128d8ebd68bdc16200d25f648`

Certified Tu partida evidence:

- local/current save presentation: PASS
- download current copy: PASS
- current recovery/reload action: PASS
- JSON import + confirmation: PASS
- previous backup recovery + confirmation: PASS
- legacy download-only copy: PASS
- new story name + numeric story code + confirmation: PASS
- save-standard / save-backup / save-legacy / save-full: PASS
- persistence interruption stress, 100 decision cycles: PASS
- save migration/import/export regressions: PASS
- cloud/login/remote sync/fake slots introduced: 0
- save schema / IndexedSaveStore / GameSession authority changes: 0
- 360×800 / 390×844 / 412×915 / tablet / landscape: PASS
- text scale 100/130/180%: PASS
- horizontal layout/control overflow findings: 0
- AXE serious/critical: 0
- package graph / PlayCanvas: PASS

## Current state

**IN_PROGRESS — PASS 6 HARDENING GLOBAL**

Pass 6 consolidates the already-certified long/empty/responsive/a11y coverage across all five P8 surfaces. No new gameplay or data is authorized.

Pass 6 must prove:

- long Mundo feed, long Carrera, long Relaciones/Perfil and full save support remain usable together;
- truthful empty states remain valid where the public contract permits emptiness;
- 360×800 / 390×844 / 412×915 / tablet / landscape remain usable across P8;
- 100/130/180% text scale remains usable on the long-state scenarios;
- horizontal overflow findings remain 0;
- AXE serious/critical remains 0;
- keyboard/focus semantics remain intact;
- internal IDs / private metrics / invented fields / cloud features remain 0;
- authority files remain unchanged.

P8 remains IN_PROGRESS. P9 is not authorized.
