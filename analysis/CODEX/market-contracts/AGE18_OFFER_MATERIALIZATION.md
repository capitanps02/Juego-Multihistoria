# Age-18 formal offer materialisation — issue #123

Status: **architecture specified; runtime generation + EVENTS integration still blocked on allocated 18–20 content generation**.

Integration baseline when this contract was written: `main@6d2239ae1f89be97a7c5cf117d456cff9218aade`.

## Root cause

The absence of formal offers at age 18 is structural.

Productive world `CareerOffer` generation currently lives under `world-simulator.ts::professionalWeek()` for:

- `Renovación de contrato`;
- `Continuidad de la cesión`;
- `Propuesta de mercado`.

But `professionalWeek()` begins by returning when:

```ts
state.age < 20 || !state.professional.initializedAt20
```

The other productive runtime proposal path is the professional adapter when entering the age-20 professional stage.

Therefore age 18–19 currently produces only market **signals/context** such as interest flags; it has no productive path that materialises a real signable `CareerOffer` before the canonical JAN/SUM decisions.

## Existing canonical scene conflict

### EVT_18_JAN_001

The active scene exposes four conceptual routes:

1. stay if the club gives a reasonable role;
2. accept a loan;
3. accept a permanent transfer if a buyer exists;
4. wait for a better deadline option.

The legacy LOAN/TRANSFER paths are not backed by a real formal offer and contain direct employment mutations.

### EVT_18_SUM_001

The active scene exposes:

1. sign a stability renewal;
2. ask for shorter/more flexible renewal terms;
3. reject for now / take summer risk;
4. request an exit if there is a real external offer.

Legacy renewal outcomes directly change contract duration.

## Single-pending constraint

Current `MarketState` persists exactly one `market.pending: CareerOffer | null`.

That means one scene cannot truthfully present two independent formal offers simultaneously unless the architecture first gains approved multi-offer support.

Specifically:

- January cannot simultaneously prove a loan offer **and** a transfer offer with one `market.pending`;
- summer cannot simultaneously prove a same-club renewal **and** an external transfer offer with one `market.pending`.

Do not represent the missing second proposal as a choice label, destination string, marketHeat threshold or synthetic availability flag.

## Read-only offer kind authority

The market follow-up exposes:

```ts
eligibleCareerOfferKind(state)
facts.pendingCareerOfferKind
```

The fact is one of:

- `renewal`;
- `transfer`;
- `loan`;
- `loan_return`;
- `loan_conversion`;
- `null`.

It is derived from the real pending `CareerOffer`, is never persisted, consumes 0 RNG, and returns `null` if live `CareerTerms` no longer match `offer.before`.

This is the approved surface for deterministic offer-type gates/choice eligibility. Do not add `REAL_LOAN_AVAILABLE`, `REAL_TRANSFER_AVAILABLE` or equivalent flags.

## Smallest safe solution with current architecture

### Generation

Add one age-specific pre-20 market materialisation routine under market/world authority.

It may use the authorised world RNG stream to decide whether a formal proposal appears, but it must call the existing formal proposal authority so the result is a real `CareerOffer`.

Generation rules:

- at most one pending formal proposal;
- never run while another `market.pending` exists;
- interest/marketHeat may influence **probability**, never prove the offer after generation;
- exact destination and terms exist only after materialisation;
- proposal creation does not mutate live `CareerTerms`;
- response remains 0 RNG.

### January

With singular `market.pending`, the canonical event should expose only the formal action compatible with the concrete proposal:

- `facts.pendingCareerOfferKind == "loan"` -> LOAN can be signable;
- `facts.pendingCareerOfferKind == "transfer"` -> TRANSFER can be signable;
- the incompatible formal route is hidden/ineligible;
- stay/wait may remain as non-signing choices if canon maps them to reject/defer of that concrete proposal.

If canon requires LOAN and TRANSFER to both be simultaneously selectable concrete deals, stop: that requires multi-offer architecture or a scene split.

### Summer

Likewise:

- a real `renewal` pending offer can support the renewal/counter/reject branches;
- a real `transfer` pending offer can support the external-exit decision;
- one singular pending offer cannot support both independent deals at once.

If both must be simultaneous, use an approved multi-offer design or split/resequence the canonical scene.

## Atomic integration requirement

Do **not** land pre-20 generation without the matching canonical bridge.

`GameSession` gives a pending offer priority:

1. detects `state.market.pending`;
2. asks `selectOfferBridgeEvent()` for a matching narrative bridge;
3. presents the bridge if eligible;
4. otherwise returns with the generic offer surface owning the pending proposal.

Therefore generation and the intended JAN/SUM `offerBridge` conversion must be delivered in the same coordinator-allocated content generation, or the new formal proposal can be intercepted before the intended canonical scene.

## Loan terms invariant

A generated loan must preserve:

- parent `ownerClub`;
- loan destination as current `club` / `registrationClub` only after acceptance;
- `terms.loan = true`;
- valid deterministic duration;
- no permanent ownership move.

Save/load must retain parent and registration clubs exactly.

## Transfer invariant

A generated permanent transfer must establish in its proposed terms:

- concrete destination club;
- destination registration;
- destination ownership after acceptance;
- duration/salary/release clause according to approved generation policy.

No choice may invent `NEW_CLUB` or directly set club/owner/registration.

## Renewal invariant

A generated renewal is same-club formal terms. Accept signs exactly `offer.terms`. Counter/reject/defer do not mutate the current contract into hypothetical terms.

The scene may narrate desired shorter duration or clause flexibility, but a changed deal must be represented by a later formal proposal rather than rewriting the pending offer in place.

## Required acceptance tests

### Materialisation

- age 18 can deterministically produce a real formal offer under an authorised trigger;
- same initial state + same world RNG -> same proposal/no-proposal;
- no offer is created by eligibility reads;
- no generation when another offer is pending;
- generated terms do not change live `CareerTerms`.

### Kind / eligibility

- loan pending -> `facts.pendingCareerOfferKind == "loan"`;
- transfer pending -> `"transfer"`;
- renewal pending -> `"renewal"`;
- no pending -> `null`;
- stale `offer.before` -> `null`;
- fact read consumes 0 RNG.

### JAN bridge

- no real compatible offer -> LOAN/TRANSFER signable choice absent;
- loan pending -> LOAN can appear, TRANSFER cannot;
- transfer pending -> TRANSFER can appear, LOAN cannot;
- accept signs exact offer terms;
- stay/reject/defer leaves current employment unchanged;
- direct club/tier/owner/registration signing effects are removed.

### SUM bridge

- renewal pending -> renewal choices operate only through `respondToOffer()`;
- transfer pending -> exit choice consumes that real transfer offer;
- one pending offer is never represented as two independent deals;
- direct `contract.monthsRemaining` signing effects are removed.

### Session / saves

- pending offer save -> load -> same kind/terms;
- offer bridge is selected before generic offer UI for the intended canonical event;
- response provenance keeps eventId/choiceId/disposition;
- double click/replay remains idempotent;
- stale offer cannot be accepted after load.

## Codex status

- `CODEX-MKT-18-001 / EVT_18_JAN_001`: **BLOCKED ON PRE-20 MATERIALISATION + ALLOCATED CONTENT GENERATION**.
- `CODEX-MKT-18-002 / EVT_18_SUM_001`: **BLOCKED ON PRE-20 MATERIALISATION + SINGLE-OFFER CANON DECISION + ALLOCATED CONTENT GENERATION**.

The unknown architecture is now narrowed to one explicit product decision: keep singular-offer semantics and filter/split the scenes, or approve multi-offer support. Everything else should reuse existing `CareerOffer` authority.
