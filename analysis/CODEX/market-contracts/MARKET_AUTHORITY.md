# Market authority

Runtime audit base: `main@ebef17057156c7721fc4a041552c9cf1b3fdb6ba`.  
Coordination re-ground: `main@c2a0b3ab9f63ac335d334846ee730fa7c6d1e6b6`.

## 1. Vocabulary

### Interest

Non-binding signals such as `reputation.marketHeat`, `BIG_CLUB_INTEREST`, `FOREIGN_DEV_INTEREST`, scouting, a coach/recruiter call or a narrative contact. Interest may justify dialogue or future generation, but it cannot be accepted as a transfer.

### Negotiation

A conversation about possible terms. `counter` and `defer` in an offer bridge close the current proposal without signing it. A later counter-offer must be a new formal `CareerOffer`.

### Formal offer

A persisted `CareerOffer` in `state.market.pending` with exact `before` and proposed `terms`. This is the only state that a concrete accept/reject contract decision may consume.

### Accepted deal

A formal offer closed by `respondToOffer()` with an accepted action. Only then can `applyTerms()` make the proposed `CareerTerms` live.

## 2. Persisted model

`CareerTerms` currently contains:

- club;
- tier / leagueTier;
- months;
- salary;
- releaseClause;
- ownerClub;
- registrationClub;
- prestige data;
- route;
- abroad;
- loan;
- bigClub.

`CareerOffer` persists:

- `id`;
- `date`;
- `reason`;
- `before`;
- `terms`.

It does **not** currently persist `offerType`, `expiresAt`, contractual squad role or withdrawal status. This workstream therefore derives an offer kind from `before/terms` and does not change the save schema.

## 3. Authoritative APIs

| Operation | Authority | Notes |
|---|---|---|
| Create/materialise a proposal | `proposeCareerChange(state, reason, callback)` | Callback runs on a detached clone; changed `CareerTerms` become `market.pending`. Generation may consume its authorised world RNG stream, but reading/accepting does not. |
| Query active formal offer | `getActiveCareerOffers(state)` | Read-only detached snapshot. Today cardinality is 0/1 because `market.pending` is singular. |
| Query transfer | `getEligibleTransferOffers(state)` | Uses derived `careerOfferKind()`. |
| Query loan | `getEligibleLoanOffers(state)` | Uses derived `careerOfferKind()`. |
| Query renewal | `getEligibleRenewalOffers(state)` | Same-club terms change. |
| Display ordinary offer | `GameSession` ViewModel | `market.pending` selects offer screen. Internal terms are filtered from the public view. |
| Display narrative offer decision | `offerBridge` / `selectOfferBridgeEvent()` | Requires real pending offer; deterministic; no RNG in eligibility. |
| Accept | `respondToOffer(..., "accept")` | Applies `offer.terms` exactly through `applyTerms()`. |
| Reject | `respondToOffer(..., "reject")` | Keeps current `CareerTerms`, records decision, clears pending. |
| Delegate | `respondToOffer(..., "delegate")` | Deterministic policy; may accept only under existing criteria. |
| Counter | `respondToOffer(..., "counter", source)` | Narrative-only disposition; persisted action is reject; no new terms applied. |
| Defer | `respondToOffer(..., "defer", source)` | Narrative-only disposition; closes current proposal; no contract applied. |
| Change club/owner/registration/salary/duration/clause after signing | `applyTerms()` called by accepted `respondToOffer()` | Atomic within the contract authority. |
| Withdrawal | **not modelled** | Do not simulate by mutating `market.pending` from narrative. |
| Offer expiry | **not modelled** | No persisted `expiresAt`; pending offer freezes world advance. |
| Contract expiry | `monthlyContractTick()` reaches 0; `contractEmploymentStatus()` exposes `expired_pending_resolution` | Existing route/classifier scaffolding is insufficient to establish real unattached employment. |
| Free agency | **partially scaffolded, not authoritatively transitioned** | `professional.route` allows `free_agent`, but no production transition establishes full employment invariants. Do not infer it merely from a seed/tag or `monthsRemaining===0`. |

## 4. Offer-kind derivation

`careerOfferKind(offer)` is intentionally non-persisted for save compatibility:

