# T5.1 / T5 — multi-agent integration status

Generated: 2026-09-16
Coordinator branch: `chore/chatgpt-codex-workflow`
Operational truth: GitHub code + exact-head CI.

## Current main baseline

Current inspected `main`: `901170c85322d324b19781913cb3705757676f41`.

Already integrated by the main/coordinator workstream:
- QA T5 PR #11 (`3079a311...`), no production/canonical content mutation;
- pre-T5.1 content freeze PR #16 (`977310444...`);
- coordination refresh (`901170c...`).

Frozen legacy identity:
`2e07efd2ea99c4e9ec4c2b20ae89664204f76db2c55a72d567208799c01bccff`

Frozen catalog: 388 events = 254 principal + 134 conditional.
The freeze closes capture of the old catalog; it does **not** close migration/session compatibility.

## Nine-agent/workstream integration matrix

| Workstream | PR / branch | Fresh observed HEAD | Exact-head state | Integration disposition |
|---|---|---|---|---|
| Coordinator/integrator | `main` + workflow | `main@901170c...` | authoritative baseline | Owns ordering, migration contract and final integration review. No auto-merge. |
| QA independent | PR #11 | merged | integrated | Keep its T5 gates in every later branch. |
| Seed lifecycle T5.2 | PR #8 `t5/seed-lifecycle` | `5bfd25269e4e95328846addc8269b9418e9d4ce3` | Repository integrity **SUCCESS** on exact HEAD | Closest functional candidate. Final resolver no longer has forbidden event+choice+date global dedupe. Review finite-age seed semantics; then combine consciously with T5.3. |
| NPC memory/knowledge T5.3 | PR #9 `t5/npc-memory` | `e3afa13c68575bc22e082960265c56dee0d63ba1` | Repository integrity **SUCCESS** on exact HEAD after epistemic fixes | Architecture deny-by-default is acceptable. Must integrate with T5.2 resolver, not overwrite it. Unreferenced NPCs remain documented content debt, not an omniscience excuse. |
| Canon 18–23 audit | PR #10 `t51/canon-18-23` | `314e1e4042e8cc9acfd2ca83a6ccaf39c9dbe392` | audit-only; exact final CI still required before integration | Useful evidence. Update stale claims: freeze exists; authoritative conditional source/review exists. Must remain audit-only. |
| Canon 23–30 audit | PR #12 `t51/canon-23-30` | `dc409c18f93f3dc73bec4021ad4e5db7b3729378` | audit-only; based on current main | Useful evidence. Must consume central conditional evidence and respect PR #7/#5/02C/02D ownership. No runtime mutation. |
| Canon 30–34 | PR #13 `t51/canon-30-34` | `435a55ce0b40f6d482538695735a9e62b50e93b7` | branch changed after review; re-check exact CI required | Agent corrected premature `verified` claims to 0 strict same-identity. Still stale on conditional-source availability and must re-ground central 26/26 conditional review before closure. Functional catalog changes require migration policy. |
| Canon 34+/retirement | PR #15 `t51/canon-34plus` | `16d402cd30d94ae8782c515f0aa5cb7556c8cc21` | **BLOCKED** | Do not integrate while alias/history semantics and retirement reversal differ from central contract. `closed` remains irreversible; announced history cannot be erased. Migration required for active content changes. |
| Presentation/web/Android | PR #14 `presentation/android-playcanvas` | `1f80ecc199ae143412931cbc659289358f35ef6c` | current base main; exact-head platform CI must be checked | Narrative-independent direction is good. Must preserve public-view boundary, QA gates, offline/IndexedDB and T3.4 physical-device requirement. |
| Canonical implementation queue | PR #3/#7/#5 + 02C onward | task branches / workflow prompts | planning ownership only until regrounded | #3 remains first queue item when Codex is explicitly requested; #7 before #5. All must re-ground on current integrated base immediately before implementation/review. |

## High-risk overlaps

### PR #8 ↔ PR #9 — `src/narrative/resolver.ts`

Both are valid subsystems and both touch resolver/package scripts. A blind merge is prohibited.

Required combined transaction order:
1. one narrative resolution using existing narrative RNG;
2. apply choice/outcome effects;
3. apply seed lifecycle transitions;
4. append immutable history;
5. grant NPC knowledge from explicit rules for the resolved choice/outcome;
6. no extra RNG for reads/knowledge/lifecycle maintenance;
7. idempotent user retry is handled by `GameSession` command receipts/revision, not event+choice+date global suppression.

After combining, run both T5.2 and T5.3 suites plus the integrated T5 QA gates.

### Canon branches ↔ frozen `contentIdentity`

Any active event definition change after the frozen baseline must:
- acknowledge new content identity;
- preserve old completed history as old truth;
- preserve pending legacy choice contracts or fail resume explicitly;
- never create canonical `SEEN_*` from title/theme similarity;
- preserve active seeds without replaying effects/RNG;
- pass save/resume + deterministic replay evidence.

### 34+ retirement

No workstream may infer approval for `announced -> playing` or `closed -> playing`.
The central retirement-reversal decision remains open. The strongest planning option is a post-announcement extension that retains the public announcement as historical fact and delays `closed`, but this is not approved canon until explicitly decided.

## Integration order — current safest sequence

1. Keep QA + freeze already integrated as the base.
2. Stabilize/review PR #8 T5.2 against current main.
3. Rebase/combine PR #9 T5.3 on the accepted T5.2 resolver and rerun T5.2 + T5.3 + QA together.
4. Integrate audit-only #10/#12 only after stale source/freeze statements are corrected and exact-head CI is green; they must not compete with runtime ownership.
5. Integrate presentation #14 independently only after exact-head web/PlayCanvas/Android gates and diff cleanup.
6. Do not integrate #13/#15 functional content until session/content migration is implemented/proven and their canonical findings are aligned with central T5.1 evidence.
7. Continue canonical runtime batches in ordered ownership chain (#3 -> #7 -> #5 -> 02C ...), each regrounded on the then-current integrated main.

## Current red lines

- No automatic merge.
- A green CI from an older HEAD is not evidence for a newer HEAD.
- No branch may overwrite another workstream's `resolver.ts`/`package.json` responsibilities.
- No `verified` label before full semantic verification.
- No alias based on title or concept.
- No silent pending-scene substitution.
- No weakened content identity.
- No retirement reversal by implementation inference.

## Status

The repository is progressing concurrently, but concurrency increases integration risk. Current integration health is manageable because QA and the legacy-content freeze are now in `main`; the remaining critical path is conscious composition of T5.2 + T5.3 followed by session/content migration before broad T5.1 catalog rewrites.