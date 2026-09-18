# QA T5 — regresión y auditoría independiente

Rama: `qa/t5-regression`  
Último main verificado: `49f16b21c8f68f1439901437dcf16e1384966de2`  
QA branch pendiente de re-ground sobre ese commit  
Owner: QA independiente

QA intenta falsar invariantes. No reescribe canon ni corrige silenciosamente runtime de otros workstreams. Los defectos runtime se convierten en reproducciones, issues y handoffs acotados.

## Estado verificado 2026-09-18

**11 bugs: 7 open / 4 resolved / 0 P0.**

- T5-QA-016 — **OPEN / P1 / owner-fix PR #118** — #61. Runtime a/b/c + persisted state-machine d/e regressions prepared.
- T5-QA-021 — **RESOLVED** — #92.
- T5-QA-022 — **RESOLVED** — #100.
- T5-QA-023 — **RESOLVED** — #109.
- T5-QA-025 — **RESOLVED** — #131.
- T5-QA-027 — **OPEN / P2 / serialized owner** — #133.
- T5-QA-028 — **OPEN / P1 / spec-ready, execution-blocked** — #130; cadena `#207 -> #157 -> #130 -> #176`.
- T5-QA-029 — **OPEN / P2 / owner-fix PR #214** — #212; re-grounded en `main@49f16b21...`, HEAD `78c0ca4e...`, 1 ahead / 0 behind; exact-head RI `35336619877` pendiente.
- T5-QA-030 — **OPEN / P2 / canon owner** — #161. `EVT_33_CAP_001` en main sigue con gates vacíos; reproducción permanente exige fail-closed sin captain real.
- T5-QA-031 — **OPEN / P2 / owner-fix PR #207** — #175. `CareerOffer.context` se valida en productor/read, pero no en save boundary; malformed persisted context se acepta.
- T5-QA-032 — **OPEN / P2 / A1+save owner** — #241. `npc.knowledge` solo valida el contenedor; una fila corrupta puede entrar en save y luego desaparecer semánticamente al leerse.

## T5-QA-029 — owner candidate

QA comparó las dos implementaciones abiertas y seleccionó PR #214:
- branch `codex/t5-match-save-invariants`;
- HEAD auditado `b688017e996449f88822dc7c54162c3f3b3e3c2f`;
- 3 ahead / 0 behind sobre `main@5f4d14b...`;
- 3 archivos, todos dentro del ownership de match-model/save validation;
- incluye la reproducción exacta de cinco casos QA;
- refuerza la paridad completa `onBench = calledUp && !started`;
- cubre earliest milestones, `firstGoal=null`, round-trip real de bench/substitute/starter y rechazo de resume antes de commit.

PR #218 se cerró porque era solapada y menos estricta para un convocado no titular que no figurase en banquillo.

El parche re-grounded de #214 conserva exactamente los mismos blobs auditados en `match-model.ts` y sus dos tests. Nuevo Repository Integrity exact-head: run `35336619877`, pendiente. #212 sigue OPEN hasta integración + post-merge.

## T5-QA-028 evidence y contrato

Reproducción histórica `loyal / seed 512000`: primera expiración `2029-06-01`; 6669 días observados a 0 meses; máximo continuo 5694; 0 cambios de empleo; 419 apariciones añadidas.

Pass A exige `contracted | unattached`, transición 1→0 determinista/idempotente/0 RNG, provenance de último club separada de empleo vivo y football/renewal/institutional NPC fail-closed mientras unattached. QA ya prepara cuatro regresiones dirigidas: zombie largo, save/load+RNG en 1→0, no old-club play + re-empleo formal, y determinismo.

Ejecución bloqueada hasta:
1. #207 `CareerOffer.context`;
2. #157 MarketState v2 con una sola colección formal 0..N;
3. #130 consume esa autoridad final.

## Codex-ready QA

**0 tareas runtime libres.**  
`implementation-ready.json` conserva #212 como `owner_fix_open` y #130 como `blocked`.

## Gates verdes del QA branch

- `qa:t5:fast`
- `qa:t5:content`
- `qa:t5:freeze` / `qa:t5:saves`
- `qa:t5:integration`
- match-model/sport-context owner tests
- `qa:t5:simulation`
- state-validator unit tests

## Known-bug reproductions fuera del gate verde

- `scripts/test-t5-contract-expiry-known-bug.mjs` — T5-QA-028.
- `scripts/test-t5-retirement-save-known-bug.mjs` — T5-QA-016d/e.
- `scripts/test-t5-match-model-known-bug.mjs` — T5-QA-029.
- `scripts/test-t5-captain-gap-known-bug.mjs` — T5-QA-030/#161.
- `scripts/test-t5-offer-context-known-bug.mjs` — T5-QA-031/#175/#207.
- `scripts/test-t5-npc-knowledge-save-known-bug.mjs` — T5-QA-032/#241.
- `qa:t5:known-bugs` — T5-QA-016 + T5-QA-030 + T5-QA-031 + T5-QA-032.

QA no mergea su propio PR. Un bug solo pasa a `resolved` tras fix integrado y reproducción/regresión verde sobre el HEAD exacto.


## A10 finite certification score

- Infraestructura QA: **50/50**
- A10-1 P1/P2: **11/15**
- A10-2 Saves/migrations: **4/10**
- A10-3 Cross-system invariants: **3/10**
- A10-4 Long-career/determinism: **5/10**
- A10-5 Final certification: **0/5**
- **TOTAL: 73/100**

A10-2 ya acredita en la suite existente: lineage A→B→C, pending frozen-definition, tamper fail-closed, conservación de history/seeds/NPC/market/receipts/RNG, offer save/resume y player-leadership save/load. Faltan generaciones finales y estados terminales integrados.

A10-5 permanece reservado al HEAD final integrado de T5. No ampliar fuzzing fuera de la matriz cerrada.
