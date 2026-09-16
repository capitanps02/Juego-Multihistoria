# T6 Agent 10 — Pass 01 status

Branch: `t6/balance-observability`  
PR: #34 (draft)  
Scope: observability only; no runtime/canon/balance edits.

## Current grounding

This pass re-grounds the Agent 10 tree atomically on `main@6cb81b63f03ce55776ca97075012cfaa22ac228d`. The previous branch head was 39 commits behind `main`, so continuing linearly would have mixed stale history with current T5 behavior.

The prior re-ground `0e1fbf9ca035e568c19ec4e260c7a0bb98159745` on `main@fe06a5c9d61632ea4491dc6df95788154884177a` passed Repository Integrity run `35126649632`. That run is retained only as historical compatibility evidence. It does **not** certify the new re-grounded HEAD; exact-head CI must be checked again after the branch ref moves.

Re-ground again only if integrated changes materially affect the active catalog or runtime measured by T6, or when T5 freezes a candidate for alpha measurement.

## Isolation

PR #34 must contain only Agent 10 files under:

- `analysis/T6/**`;
- `project/workstreams/T6_BALANCE_OBSERVABILITY.md`;
- `scripts/t6-*`;
- `scripts/test-t6-*`.

No product runtime, canonical content, save/session, NPC, seed definition, Android, PlayCanvas or web file is owned or modified by this workstream.

## Delivered

- 15 semantic decision profiles independent of event IDs.
- Accent-safe normalization, token-boundary matching and deterministic semantic tie-breaking.
- Static intent-tag vocabulary audit and profile-diversity audit.
- Full-career simulator with paired profile seeds.
- Cohort-preserving sharding and exact `profile:seed` sample reconstruction.
- Explicit rejection of totals that are not multiples of 15; ~10k examples are 9,990 or 10,005 careers.
- Event/choice coverage, career reach-rate, occurrence-rate, density, semantic fallback, narrative gaps, signatures, retirement, epilogues, scheduler exposure and seed-lifecycle metrics.
- Within-seed profile divergence: unique signatures, event/choice/epilogue Jaccard distance, retirement-age spread and closure disagreement.
- Safe shard merge and baseline/candidate comparator aware of catalog identity and `samplingDesign`.
- Diagnostic pipeline with reproducible owner hints.
- Market-cadence observability, paired market comparison and telemetry.
- Historical v0.8 reference retained as context only, never as a target distribution.
- Regression contract that proves T6 consumes production-materialized eligible choices rather than reimplementing eligibility.

## Choice-eligibility verification

Current `main` exposes the eligibility contract through production scheduling:

1. an event with zero eligible choices is not schedulable;
2. a scheduled event is returned with `scheduled.event.choices` filtered to the currently eligible subset;
3. `t6-sim.mjs` passes that exact `scheduled.event` to `chooseForProfile()`.

No T6 runtime patch is needed. `scripts/test-t6-choice-eligibility.mjs` adds a directed regression with a synthetic `eligibility-probe` profile: the gated `BLOCKED_HIGH_SCORE` choice carries `elite + ambition` and would beat the low-score `SAFE` choice if it leaked through. With the gate false the scheduler materializes only `SAFE`, so T6 can only select `SAFE`; with the gate true both choices are exposed and T6 selects `BLOCKED_HIGH_SCORE`. The canonical event fixture is also asserted unchanged when the blocked option is hidden.

## Paired sampling contract

`samplingDesign = paired_profile_seed_v1`.

- 15 careers = 1 seed × 15 profiles.
- 150 = 10 seeds × 15 profiles.
- 1,500 = 100 seeds × 15 profiles.
- 9,990 = 666 seeds × 15 profiles.
- 10,005 = 667 seeds × 15 profiles.

`T6_TOTAL_RUNS` must be a multiple of 15. Sharding is assigned by complete cohort, never by individual profile. Incomplete or duplicated cohorts remain diagnostic evidence but are excluded from aggregate paired-divergence statistics.

## Market-cadence observability / issue #70

A prior T5 stratified QA sample exposed a directed signal: `loyal / seed 512000` recorded **484 market decisions** while the other eight sampled careers were in the 6–14 range. This remains issue #70 and is not treated as a balance verdict from one career.

Read-only T6 telemetry records market decisions by career/profile/age segment/reason/action, accepted/rejected counts, unique/duplicate offer IDs, unique offer dates, same-date maxima and first/last offer dates. `market_cadence_review` remains conservative by default: at least 30 observed careers and an example above both 50 decisions and 10× the sample median. A 15-career smoke cannot auto-label market cadence as a balance failure.

### Static hypothesis, not conclusion

Production inspection is compatible with repeated renewal eligibility after rejection: a 0–5 month contract can be reevaluated weekly before age 34, renewal probability can reach 0.68, rejection clears `pending` without applying the proposed contract, and no cooldown/last-renewal guard was found. The rough envelope `14 × 52 × 0.68 ≈ 495` is close to the observed 484, but QA still needs to reproduce and partition the real market history by `reason` before a production owner decides intended behavior.

Agent 10 will not implement a cooldown/free-agency/dispute rule because that is gameplay ownership.

## Semantic-profile safeguards

1. Rare does not mean bad; frequent does not mean bad.
2. Coverage and balance are distinct.
3. Old v0.8 distributions are not targets.
4. Comparisons should use the same `profile:seed` sample.
5. Same seed across all 15 profiles reduces strategy-vs-RNG confounding.
6. Event occurrence frequency is not career reachability.
7. Instrumentation does not consume extra game RNG.
8. Choice eligibility comes only from production `scheduleEvent()`; T6 does not reimplement it.
9. Profiles may learn reusable semantic vocabulary, never concrete event IDs or opaque `A/B/C/D` choice IDs.
10. Paired-divergence magnitude is descriptive; only invalid cohort construction is an automatic tooling defect.

## Known semantic debt

Generic 34+ factories use many opaque `A/B/C/D` intent tags. T6 deliberately does not learn those tokens. `t6-profile-audit.mjs` exposes them as vocabulary debt and hands the finding to the canonical owner.

## Execution limitation

This conversation environment does not currently expose a checkout-capable GitHub runner or arbitrary workflow dispatch. Repository Integrity can prove compatibility of the PR head once it runs, but it does not by itself prove every `test-t6-*` file or execute the large T6 simulation cohorts.

No smoke, 150-career, 1,500-career or ~10k result should be claimed unless that exact workload was actually executed.

## Still required before T6.1 can close

1. Repository Integrity green on the exact final re-grounded HEAD.
2. Execute the complete pure T6 test suite on a checkout-capable runner, including `test-t6-choice-eligibility.mjs`.
3. Run `t6-profile-audit.mjs` on the consolidated compiled catalog.
4. Run `t6-profile-diversity.mjs` on the same build.
5. Run the real paired smoke: 1 seed × 15 profiles.
6. Use smoke diagnostics only for plumbing/reproduction; do not infer balance from 15 careers.
7. Run at least 150 careers before interpreting rare/missing coverage or cadence distributions.
8. Keep 1,500/~10k batches outside normal CI.
9. Re-measure issue #70 with paired samples and market-reason telemetry.
10. Do not credit official T6 completion before T5 supplies a candidate suitable for alpha measurement.
