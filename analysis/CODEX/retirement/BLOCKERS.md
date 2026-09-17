# Retirement / epilogue blockers

## 1. Complete active 34+ generation

task: terminal contentIdentity freeze and final migration edge  
issue: retirement must be the generation after the complete ordinary 34+ career, not before it  
owner: PR #15 / `t51/canon-34plus` + migration coordinator  
current evidence: PR #15 is open and not merged. At the latest audit its branch is **7 ahead / 0 behind** `main`, but the effective diff remains handoff/documentation under `analysis/CODEX/canon-34plus/`; no active ordinary 34+ event implementation is added. Its own status remains strict runtime completion **0/43 ordinary principals** and forbids provisional lineage freeze.  
missing contract: implemented/re-grounded/integrated ordinary 34+ generation, frozen authoritative 34+ target identity and adjacent lineage source  
retirement action now: keep terminal runtime/tests ready, but do not register migration or freeze identity

## 2. Full last-match authority

task: `LastMatchFact { fixture, club, opponent, competition, minutes, starter, result, goals, assists }`  
current main: `SportContext` only provides cumulative appearances; exact match facts remain unavailable.  
concrete successor: PR #156 / `t5/authoritative-match-model` now implements a persisted official league match-history candidate. At audit it is **open/draft, 11 ahead / 5 behind main**, so it is not yet an integration authority.  
PR #156 provides: stable fixture ID/date/club/opponent/home-away/league competition, persisted `calledUp/onBench/started/appeared/minutes`, next/previous fixture, match day and remaining fixture counts.  
PR #156 still does **not** provide: match result, goals, assists/cards, or a shared read helper that searches history for the latest fixture where `player.appeared=true` when the immediately previous fixture was a non-appearance.  
status: **partially unblocked by PR #156, still blocked for full LastMatchFact**.  
missing contract: integrate a clean/certified successor of #156 and expose authoritative last-appearance history lookup; add result/goals/assists only if the canonical rich LastMatchFact continues to require them.  
retirement action now: keep aggregate appearance fallback and null unsupported details; never infer result/goals or assume `previousFixture` equals last appearance.

## 3. Terminal seed lifecycle

task: classify and wire 34+ / retirement seeds  
issue: T5.2 owner-backed closure classification exists on main, but terminal retirement must not reinterpret 34+ seed declarations as a second state machine or mass-close them without owner evidence  
owner: T5.2/T5.4 + 34+ content owner  
missing contract: per-seed producer, consumer and terminal closure rule for each terminal-relevant seed  
retirement action now: consumers only behind explicit evidence; preserve no-mass-close regression

## 4. 30–34 early-retirement semantics

task: decide whether `EVT_33_RET_001` already contains an announcement fact or should enter the standard terminal announcement flow  
issue: current compatibility bridge compresses playing->decided->announced->closed for the historical flag  
owner: `t51/canon-30-34` + coordinator  
missing contract: canonical semantic decision and migration mapping  
retirement action now: keep narrow bridge and frozen-legacy regression only

## 5. Fixture-aware closure boundary

task: replace coarse time/contract closure trigger with authoritative final sporting boundary  
current main: `remainingOfficialMatches`, `nextFixture`, match-day and squad facts are still unavailable.  
concrete successor: PR #156 changes this contract so `remainingOfficialMatches`, `remainingLeagueMatches`, `nextFixture`, `isMatchDay` and the weekly official league progression become known read-only facts. In that candidate, `remainingOfficialMatches` intentionally equals the modeled league-fixture count because league is the only modeled official competition.  
status: **blocked pending PR #156 re-ground + CI certification + integration**, not an unknown architectural requirement anymore.  
unblock contract: once #156 (or clean successor) is on main, retirement can gate administrative closure on the authoritative sporting boundary instead of elapsed days/contract months, while retaining a fail-closed compatibility path for old saves without match history.  
retirement action now: do not copy the unmerged match model into this branch and do not depend on its private store shape before integration.

## Repository-integrity sentinel

Do not weaken Repository Integrity to make terminal content pass. If the exact-head run reaches a content freeze/lineage failure after ordinary build/save/authority gates pass, that is evidence that blocker 1 still owns the next integration step, not permission to invent a target hash. Any earlier build/test failure is a real regression and must be fixed first.
