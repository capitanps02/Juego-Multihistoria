# Retirement / epilogue blockers

Coordination snapshot: 2026-09-17. This file is part of the retirement merge that synchronizes onto `main@fa3c8bae524fef62e4eb9802e895df88588998c4`; Git history is authoritative for the resulting retirement HEAD.

- certified retirement HEAD immediately before this sync: `a35dae2f6c2985ce12756a38248dbac0b4c3d2e6`
- that head was **67 ahead / 0 behind** `main@a7a0bb5…`
- retirement-specific workflow on `a35dae2f…`: build PASS + all T5.36/T5.37 gates PASS
- retirement ownership remains isolated on `t5/retirement-epilogues`

Repository Integrity is intentionally fail-closed on terminal lineage. The unfrozen terminal candidate observed on the preceding synchronized run was `4f7c783521a463509ac8bf9a0646b6c0aeaff6861a8d01ab8b1e43c19641e93b`; do not freeze or bypass that identity while the immediately preceding ordinary 34+ generation is not integrated/frozen.

## 1. Complete active 34+ generation / terminal lineage (RET-011)

task: freeze the real ordinary 34+ generation, then register the adjacent terminal `contentIdentity` migration edge.  
owner chain: **#59 + #180 -> PR #15 -> terminal migration / PR #118**.

### PR #15 ordinary 34+ snapshot

- branch: `t51/canon-34plus`
- current relation to `main@fa3c8ba…`: **59 ahead / 1 behind**
- current diff remains preparation/handoff material under `analysis/CODEX/canon-34plus/`; no Agent-8 principal is registered into `EVENTS`
- ordinary canonical cards prepared: **43/43 = 100%**
- runtime implemented/registered by Agent 8: **0/43**
- strict `codexReady`: **0/43** while Wave 0 is incomplete
- active content remains generation H; no provisional ordinary-34+ identity may be frozen

### Wave 0 blockers before any ordinary 34+ runtime registration

1. **#59 — `T5.1 shared: multigeneration content migration lineage (A→B→C saves)` is open.** It owns route-path/evidence infrastructure so successive catalogs migrate deterministically without loading legacy catalogs into active scheduling. Required invariants include 0 RNG, no scheduling/choice resolution during migration, exact pending fingerprints, immutable compatibility evidence and fail-closed missing/ambiguous routes.
2. **#180 — `T5.2: apply canonical Pasada-7 34+ seed catalog and provenance handoff` is open.** Owner decision: **54 exact new canonical seed IDs = 45 ordinary + 9 terminal**. The 68-entry technical set also contains **14 bridge-memory concepts**; these are inherited/derived compatibility concepts and must not be auto-produced merely by entering age 34. No fuzzy technical->canonical rename and no historical provenance rewrite.
3. Once #59 and #180 are integrated, PR #15 may activate ordinary 34+ runtime waves and eventually produce the real frozen ordinary 34+ content identity.
4. Retirement/epilogue generation must follow that exact frozen identity as the adjacent next generation. No shortcut from `PRE_T51_CONTENT_IDENTITY`, no guessed intermediate hash and no terminal freeze against a documentation-only 34+ branch.

status: **hard blocked upstream; no safe terminal migration code remains to write on this branch yet**.  
retirement action now: keep terminal runtime/tests green and migration handoff ready; do not register/freeze the terminal candidate.

## 2. Full last-match authority (RET-005)

task: `LastMatchFact { fixture, club, opponent, competition, minutes, starter, result, goals, assists }`.  
current main: retirement still has no integrated persisted authoritative match-history producer.  
concrete successor: PR #156 / `t5/authoritative-match-model`, audited head `30764bafacd9712ed39af8f176312ec8ffa8a8d4`.  
current relation to `main@fa3c8ba…`: **1 ahead / 2 behind**; PR remains open/draft and is not a consumable main contract.  
#156 provides: stable fixture identity/date/registration club/opponent/home-away/league competition, persisted `calledUp/onBench/started/appeared/minutes`, next/previous fixture, match-day and remaining fixture counts, save validation and deterministic replay with zero additional RNG draws.  
#156 still does not provide: authoritative final result, goals, assists/cards, or a shared query for the latest history entry where `player.appeared=true` when the immediately previous fixture is a non-appearance.  
certification on audited #156 head: Repository Integrity `35243389440` had project validation PASS, PlayCanvas PASS, QA build PASS and pre-content freeze sentinel PASS; determinism was still running at the latest audit. Because main has advanced twice since that producer head, a clean re-ground and fresh exact-head certification remain mandatory.  
status: **partially unblocked, not integration-ready**.  
retirement action now: keep aggregate appearance fallback and null unsupported details; never infer result/goals or equate `previousFixture` with last appearance.

## 3. Terminal seed lifecycle

task: classify and wire 34+ / retirement seeds without inventing a second state machine.  
owner: #180 / T5.2 + PR #15 ordinary 34+ owner + PR #118 for the 9 terminal producers.  
canonical split: **45 ordinary producer IDs + 9 terminal producer IDs**; 14 bridge-memory concepts are not automatic age-34 producers.  
retirement action now: terminal consumers/producers only behind explicit evidence; preserve origin provenance; never mass-close unrelated seeds; no fuzzy ID remapping.

## 4. 30–34 early-retirement semantics

task: decide whether `EVT_33_RET_001` already contains an announcement fact or should enter the standard terminal announcement flow.  
owner: `t51/canon-30-34` + coordinator.  
blocker: historical compatibility bridge currently compresses `playing -> decided -> announced -> closed` for the legacy flag.  
retirement action now: retain the narrow bridge and frozen-legacy regression until canonical semantics are decided.

## 5. Fixture-aware closure boundary (RET-007)

task: replace coarse time/contract closure trigger with authoritative final sporting boundary.  
current main: the persisted match model required by retirement is still not integrated.  
producer candidate: PR #156 exposes `remainingOfficialMatches`, `remainingLeagueMatches`, `nextFixture`, `previousFixture`, match-day/training-window facts and official weekly league progression. In that candidate `remainingOfficialMatches` intentionally equals modeled league fixtures because league is the only modeled official competition.  
exact audited candidate: `30764bafacd9712ed39af8f176312ec8ffa8a8d4`; **1 ahead / 2 behind `main@fa3c8ba…`**.  
certification on that historical candidate head: project validation PASS; PlayCanvas PASS; QA build PASS; pre-content freeze sentinel PASS; determinism was still running at the latest audit.  
status: **blocked pending re-ground to current main, complete exact-head CI, and integration**.  
unblock contract: once #156 (or clean successor) is fully certified and on main, gate administrative closure on authoritative `remainingOfficialMatches/nextFixture`, preserving announced-state playability, idempotence and a fail-closed compatibility path for saves without match history.  
retirement action now: do not copy the producer into this branch and do not depend on its private store shape before integration.

## Repository-integrity rule

Do not weaken the freeze sentinel to make terminal content pass. A terminal candidate identity appearing at the sentinel is evidence that the preceding lineage owner still controls the next migration edge; it is not permission to freeze that identity early.
