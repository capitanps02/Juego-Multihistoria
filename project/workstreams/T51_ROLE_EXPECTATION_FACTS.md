# T5 shared causal facts — role expectation at age 23

Issue: #98  
Branch: `t5/role-expectation-facts`  
Base: `main@e48a6c85d0a9e61d88eca121f683dcd308c188c1`

## Purpose

Provide auditable, read-only causal facts required by `EVT_23_PRS_001` without inventing a prior promise from generic role, media or market signals.

This workstream does **not** add or modify any event and therefore does not change `contentIdentity`.

## Facts

`facts.roleDropSince23`

- numeric;
- equals `max(0, professional.roleScoreAt23 - sport.roleScore)`;
- returns `0` until the age-23 professional snapshot is initialized;
- deliberately does not decide how large a drop must be to count as narratively material.

`facts.roleGuaranteeAt23`

- boolean;
- true only when the persisted seed evidence is exactly `SEED_ELITE_ROLE_BARGAIN`;
- the seed must originate from `EVT_23_BRIDGE_001`;
- its payload stance must be exactly `role_guarantees`;
- `security_over_role`, `wait_market` and `agent_listens` do not prove a prior minutes/role expectation;
- later resolving/consuming the seed does not erase the historical fact that the conversation occurred.

Both facts are projected by `narrativeConditionRoot()` and are never written into the save.

## Policy boundary

The shared layer exposes evidence, not PRS policy. A later T5.11b implementation must explicitly document any technical threshold used for a "material" role drop and prove reachability around that threshold.

A role drop without `roleGuaranteeAt23` must not fabricate a promise. A role guarantee without a later drop must not fabricate a breach.

## Invariants

- zero RNG draws;
- zero GameState mutation;
- no schema field;
- no new flag producer;
- no content identity change;
- save/load yields the same derived facts;
- facts are consumable through ordinary `Condition` paths.

## QA

`scripts/test-t51-role-expectation.mjs` covers:

1. raw drop calculation and no negative drop;
2. fail-closed behavior before the age-23 snapshot;
3. exact `role_guarantees` provenance versus other bridge stances;
4. rejection of a same-ID seed with the wrong origin event;
5. historical evidence surviving terminal seed lifecycle state;
6. separation of prior guarantee and later drop;
7. Condition-layer visibility without persistence;
8. zero mutation/RNG on reads;
9. save/load stability.

The suite is wired into `npm test`, `test:t51:shared`, and `test:t51:role-expectation`.

No merge is performed from this workstream without coordinator review.
