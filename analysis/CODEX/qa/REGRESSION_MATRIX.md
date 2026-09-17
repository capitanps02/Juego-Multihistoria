# T5 regression matrix

| Área | Invariante | Test/Gate | Estado | Owner |
|---|---|---|---|---|
| seeds | lifecycle único + referencias/catálogos cerrados | `qa:t5:content`, T5.2 direct-read audit | covered; #131 resolved | T5.2/tooling |
| NPC | world fact != NPC knowledge; provenance histórica estable | `test:t53`, `qa:t5:integration` | covered; #92 resolved | T5.3 |
| market | offer IDs únicos; action/accept coherent | `qa:t5:fast` + market authority tests | covered | market |
| contracts | meses/salario no negativos; expiry no zombie | `scripts/test-t5-contract-expiry-known-bug.mjs` | **failing/open T5-QA-028** | shared contracts/employment |
| sport | football RNG separado + result persistido | candidate PR #93 tests | blocked by #100 | sport |
| saves | round-trip + malformed authoritative state fail closed | `qa:t5:saves` | covered except candidate football store and future employment transition | save |
| migrations | path adjacent, frozen evidence, no history rewrite | `qa:t5:freeze`, `qa:t5:saves` | covered on active lineage | T5.1/session |
| 18–23 | cross-boundary + references | `qa:t5:fast` | smoke only; content work ongoing | content 18–23 |
| 23–30 | causal role provenance | `T5-QA-023` | failing/open | content 23–30 |
| 30–34 | reimplemented choices produce valid state | integration probe | conditional/covered when present | content 30–34 |
| 34+ | no age-only forced retirement | retirement known-bug + simulations | open via #61 | 34+/retirement |
| retirement | state machine preserves player authority | `T5-QA-016a/b/c` | failing/open | retirement |
| epilogues | factual milestones backed by history | `qa:t5:fast` long careers | covered on current generator | epilogue |
| content identity | active freeze/registry exact | `qa:t5:freeze` | covered | T5.1/session |
| RNG | same seed/options deterministic; microfeeds non-interfering | `qa:t5:fast` | covered | shared |
