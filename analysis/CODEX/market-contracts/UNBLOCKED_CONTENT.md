# Unblocked / blocked market content

Original market authority integrated in PR #142 / `782b92c9a496293aeb33ad8b39f522a927374d6f`.  
Follow-up base: `main@06762a0557c4e92b189e52151c71d6c1af831ee5`.

`Codex ready` here means that the technical market/contract dependency is sufficiently specified to implement the content without inventing a second authority. It does **not** grant permission to skip the active content-identity lineage; Codex must re-read the coordinator queue immediately before touching `EVENTS`.

| Event | Age | Type | Previous blocker | Authority available | Codex ready |
|---|---:|---|---|---|---|
| `EVT_18_JAN_001` | 18 | loan / market | #123: proxy interest + direct club mutation, no proven formal age-18 offer | Query APIs exist; generation/bridge must still be integrated atomically | **No — blocked** |
| `EVT_18_SUM_001` | 18 | renewal / exit | #123: direct contract duration effects; external exit requires real offer | Renewal/transfer query + response APIs exist; age-18 materialisation still absent | **No — blocked** |
| `EVT_20_MKT_001` | 20 | market | current generic scene uses `marketHeat`; formal-offer premise not reconciled | transfer query/bridge available | **No — needs canon** |
| `EVT_22_CON_001` | 22 | contract talk | unclear whether the conversation is a formal signable renewal | renewal query/bridge available | **No — needs canon** |
| `EVT_22_CON_002` | 22 | contract expiry | depends on real expiry/free-agency semantics | `expired_pending_resolution` is visible; shared employment representation remains unapproved | **No — #130** |
| `EVT_23_MKT_001` | 23 | formal transfer offer | #83 needed an authoritative offer/session bridge | `getEligibleTransferOffers` + `offerBridge` + `respondToOffer`; stale terms fail closed in follow-up | **Yes** |
| `EVT_23_CON_001` | 23 | formal renewal | #83 needed formal same-club terms and safe counter/reject | `getEligibleRenewalOffers` + bridge + response; stale terms fail closed | **Yes** |
| `EVT_24_MKT_001` | 24 | three simultaneous offers | singular `market.pending` cannot back three destinations | no approved multi-offer authority | **No — blocked** |
| `EVT_24_JAN_001` | 24 | external offer / leverage | current effects change salary directly | transfer authority exists, but leverage-to-renewal needs separate formal proposal | **No — blocked** |
| `EVT_25_CON_001` | 25 | formal renewal | #83 needed accept/counter/defer without direct contract writes | renewal query + bridge + response | **Yes** |
| `EVT_25_MKT_001` | 25 | direct coach contact | #81 risked confusing contact with offer | explicit rule: required offer type = none | **Yes** |
| `EVT_29_HOME_001` | 29 | home return | direct owner/registration/club writes | transfer authority exists, but no guaranteed matching home offer | **No — blocked** |
| `EVT_32_HOME_001` | 32 | home return | direct owner/registration/club writes | transfer authority exists, but no guaranteed matching home offer | **No — blocked** |
| `EVT_34_CON_001` | 34 | short veteran contract | active content generic; role promise cannot be represented in `CareerTerms` | renewal authority represents duration/salary | **No — needs canon** |
| `EVT_34_MKT_001` | 34 | veteran market | runtime uses `VETERAN_OFFER_AVAILABLE` + `world.veteranOffer*`; event signs by writing duration directly | existing `CareerOffer` can represent salary/duration, but generation + content bridge must be converted atomically | **No — synthetic-offer blocker** |

## Exact Codex-ready count in this handoff

- 18–20: **0**
- 20–23: **0**
- 23–26: **4**
- 26–30: **0**
- 30–34: **0**
- 34+: **0**

The four ready 23–26 items are:

1. `EVT_23_MKT_001`;
2. `EVT_23_CON_001`;
3. `EVT_25_CON_001`;
4. `EVT_25_MKT_001` (explicitly non-offer).

## Important 23–26 distinction

`EVT_25_MKT_001` is ready precisely because **no** formal offer should exist: the coach call is interest/negotiation only. Its tests must prove that `CareerTerms`, `market.pending` and club state remain unchanged.

`EVT_23_MKT_001`, `EVT_23_CON_001` and `EVT_25_CON_001` are the opposite: they describe signable terms and therefore must be offer bridges over a real compatible pending `CareerOffer`.

The follow-up hardens this contract: a pending offer remains inspectable through `getActiveCareerOffers`, but `getEligible*` returns nothing if current `CareerTerms` no longer match `offer.before`. Narrative eligibility must therefore fail closed on stale proposals.

## 26–30 relation to issue #6

Issue #6 is primarily canonical age-26/seed chronology work and is not owned by market authority. No listed age-26 restoration scene requires a club transition merely because it is in that issue. Market authority only becomes directly relevant where a later scene performs a real employment change, such as `EVT_29_HOME_001`.

## Contract expiry

#130 remains confirmed P1 and design-blocked. `CONTRACT_EXPIRY_SHARED_INVARIANT.md` records the exact shared decision surface and acceptance suite. Do not mark `EVT_22_CON_002` or any free-agency scene ready until the employment representation is approved and implemented.

## Veteran representability

The authority can already represent:

- one-year or two-year duration;
- reduced salary;
- same-club renewal;
- permanent transfer;
- loan / return / conversion;
- rejection / counter / defer;
- no offer existing.

However, current 34+ runtime/content does not use that authority for `EVT_34_MKT_001`. See `VETERAN_MARKET_BLOCKERS.md`.

The authority still cannot represent a contractual **squad role promise** inside `CareerTerms`, and absence of a market offer must not itself force retirement. Retirement remains a separate owner.
