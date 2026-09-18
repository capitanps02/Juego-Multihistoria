# Codex QA bugfix prompt

Use only tasks with `status=ready` from `analysis/CODEX/qa/implementation-ready.json`.

Repository: `capitanps02/Juego-Multihistoria`  
Recorded base: `main@5f4d14bca4d696cfafadb58b64034c7cd40cc147`. Fetch real current `main` before any work.  
Do not merge automatically.

## Current queue

There are **no free QA runtime implementation tasks** in this snapshot.

- **T5-QA-029 / #212:** owner fix exists in **PR #214**, branch `codex/t5-match-save-invariants`, audited HEAD `b688017e996449f88822dc7c54162c3f3b3e3c2f`. Do not implement a duplicate. QA should certify exact-head CI and rerun post-merge regression.
- **T5-QA-028 / #130:** blocked by `#207 -> #157`. Do not implement against MarketState v1.
- **T5-QA-016 / #61:** owner PR #118 already carries the fix.
- **T5-QA-027 / #133:** belongs to the next serialized LOCK23 content owner.

## Certification procedure for an owner fix

1. Fetch current `main` and compare the owner branch.
2. Reproduce the original QA test unchanged.
3. Verify the owner diff stays inside its write-set and does not weaken validation.
4. Run focused owner tests plus Repository Integrity on exact HEAD.
5. Require 0 behind immediately before integration recommendation.
6. After actual integration into `main`, rerun the original reproduction on main before changing bug status to resolved.

Never create shortcut content migrations, rewrite historical freezes, or create a second implementation merely because a QA defect is open.
