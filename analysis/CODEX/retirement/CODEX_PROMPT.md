# Codex prompt — retirement / last match / epilogues

Work on `capitanps02/Juego-Multihistoria`.

Owner branch: `t5/retirement-epilogues` (PR #118). Never work directly on `main`; never auto-merge.

## Boundary

Own only retirement decision/announcement, final playing phase, career closure and epilogues. Ordinary active 34+ career belongs to PR #15.

Normal state machine:

`playing -> decided -> announced -> closed`

Only explicit private pre-announcement reconsideration may do `decided -> playing`. Do not reopen `closed`. Do not globally permit `announced -> playing`; the future canonical reversal is a narrowly authorized exception only.

## Current queue

`analysis/CODEX/retirement/implementation-ready.json` is authoritative.

- **9 implemented**
- **0 ready**
- **3 blocked**
- **1 partially unblocked**

Implemented: RET-001/002/003/004/006/007/008/009/010.

Blocked:
- RET-005 — rich factual LastMatchFact / terminal sporting facts;
- RET-011 — final terminal contentIdentity freeze + adjacent migration edge;
- RET-012 — canonical exceptional post-announcement comeback.

Do not duplicate implemented lots.

## Shared sport authority

The PR #156 match producer is already integrated in `main@5f4d14bca4d696cfafadb58b64034c7cd40cc147`.

Use shared SportContext/match-model facts. Never infer opponent, minutes, result, goal, assist, cards or suspension from role/form/age/flags.

PR #202 is the focused remaining read-layer candidate, currently `e9b68de453822e184854e9e7cce879f10e1834bb`, 2/0 over main, focused run `35331003785` **18/18 PASS**. Its public API `getLastPlayerAppearanceContext(state)` identifies the latest actual appearance rather than merely the latest fixture.

#199 owns result/goals/assists/cards; #200 owns injury chronology. Unsupported facts stay null/fail-closed.

## RET-007

Already implemented. Known `remainingOfficialMatches > 0` blocks closure; known zero permits closure. Do not replace this with age/month/form proxies. The shared match calendar in main now activates this path.

## Market authority / RET-012

Formal offer truth comes only from market authority. Zero offers do not retire the player.

Canonical `CEVT_38_RETIREMENT_REVERSAL` is distinct from legacy `CEVT_RET_RECONSIDER`. Read `CANONICAL_REVERSAL_CONTRACT.md`.

Do not code RET-012 until #176 provides deterministic, ambiguity-safe post-announcement CareerOffer production/provenance. `closed` remains terminal.

## RET-011 lineage

Multi-hop migration infrastructure already exists. Required order:

`... -> 30–34 -> active ordinary 34+ -> retirement/epilogue`

No shortcut edge. Do not freeze provisional terminal identity `06cebf93a642ff776670356449777255cb8afe009b424d9cb0a22b44e158dcb0`.

## Mandatory invariants

- no auto-retirement from age, injury, expiry or zero offers;
- announcement is distinct from closure;
- retirement never fabricates sporting facts;
- closure is idempotent and 0 RNG;
- epilogues are deterministic/evidence-gated;
- saves do not rewrite history or seed origin;
- closed saves remain terminal;
- never weaken lineage/freeze sentinels.

## Validation

Minimum terminal suite is the T5.36/T5.37 workflow plus repository save/determinism/integrity gates.

Latest runtime-certified head before this documentation refresh: `46a305e6406c1116b05d09a70157910c5fc6706c`, dedicated run `35330749211` **45/45 PASS**; Repository Integrity `35330749282` stops only at the intentional active-source freeze sentinel.

Always certify the exact final HEAD you hand off.
