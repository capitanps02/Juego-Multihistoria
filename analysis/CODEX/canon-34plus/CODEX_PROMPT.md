# Codex prompt — Canon 34+ / Agent 8

Repo: `capitanps02/Juego-Multihistoria`  
Branch: `t51/canon-34plus`  
Audited base: `main@5f4d14bca4d696cfafadb58b64034c7cd40cc147`. Updated 2026-09-18.  
No auto-merge. Never register 34+ runtime until #59 authorizes the serialized generation.

## Ownership
Implement only ordinary late-career 34+ content. Terminal protagonist retirement, announcement, final career closure, terminal last-match handling and epilogues belong to Agent 9 / PR #118.

## Read first
`CURRENT_STATE.json`, `SHARED_OWNER_ROUTING.json`, `CANON_STATUS.json`, `AUTHORITY_MATRIX.json`, `CONDITIONAL_RECONCILIATION.json`, `CONDITIONAL_AUTHORITY_MATRIX.json`, `CONDITIONAL_HANDOFF.md`, `CANONICAL_CARD_COVERAGE.json`, `implementation-ready.json`, `SEED_OWNERSHIP.md`, `T52_SEED_HANDOFF.json`, Wave A–E packages, `BLOCKERS.md`, `CONTINUITY_CHAINS.md`, `RETIREMENT_HANDOFF.md`, and `analysis/2026-09-11/guion-extraido.txt`.

## Current state
- 50 principal identities reconciled;
- 43 ordinary principal cards prepared, **0/43 runtime active**;
- 32 canonical conditional IDs reconciled/routed, **0/32 runtime accredited**;
- 54 exact Pasada-7 seed IDs classified = 45 ordinary + 9 terminal, plus 14 bridge concepts;
- PR #156 sport authority is integrated in main;
- strict Agent-8 Codex readiness remains **0/43** because Wave 0 is not complete.

## Lineage hard stop — #59
The multi-hop migration graph exists. Current active content generation remains H (`84871fae…`). Shared runtime commit `5f4d14bc…` does not change EVENTS/contentIdentity.

34+ is not authorized to register a successor from H. Earlier content generations, including final 30–34, must serialize first. At the actual 34+ turn, re-ground and register only the adjacent final30–34→34+ generation. Never reuse a provisional target hash.

## Seed hard stop — #180 / PR #191
PR #191 implements the exact 54 canonical IDs, 45+9 producer split, 14 bridge dispositions and provenance rules. It had green exact-head QA on its previous base but is not integrated into current main after #156. Do not activate 34+ until the current seed-authority integration candidate is valid and landed.

## Sport authority — integrated
PR #156 / #124 is in `main@5f4d14bc…`.

You may consume factual official league fixture identity, next/previous fixture, remaining league fixtures, squad call, bench, start, appearance, minutes, injury-unavailable and historical usage rows.

Do not treat it as authority for final result, goals, assists, cards, awards, records, concrete national selection or stadium incidents.

## Market chain — do not skip PR #207
Coordinator order is now:

**PR #207 / #175 → #157 → #130 → #176**

### PR #207 / #175 — CareerOffer rich context
Ready/green but not integrated. It adds optional validated `CareerOffer.context` for explicit rich late-career side terms. It does **not** produce a concrete offer.

Do not start #157 against a context-less model. Multi-offer migration/selection must preserve `CareerOffer.context` natively rather than forcing another migration later.

### #157 — MarketState v2
After #207 is integrated/re-grounded, implement one authoritative 0..N `CareerOffer` collection, stable IDs, deterministic v1 migration preserving context, durable system closure provenance and ambiguity-fail-closed selectors.

### #130 — employment/unattached
Contract-ready and should coordinate with #157:
- `contracted`;
- `unattached`;
- `expired_pending_resolution` for ambiguous legacy saves.

New-game natural expiry may transition `contracted -> unattached` once, deterministically and 0 RNG. While unattached there is no ordinary club salary/football/renewal/current-club authority. Accepted formal offer is the only reattachment path. No retirement is implied.

### #176 — veteran market
Implement after #157/#130. It owns factual veteran offer production and veteran approach/medical-assessment facts.

Do not pretend current terms guarantee minutes, bonuses, bilateral termination, liaison or ambassador roles. A failed club medical is an assessment fact, not a signable offer.

## Parallel shared work already unblocked by #156
- **#174** — concrete ordinary/tournament national-selection publications;
- **#199** — rich sporting outcomes, awards and records;
- **#200** — injury episode/rehab/return chronology.

**#201** owns justified finance/sponsor/stadium/staff-crisis club-world incidents or an explicit fail-closed decision.

## Actor routing
Issue **#177 is closed completed** after the 43/43 authority-matrix refresh. Do not create or reopen a generic late-career NPC subsystem merely because one scene lacks evidence. Use `AUTHORITY_MATRIX.json`:
- `EVT_35_AGT_001`: existing `resolveActiveAgent()` or null; no #177 implementation dependency.
- `EVT_35_DUAL_001`: generic club voice allowed unless canon requires named continuity; factual offer/context authority comes from #207/#157/#176.
- `EVT_36_CCH_001`: coach tenure/profile -> #169; persistent coach NPC not required.
- `EVT_34_DORSAL_001` / `EVT_34_MENTOR_001`: generic non-persistent young actor allowed only if no named continuity/T5.3 mutation is required.
- `EVT_35_RECORD_001`: record truth -> #199; persistent identity only when explicitly required/certified.
- `EVT_36_PEER_001`: fail closed until exact peer + causal peer-retirement history exists. This is a scene-local factual prerequisite; it does not make #177 an active blocker again.

## Conditional canon
Documento Maestro 25.13 defines exactly 32 IDs. Current engine also has 32 rows, but only 5 exact IDs overlap; 27 canonical IDs are absent, 27 technical IDs are non-canonical and 0/32 are accredited.

#192 owns exact conditional implementation. #195 is closed only because its factual gaps now route to #176/#199/#200/#201. Closed #195 is not runtime evidence.

Never silently alias `CEVT_RET_RECONSIDER` to canonical `CEVT_38_RETIREMENT_REVERSAL`.

## First Agent-8 batch
Only after Wave 0 actually lands:
`EVT_35_FAM_001`, `EVT_35_BODY_001`, `EVT_35_IMG_001`, `EVT_36_MED_001`.

Do not activate them now.

## Absolute prohibitions
No direct club/contract mutation from narrative choices; no synthetic offer/free agency/match/result/goal/record/award/selection/penalty/NPC/retirement fact; no age-only retirement; no proxy flag in place of missing authority; no history/provenance rewrite; no mass seed closure; no provisional contentIdentity freeze. Missing fact => fail closed.

## QA
For any future authorized runtime batch: focused factual gates + negative tests, save/load and pending provenance, seed scope/producer audit, migration coverage, build/tests and Repository Integrity on the exact candidate HEAD. Prior-head green runs are historical only after any branch change.

## Current QA evidence
Repository Integrity run `35263846340` succeeded on prior exact HEAD `aed49c362e6dda02bc981e0ea8d83d152604f840`. Because this handoff refresh changes documentation, certify the new exact HEAD before treating the refreshed snapshot as exact-head green.
