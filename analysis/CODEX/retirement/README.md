# Retirement / epilogues — Codex handoff

Owner branch: `t5/retirement-epilogues`  
PR: #118

Audited runtime base: `main@5f4d14bca4d696cfafadb58b64034c7cd40cc147`.

## Current state

Authoritative queue: `implementation-ready.json`.

- **9 implemented**
- **0 ready**
- **3 blocked**
- **1 partially unblocked**

Blocked:
1. RET-005 — factual rich LastMatchFact / terminal sporting evidence;
2. RET-011 — serial terminal contentIdentity freeze + adjacent migration edge;
3. RET-012 — canonical exceptional comeback.

Runtime-certified pre-doc head `46a305e6406c1116b05d09a70157910c5fc6706c` is 83/0 over main. Dedicated run `35330749211`: **45/45 PASS**. Repository Integrity `35330749282` stops only at provisional terminal freeze sentinel `06cebf93…`.

## Sport authority

The authoritative weekly match model from PR #156 is now in main. RET-007 therefore consumes real remaining-fixture authority.

PR #202 is the remaining public-read delta for latest actual player appearance:
- head `e9b68de453822e184854e9e7cce879f10e1834bb`;
- 2 ahead / 0 behind main;
- focused run `35331003785`: **18/18 PASS**.

Result/goals/assists/cards remain owned by #199; injury chronology by #200; suspension remains unsupported until explicitly modelled.

## State machine

`playing -> decided -> announced -> closed`

Only explicit pre-announcement reconsideration may do `decided -> playing`.

Canonical `CEVT_38_RETIREMENT_REVERSAL` is a future narrow post-announcement exception defined in `CANONICAL_REVERSAL_CONTRACT.md`; it must never reopen `closed` or be aliased to legacy reconsideration.

## Lineage

Required order:

`... -> 30–34 -> active ordinary 34+ -> retirement/epilogue`

PR #15 ordinary 34+ is preparation-certified but runtime principals remain 0/43. Do not freeze terminal identity until the immediately preceding ordinary 34+ generation is real, integrated and frozen.

## Integration rule

Never auto-merge #118. Never weaken the freeze sentinel. Re-certify every final exact HEAD after documentation or runtime changes.
