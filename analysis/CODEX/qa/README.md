# QA → Codex handoff

Fuente técnica: GitHub. Base de esta pasada: `main@782b92c9a496293aeb33ad8b39f522a927374d6f`.

Objetivo: entregar defectos pequeños, reproducibles y con ownership claro. Codex no debe recibir tareas genéricas del tipo «arreglar QA».

## Flujo

1. Elegir una fila `status=ready` de `implementation-ready.json`.
2. Reproducir primero el test indicado sobre el base exacto o sobre el PR propietario cuando la tarea sea de integración.
3. Cambiar solo los archivos permitidos por el ownership.
4. Hacer verde la reproducción sin relajar el test.
5. Ejecutar acceptance tests y regresiones vecinas.
6. Reportar HEAD exacto y CI. No merge automático.

## Bugs abiertos reproducidos en main

- T5-QA-016 / issue #61 — player authority en retirada.
- T5-QA-023 / issue #109 — provenance exacta de expectativa de rol para PRS23.
- T5-QA-028 / issue #130 — contrato vencido permanece registrado/activo durante años. Reproducción exacta `loyal/512000` sobre `main@782b92c9`: 6669 días a 0 meses y 419 apariciones añadidas.

## Blockers de PR candidatos

- T5-QA-022 / issue #100 / PR #93 — validación de footballMomentResults al cargar.
- T5-QA-027 / issue #133 / PR #122 — choice de captain debe fallar cerrado sin target.

## Resueltos en esta ventana

- T5-QA-021 / #92 — baseline histórica NPC v1 integrada.
- T5-QA-025 / #131 — historical seed consumers cierran contra `SEED_CATALOG` sin entrar en el grafo live.

## T5-QA-028 no es todavía implementation-ready

La reproducción está confirmada y permanente, pero el runtime fix está `design-blocked`: debe existir un contrato compartido y save-safe para resolver `expired_pending_resolution` a un estado laboral autoritativo. No improvisar `route=free_agent`, salario 0, club sentinel, transferencia forzada, contrato sintético ni retirada automática.