- `loan`: proposed terms retain `loan=true`;
- `loan_return`: previous terms are a loan and the player returns to the parent owner;
- `loan_conversion`: previous terms are a loan and the registration club becomes owner;
- `transfer`: club/owner/registration changes without loan;
- `renewal`: same employment clubs with changed terms.

If future design needs richer kinds, evolve the save schema deliberately instead of smuggling metadata into narrative flags.

## 5. Correct and incorrect usage

Incorrect:

```ts
state.club = destinationClub;
state.contract.salaryMonthly = 8000;
```

Incorrect narrative effect:

```ts
set("club", "DEVELOPMENT_CLUB")
```

Correct generation:

```ts
proposeCareerChange(state, "Propuesta de mercado", draft => {
  draft.club = destinationClub;
  draft.contract.salaryMonthly = 8000;
});
```

Correct player decision:

```ts
const [offer] = getEligibleTransferOffers(state);
respondToOffer(state, offer.id, "accept");
```

Correct narrative bridge:

```ts
offerBridge: {
  choiceActions: {
    ACCEPT: "accept",
    REJECT: "reject",
    ASK_CHANGE: "counter",
    WAIT: "defer"
  }
}
```

## 6. Renewal

The current world simulation can materialise same-club renewal proposals when the professional player is under 34, has <=5 months remaining and is not in `CONTRACT_DISPUTE`. The proposal may use the world RNG stream. Signing remains `respondToOffer()` and therefore does not consume RNG.

A direct rejection suppresses an identical formal renewal on the exact same `CareerTerms` snapshot. Once terms naturally change (for example another contract month elapses), the club may generate a new formal proposal.

## 7. Transfer

A transfer is represented by a `CareerOffer` whose accepted `terms` update club, registration and normally ownership together. `proposeCareerChange()` normalises a changed destination so a non-loan move owns and registers the player at that destination and ensures a minimum contract duration.

Interest, scouting or `marketHeat` are not transfer offers.

## 8. Loans

A loan must preserve:

- `ownerClub` = parent club;
- `registrationClub` = loan club;
- `club` = current playing/registration club;
- `loan=true` / `LOAN_ACTIVE=true`.

A return proposal changes registration/club back to parent and clears loan status only after acceptance. A permanent conversion changes ownership to the registration club only after acceptance. Focused tests cover start, parent preservation, return and conversion.

## 9. Contract expiry and free agency

Issue #130 is confirmed. Current production semantics can leave a player at zero months while retaining club, owner, registration, salary and sporting activity for years.

The repository contains **partial free-agency scaffolding**, but not a complete employment transition:

- `ProfessionalState.route` accepts `"free_agent"`;
- save validation accepts that route value;
- state classifiers read `p.route === "free_agent"` and/or emit labels such as `STATE26_FREE_AGENT`;
- `STATE26_FREE_AGENT` itself can be emitted merely from `monthsRemaining <= 1 && marketHeat >= 35`, so it is a classifier tag, not proof that the employment state changed;
- repository search found no production assignment that transitions the player into `professional.route = "free_agent"`;
- `GameState.club`, `ProfessionalState.ownerClub` and `registrationClub` remain required strings, and no canonical unattached sentinel or ownership semantics are defined;
- no authoritative rule defines salary, football availability, scheduling or re-signing while unattached.

Therefore this workstream does **not** equate zero months, a `FREE_AGENT` tag/seed, or the dormant route token with actual free agency. `contractEmploymentStatus(state)` reports:

- `active_contract` > 6 months;
- `expiring` = 1..6 months;
- `expired_pending_resolution` <= 0 while playing;
- `retired` once retirement is terminal.

A real #130 fix must decide, together with save/calendar/football/content owners:

- whether `club` may become null or whether an explicit, validated unattached sentinel exists;
- what `ownerClub` / `registrationClub` mean while unattached;
- whether `route="free_agent"` becomes the authoritative employment marker or remains descriptive;
- salary semantics;
- whether football appearances and club scheduling stop;
- when/where free-agent offers materialise;
- how historical saves already at zero months migrate without inventing history;
- how `SEED_FIRST_FREE_AGENCY` and classifier tags reflect a real transition rather than substituting for one.

Until that contract is approved, no forced transfer, salary=0 hack, synthetic `FREE_AGENT` flag or route-only patch is authorised.

## 10. Atomicity and side effects

