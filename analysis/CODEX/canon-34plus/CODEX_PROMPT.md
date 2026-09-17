# Codex prompt — Canon 34+ / Agent 8

Repo: `capitanps02/Juego-Multihistoria`  
Branch: `t51/canon-34plus`  
Base: always re-check latest `main`.  
No auto-merge. Do not register 34+ runtime until #59 authorizes its serialized turn.

## Ownership
Implement only ordinary late-career 34+ content. Terminal protagonist retirement, announcement, final career closure, last-match terminal handling and epilogues belong to Agent 9 / PR #118.

## Read first
1. `CURRENT_STATE.json`
2. `SHARED_OWNER_ROUTING.json`
3. `CANON_STATUS.json`
4. `AUTHORITY_MATRIX.json`
5. `CONDITIONAL_RECONCILIATION.json`
6. `CONDITIONAL_AUTHORITY_MATRIX.json`
7. `CONDITIONAL_HANDOFF.md`
8. `CANONICAL_CARD_COVERAGE.json`
9. `implementation-ready.json`
10. `SEED_OWNERSHIP.md`
11. `T52_SEED_HANDOFF.json`
12. Wave A–E implementation/test packages
13. `BLOCKERS.md`
14. `CONTINUITY_CHAINS.md`
15. `RETIREMENT_HANDOFF.md`
16. canonical source `analysis/2026-09-11/guion-extraido.txt`, especially section 25.13.

## Current preparation state
- principal canon: **50**, split 43 Agent 8 + 7 Agent 9;
- principal identities reconciled: **50/50**;
- ordinary principal cards prepared: **43/43**;
- Agent-8 principal runtime: **0/43**;
- canonical conditionals: **32 exact IDs**;
- conditional identity/authority coverage: **32/32**;
- canonical conditional runtime accreditation: **0/32**;
- Pasada-7 seeds: **54 exact IDs**, 45 ordinary + 9 terminal, plus 14 bridge concepts.

Preparation does not equal activation.

## Absolute lineage rule
Issue #59's multi-hop migration engine is already on main, but serialized content ownership still blocks 34+.

Current active chain is `PRE -> B1a -> C -> D -> E -> F -> G -> H`. Coordination explicitly states that no 26–30, 30–34 or 34+ branch may register a successor from H now. Earlier repairs serialize first; then 26–30; then 30–34; only after the final authoritative 30–34 predecessor may 34+ become next.

Therefore:
- do not freeze a 34+ contentIdentity now;
- do not add a parallel H successor;
- do not reuse any historical/provisional target hash;
- at the actual 34+ turn, re-ground and calculate only the adjacent predecessor→34+ generation.

## Seed prerequisite
Issue #180 is implemented in **PR #191**, which is ready for review and exact-head green but not yet integrated.

PR #191 provides:
- 54 exact canonical Pasada-7 seed IDs;
- exact 45+9 producer split;
- exact producer provenance;
- 14 bridge-memory dispositions;
- no fuzzy legacy→canonical aliasing.

Do not fabricate seed instances before their canonical producer occurs, and do not activate 34+ while PR #191 is absent from main.

## Shared runtime implementation order
For market/free-agency work, follow this dependency chain exactly:

`PR #156 / #124 -> #157 -> #130 -> #176`

### #156 sport boundary
Candidate authoritative weekly match/usage producer. Once integrated it can expose factual fixture/calendar/squad/bench/start/appearance/minutes/injury-unavailable history.

It deliberately does **not** establish results, goals, assists, cards, awards or generic records.

### #157 MarketState v2
Do not build veteran market against the singular `market.pending` model and then rewrite it. #157 will define one authoritative formal-offer collection, stable offer IDs, deterministic v1 migration, exact selection and durable system closure provenance.

### #130 employment/unattached
Implementation-ready contract after #156, preferably composed after #157:
- `contracted`;
- `unattached`;
- `expired_pending_resolution` for ambiguous legacy zero-month saves.

A real new-game natural expiry transitions `contracted -> unattached` once, deterministically and 0 RNG. While unattached there is no ordinary club salary/football/renewal/current-club authority. Accepted formal offer is the only reattachment path. No retirement is implied.

### #176 veteran market
Implement after #157/#130. It owns factual veteran offer production and veteran approach/medical-assessment facts.

