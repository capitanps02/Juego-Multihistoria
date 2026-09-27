# DB-A3 — Port map for legacy catalog PRs #791–#794

Captured: 2026-09-28 CEST  
Branch: `db-a3/football-runtime-integration`  
Baseline: `main@b72cb81f993634667ba699086ba8714240d8a27b`

This document is preparatory only. G3 runtime wiring remains blocked until G1 + G2 are certified/integrated.

## Global rule

Do not merge #791–#794 directly.

Each PR predates the certified Player Actions runtime and the A1/A2 V2 contracts. Reuse only narrow algorithms whose authority/RNG semantics remain valid.

## #791 — fixture opponents

### Reuse

- reuse the existing fixture fingerprint as the only selector input;
- zero GameState RNG draws;
- current catalog club should play another club from its contextual division;
- historical fixture rows without a catalog opponent identity must remain valid;
- visible opponent label may derive from catalog identity.

### Reconstruct

- put the selector in A3-owned runtime integration code rather than assuming old catalog ownership;
- use A1 indexed lookups and A2 final hierarchy;
- define explicit context for `UDV` and legacy current clubs;
- treat a catalog club whose live `leagueTier` differs from catalog metadata via the final G2 policy, not the old branch's ad-hoc rules.

### Reject from old patch

- any country/division policy frozen before G2;
- any requirement that retroactively makes `opponentClubId` mandatory;
- any selector fallback that can return the current club.

### Baseline already frozen on A3 branch

`scripts/test-db-a3-fixture-baseline.mjs` protects:

- fixture ID;
- home/away;
- result authority;
- zero RNG mutation;
- read-only schedule projection;
- deterministic schedule projection.

## Legacy-current-club fixture context

After V2, an upgraded old save may still have a legacy registration identity but produce a new fixture.

Required contextual projection:

- catalog club: use its catalog country/division context;
- `UDV`: canonical Spanish context, nearest represented division to live league tier;
- `Development_*`, `Domestic_*`, `Summer_*`, domestic `Loan_*`: deterministic domestic context;
- `Foreign_*` or route/flag explicitly abroad: stable foreign context derived from immutable club identity + live tier, with zero RNG draws;
- `Aurora CF`: historical identity stays loadable; new fixture context follows the persisted route/abroad state rather than display-name inference;
- unknown invalid identity: fail closed for new production, do not silently treat it as a catalog club.

Historical fixture rows themselves are never remapped.

## #792 — early-career market

### Reuse

- deterministic market destination selector concept;
- development / balanced / ambitious profile concept, subject to final A2 semantics;
- use an already-existing producer roll as selector input;
- catalog only supplies identity after the market producer authorizes an opportunity;
- preserve detached CareerOffer semantics.

### Mandatory current-main behavior

Current main uses:

`transferRequestExternalMarketThreshold(state, 38)`

The external summer comparison must continue to use the returned dynamic threshold.

This is the certified Player Actions bridge and is not negotiable in G3.

### Reject from old patch

- fixed literal `38` comparison;
- presentation / PlayCanvas / generated-name work: A5 ownership;
- package-wide wiring unrelated to A3;
- selector scoring that conflicts with final A2 profile/band semantics.

### Early market identity replacements

- January loan: `Development_*` -> development-profile catalog identity;
- January transfer: `Domestic_*` -> domestic catalog identity;
- Summer external transfer: `Summer_*` -> catalog identity selected only after existing external gate.

No new RNG draws.

## #793 — continuous market

### Reuse

- convert an already-consumed destination draw into a deterministic selector input;
- use one existing value to derive foreign country/division/club rather than taking extra draws;
- deterministic nearest represented tier fallback;
- self-exclusion;
- loan-specific destination filtering.

### Current draw-order contract

In `professionalWeek`, the market branch interleaves football RNG draws for:

- market opportunity;
- upward/downward context;
- abroad decision;
- live tier/prestige changes;
- synthetic destination;
- transfer-vs-loan ownership;
- loan environment stability;
- later professional-state updates.

G3 must preserve the exact number and order of draws.

The existing foreign destination draw and loan destination draw may be captured and passed into pure selectors. No selector may call `rng.next()`.

### Ownership

For loans:

- parent remains `ownerClub`;
- destination becomes `registrationClub`;
- `state.club` mirrors current playing/registration club;
- catalog identity selection must not collapse ownership.

## Generic offer normalization — additional producer not isolated by #792/#793

Current `src/simulation/offers.ts::materializeCareerOffer` can create:

`Club <leagueTier> · <prestigeTier>`

when terms change live level/prestige while club identity did not change.

G3 must replace this as new production.

Constraint:

- offer authority already exists before normalization;
- selector may identify the destination;
- selector may not create an offer;
- zero additional RNG draws.

## #794 — narrative aliases

### Reuse

- resolver-time materialization rather than editing canonical EVENTS;
- pure deterministic hash;
- event/choice/alias context;
- one alias should resolve consistently across related club/owner/registration effects in the same resolution;
- zero narrative/football RNG draws;
- preserve contentIdentity and canonical event IDs.

### Old patch is incomplete

The old alias set covers only:

- `NEW_CLUB`
- `DEVELOPMENT_CLUB`
- `HIGHER_CLUB`
- `BIG_CLUB`

Current V2 active aliases also require:

- `DEVELOPMENT_CLUB_2`
- `FOREIGN_DEV_CLUB`

`Aurora CF` is not a narrative alias: A1 classifies it as legacy compatibility.

### Final semantics required

- `BIG_CLUB`: use A2 big-club contract, not merely top-division percentile;
- `HIGHER_CLUB`: must be an actual improvement relative to current context;
- `DEVELOPMENT_CLUB` / `DEVELOPMENT_CLUB_2`: use development semantics;
- `FOREIGN_DEV_CLUB`: foreign + development-compatible;
- `NEW_CLUB`: contextual balanced replacement, never current club.

Do not hardcode every alias to Spain when the alias semantics explicitly require foreign context.

## Player Actions certification gate already attached

The A3 branch workflow now runs:

- DB-A3 fixture baseline;
- `scripts/test-player-actions-narrative-bridge.mjs`;
- `scripts/test-t5-age18-market-authority.mjs`.

These are baseline gates before any G3 runtime identity wiring.

## Activation sequence after G1/G2

1. re-ground branch on exact integrated main;
2. bind selectors to exact A1/A2 APIs and catalog version;
3. Pass 2 fixtures;
4. Pass 3 early market + Player Actions;
5. Pass 4 continuous market + generic offer fallback;
6. Pass 5 aliases + Aurora new-production closure;
7. Pass 6 full certification.

No progress credit beyond Pass 1 is claimed until runtime integration is actually implemented and tested.
