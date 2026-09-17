# Market / contract authority — Codex handoff

Original market authority integrated through PR #142 / merge commit `782b92c9a496293aeb33ad8b39f522a927374d6f`.

Current follow-up integration base: `main@176317c5708995bb72fa40af9dd45dffc9838093`  
Follow-up branch: `t5/market-contract-followup`

`implementation-ready.json` retains generation-time provenance fields where useful; current `main`, this README and the PR base are the integration authority.

## Scope

This folder is the implementation handoff for market, contracts, `CareerOffer`, loans and club transitions. Narrative copy remains owned by the age/content workstreams.

## Current authority

- Formal offer entity: `CareerOffer` in `src/simulation/offers.ts`.
- Persisted queue: `state.market.pending` (one offer at a time).
- Proposal authority: `proposeCareerChange()` builds terms on a detached state; it does not sign them.
- Acceptance/rejection authority: `respondToOffer()`.
- Atomic term application: `applyTerms()`.
- Narrative bridge: `offerBridge` + `respondToOffer()`.
- Read-only query surface:
  - `getActiveCareerOffers(state)`;
  - `getEligibleTransferOffers(state)`;
  - `getEligibleLoanOffers(state)`;
  - `getEligibleRenewalOffers(state)`;
  - `careerOfferKind(offer)`.
- Follow-up hardening: `getEligible*` fails closed when the pending offer's `before` terms no longer match live `CareerTerms`; `getActiveCareerOffers()` still exposes the stale pending evidence without mutating it.
- Derived expiry visibility: `contractEmploymentStatus(state)` returns `expired_pending_resolution` at zero months instead of treating a classifier/route token as proof that employment has actually ended.

## Non-negotiable distinction

`marketHeat`, `BIG_CLUB_INTEREST`, recruiter calls, scouting, rumours and negotiations are **interest**, not formal offers. A choice which says that the player accepts a concrete destination must consume a real `CareerOffer`.

## Confirmed blockers

1. **Age-18 market materialisation (#123):** the runtime does not currently prove a productive pre-age-20 path that materialises the required formal loan/transfer alternatives before `EVT_18_JAN_001` / `EVT_18_SUM_001`.
2. **Expired contract (#130):** confirmed P1 zombie state. `monthsRemaining=0` can retain club/owner/registration/salary and normal appearances for years. The model contains a dormant `professional.route = "free_agent"` value and classifiers that mention free agency, but there is no production transition that establishes it together with authoritative club/owner/registration/salary/football semantics. `GameState.club` remains a required string. See `CONTRACT_EXPIRY_SHARED_INVARIANT.md`.
3. **Offer expiry/withdrawal:** `CareerOffer` has `date` but no persisted expiry or withdrawal transition; world time is frozen while an offer is pending.
4. **Contractual role:** role is not part of `CareerTerms`; a salary/duration/club offer cannot formally promise a squad role today.
5. **Veteran synthetic market:** `late-career-engine.ts` still creates `VETERAN_OFFER_AVAILABLE` + `world.veteranOffer*` values rather than a real `CareerOffer`, and `EVT_34_MKT_001` signs duration directly. See `VETERAN_MARKET_BLOCKERS.md`.

## Content mutation debt

Broad static search found direct narrative writes to club/contract state in 18–20, 26–30, 30–34 and the veteran 34+ market path. They are catalogued in `MARKET_AUTHORITY.md` and `VETERAN_MARKET_BLOCKERS.md`. They are intentionally not edited here because changing `EVENTS` changes `contentIdentity`; each conversion must be owned by the allocated content generation.

## Files

- `MARKET_AUTHORITY.md`: API contract, lifecycle and mutation audit.
- `CONTRACT_TRANSITION_MATRIX.json`: machine-readable transition authority.
- `implementation-ready.json`: Codex task queue.
- `UNBLOCKED_CONTENT.md`: content readiness by age range.
- `CODEX_PROMPT.md`: ready-to-paste implementation prompt.
- `CONTRACT_EXPIRY_SHARED_INVARIANT.md`: exact shared decision surface and acceptance tests required to close #130.
- `VETERAN_MARKET_BLOCKERS.md`: synthetic 34+ market / retirement coupling handoff.

## QA owned here

- `scripts/test-offers.mjs`
- `scripts/test-t5-market-contract-authority.mjs`
- `.github/workflows/t5-market-contract-authority.yml`

No `EVENTS`, content freeze, content migration edge or `contentIdentity` is changed by this follow-up.
