# QA T5 — regresión y auditoría independiente

Rama: `qa/t5-regression`  
Re-ground actual: `main@5f4d14bca4d696cfafadb58b64034c7cd40cc147`  
Owner: QA independiente

QA intenta falsar invariantes. No reescribe canon ni corrige silenciosamente runtime de otros workstreams. Los defectos runtime se convierten en reproducciones, issues y handoffs acotados.

## Estado verificado 2026-09-18

**8 bugs: 4 open / 4 resolved / 0 P0.**

- T5-QA-016 — **OPEN / P1 / owner-fix exists** — issue #61. PR #118 implementa el fix de player authority; no duplicar desde Codex.
- T5-QA-021 — **RESOLVED** — NPC knowledge backfill v1; #92.
- T5-QA-022 — **RESOLVED** — malformed footballMomentResults falla al cargar; #100.
- T5-QA-023 — **RESOLVED** — PRS23 usa provenance y caída factual exactas; #109.
- T5-QA-025 — **RESOLVED** — historical seed consumers cierran contra catálogo; #131.
- T5-QA-027 — **OPEN / P2 / serialized owner** — #133. LOCK23 debe fallar cerrado sin capitán autoritativo.
- T5-QA-028 — **OPEN / P1 / spec-ready, execution-blocked** — #130. Pass A está definido, pero la cadena coordinada vigente es `#207 -> #157 -> #130 -> #176`; no debe implementarse contra MarketState v1.
- T5-QA-029 — **OPEN / P2 / implementation-ready** — #212. `sportMatchModel` v1 acepta autoridad persistida imposible; reproducción QA dedicada fuera del gate verde.

## T5-QA-028 evidence y contrato

Reproducción histórica `loyal / seed 512000`: primera expiración `2029-06-01`; 6669 días observados a 0 meses; máximo continuo 5694; 0 cambios de empleo; 419 apariciones añadidas con el mismo club/owner/registration/salary.

Pass A exige una autoridad `contracted | unattached`, transición 1→0 determinista/idempotente/0 RNG, provenance de último club separada de empleo vivo, football/renewal/institutional NPC fail-closed mientras unattached y reactivación únicamente mediante una CareerOffer formal.

La implementación queda temporalmente bloqueada por coordinación:
1. #207 integra `CareerOffer.context`.
2. #157 migra MarketState a una única colección autoritativa 0..N y preserva context/IDs/history.
3. #130 consume esa autoridad final para reactivar empleo; no crea un segundo sistema de ofertas, `market.pending` paralelo ni migración intermedia.

No sentinel club, `route=free_agent`, salary=0, transferencia forzada, contrato sintético ni retirada automática.

## T5-QA-029 evidence y contrato

Tras integrar #156, el validador del store deportivo v1 sigue aceptando combinaciones que el productor no puede crear: bench sin call-up, aparición con 0 minutos, `firstGoal` no nulo aunque el productor de goles no existe, y milestones que no prueban el predicado o no son realmente el primer fixture cualificado.

Reproducción: `npm run build && node --test scripts/test-t5-match-model-known-bug.mjs`. Debe permanecer fuera del gate verde hasta el owner fix; después sus casos pasan a regresión permanente del match-model.

## Codex-ready QA

`analysis/CODEX/qa/implementation-ready.json` contiene **1 tarea ready**: T5-QA-029/#212. T5-QA-028/#130 permanece machine-readable pero con `status=blocked` y `blockedBy=[207,157]`.

## Gates verdes

- `qa:t5:fast`: determinismo/RNG, cruces de edad y carreras largas.
- `qa:t5:content`: cierre referencial + ratchet de `seedsRead`.
- `qa:t5:freeze` / `qa:t5:saves`: contentIdentity, lineage y compatibilidad.
- `qa:t5:integration`: probes cross-workstream.
- match-model/sport-context owner tests.
- `qa:t5:simulation`: 9 perfiles estratificados + artifact diagnóstico.
- state-validator QA unit tests.

## Known-bug reproductions fuera del gate verde

- `scripts/test-t5-contract-expiry-known-bug.mjs` — T5-QA-028.
- `scripts/test-t5-match-model-known-bug.mjs` — T5-QA-029.
- `qa:t5:known-bugs` — retirada T5-QA-016.

QA no mergea su propio PR. Un bug solo pasa a `resolved` tras fix integrado y reproducción/regresión verde sobre el HEAD exacto.
