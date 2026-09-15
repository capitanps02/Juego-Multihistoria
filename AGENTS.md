# AGENTS.md — Juego Multihistoria

This file defines repository-wide instructions for coding agents working on this project.

## Product goal

Build **Carrera de Futbolista / Multihistoria** as a fast football-career simulation with persistent narrative memory, consequential decisions, reproducible simulation and a lightweight presentation layer for web/PlayCanvas/Android.

The repository is the source of truth. Do not rely on undocumented assumptions from chat history when the repository contains a conflicting specification.

## Architectural boundaries

- `src/` contains the TypeScript engine and is the authoritative implementation of simulation, narrative, session, save and validation logic.
- `web/` contains the player-facing web UI and persistence adapter.
- `playcanvas/` contains generated/integration assets for PlayCanvas. Do not hand-edit generated bundles when a build script owns them.
- `android/` packages the offline web build in a native Android shell. Preserve offline operation unless a task explicitly changes that requirement.
- `project/` contains scope, execution plans and closure reports.
- `analysis/` and `qa/` contain evidence, audits and generated validation outputs. Do not treat a historical report as proof of the current build unless regenerated or explicitly stated.
- `dist/` is generated output. Prefer changing source and rebuilding rather than patching compiled files.

## Non-negotiable invariants

1. **Determinism and RNG separation**
   - Preserve independent RNG streams (`narrative`, `football`, `microfeed`, `qa`).
   - A UI read must never advance simulation or consume RNG.
   - Enabling/disabling microfeeds must not perturb strong narrative outcomes for the same seed unless a task explicitly revises this contract.

2. **Save integrity and compatibility**
   - Never silently invalidate a compatible save.
   - Preserve revision checks, idempotent command handling and commit-before-publish semantics in `GameSession`.
   - Content identity changes require an explicit migration or an explicit incompatibility decision.

3. **Player authority**
   - Do not make irreversible sporting or contract decisions on behalf of the player unless the documented design explicitly delegates that decision.
   - Offers, choices and retirement decisions must respect existing authority rules.

4. **Canonical narrative fidelity**
   - `verified` means the implementation has been explicitly reconciled against the approved canonical source.
   - `technical_adaptation` must not be promoted to `verified` based on similarity of title, age, topic or inferred intent.
   - Do not invent aliases between canonical event IDs without an explicit semantic reconciliation covering trigger, visible information, uncertainty, choices, consequences, memory and save continuity.

5. **Generated artifacts**
   - Do not manually edit generated PlayCanvas, Android-offline or `dist/` copies when the source is available.
   - Regenerate them using the repository scripts and report what was regenerated.

## Working method

For every implementation task:

1. Read the task/PR description and relevant files before editing.
2. Identify the smallest safe change that satisfies the acceptance criteria.
3. Preserve existing public contracts unless the task explicitly changes them.
4. Add or update targeted tests for behavioral changes.
5. Run the narrowest relevant tests first, then the required gate(s) below.
6. Summarize changed files, tests run, known limitations and any follow-up work.

Do not broaden scope just because adjacent cleanup is possible. If a necessary dependency is outside scope, document it rather than silently redesigning the project.

## Validation expectations

Default baseline for engine changes:

```bash
npm run build
npm run validate
```

Then run targeted tests for the touched subsystem, for example:

```bash
npm run test:session
npm run test:saves
npm run test:offers
npm run test:persistence
npm run test:playcanvas
npm run test:android:offline
```

Do not run `npm run qa:1000` unless the task needs full-batch evidence or the acceptance criteria explicitly request it; it is intentionally expensive.

If the local environment cannot execute a required command, state that clearly and do not mark the criterion as passed.

## Git / PR discipline

- Work on the task branch, not directly on `main`.
- Keep commits scoped and descriptive.
- Do not merge the PR unless the user explicitly requests it.
- Do not rewrite unrelated history or force-push unless explicitly instructed.
- Never commit secrets, API keys, keystores, `.env` files, local SDKs or personal saves.

## Code review rules

### Narrative and simulation

Flag any change that can alter deterministic outcomes without an explicit migration/balance rationale, especially accidental RNG consumption, scheduler ordering changes or state mutation during reads.

### Persistence

Flag any change that weakens transactional save behavior, stale-revision detection, recovery-copy integrity or content-identity validation.

### Canon

Flag any change that labels content as canonically verified without traceable reconciliation evidence.

### Generated files

Flag hand-edits to generated bundles when the corresponding source/build pipeline exists.
