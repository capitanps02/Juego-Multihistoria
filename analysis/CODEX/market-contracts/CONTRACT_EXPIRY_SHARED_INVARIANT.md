# Contract expiry shared invariant — issue #130

Status: **design-blocked / not yet authorised for runtime implementation**.

Current integration base when this follow-up was created: `main@06762a0557c4e92b189e52151c71d6c1af831ee5`.

## Confirmed failure

QA has reproduced a player remaining at `contract.monthsRemaining === 0` for thousands of simulated days while preserving the same:

- `club`;
- `professional.ownerClub`;
- `professional.registrationClub`;
- salary;
- ordinary sporting participation.

The permanent replay for `loyal / seed 512000` observed 6,669 days at zero months, no employment change and 419 appearances added during that period.

`contractEmploymentStatus(state)` correctly exposes this state as `expired_pending_resolution`, but the classification is read-only and does not itself resolve employment.

## Existing partial scaffolding is not authority

The repository already contains:

- `professional.route = "free_agent"` as an allowed enum value;
- state classifiers that mention free-agent states;
- narrative memory around `SEED_FIRST_FREE_AGENCY`.

None of those currently establishes the full employment tuple. In particular, `GameState.club` is still a required string and production has no single transition that simultaneously resolves club, owner, registration, salary and sporting eligibility.

Therefore all of the following are forbidden as isolated fixes:

- only setting `professional.route = "free_agent"`;
- only setting salary to zero;
- inventing an `UNATTACHED` / `FREE_AGENT` club string;
- forcing a transfer;
- forcing retirement;
- auto-renewing;
- creating a synthetic contract;
- treating `SEED_FIRST_FREE_AGENCY` as employment state.

## Required shared decision

Before implementation, coordination must explicitly choose the representation for an unattached/out-of-contract player and answer all of these questions together:

1. **Employer identity** — can `GameState.club` become nullable, or does the runtime need a separate current-employer field while retaining a display/last club?
2. **Ownership** — what are `professional.ownerClub` and `world.ownerClub` while the player is unattached?
3. **Registration** — what is `professional.registrationClub` while no federation registration is active?
4. **Salary** — does salary become zero/null, remain last salary for historical display, or move to a separate last-contract snapshot?
5. **Football eligibility** — which authoritative football fact prevents club appearances while unattached?
6. **Scheduler context** — should club-scoped narrative events be ineligible while unattached, and which fact/path expresses that?
7. **Market generation** — can a free agent receive a `CareerOffer` while no current employer exists, and what does `CareerOffer.before` contain?
8. **Renewal** — does expiry terminate the possibility of a same-club renewal, turning a later same-club deal into a new signing instead?
9. **Loans** — expiry while loaned must define whether ownership returns to parent before expiry resolution or whether the loan contract and employment contract are separate concepts.
10. **Late career** — no-market windows may create retirement context, but market infrastructure must not force retirement automatically.
11. **Saves** — how are historical schema-8 saves already at zero months interpreted without falsifying past events?
12. **History/provenance** — what durable fact records the expiry resolution date and prior employer without rewriting old narrative history?

Until these are resolved as one invariant, #130 remains **confirmed but not Codex-ready for runtime mutation**.

## Required transition properties

Whatever representation is chosen, the eventual expiry resolver must satisfy:

- deterministic;
- zero RNG;
- idempotent;
- save/load stable;
- no direct narrative ownership;
- no automatic retirement;
- no forced destination;
- no resurrection of the expired contract after load;
- no ordinary club appearances while truly unattached;
- no club-scoped NPC/institutional leakage from the previous employer;
- later accepted `CareerOffer` establishes a coherent new employment tuple atomically.

## Minimum API contract for the future fix

Names are illustrative until coordination approves them. Do not add them merely because they appear here.

```ts
employmentStatus(state)
resolveExpiredContractInPlace(state)
canParticipateForCurrentClub(state)
```

The key requirement is ownership separation:

- expiry resolution belongs to employment/contract authority;
- football reads the resulting authoritative employment fact;
- scheduler/content reads the same fact;
- CareerOffer handles the later signing;
- retirement only consumes context and remains a separate decision system.

## Acceptance tests required before #130 can close

### Expiry transition

- `monthsRemaining: 1 -> 0` resolves exactly once at the authorised calendar boundary;
- 0 RNG draws across the resolution;
- repeated resolver call is idempotent;
- prior employer provenance is retained without pretending the old contract is active.

### Football

- after true unattached resolution, weekly simulation does not add appearances for the previous club;
- no fixture/result path treats the player as registered for that club;
- signing a new real offer restores eligibility only after acceptance.

### Offers

- pending offer whose `before` no longer matches live employment is not returned by `getEligible*`;
- stale offer cannot be accepted;
- a valid free-agent/new-signing offer survives save/load;
- accepted new deal updates employer/registration/contract atomically;
- accept/reject remain 0 RNG.

### Scheduler / NPC / club scope

- previous-club institutional scenes fail closed while unattached;
- previous-club NPC knowledge is not erased, but current-club authority does not leak;
- club-scoped seeds keep historical origin but do not masquerade as current employment.

### Save/load

- save immediately before expiry -> load -> same deterministic resolution;
- save immediately after expiry -> load -> remains resolved;
- historical zero-month saves migrate or load according to the approved compatibility rule;
- no contract resurrection.

### Long career

Re-run the permanent #130 replay (`loyal / 512000`) and assert:

- no multi-year ordinary same-employer zombie state;
- no negative contract months;
- no impossible owner/registration combination;
- no trapped unattached career with no market path unless canon explicitly permits it;
- no forced retirement introduced by the fix.

## Codex status

`CODEX-CONTRACT-EXPIRY-001`: **BLOCKED**.

Unblock only when coordination records the complete unattached-employment representation. At that point Codex may implement the smallest shared transition plus focused consumers/tests; it must not redesign narrative content in the same change.
