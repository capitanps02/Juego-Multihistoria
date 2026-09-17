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
5. `analysis/CODEX/canon-34plus/UNLOCK_WAVES.md`
6. `analysis/CODEX/canon-34plus/WAVE_A_IMPLEMENTATION.json`
7. `analysis/CODEX/canon-34plus/WAVE_A_TEST_MATRIX.md`
8. `analysis/CODEX/canon-34plus/VETERAN_LATE_STATE.md`
9. `analysis/CODEX/canon-34plus/CONTINUITY_CHAINS.md`
10. `analysis/CODEX/canon-34plus/RETIREMENT_HANDOFF.md`
11. canonical source `analysis/2026-09-11/guion-extraido.txt`.

## Current execution status
Do not interpret “prepared task” as integration-ready. Strict `codexReady` remains 0 until the task's listed shared authorities are present on the integration base. The biggest common blockers are successive content lineage #59 and the T5.2 application of `SEED_OWNERSHIP.md`.

`WAVE_A_IMPLEMENTATION.json` is the first prepared ordinary batch. It is intentionally **not registered in `EVENTS`**. Once Wave 0 in `UNLOCK_WAVES.md` is green, implement these four first:

1. `EVT_35_FAM_001` — `SEED_FINAL_RELOCATION_TRADEOFF`;
2. `EVT_35_BODY_001` — `SEED_SLOW_PRESEASON_35`;
3. `EVT_35_IMG_001` — `SEED_RETIREMENT_MARKETING`;
4. `EVT_36_MED_001` — `SEED_POST_CAREER_BODY_RISK`.

Use the exact choice payload semantics and fail-closed authority requirements in the Wave-A files. Do not reinterpret them from legacy shells.

After Wave A, follow the dependency ordering in `UNLOCK_WAVES.md`:
- Wave B: veteran market/contracts;
- Wave C: sport/usage/selection;
- Wave D: late-career NPC/squad identity;
- Wave E: real free agency;
- terminal wave: excluded, Agent 9 only.

## Existing authorities to consume
- formal offers: `CareerOffer`, eligible offer queries, `respondToOffer()`, offer bridge;
- contract status: `contractEmploymentStatus()`;
- sport: `getSportContext()` / `getCurrentMatchContext()`; unavailable means unavailable;
- football moments: only registered IDs in `football-moments` are factual;
- agent: `resolveActiveAgent()`; null is meaningful;
- institutional/locker actors: certified resolvers only;
- seed memory: `projectSeedMemory()` / exact live/historical instances; never raw semantic inference from a seed name.

## Hard rules
- Never directly mutate `state.club`, owner/registration club or contract terms from a narrative choice.
- Do not create veteran offers inside narrative content. A signable scene needs a real compatible `CareerOffer`.
- Ordinary renewal generation currently stops at age 34; do not bypass that with a flag/proxy.
- `monthsRemaining == 0` is not free agency.
- No age-only retirement or age-only sporting decline.
- No synthetic fixture, minutes, start, bench, goal, final, selection or last-match fact.
- No inferred agent/captain/current coach/successor/family identity.
- Preserve History, seed provenance and pending-decision fingerprint semantics.
- Do not reuse a legacy `SEEN_*`/cooldown to suppress a distinct canonical replacement.
- Do not freeze/register contentIdentity or global migration edges here.
- Do not auto-close seeds at retirement.
- If a required authority is unavailable, leave the task `blocked_shared_authority`; do not substitute a proxy.

## Required QA per active batch
- exact tests in `WAVE_A_TEST_MATRIX.md` for Wave A;
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
