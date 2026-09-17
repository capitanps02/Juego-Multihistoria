# T5 regression matrix

| Área | Invariante | Test/Gate | Estado | Owner |
|---|---|---|---|---|
| seeds | lifecycle único + referencias/catálogos cerrados | `qa:t5:content`, T5.2 direct-read audit | covered; #131 resolved | T5.2/tooling |
| NPC | world fact != NPC knowledge; provenance histórica estable | `test:t53`, `qa:t5:integration` | covered; #92 resolved | T5.3 |
| market | offer IDs únicos; action/accept coherent | `qa:t5:fast` + market authority tests | covered | market |
| contracts | meses/salario no negativos; expiry no zombie | `scripts/test-t5-contract-expiry-known-bug.mjs` | **failing/open T5-QA-028; Pass A sequencing-blocked on #156** | shared contracts/employment |
| loans | `LOAN_ACTIVE` exige parent distinto; `route=abroad` es válido en cesión internacional | `scripts/test-t5-state-validator.mjs` + stratified sim | covered | market/QA |
| sport | football RNG separado + resultado persistido y validado al cargar | `scripts/test-t5-football-moments.mjs`, integration probe | covered; #100 resolved | sport/save |
| saves | round-trip + malformed authoritative state fail closed | save suite + integration probes | covered salvo futura transición laboral de #130 | save |
| migrations | path adjacent, frozen evidence, no history rewrite | T5.1 migration/freeze suites | covered through generation H | T5.1/session |
| 18–23 | cross-boundary + references | `qa:t5:fast` | smoke only; content work ongoing | content 18–23 |
| 23–30 | causal role provenance | `scripts/test-t51-prs-23-26.mjs` | covered; #109 resolved and retained through H | content 23–30 |
| 30–34 | reimplemented choices produce valid state | integration probe | conditional/covered when present | content 30–34 |
| 34+ | no age-only forced retirement | retirement known-bug + simulations | open via #61 | 34+/retirement |
| retirement | state machine preserves player authority | `T5-QA-016a/b/c` | failing/open | retirement |
| epilogues | factual milestones backed by history | long-career QA | covered on current generator | epilogue |
| content identity | active freeze/registry exact | T5.1 freeze/migration suites | covered through generation H | T5.1/session |
| RNG | same seed/options deterministic; microfeeds non-interfering | determinism gate | covered | shared |
