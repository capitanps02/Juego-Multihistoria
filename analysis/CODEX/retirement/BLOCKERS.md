# Retirement / epilogue blockers

Coordination snapshot: 2026-09-17.

- synchronized retirement base: `a7caeba7732c3d527a12144c5ee33dc724d0f9b6`
- synchronized against: `main@fa3c8bae524fef62e4eb9802e895df88588998c4`
- compare at certification: **68 ahead / 0 behind main**
- retirement-specific workflow on `a7caeba…`: build PASS + all T5.36/T5.37 gates PASS
- Repository Integrity on `a7caeba…` reaches the intended fail-closed active-source freeze sentinel; ordinary validation before the sentinel passes
- current unfrozen terminal candidate: `4f7c783521a463509ac8bf9a0646b6c0aeaff6861a8d01ab8b1e43c19641e93b`

Do not freeze or bypass the terminal identity while the immediately preceding ordinary 34+ generation is not integrated and frozen.

## 1. Complete active 34+ generation / terminal lineage (RET-011)

task: freeze the real ordinary 34+ generation, then register the adjacent terminal `contentIdentity` migration edge.  
owner chain: **#59 + #180 -> PR #15 -> terminal migration / PR #118**.

### PR #15 ordinary 34+ snapshot

- branch: `t51/canon-34plus`
- relation at latest audit to `main@fa3c8ba…`: **59 ahead / 1 behind**
- ordinary canonical cards prepared: **43/43 = 100%**
- runtime implemented/registered by Agent 8: **0/43**
- strict `codexReady`: **0/43** while Wave 0 is incomplete
- active content remains generation H; no provisional ordinary-34+ identity may be frozen

### Wave 0 blockers

1. **#59 — multigeneration content migration lineage** is open. It owns deterministic route-path/evidence infrastructure: 0 RNG, no scheduling/choice resolution during migration, exact pending fingerprints, immutable compatibility evidence and fail-closed missing/ambiguous routes.
2. **#180 — canonical Pasada-7 34+ seed catalog/provenance** is open. Owner decision: **54 exact new canonical seed IDs = 45 ordinary + 9 terminal**. The 14 bridge-memory concepts are inherited/derived compatibility concepts and must not auto-produce merely by entering age 34. No fuzzy technical->canonical rename and no historical provenance rewrite.
3. After #59 and #180 are integrated, PR #15 may activate ordinary 34+ runtime waves and eventually produce the real frozen ordinary 34+ identity.
4. Retirement must follow that exact frozen identity as the adjacent next generation. No `PRE_T51_CONTENT_IDENTITY` shortcut, no guessed intermediate hash and no terminal freeze against a documentation-only 34+ branch.

status: **hard blocked upstream; no safe terminal migration code remains to write yet**.  
retirement action now: keep terminal runtime/tests green and migration handoff ready; do not register/freeze the terminal candidate.

## 2. Full last-match authority (RET-005)

task: `LastMatchFact { fixture, club, opponent, competition, minutes, starter, result, goals, assists }`.  
current main: retirement still has no integrated persisted authoritative match-history producer.  
producer candidate: PR #156 / `t5/authoritative-match-model`.  
current candidate HEAD: `05ac9cb123d413697de086b8099a6f5c3015d344` (`CI: allow full T5 repository integrity suite to finish`).  
relation to `main@fa3c8ba…`: **2 ahead / 2 behind**; PR remains open/draft and is not a consumable main contract.  

#156 provides: stable fixture identity/date/registration club/opponent/home-away/league competition, persisted `calledUp/onBench/started/appeared/minutes`, next/previous fixture, match-day and remaining fixture counts, save validation and deterministic replay with zero additional RNG draws.

#156 still does not provide: authoritative final result, goals, assists/cards, or a shared query for the latest history entry where `player.appeared=true` when the immediately previous fixture is a non-appearance.

CI evidence:
- prior head `30764baf…`, Repository Integrity run `35243389440`: project validation PASS, PlayCanvas PASS, QA build PASS and pre-content freeze sentinel PASS; the run was **cancelled during determinism after a newer commit superseded it**, not concluded as a proven determinism failure;
- current head `05ac9cb…`, Repository Integrity run `35244948064`: **in progress** at the latest audit; project validation was still running when sampled.

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
current candidate: `05ac9cb123d413697de086b8099a6f5c3015d344`; **2 ahead / 2 behind `main@fa3c8ba…`**.  
current exact-head CI: Repository Integrity `35244948064` is still in progress.  
status: **blocked pending re-ground to current main, complete exact-head CI, and integration**.  
unblock contract: once #156 (or a clean successor) is re-grounded, fully certified and on main, gate administrative closure on authoritative `remainingOfficialMatches/nextFixture`, preserving announced-state playability, idempotence and a fail-closed compatibility path for saves without match history.  
retirement action now: do not copy the producer into this branch and do not depend on its private store shape before integration.

## Repository-integrity rule

Do not weaken the freeze sentinel to make terminal content pass. A terminal candidate identity appearing at the sentinel is evidence that the preceding lineage owner still controls the next migration edge; it is not permission to freeze that identity early.
