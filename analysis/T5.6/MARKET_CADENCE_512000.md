# T5 QA — Diagnóstico de cadencia de mercado · loyal / seed 512000

Fecha: 2026-09-16

Issue: #70

## Alcance

Este diagnóstico reproduce el outlier observado en la simulación estratificada sin modificar gameplay, RNG, saves, contenido, scheduler ni balance.

Perfil exacto:

- `profile=loyal`;
- `seed=512000`;
- política de oferta: `reject`;
- mismo selector narrativo del runner `qa-t5-sim.mjs`.

Runner reproducible:

- `scripts/qa-t5-market-cadence.mjs`;
- workflow `T5 market cadence diagnostic`;
- run refinado: `35153559324`;
- artifact: `market-cadence-512000` (`10469489929`).

## Resultado

La anomalía se reproduce en el catálogo/runtime actual:

- carrera cerrada: sí;
- edad de decisión de retirada: 39;
- edad final: 44;
- decisiones narrativas: 161;
- decisiones de mercado: **482**;
- longitud de `market.history`: **482**.

Desglose por razón:

- `Propuesta al entrar en la etapa profesional`: 1;
- `Renovación de contrato`: **480**;
- `Propuesta de mercado`: 1.

## No es replay de comandos ni reutilización de IDs

La autoridad `respondToOffer()` funciona como se espera:

- 482 decisiones observadas;
- **482 IDs de oferta únicos**;
- 0 IDs de decisión duplicados;
- en 100 % de las respuestas, `careerTerms(state)` coincidía con `offer.before`;
- cada respuesta `reject` limpia `market.pending`.

Por tanto, el outlier no procede de doble comando, replay o de responder dos veces a una misma `CareerOffer`.

## Sí es regeneración de nuevas renovaciones desde el mismo estado

La firma lógica de negociación utilizada por el diagnóstico es:

`reason + offer.before`

Se excluyen deliberadamente `offer.terms`, porque el generador vuelve a sortear duración/salario y dos intentos sobre el mismo estado pueden producir términos distintos.

Resultado:

- **474 reintentos** sobre un estado de negociación ya observado;
- **328** renovaciones aparecen a <=7 días de la anterior;
- **327** de esos reintentos semanales mantienen exactamente el mismo `offer.before`;
- gap mínimo entre renovaciones: **7 días**.

### Estado dominante

Después de que el contrato llegue a 0 meses:

- renovaciones con `before.months === 0`: **462**;
- misma firma lógica `Renovación de contrato + before actual`: **462 veces**;
- primera: `2029-06-13`;
- última: `2042-06-18`;
- edades afectadas: 20–33;
- 314 reintentos del mismo estado se producen a una semana del anterior.

Antes del vencimiento también se observa repetición semanal mientras el snapshot no cambia:

- 5 meses restantes: 4 ofertas sobre el mismo `before`;
- 4 meses: 4;
- 3 meses: 2;
- 2 meses: 3;
- 1 mes: 5.

## Causa runtime

`professionalWeek()` permite crear una renovación cuando:

- edad < 34;
- `months <= 5`;
- no existe `CONTRACT_DISPUTE`;
- el draw semanal supera la probabilidad de renovación.

La propuesta se materializa mediante `proposeCareerChange(state, "Renovación de contrato", ...)`.

Cuando el jugador rechaza:

1. `respondToOffer()` registra la decisión;
2. no cambia `CareerTerms`;
3. limpia `market.pending`;
4. el siguiente tick semanal vuelve a evaluar `professionalWeek()`;
5. como `months <= 5` sigue siendo cierto, puede generarse una **nueva** renovación con otro ID y términos aleatorios.

En `months === 0`, el snapshot contractual deja de avanzar porque el tick mensual aplica `max(0, months - 1)`. Por ello el estado elegible queda estacionario y el ciclo puede prolongarse durante años.

## Frontera semántica

No se aplica aquí un cooldown arbitrario.

El contenido canónico existente ya contempla rechazo temporal con riesgo contractual (p. ej. “Rechazar por ahora y entrar en verano con más riesgo contractual”), por lo que una futura oferta puede ser válida si cambia el contexto. Lo que la evidencia no justifica es renegociar semanalmente sin ningún cambio de estado.

Candidato de contrato técnico para un fix separado:

> una renovación rechazada no vuelve a proponerse mientras `reason + current CareerTerms` sea exactamente el mismo snapshot; un cambio contractual real puede volver a habilitar una propuesta.

Esto puede derivarse de `market.history` sin añadir schema persistido ni inventar una duración de cooldown.

## Conclusión

#70 queda localizado como problema de **cadencia/eligibility de generación de renovaciones**, no como fallo de idempotencia de `respondToOffer()` ni como bug exclusivo de late career.

El fix debe vivir separado de este diagnóstico y demostrar que:

- no se repite una renovación rechazada sobre el mismo snapshot;
- un cambio real de snapshot puede volver a habilitarla;
- aceptar/delegar conserva la autoridad de `respondToOffer()`;
- no se añaden draws RNG para leer historial;
- save/reload mantiene la misma elegibilidad;
- la simulación `loyal/512000` deja de producir cientos de renovaciones sin imponer todavía objetivos globales de balance.
