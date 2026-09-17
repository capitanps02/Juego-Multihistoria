# Retirement / epilogue blockers

Coordination snapshot: 2026-09-17.

- synchronized retirement head: `38f6294aa262b16151bc0ad6a1df35ab7edf03c6`
- synchronized against: `main@fa3c8bae524fef62e4eb9802e895df88588998c4`
- compare at this snapshot: **71 ahead / 0 behind main**
- retirement-specific workflow: run `35247316398` = **SUCCESS** (build + all T5.36/T5.37 gates)
- Repository Integrity: run `35247316406` reaches the existing `freeze-t51-active-source --check` fail-closed sentinel from inside `npm test`; all preceding visible test suites pass before the sentinel
- current unfrozen terminal candidate: `4f7c783521a463509ac8bf9a0646b6c0aeaff6861a8d01ab8b1e43c19641e93b`

Do not freeze or bypass the terminal identity while the immediately preceding ordinary 34+ generation is not integrated and frozen.

## 1. Complete active 34+ generation / terminal lineage (RET-011)

task: freeze the real ordinary 34+ generation, then register the adjacent terminal `contentIdentity` migration edge.

### What #59 still owns

The original multi-generation migration engine is **already integrated in main**:

- `findMigrationPath()` resolves a unique acyclic route and fails closed on missing/ambiguous paths;
- `GameSession.migrateAndResume()` consumes the route multi-hop;
- A→B→C, direct A→C, B-save→C, frozen pending provenance, mixed A/B history, cycles and ambiguous routes are covered by `scripts/test-t51-content-lineage.mjs`;
- migration remains ordered and does not justify shortcut edges.

Therefore #59 is no longer a blocker because the path engine is missing. Its remaining ownership is **serial registration/freeze of each future content generation in canonical order**.

### #180 / PR #191 canonical 34+ seed catalog

PR #191 (`t5/seed-34plus-catalog`) is now a certified implementation candidate:

- exact HEAD: `d8f724893cfcb40d2b81f995d8ed08179bbd6f52`;
- relation to current main: **3 ahead / 0 behind**;
- focused workflow `35246851382`: **SUCCESS** (build + `test-t52-34plus-canonical-catalog.mjs` + `test:t52`);
- Repository Integrity `35246851472`: **SUCCESS** on the same exact HEAD;
- contract: 54 canonical Pasada-7 seeds = **45 ordinary + 9 terminal**;
- 14 bridge-memory concepts stay inherited/derived compatibility facts, not automatic age-34 producers;
- no fuzzy technical→canonical aliasing and no historical provenance rewrite;
- PR #191 does not register `EVENTS`, freeze content identity or create lineage edges.

It is not integrated yet and must not be auto-merged from this workstream.

### PR #15 ordinary 34+ snapshot

- branch: `t51/canon-34plus`;
- relation to current main: **67 ahead / 0 behind**;
- current diff remains analysis / machine-readable preparation only; no Agent-8 ordinary 34+ runtime files are registered;
- ordinary canonical cards prepared: **43/43**;
- runtime implemented/registered by Agent 8: **0/43**;
- active runtime content therefore remains generation H from the perspective of 34+ ordinary canon.

### Required sequence

1. integrate the remaining canonical predecessor generations in their real order;
2. integrate #191 when the coordinator chooses the correct serial point;
3. activate/integrate the 43 ordinary 34+ scenes from PR #15 only after their shared authorities are satisfied;
4. freeze the resulting ordinary 34+ identity and register its adjacent lineage edge through #59 ownership;
5. re-ground PR #118 on that exact frozen predecessor;
6. only then freeze/register the terminal retirement identity as the next adjacent generation.

status: **hard blocked upstream by content-generation order, not by missing migration infrastructure**.

## 2. Full last-match authority (RET-005)

task: `LastMatchFact { fixture, club, opponent, competition, minutes, starter, result, goals, assists }`.

Producer candidate: PR #156 / `t5/authoritative-match-model`.

Latest audited producer state:

- HEAD: `91b3f0a151a7c547ef00cee42e823e9920b244cf`;
- relation to current main: **1 ahead / 0 behind**;
- Repository Integrity run `35245632330` is still in progress at `T5 determinism and RNG isolation`;
- project validation, PlayCanvas integration regression, QA build and pre-content freeze sentinel are already green on that exact HEAD.

#156 provides stable fixture identity/date, registration club, opponent, home/away, league competition, persisted `calledUp/onBench/started/appeared/minutes`, next/previous fixture and remaining official/league fixture counts.

#156 still does **not** provide:

- authoritative final result;
- goals;
- assists/cards;
- a shared query for the latest persisted official match where `player.appeared === true` when the immediately previous fixture is a non-appearance.

Retirement must not equate `previousFixture` with the player's last professional appearance and must keep unsupported details null.

status: **partially unblocked; rich LastMatchFact still blocked**.

## 3. Fixture-aware closure boundary (RET-007) — IMPLEMENTED

RET-007 is no longer a blocked implementation task.

Implemented in `38f6294aa262b16151bc0ad6a1df35ab7edf03c6`:

- `retirementSportingBoundary()` reads only the shared `SportContext` projection;
- `remainingOfficialMatches > 0` => an announced career stays playable even if the legacy administrative timeout or contract-expiry fallback would otherwise close it;
- `remainingOfficialMatches === 0` with authoritative availability => sporting season complete and closure may proceed;
- unavailable/legacy/invalid sporting authority => exact previous administrative fallback is preserved;
- no private match-store shape is copied into retirement;
- no extra RNG is consumed.

Focused regression coverage lives in `scripts/test-t536-sport-authority.mjs` and the dedicated T5.36/T5.37 workflow is green.

Current main still exposes this field as unavailable, so production behavior remains backward-compatible. When PR #156 or a compatible producer is integrated, the already-implemented `known` path activates automatically.

status: **implemented; producer integration only activates the authoritative branch, it is not additional retirement implementation work**.

## 4. Terminal seed lifecycle

owner chain: #180 / PR #191 + PR #15 ordinary 34+ + PR #118 terminal producers.

The canonical split is **45 ordinary producer IDs + 9 terminal producer IDs**. The 14 bridge-memory concepts are compatibility/history projections and must not be auto-produced at age 34.

Retirement rules remain:

- preserve exact `originEvent` provenance;
- never mass-close unrelated seeds;
- never fuzzy-remap technical IDs;
- do not fabricate canonical instances before their producer event occurs.

## 5. 30–34 early-retirement semantics

task: decide whether `EVT_33_RET_001` already contains an announcement fact or should enter the standard terminal announcement flow.

owner: `t51/canon-30-34` + coordinator.

The historical compatibility bridge still narrowly compresses `playing -> decided -> announced -> closed` only for the legacy early-retirement flag. Preserve it until the owner finalizes canonical semantics.

## Repository-integrity rule

Do not weaken the freeze sentinel to make terminal content pass. The `4f7c7835…` failure is evidence that PR #118 is intentionally ahead of the serial content lineage; it is not permission to freeze the terminal catalog early.
