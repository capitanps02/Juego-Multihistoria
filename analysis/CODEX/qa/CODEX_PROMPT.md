# Codex QA bugfix prompt

Use exactly one task from `analysis/CODEX/qa/implementation-ready.json`.

Repository: `capitanps02/Juego-Multihistoria`  
Base: fetch the real current `main` immediately before work; compare it with the task's recorded base and re-ground safely.  
Do not merge automatically.

## Procedure

1. Copy the selected task fields: bugId, reproduction, failingTest, expected, actual, owner, allowedFiles, forbiddenFiles, acceptanceTests.
2. Reproduce the failing test before modifying runtime. If it no longer fails, stop and report the exact commit that already fixed it; do not create a speculative patch.
3. Edit only the smallest owner-approved surface. Do not weaken validation, delete assertions, update snapshots blindly, or change canonical probabilities to make QA green.
4. Add/retain the regression permanently.
5. Run the focused failing test, neighboring owner tests, save/RNG regressions when relevant, then full Repository Integrity on the exact HEAD.
6. Report: base SHA, head SHA, files changed, original reproduction result, final test results, CI run IDs, remaining blockers.

For contentIdentity-changing fixes, never create shortcut migrations, never rewrite historical freezes, and add exactly one adjacent generation from the actual active catalog. For non-content fixes, do not touch EVENTS/contentIdentity.
