# Evidencia exacta de ejecución — #70

## Run 1

- branch: `qa/t5-market-cadence-diagnostic-v2`
- head: `2ac335526c8b939bc213102b3ca5973f14b4a45a`
- Actions run: `35153404198`
- job: `104986989303`
- artifact: `10470500603`

Resultado principal:
- 482 decisiones de mercado;
- 480 renovaciones;
- 482 IDs únicos;
- 0 decisiones duplicadas.

## Run 2 — clasificación por estado de negociación

- branch: `qa/t5-market-cadence-diagnostic-v2`
- head: `3e3294a36f46105cc73f1dd035082a5926cc46d3`
- Actions run: `35153559324`
- job: `104987502740`
- artifact: `10469489929`

Resultado principal:
- 482 decisiones de mercado;
- 480 renovaciones;
- 462 renovaciones con `before.months === 0`;
- 474 reintentos de una firma lógica `reason + before` ya vista;
- 328 pares consecutivos de renovación separados por <=7 días;
- 327 de esos pares conservan exactamente el mismo `before`;
- el estado `Renovación de contrato + before.months=0` aparece 462 veces entre edades 20 y 33.

Ambos runs usan build limpio del commit correspondiente y el perfil `loyal` real del QA T5.