Already representable: salary, months, numeric release clause when truly a release clause, destination/owner/registration/loan/tier.

Do not pretend the formal terms represent:
- guaranteed minutes/starting obligation;
- bonuses;
- bilateral termination distinct from a numeric release clause;
- player+liaison role;
- ambassador/commercial role.

A failed club medical is not a CareerOffer. Use #176's factual veteran approach/assessment authority when implemented.

## Other factual owners
- **#174** — concrete ordinary list publications and tournament preliminary/final squad facts; implement after #156.
- **#199** — final result/goals/assists/cards when produced, awards and record truth.
- **#200** — real injury episode + rehab/clearance/return chronology.
- **#201** — finance, sponsor, stadium/closed-door and staff-crisis/player-coach world incidents, or explicit fail-closed decision where no justified producer exists.
- **#169** — coach tenure/change/profile facts.
- **#177** — routing guard only, not a new generic NPC subsystem.

## Late-career actor rules
Use `AUTHORITY_MATRIX.json` v4.

- `EVT_35_AGT_001`: existing `resolveActiveAgent()` or explicit null. No #177 implementation dependency.
- `EVT_35_DUAL_001`: generic club voice is allowed unless canon requires named continuity; do not attach guessed T5.3 knowledge/relationship effects.
- `EVT_36_CCH_001`: factual coach tenure/profile comes from #169; do not force a persistent NPC.
- `EVT_34_DORSAL_001` and `EVT_34_MENTOR_001`: generic non-persistent young actor is allowed only if canon does not require cross-scene named continuity or relationship/knowledge mutation.
- `EVT_35_RECORD_001`: record truth is #199; persistent identity only when explicitly required/certified.
- `EVT_36_PEER_001`: remain fail-closed until exact peer identity + causal peer-retirement history exists.

## Conditional canon
Documento Maestro section 25.13 defines **32** canonical conditional IDs. Current engine also has 32 rows, but that is not coverage:
- exact overlap: 5;
- same-ID semantically accredited: 0;
- canonical missing exact IDs: 27;
- technical engine extra exact IDs: 27;
- runtime-accredited canonical conditionals: 0/32.

Issue **#192** owns exact conditional content. The former #195 gap is coordination-complete; use the explicit owners in `CONDITIONAL_AUTHORITY_MATRIX.json` v3:
- awards/records -> #199;
- major injury/rehab -> #200;
- finance/sponsor/stadium/staff crisis -> #201;
- medical clearance -> #176.

Do not treat closed #195 as proof those facts exist.

Five same-ID rows still require reimplementation:
- `CEVT_34_MAJOR_COMEBACK`;
- `CEVT_36_NO_MEDICAL_CLEARANCE`;
- `CEVT_38_OFFER_AFTER_RETIREMENT_ANNOUNCED`;
- `CEVT_RET_NO_LAST_MATCH`;
- `CEVT_RET_STORYBOOK_LAST_GOAL`.

`CEVT_RET_RECONSIDER` is not canonical. Canon uses `CEVT_38_RETIREMENT_REVERSAL`; no silent alias, history rewrite or pending-decision reinterpretation.

## First principal activation target
Only after serialized Wave 0 is actually satisfied:
- `EVT_35_FAM_001`;
- `EVT_35_BODY_001`;
- `EVT_35_IMG_001`;
- `EVT_36_MED_001`.

Do not activate these now.

## Hard rules
- no direct club/owner/registration/contract mutation from narrative choices;
- no synthetic CareerOffer;
- no `marketHeat`, rumor, seed or flag as formal offer;
- no `monthsRemaining == 0` as free agency;
- no synthetic fixture/start/bench/minutes/result/goal/assist/record/award/call-up/omission/penalty/last-match fact;
- no inferred persistent NPC identity;
- no age-only decline or retirement;
- no technical conditional proxy as canonical factual authority;
- preserve history, pending fingerprints, seed provenance and frozen legacy definitions;
- no mass seed closure at retirement;
- terminal career state changes remain Agent 9;
- unavailable fact => fail closed.

## QA when an active batch eventually becomes authorized
Run focused scene/authority tests, save/load and pending provenance, seed producer/scope audit, migration tests, `npm run build`, `npm test` and Repository Integrity on the exact candidate HEAD. Never cite a prior HEAD's green run as certification after modifying the branch.
