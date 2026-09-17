# #124 — authoritative sport content wiring

## Dependency

This patch is content-owner work and depends on PR #156 (`t5/authoritative-match-model`).
Do not copy the producer into content. Integrate the producer first, then rebase this patch on the resulting `main`.

## Active scene contracts

### `EVT_18_MATCH_001`

Schedule only when `facts.match` is authoritative for a league fixture, the player actually appeared, and `debutDecisionContext === true`.
That boolean is produced only from a persisted debut substitution at minute 78 with score 1-1.

Forbidden substitutes: `OFFICIAL_DEBUT` alone, role score, form, coach trust, month.

### `EVT_18_PRS_001`

Common prerequisite: `FIRST_TEAM_ATTENTION`.
Then require either:

- `facts.sport.officialDebutRecorded === true`; or
- persisted `facts.sport.firstMatchSquadCall`.

Attention alone must fail.

### `EVT_18_SOC_001`

Keep the canonical public-attention prerequisite (`reputation.mediaHeat >= 5`) and require:

- `facts.sport.hoursToNextFixture >= 24`; and
- a produced `facts.sport.nextTrainingDate`.

A same-day fixture or missing training schedule must fail closed.

### `EVT_18_END_001`

Require:

- `facts.sport.remainingLeagueMatches >= 1`;
- `facts.sport.remainingLeagueMatches <= 4`;
- `facts.sport.seasonObjectiveStatus === "open"`.

Do not use month or `world.udvSeasonResolved` as authority.

## Tests

`scripts/test-t51-issue124-sport-wiring.mjs` is imported by the existing `test-t51-event-gates.mjs` suite, so the standard `npm test` path executes it.

The directed regressions cover positive routes, proxy-only negative routes, wrong debut context, attention-only press reachability, same-day match rejection, missing training rejection, closed objective, zero remaining fixtures and more than four remaining fixtures.

## Integration order

1. PR #156 fully green and integrated.
2. Rebase this branch onto the new `main`.
3. Run Repository Integrity including PlayCanvas and all T5 gates.
4. Update generation-H blocker/readiness metadata for the four resolved #124 scenes.
5. Close only the resolved portion of #124; follow-up `CEVT_18_EARLY_01` remains separate unless its acceptance contract is implemented and tested.

No schema bump, no new narrative flag, no RNG draw and no content identity rewrite is required by this patch.
