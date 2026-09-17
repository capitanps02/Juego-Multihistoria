# Codex prompt — retirement / last match / epilogues

Work on repository `capitanps02/Juego-Multihistoria`.

Base: inspect the real latest `main` first.  
Recommended branch: `t5/retirement-epilogues` (continue PR #118; do not work directly on main).  
Never auto-merge.

## Mission

Maintain and integrate only the terminal retirement/epilogue layer. Ordinary active 34+ veteran career is owned by PR #15 / `t51/canon-34plus` and must remain active until an explicit terminal process begins.

Current terminal machine:

`playing -> decided -> announced -> closed`

Only explicit pre-announcement reconsideration may do `decided -> playing`. `announced -> playing` and `closed -> playing` are forbidden in normal gameplay.

## Current implementation status

Read `implementation-ready.json` before changing code.

The eight previously prepared lots are now **implemented and regression-covered**:

- `CODEX-RET-001` contemplation without automatic retirement;
- `CODEX-RET-002` explicit pre-announcement reconsideration;
- `CODEX-RET-003` public-announcement NPC knowledge through live authority targets;
- `CODEX-RET-004` final-phase narrative without fabricated sporting facts;
- `CODEX-RET-006` idempotent `closeCareer` integration;
- `CODEX-RET-008` factual `CareerSummary`;
- `CODEX-RET-009` deterministic evidence-gated epilogue prose;
- `CODEX-RET-010` legacy/save compatibility regressions.

Do **not** duplicate or redesign those tasks merely because they were formerly marked ready.

There are currently **0 ready tasks and 3 blocked tasks**:

- `CODEX-RET-005` — full persisted `LastMatchFact`;
- `CODEX-RET-007` — fixture/season-end-aware closure boundary;
- `CODEX-RET-011` — terminal contentIdentity freeze + adjacent migration edge.

Only resume one of those blocked tasks after its explicit unblock contract in `implementation-ready.json` exists on the real integration base.

## Mandatory invariants

- age does not retire the player;
- contract expiry does not retire the player;
- zero offers do not retire the player;
- injury does not retire the player;
- retirement requires explicit terminal intent;
- announcement is distinct from career closure;
- announced player can still train/play/be injured/bench/not play;
- no retirement event creates a fixture, appearance, minutes, goal, assist, result or victory;
- no retirement code fabricates a formal offer, destination, salary, duration or promised role;
- closing career consumes 0 RNG;
- epilogue selection/render is deterministic for the same save;
- `closeCareer` remains idempotent;
- closed saves remain terminal after load;
- active legacy saves must not be retired on migration;
- pending legacy decisions use frozen definition/fingerprint semantics;
- do not rewrite history or seed origin;
- do not freeze global contentIdentity or register a shortcut migration.

## Sporting authority boundary

The read-only authority lives in `src/simulation/sport-context.ts`.

Use:

- `getSportContext(state).careerAppearances` as the known cumulative appearance aggregate;
- `getSportContext(state).availability` to distinguish known facts from unavailable facts;
- `getCurrentMatchContext(state)` for current-match facts. At the present contract it returns `status="no_authoritative_match_model"` and null match details.

Current unavailable facts include fixture identity, opponent, competition/current match, squad call, starter/bench, exact minutes, result, goals and assists. Therefore:

- a post-announcement increase in `careerAppearances` may prove that at least one later appearance occurred;
- it does **not** identify which fixture was the last appearance;
- `retirementLastAppearanceDate` in the current bridge is an observation/week date, not an authoritative fixture timestamp;
- leave unsupported `LastMatchFact` fields null/omitted;
- never infer match facts from role, form, age, season day, month, reputation, narrative flags or a football-moment receipt;
- `football-moments` is evidence for isolated moments and is not a substitute for persisted match history.

When authoritative fixture/match history lands, consume it here; do not reimplement the sport simulator.

## NPC knowledge boundary

Public retirement announcement is already integrated with the T5.3 live knowledge authority.

`EVT_RET_ANNOUNCE_001` public choices are choice+outcome scoped and target only the authoritative live slots:

- `captain`;
- `star`;
- `activeAgent`;
- `currentClubInstitutional`.

Those slots are resolved by `src/narrative/npc-knowledge-targets.ts`. Unresolved slots fail closed and create no recipient. `WAIT` has no knowledge rule and must remain private. Do not edit historical/frozen T5.3 backfill to make current retirement intent retroactively known.

Any future recipient class must first be added to the typed `NpcKnowledgeTargetSlot` authority, its resolver, and the dynamic-target fail-closed ratchet.

## Contract / market authority boundary

Runtime authority lives in `src/simulation/offers.ts`. Consume it; do not replace it.

Use:

- `getActiveCareerOffers(state)` for persisted formal-offer truth;
- `careerOfferKind(offer)` when offer semantics matter;
- `contractEmploymentStatus(state)` for conservative employment status;
- `respondToOffer(...)` / `offerBridge` when a terminal scene actually responds to a real pending offer.

Hard rules:

- `marketHeat`, scouting, seeds, veteran-demand scores and boolean flags are **not** formal offers;
- `VETERAN_OFFER_AVAILABLE` may mirror a real persisted `CareerOffer`; it must never be generated independently;
- do not synthesize `veteranOfferSalary`, `veteranOfferMonths`, destination or squad-role promises;
- `contract.monthsRemaining <= 0` currently means `expired_pending_resolution`, not authoritative free agency;
- zero formal offers may open a retirement reflection scene but cannot close the career;
- a post-announcement-offer scene requires a real `CareerOffer`; do not roll one from `marketHeat` or RNG;
- the current market authority normally blocks new offer materialization once retirement is not `playing`; if post-announcement offer generation is desired, that is a market-owner contract change, not a retirement workaround.

## 34+ boundary

Read PR #15 / `t51/canon-34plus` before any terminal catalog or lineage change. Its reconciliation is not equivalent to completed ordinary 34+ gameplay; a substantial canonical-content backlog remains.

Terminal content must not register its final lineage edge until the immediately preceding active 34+ generation is integrated and frozen by coordination.

## Seeds

Read `TERMINAL_SEEDS.md`. Current T5.2 supports explicit owner-backed closure classifications; it does not authorize inferred closure. Do not mass-close seeds. Do not turn retirement-named seeds into a second retirement state machine. Wire only evidence-backed producers/consumers owned by the appropriate content workstream.

## Saves and migration

Read `SAVE_COMPATIBILITY.md`. Preserve active/decided/announced/closed states. Do not reinterpret same-ID changed events without provenance. The final terminal contentIdentity edge is blocked until complete active 34+ is frozen.

## Tests

At minimum run/build the dedicated retirement suite:

`node --test scripts/test-t536-t537-retirement.mjs scripts/test-t536-career-summary.mjs scripts/test-t536-market-authority.mjs scripts/test-t536-sport-authority.mjs scripts/test-t536-npc-announcement.mjs scripts/test-t537-family-minimums.mjs scripts/test-t536-status-writer-inventory.mjs scripts/test-t537-epilogue-profiles.mjs`

For any NPC announcement change, also preserve the T5.3 dynamic-target/audit contracts; Repository Integrity already exercises them.

Run the repository save/determinism/integrity gates available on the current head. Do not weaken a failing lineage/freeze sentinel; report it as the expected blocker only after build and ordinary authority tests are green.

Before handing off, report exact HEAD, ahead/behind, changed EVENTS/shared authority files, schema/RNG/contentIdentity/migration changes, exact tests, blockers and counts for implemented/ready/blocked Codex tasks.
