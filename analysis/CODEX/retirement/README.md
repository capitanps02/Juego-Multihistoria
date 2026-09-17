# Retirement / epilogues — Codex handoff

Owner branch: `t5/retirement-epilogues`  
PR: #118

This handoff was refreshed against `main@fa3c8bae524fef62e4eb9802e895df88588998c4`; always verify the latest base before work.

## Boundary

This workstream owns only the terminal process. Ordinary active 34+ veteran gameplay belongs to PR #15 / `t51/canon-34plus` and must land/freeze before terminal lineage is finalized.

Runtime state machine:

`playing -> decided -> announced -> closed`

Only explicit pre-announcement reconsideration may do `decided -> playing`.

## Current status

`implementation-ready.json` is authoritative:

- **9 implemented**;
- **0 ready**;
- **2 blocked**.

Implemented terminal behavior includes explicit decision/announcement separation, fail-closed reconsideration, real-offer authority, live NPC announcement knowledge, deterministic epilogues, factual CareerSummary, save compatibility, idempotent closure, and RET-007 fixture-aware closure gating.

Blocked only:

1. `CODEX-RET-005` — complete persisted `LastMatchFact`;
2. `CODEX-RET-011` — final terminal contentIdentity freeze + adjacent migration edge.

## RET-007 is implemented

The closure path now consumes `SportContext` season authority when it exists:

- known remaining official matches `> 0` => keep the announced career open;
- known remaining official matches `=== 0` => terminal closure may proceed;
- authority unavailable => retain the historical administrative timeout only as a compatibility fallback.

This is intentionally forward-compatible with the match-model producer. Do not reopen RET-007 as a new Codex task.

## Sporting facts / RET-005

`getSportContext(state).careerAppearances` is authoritative only as a cumulative aggregate. A post-announcement delta proves a later appearance occurred; it does not identify the final fixture.

`world.retirementLastAppearanceDate` is currently an observation/week date, not a fixture timestamp.

PR #156 / `t5/authoritative-match-model` is the upstream producer candidate. Its latest inspected Repository Integrity run was cancelled while the determinism step was still running, therefore it is not yet a certified integration base. A complete RET-005 additionally requires a factual query for the player's last actual appearance; `previousOfficialMatch()` alone is insufficient when the player did not appear in that fixture.

Unsupported opponent, competition, minutes, result, goals and assists remain null/omitted.

## Market and NPC authority

Formal offers come only from `src/simulation/offers.ts`; retirement does not synthesize market facts.

Public retirement announcement already uses the live T5.3 knowledge authority slots (`captain`, `star`, `activeAgent`, `currentClubInstitutional`). `WAIT` remains private and unresolved slots fail closed.

## 30–34 compatibility

`EVT_33_RET_001` choice A has been semantically audited. Its text represents a decision to close at season end and an announcement, while the current 30–34 implementation persists only `EARLY_RETIRED_30_34` plus `world.retirementReason="voluntary_30_34"`.

Therefore PR #118 retains one narrow compatibility bridge for that legacy flag. This is now a bounded compatibility contract, not an unresolved retirement blocker. Do not broaden it; the 30–34 owner should eventually persist explicit terminal phases and migration evidence.

## Seeds

Owner-backed seed closure classifications are evidence-driven. Retirement does not mass-close seeds or use retirement-named seeds as a second state machine.

PR #191 provides the dedicated 34+ canonical seed catalog and has had both its focused workflow and Repository Integrity certified green on the same inspected head. That seed work does not remove the need to finish/freeze ordinary 34+ content before terminal lineage.

## RET-011 lineage blocker

Multi-hop migration infrastructure already exists on `main`. The remaining blocker is ordering/freeze, not graph capability.

Required sequence:

`... -> 30–34 -> active ordinary 34+ -> retirement/epilogue`

Do not freeze the current terminal target or register a shortcut migration before the preceding active 34+ generation is integrated and frozen.

## Validation rule

The dedicated T5.36/T5.37 suite has passed on the runtime tree containing RET-007. Repository Integrity may stop at the intentional contentIdentity/freeze sentinel; any failure earlier than that is a real regression and must be fixed.

After any documentation or runtime commit, certify the **exact HEAD** again. Never report an older green run as proof for a newer commit.

## Integration rule

Do not auto-merge PR #118. Before any eventual integration report exact branch HEAD, exact current `main`, ahead/behind, CI results, runtime/shared-authority changes, and task count **9 implemented / 0 ready / 2 blocked**.