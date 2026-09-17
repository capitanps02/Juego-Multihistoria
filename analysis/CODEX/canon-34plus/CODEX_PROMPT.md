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
5. `analysis/CODEX/canon-34plus/VETERAN_LATE_STATE.md`
6. `analysis/CODEX/canon-34plus/CONTINUITY_CHAINS.md`
7. `analysis/CODEX/canon-34plus/RETIREMENT_HANDOFF.md`
8. canonical source `analysis/2026-09-11/guion-extraido.txt`.

## Current execution status
Do not interpret “prepared task” as integration-ready. Strict `codexReady` is 0 until the task's listed shared authorities are present on the base branch. The biggest common blocker is the T5.2 application of `SEED_OWNERSHIP.md` plus successive content lineage #59.

When a blocker lands, implement in this order:
- A: age-34 ordinary principals with exact canonical seeds;
- B: age-35 ordinary principals;
- C: age-36 ordinary principals;
- D: age-37/38 ordinary principals;
- E: reimplement same-ID semantic divergences;
- F: pre-retirement pressure/continue-career scenes that remain `playing`.

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