# Wave C — QA / acceptance matrix

Scope: the 16 ordinary sport/usage/selection principals in `WAVE_C_IMPLEMENTATION.json`.

These tests are pre-activation requirements. They do not authorize synthetic football facts or runtime registration while Wave 0/shared authorities remain missing.

## Global invariants

1. A sporting premise must come from authoritative fixture/usage/result/selection/record/medical state.
2. `age`, `form`, `roleScore`, `coachTrust`, `nationalStanding`, caps, reputation and generic flags are never substitutes for a concrete sporting fact.
3. Aggregate career appearances do not prove the current/recent match context.
4. Reading sport authority consumes 0 narrative RNG.
5. Save/load preserves the exact fixture/result/selection/record fact that made the scene eligible.
6. No scene writes a synthetic start, bench, minute, goal, result, call-up, omission, final, penalty or last match.
7. Choice-level market actions may request/open negotiation only; signing remains Wave-B authority.
8. International retirement does not modify career-retirement state.
9. `retirement.status` remains unchanged by all Wave-C scenes except through an explicit Agent-9 terminal handoff, never direct Agent-8 effects.

## `EVT_34_NT_001`
- real current pre-list required;
- historical caps/standing only => absent;
- option C changes international availability only;
- no career-retirement status change.

## `EVT_34_LOAD_001`
- factual calendar + prior-load data + explicit staff load plan required;
- age 34 alone => absent;
- 28–32 starts are a proposed plan, never pre-written future starts;
- later actual usage may diverge without rewriting the seed decision.

## `EVT_34_ROLE_001`
- exactly supported recent two-match bench sequence required;
- `roleScore`/coach trust alone => absent;
- crowd reaction cannot be used as evidence that the player should start;
- choice B waiting five matches must consume future real usage, not precompute results.

## `EVT_34_BODY_001`
- real recent match/load context + explicit delayed recovery/pain evidence required;
- if text says tests show no lesion, that negative medical fact must exist;
- no scan/medical authority => do not state the result;
- age-only soreness => absent;
- choices change load/preparation posture, not fabricate injury or future minutes.

## `EVT_34_MATCH_001`
- real knockout fixture;
- real substitute/entry fact;
- real decisive goal + result;
- any missing element => scene absent;
- option D may request renewal discussion only; it does not create an offer.

## `EVT_34_NT_002`
- real current omission from an authoritative list + explicit healthy status;
- no current list => absent;
- injured player omitted => this exact canonical premise is ineligible;
- option C is international retirement only.

## `EVT_34_FAN_001`
- factual recent reduced-use/bench history required;
- fan legacy may support narrative pressure but cannot manufacture bench history;
- no option directly changes lineup;
- manager reaction is relationship/narrative consequence, not sporting authority.

## `EVT_34_TRAVEL_001`
- real omitted fixture + factual load-plan reason + real team victory required;
- synthetic rest reason/result => absent;
- choice B requests return to next XI but cannot write a future start;
- choice D travel preference does not imply selection.

## `EVT_35_TACT_001`
- authoritative changed role + real minutes/metrics required;
- generic form/roleScore => absent;
- options C/D may create market/renewal intent but cannot manufacture offers;
- save/load preserves the actual role context independently from the narrative seed.

## `EVT_35_BENCH_001`
- five consecutive factual non-participations + healthy status + active contract required;
- four matches => absent;
- unknown injury status => fail closed for the exact premise;
- option B requests contract termination through shared authority, never clears terms directly.

## `EVT_35_RECORD_001`
Requires both Wave C + D:
- real record definition/value;
- real surpass event;
- certified young club player identity;
- no record or no identity => absent/fail closed according to final implementation contract;
- option D private conversation cannot create a persistent NPC relationship with an invented actor.

## `EVT_35_NT_001`
- real current emergency call required;
- if another-player injury is named as cause, that cause must be authoritative;
- `SEED_NATIONAL_PHASEDOWN`/past international retirement is context, not the call itself;
- option A does not guarantee appearance/minutes.

## `EVT_35_FINAL_001`
- real final fixture + real squad call + factual role/substitution plan required;
- club prestige/cup participation does not prove a final;
- choices cannot guarantee extra time, substitution or trophy;
- D's post-match media action must happen only after the real match resolves.

## `EVT_36_BODY_001`
- factual three-matches-in-eight-days sequences + measured personal drop + explicit recovery limitation required;
- age 36 alone => absent;
- competition schedule must be real;
- choices define selectivity preference, never write future appearances/results.

## `EVT_36_RECORD_001`
- factual professional appearance count near 700 + real upcoming fixture + explicit rest recommendation required;
- career total 700 already passed or no upcoming fixture => exact scene ineligible;
- option C is conditional on real in-match score/opportunity and cannot guarantee appearance 700;
- no synthetic milestone celebration/result.

## `EVT_37_PEN_001`
- real match;
- authoritative farewell/possible-last-match context;
- real penalty award;
- certified regular taker;
- real penalty-assignment decision context;
- choice D requires authoritative captain/coach identity if named;
- no penalty => scene never materializes merely for cinematic closure;
- no forced score/miss outcome;
- Agent 8 must not mark this fixture as the terminal last appearance or close retirement.

## Save/migration regression for each active batch

- save before eligibility → restore → same authoritative fact set;
- save with pending decision → restore → same event fingerprint/visible facts;
- historical match/selection facts are not rewritten by seed migration;
- canonical seed producer is the concrete scene/outcome;
- legacy pending definition resolves under original content identity;
- migration consumes 0 RNG, schedules nothing and resolves no choice;
- focused sport/selection tests + save QA + migration QA + Repository Integrity pass on exact head.
