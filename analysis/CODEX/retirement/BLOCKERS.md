# Retirement / epilogue blockers

Coordination snapshot: 2026-09-18.

Runtime-certified retirement head before this documentation refresh: `46a305e6406c1116b05d09a70157910c5fc6706c` on `main@5f4d14bca4d696cfafadb58b64034c7cd40cc147`, **83 ahead / 0 behind**.

- dedicated T5.36/T5.37 run `35330749211`: **SUCCESS, 45/45 PASS**;
- Repository Integrity `35330749282`: reaches the intentional active-source freeze sentinel;
- provisional terminal identity: `06cebf93a642ff776670356449777255cb8afe009b424d9cb0a22b44e158dcb0` — **do not freeze**.

A failure before that sentinel is a real regression. A documentation commit after this runtime-certified head still requires exact-head re-certification.

## RET-005 — factual last match / terminal sporting facts

The authoritative weekly match model from PR #156 is now **integrated in main** at `5f4d14bca4d696cfafadb58b64034c7cd40cc147`.

Available shared facts now include fixture/date, competition, opponent, home/away, call-up/bench/start/appearance/minutes/injuryUnavailable, next/previous fixture and remaining official fixtures.

PR #202 is now a small main-based delta:

- branch `t5/sport-retirement-read-optimization`;
- HEAD `e9b68de453822e184854e9e7cce879f10e1834bb`;
- **2 ahead / 0 behind main**;
- focused run `35331003785`: **SUCCESS, 18/18 PASS**;
- adds `getLastPlayerAppearanceContext(state)`, which returns the latest persisted official row where `player.appeared===true` and skips newer non-appearances.

Still blocked/fail-closed:

- final result/goals/assists/cards and exact last-goal evidence: owner #199;
- factual injury chronology for canonical no-last-match injury route: owner #200;
- explicit suspension/ban authority: unsupported until a producer exists.

RET-005 is therefore **partially unblocked**, not complete.

## RET-011 — serial terminal lineage

The multi-hop migration engine already exists in main. Remaining work is ordering and freezing real generations.

PR #15 / ordinary 34+:

- audited head `c99fce052918540a52c3992ccd8152282f26a34b`;
- 43/43 principal cards prepared;
- 32/32 conditionals classified;
- 0 unresolved authority domains after routing to #176/#199/#200/#201;
- Repository Integrity `35262171147`: SUCCESS;
- runtime principals still 0/43 and runtime-accredited conditionals 0/32.

Required lineage remains:

`... -> 30–34 -> active ordinary 34+ -> retirement/epilogue`

Do not freeze terminal identity or create a shortcut edge before the immediately preceding ordinary 34+ generation is integrated and frozen.

## RET-012 — canonical exceptional comeback

`CEVT_38_RETIREMENT_REVERSAL` is not legacy `CEVT_RET_RECONSIDER`.

The design contract is `analysis/CODEX/retirement/CANONICAL_REVERSAL_CONTRACT.md`.

The only acceptable future exception is a narrow, transactional `announced -> playing` before closure, backed by a concrete compatible post-announcement CareerOffer. `closed` remains terminal and epilogues are never erased.

Issue #176 owns the missing market producer/provenance. Until it lands, RET-012 remains blocked.

## Current queue

Authoritative file: `analysis/CODEX/retirement/implementation-ready.json`.

- **9 implemented**
- **0 ready**
- **3 blocked**
- **1 partially unblocked**

Blocked: RET-005, RET-011, RET-012.

Never weaken the active-source freeze sentinel and never auto-merge PR #118.
