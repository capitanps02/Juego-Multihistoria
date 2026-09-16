# Codex task — T5.1 supported session/content migration

## Repository / branch

Repository: `capitanps02/Juego-Multihistoria`  
Work only on: `integration/content-migration-t51-v2`  
Never commit directly to `main`.

## Objective

Implement the narrow supported migration path described in `project/workstreams/T51_CONTENT_MIGRATION.md` for sessions created under the frozen pre-T5.1 content identity:

`2e07efd2ea99c4e9ec4c2b20ae89664204f76db2c55a72d567208799c01bccff`

The task is not to make every old/new event equivalent. The coordinator crosswalk has established 174/174 runtime-only legacy IDs as `retire_technical_keep_history_only` and approves 0 direct same-scene ID migrations.

## Required behavior

1. Keep current-content sessions on the existing resume path.
2. Reject unknown/unapproved source `contentIdentity` values.
3. Add an explicit registry keyed by exact source content identity.
4. Migrate only a deep clone; do not mutate caller input or persist during validation.
5. Consume zero RNG and schedule/resolve zero scenes during migration.
6. Preserve historical evidence exactly:
   - `state.history` IDs/choice/outcome/snapshot;
   - journal;
   - receipts/revision;
   - RNG state/draw counts;
   - seed state/payload/origin/terminal facts;
   - NPC relationships/knowledge/memory provenance;
   - market/offers/history;
   - retirement/epilogue facts.
7. Do not synthesize canonical `SEEN_*` from legacy `SEEN_*`.
8. Existing legacy event IDs may remain in history/cooldowns/flags after the active event leaves the scheduler.
9. Pending legacy decisions must keep the exact old definition/choice contract the player saw. Use frozen compatibility definitions derived from `qa/fixtures/t5.1/pre-t51-event-catalog.json`; these definitions must never become scheduler candidates.
10. Exact-ID semantic collisions must be disambiguated by source content provenance/fingerprint rather than ID string alone.
11. Stamp target content identity only after migration + validation succeed.
12. Migration must be deterministic and idempotent.

## Preferred implementation boundary

Keep changes narrow and easy to review. Prefer:

- `src/session/content-migration.ts` for registry/pure transformation;
- `src/session/content-compatibility.ts` for frozen pending-definition lookup/fingerprints;
- minimal integration into `src/session/game-session.ts`;
- dedicated tests `scripts/test-t51-content-migration.mjs`;
- package scripts/gates only as necessary.

Do not weaken `src/save/save.ts` schema validation to solve catalog mismatch. Save-schema migration and content-catalog migration are different concerns.

## Frozen compatibility data

Use the existing frozen T5.1 fixtures as authority. Do not regenerate them from the new active catalog:

- `qa/fixtures/t5.1/pre-t51-event-catalog.json`
- `qa/fixtures/t5.1/pre-t51-content-manifest.json`

If a compact generated compatibility artifact is needed, generate it deterministically from those frozen files and test its identity.

## Mandatory tests

Add executable tests proving all of the following:

1. frozen session with no pending decision migrates and resumes;
2. frozen session with pending legacy decision preserves exact old choices/text/definition fingerprint;
3. compatibility-only legacy definition cannot be returned by normal scheduler;
4. exact-ID semantic collision does not reinterpret old pending/history;
5. legacy history ID remains unchanged after migration;
6. legacy `SEEN_*` does not create canonical replacement `SEEN_*`;
7. seed state/payload/origin unchanged;
8. NPC knowledge/relationships/memories unchanged;
9. offer/market state unchanged;
10. receipts/revision/journal unchanged;
11. every RNG stream deep-equal before/after;
12. retirement status/reason/announcement/closure/epilogue unchanged;
13. unknown content identity rejected;
14. malformed snapshot rejected without persistence;
15. migration twice yields byte-equivalent supported state;
16. current-content session is a no-op with no migration;
17. serialize/migrate/serialize/load/resume round-trip works;
18. no migration test consumes RNG or calls scheduler/resolver.

## Required regression gates

At minimum run and report:

- `npm run build`
- `npm test`
- `npm run test:saves` if available
- `npm run qa:t5:saves`
- `npm run qa:t5:freeze`
- `npm run qa:t5:integration`
- `npm run qa:t5:fast`
- `npm run qa:t5:content`
- `npm run qa:t5:simulation`

If a command does not exist on the current branch, report that fact and use the nearest integrated equivalent; do not silently omit failures.

## Prohibited shortcuts

- no `contentIdentity` wildcard/ignore mode;
- no rewriting 174 legacy-only IDs into canonical IDs;
- no title/age/theme fuzzy mapping;
- no regeneration of the frozen baseline;
- no baseline hash update merely to satisfy a changed runtime;
- no replay of seeds/effects/events;
- no automatic retirement reversal/history rewrite;
- no legacy compatibility definitions in active scheduler inventory;
- no merge to `main`.

## Completion evidence

Return:

- files changed and rationale;
- source/target content migration registry entry;
- how pending compatibility is isolated from scheduler;
- exact tests/gates and results;
- any unsupported legacy situation that still fails explicitly;
- confirmation that history/RNG/seed/NPC/market/retirement facts are preserved.

Do not claim T5.1 complete: this task only unlocks safe canonical catalog evolution.
