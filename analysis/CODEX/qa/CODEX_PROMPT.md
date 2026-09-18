# Codex QA bugfix prompt

Use only tasks with `status=ready` from `analysis/CODEX/qa/implementation-ready.json`.

Repository: `capitanps02/Juego-Multihistoria`  
Recorded base: `main@49f16b21c8f68f1439901437dcf16e1384966de2`. Fetch real current `main` before any work.  
Do not merge automatically.

## Current queue

There are **no free QA runtime implementation tasks** in this snapshot.

- **T5-QA-029 / #212:** owner fix exists in **PR #214**, current HEAD `6e22e4232939c1668ac9ab748d6ee6c22d47440e`, 1 ahead / 0 behind current main. Do not duplicate; exact-head RI then post-merge regression.
- **T5-QA-028 / #130:** blocked by `#207 -> #157`. Do not implement against MarketState v1.
- **T5-QA-016 / #61:** owner PR #118 already carries the fix.
- **T5-QA-027 / #133:** belongs to the next serialized LOCK23 content owner; permanent QA guard exists.
- **T5-QA-031 / #175 / PR #207:** owner must add fail-closed save validation for optional `CareerOffer.context`; RI is green but QA blocks integration until this passes.
- **T5-QA-032 / #241:** A1/save owner must validate persisted `npc.knowledge` values against the existing record contract.

## Certification procedure for an owner fix

1. Fetch current `main` and compare the owner branch.
2. Reproduce the original QA test unchanged.
3. Verify the owner diff stays inside its write-set and does not weaken validation.
4. Run focused owner tests plus Repository Integrity on exact HEAD.
5. Require 0 behind immediately before integration recommendation.
6. After actual integration into `main`, rerun the original reproduction on main before changing bug status to resolved.

Never create shortcut content migrations, rewrite historical freezes, or create a second implementation merely because a QA defect is open.
