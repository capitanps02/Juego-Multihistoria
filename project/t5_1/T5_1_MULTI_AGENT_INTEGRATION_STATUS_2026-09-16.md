# T5.1 / T5 — multi-agent integration status

Generated: 2026-09-16  
Coordinator branch: `chore/chatgpt-codex-workflow`  
Operational truth: GitHub code + exact-head CI.

## Current main baseline

Current inspected `main`: `4d547ea9c070d9879d812861ed0abb6493ff1d75`.

Integrated in `main`:
- QA T5 PR #11;
- pre-T5.1 content freeze PR #16;
- T5.2 seed-lifecycle infrastructure PR #8 via `14e55bb...`;
- roadmap/tracking sync via `4d547ea...`.

Frozen pre-T5.1 identity:
`2e07efd2ea99c4e9ec4c2b20ae89664204f76db2c55a72d567208799c01bccff`

Frozen catalog: 388 events = 254 principal + 134 conditional.
The freeze captures old content exactly; it does not make new semantics backward-compatible.

## Nine-agent/workstream integration matrix

| Workstream | PR / branch | Fresh observed HEAD | Exact-head state | Integration disposition |
|---|---|---|---|---|
| Coordinator/integrator | `main` + workflow | `main@4d547ea...` | authoritative baseline | Owns ordering, migration truth and final review. No auto-merge. |
| QA independent | PR #11 | merged | integrated | T5 gates must survive every later integration. |
| Seed lifecycle T5.2 base | PR #8 | merged as `14e55bb...` | integrated | Baseline lifecycle infrastructure is now part of main. |
| Seed lifecycle hardening/handoff | PR #19 `t5/seed-lifecycle` | `1de78857331b264e0095e24b082f18e8110765b6` | Repository Integrity **SUCCESS** | Correctly clears ghost `HAS_SEED_*` flags and assigns 210/210 seeds exactly once to canonical owners. Integrate before final T5.3 composition when explicitly authorized. |
| NPC memory/knowledge T5.3 | PR #9 `t5/npc-memory` | `44a0739fb5b95c056e44e75a14b44973d3aa2ac5` | Repository Integrity **SUCCESS** with T5.2 base combined | Resolver composition is coherent: seeds/effects → history → explicit NPC knowledge, no extra RNG. Must re-ground after #19 so ghost-flag hardening is preserved. |
| Canon 18–23 audit | PR #10 | `94ef8ac8b864248b1346a16a69adbcf1260143a1` | draft/audit-only | Useful; now consumes conditional source. Documents real architecture gaps: per-choice eligibility and OR gates. Do not treat audit as runtime closure. |
| Canon 23–30 audit | PR #12 | `afe00196ee05417101087c79cc99ba71a3f8a463` | mergeable/audit-only | Useful but description still contains stale conditional-source wording. No runtime mutation. |
| Canon 30–34 | PR #13 | `008054a4a664d4509be6813c7c93d07e1c7e8c2f` | draft | Corrected to 0 strict verified-same-identity. Must consume central 26/26 05D conditional review; comment posted. Migration still blocks active catalog integration. |
| Canon 34+/retirement | PR #15 | `ef521106ebe2bc71886ec543476b9b7b900f8f4d` | **CHANGES REQUIRED** | Functional liveness/no-market/epilogue fixes are useful. Three claimed aliases conflict with exact-ID completion/migration truth; review comment posted. Retirement reversal also remains canonically unresolved. |
| Presentation/web/Android | PR #14 | `9973c5a0df2d91246e06c324b353e3e6cbcc4e4c` | draft; Android candidate PASS, Repository Integrity blocked by #22 | Presentation boundary is sound. Save baseline fix is isolated in PR #23; public known-contact contract still depends on T5.3. T3.4 remains open until physical-device evidence. |

Additional integration-support PR:
- PR #23 `fix/save-v8-baseline`: targeted issue #22 correction. Changes only migration-baseline provenance/hash and makes `scripts/test-saves.mjs` part of normal `npm test`. Repository Integrity on its exact HEAD is the acceptance gate.

## T5.1 crosswalk progress

Legacy runtime-only IDs: **174**.

Current unique reviewed final dispositions:
- principal: **87/87**;
- conditional: **86/87**;
- global: **173/174**;
- approved same-scene migrations/aliases: **0**.

All 87 principal extras are `retire_technical_keep_history_only`.

Sole unresolved crosswalk item:
- `CEVT_RET_RECONSIDER` / canonical post-announcement retirement reversal.

This is now the only semantic crosswalk decision; runtime implementation is still much larger because canonical replacements must actually be written and migrated safely.

## High-risk overlaps

### PR #19 ↔ PR #9 — `src/narrative/resolver.ts`

