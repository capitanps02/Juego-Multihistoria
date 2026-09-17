# Codex prompt — ordinary Canon 34+

Repo: `capitanps02/Juego-Multihistoria`  
Base: latest `main`  
Branch: `t51/canon-34plus`  
No auto-merge.

Implement only ordinary late-career 34+ canon. Terminal career retirement, last-match closure and epilogues belong to Agent 9 / PR #118.

## Read first
1. `analysis/CODEX/canon-34plus/CURRENT_STATE.json`
2. `analysis/CODEX/canon-34plus/CANON_STATUS.json`
3. `analysis/CODEX/canon-34plus/IDENTITY_RECONCILIATION.json`
4. `analysis/CODEX/canon-34plus/CANONICAL_CARD_COVERAGE.json`
5. `analysis/CODEX/canon-34plus/implementation-ready.json`
6. `analysis/CODEX/canon-34plus/SEED_OWNERSHIP.md`
7. `analysis/CODEX/canon-34plus/T52_SEED_HANDOFF.json`
8. `analysis/CODEX/canon-34plus/UNLOCK_WAVES.md`
9. `analysis/CODEX/canon-34plus/AUTHORITY_MATRIX.json`
10. Wave A–E implementation/test packages under the same directory.
11. `analysis/CODEX/canon-34plus/VETERAN_LATE_STATE.md`
12. `analysis/CODEX/canon-34plus/CONTINUITY_CHAINS.md`
13. `analysis/CODEX/canon-34plus/RETIREMENT_HANDOFF.md`
14. canonical source `analysis/2026-09-11/guion-extraido.txt`.

## Current execution status
Canonical preparation is complete but runtime activation is not:
- ordinary canonical cards prepared: **43/43 = 100%**;
- ordinary runtime implemented on Agent-8 branch: **0/43**;
- strict `codexReady`: **0/43** until Wave 0 and the task-specific authorities are present.

Dependency membership:
- Wave A: 4 context/body/family/image scenes;
- Wave B: 18 market/contract scenes;
- Wave C: 16 sport/usage/selection scenes;
- Wave D: 7 NPC/squad scenes;
- Wave E: 2 free-agency scenes.

Intentional overlaps:
- `EVT_35_AGT_001` = B+D;
- `EVT_35_DUAL_001` = B+D;
- `EVT_35_RECORD_001` = C+D;
- `EVT_37_SHORT_001` = B+E.

Unique ordinary coverage remains **43/43**. `AUTHORITY_MATRIX.json` is the machine-readable dependency contract. A cross-wave scene activates only when every required authority exists.

## Wave 0 — mandatory before any active 34+ registration
1. issue #59 successive content lineage must identify the actual authoritative predecessor; do not freeze a provisional shortcut;
2. final predecessor generations, especially 30–34, must be authoritative;
3. T5.2 must apply `T52_SEED_HANDOFF.json` so the 54 exact Pasada-7 seeds exist with safe provenance/migration semantics;
4. predecessor memories consumed by 34+ must use canonical live/historical semantics;
5. save/history/pending-decision fingerprints must remain compatible.

When 34+ becomes the next real generation, calculate only the adjacent predecessor→34+ edge from the then-current catalog. Never reuse a stale hash from this branch.

## First activation target after Wave 0
Wave A:
- `EVT_35_FAM_001`;
- `EVT_35_BODY_001`;
- `EVT_35_IMG_001`;
- `EVT_36_MED_001`.

Use `WAVE_A_IMPLEMENTATION.json` and `WAVE_A_TEST_MATRIX.md` exactly. Do not register partial shells if a required factual gate is unavailable.

## Existing authorities to consume
- formal offers: `CareerOffer`, eligible offer queries, `respondToOffer()`, offer bridge;
- contract employment: `contractEmploymentStatus()`;
- veteran-renewal limitation: `clubWantsRenewal()` still fails closed for `age >= 34`;
- sport: `getSportContext()` / `getCurrentMatchContext()`; unavailable means unavailable;
- football moments: only registered IDs are factual;
- national team: `resolveNationalTeamAuthority()` for historical/pool/cycle/international-retirement facts;
- national-team limitation: current resolver deliberately exposes `concreteCallupKnown=false` and `tournamentSquadKnown=false`; do not infer current prelist/call-up/omission/squad from standing, role, caps or cycle flags;
- active agent: `resolveActiveAgent()`; null is meaningful;
- institutional/locker actors: certified resolvers only;
- seed memory: `projectSeedMemory()` / exact live/historical instances; never infer semantic payload from a seed name.

## Hard rules
- Never directly mutate `state.club`, owner/registration club or contract terms from a narrative choice.
- Do not create veteran offers inside narrative content. Signable scenes require real compatible `CareerOffer` rows.
- Rumors, `marketHeat` and narrative flags are not formal offers.
- `monthsRemaining == 0` is not free agency.
- `EVT_37_SHORT_001` requires actual free agency before its three-month offer premise can be valid.
- No age-only retirement or age-only sporting decline.
- No synthetic fixture, minutes, start, bench, goal, final, record, call-up, omission, tournament squad, penalty or last-match fact.
- International retirement is distinct from career retirement and must not change `retirement.status`.
- `EVT_34_BODY_001` needs a real preceding match before describing post-match pain.
- `EVT_35_RECORD_001` needs both a factual sporting record and certified identity when another player is named.
- No inferred agent/captain/current coach/successor/peer/family identity.
- Preserve history, seed provenance and pending-decision fingerprint semantics.
- Do not reuse legacy `SEEN_*`/cooldowns to suppress distinct canonical replacements.
- Do not freeze/register contentIdentity or migration edges before #59 authorizes the adjacent generation.
- Do not auto-close seeds at retirement.
- Career-retirement options appearing inside ordinary scenes delegate the terminal transition to Agent 9.
- If an authority is unavailable, leave the task blocked; never substitute a proxy.

## Required QA per active batch
- focused scene/authority tests;
- 33→34, 34→35, 35→36, 36→37 and later supported ages;
- elite, rotation, injured, one-club, journeyman, return-club and weak-market trajectories;
- veteran contract cases including one-year renewal, rejected renewal, lower-level offer, short contract and return offer;
- free agency only after authoritative unattached-player semantics exist;
- national-team cases: historical participant, pool active, international retirement, no concrete call-up known;
- save/load and pending-decision provenance;
- seed producer/consumer/scope audit;
- no automatic career retirement and no synthetic last match/goal;
- `npm run build`;
- `npm test`;
- migration tests;
- Repository Integrity on the exact candidate HEAD.
