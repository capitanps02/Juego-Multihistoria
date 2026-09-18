# QA → Codex handoff

Fuente técnica: GitHub. Base de esta pasada: `main@5f4d14bca4d696cfafadb58b64034c7cd40cc147`.

Objetivo: entregar defectos reproducibles y con ownership claro. Codex no debe recibir tareas genéricas ni duplicar fixes ya existentes en ramas propietarias.

## Flujo

1. Elegir solo una fila `status=ready` de `implementation-ready.json`.
2. Si no existe ninguna, no inventar trabajo: seguir los owner PRs y blockers registrados.
3. Reproducir sobre el base exacto o re-groundar si `main` avanzó.
4. No duplicar un runtime fix cuando ya existe un owner PR.
5. Un bug solo pasa a resuelto tras integración real + regresión post-merge verde.
6. No merge automático.

## Estado QA

- **8 bugs registrados: 4 open / 4 resolved / 0 P0.**
- T5-QA-016 / #61 — OPEN P1 / owner fix PR #118.
- T5-QA-027 / #133 — OPEN P2 / próximo owner serializado de LOCK23.
- T5-QA-028 / #130 — OPEN P1 / **SPEC-READY, EXECUTION-BLOCKED** por `#207 -> #157 -> #130`.
- T5-QA-029 / #212 — OPEN P2 / **OWNER FIX OPEN en PR #214**. Duplicate PR #218 cerrado como superseded.

## Cola Codex QA

**0 tareas runtime libres en este snapshot.**

- #212: no duplicar; auditar/certificar PR #214.
- #130: no empezar hasta integrar #207 y #157.
- #61: no duplicar PR #118.
- #133: pertenece al owner de la siguiente generación LOCK23.

## PR #214 — candidato único para T5-QA-029

- branch: `codex/t5-match-save-invariants`
- HEAD auditado: `b688017e996449f88822dc7c54162c3f3b3e3c2f`
- base: `main@5f4d14b...`
- compare: **3 ahead / 0 behind**
- write-set: `src/simulation/match-model.ts`, `scripts/test-t5-match-model.mjs`, `scripts/test-t5-match-model-known-bug.mjs`
- Repository Integrity exact-head: run `35330315528` (pendiente de conclusión en este snapshot).

QA prefirió #214 frente a #218 porque además de los cinco casos dirigidos aplica la paridad completa del productor: un convocado no titular debe figurar en banquillo (`onBench = calledUp && !started`). #214 también conserva el known-bug exacto y cubre round-trip de bench/substitute/starter y resume sin commit ante corrupción.

## T5-QA-028 — límites de Pass A

`monthsRemaining=0` debe derivar a empleo no activo/unattached; último club/owner/registration/salary son provenance, no autoridad laboral viva. Football, renovación ordinaria e institutional-club authority fallan cerrado. La reactivación normal usa únicamente la autoridad formal final de CareerOffer/MarketState.

No improvisar `route=free_agent`, salario 0, club sentinel, transferencia forzada, contrato sintético ni retirada automática.

## Dependencia #207 → #157 → #130

- #207 añade `CareerOffer.context` validado.
- #157 migra la autoridad singular a una colección formal 0..N, preservando IDs/context/history y provenance de cierre sistémico.
- #130 compone reactivación de empleo con esa API final.

## Resueltos

- T5-QA-021 / #92 — baseline histórica NPC v1.
- T5-QA-022 / #100 — malformed `footballMomentResults` fail closed.
- T5-QA-023 / #109 — provenance exacta de PRS23.
- T5-QA-025 / #131 — historical seed IDs cierran contra `SEED_CATALOG`.

No auto-merge.
