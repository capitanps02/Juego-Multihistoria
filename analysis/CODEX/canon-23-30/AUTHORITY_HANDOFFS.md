# Minimal shared-authority handoffs to unlock remaining Canon 23–30

This is an implementation contract, not a request for larger parallel systems. Each item lists the smallest fact surface that would unlock multiple currently blocked scenes.

## 1. Current-club institutional crisis

Need a read-only fact scoped to the current registration/owner club, for example:

- current coach identity;
- current coach security/crisis state;
- whether direction/president is actively deciding the coach's future;
- change timestamp / club identity.

Would unblock or materially advance: `EVT_27_LOCK_001`, `EVT_28_CLUB_001`, `EVT_29_PRS_001` and related callbacks.

Do not reuse global `world.coachSecurity` or `COACH_FIRED`: they survive club changes and are not actor-scoped.

## 2. Competition-aware match model

Extend the existing authoritative match producer, not narrative flags, with competition/event semantics needed by canon:

- competition beyond `league` (continental/cup/national);
- round/stage (semifinal/final);
- result;
- goals/assists only if simulation actually produces them;
- penalty/set-piece moments only if independently produced;
- multi-competition scheduling if calendar congestion is to be asserted.

Would unlock: MATCH24, MED26 congestion, EUR26/27, FINAL26/27/28 and several callbacks.

## 3. Current roster / successor facts

Need current-club scoped actor identity and performance history for the named/typed successor or second star:

- roster membership/current club;
- role/position compatibility;
- appearances/minutes/performance history;
- injury/absence causality where required.

Would unlock: TEAM26_002, STAR27, TEAM27, STAR28 and succession callbacks.

## 4. National-team offer/call detail

Existing national authority is aggregate and explicitly reports `concreteCallupKnown=false` / `tournamentSquadKnown=false`.

Minimal additions when simulation owns them:

- concrete call-up/list membership with date/window;
- tournament-squad status;
- captaincy offer/assignment separately from club captaincy;
- international fixture identity where needed.

Would unlock: NAT25/26/27 and tournament callbacks. Do not infer from standing/caps.

## 5. Medical diagnosis/protocol

Need typed, persisted medical facts rather than body-risk proxies:

- diagnosis class and severity;
- surgery-compatible recommendation if it exists;
- protocol/compliance/return status;
- recovery horizon;
- source clinician where knowledge matters.

Would unlock MED27 and strengthen BODY25 callbacks.

For BODY25 specifically, a much smaller seed-memory projection of the existing `SEED_LOAD_MANAGEMENT.payload.plan` may be sufficient.

## 6. Rich market/commercial proposal facts

Current CareerOffer is authoritative for destination and financial/contract terms, but not for:

- promised sporting role;
- coach/project budget or planned signings;
- agent commission/conflict;
- image-control percentages / bonuses;
- simultaneous comparable packages;
- brand/club commercial campaign terms.

Would unlock MKT26/27, CON26/28, AGT26/27_002, IMG26 and RICH/brand scenes.

Never encode these promises as fake CareerTerms fields unless the market owner explicitly extends the persisted authority and migration contract.

## 7. Wealth / net-worth authority

Need a canonical aggregate distinct from salary and cash-on-hand, plus thresholds defined by the finance owner.

Would unlock HOME27/MONEY27 and later wealth structure scenes. Salary alone is not patrimonio.

## 8. Award / public-event authority

Need simulation-owned nomination/win/loss/public-event facts for individual awards and crowd/stadium reactions.

Would unlock AWARD27/GALA paths and PRS27. Reputation/publicMyth can modulate response, but cannot create the external event.
