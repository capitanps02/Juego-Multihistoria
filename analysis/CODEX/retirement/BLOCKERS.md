# Retirement / epilogue blockers

## 1. Complete active 34+ generation

task: terminal contentIdentity freeze and final migration edge  
issue: retirement must be the generation after the complete ordinary 34+ career, not before it  
owner: PR #15 / `t51/canon-34plus` + migration coordinator  
current evidence: PR #15 is open and not merged. Its current reconciliation classifies all 50 34+ canonical principal identities but explicitly states that **43 principals remain not accreditable as complete implementations**; it also preserves the rule that no provisional 34+ target identity may be frozen or registered before the preceding generations and ordinary 34+ are authoritative. The older `t51/canon-34plus-career` branch is only a stale historical snapshot (1 commit ahead / 30 behind latest audited main).  
missing contract: re-grounded and integrated ordinary 34+ generation, frozen authoritative 34+ target identity and adjacent lineage source  
what Codex can prepare now: terminal code/tests/docs that do not register migration or freeze identity

## 2. Full last-match authority

task: `LastMatchFact { fixture, club, opponent, competition, minutes, starter, result, goals, assists }`  
issue: PR #141 has landed `SportContext`, which makes cumulative `careerAppearances` authoritative and explicitly marks fixture/match/squad facts unavailable. `getCurrentMatchContext()` returns `no_authoritative_match_model`; `football-moments` records isolated evidenced moments but is not a fixture/match-history store. Therefore a post-announcement appearance delta is factual aggregate evidence, but it cannot identify the actual fixture or its details.  
owner: sport-context / match-simulation authority + retirement integrator  
missing contract: persisted match history / fixture identity / appearance detail with opponent, competition, minutes, starter/bench, result, goals and assists  
what Codex can prepare now: consume `getSportContext(state).careerAppearances`, keep unavailable match fields null, and add adapters/tests that reject proxies

## 3. Terminal seed lifecycle

task: classify and wire 34+ / retirement seeds  
issue: T5.2 provenance/lifecycle work is still moving on main; terminal retirement must not reinterpret 34+ seed declarations as a second state machine or mass-close them without owner evidence  
owner: T5.2/T5.4 + 34+ content owner  
missing contract: per-seed producer, consumer and terminal closure rule for each terminal-relevant seed  
what Codex can prepare now: consumers behind explicit evidence, no mass-close behavior, lifecycle tests

## 4. 30–34 early-retirement semantics

task: decide whether `EVT_33_RET_001` already contains an announcement fact or should enter the standard terminal announcement flow  
issue: current compatibility bridge compresses playing->decided->announced->closed for the historical flag  
owner: `t51/canon-30-34` + coordinator  
missing contract: canonical semantic decision and migration mapping  
what Codex can prepare now: keep narrow bridge and frozen-legacy regression only

## 5. Fixture-aware closure boundary

task: replace coarse time/contract closure trigger with authoritative final sporting boundary  
issue: landed `SportContext` deliberately exposes `remainingOfficialMatches`, `nextFixture`, match day and squad status as unavailable/null, so retirement still cannot know whether an official appearance opportunity remains  
owner: sport authority + retirement integrator  
missing contract: authoritative `remainingOfficialMatches` / season-end / fixture progression  
what Codex can prepare now: pure close operation, idempotence, save tests and fail-closed nullable facts

## Repository-integrity sentinel

Do not weaken Repository Integrity to make terminal content pass. If the exact-head run reaches a content freeze/lineage failure after ordinary build/save/authority gates pass, that is evidence that blocker 1 still owns the next integration step, not permission to invent a target hash. Any earlier build/test failure is a real regression and must be fixed first.
