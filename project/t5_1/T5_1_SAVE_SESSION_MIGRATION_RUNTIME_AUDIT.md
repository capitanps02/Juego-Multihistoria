# T5.1 — Save/session migration runtime audit

Generated: 2026-09-16  
Assessed branch: `chore/chatgpt-codex-workflow`

## Purpose

Define the actual compatibility problem created by T5.1 canonical reconciliation and the constraints a truthful migration layer must satisfy.

This audit covers two different persistence surfaces that must not be conflated:

1. **GameState saves** (`src/save/save.ts`), currently schema 8.
2. **Interactive SessionSnapshot saves** (`src/session/game-session.ts`), which additionally preserve content identity, pending UI state, command receipts and human-readable journal text.

T5.1 changes event definitions and IDs. That is fundamentally a **content migration**, not merely a GameState schema migration.

## Runtime findings

### 1. `contentIdentity` protects the whole event catalog

`GameSession` computes:

```ts
SHA256(JSON.stringify(events))
```

and stores the digest as `SessionSnapshot.contentIdentity`.

On `GameSession.resume`, current runtime requires exact identity equality **before** normal session validation:

```ts
saved.contentIdentity === contentIdentity(currentEvents)
```

Otherwise it throws `CONTENT_CHANGED`.

This is a good invariant and must not be weakened.

Consequence: virtually any T5.1 semantic change to an `EventDefinition` intentionally makes old interactive sessions incompatible until an explicit content migration runs.

Keeping the same event ID does not preserve compatibility.

### 2. A pending decision stores the entire event definition

`SessionSnapshot.pendingDecision` is:

```ts
{ instanceId, event: EventDefinition }
```

When the scheduler presents a scene, `#advance` stores a structured clone of the full event definition. The player-facing view is derived from that stored event.

This is valuable for T5.1 migration: an already-presented legacy decision can be preserved exactly without scheduling a replacement and without consuming narrative RNG.

### 3. Pending validation is intentionally exact

`assertSessionSnapshot` currently requires:

```ts
JSON.stringify(currentCatalogEvent) === JSON.stringify(savedPendingEvent)
```

Therefore these all invalidate an old pending scene even if the string ID is unchanged:
- title/body edits;
- gate edits;
- choice label/count changes;
- choice IDs;
- outcome definitions/messages;
- seed transitions;
- NPC refs;
- tags/presentation;
- any other serialized event field.

That is the correct security/truthfulness posture for the current single-catalog model.

T5.1 migration must extend the model explicitly rather than remove this exactness check.

### 4. Completed session history also depends on the current catalog

The `GameState.history` entry stores IDs and state facts:
- `eventId`;
- `choiceId`;
- `outcomeId`;
- date/season/club;
- snapshot of family/NPC refs/tags/age;
- salience/visibility.

The session `journal` stores the human-readable facts actually shown:
- date;
- event title;
- choice label;
- outcome messages.

During resume, `assertSessionSnapshot` currently looks up every historical `eventId` in the **current** catalog, then requires the current title/choice label/outcome messages to equal the saved journal.

Therefore:
- removing a technical event from the active catalog breaks old session validation;
- renaming it to a canonical ID breaks history unless history is rewritten;
- keeping the same ID but changing text/options/outcomes also breaks validation;
- an exact-ID semantic collision is still a migration problem.

### 5. Existing GameState migrations do not solve this

`src/save/save.ts` migrates GameState schema v2→v8. It adds professional fields, RNG streams, maturity/retirement state, etc.

It does **not** migrate:
- session `contentIdentity`;
- pending event definitions;
- journal-to-catalog compatibility;
- event semantic versions;
- event ID crosswalks.

The migration baseline fixtures intentionally freeze GameState behavior, but they do not provide a T5.1 catalog migration path.

### 6. Existing tests deliberately reject reinterpretation

Current session tests verify that:
- repeated save/resume preserves a pending scene/options/RNG exactly;
- changing the catalog causes `CONTENT_CHANGED`;
- tampering with a pending choice label causes `INVALID_SAVE`;
- reads do not mutate state/RNG;
- failed persistence rolls back state/RNG;
- command IDs/revisions prevent duplicate effects.

