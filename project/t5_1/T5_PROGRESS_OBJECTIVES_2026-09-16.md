# T5 — objective-based progress model

Generated: 2026-09-16

This document is a coordinator readiness metric, not the official roadmap earned percentage. Official roadmap weight remains earned only when a T5 subpass satisfies its full acceptance criteria and is integrated with exact-head validation.

## Current estimate

- T5 implementation/readiness progress: **30%**
- Remaining T5 implementation/integration: **70%**
- Official T5 earned progress in the roadmap: **0% of T5's 33-point product weight** until a T5 subpass closes under its acceptance gate.

The readiness estimate includes completed audits/specification only in proportion to how much implementation risk they actually remove. Audit-only work never counts as runtime-complete.

## Objective weights

| Objective | Weight inside T5 | Current readiness | Weighted contribution | Closure gate |
|---|---:|---:|---:|---|
| O1. Canonical identity + session/content migration foundation | 12% | 70% | 8.4 | 174/174 legacy dispositions reviewed; supported old content identities migrate/reject explicitly; pending legacy contract preserved; exact-ID collisions provenance-aware; no RNG/scheduling during migration; final migration tests green. |
| O2. Canonical seed lifecycle | 10% | 50% | 5.0 | 210/210 seeds have evidence-backed producer + consumer/terminal, intentional persistence, scoped expiry, or compatible retirement/deprecation; no ghost `HAS_SEED_*`; T5.2 gates green on integrated main. |
| O3. NPC knowledge, memory and relationships | 8% | 60% | 4.8 | 20 NPC persist knowledge/forgetting/relationships with explicit causal acquisition, malformed persisted knowledge rejected, public view does not leak internals, T5.2+T5.3 combined gates green. |
| O4. Deferred consequences across ages/clubs | 8% | 25% | 2.0 | Promises, injuries/surgery, contracts, relationships and seeds survive or close correctly across age, season and club changes; deterministic save/resume evidence. |
| O5. Canonical runtime 20–23 | 10% | 15% | 1.5 | T5.5–T5.9 scenes implemented specifically, canonical IDs exact, legacy scheduler entries retired compatibly, seeds/NPC/migration tests green. |
| O6. Canonical runtime 23–26 | 10% | 20% | 2.0 | T5.10–T5.14 implemented and causally wired, including exact-ID semantic collisions handled by content provenance. |
| O7. Canonical runtime 26–30 | 12% | 15% | 1.8 | T5.15–T5.21 implemented, seed chronology preserved, no historical origin rewrites, full directed tests green. |
| O8. Canonical runtime 30–34 | 12% | 10% | 1.2 | T5.22–T5.28 implemented from canonical scenes, 26 conditionals replaced/certified, age-34 bridge/deadline continuity proven. |
| O9. Canonical runtime 34+ | 8% | 10% | 0.8 | T5.29–T5.35 implemented with exact canonical identities; no legacy aliases used as substitutes; late-career facts are causal. |
| O10. Retirement + epilogues | 6% | 30% | 1.8 | Monotonic terminal authority preserved unless explicitly amended; reconsideration behavior explicitly approved; last-match facts not manufactured; 20 epilogue families factual/compatible. |
| O11. Full T5 integration audit | 4% | 20% | 0.8 | 388 canonical scenes audited on active catalog, 210 seeds classified, 20 NPC traceable, migration/save/RNG/determinism/long-career/retirement gates all green on one consolidated main. |
| **Total** | **100%** |  | **30.1% ≈ 30%** | |

## Milestone targets

- **35% target — foundation stable:** fix current T5.2 red head, recreate content-migration workstream correctly, re-ground T5.3 on consolidated main, and obtain combined green infrastructure gates.
- **45% target — migration + NPC foundation integrated:** supported content/session migration implemented and validated; T5.3 integrated; presentation consumes a safe public contacts contract.
- **60% target — canonical career through age 30:** T5.5–T5.21 implemented in ordered batches with seed/NPC/migration continuity.
- **75% target — canonical 30–34 complete:** T5.22–T5.28 integrated and full mid/late-career causal chains green.
- **90% target — 34+, retirement and epilogues:** T5.29–T5.37 integrated with explicit retirement-reversal rule and factual closure.
- **100% target — T5 final gate:** T5.38 proves the consolidated product: exact active canonical inventory, migration compatibility, seed lifecycle, NPC epistemics, deferred consequences, deterministic saves/RNG and long-career closure.

## Current hard blockers

1. Content/session migration workstream must be recreated: PR #25 closed empty and did not implement runtime migration.
2. PR #19 T5.2 current head is red; do not integrate until the exact failing validation is isolated and fixed without weakening save tests.
3. PR #9 T5.3 is behind/diverged and must be re-grounded after T5.2 hardening; malformed persisted knowledge/public contacts remain integration concerns.
4. Active canonical catalog changes in #13/#15 and future T5.5–T5.35 remain blocked until supported content migration exists.
5. Future canonical `CEVT_38_RETIREMENT_REVERSAL` behavior still requires explicit product decision; legacy `CEVT_RET_RECONSIDER` is already closed as history-only and is not an alias.

## Counting rules

- A green older HEAD does not count for a newer HEAD.
- Audit/specification reduces readiness only; it does not close runtime objectives.
- A PR does not count as integrated until its exact reviewed head is in `main` and consolidated gates remain green.
- No percentage is gained by weakening tests, regenerating the legacy freeze, or silently mapping legacy history to canonical scenes.
- The readiness percentage is recalculated when an objective crosses a meaningful verified gate, not after every commit.
