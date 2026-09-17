# Retirement / epilogues — Codex handoff

Owner branch: `t5/retirement-epilogues`  
PR: #118  
Integration base: always verify latest `main` before work; this handoff was refreshed after re-grounding on `main@6d2239ae1f89be97a7c5cf117d456cff9218aade`.

## Boundary

This workstream owns the terminal process only. Ordinary active 34+ veteran career belongs to PR #15 / `t51/canon-34plus` and must land/freeze first.

Current runtime state machine is:

`playing -> decided -> announced -> closed`

with only explicit pre-announcement `decided -> playing` reconsideration.

## What is implemented

- age/no-market/injury are context, not automatic retirement;
- explicit decision and explicit public announcement are separated;
- announced state remains playable;
- closed state is terminal and idempotent;
- post-announcement offers do not silently reopen retirement;
- no terminal event creates an appearance, fixture, goal, result or victory;
- last-appearance evidence is currently derived only from an authoritative cumulative appearance increase after announcement;
- `SportContext` is consumed directly and unavailable match facts remain unavailable;
- public `EVT_RET_ANNOUNCE_001` choices publish knowledge only through T5.3 live authority slots (`captain`, `star`, `activeAgent`, `currentClubInstitutional`);
- `WAIT` keeps retirement intent private and creates no public NPC knowledge;
- epilogue families are deterministic and evidence-gated;
- final save/load retains closed state and epilogue;
- `buildCareerSummary()` exposes read-only terminal facts and leaves unsupported sporting facts as `null`;
- T5.2 owner-backed seed-closure classifications are inherited from main and are never inferred automatically by retirement.

## Codex status

`implementation-ready.json` is authoritative:

- **8 implemented**;
- **0 ready**;
- **3 blocked**.

Do not reopen or duplicate implemented lots simply because an older handoff called them ready.

Blocked only:

1. `CODEX-RET-005` — full persisted `LastMatchFact`;
2. `CODEX-RET-007` — fixture/season-end-aware closure boundary;
3. `CODEX-RET-011` — final terminal contentIdentity freeze + adjacent migration edge.

## Hard blockers

1. **34+ canonical generation**: PR #15 / `t51/canon-34plus` still has a substantial ordinary-content backlog. Do not freeze/register terminal contentIdentity yet.
2. **Fixture/match authority**: current `SportContext` deliberately leaves fixture/calendar/competition/squad/minutes/result facts unavailable. A complete `LastMatchFact` cannot be built from aggregate appearances.
3. **Authoritative season-end boundary**: `remainingOfficialMatches`, `nextFixture` and related match-day facts are still unavailable, so closure cannot yet be truly fixture-aware.
4. **Terminal/34+ seeds**: owner-backed lifecycle classifications remain owner decisions; historical/runtime topology is evidence, not implicit closure authority.
5. **30–34 early retirement bridge**: the narrow historical compatibility path remains pending owner/coordinator semantic reconciliation before final lineage.

## Validation evidence

The retirement suite now includes `scripts/test-t536-npc-announcement.mjs` in addition to state-machine, sport, market, summary, save and epilogue regressions.

The latest certified merge tree before this documentation refresh passed:

- dedicated T5.36/T5.37 suite: **41/41**;
- T5.3 suite: **55/55**;
- T5.3 audit: `invalidKnowledgeRules=[]` and `passed=true`;
- repository validation proceeds to the expected fail-closed contentIdentity sentinel only.

Documentation-only commits still require final exact-head/merge-tree CI before integration status is reported as current.

## Codex rule

Read `implementation-ready.json`. Implement nothing locally for the three blocked tasks until their named upstream authority exists. Do not freeze contentIdentity, register a shortcut migration, weaken lineage sentinels, rewrite history/seeds, or merge PR #118 automatically.