T5.1 compatibility must keep all of these guarantees.

## Historical truth implications

### Event history

Old history should remain old history unless same-scene identity was explicitly proven.

If technical `OLD_ID` was a different scene from canonical `NEW_ID`:
- preserve `history[*].eventId = OLD_ID`;
- preserve the old journal text;
- do not create `SEEN_NEW_ID` merely because both were about a similar topic.

### `SEEN_*` and cooldowns

Resolver writes:
- `eventCooldowns[event.id]`;
- `flags[SEEN_<event.id>] = true`.

Legacy `SEEN_*`/cooldown facts can remain as legacy facts after their event leaves the active catalog.

Only a reviewed `same_scene_rewrite_and_id_migration` mapping may establish canonical seen-equivalence. Even then, history should not need to be falsified to achieve scheduler suppression.

### Seeds

Seed creation stores `originEvent: event.id`; resolution may store `consumedBy: event.id`.

A semantically valid live seed may survive migration while its origin remains legacy-labelled.

Do not rewrite `originEvent`/`consumedBy` to canonical IDs unless the underlying scene identity is explicitly proven. Seed state truth and origin-label truth are separate questions.

## Required architecture for T5.1 session compatibility

### A. Recognized content migrations, never generic acceptance

Introduce an explicit content migration layer **before** the current identity-equality gate.

Conceptually:

```text
raw snapshot
  -> structural/envelope validation
  -> inspect source contentIdentity
  -> if current: normal strict path
  -> else: require a registered migration route
  -> validate source snapshot against its source/legacy catalog evidence
  -> migrate compatibility metadata without RNG/scheduling
  -> set current contentIdentity only after successful migration
  -> strict validation under the new compatibility-aware model
```

Unknown content identities must continue to fail explicitly.

There must be no "accept any old hash" fallback.

### B. Legacy compatibility catalogs are validation-only

For each supported old `contentIdentity`, preserve sufficient immutable event definitions to validate old completed/pending decisions.

These definitions must be isolated from active scheduling:
- active `EventIndex` receives canonical active events only;
- compatibility registry is used only for resume/history/pending validation and resolving an already-presented legacy decision;
- compatibility definitions must never become scheduler candidates.

This directly supports the T5.1 disposition `retire_technical_keep_history_only`.

### C. Pending legacy scene strategy

Preferred behavior for a recognized legacy pending scene:

1. Verify its saved full `EventDefinition` exactly against the registered source catalog/version.
2. Keep its `instanceId`, event definition, choice IDs/labels/outcomes and displayed information unchanged.
3. Update the session envelope to the current content migration version/identity without replacing the decision.
4. Allow the player's next `choose` command to resolve the **stored legacy definition**.
5. Record the result under the truthful legacy `eventId` unless an approved same-scene migration explicitly says otherwise.
6. Continue scheduling from the active canonical catalog after that decision/result lifecycle completes.

This consumes no narrative RNG merely to reconstruct the pending scene.

If the source identity or saved event definition cannot be validated, fail resume explicitly instead of substituting another scene.

### D. Completed mixed-version history needs per-entry provenance

After the first content migration, a session can contain:
- old history produced by legacy catalog A;
- later history produced by canonical catalog B.

A single session-level `contentIdentity` is not enough to validate both historically.

The compatibility-aware session format therefore needs immutable per-decision provenance. Recommended logical fields (exact schema may differ):

```json
{
  "sourceContentIdentity": "...",
  "eventFingerprint": "sha256(serialized event definition)",
  "eventId": "...",
  "choiceId": "...",
  "outcomeId": "..."
}
```

This provenance may live alongside journal entries, in history compatibility metadata, or another explicit versioned structure. What matters is that each resolved decision can be validated against the exact definition that produced it.

Do **not** solve mixed-version history by requiring old journal text to match the newly rewritten canonical event.

### E. Exact-ID semantic collisions require fingerprints/version provenance

T5.1 contains cases where the legacy and canonical scene share the same ID but not the same semantics.

Therefore a registry keyed only by `eventId` is insufficient.

Compatibility identity must include at least:
- source catalog/content identity; and/or
- exact event-definition fingerprint.

This is mandatory for cases such as exact-ID callbacks whose body/options/gates will change during reconciliation.

