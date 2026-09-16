# T5.1 — Session v3 compatibility design specification

Generated: 2026-09-16  
Status: design only; no runtime implementation authorized.

## Goal

Extend the current strict single-catalog `SessionSnapshot` model so a migrated session can truthfully contain:
- completed decisions produced by a supported legacy catalog;
- an already-presented pending legacy decision;
- later decisions produced by the current canonical catalog;

without:
- weakening `contentIdentity`;
- rewriting historical IDs;
- allowing legacy events back into scheduling;
- consuming RNG during migration;
- losing receipt/revision integrity.

## Important runtime distinction

The actual GameState validator used by `GameSession` is `src/save/validation.ts`.

GameState validation checks historical `eventId`, `choiceId`, `outcomeId`, seed `originEvent`/`consumedBy`, etc. structurally, but does not require those event IDs to exist in the current active event catalog.

The catalog coupling occurs in `src/session/validate-session.ts`, which currently validates journal/history and pending decisions against the current `events` array.

Therefore T5.1 can preserve legacy `GameState.history` truth and solve compatibility primarily in the session layer.

## Proposed SessionSnapshot v3 logical model

Exact TypeScript names may vary, but preserve these semantics.

```ts
interface DecisionContentProvenance {
  sourceContentIdentity: string;
  eventFingerprint: string;
}

interface PendingDecisionV3 {
  instanceId: string;
  event: EventDefinition;
  provenance: DecisionContentProvenance;
}

interface SessionSnapshotV3 {
  sessionVersion: 3;
  build: string;
  // Identity of the ACTIVE catalog used for all future scheduling.
  contentIdentity: string;
  sessionId: string;
  revision: number;
  microfeeds: boolean;
  state: GameState;
  pendingDecision: PendingDecisionV3 | null;
  pendingResult: PendingResult | null;
  receipts: CommandReceipt[];
  journal: JournalEntry[];
  // 1:1 with state.history / journal.
  decisionProvenance: DecisionContentProvenance[];
  needsWorldAdvance: boolean;
}
```

The provenance array may instead be embedded into journal entries or another versioned structure. Required invariant: there is exactly one immutable provenance record per resolved historical decision.

## Event fingerprint

Use a deterministic collision-resistant fingerprint of the exact serialized event definition.

Recommended:

```text
SHA-256(JSON.stringify(eventDefinition))
```

using the same JSON semantics as the current catalog content identity.

A source content identity + event fingerprint pair identifies the semantic version that produced a decision even if the `eventId` string is reused later.

## Compatibility registry

Define a validation-only registry conceptually like:

```ts
interface LegacyContentSource {
  contentIdentity: string;
  engineBuild: string;
  sessionVersions: number[];
  events: readonly EventDefinition[];
}
```

Requirements:
- every source identity is explicit;
- event array is immutable/frozen evidence;
- source catalog hash must reproduce the registered content identity;
- lookup can validate event by ID + fingerprint;
- registry is never concatenated with active `EVENTS`;
- registry is never supplied to active `EventIndex`.

## Active scheduler isolation

Current `EventIndex` indexes exactly the `events` array passed to its constructor.

Keep the `GameSession` active index constructed from current canonical `EVENTS` only.

Legacy definitions must be passed only to compatibility validation/resolution helpers.

Required regression:
- collect all legacy-only IDs from compatibility source;
- prove none appears in `new EventIndex(activeEvents).events` or candidates;
- prove a migrated pending legacy decision can nevertheless be resolved from its stored definition.

## Migration entrypoint

Do not put wildcard logic into normal `resume()` identity checks.

Recommended conceptual separation:

```ts
GameSession.resume(snapshot, options)
GameSession.migrateAndResume(snapshot, migrationOptions)
```

or an internal equivalent where the normal path remains strict.

### Migration sequence

1. `validateData(rawSnapshot)` to reject dangerous/non-JSON structures before reading migration metadata.
2. Read envelope/session version/content identity.
3. If source identity equals current active identity, use normal strict current path.
4. Otherwise look up an explicit supported migration route/source catalog.
5. Validate the old snapshot against the **source catalog** semantics.
6. Migrate GameState schema if needed using existing supported schema migrators, without rewriting narrative truth.
7. Build `decisionProvenance` for every existing history/journal entry from the source catalog.
8. Validate and annotate any pending legacy decision with source identity + exact event fingerprint.
9. Apply only approved crosswalk equivalences (`same_scene_rewrite_and_id_migration`) to scheduler-state metadata such as canonical seen/cooldown/seed origin where explicitly specified.
10. Preserve non-equivalent legacy IDs, journal text and seed provenance.
11. Set session version to v3.
12. Set active `contentIdentity` to the current final catalog identity.
13. Run the compatibility-aware v3 validator.
14. Construct `GameSession` with active canonical `EventIndex` only.
15. Do not persist anything merely because resume/migration succeeded; preserve current read-only restore behavior until a normal command commits, unless product policy explicitly adds a separate user-approved migration write.

## Validation of completed history in v3

