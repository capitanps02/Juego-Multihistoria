# T5 shared causal facts — role expectation at age 23

Issues: #98 / #109  
Branch: `integration/t5-role-expectation-current`  
Reconstruction base: `main@039c72b1d99b8a48303a81a82d3aded1220ea021`

## Purpose

Provide auditable, read-only causal facts required by `EVT_23_PRS_001` without inventing a prior promise from generic role, media, market or seed-presence signals.

This workstream does **not** add or modify any event and therefore does not change `contentIdentity`.

It composes with the already-integrated causal surfaces: early-career seed memory, locker leadership, `facts.sport` and `facts.match` remain intact.

## Facts

### `facts.roleDropSince23`

- numeric;
- equals `max(0, professional.roleScoreAt23 - sport.roleScore)`;
- returns `0` until the age-23 professional snapshot is initialized;
- deliberately does not decide how large a drop must be to count as narratively material.

### `facts.roleGuaranteeAt23`

- boolean;
- true only when persisted historical evidence is exactly `SEED_ELITE_ROLE_BARGAIN`;
- the seed must originate from `EVT_23_BRIDGE_001`;
- payload `stance` must be exactly `role_guarantees`;
- `security_over_role`, `wait_market` and `agent_listens` are explicit negatives;
- later `resolved`/`expired` state or `consumedBy` does not erase the historical conversation;
- generic `HAS_SEED_ELITE_ROLE_BARGAIN`, current live presence or role/media/market values are not substitutes.

The direct historical identity read in `src/simulation/club-contract-intent.ts` is registered in `scripts/t52-historical-seed-consumers.mjs`, so the T5.2 direct-read ratchet remains fail-closed.

Both facts are projected by `narrativeConditionRoot()` and are never persisted as synthetic state.

## Policy boundary

The shared layer exposes evidence, not PRS policy. The separate content fix for #109 must explicitly document any technical threshold used for a material role drop and prove reachability around that threshold.

A role drop without `roleGuaranteeAt23` must not fabricate a promise. A prior expectation without a later drop must not fabricate an incumplimiento.

## Invariants

- zero RNG draws on reads;
- zero GameState mutation;
- no save/schema field;
- no new flag producer;
- no EVENTS change;
- no contentIdentity change;
- save/load yields the same derived facts;
- ordinary `Condition` paths can consume the facts;
- seed-memory, sport/match and locker facts remain intact;
- historical consumer registry stays distinct from the live deferred-consumer graph.

## QA

`scripts/test-t51-role-expectation.mjs` covers:

1. raw drop calculation and no negative drop;
2. fail-closed behavior before age-23 snapshot;
3. exact A=`role_guarantees` versus B=`security_over_role`, C=`wait_market`, D=`agent_listens`;
4. rejection of same-ID seed with wrong origin event;
5. historical evidence surviving `resolved` and `expired` terminal states;
6. separation of prior expectation and later drop;
7. Condition visibility while preserving seed-memory + sport/match facts;
8. zero mutation/RNG on reads;
9. save/load stability;
10. generic/unknown payload does not certify a guarantee.

The T5.2 direct seed-read audit independently verifies the historical registration.

## Next content step

Only after this fact layer is integrated, fix active `EVT_23_PRS_001` in a separate content generation. That content PR owns the adjacent contentIdentity edge at its actual integration turn and must not reinterpret the other three bridge stances as a promise.
