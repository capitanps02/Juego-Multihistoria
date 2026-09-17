# T5.36 / T5.37 — Retirada, cierre y epílogos

Owner branch: `t5/retirement-epilogues`  
PR: #118

This workstream owns only the terminal layer. Ordinary 34+ veteran career belongs to PR #15 / `t51/canon-34plus`. Never merge automatically and never finalize terminal lineage before the preceding active generation is integrated and frozen.

## State machine

Allowed:

`playing -> decided -> announced -> closed`

and only explicit pre-announcement reconsideration:

`decided -> playing`

Ordinary `announced -> playing`, `closed -> playing`, `playing -> announced` and `playing -> closed` are invalid.

The only direct compatibility bridge retained is `EARLY_RETIRED_30_34`. The current 30–34 `EVT_33_RET_001` choice A semantically contains decision + announcement + end-of-season closure intent but persists only that legacy flag and `world.retirementReason="voluntary_30_34"`. Keep this bridge narrow until 30–34 writes explicit phases and a migration path.

## Implemented terminal rules

- age, injury, contract expiry and zero offers are context, never automatic retirement;
- explicit player intent creates `decided`;
- public announcement is separate from decision and closure;
- announced players remain active until factual/administrative terminal closure;
- `closeCareer()` is idempotent and consumes 0 RNG;
- closed saves remain terminal after load;
- no retirement event manufactures fixtures, appearances, minutes, goals, assists, results or wins;
- formal offer truth comes only from `src/simulation/offers.ts`;
- public announcement knowledge is already wired through T5.3 live NPC authority;
- epilogue family selection and final prose are deterministic and evidence-gated;
- CareerSummary is a read-only factual projection and leaves unsupported facts null;
- terminal closure does not mass-resolve seeds.

## RET-007 — fixture-aware closure implemented

PR #118 now consumes `SportContext` season authority:

- if `availability.remainingOfficialMatches === "known"` and the value is `> 0`, closure is blocked;
- if that authority is known and the value reaches `0`, closure may proceed from `announced`;
- if the authority is unavailable, the previous timeout remains only as a compatibility fallback.

No age/month/form proxy replaces official-match authority.

## Last-match factual boundary — RET-005

At announcement, retirement records the authoritative cumulative `careerAppearances` baseline. During `announced`, a later increase may set `LAST_MATCH_PLAYED=true`.

That proves only that at least one later appearance happened. It does not prove the identity of the player's final fixture.

`world.retirementLastAppearanceDate` is currently the observation/week date, not an authoritative match timestamp.

PR #156 / `t5/authoritative-match-model` is the producer candidate for richer fixture/match history. Its latest inspected Repository Integrity run was cancelled while the determinism step was still running, so it cannot yet be treated as a certified base. RET-005 additionally needs a query for the player's last actual appearance; `previousOfficialMatch()` is not equivalent if the player did not appear.

Until that exists, opponent, competition, starter/bench, exact minutes, result, goals and assists remain unavailable.

## Market authority

Use the formal offer APIs from `src/simulation/offers.ts`.

- no synthetic veteran offers;
- no role/salary/duration/destination fabrication;
- zero offers may create a reflection context, not retirement;
- an offer after announcement must be a real persisted CareerOffer;
- offer response cannot reopen a public announcement.

## NPC knowledge

Public `EVT_RET_ANNOUNCE_001` choices publish only through live authority slots:

- `captain`;
- `star`;
- `activeAgent`;
- `currentClubInstitutional`.

Unresolved slots fail closed. `WAIT` remains private. Do not rewrite historical NPC knowledge.

## Epilogues

Epilogue selection is deterministic and requires factual support. Important hard rules include:

- one-club vs journeyman conflict;
- one-club vs home-prodigal conflict;
- early-voluntary vs too-long conflict;
- market-silence/body-closed-door vs storybook conflict;
- retire-on-high vs unfinished conflict;
- storybook requires factual appearance plus factual last-goal evidence; legacy synthetic flags are insufficient.

Rendering may use only facts supported by state/history. No free RNG is consumed during epilogue selection/render.

## Seeds

T5.36/T5.37 do not mass-close seeds. Owner-backed closure classifications are explicit evidence, not inferred from naming or terminal state.

PR #191 supplies the dedicated canonical 34+ seed catalog and has been independently certified by focused CI plus Repository Integrity on its inspected head. It does not substitute for completion of ordinary 34+ content.

## Content identity / migration lineage — RET-011

The repository already has multi-hop migration-path infrastructure. The remaining blocker is generation ordering.

Required lineage:

`... -> 30–34 -> active ordinary 34+ -> retirement/epilogue`

Do not register a direct shortcut from a pre-34+ generation to retirement. Do not freeze a provisional terminal identity while PR #15 ordinary 34+ remains incomplete/unfrozen.

Only after the immediate predecessor is integrated and frozen may coordination:

1. calculate the terminal target `contentIdentity`;
2. freeze the target definition;
3. register exactly the adjacent predecessor -> terminal edge;
4. rerun pending/history/save/migration/determinism gates.

## Current Codex state

Authoritative queue: `analysis/CODEX/retirement/implementation-ready.json`.

- **9 implemented**
- **0 ready**
- **2 blocked**

Blocked only:
- RET-005 — factual full LastMatchFact;
- RET-011 — terminal freeze + adjacent migration edge.

RET-007 is implemented; do not recreate it.

## QA

Minimum terminal regression set:

`node --test scripts/test-t536-t537-retirement.mjs scripts/test-t536-career-summary.mjs scripts/test-t536-market-authority.mjs scripts/test-t536-sport-authority.mjs scripts/test-t536-npc-announcement.mjs scripts/test-t537-family-minimums.mjs scripts/test-t536-status-writer-inventory.mjs scripts/test-t537-epilogue-profiles.mjs`

Also run repository integrity/save/determinism gates on the exact integration HEAD. A failure before the known content freeze/lineage sentinel is a real regression. Never weaken the sentinel.

## Integration status

- terminal runtime: implemented on branch;
- terminal content: implemented on branch;
- RET-007: implemented and regression-covered;
- NPC public propagation: implemented through shared authority;
- deterministic factual epilogues: implemented;
- RET-005: blocked on richer certified match/appearance authority;
- RET-011: blocked on predecessor generation completion/freeze;
- merge to `main`: not performed.