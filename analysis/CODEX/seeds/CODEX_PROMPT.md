# CODEX PROMPT — T5.2 causal seed consumers

Work in repository `capitanps02/Juego-Multihistoria`. Base for this handoff: `c2a0b3ab9f63ac335d334846ee730fa7c6d1e6b6`. Create a fresh implementation branch from the current main or rebase safely; never develop on main and never auto-merge.

The architecture is already resolved:

- `src/narrative/seed-memory.ts`: exact, read-only, scope-aware SeedInstance projections;
- `narrativeConditionRoot`: exposes exact live payload scalars under `facts.*`;
- `src/narrative/resolver.ts`: gates, eligibility, outcome conditions and modifiers share the causal root;
- live and historical direct consumers are separate registries; historical IDs fail closed against the catalog;
- projections/audits consume 0 RNG and do not mutate saves/history.

Implement these ready tasks in order:

1. **CODEX-SEED-001 / CEVT_18_BRUNO_01** — seeds: SEED_BRUNO_FAVOR. APIs: getBrunoFavorState, facts.brunoFavorStance.
2. **CODEX-SEED-002 / CEVT_18_CCH_01** — seeds: SEED_COACH_PUBLIC, SEED_MENA_EARLY_READ. APIs: getCoachPublicMemory, getMenaEarlyRead, facts.coachPublicStance, facts.menaEarlyRead, facts.menaEarlyContext.
3. **CODEX-SEED-003 / CEVT_18_RELEG_01** — seeds: SEED_EXIT_STYLE_UDV. APIs: getExitStyleMemory, facts.exitStyleJanuary, facts.exitStyleEnd, facts.exitStyleSummer, facts.exitStyleMarket18, facts.exitStyleYear19.
4. **CODEX-SEED-004 / CEVT_19_INJ_01** — seeds: SEED_BODY_PRECEDENT, SEED_PHYSIO_CONFIDENCE. APIs: getBodyPrecedent, getPhysioConfidenceMemory, facts.bodyPrecedentPattern, facts.bodyPrecedentEarly, facts.bodyPrecedentReturn19, facts.physioConfidencePattern, facts.physioConfidenceReturn19.
5. **CODEX-SEED-005 / CEVT_19_RETURN_01** — seeds: SEED_EXIT_STYLE_UDV. APIs: getExitStyleMemory, projectSeedMemory.

For each task, read its full contract in `analysis/CODEX/seeds/implementation-ready.json`. Do not infer seed meaning from ID or `HAS_SEED_*`; inspect exact payload semantics in `SEED_CONSUMER_MATRIX.json`.

Hard prohibitions: no schema changes, no global RNG changes, no scheduler changes, no contentIdentity changes unless EVENTS truly change and the owner migration process explicitly authorizes it, no originEvent/history rewrite, no NPC omniscience, no CareerOffer changes, no fake consumers for green audits.

Testing order: directed unit/integration tests first, then save/load/migration gates, then Repository Integrity. Do not substitute bulk simulations for unit tests. Same state + same RNG must produce the same result.

Ownership: these five scene edits belong to `t51/canon-18-23`; T5.2 owns only the shared causal infrastructure. Do not implement rows marked blocked in the matrix without owner evidence.
