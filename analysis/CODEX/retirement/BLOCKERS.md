# Retirement / epilogue blockers

Coordination snapshot: 2026-09-17.

- current `main`: `a7a0bb575ac8824c3e52975e8861a97e29f94830`
- retirement sync HEAD: `66612a4939802e020c9d16b213401a13235d32a9`
- compare: **66 ahead / 0 behind main**
- retirement code ownership remains isolated on `t5/retirement-epilogues`

The previous retirement-specific workflow on the immediately preceding synchronized HEAD passed build and all T5.36/T5.37 gates. Repository Integrity then stopped at the intended active-source freeze sentinel only after the ordinary validation suites passed. The unfrozen terminal candidate seen there was `4f7c783521a463509ac8bf9a0646b6c0aeaff6861a8d01ab8b1e43c19641e93b`. Do not freeze or bypass that sentinel while ordinary 34+ lineage is unfinished.

## 1. Complete active 34+ generation

task: terminal `contentIdentity` freeze and final migration edge  
owner: ordinary 34+ content owner + migration coordinator  
blocker: retirement must be the generation after the complete ordinary 34+ career, not before it  
missing contract: integrated/frozen authoritative ordinary 34+ generation plus exact adjacent source identity  
retirement action now: keep terminal runtime/tests ready; do not register the migration edge or invent a target hash

## 2. Full last-match authority (RET-005)

task: `LastMatchFact { fixture, club, opponent, competition, minutes, starter, result, goals, assists }`  
current main: retirement still has no integrated persisted authoritative match history producer.  
concrete successor: PR #156 / `t5/authoritative-match-model`, head `30764bafacd9712ed39af8f176312ec8ffa8a8d4`.  
current relation after `main@a7a0bb5…`: **1 ahead / 1 behind**; PR remains open/draft and therefore is not a consumable main contract yet.  
#156 provides: stable fixture identity/date/registration club/opponent/home-away/league competition, persisted `calledUp/onBench/started/appeared/minutes`, next/previous fixture, match-day and remaining fixture counts, save validation and deterministic replay with zero additional RNG draws.  
#156 still does not provide: authoritative final result, goals, assists/cards, or a shared query for the latest history entry with `player.appeared=true` when the immediately previous fixture is a non-appearance.  
certification snapshot: Repository Integrity run `35243389440` has PASS for project validation, PlayCanvas integration regression, T5 QA build and pre-content freeze sentinel; determinism is currently running.  
status: **partially unblocked, not integration-ready**.  
retirement action now: keep aggregate appearance fallback and null unsupported details; never infer result/goals or equate `previousFixture` with last appearance.

## 3. Terminal seed lifecycle

task: classify and wire 34+ / retirement seeds  
owner: T5.2/T5.4 + 34+ content owner  
blocker: retirement must not reinterpret 34+ declarations as a second state machine or mass-close them without owner evidence  
missing contract: per-seed producer, consumer and terminal closure rule  
retirement action now: explicit evidence only; preserve no-mass-close regression

## 4. 30–34 early-retirement semantics

task: decide whether `EVT_33_RET_001` already contains an announcement fact or should enter the standard terminal announcement flow  
owner: `t51/canon-30-34` + coordinator  
blocker: historical compatibility bridge currently compresses `playing -> decided -> announced -> closed` for the legacy flag  
retirement action now: retain the narrow bridge and frozen-legacy regression until canonical semantics are decided

## 5. Fixture-aware closure boundary (RET-007)

task: replace coarse time/contract closure trigger with authoritative final sporting boundary  
current main: the persisted match model required by retirement is still not integrated.  
producer candidate: PR #156 exposes `remainingOfficialMatches`, `remainingLeagueMatches`, `nextFixture`, `previousFixture`, match-day/training-window facts and official weekly league progression. In that candidate `remainingOfficialMatches` intentionally equals modeled league fixtures because league is the only modeled official competition.  
exact candidate: `30764bafacd9712ed39af8f176312ec8ffa8a8d4`; it is currently **1 ahead / 1 behind `main@a7a0bb5…`**.  
certification snapshot: project validation PASS; PlayCanvas PASS; QA build PASS; pre-content freeze sentinel PASS; determinism still running in Repository Integrity `35243389440`.  
status: **blocked pending complete exact-head CI, re-ground to current main, and integration**.  
unblock contract: once #156 (or a clean successor) is fully certified and on main, gate administrative closure on authoritative `remainingOfficialMatches/nextFixture`, while preserving announced-state playability, idempotence and a fail-closed compatibility path for saves without match history.  
retirement action now: do not copy the producer into this branch and do not depend on its private store shape before integration.

## Repository-integrity rule

Do not weaken the freeze sentinel to make terminal content pass. A terminal candidate identity appearing at the sentinel is evidence that the preceding lineage owner still controls the next migration edge; it is not permission to freeze that identity early.
