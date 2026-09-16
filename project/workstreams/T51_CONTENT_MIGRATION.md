# T5.1 — session/contentIdentity migration workstream v2

Branch: `integration/content-migration-t51-v2`  
Issue: #24  
Base: `main@800841b6780fc5d7b07ae3ca507a6b0131e9c305`

## Purpose

Allow supported sessions created with the frozen pre-T5.1 catalog to survive future canonical content repairs **without weakening `contentIdentity` and without rewriting what the player actually saw or did**.

Frozen source content identity:

`2e07efd2ea99c4e9ec4c2b20ae89664204f76db2c55a72d567208799c01bccff`

This workstream is shared infrastructure. It must land before active canonical catalog rewrites from T5.5–T5.35 or runtime portions of #13/#15.

## Current reconciliation facts

Coordinator crosswalk review is complete:

- 87 runtime-only principal legacy IDs reviewed;
- 87 runtime-only conditional legacy IDs reviewed;
- **174/174 = `retire_technical_keep_history_only`**;
- **0/174 approved same-scene ID migrations**;
- title, age, theme or seed lineage never authorizes identity rewriting;
- exact-string IDs may still be semantic collisions and therefore require source-content provenance.

Consequence: the migration layer should default to **preserving historical legacy identity**, not renaming it.

## Required architecture

### 1. Explicit registry

Add a content migration registry keyed by exact `sourceContentIdentity` and target content identity/version. Unknown identities remain rejected.

A registry entry may declare only reviewed operations. No fuzzy matching, title matching or age matching is allowed at runtime.

### 2. Immutable historical evidence

The following are immutable unless a specifically reviewed transformation proves byte/semantic equivalence:

- `state.history` event/choice/outcome IDs and factual snapshots;
- player-facing `journal` text/choice labels already recorded;
- command receipts and revisions;
- RNG stream state/draw counts;
- existing seed `originEvent`, `originSeason`, terminal history and payload facts;
- NPC knowledge `factId`/event provenance already learned;
- market history/offers already made;
- retirement announcement/decision/closure facts;
- epilogue facts already generated under a closed career.

Legacy IDs can remain in those structures even after they disappear from the active scheduler.

### 3. Pending legacy decision compatibility

A pending decision is highest-risk migration data.

If a frozen session has a pending legacy scene, migration must either:

1. resolve it using a compatibility-only frozen definition with the exact choice contract the player saw; or
2. apply an explicitly reviewed same-scene mapping.

Current coordinator crosswalk approves **zero** general legacy same-scene mappings. Therefore default behavior is compatibility-only definition or explicit unsupported-resume failure; never substitute a new canonical scene with different choices.

Compatibility-only definitions:

- are addressable only by migration/resume of approved old content identities;
- never enter normal scheduler candidates;
- do not manufacture canonical `SEEN_*` flags;
- do not replay effects or consume RNG during migration.

### 4. Exact-ID semantic collisions

An identical string ID across old/new catalogs is not sufficient proof that pending/history content is compatible.

Store/use source content provenance or an event-definition fingerprint for compatibility decisions. A new definition under an old string must not reinterpret an old pending scene.

PR #27 provides the 23–30 migration handoff and identifies exact-ID collision classes. Other canonical owners must provide equivalent machine-readable handoffs before their runtime batches land.

### 5. Seen/cooldown state

Legacy `SEEN_<legacyId>` and legacy cooldown entries remain legacy truth.

Do not synthesize `SEEN_<canonicalId>` unless explicit same-scene equivalence exists. Since the 174 legacy-only crosswalk currently has zero approved same-scene migrations, legacy seen/cooldown state must not automatically suppress a replacement canonical scene.

### 6. Seeds

Moving the canonical producer of a seed affects **future production**, not historical instances.

For an existing saved seed:

- keep `originEvent` and `originSeason` as historical truth;
- do not recreate it;
- do not consume/resolve/expire it merely because migration runs;
- preserve payload/intensity/state unless a reviewed schema migration requires otherwise;
- consume zero RNG.

