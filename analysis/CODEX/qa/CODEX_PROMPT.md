# Codex QA bugfix prompt

Use exactly one task from `analysis/CODEX/qa/implementation-ready.json`.

Repository: `capitanps02/Juego-Multihistoria`  
Recorded base: `main@5f4d14bca4d696cfafadb58b64034c7cd40cc147`. Fetch the real current `main` immediately before work and re-ground safely if it moved.  
Do not merge automatically.

## Procedure

1. Copy the selected task fields: bugId, reproduction, failingTest, expected, actual, owner, allowedFiles, forbiddenFiles, acceptanceTests.
2. Reproduce the failing test before modifying runtime. If it no longer fails, stop and report the exact commit that already fixed it.
3. Edit only the smallest owner-approved surface. Do not weaken validation, delete assertions, update snapshots blindly, or change canonical probabilities to make QA green.
4. Add/retain the regression permanently.
5. Run focused test, neighboring owner tests, save/RNG regressions when relevant, then full Repository Integrity on exact HEAD.
6. Report base SHA, head SHA, files changed, original reproduction result, final tests, CI run IDs and remaining blockers.

## Current task selection

- Prefer **T5-QA-029 / #212** first: isolated fail-closed match-model/save validator hardening.
- Then **T5-QA-028 / #130**: Pass A employment authority is now unblocked because PR #156 is in main.
- Do **not** create a second fix for T5-QA-016/#61; owner PR #118 already carries that runtime fix.
- Do **not** implement T5-QA-027/#133 from QA; it belongs to the next serialized LOCK23 content owner.

For contentIdentity-changing fixes, never create shortcut migrations or rewrite historical freezes. These two ready QA tasks are non-content fixes and must not touch EVENTS/contentIdentity.
