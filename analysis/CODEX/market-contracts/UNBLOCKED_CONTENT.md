# Unblocked / blocked market content

Original market authority integrated in PR #142 / `782b92c9a496293aeb33ad8b39f522a927374d6f`.  
Follow-up integration base: `main@d9cd3cf3b9d1f23ab2f082b66ef4a01f6177e7f2`.

`Codex ready` means the market/contract dependency is specified well enough to implement without inventing a second authority. It does **not** authorize an `EVENTS` change outside the active content-identity queue.

Authoritative deterministic offer-type gate:

```text
facts.pendingCareerOfferKind
```

Values: `renewal | transfer | loan | loan_return | loan_conversion | null`. `null` includes no offer and a stale pending offer whose `before` no longer matches live `CareerTerms`.

| Event | Age | Type | Blocker / authority | Codex ready |
|---|---:|---|---|---|
| `EVT_18_JAN_001` | 18 | loan / transfer / stay | #123 root cause located: productive offers only start in `professionalWeek` at 20. `facts.pendingCareerOfferKind` can now distinguish a real singular loan vs transfer, but pre-20 generation + content bridge must land atomically; current one-pending model cannot present both formal deals simultaneously. | **No — blocked** |
| `EVT_18_SUM_001` | 18 | renewal / exit | #123: same missing pre-20 generator. `renewal` vs `transfer` can now be gated authoritatively, but one `market.pending` cannot represent both deals simultaneously. | **No — blocked** |
| `EVT_20_MKT_001` | 20 | market | current generic scene uses `marketHeat`; canon must decide interest vs formal transfer. | **No — needs canon** |
| `EVT_22_CON_001` | 22 | contract talk | club conversation does not itself prove exact signable renewal terms. | **No — needs canon** |
| `EVT_22_CON_002` | 22 | contract expiry | #130: `expired_pending_resolution` visible, unattached employment representation unapproved. | **No — blocked** |
| `EVT_23_MKT_001` | 23 | formal transfer | real transfer offer + `facts.pendingCareerOfferKind="transfer"` + bridge + `respondToOffer`; stale terms fail closed. | **Yes** |
| `EVT_23_CON_001` | 23 | formal renewal | real renewal + `facts.pendingCareerOfferKind="renewal"` + bridge + response. | **Yes** |
| `EVT_24_MKT_001` | 24 | three simultaneous offers | one `market.pending` cannot back three destinations. | **No — blocked** |
| `EVT_24_JAN_001` | 24 | external offer / leverage | external transfer exists conceptually, but leverage cannot directly rewrite current salary. | **No — blocked** |
| `EVT_25_CON_001` | 25 | formal renewal | renewal kind + bridge + response; counter/defer remain non-signing. | **Yes** |
| `EVT_25_MKT_001` | 25 | coach contact | intentionally **not** a formal offer; no offer may be created/consumed. | **Yes** |
| `EVT_29_HOME_001` | 29 | home return | direct employment writes today; needs real transfer or future approved free-agent signing. | **No — blocked** |
| `EVT_32_HOME_001` | 32 | home return | same authority gap as age 29. | **No — blocked** |
| `EVT_34_CON_001` | 34 | veteran renewal | salary/duration representable; contractual role promise is not in `CareerTerms`. | **No — needs canon** |
| `EVT_34_MKT_001` | 34 | veteran market | #164: synthetic `VETERAN_OFFER_AVAILABLE/world.veteranOffer*` path bypasses CareerOffer and directly signs duration. | **No — blocked** |

## Exact Codex-ready count

- 18–20: **0**
- 20–23: **0**
- 23–26: **4**
- 26–30: **0**
- 30–34: **0**
- 34+: **0**

Ready 23–26 set:

1. `EVT_23_MKT_001`;
2. `EVT_23_CON_001`;
3. `EVT_25_CON_001`;
4. `EVT_25_MKT_001` — explicitly non-offer.

## Age-18 implementation contract

See `AGE18_OFFER_MATERIALIZATION.md`.

The remaining product decision is now explicit: either keep the singular pending-offer architecture and filter/split JAN/SUM according to `facts.pendingCareerOfferKind`, or approve multi-offer support. Do not fake simultaneous alternatives with flags.

## Stale offer invariant

A pending proposal remains inspectable through `getActiveCareerOffers`, but:

- `eligibleCareerOfferKind(state)` returns `null`;
- `facts.pendingCareerOfferKind` returns `null`;
- all `getEligible*` queries return no matching offer;
- `respondToOffer()` refuses acceptance;

when current `CareerTerms` no longer equal `offer.before`.

## Offer lifecycle blocker (#165)

Current runtime pauses world advancement whenever `market.pending` exists. Therefore a pending offer cannot naturally reach a later calendar expiry date. A safe lifecycle implementation needs both:

1. a persisted **system closure** representation (`expired | withdrawn | superseded`) that is not a player `reject`; and
2. an explicit time-ownership decision: either allow authoritative world/calendar advancement with a pending offer, or define another deterministic boundary that can close it.

`assertMarket()` currently derives `market.sequence` from player history plus the one pending offer, so a closure ledger also requires a compatible sequence invariant. Do not add `expiresAt` alone, clear pending without provenance, or reuse/decrement offer IDs.

## Other blockers

- #130: `CONTRACT_EXPIRY_SHARED_INVARIANT.md`.
- #164: `VETERAN_MARKET_BLOCKERS.md`.
- #165: persisted system-close authority + pending-offer/time policy are both required.
- Issue #6 is primarily age-26 seed/canon chronology; market authority becomes relevant only where a real employment change occurs.

The authority can represent one-/two-year duration, reduced salary, renewal, permanent transfer, loan/return/conversion, rejection/counter/defer and absence of offer. It still cannot encode a contractual squad-role promise, and no-market must not itself imply retirement.
