# T5 regression matrix

| Área | Invariante | Test/Gate | Estado | Owner |
|---|---|---|---|---|
| seeds | lifecycle único + referencias/catálogos cerrados | `qa:t5:content`, T5.2 direct-read audit | covered; #131 resolved | T5.2/tooling |
| NPC | world fact != NPC knowledge; provenance histórica estable | `test:t53`, `qa:t5:integration` | covered; #92 resolved | T5.3 |
| market | offer IDs únicos; action/accept coherent | `qa:t5:fast` + market authority tests | covered; exact eligible CareerOffer facts integrated | market |
| contracts | meses/salario no negativos; expiry no zombie | `scripts/test-t5-contract-expiry-known-bug.mjs` | **failing/open T5-QA-028; Pass A implementation-ready after #156 integration** | shared contracts/employment |
| loans | `LOAN_ACTIVE` exige owner distinto de registration; `route=abroad` válido en cesión internacional | state-validator + stratified sim | covered | market/QA |
| sport producer | fixture/squad/calendar authority persistida, 0 RNG | `scripts/test-t5-match-model.mjs`, sport-context tests | producer integrated at `main@5f4d14b` | sport |
| sport save authority | persisted facts must be producer-possible and milestone-semantic | `scripts/test-t5-match-model-known-bug.mjs` | **owner PR #214 exact-head RI green; open until post-merge verification** | sport/save |
| saves | round-trip + malformed authoritative state fail closed | save suite + integration probes | covered except #212 and future employment state from #130 | save |
| migrations | path adjacent, frozen evidence, no history rewrite | T5.1 migration/freeze suites | covered through generation H | T5.1/session |
| 18–23 | cross-boundary + references | `qa:t5:fast` | smoke only; content work ongoing | content 18–23 |
| 23–30 | causal role provenance | `scripts/test-t51-prs-23-26.mjs` | covered; #109 resolved | content 23–30 |
| 30–34 captaincy | main-captain consumers require explicit current-club captain authority; proxies/secondary/group fail closed | `scripts/test-t5-captain-gap-known-bug.mjs` | **failing/open T5-QA-030 / #161** | content 30–34 |
| 34+ | no age-only forced retirement | retirement known-bug + simulations | open via #61 | 34+/retirement |
| retirement | state machine preserves player authority | `T5-QA-016a/b/c` | failing/open; owner fix #118 exists | retirement |
| epilogues | factual milestones backed by history | long-career QA | covered on current generator | epilogue |
| content identity | active freeze/registry exact | T5.1 freeze/migration suites | covered through generation H | T5.1/session |
| RNG | same seed/options deterministic; microfeeds non-interfering | determinism gate | covered | shared |
