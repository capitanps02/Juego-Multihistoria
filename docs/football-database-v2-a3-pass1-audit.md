# DB-A3 — Pass 1 producer / authority / RNG audit

Captured: 2026-09-28 CEST  
Generation: G3 — Runtime Football Database Integration  
Branch: `db-a3/football-runtime-integration`

## Start state

- BASE_SHA: `b72cb81f993634667ba699086ba8714240d8a27b`
- A0_SHA: `eb6289594930f4419d42aa65a17ba11a4c98f1cb` (#826, open)
- A1_SHA: `9ef7369db5a0adc7bafc6c7b3ee0a81b8a725e66` (#827, draft)
- A2_SHA: `4228c789fa763fb923d3fd92d5fbc208b1168df4` (#828, draft)
- G0/G1/G2 integrated into main: none

A3 runtime integration is intentionally blocked until G1 + G2 are certified/integrated. This pass changes no runtime behavior.

## Producer inventory

### P1. Fixture opponent identity

- Producer: `src/simulation/match-model.ts::fixtureProjection`
- Current output: `SIM_OPP_<leagueTier>_<01..20>`
- Authority: fixture calendar already decides that the factual league fixture exists.
- Selector source: pure hash `avalanche32(hashString(season|date|registrationClub|leagueTier))`.
- GameState RNG draws: 0.
- Persists today: `opponent` display/identity string in match-model row.
- V2 change: project the existing fingerprint into a valid catalog opponent; add optional catalog identity without invalidating historical rows.
- Must not change: fixture id, cadence, home/away projection, match result authority, stats authority, historical rows.

### P2. Age-18 January loan destination

- Producer: `src/simulation/early-career-market.ts::materializeJanuary`
- Current output: `Development_<tier>_<01..30>`.
- Authority: existing early-market producer decides plausibility, availability and loan/transfer kind.
- Selector source: pure `producerRoll`, seeded from narrative seed/date/season/owner club/channel.
- GameState RNG draws: 0.
- V2 change: replace only destination identity with a catalog club matching development semantics.
- Must not change: offer existence, kind, tier logic, salary/contract authority, loan ownership semantics.

### P3. Age-18 January transfer destination

- Producer: `src/simulation/early-career-market.ts::materializeJanuary`
- Current output: `Domestic_<tier>_<01..30>`.
- Authority / RNG: same producer and zero-draw hash contract as P2.
- V2 change: catalog domestic destination using the already-derived roll.
- Must not change: whether the opportunity exists.

### P4. Age-18 summer transfer destination

- Producer: `src/simulation/early-career-market.ts::materializeSummer`
- Current output: `Summer_<tier>_<01..30>`.
- Player Actions bridge: current main correctly uses
  `transferRequestExternalMarketThreshold(state, 38)`.
- Selector source: pure `producerRoll`; GameState RNG draws 0.
- V2 change: catalog destination after external opportunity is authorized.
- Critical preservation: never replace the dynamic threshold with literal `38`.

### P5. Continuous foreign destination

- Producer: `src/simulation/world-simulator-core.ts::professionalWeek` inside the existing `proposeCareerChange(..., "Propuesta de mercado", ...)` staging callback.
- Current output: `Foreign_<leagueTier>_<0..19>`.
- Authority: existing summer market gate (month/day/market heat + existing football RNG draws).
- RNG stream: `rngState.football`.
- Existing destination draw: one `rng.next()` used by `Math.floor(rng.next()*20)`.
- V2 change: reuse that exact draw as catalog selector input; do not add country/division/club draws.
- Must preserve subsequent draw order, especially ownership-vs-loan draw and later professional-week draws.

### P6. Continuous loan destination

- Producer: `src/simulation/world-simulator-core.ts::professionalWeek`.
- Current output: `Loan_<leagueTier>_<0..19>`.
- Authority: existing branch first decides that the summer opportunity and loan branch exist.
- RNG stream: `rngState.football`.
- Existing destination draw: one `rng.next()`.
- V2 change: reuse that draw to select a compatible development/minutes destination.
- Must preserve `ownerClub` as parent and `registrationClub` as destination.

### P7. Generic offer-normalization fallback

- Producer: `src/simulation/offers.ts::materializeCareerOffer`.
- Current output: `Club <leagueTier> · <prestigeTier>` when a proposal changes level/prestige but leaves `terms.club === before.club`.
- Authority: offer producer already staged a real terms change; this fallback invents identity only.
- RNG: 0 in the normalization itself.
- V2 change: replace new fallback production with a valid catalog identity selected from already-authorized context.
- Risk: this is easy to miss because it is not named as market generation.

### P8. Active named compatibility identity

- Producer/source: `src/simulation/professional-adapter.ts`, `STATE20_BIG_RESERVE`.
- Current output: `Aurora CF` written to club/owner/registration.
- A1 classification: `legacy_compat`, not legal V2 new production.
- V2 decision required in Pass 5: new materialization must become a catalog identity; historical `Aurora CF` remains readable. Do not display-name-match old saves.

## Narrative aliases

Canonical content actively contains:

- `NEW_CLUB`
- `DEVELOPMENT_CLUB`
- `DEVELOPMENT_CLUB_2`
- `HIGHER_CLUB`
- `BIG_CLUB`
- `FOREIGN_DEV_CLUB`

Current narrative resolution can copy a changed `club` into `professional.registrationClub` / ownership mirrors. Therefore these aliases are canonical-content values, not valid new persisted identities after V2. Pass 5 must materialize them at resolution time without rewriting canonical event IDs/contentIdentity and without RNG draws.

## Legacy consumers / compatibility

Historical/test data currently contains the synthetic families above. They remain valid for historical read only after V2. Tests and QA snapshots containing e.g. `SIM_OPP_TEST` must not be interpreted as permission for new runtime production.

## Authority map

| Producer | Who decides occurrence | Identity source today | RNG contract | V2 identity responsibility |
| --- | --- | --- | --- | --- |
| fixtureProjection | match calendar / football cycle | SIM_OPP hash | 0 draws | same-division/contextual catalog rival |
| age18 January loan | early market | Development hash | 0 draws | development-profile catalog club |
| age18 January transfer | early market | Domestic hash | 0 draws | domestic catalog club |
| age18 summer external | early market + Player Actions threshold bridge | Summer hash | 0 draws | catalog club after existing external gate |
| continuous foreign | professionalWeek market authority | Foreign synthetic | reuse existing football draw | country/division/club projection from same draw |
| continuous loan | professionalWeek market authority | Loan synthetic | reuse existing football draw | compatible loan destination |
| offer fallback | CareerOffer materializer | Club N · M | 0 draws | catalog identity only; never create opportunity |
| narrative alias | canonical event/resolver | alias string | 0 new draws | pure deterministic alias materialization |
| Aurora CF | professional adapter state transition | named compatibility ID | existing transition contract | catalog identity for new production only |

## Player Actions finding

Current main already contains the certified dynamic bridge in early-career summer market:

`transferRequestExternalMarketThreshold(state, 38)`

This must remain the authority modifier. Catalog selection happens strictly after the existing producer says an external opportunity exists.

## RNG map

- Fixtures: pure hash; zero GameState RNG draws.
- Age-18 market: pure hash; zero GameState RNG draws.
- Continuous professional market: existing `rngState.football` draws. Destination selection currently consumes one draw for foreign and one draw for loan when those branches are entered.
- Offer normalization: zero additional RNG.
- Narrative alias materialization target: zero additional RNG.

Pass 3/4 tests must compare exact draw counts/order, not only final selected club.

## P0/P1 findings

### P1 — G3 dependency blocker

G0/G1/G2 are not integrated. A1 and A2 PRs are still drafts/dependency-gated. Runtime imports/selectors must not be frozen against those branches yet.

Owner: A0/A1/A2 merge train.  
Blocks runtime Pass 2+: yes.

### P1 — hidden synthetic producer in offers.ts

`Club N · M` remains active new production in generic offer normalization and must be included in the G3 synthetic-leak closure.

Owner: A3.

### P1 — continuous market draw-order sensitivity

Foreign/loan destination identity is interleaved with existing football RNG draws controlling route, ownership and environment. Adding selector draws would reshape future careers.

Owner: A3.

### P1 — alias persistence risk

Canonical aliases are legal in content but illegal as new V2 persisted career identity. Resolver-side materialization is required before G3 certification.

Owner: A3.

## Pass 1 status

- producer inventory: complete
- authority map: complete
- RNG map: complete
- runtime changes: none
- progress: 15%
- passes: 1 / 6
- estimated passes remaining: 5

## Next

When G1 + G2 are certified/integrated:

1. rebase/re-ground this branch on then-current `main`;
2. bind to the exact A1/A2 catalog APIs/version;
3. implement Pass 2 fixture opponent integration first;
4. preserve historical fixture compatibility and zero-draw fixture semantics;
5. then proceed to early market while retaining the Player Actions dynamic threshold.