#19 adds authoritative synchronization of known seed presence flags:
`SEED_DEFINITIONS.keys() ∪ saved seed IDs`.

#9 adds explicit NPC knowledge acquisition after resolution.

Required final resolver composition:
1. resolve once using narrative RNG;
2. apply choice/outcome effects;
3. apply seed transitions/lifecycle;
4. update club transaction coherently;
5. expire/synchronize seeds, including known IDs absent from save;
6. append immutable history;
7. grant explicit outcome-specific NPC knowledge, preserving the club where the fact occurred;
8. no extra RNG for knowledge/read/lifecycle maintenance;
9. retry idempotency remains a GameSession command-receipt responsibility.

After #19 is integrated, #9 must re-ground and pass T5.2 + T5.3 + save + T5 QA together.

### Canon branches ↔ frozen `contentIdentity`

Any active event-definition change must:
- create/acknowledge a new content identity;
- preserve old completed history as old truth;
- preserve pending legacy choices through compatible old definitions or fail explicitly;
- never create canonical `SEEN_*` from title/theme similarity;
- preserve seed state without replaying effects/RNG;
- pass save/resume and deterministic replay.

Final T5.1 active identity remains exact canonical IDs: 254 principal + 134 conditional, zero active runtime-only IDs.

### PR #15 aliases

Central review rejects migration identity for:
- `EVT_RET_HOME_001 -> EVT_RET_FAM_001`;
- `EVT_RET_LAST_001 -> EVT_RET_LASTMATCH_001`;
- `EVT_38_MKT_001 -> EVT_38_MARKET_001`.

Reason: their baseline choice/fact contracts differ materially from canonical scenes. Repaired future behavior must live under canonical IDs; old IDs belong only to compatibility/history.

### Retirement reconsideration

Canonical product FSM remains:
`playing -> decided -> announced -> closed`.

`closed` is terminal. Public announcement is immutable history.

Canonical conditional sources nevertheless require a playable post-announcement reconsideration. Option E remains strongest source-fit but requires explicit Pedro approval:
- remain `announced`;
- allow a bounded exceptional extension/offer while announced;
- preserve original announcement;
- no ordinary long-horizon career reopening;
- close later through canonical closure;
- never `announced -> playing` or `closed -> playing` silently.

## Save QA / presentation blocker

Issue #22 proved the imported schema-v8 expected hash was stale relative to the supplied fixture; schema 8 is validated/returned without a migration step.

PR #23:
- updates only the v8 expected hash/provenance;
- adds `scripts/test-saves.mjs` to `npm test`;
- relies on existing assertions for history, seeds, all existing RNG streams and serialize/load round-trip.

If PR #23 CI is green and it is later integrated, PR #14 must re-ground and rerun Repository Integrity + Android candidate.

## Integration order — current safest sequence

1. Keep current `main@4d547ea...` as authority until explicit merge instruction.
2. Review/accept PR #23 if its exact-head CI is green; it closes the save-QA hole without runtime changes.
3. Review/accept PR #19 seed hardening/handoff.
4. Re-ground PR #9 on the resulting main; rerun T5.2 + T5.3 + save + QA as one combined gate.
5. Re-ground PR #14 after save fix and T5.3 public-contact contract; rerun web/PlayCanvas/Android gates. Physical device still required for T3.4.
6. Audit-only #10/#12 may integrate only when descriptions/artifacts are current and exact-head CI is green; they must not claim runtime completion.
7. #13/#15 functional content remains blocked on exact canonical identity + session/content migration and central semantic evidence.
8. Execute canonical implementation queue only on explicit `ejecuta Codex`; first READY item remains authoritative from `project/CODEX_QUEUE.md` after reread.

## Red lines

- No automatic merge.
- A green run from an old HEAD is not evidence for a newer HEAD.
- No blind resolver/package merge.
- No `verified` before full semantic verification.
- No title/concept alias.
- No silent pending-scene substitution.
- No weakened content identity.
- No retirement rollback inferred from current runtime.
- No fake save migration or baseline update without a test that independently validates it.

## Current integration health

Progress is materially better than the earlier snapshot:
- QA, freeze and T5.2 base are integrated;
- T5.2/T5.3 composition has already demonstrated a green combined branch;
- the remaining T5.2 hardening is small and isolated;
- principal legacy semantic ambiguity is completely eliminated (87/87);
- save-QA gap has a focused PR;
- remaining semantic crosswalk blocker is exactly one retirement-reconsideration decision.

The critical path is now: **save QA → T5.2 hardening → T5.3 final composition → session/content migration → ordered canonical content replacement**, while presentation continues independently and retirement reversal awaits explicit canon approval.
