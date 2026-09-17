# QA → Codex handoff

Fuente técnica: GitHub. Base de esta pasada: `main@da3b356ac1c9c3376052189573e5a30f89b71cf0`.

Objetivo: entregar defectos pequeños, reproducibles y con ownership claro. Codex no debe recibir tareas genéricas del tipo «arreglar QA» ni duplicar fixes que ya existen en una rama propietaria.

## Flujo

1. Elegir una fila `status=ready` de `implementation-ready.json`.
2. Si `tasks` está vacío, no inventar trabajo: consultar blockers/owner PRs del registro.
3. Reproducir primero el test indicado sobre el base exacto o sobre el PR propietario cuando la tarea sea de integración.
4. Cambiar solo los archivos permitidos por el ownership.
5. Hacer verde la reproducción sin relajar el test.
6. Ejecutar acceptance tests y regresiones vecinas.
7. Reportar HEAD exacto y CI. No merge automático.

## Bugs abiertos reproducidos en main

- T5-QA-016 / issue #61 — player authority en retirada. El runtime de `main` conserva el bypass, pero PR #118 ya implementa el fix dirigido; no duplicar ese código desde Codex. QA debe certificar su integración/re-ground cuando lineage lo permita.
- T5-QA-028 / issue #130 — contrato vencido permanece registrado/activo durante años. Reproducción dirigida `loyal/512000`: 6669 días a 0 meses y 419 apariciones añadidas en la última certificación dirigida. El contrato de Pass A ya está especificado; la implementación espera a que PR #156 fije la frontera final del simulador.

## Blocker de PR candidato

- T5-QA-027 / issue #133 / PR #122 — la elección de escalar al capitán debe fallar cerrado cuando no existe un target autoritativo.

## Resueltos

- T5-QA-021 / #92 — baseline histórica NPC v1 integrada.
- T5-QA-022 / #100 — `footballMomentResults` malformado falla en el boundary de carga; la regresión usa un moment id registrado.
- T5-QA-023 / #109 — generación G usa provenance exacta (`roleGuaranteeAt23`) + caída factual (`roleDropSince23`), retenida en H, y cubre B/C/D negativos.
- T5-QA-025 / #131 — historical seed consumers cierran contra `SEED_CATALOG` sin entrar en el grafo live.

## Simulación QA

El rojo observado en la simulación estratificada no era #130: el validador confundía una cesión internacional válida (`LOAN_ACTIVE=true`, `ownerClub != registrationClub`, `route=abroad`) con una incoherencia. El validador ahora usa la autoridad de ownership y existe una regresión específica para esa combinación.

## Por qué no hay tareas Codex QA desbloqueadas ahora

- #61: el fix ya existe en PR #118; duplicarlo crearía dos implementaciones del mismo state machine. Sigue abierto hasta integración real y regresión exact-head.
- #130: Pass A está definido, pero PR #156 sigue abierto/draft y mueve la frontera autoritativa de world simulation. Aplicarlo antes obligaría a parchear dos layouts.
- #133: es blocker del owner LOCK23/PR #122, no ownership QA.

No improvisar `route=free_agent`, salario 0, club sentinel, transferencia forzada, contrato sintético ni retirada automática. No auto-merge.