### 7. NPC state

Preserve relationships, memories, knowledge, agendas/access metadata and acquisition provenance. Content migration must not grant knowledge merely because a canonical replacement event exists.

### 8. Retirement/epilogue

Preserve exact retirement status and historical facts. `closed` remains terminal. Migration must not make epilogue reachable earlier, manufacture a last match, erase an announcement, or convert legacy `CEVT_RET_RECONSIDER` into canonical reversal history.

Future canonical `CEVT_38_RETIREMENT_REVERSAL` behavior is a separate product decision.

## Implementation shape

Preferred narrow modules:

- `src/session/content-migration.ts` — pure registry/transform dispatcher;
- `src/session/content-compatibility.ts` — frozen-definition/fingerprint lookup for pending scenes;
- `src/session/game-session.ts` — invoke migration only after structural validation and before current-content resume validation;
- frozen compatibility data generated from `qa/fixtures/t5.1/pre-t51-event-catalog.json`, not from mutable current runtime definitions;
- dedicated tests under `scripts/test-t51-content-migration.mjs`.

Do not mix content migration into ordinary `src/save/save.ts` schema migration unless the boundary is explicit: save schema migration answers “can this object shape be read?”, content migration answers “can this historical catalog snapshot be resumed under this current catalog?”.

## Required migration transaction

1. Parse/validate session shape without executing gameplay.
2. Read saved source `contentIdentity`.
3. If equal to current identity, use normal resume path with no migration.
4. Otherwise lookup exact supported migration registry entry.
5. Reject unknown source identity.
6. Deep-clone and transform only explicitly allowed metadata/compatibility fields.
7. Preserve history/journal/receipts/revision/RNG/seeds/NPC/market/retirement factual state.
8. Resolve pending compatibility reference to frozen definition if necessary; do not schedule anything.
9. Validate migrated snapshot fully.
10. Stamp the target content identity only after validation succeeds.
11. Re-running migration on migrated snapshot is a no-op/idempotent.

## Mandatory tests before Ready

1. Frozen pre-T5.1 session, no pending decision -> migrate -> resume.
2. Frozen pending legacy decision -> exact old choice contract survives.
3. Exact-ID semantic collision -> old pending/history not interpreted with new definition.
4. Runtime-only historical event remains visible evidence but cannot schedule in new catalog.
5. Legacy `SEEN_*` does not manufacture replacement canonical `SEEN_*`.
6. Active seed keeps state/payload/origin/RNG exactly.
7. Pending offer and market history unchanged.
8. NPC relationships/knowledge/memories unchanged.
9. Receipts/revision/journal unchanged.
10. All RNG streams deep-equal before/after.
11. Retirement status/reason/announcement/closure/epilogue unchanged.
12. Unknown source content identity rejected.
13. Malformed session rejected before migration side effects.
14. Migration is deterministic and idempotent.
15. Serialize -> migrate -> serialize/load -> resume round-trip.
16. Compatibility-only legacy definitions are absent from scheduler candidates.
17. Current-content session takes no migration path.
18. `npm test`, `npm run qa:t5:saves`, determinism, RNG, lifecycle, long-career and integration probes green on exact HEAD.

## Integration sequence

1. Land migration infrastructure with frozen pre-T5.1 compatibility only.
2. Re-ground canonical content batches onto that main.
3. Each content batch supplies explicit migration metadata for its exact-ID collisions/removals before changing active definitions.
4. Run migration + batch-specific semantic/causal gates.
5. Never regenerate the pre-T5.1 freeze to make a test pass.

## Status

`CONTRACT_READY / RUNTIME_NOT_IMPLEMENTED / DO_NOT_MERGE`

The previous PR #25 closed empty and provides no runtime capability. This v2 workstream supersedes that empty attempt while preserving issue #24 as the integration authority.
