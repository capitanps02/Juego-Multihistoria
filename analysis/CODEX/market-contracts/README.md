# Market / contract authority — Codex handoff

Base audit: `main@ebef17057156c7721fc4a041552c9cf1b3fdb6ba`  
Branch: `t5/market-contract-authority`

## Scope

This folder is the implementation handoff for market, contracts, `CareerOffer`, loans and club transitions. Narrative copy remains owned by the age/content workstreams.

## Current authority

- Formal offer entity: `CareerOffer` in `src/simulation/offers.ts`.
- Persisted queue: `state.market.pending` (one offer at a time).
- Proposal authority: `proposeCareerChange()` builds terms on a detached state; it does not sign them.
- Acceptance/rejection authority: `respondToOffer()`.
- Atomic term application: `applyTerms()`.
- Narrative bridge: `offerBridge` + `respondToOffer()`.
- Read-only query surface added by this workstream:
  - `getActiveCareerOffers(state)`;
  - `getEligibleTransferOffers(state)`;
  - `getEligibleLoanOffers(state)`;
  - `getEligibleRenewalOffers(state)`;
  - `careerOfferKind(offer)`.
- Derived expiry visibility: `contractEmploymentStatus(state)` returns `expired_pending_resolution` at zero months instead of pretending that free agency exists.

## Non-negotiable distinction

`marketHeat`, `BIG_CLUB_INTEREST`, recruiter calls, scouting, rumours and negotiations are **interest**, not formal offers. A choice which says that the player accepts a concrete destination must consume a real `CareerOffer`.

## Confirmed blockers

1. **Age-18 market materialisation (#123):** the runtime does not currently prove a productive pre-age-20 path that materialises the required formal loan/transfer alternatives before `EVT_18_JAN_001` / `EVT_18_SUM_001`.
2. **Expired contract (#130):** confirmed zombie state. `monthsRemaining=0` can retain club/owner/registration/salary and normal appearances for years. There is no authoritative free-agent/unattached state in the save model. This branch exposes the unresolved state but does not invent a schema or forced transfer.
3. **Offer expiry/withdrawal:** `CareerOffer` has `date` but no persisted expiry or withdrawal transition; world time is frozen while an offer is pending.
4. **Contractual role:** role is not part of `CareerTerms`; a salary/duration/club offer cannot formally promise a squad role today.

## Content mutation debt

Broad static search found direct narrative writes to club/contract state in 18–20, 26–30 and 30–34. They are catalogued in `MARKET_AUTHORITY.md`. They are intentionally not edited here because doing so changes `EVENTS` and therefore `contentIdentity`; each must be converted by its content owner using the active content-lineage process.

## Files

- `MARKET_AUTHORITY.md`: API contract, lifecycle and mutation audit.
- `CONTRACT_TRANSITION_MATRIX.json`: machine-readable transition authority.
- `implementation-ready.json`: Codex task queue.
- `UNBLOCKED_CONTENT.md`: content readiness by age range.
- `CODEX_PROMPT.md`: ready-to-paste implementation prompt.

## QA owned here

- `scripts/test-offers.mjs`
- `scripts/test-t5-market-contract-authority.mjs`
- `.github/workflows/t5-market-contract-authority.yml`

No `EVENTS`, content freeze, content migration edge or `contentIdentity` is changed by this workstream.
