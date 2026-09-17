# Codex prompt — retirement / last match / epilogues

Work on repository `capitanps02/Juego-Multihistoria`.

Owner branch: `t5/retirement-epilogues` (PR #118). Never work directly on `main`; never auto-merge. Always inspect the real latest `main` and the branch HEAD before changing code.

## Mission and boundary

Own only the terminal retirement / last-match / epilogue layer. Ordinary active 34+ career belongs to PR #15 / `t51/canon-34plus` and must remain playable until explicit terminal intent exists.

State machine:

`playing -> decided -> announced -> closed`

Only explicit pre-announcement reconsideration may do `decided -> playing`. Ordinary `announced -> playing`, `closed -> playing`, `playing -> announced` and `playing -> closed` are forbidden.

The narrow `EARLY_RETIRED_30_34` compatibility bridge is intentional: `EVT_33_RET_001` choice A semantically contains decision + announcement + end-of-season closure intent but currently persists that legacy flag plus `world.retirementReason="voluntary_30_34"`. Do not broaden the bridge. Remove it only after the 30–34 owner persists explicit terminal phases and supplies migration evidence.

## Current Codex status

`analysis/CODEX/retirement/implementation-ready.json` is authoritative.

Current count: **9 implemented / 0 ready / 2 blocked**.

Implemented:
- `CODEX-RET-001` contemplation without automatic retirement;
- `CODEX-RET-002` explicit pre-announcement reconsideration;
- `CODEX-RET-003` public-announcement NPC knowledge through live authority targets;
- `CODEX-RET-004` final-phase narrative without fabricated sporting facts;
- `CODEX-RET-006` idempotent `closeCareer` integration;
- `CODEX-RET-007` fixture/season-aware closure gate with fail-closed compatibility fallback;
- `CODEX-RET-008` factual `CareerSummary`;
- `CODEX-RET-009` deterministic evidence-gated epilogue prose;
- `CODEX-RET-010` legacy/save compatibility regressions.

Blocked only:
- `CODEX-RET-005` — complete persisted factual `LastMatchFact`;
- `CODEX-RET-011` — final terminal `contentIdentity` freeze + adjacent migration edge.

Do not duplicate implemented lots.

## RET-007 authority contract

RET-007 is already implemented in PR #118.

When `getSportContext(state).availability.remainingOfficialMatches === "known"`:
- `remainingOfficialMatches > 0` blocks terminal closure;
- `remainingOfficialMatches === 0` permits the announced career to close through the normal state machine.

When that authority is unavailable, the previous administrative timeout remains only as a compatibility fallback. Do not replace this with age/month/form proxies.

## RET-005 blocker

Retirement currently knows cumulative appearances through `getSportContext(state).careerAppearances`. A post-announcement increase proves only that at least one later appearance occurred. It does not identify the actual final fixture.

`world.retirementLastAppearanceDate` is currently the observation/week date, not an authoritative fixture timestamp.

PR #156 / `t5/authoritative-match-model` is the upstream producer candidate. Its latest inspected Repository Integrity run was cancelled while the long determinism gate was still running, so it is **not yet a certified integration base**. Even when it lands, RET-005 still needs a public/factual query for the player's last actual appearance, not merely `previousOfficialMatch()` if that fixture was a non-appearance. Preserve null/omitted opponent, competition, minutes, result, goals and assists until authority exists.

Never infer match facts from role, form, age, season day, narrative flags or football-moment receipts.

## Market authority

Consume `src/simulation/offers.ts`:
- `getActiveCareerOffers(state)`;
- `careerOfferKind(offer)`;
- `contractEmploymentStatus(state)`;
- `respondToOffer(...)` / `offerBridge`.

No retirement code may fabricate an offer, destination, salary, duration or promised role. Zero offers may open reflection, never retire automatically. Contract expiry is not free agency unless the market authority says so.

## NPC knowledge authority

Public retirement announcement is already integrated with T5.3 live targets in `src/narrative/npc-knowledge-targets.ts`:
- `captain`;
- `star`;
- `activeAgent`;
- `currentClubInstitutional`.

Unresolved slots fail closed. `WAIT` remains private. Do not retrofit current knowledge into historical NPC memory.

## RET-011 blocker: lineage

The multi-hop migration engine already exists in `main`; RET-011 is not blocked by missing graph infrastructure.

The blocker is generation ordering. Never freeze the current terminal identity or register a shortcut edge before the immediately preceding active 34+ generation is integrated and frozen.

Required lineage:

`... -> 30–34 -> active ordinary 34+ -> retirement/epilogue`

No `PRE -> retirement` shortcut.

Read PR #15 / `t51/canon-34plus` before any lineage change. The seed catalog work in PR #191 is separately certified but does not substitute for completed ordinary 34+ content.

## Mandatory invariants

- age, injury, contract expiry and zero offers never auto-retire;
- explicit terminal intent is required;
- announcement is distinct from closure;
- announced players may still train/play/be injured/benched/not play;
- retirement never creates fixtures, appearances, minutes, goals, assists, results or victories;
- closure consumes 0 RNG and is idempotent;
- epilogue selection/render is deterministic for the same save;
- closed saves remain terminal after load;
- active legacy saves must not become retired merely by migration;
- pending legacy choices retain frozen definition/fingerprint semantics;
- do not rewrite history or seed origin;
- do not weaken freeze/lineage sentinels.

## Minimum validation

Build and run the dedicated terminal suite:

`node --test scripts/test-t536-t537-retirement.mjs scripts/test-t536-career-summary.mjs scripts/test-t536-market-authority.mjs scripts/test-t536-sport-authority.mjs scripts/test-t536-npc-announcement.mjs scripts/test-t537-family-minimums.mjs scripts/test-t536-status-writer-inventory.mjs scripts/test-t537-epilogue-profiles.mjs`

Also run the repository save/determinism/integrity gates available on the exact HEAD. A failure before the expected content freeze/lineage sentinel is a real regression. Do not call a HEAD green until its own runs finish.

Before handoff report exact HEAD, main base, ahead/behind, changed runtime/shared-authority files, schema/RNG/contentIdentity/migration changes, exact tests, and the 9/0/2 implemented/ready/blocked count.