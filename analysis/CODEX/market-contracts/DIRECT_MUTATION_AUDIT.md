# Direct market / contract mutation audit

This audit is a guardrail around the CareerOffer authority. It does **not** declare every direct assignment invalid: some mutations are legitimate initialization, calendar erosion or detached proposal construction. It classifies ownership so new runtime bypasses cannot be added silently.

Executable audit: `scripts/audit-market-direct-mutations.mjs`.

## Baseline classes

| Classification | Baseline / ceiling | Meaning |
|---|---:|---|
| `valid_authority` | observed 13 | Central CareerOffer authority in `src/simulation/offers.ts`. |
| `proposal_staging` | observed 13 | Mutations inside the detached callback passed to `proposeCareerChange()`. They construct terms; they do not sign live state. |
| `transition_proposal_builder` | observed 11 | Age-20 adapter temporarily builds proposed CareerTerms, restores `before`, then materialises a CareerOffer. |
| `calendar_contract_tick` | observed 1 | Monthly deterministic decrement of `contract.monthsRemaining`. Reaching zero does not itself resolve free agency; #130 remains separate. |
| `legacy_runtime_bridge` | **ceiling 3** | Resolver repair of owner/registration after legacy narrative effects change `club`. Compatibility debt, not approved signing authority. |
| `legacy_debt` | **ceiling 46** | Direct market/contract mutations inside narrative event definitions. These are scheduled for owner/content-lineage conversion to CareerOffer bridges. |
| `unsafe_runtime` | **must be 0** | Any direct mutation with no approved owner/classification. CI fails. |

The two debt ceilings are monotonic: they may decrease as scenes are converted, but CI fails if they increase.

## Important interpretation

`legacy_debt` is not permission to add more direct setters. It is a quantified migration backlog. New content must not use direct `club`, ownership, registration or contract signing effects merely because older content still contains them.

`legacy_runtime_bridge` exists only because old narrative effects can mutate `club`. Once those effects are removed, the resolver bridge should shrink to zero and be deleted rather than promoted to permanent authority.

## Age-20 adapter

`adaptState20ToProfessional()` currently:

1. snapshots authoritative `CareerTerms` as `before`;
2. invokes `adaptProfessionalContext()` to calculate a proposed professional state;
3. snapshots those terms as `proposed`;
4. restores `before` through `applyTerms()`;
5. calls `proposeCareerChange()` with `proposed`.

Therefore direct assignments inside `adaptProfessionalContext()` are classified as a proposal builder rather than a live signature. Any future refactor must preserve the no-leak invariant and focused tests.

## Calendar tick and #130

`monthlyContractTick()` is allowed to decrement the remaining duration deterministically. It is **not** allowed to decide what unattached employment means. `monthsRemaining === 0` remains `expired_pending_resolution` until the shared #130 invariant is approved.

## Required use by Codex

Before implementing market/contract content:

- run the audit;
- do not increase either debt ceiling;
- do not add an `unsafe_runtime` setter;
- use `CareerOffer` + `respondToOffer()` for signable changes;
- use proposal staging only in authorised market/world generation;
- treat interest, flags and narrative seeds as non-signing context.
