# Veteran market authority blockers

Audit target: current 34+ runtime/content on the T5 market authority branch.

## Confirmed synthetic market path

`src/simulation/late-career-engine.ts::lateCareerPreseason()` currently generates veteran market state through:

- `flags.VETERAN_OFFER_AVAILABLE`;
- `world.veteranOfferRole`;
- `world.veteranOfferMonths`;
- `world.veteranOfferSalary`.

This is market information, but it is **not** a `CareerOffer` and therefore cannot be signed through `respondToOffer()`.

`src/content/events/34_plus/principal-events.ts::EVT_34_MKT_001` then treats that flag as a concrete offer and accepts by directly writing `contract.monthsRemaining` (12 or 24 months). That is a legacy synthetic-offer path and violates the same authority rule as the age-18 direct club changes.

## Why this branch does not patch it directly

A safe fix must be atomic across runtime generation and content consumption:

1. `lateCareerPreseason()` must materialise an actual `CareerOffer` with veteran salary/duration/destination semantics;
2. `EVT_34_MKT_001` must consume that exact offer through an `offerBridge` / `respondToOffer()`;
3. the generic offer screen must not consume the intended narrative proposal before the canonical veteran scene;
4. contractual role promises cannot be silently encoded because `CareerTerms` currently has no squad-role field;
5. changing `EVT_34_MKT_001` changes `EVENTS` / `contentIdentity`, so it must be the coordinator-allocated next adjacent content generation.

Landing only step 1 would change player-facing scheduling. Landing only step 2 would leave no real offer to consume. Therefore this is deliberately documented as a cross-owner blocker instead of being half-fixed.

## Retirement coupling found in the same engine

`lateCareerPreseason()` also automatically calls the retirement state transition to `decided` with reason `no_market` after repeated no-market windows and low demand.

Market authority should expose whether a formal offer exists; it should not own the player's retirement decision. The retirement workstream must decide whether the no-market condition:

- creates a retirement **context** only;
- schedules a retirement decision scene;
- or is allowed to make a terminal/near-terminal transition automatically.

AGENTE 3 does not change that rule.

## Codex contract for 34+

Until an allocated integration batch exists:

- treat `VETERAN_OFFER_AVAILABLE` as legacy market debt, not a formal offer;
- do not create new narrative choices that sign `world.veteranOffer*` values directly;
- do not add more `contract.monthsRemaining` / salary direct effects to veteran events;
- do not infer retirement from absence of `CareerOffer`;
- a one-year or two-year veteran deal is technically representable through existing `CareerOffer` duration/salary terms once generation is converted;
- a promised playing role remains outside current `CareerTerms` and must not be fabricated.

## Required future acceptance tests

When the coordinated 34+ fix is implemented, require:

- veteran offer generation creates a real `CareerOffer`;
- exact generated salary and duration are visible through the offer authority;
- accept signs exact terms through `respondToOffer()`;
- reject leaves current contract unchanged;
- save/load preserves the pending veteran offer;
- 0 RNG in accept/reject/eligibility;
- RNG is consumed only by authorised veteran offer generation;
- no `set("contract.monthsRemaining", ...)` signing effect remains in `EVT_34_MKT_001`;
- no synthetic boolean is accepted as proof of a signable deal;
- no-market behavior does not cross into retirement ownership without the retirement agent's explicit rule.
