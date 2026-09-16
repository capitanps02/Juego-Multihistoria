# T5.1 — Active PR execution preflight

Generated: 2026-09-16

Applies to the currently prepared task PRs:
- PR #3 — `task/t5.1-batch-01`
- PR #7 — `task/t5.1-batch-02b`
- PR #5 — `task/t5.1-batch-02a`

## Why this preflight exists

These branches were created from workflow commit:

`534663540c7b64a4e35e6f29b814704af3758435`

The workflow branch has since received substantial T5.1 audit/planning evidence. A GitHub refresh on 2026-09-16 showed all three task branches diverged and 57 commits behind the then-current workflow base.

Their own changes remained documentation/decision artifacts only; no functional runtime implementation had been added.

Therefore do not launch Codex from the stale branch state without first re-grounding it.

## Mandatory preflight before `ejecuta Codex`

For the selected READY task:

1. Re-read `project/CODEX_QUEUE.md` from GitHub.
2. Confirm the task is still the intended READY item and has not been merged/closed externally.
3. Fetch current PR metadata and compare the task branch with `chore/chatgpt-codex-workflow`.
4. Re-ground the task branch on the latest workflow base using a non-destructive merge/rebase strategy appropriate to the actual branch state.
5. Preserve all task-specific planning files already in the PR.
6. Confirm the branch now contains the latest:
   - `project/t5_1/T5_1_COMPLETION_GATE.md`;
   - `project/t5_1/T5_1_COMPLETION_STATUS_2026-09-16.md` (or later replacement);
   - `project/t5_1/T5_1_PRINCIPAL_BATCH_IMPLEMENTATION_RULES.md`;
   - `project/t5_1/T5_1_PRINCIPAL_87_BATCH_MANIFEST.json`;
   - conditional/retirement audit artifacts relevant to the task.
7. Re-read the branch-specific Codex prompt after re-grounding.
8. Refresh any audit baseline whose assumptions depend on the old base.
9. Only then invoke Codex for that task.

## Re-grounding safety

- Never merge the task PR into the workflow/base branch as part of this preflight.
- Never force-push/rewrite task history unless required and explicitly reviewed; prefer a normal forward merge of the latest workflow base into the task branch when practical.
- Do not drop task-specific commits/files.
- Do not mark a branch READY_TO_MERGE merely because it was re-grounded.
- Re-grounding is not implementation and is not a substitute for running current tests after Codex changes.

## PR-specific order

### PR #3
Can be executed first once re-grounded. It remains the default first READY item unless the queue changes.

### PR #7
Re-ground independently. Recommended after PR #3 implementation/review so the overall sequence remains easier to inspect, even though its original documentation scope is logically independent.

### PR #5
Do not execute merely because it is re-grounded. It remains blocked by PR #7's canonical age-26/seed chronology result. After PR #7 is integrated into the intended base, re-ground PR #5 again and refresh its semantic baseline before Codex.

## Post-Codex review

After implementation:
- inspect the actual diff;
- run/inspect current branch test evidence;
- compare changed files against task scope;
- verify migrations, seed chronology and content identity;
- move queue state to REVIEW/CHANGES_REQUESTED/READY_TO_MERGE as appropriate;
- never merge without Pedro's explicit `fusiona` instruction.
