# QA → Codex handoff

Fuente técnica: GitHub. Base de esta pasada: `main@5f4d14bca4d696cfafadb58b64034c7cd40cc147`.

Objetivo: entregar defectos reproducibles y con ownership claro. Codex no debe recibir tareas genéricas ni duplicar fixes ya existentes en ramas propietarias.

## Flujo

1. Elegir solo una fila `status=ready` de `implementation-ready.json`.
2. Reproducir primero el test indicado sobre el base exacto o re-groundar si `main` avanzó.
3. Cambiar solo la superficie autorizada.
4. Hacer verde la reproducción sin relajar el test.
5. Retener la regresión permanente y ejecutar pruebas vecinas + Repository Integrity exact-head.
6. Reportar base, HEAD, archivos, CI y blockers. No merge automático.

## Estado QA

- **8 bugs registrados: 4 open / 4 resolved / 0 P0.**
- T5-QA-016 / #61 — OPEN P1. El fix de retirada ya existe en PR #118; no duplicar desde Codex.
- T5-QA-027 / #133 — OPEN P2. Pertenece al próximo owner serializado de LOCK23; no inventar capitán.
- T5-QA-028 / #130 — OPEN P1 / **SPEC-READY, EXECUTION-BLOCKED**. Pass A está definido, pero coordinación fija `#207 -> #157 -> #130 -> #176`. No implementar #130 antes de que CareerOffer.context y MarketState v2 estén integrados.
- T5-QA-029 / #212 — OPEN P2 / **READY**. El match-model v1 integrado acepta autoridad persistida imposible. Reproducción: `scripts/test-t5-match-model-known-bug.mjs`.

## Orden recomendado para Codex

1. **T5-QA-029 / #212**: único bug QA runtime actualmente `status=ready`.
2. **No iniciar T5-QA-028 / #130 todavía**. Esperar integración/re-ground de #207 y después #157 MarketState v2; entonces revalidar Pass A sobre la API final de ofertas.

## T5-QA-028 — límites de Pass A

`monthsRemaining=0` debe derivar a empleo no activo/unattached; los strings de último club/owner/registration/salary son provenance, no autoridad laboral viva. Football, renovación ordinaria e institutional-club authority fallan cerrado. Los reads consumen 0 RNG. Solo aceptar una CareerOffer formal a través de la autoridad final de MarketState puede reactivar empleo normal.

No improvisar `route=free_agent`, salario 0, club sentinel, transferencia forzada, contrato sintético ni retirada automática. Tampoco conservar `market.pending` y `openOffers` como dos verdades vivas.

## Dependencia #207 → #157 → #130

- **#207 / #175** añade `CareerOffer.context` validado y debe integrarse primero.
- **#157** migra la autoridad singular a una colección formal 0..N, preservando IDs/context/history y añadiendo provenance de cierre sistémico.
- **#130** debe componer la reactivación de empleo con esa API final, no crear una segunda autoridad de ofertas o una migración intermedia.

## T5-QA-029 — invariantes mínimas

El validador de `world.sportMatchModel` v1 debe rechazar, como mínimo: bench sin call-up, aparición con 0 minutos, `firstGoal` no nulo sin productor de goles, hitos que apuntan a un fixture que no prueba el hecho y hitos `first*` que saltan un fixture anterior ya cualificado.

## Resueltos

- T5-QA-021 / #92 — baseline histórica NPC v1.
- T5-QA-022 / #100 — malformed `footballMomentResults` fail closed.
- T5-QA-023 / #109 — provenance exacta de PRS23.
- T5-QA-025 / #131 — historical seed IDs cierran contra `SEED_CATALOG`.

No auto-merge.
