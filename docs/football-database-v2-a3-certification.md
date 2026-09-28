# Football Database V2 — DB-A3 G3 certification

Date: 2026-09-28  
Owner: DB-A3  
Successor PR: #848  
Status: **implementation certified; merge-gate blocked on upstream G2/G1/G0 serialization**

## Grounding

- pre-V2 main baseline: `b72cb81f993634667ba699086ba8714240d8a27b`
- DB-A0 contract: `eb6289594930f4419d42aa65a17ba11a4c98f1cb` (#826)
- DB-A1 catalog/integrity: `1b0992bc6df38d05a4b8061c748ff17aa08a3d65` (#827)
- DB-A2 full hierarchy/profile contract: `ee5e0bd15bbce97c43f1b6f584e06b93c8ccc3a4` (#829)
- DB-A3 certified implementation head: `9b031601dc9446d8a8b253b2315ef3f75b9f9494`
- DB-A3 branch: `db-a3/runtime-football-catalog-a2-full`
- DB-A3 PR: #848

DB-A3 is based directly on the full A2 head above. The branch was 0 commits behind that exact A2 predecessor when certification was run.

## Why #848 supersedes #840

#840 was rebuilt on reduced A2 PR #839. That reduced branch did not expose the complete A2 handoff required by G3:

- club bands;
- league-strength hierarchy;
- selector profiles;
- BIG_CLUB semantics;
- DEVELOPMENT_CLUB semantics;
- relative HIGHER_CLUB semantics.

#848 was rebuilt from the full #829 contract and consumes the A2 public contract rather than recreating its own percentile policy.

## Pass status

| Pass | Scope | Status |
| --- | --- | --- |
| 1 | producer audit | PASS |
| 2 | fixture opponent integration | PASS |
| 3 | early-career market | PASS |
| 4 | continuous market/world routes | PASS |
| 5 | narrative aliases / Aurora closure | PASS |
| 6 | G3 certification | PASS on DB-A3 code; upstream merge gate remains |

Technical DB-A3 implementation progress: **100%**.  
Merge/train status: **BLOCKED** until the serialized G0 -> G1 -> G2 dependencies are certified/landed.

## Pass 2 — fixtures

New fixture projections:

- keep the existing fixture ID;
- keep the existing home/away fingerprint;
- keep the same result/stat/performance producer channels;
- add a real catalog opponent identity;
- expose `opponentClubId` on new rows;
- use the catalog display name as `opponent`;
- consume zero GameState RNG draws.

Historical rows remain valid without `opponentClubId`.

Current catalog clubs use their contextual country/division. UDV and legacy current-career identities are projected deterministically into a valid catalog fixture context without rewriting the player career identity.

### Expected pre-V2 difference

Expected:

- `opponent: SIM_OPP_*` becomes a fictional catalog club name;
- new rows may contain `opponentClubId`.

Not expected, and certified unchanged after normalizing those two identity fields:

- fixture IDs;
- home/away;
- result authority;
- performance context;
- match consequences;
- football RNG state/draw count;
- unrelated game state.

## Pass 3 — early-career market

January and summer formal offers keep the existing market authority.

Identity replacement only happens after the pre-existing producer authorizes a formal opportunity.

Replaced new-production identity families:

- `Development_*`
- `Domestic_*`
- `Summer_*`

The Player Actions bridge remains:

`transferRequestExternalMarketThreshold(state, 38)`

It was not replaced by a fixed threshold.

Creating a formal offer remains detached: current employment changes only after acceptance.

No additional GameState RNG draws are used for destination identity.

## Pass 4 — continuous market

Continuous routes now materialize catalog identities while preserving the old draw order.

Covered:

- domestic permanent move;
- foreign permanent move;
- domestic loan;
- foreign loan;
- level/prestige change previously falling through to `Club N · M`.

Existing football draws are captured and transformed into selector inputs. Catalog selectors never call `rng.next()`.

### Loans

When loan authority exists:

- `ownerClub` remains the parent club;
- `registrationClub` is the playing destination;
- `state.club` follows registration;
- owner and registration remain distinct.

### Foreign-country fairness

Foreign selection chooses an eligible country context before selecting a club. Countries are not weighted merely because they contain more catalog clubs.

### Veteran / free agency / Bosman

These routes are intentionally **N/A for A3 destination generation** where the current authority requires a concrete factual club from the caller:

- external veteran offers require a recorded market approach and caller-provided club;
- Bosman/future-employment negotiation receives an explicit destination;
- automatic veteran renewal is same-club.

A3 therefore does not invent a catalog destination for those APIs. Doing so would create market authority that does not exist in the source system.

## Pass 5 — narrative aliases

Canonical event definitions remain unchanged.

At resolution time the six active aliases materialize deterministically with zero additional GameState RNG draws:

- `NEW_CLUB`
- `DEVELOPMENT_CLUB`
- `DEVELOPMENT_CLUB_2`
- `HIGHER_CLUB`
- `BIG_CLUB`
- `FOREIGN_DEV_CLUB`

Semantics:

- `NEW_CLUB`: balanced contextual replacement;
- `DEVELOPMENT_CLUB` / `DEVELOPMENT_CLUB_2`: A2 development semantics;
- `FOREIGN_DEV_CLUB`: foreign + development semantics;
- `BIG_CLUB`: exact A2 BIG_CLUB contract;
- `HIGHER_CLUB`: relative A2 improvement contract.

### BIG_CLUB

DB-A3 does not use an arbitrary top-percentile shortcut.

A club is eligible only under the A2 contract:

- tier-1 elite; or
- qualifying top-continental club meeting the A2 prestige, international-attraction and league-strength thresholds.

### HIGHER_CLUB

A destination must demonstrate relative improvement:

- at least the A2 minimum prestige delta; or
- a stronger band supported by a stronger league/tier context.

The selector fails closed if no qualifying candidate exists.

### Narrative loan collision

Canonical content can encode "sign for parent club and go on loan" with one alias in multiple club paths.

After alias materialization, if the parent identity would otherwise equal the registration identity while `LOAN_ACTIVE=true`, DB-A3 deterministically materializes a separate development registration club. This preserves:

- parent ownership;
- distinct registration;
- zero extra RNG draws;
- unchanged canonical content.

The real `CEVT_19_BIG_01 / ACCEPT_MODEL` path is covered by regression.

## Aurora CF

`Aurora CF` remains historical compatibility only.

`STATE20_BIG_RESERVE` now materializes an A2 BIG_CLUB catalog identity and does not produce `Aurora CF`.

Historical saves containing `Aurora CF` remain read-compatible under A1 policy.

## Generic offer fallback

The old new-production fallback:

`Club <leagueTier> · <prestigeTier>`

is removed.

When an already-authorized offer changes level/prestige without naming a club, DB-A3 chooses a catalog identity deterministically from the existing factual terms. It does not create the opportunity itself.

Tier-1 / big-club terms consume the exact A2 BIG_CLUB semantics.

## Negative new-production assertions

Runtime source certification forbids new producers for:

- `SIM_OPP_*`
- `Development_*`
- `Domestic_*`
- `Summer_*`
- `Foreign_*`
- `Loan_*`
- `Club N · M`
- `Aurora CF` in the STATE20 producer

Legacy loading remains a separate A1 historical-read lane.

## RNG certification

Catalog identity materialization introduces **0 unauthorized GameState RNG draws**.

Certified properties:

- fixture selector: pure;
- early market selector: pure;
- narrative alias materializer: pure;
- generic-offer identity fallback: pure;
- continuous market reuses the exact pre-existing destination draw positions;
- same seed/state replays to the same catalog club.

## Zero-action equivalence

A dedicated certification checks the DB-A3 successor against pre-V2:

`main@b72cb81f993634667ba699086ba8714240d8a27b`

### Quiet career

A four-month zero-Player-Actions career is deep-equal after normalizing only the designed fixture identity enrichment:

- opponent display label;
- optional `opponentClubId`.

All other persisted state must be identical.

### Summer market

512 directed summer-market scenarios compare pre-V2 and DB-A3.

Certified unchanged:

- every RNG stream/state/draw count;
- opportunity existence;
- opportunity timing;
- offer ID/date/reason;
- offer kind;
- live state before acceptance;
- tier/contract/prestige/route/loan/big-club terms;
- owner/registration authority shape.

The selected destination ID itself is intentionally excluded because replacing synthetic identities is the designed V2 change.

## Save scope

DB-A3 does not modify the save schema.

Certification includes current save compatibility tests. A4 remains the owner of catalog-version persistence/migration.

## Auto-simulation

Certified through the existing auto-simulation regression suite after V2 runtime wiring.

## Exact-head DB-A3 CI evidence

Workflow: **Football Database V2 · Runtime integration**  
Run: `36400758081`  
Certified implementation head: `9b031601dc9446d8a8b253b2315ef3f75b9f9494`  
Conclusion: **SUCCESS**

Successful steps:

1. build;
2. V2 runtime catalog regressions;
3. age-18 market authority regression;
4. Player Actions core/session/bridge;
5. market + late-career authority;
6. save compatibility;
7. auto-simulation;
8. A1 catalog integrity + A2 balance;
9. pre-V2 checkout/build;
10. zero-action equivalence vs pre-V2 main.

## Upstream G2 state at DB-A3 certification time

A2 head: `ee5e0bd15bbce97c43f1b6f584e06b93c8ccc3a4`

Green on exact A2 head:

- Football Database V2 · Catalog integrity;
- Football Database V2 · Balance;
- Player Actions and related targeted workflows.

Still running at the time this certificate was written:

- Repository integrity.

Therefore:

`DB-A3 IMPLEMENTATION = CERTIFIED`

but:

`G3 MERGE GATE = BLOCKED ON UPSTREAM SERIALIZED G0 -> G1 -> G2`

No DB-A3 runtime defect is currently open.
