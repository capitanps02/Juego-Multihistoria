# T5.1 — Pre-implementation content freeze requirement

Generated: 2026-09-16

## Why this must happen before the first functional T5.1 event change

The assessed workflow branch has accumulated documentation/audit commits but has not yet changed the runtime event catalog. Therefore its current `EVENTS` serialization still represents the pre-T5.1 runtime content baseline.

`GameSession.contentIdentity` is SHA-256 over `JSON.stringify(events)`. Once the first functional event definition changes, the identity changes.

To support a truthful final T5.1 session migration, freeze the exact old catalog **before** modifying active event definitions.

This is a prerequisite for the first implementation task (currently PR #3 after re-grounding).

## Required frozen evidence

Before changing `src/content/events/**` on the first functional T5.1 branch:

1. Build the unchanged pre-T5.1 runtime from the re-grounded base.
2. Serialize the exact runtime `EVENTS` array using the same ordering/shape consumed by `contentIdentity`.
3. Compute and record the exact SHA-256 identity used by `GameSession`.
4. Store an immutable compatibility fixture/bundle sufficient to validate:
   - old completed principal decisions;
   - old completed conditional decisions;
   - old pending principal scenes;
   - old pending conditional scenes;
   - exact-ID semantic-collision cases.
5. Record:
   - source Git commit SHA;
   - `ENGINE_BUILD`;
   - session version;
   - GameState schema version;
   - event counts by principal/conditional/phase;
   - content identity hash;
   - fixture/bundle SHA-256.
6. Add tests proving the frozen catalog hashes to the recorded identity.

## Storage rule

The frozen legacy catalog is compatibility evidence, not active content.

It must never be imported into the active `EventIndex` or scheduler candidate set.

A future migration layer may use it only to:
- validate old journal/history decisions;
- validate an embedded pending legacy `EventDefinition`;
- resolve the already-presented pending legacy scene exactly;
- support reviewed same-scene equivalence decisions.

## Suggested artifact shape

Names are illustrative; implementation may choose another deterministic format:

```text
qa/fixtures/t5.1/pre-t51-content-manifest.json
qa/fixtures/t5.1/pre-t51-event-catalog.json
```

Manifest fields should include:

```json
{
  "gitCommit": "...",
  "engineBuild": "0.8.0-t2.5",
  "sessionVersion": 2,
  "gameStateSchemaVersion": 8,
  "contentIdentity": "<64 hex>",
  "eventCatalogSha256": "<64 hex>",
  "counts": {
    "total": 388,
    "principal": 254,
    "conditional": 134
  }
}
```

Do not fill hashes by hand. Generate them from the unchanged built runtime.

## Supported-source policy

Do not create migration routes for every intermediate task-branch content identity.

- Intermediate development branches may explicitly reject old sessions with `CONTENT_CHANGED` while reconciliation is in progress.
- Preserve strict validation throughout development.
- Final/release T5.1 migration should support deliberately selected released source identities, beginning with the frozen pre-T5.1 baseline when product policy requires it.

If additional historical releases need support, freeze/import their exact catalogs separately and register their identities explicitly.

## Tests to run before accepting the freeze

- serialized catalog count is 388;
- principal count is 254;
- conditional count is 134;
- computed content identity matches `GameSession` algorithm;
- repeat generation is byte/digest deterministic;
- no source/runtime changes were made before capture;
- compatibility bundle is not referenced by scheduler/EventIndex.

## Queue implication

When `ejecuta Codex` selects the first functional T5.1 task, the execution preflight must perform/verify this freeze **before** Codex edits active event definitions.

This requirement does not authorize Codex execution or merge by itself.
