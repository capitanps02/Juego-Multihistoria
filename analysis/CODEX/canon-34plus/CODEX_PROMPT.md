# Codex prompt — Canon 34+ / Agent 8

Repo: `capitanps02/Juego-Multihistoria`  
Branch: `t51/canon-34plus`  
Current audited base: `main@5f4d14bca4d696cfafadb58b64034c7cd40cc147`.  
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
- PR #156 sport authority is now integrated in main;
- strict Agent-8 Codex readiness remains **0/43** because Wave 0 is not complete.

## Lineage hard stop — #59
The multi-hop migration graph already exists. Current active content generation remains H (`84871fae…`). Shared runtime commit `5f4d14bc…` does not change EVENTS/contentIdentity.

Coordination explicitly forbids 34+ from registering a successor from H now. Earlier content generations, including final 30–34, must serialize first. At the actual 34+ turn:
1. re-ground on exact predecessor;
2. compute the then-current catalog identity;
3. register only adjacent final30_34→34plus;
4. preserve history/pending/seed provenance;
5. never reuse a provisional target hash.

## Seed hard stop — #180 / PR #191
PR #191 is ready for review and green but not integrated. It supplies the exact 54 canonical IDs, 45+9 producer split, 14 bridge dispositions and provenance rules. Do not activate 34+ until it lands in main. A declared seed is not produced until its exact canonical producer/outcome occurs.

## Sport authority — integrated
PR #156 / #124 is in `main@5f4d14bc…`.

You may consume factual official league fixture identity, next/previous fixture, remaining league fixtures, squad call, bench, start, appearance, minutes, injury-unavailable and historical usage rows.

Do not treat it as authority for final result, goals, assists, cards, awards, records, concrete national selection or stadium incidents.

## Next shared implementation queue
With #156 integrated, work can now proceed in parallel where ownership permits:
- **#157** MarketState v2 — authoritative 0..N `CareerOffer` collection, exact IDs, deterministic migration and ambiguity-fail-closed selection;
- **#130** employment/unattached — `contracted | unattached | expired_pending_resolution`, coordinated with #157;
- **#174** concrete national selection publications;
- **#199** rich sporting outcomes, awards and records;
- **#200** injury episode/rehab/return chronology;
- **#176** veteran 34+ producer only after #157/#130;
- **#201** justified club-world incidents for finance/sponsor/stadium/staff crisis.

## Market hard rules
Current exact eligible-offer reads are factual, but do not create missing offers. Do not build veteran market on singular `market.pending` then rewrite it: #157 owns the collection transition.

`monthsRemaining == 0` is not free agency. #130 owns unattached state. A new-game natural expiry may become unattached only through the authoritative deterministic employment transition.

#176 may represent salary, months, numeric release clause where genuinely applicable, destination/owner/registration/loan/tier. Do not pretend current terms guarantee minutes, bonuses, bilateral termination, liaison or ambassador roles. A failed club medical is a factual assessment record, not a signable offer.

## National / rich sport / injury
- #174: persist actual ordinary called-up/omitted publications and separate tournament preliminary/final squad facts.
- #199: persist only actually produced results/goals/assists/cards, awards and record facts.
- #200: persist actual injury episodes, rehab/clearance and factual return linkage; aggregate risk/counters are not episode history.

## Actor routing
Use `AUTHORITY_MATRIX.json` v5:
- `EVT_35_AGT_001`: existing `resolveActiveAgent()` or null; no #177 implementation dependency.
- `EVT_35_DUAL_001`: generic club voice allowed unless canon requires named continuity.
- `EVT_36_CCH_001`: coach tenure/profile -> #169; persistent coach NPC not required.
- `EVT_34_DORSAL_001` / `EVT_34_MENTOR_001`: generic non-persistent young actor allowed only if no named continuity/T5.3 mutation is required.
- `EVT_35_RECORD_001`: record truth -> #199; persistent identity only when explicitly required/certified.
- `EVT_36_PEER_001`: fail closed until exact peer + causal peer-retirement history exists.

## Conditional canon
Documento Maestro 25.13 defines exactly 32 IDs. Current engine also has 32 rows, but only 5 exact IDs overlap; 27 canonical IDs are absent, 27 technical IDs are non-canonical and 0/32 are accredited.

#192 owns exact conditional implementation. #195 is closed only because its eight factual gaps are now routed:
- awards/records -> #199;
- major injury/rehab -> #200;
- finance/sponsor/stadium/staff crisis -> #201;
- medical clearance -> #176.

Closed #195 is not runtime evidence.

Never silently alias `CEVT_RET_RECONSIDER` to canonical `CEVT_38_RETIREMENT_REVERSAL`.

## First Agent-8 batch
Only after Wave 0 actually lands:
`EVT_35_FAM_001`, `EVT_35_BODY_001`, `EVT_35_IMG_001`, `EVT_36_MED_001`.

Do not activate them now.

## Absolute prohibitions
No direct club/contract mutation from narrative choices; no synthetic offer/free agency/match/result/goal/record/award/selection/penalty/NPC/retirement fact; no age-only retirement; no proxy flag in place of missing authority; no history/provenance rewrite; no mass seed closure; no provisional contentIdentity freeze. Missing fact => fail closed.

## QA
For any future authorized runtime batch: focused factual gates + negative tests, save/load and pending provenance, seed scope/producer audit, migration coverage, build/tests and Repository Integrity on the exact candidate HEAD. Prior-head green runs are historical only after any branch change.
