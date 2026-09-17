# Unblocked / blocked market content

Runtime audit base: `main@ebef17057156c7721fc4a041552c9cf1b3fdb6ba`.  
Implementation queue re-grounded over: `main@adf1bffa7298bff6d7cebab88a3388c559cd3588`.

`Codex ready` here means that the technical market/contract dependency is sufficiently specified to implement the content without inventing a second authority. It does **not** grant permission to skip the active content-identity lineage; Codex must re-read the coordinator queue immediately before touching `EVENTS`.

| Event | Age | Type | Previous blocker | Authority available | Codex ready |
|---|---:|---|---|---|---|
| `EVT_18_JAN_001` | 18 | loan / market | #123: proxy interest + direct club mutation, no proven formal age-18 offer | Query APIs exist; generation/bridge must still be integrated atomically | **No — blocked** |
| `EVT_18_SUM_001` | 18 | renewal / exit | #123: direct contract duration effects; external exit requires real offer | Renewal/transfer query + response APIs exist; age-18 materialisation still absent | **No — blocked** |
| `EVT_20_MKT_001` | 20 | market | current generic scene uses `marketHeat`; formal-offer premise not reconciled | transfer query/bridge available | **No — needs canon** |
| `EVT_22_CON_001` | 22 | contract talk | unclear whether the conversation is a formal signable renewal | renewal query/bridge available | **No — needs canon** |
| `EVT_22_CON_002` | 22 | contract expiry | depends on real expiry/free-agency semantics | `expired_pending_resolution` is visible; `route="free_agent"` is only partial scaffolding, not an authoritative employment transition | **No — #130** |
| `EVT_23_MKT_001` | 23 | formal transfer offer | #83 needed an authoritative offer/session bridge | `getEligibleTransferOffers` + `offerBridge` + `respondToOffer` | **Yes** |
| `EVT_23_CON_001` | 23 | formal renewal | #83 needed formal same-club terms and safe counter/reject | `getEligibleRenewalOffers` + bridge + response | **Yes** |
| `EVT_24_MKT_001` | 24 | three simultaneous offers | singular `market.pending` cannot back three destinations | no approved multi-offer authority | **No — blocked** |
| `EVT_24_JAN_001` | 24 | external offer / leverage | current effects change salary directly | transfer authority exists, but leverage-to-renewal needs separate formal proposal | **No — blocked** |
| `EVT_25_CON_001` | 25 | formal renewal | #83 needed accept/counter/defer without direct contract writes | renewal query + bridge + response | **Yes** |
| `EVT_25_MKT_001` | 25 | direct coach contact | #81 risked confusing contact with offer | explicit rule: required offer type = none | **Yes** |
| `EVT_29_HOME_001` | 29 | home return | direct owner/registration/club writes | transfer authority exists, but no guaranteed matching home offer | **No — blocked** |
| `EVT_32_HOME_001` | 32 | home return | direct owner/registration/club writes | transfer authority exists, but no guaranteed matching home offer | **No — blocked** |
| `EVT_34_CON_001` | 34 | short veteran contract | generic contract scene; role promise cannot be represented in `CareerTerms` | renewal authority represents duration/salary, but content premise still needs canon | **No — needs canon** |
| `EVT_34_MKT_001` | 34 | veteran market | synthetic `VETERAN_OFFER_AVAILABLE` + `world.veteranOffer*`; acceptance directly writes contract duration | existing CareerOffer authority can represent salary/duration, but 34+ generation and offerBridge are not integrated | **No — blocked** |

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

## 26–30 relation to issue #6

Issue #6 is primarily canonical age-26/seed chronology work and is not owned by market authority. No listed age-26 restoration scene requires a club transition merely because it is in that issue. Market authority only becomes directly relevant where a later scene performs a real employment change, such as `EVT_29_HOME_001`.

## Veteran representability

The authority can already represent:

- one-year or two-year duration;
- reduced salary;
- same-club renewal;
- permanent transfer;
- loan / return / conversion;
- rejection / counter / defer;
- no offer existing.

The current 34+ runtime does **not** use that authority for its veteran offer: it keeps a legacy synthetic boolean + `world.veteranOffer*` payload and signs via direct content effects. `VETERAN_MARKET_BLOCKERS.md` defines the required atomic future conversion.

The authority also cannot currently represent a contractual **squad role promise** inside `CareerTerms`, nor can it infer retirement from no-renewal. Retirement remains a separate owner.
