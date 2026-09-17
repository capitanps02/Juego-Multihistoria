# National-team authority contract

Issue: #162

## Purpose

This contract defines the national-team facts that the current runtime can prove without inventing a fixture, squad list, tournament roster or match-selection row.

The implementation deliberately projects existing persisted state instead of introducing a second selection database or a save migration.

## Authoritative persisted inputs

The runtime currently persists:

- `professional.nationalCaps` — aggregate senior caps produced by the simulator;
- `professional.nationalRole` — aggregate career role (`none | fringe | rotation | regular`);
- `professional.nationalStanding` — aggregate standing;
- `flags.NATIONAL_CALLED` — historical entry into the simulated senior national-team pool;
- `flags.NATIONAL_GATE_OPEN` — current aggregate call-up gate;
- `flags.NATIONAL_TOURNAMENT_CYCLE` — tournament-cycle/window context only;
- `flags.NATIONAL_RETIRED` — explicit international retirement.

## Read-only projection

`src/simulation/national-team-authority.ts` exposes `resolveNationalTeamAuthority(state)`.

It is:

- deterministic;
- read-only;
- 0 RNG;
- save-schema neutral.

The projection distinguishes:

- historical selection evidence (`everCalled`, caps, role, standing);
- simulator-pool activity (`simulationPoolActive`);
- international retirement (`retired`);
- aggregate gate/window signals;
- concrete selection facts, which remain unknown.

## Hard invariant: international retirement

`NATIONAL_RETIRED=true` is a hard stop for normal national-team participation generation.

After retirement:

- no new simulated senior caps are created;
- no camp-driven `nationalStanding` increase occurs;
- no camp-driven promotion to `rotation`/`regular` occurs;
- `NATIONAL_GATE_OPEN=false`;
- `NATIONAL_TOURNAMENT_CYCLE=false`;
- historical caps/role/standing remain intact;
- club career, club fixtures, contracts and career retirement continue independently.

`NATIONAL_CALLED` is not cleared because it is historical evidence that the player entered the senior pool before retirement.

## What this authority does NOT prove

The following remain fail-closed:

- a concrete current call-up;
- a named international fixture;
- starter/bench/substitute status for a specific national-team match;
- a 30-player preliminary squad;
- a 26-player final tournament squad;
- tournament appearance/minutes/result;
- a named national-team coach or opponent.

Forbidden inference:

- `nationalStanding >= X` => concrete call-up;
- `nationalRole` => specific match selection;
- `NATIONAL_TOURNAMENT_CYCLE` => preliminary/final squad membership;
- seed presence => selection fact;
- age/tournament year => roster membership;
- public reputation => selection fact.

## Canon handoff

Primary traceability evidence already audited:

### `EVT_30_NAT_001` — B1060

Canonical trigger: `Historial de selección suficiente.`

The shared authority can now prove whether the player has senior national-team history and whether he is internationally retired. It does **not** define the content owner's threshold for "suficiente".

Safe content-owner direction:

- require authoritative national-team history;
- require `retired === false`;
- if an additional caps/role/standing threshold is desired, it must be justified by the canonical/content contract rather than invented by this shared layer.

### `EVT_32_NAT_001` — B1184

Premise: the player is among `30 preseleccionados para 26 plazas` before a major tournament.

This remains **blocked**. `NATIONAL_TOURNAMENT_CYCLE` is only a window/cycle signal and cannot prove a 30-man preselection.

A future squad-list authority must explicitly register preliminary/final roster membership before this premise is factual.

### Match-specific national-team scenes

Any scene requiring a real call-up, bench/start status, specific tournament match or appearance remains under factual sport/selection ownership. Aggregate national-team authority must not fabricate those facts.

## Save compatibility

No new persisted store is introduced. Existing fields and flags already survive save/load. Old saves require no heuristic backfill.

## Integration boundary

This workstream owns only:

- the shared projection;
- the international-retirement invariant in simulation;
- directed QA;
- Codex handoff.

It does not modify canonical EVENTS, `contentIdentity`, event fingerprints or migration registries.
