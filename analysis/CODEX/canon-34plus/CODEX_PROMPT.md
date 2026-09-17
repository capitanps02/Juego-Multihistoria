# Codex prompt — ordinary Canon 34+

Repo: `capitanps02/Juego-Multihistoria`  
Base: latest `main`  
Branch: `t51/canon-34plus`  
No auto-merge.

Implement only ordinary late-career 34+ canon. Terminal retirement/last-match closure/epilogues belong to Agent 9 / PR #118.

## Read first
1. `analysis/CODEX/canon-34plus/CANON_STATUS.json`
2. `analysis/CODEX/canon-34plus/IDENTITY_RECONCILIATION.json`
3. `analysis/CODEX/canon-34plus/implementation-ready.json`
4. `analysis/CODEX/canon-34plus/SEED_OWNERSHIP.md`
5. `analysis/CODEX/canon-34plus/T52_SEED_HANDOFF.json`
6. `analysis/CODEX/canon-34plus/UNLOCK_WAVES.md`
7. `analysis/CODEX/canon-34plus/AUTHORITY_MATRIX.json`
8. `analysis/CODEX/canon-34plus/WAVE_A_IMPLEMENTATION.json`
9. `analysis/CODEX/canon-34plus/WAVE_A_TEST_MATRIX.md`
10. `analysis/CODEX/canon-34plus/VETERAN_LATE_STATE.md`
11. `analysis/CODEX/canon-34plus/CONTINUITY_CHAINS.md`
12. `analysis/CODEX/canon-34plus/RETIREMENT_HANDOFF.md`
13. canonical source `analysis/2026-09-11/guion-extraido.txt`.

## Current execution status
Do not interpret “prepared task” as integration-ready. Strict `codexReady` is 0 until the task's listed shared authorities are present on the integration base.

The complete ordinary coverage is now explicit:
- Wave A: 4 context scenes;
- Wave B: 17 market/contract scenes;
- Wave C: 16 sport/usage/selection scenes;
- Wave D: 7 NPC/squad scenes;
- Wave E: 1 free-agency scene;
- overlaps: `EVT_35_AGT_001` = B+D, `EVT_35_RECORD_001` = C+D;
- unique coverage = **43/43**.

`AUTHORITY_MATRIX.json` is the machine-readable dependency contract. If an event requires multiple waves, all required authorities must be present before activation.

## Wave 0 — mandatory before any active 34+ canonical registration
1. issue #59 successive content lineage must identify the **actual authoritative predecessor**; do not freeze a provisional shortcut;
2. T5.2 must apply `T52_SEED_HANDOFF.json` so the 54 exact Pasada-7 seeds exist with safe provenance/migration semantics;
3. predecessor memories consumed by 34+ must be canonical/live-or-historical as appropriate;
4. save/history/pending-decision fingerprints must remain compatible.

The shared lineage issue currently says 34+ must remain outside the migration chain until predecessor generations, especially 30–34, are authoritative. Re-ground on the definitive predecessor and calculate only the adjacent source→target edge when that turn arrives.

## First activation target after Wave 0
Implement Wave A from `WAVE_A_IMPLEMENTATION.json` exactly:
- `EVT_35_FAM_001`;
- `EVT_35_BODY_001`;
- `EVT_35_IMG_001`;
- `EVT_36_MED_001`.

Use `WAVE_A_TEST_MATRIX.md` as acceptance criteria. Do not register partial shells if a factual gate cannot be represented.

## Existing authorities to consume
- formal offers: `CareerOffer`, eligible offer queries, `respondToOffer()`, offer bridge;
- contract status: `contractEmploymentStatus()`;
- current limitation: `clubWantsRenewal()` still fails closed at `age >= 34`, so veteran renewal generation remains missing;
- sport: `getSportContext()` / `getCurrentMatchContext()`; unavailable means unavailable;
- football moments: only registered IDs in `football-moments` are factual;
- agent: `resolveActiveAgent()`; null is meaningful;
- institutional/locker actors: certified resolvers only;
- seed memory: `projectSeedMemory()` / exact live/historical instances; never raw semantic inference from a seed name.

## Hard rules
- Never directly mutate `state.club`, owner/registration club or contract terms from a narrative choice.
- Do not create veteran offers inside narrative content. A signable scene needs a real compatible `CareerOffer`.
- A rumor, `marketHeat` or a narrative flag is not a formal offer.
- `monthsRemaining == 0` is not free agency.
- No age-only retirement or age-only sporting decline.
- No synthetic fixture, minutes, start, bench, goal, final, selection or last-match fact.
- `EVT_34_BODY_001` needs a real preceding match before describing post-match pain.
- `EVT_35_RECORD_001` needs both the real sporting record fact and certified identity when another player is named.
- No inferred agent/captain/current coach/successor/family identity.
- Preserve History, seed provenance and pending-decision fingerprint semantics.
- Do not reuse a legacy `SEEN_*`/cooldown to suppress a distinct canonical replacement.
- Do not freeze/register contentIdentity or global migration edges here before #59 authorizes the adjacent generation.
- Do not auto-close seeds at retirement.
- If a required authority is unavailable, leave the task blocked; do not substitute a proxy.

## Required QA per active batch
- focused scene/authority tests;
- 33→34, 34→35, 35→36, 36→37 and later supported ages;
- elite, rotation, injured, one-club, journeyman, return-club and weak-market trajectories;
- contract cases: one-year renewal, rejected renewal, no offer, lower-level offer, return offer; free agency only after an authority exists;
- save/load and pending decision provenance;
- seed producer/consumer/scope audit;
- no automatic retirement and no synthetic last match/goal;
- `npm run build`;
- `npm test`;
- migration tests;
- Repository Integrity.
