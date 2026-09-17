# Retirement / epilogue blockers

## 1. Complete active 34+ generation

task: terminal contentIdentity freeze and final migration edge  
issue: retirement must be the generation after the complete ordinary 34+ career, not after the current partial entry batch  
owner: `t51/canon-34plus-career` + migration coordinator  
current evidence: `t51/canon-34plus-career@3d726c3` contains only `T5.29: canonicalize veteran career entry`; at the latest audit it was **1 commit ahead / 15 behind** `main` and no associated PR was found  
missing contract: re-grounded and integrated active 34+ generation, frozen authoritative 34+ target identity and adjacent lineage source  
what Codex can prepare now: terminal code/tests/docs that do not register migration or freeze identity

## 2. Full last-match authority

task: `LastMatchFact { fixture, club, opponent, competition, minutes, starter, result, goals, assists }`  
issue: current main only has aggregate/cumulative `sport.appearances` plus persisted football moments; no authoritative fixture/calendar/squad/result model  
owner: sport-context workstream, PR #141 / issue #124  
missing contract: persisted match history / fixture identity / appearance detail  
what Codex can prepare now: nullable DTOs, adapters and tests that reject proxies

## 3. Terminal seed lifecycle

task: classify and wire 34+ / retirement seeds  
issue: T5.2 records 68 34+ seeds without runtime producers/consumers; the 14 retirement-state seeds must not become a duplicate state machine  
owner: T5.2/T5.4 + 34+ content owner  
missing contract: per-seed producer, consumer and terminal closure rule  
what Codex can prepare now: consumers behind explicit evidence, no mass-close behavior, lifecycle tests

## 4. 30–34 early-retirement semantics

task: decide whether `EVT_33_RET_001` already contains an announcement fact or should enter the standard terminal announcement flow  
issue: current compatibility bridge compresses playing->decided->announced->closed for the historical flag  
owner: `t51/canon-30-34` + coordinator  
missing contract: canonical semantic decision and migration mapping  
what Codex can prepare now: keep narrow bridge and frozen-legacy regression only

## 5. Fixture-aware closure boundary

task: replace coarse time/contract closure trigger with authoritative final sporting boundary  
issue: current runtime cannot know whether official matches remain  
owner: sport authority + retirement integrator  
missing contract: `remainingOfficialMatches` / season-end authority  
what Codex can prepare now: pure close operation, idempotence and save tests

## Repository-integrity sentinel

Current exact-head repository validation reaches the post-T5.1 freeze check after passing build, T5.2 lifecycle/deferred/history gates, saves and T5.3 knowledge tests. It then fails closed because the terminal catalog identity is intentionally **not frozen**. Do not weaken that sentinel. It is evidence that blocker 1 still owns the next integration step, not evidence that retirement should invent a target hash.
