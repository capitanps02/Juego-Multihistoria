# Market / contract authority — Codex handoff

Original market authority integrated through PR #142 / merge commit `782b92c9a496293aeb33ad8b39f522a927374d6f`.

Current follow-up integration base: `main@c41e7de20daf3bd672ae54646428e921761008c8`  
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
  - `getEligibleCareerOffers(state)`;
  - `getEligibleTransferOffers(state)`;
  - `getEligibleLoanOffers(state)`;
  - `getEligibleRenewalOffers(state)`;
  - `careerOfferKind(offer)`;
  - `eligibleCareerOfferKind(state)`.
- Narrative causal projections:
  - `facts.pendingCareerOfferKind` exposes the compatible pending kind (`renewal`, `transfer`, `loan`, `loan_return`, `loan_conversion`) or `null`;
  - `facts.pendingCareerOffer` exposes a detached exact projection of the compatible formal proposal (`id`, `kind`, `date`, `reason`, `terms`) or `null`.
- Both offer facts are derived, never persisted, consume 0 RNG and fail closed to `null` for stale offers. Nested terms are directly condition-addressable, e.g. `facts.pendingCareerOffer.terms.club`, `.salary`, `.months`, `.releaseClause`, `.ownerClub`, `.registrationClub` and `.loan`.
- Follow-up hardening: all `getEligible*` queries fail closed when the pending offer's `before` terms no longer match live `CareerTerms`; `getActiveCareerOffers()` still exposes the stale pending evidence without mutating it.
- Derived expiry visibility: `contractEmploymentStatus(state)` returns `expired_pending_resolution` at zero months instead of treating a classifier/route token as proof that employment has actually ended.

## Non-negotiable distinction

`marketHeat`, `BIG_CLUB_INTEREST`, recruiter calls, scouting, rumours and negotiations are **interest**, not formal offers. A choice which says that the player accepts a concrete destination must consume a real `CareerOffer`.

## Confirmed blockers

1. **Age-18 market materialisation (#123):** generation H still records this as an Agent 3 blocker. Ordinary CareerOffer generation is under `professionalWeek()`, which returns before age 20. Exact offer facts solve deterministic type/terms gating once an offer exists, but a productive pre-20 materialisation path still has to be integrated atomically with the JAN/SUM content bridge. See `AGE18_OFFER_MATERIALIZATION.md`.
2. **Expired contract (#130):** confirmed P1 zombie state. `monthsRemaining=0` can retain club/owner/registration/salary and normal appearances for years. The model contains a dormant `professional.route = "free_agent"` value and classifiers that mention free agency, but there is no production transition that establishes it together with authoritative club/owner/registration/salary/football semantics. `GameState.club` remains a required string. See `CONTRACT_EXPIRY_SHARED_INVARIANT.md`.
3. **Offer expiry/withdrawal (#165):** `CareerOffer` has `date` but no persisted expiry/withdrawal/supersession lifecycle. In addition, `advanceWorldDayInPlace()` currently returns immediately while `market.pending` exists, so calendar time cannot cross an expiry boundary with an offer open. `assertMarket()` also derives `market.sequence` solely from player decision history plus pending state, so a separate system-closure ledger needs an explicit compatibility update. Do not mislabel system closure as player rejection or add an unreachable `expiresAt` without resolving time ownership.
4. **Contractual role/project:** sporting role or project promises are not part of `CareerTerms`; exact financial/employment terms do not themselves prove a squad-role guarantee or wider sporting plan.
5. **Veteran synthetic market (#164):** `late-career-engine.ts` still creates `VETERAN_OFFER_AVAILABLE` + `world.veteranOffer*` values rather than a real `CareerOffer`, and `EVT_34_MKT_001` signs duration directly. See `VETERAN_MARKET_BLOCKERS.md`.

## Content mutation debt

Broad static search found direct narrative writes to club/contract state in 18–20, 26–30, 30–34 and the veteran 34+ market path. They are catalogued in `MARKET_AUTHORITY.md` and `VETERAN_MARKET_BLOCKERS.md`. They are intentionally not edited here because changing `EVENTS` changes `contentIdentity`; each conversion must be owned by the allocated content generation.

A CI-backed direct-mutation audit now classifies every detected setter. `legacy_debt` and `legacy_runtime_bridge` have monotonic ceilings: they may shrink as content is converted, but new unowned mutations fail CI. See `DIRECT_MUTATION_AUDIT.md`.

## Files

- `MARKET_AUTHORITY.md`: API contract, lifecycle and mutation audit.
- `CONTRACT_TRANSITION_MATRIX.json`: machine-readable transition authority.
- `implementation-ready.json`: Codex task queue.
- `UNBLOCKED_CONTENT.md`: content readiness by age range.
- `CODEX_PROMPT.md`: ready-to-paste implementation prompt.
- `AGE18_OFFER_MATERIALIZATION.md`: root cause and atomic implementation contract for #123.
- `CONTRACT_EXPIRY_SHARED_INVARIANT.md`: exact shared decision surface and acceptance tests required to close #130.
- `DIRECT_MUTATION_AUDIT.md`: executable ownership baseline for direct market/contract writes.
- `VETERAN_MARKET_BLOCKERS.md`: synthetic 34+ market / retirement coupling handoff.

## QA owned here

- `scripts/test-offers.mjs`
- `scripts/test-t5-market-contract-authority.mjs`
- `scripts/audit-market-direct-mutations.mjs`
- `.github/workflows/t5-market-contract-authority.yml`

Focused QA proves the pending kind and exact terms projection are detached, deterministic/read-only, survive save/load, and fail closed to `null` when live terms diverge from `offer.before`. The audit prevents new direct signing bypasses while allowing the quantified legacy backlog only to decrease.

No `EVENTS`, content freeze, content migration edge or `contentIdentity` is changed by this follow-up.
