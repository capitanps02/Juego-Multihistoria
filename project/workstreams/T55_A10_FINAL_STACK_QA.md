# T5.5 A10 final-stack QA harness

QA-only branch based on PR #771 exact final-stack tree.

This branch does not change runtime, content, UI behavior, save schema, scheduler, sports-core, migrations, or narrative outcomes.

It only:
- restores the latest A17 invariant harness so T17.16b executes;
- wires the existing A18 template-copy regression into `npm test`;
- triggers the normal main-targeted CI matrix for independent final-stack evidence.

Do not merge this QA branch into production.