For each index `i`:
- `state.history[i]`, `journal[i]` and `decisionProvenance[i]` must all exist;
- provenance source identity must be either current or an explicitly supported legacy source;
- find the exact source event by `(sourceContentIdentity, history.eventId, eventFingerprint)`;
- find `choiceId` and `outcomeId` in that exact source definition;
- require choice→outcome linkage;
- require saved journal title/choiceLabel/messages to equal that source definition;
- never substitute current same-ID event semantics for a legacy provenance record.

This preserves the existing anti-tamper property while supporting mixed catalog history.

## Validation of pending decision in v3

For a pending scene:
- instance ID chronology rules remain unchanged;
- source identity must be current or registered legacy;
- fingerprint must equal the embedded `pendingDecision.event` definition;
- embedded definition must exactly equal the event registered under that source identity/fingerprint;
- pending choice set is therefore immutable/truthful;
- do not require the pending definition to equal the current active same-ID event when provenance is legacy;
- do not allow a legacy pending scene if `SEEN_<legacyId>` is already resolved unless repeatable, preserving current invariant.

## Resolution of a migrated pending legacy scene

Current resolver can resolve any supplied `EventDefinition`; it does not require the definition to be in `EventIndex`.

Therefore:
1. player chooses from the preserved pending definition;
2. resolver applies that exact legacy event/choice/outcome;
3. history receives truthful legacy IDs;
4. journal receives the same visible text already associated with the legacy definition;
5. append its existing legacy provenance record to resolved history (or move pending provenance into `decisionProvenance`);
6. apply an optional **reviewed compatibility post-resolution hook** only for approved same-scene equivalences;
7. after result/acknowledgement, future scheduling uses active canonical index only.

No scheduling draw is needed to reconstruct the old decision.

## Current-catalog decisions after migration

When `#advance` schedules a new canonical event:
- store full event as today;
- add pending provenance with current active `contentIdentity` and event fingerprint.

When `choose` resolves it:
- append provenance to the resolved-history provenance list atomically with history/journal;
- preserve current commit-before-publish behavior.

## Same-scene equivalence hook

Do not rewrite history merely to suppress a duplicate canonical scene.

For an explicitly reviewed same-scene mapping, a migration/equivalence record may perform narrowly defined scheduler-state transformations such as:
- set canonical `SEEN_<id>`;
- copy/translate event cooldown if required;
- migrate a seed `originEvent` only when origin identity is proven;
- record a compatibility marker for audit.

Each action must be enumerated by the reviewed crosswalk, not inferred from title/theme.

For `retire_technical_keep_history_only`, perform none of these canonical equivalence transformations by default.

## Receipt and revision integrity

Do not rewrite old command fingerprints merely because event IDs change in the active catalog.

Receipts currently bind:
- command type;
- expected revision;
- pending instance ID;
- choice ID.

Because preserved legacy pending/history keeps those facts truthful, existing receipts can remain unchanged.

Any v3 migration must prove:
- `receipts.length === revision` remains true;
- choose receipt sequence still matches history/journal order;
- duplicate command replay behavior remains identical.

## Pending result

A save can occur after choice resolution but before acknowledgement.

At that point:
- history and journal already contain the resolved legacy/canonical decision;
- provenance must already have been appended atomically;
- `pendingResult` must remain byte/JSON-equivalent through migration;
- acknowledgement then proceeds normally.

## Persistence atomicity

Migration/resume should remain read-only until normal commit semantics say otherwise.

If migration output is ever persisted eagerly in a future product flow, that operation needs the same compare/revision atomicity as command commits. Do not introduce a best-effort partial save.

## Retirement historical truth

Pre-T5.1 schema-8 saves may already contain `closed` retirement facts generated by legacy logic (including v7→v8 treatment of `EARLY_RETIRED_30_34`).

Do not reopen/replay those completed careers merely because future 04D fixes the FSM.

Compatibility principle:
- historical closed state remains historical truth;
- future still-playing migrated saves use repaired canonical terminal flow;
- epilogue must not be regenerated into a different ending solely to make old history resemble new canon.

## Required implementation tests

Use both existing migration matrices and add concrete v3 tests for:
- old completed technical ID no longer active;
- old completed exact-ID semantic collision;
- old pending technical event;
- old pending exact-ID semantic collision;
- mixed old/new history after one and many save/resume cycles;
- source identity/fingerprint tampering;
- legacy catalog absent from scheduler;
- same-scene equivalence scheduler suppression;
- non-equivalent legacy history does not suppress canonical scene;
- seed origin preserved vs explicitly migrated cases;
- pending-result migration;
- receipt replay/idempotency;
- zero RNG change during migration;
- unknown content identity failure;
- already-current v3 no-op resume;
- historical closed retirement fixture remains closed/truthful.

## Non-goals

- no migration between every internal task-branch content identity;
- no fuzzy event matching at runtime;
- no weakening of current anti-tamper validation;
- no scheduling of compatibility definitions;
- no silent conversion of legacy history into canonical history.

## Delivery

This design is intended to be implemented only when queue/dependencies authorize it. Current planning assigns final route registration and acceptance to 04E after the active canonical catalog is stable.