### F. Same-scene mappings are a special case, not the default

For a reviewed `same_scene_rewrite_and_id_migration` mapping, migration may additionally establish canonical scheduler equivalence, e.g. canonical seen suppression, **only because semantic identity was proven**.

That mapping must be explicit and auditable.

For `retire_technical_keep_history_only`:
- no canonical seen fact is manufactured;
- the canonical replacement remains eligible later if its actual gates are met;
- the old history remains readable through compatibility provenance.

## Session-version recommendation

T5.1 content migration changes persistence semantics, not just event data. A new session snapshot version is recommended rather than silently repurposing session v2.

A future v3 should explicitly define:
- per-decision content provenance;
- compatibility registry lookup semantics;
- pending legacy scene handling;
- old→current content migration records;
- mixed-version history validation.

Whether GameState itself requires schema v9 depends on where provenance metadata lives. Do not bump GameState merely to hide the issue; choose the smallest explicit versioned surface that preserves truth.

## Migration invariants

A T5.1 content migration must preserve exactly, unless an explicitly documented same-scene transformation says otherwise:
- `state.history` factual decisions;
- journal text actually shown;
- live/resolved seed state;
- seed origin/consumer labels where semantic identity is unproven;
- all RNG stream states and draw counts;
- pending decision's displayed definition;
- pending result;
- command receipts/fingerprints;
- revision;
- `needsWorldAdvance`;
- market pending/history state;
- retirement/epilogue factual state.

Migration itself must:
- consume zero RNG;
- schedule zero scenes;
- resolve zero choices;
- write nothing to persistent storage until the entire migrated snapshot validates;
- be deterministic and idempotent.

## Required tests

At minimum:

1. **Recognized identity/current path** — current identity resumes unchanged.
2. **Unknown content identity** — explicit failure, no persistence.
3. **Legacy pending technical scene** — same exact displayed scene/options survive migration; no RNG changes.
4. **Legacy pending scene with changed same string ID** — old definition is preserved; new canonical definition is not substituted.
5. **Approved same-scene pending mapping** — only if evidence exists; choice semantics remain identical.
6. **Retired technical completed history** — old ID/journal remains valid although absent from active scheduler.
7. **Exact-ID changed historical scene** — old text/choice/outcome validates against legacy provenance, not new catalog text.
8. **Mixed history** — legacy decisions + post-migration canonical decisions both resume successfully.
9. **Seed origin legacy label** — active seed survives without falsely rewriting origin.
10. **Approved seed-origin migration** — only reviewed same-scene origin changes.
11. **SEEN legacy only** — does not manufacture canonical SEEN for non-equivalent scene.
12. **Approved same-scene SEEN equivalence** — suppresses canonical duplicate only where reviewed.
13. **Receipts/revision** — unchanged and still idempotent after migration.
14. **Pending result** — survives migration exactly.
15. **Commit failure** — migration/next command remains rollback-safe.
16. **Microfeeds/RNG** — all four RNG streams identical immediately before/after migration.
17. **Double migration** — applying migration to already-current snapshot is a no-op.
18. **Tampering** — altered legacy pending event/journal/provenance is rejected.

## Impact on T5.1 batches

### Principal batches / conditional batches

Every batch that changes active event definitions changes catalog identity. Individual batches may choose temporary explicit incompatibility during development, but final T5.1 cannot claim save compatibility until the registered content migration path is implemented and tested.

### 05A auditor

The auditor should report not only event semantic status but migration status:
- source identity recognized;
- history compatibility available;
- pending compatibility available;
- same-scene mapping evidence where used;
- canonical seen/origin transformations explicitly justified.

### 04D retirement

Old retirement saves require special care because schema-v8 migration historically converted `EARLY_RETIRED_30_34` directly to `closed`. Do not reinterpret those historical facts silently while correcting future canonical FSM behavior.

## Bottom line

The current runtime correctly refuses to reinterpret changed content. T5.1 should preserve that strength.

The correct solution is **not** to relax `contentIdentity` or current catalog checks. It is to add an explicit, versioned content-migration/legacy-validation layer that can preserve old decisions exactly while keeping legacy definitions out of active scheduling.
