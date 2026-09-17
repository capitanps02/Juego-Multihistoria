# QA → Codex handoff

Fuente técnica: GitHub. Base de esta pasada: `main@182d5e6abc4f7c98eeb95703a4bc6c3560a4bcde`.

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
- T5-QA-028 / issue #130 — contrato vencido permanece registrado/activo durante años. Reproducción dirigida `loyal/512000`: 6669 días a 0 meses y 419 apariciones añadidas en la última certificación dirigida; el contrato laboral compartido sigue sin transición autoritativa.

## Blocker de PR candidato

- T5-QA-027 / issue #133 / PR #122 — la elección de escalar al capitán debe fallar cerrado cuando no existe un target autoritativo.

## Resueltos

- T5-QA-021 / #92 — baseline histórica NPC v1 integrada.
- T5-QA-022 / #100 — `footballMomentResults` malformado falla en el boundary de carga; la regresión usa un moment id registrado.
- T5-QA-023 / #109 — generación G usa provenance exacta (`roleGuaranteeAt23`) + caída factual (`roleDropSince23`) y cubre B/C/D negativos.
- T5-QA-025 / #131 — historical seed consumers cierran contra `SEED_CATALOG` sin entrar en el grafo live.

## Simulación QA

El rojo observado en la simulación estratificada no era #130: el validador confundía una cesión internacional válida (`LOAN_ACTIVE=true`, `ownerClub != registrationClub`, `route=abroad`) con una incoherencia. El validador ahora usa la autoridad de ownership y existe una regresión específica para esa combinación.

## T5-QA-028 no es todavía implementation-ready

La reproducción está confirmada y permanente, pero el runtime fix está `design-blocked`: debe existir un contrato compartido y save-safe para resolver `expired_pending_resolution` a un estado laboral autoritativo. No improvisar `route=free_agent`, salario 0, club sentinel, transferencia forzada, contrato sintético ni retirada automática.