`applyTerms()` atomically updates the contractual/core employment fields it owns:

- `club` / `tier`;
- contract duration/salary/release clause;
- owner/registration/league/prestige/route;
- `world.ownerClub`;
- `ABROAD_ROUTE`, `LOAN_ACTIVE`, `BIG_CLUB`.

It does not manually rewrite NPC memory, locker state, seeds or scheduler history. Those systems must react through their existing state/fact mechanisms. There is no dedicated club-transition event bus today; adding one would be a cross-owner architecture change and is not required merely to keep CareerTerms authoritative.

## 11. History / provenance

Every resolved offer is copied into `market.history` as an `OfferDecision`, including the full offer snapshot, action, acceptance result and explanation. Narrative bridges additionally persist `source` with:

- history index;
- event ID;
- choice ID;
- exact disposition.

Counter/defer preserve their exact disposition in provenance while remaining non-signing actions. Historical records are not rewritten by this workstream.

## 12. Save / load

The market state is save-backed and validated. Historical saves without market state initialise an empty v1 market without signing anything. Existing tests cover pending offer persistence, accepted/rejected decisions, rollback, replay protection and corrupt offer/history rejection.

This workstream adds no persisted field, so schema version remains unchanged.

## 13. RNG contract

- Querying offers: 0 RNG.
- `careerOfferKind`: 0 RNG.
- Accept/reject/counter/defer/delegate decision logic: 0 RNG.
- Contract status classification: 0 RNG.
- Offer generation may use the caller's authorised world RNG stream.
- Narrative eligibility must never consume RNG to decide whether a formal offer exists.

## 14. Direct mutation audit

### `valid_authority`

- `src/simulation/offers.ts::applyTerms()` — intended central mutation point.
- mutations inside `proposeCareerChange()` callbacks in `world-simulator.ts` — detached proposal staging, not live signing.

### `valid_staging_but_fragile`

- `src/simulation/professional-adapter.ts::adaptProfessionalContext()` writes club/contract fields temporarily, then `adaptState20ToProfessional()` restores the original `CareerTerms` and materialises the proposal through `proposeCareerChange()`. It is not a live signature, but future refactors must preserve the rollback-before-offer pattern.

### `test_fixture`

- scripts which mutate club/contract to construct a test scenario are acceptable when no production path consumes those direct writes.

### `legacy_debt / unsafe_runtime`

Confirmed content patterns on audited main:

- `src/content/events/18_20/canonical-events.ts`
  - `EVT_18_JAN_001/LOAN` writes `club`, `tier`, `LOAN_ACTIVE` directly;
  - `EVT_18_SUM_001` writes `contract.monthsRemaining` from narrative outcomes.
- `src/content/events/18_20/conditional-events.ts` contains direct development-club loan writes.
- `src/content/events/18_20/principal-additions.ts` contains several direct development-club writes.
- `src/content/events/23_26/principal-events.ts`
  - `EVT_24_MKT_001` presents three concrete offer profiles while runtime persists only one pending formal offer;
  - `EVT_24_JAN_001` changes `contract.salaryMonthly` directly despite presenting a concrete external offer.
- `src/content/events/26_30/principal-events.ts`
  - `EVT_29_HOME_001/A` directly writes route, owner, registration and club to UDV.
- `src/content/events/30_34/principal-events.ts`
  - `EVT_32_HOME_001/A` directly writes route, owner, registration and club to UDV.

These are **not** silently edited here because changing event effects changes `EVENTS` fingerprints/content identity. Content owners must replace concrete club/contract outcomes with a real pending offer + `offerBridge` (or preserve a purely non-binding intent scene) under the active lineage.

## 15. Content rule for Codex

Before implementing any market/contract choice, ask in this order:

1. Is this only rumour/scouting/contact/interest? If yes, **do not create an offer** merely because the scene exists.
2. Does the player see exact signable terms or a concrete destination? If yes, require a real compatible `CareerOffer`.
3. Does the choice sign/reject/counter/defer that offer? Use the offer bridge and `respondToOffer()`.
4. Does it merely request that negotiations begin? Record intent/memory only; any eventual proposal must be materialised separately.
5. Never use `marketHeat`, a seed, classifier tag, dormant `route="free_agent"` token or boolean `hasOffers` as proof of a formal offer or employment transition.
