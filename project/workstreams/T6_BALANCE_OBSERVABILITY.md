# T6 — Balance, observabilidad y simulación masiva

Rama propietaria: `t6/balance-observability`  
Base runtime de esta pasada: `main@6cb81b63f03ce55776ca97075012cfaa22ac228d`  
Owner: Agente 10 — balance/observabilidad  
Estado: preparación paralela durante T5; no acredita cierre T6 hasta que exista candidata integrada.

## Misión

Preparar T6 sin interferir con T5. Este workstream mide carreras completas, cobertura, diversidad, cadencia y zonas muertas; no reescribe canon ni ajusta gameplay productivo mientras T5 siga integrándose.

- QA responde principalmente “¿se ha roto una invariante?”;
- T6 observabilidad responde “¿qué rutas produce realmente el sistema, con qué frecuencia, bajo qué seeds/perfiles y dónde converge o se queda vacío?”.

Una distribución extraña es evidencia para investigar, no una regla de diseño ni un bug automático.

## Propiedad permitida

Puede modificar exclusivamente, salvo coordinación explícita:

- `project/workstreams/T6_BALANCE_OBSERVABILITY.md`;
- `analysis/T6/**`;
- scripts nuevos `scripts/t6-*`;
- tests nuevos `scripts/test-t6-*`.

No modifica por iniciativa propia contenido canónico, runtime productivo, saves/sesión/migración, scheduler/resolver/world simulator/offers, seeds/NPC, Android/PlayCanvas/web, balance numérico, `package.json`, CI ni tracking oficial.

Cuando detecte un problema ajeno, entrega `seed + perfil + evidencia + métrica + hipótesis reproducible` al owner correspondiente.

## Grounding y re-ground

Esta pasada se re-groundea atómicamente sobre `main@6cb81b63f03ce55776ca97075012cfaa22ac228d` porque el runtime/canon medido por T6 ha avanzado materialmente. El árbol resultante debe conservar únicamente archivos del Agente 10 encima del árbol actual de `main`.

El anterior re-ground `0e1fbf9ca035e568c19ec4e260c7a0bb98159745` sobre `main@fe06a5c9d61632ea4491dc6df95788154884177a` pasó Repository Integrity run `35126649632`. Esa evidencia se conserva como histórica y **no** acredita el nuevo HEAD; el commit resultante de esta pasada necesita su propio CI exacto.

Re-groundear de nuevo solo cuando cambie materialmente el catálogo activo o un runtime consumido por carreras nuevas (`scheduler`, `resolver`, `offers`, `world-simulator`, etc.), o cuando T5 congele candidata. Evitar churn por documentación, migración de saves o UI si no cambia lo medido.

## Choice eligibility

T6 no replica la semántica de elegibilidad. El contrato productivo es:

1. `scheduleEvent()` descarta eventos sin opciones seleccionables;
2. cuando devuelve un evento, `scheduled.event` está materializado con solo las choices elegibles para ese `GameState`;
3. `t6-sim.mjs` pasa exactamente `scheduled.event` a `chooseForProfile()`.

Por tanto, un perfil T6 nunca debe puntuar una choice que el jugador no puede seleccionar. `scripts/test-t6-choice-eligibility.mjs` fija esta integración con una opción bloqueada que sería semánticamente preferida por `money-first` si llegara al selector, y verifica también que la definición canónica no se muta.

## T6.1 — Perfiles semánticos

15 perfiles:

`ambitious`, `loyal`, `money-first`, `risk-taker`, `risk-averse`, `health-first`, `fame-first`, `stability`, `team-first`, `family-first`, `control-first`, `agent-led`, `national-team`, `legacy-builder`, `contrarian-explorer`.

Contrato:

- seleccionan por `intentTags` + label, nunca por IDs de escena;
- normalización insensible a tildes;
- matching por límites de token;
- compound tags conservan palabras semánticas;
- empates positivos usan fallback determinista dentro del subconjunto empatado;
- ningún perfil aprende `A/B/C/D` u otros IDs opacos para inflar cobertura;
- choice eligibility se hereda únicamente de `scheduled.event` del scheduler productivo.

La deuda 34+ de tags opacos se reporta como `vocabularyDebt.opaqueChoiceIdIntentTags` y fue entregada al owner canónico.

## Diseño de muestra: paired profile seeds

`samplingDesign = paired_profile_seed_v1`.

Cada cohorte ejecuta los 15 perfiles con exactamente la misma seed RNG:

- 15 = 1 seed × 15 perfiles;
- 150 = 10 seeds × 15;
- 1.500 = 100 seeds × 15;
- 9.990 = 666 seeds × 15;
- 10.005 = 667 seeds × 15.

`T6_TOTAL_RUNS` debe ser múltiplo de 15. El sharding se asigna por cohorte completa, no por carrera. Los merges conservan `globalIndex`, `cohortIndex` y muestra exacta `profile:seed`.

Cohortes incompletas o duplicadas se conservan como evidencia pero se excluyen de estadísticas pareadas y generan `paired_cohort_incomplete` (`qa/tooling`).

## Métricas

Por carrera y agregadas se registran: cierre, retirada, edad final, días, decisiones, secuencia reproducible de eventos/elecciones/outcomes, cobertura y reach-rate, occurrence-rate, densidad, gaps narrativos, candidate pool, semantic score/fallback, lifecycle de seeds, epílogos, anomalías estructurales, firmas, concentración de elecciones, scheduler exposure y telemetría de mercado.

### Divergencia pareada

Dentro de cada misma seed se mide: firmas únicas, Jaccard de eventos/elecciones/epílogos, spread de edad de retirada y desacuerdo de tipo de cierre. La magnitud es descriptiva; más o menos divergencia no recibe automáticamente valoración positiva/negativa.

## Observabilidad de mercado

La infraestructura T6 registra, sin modificar el motor:

- decisiones de mercado por carrera y ratio mercado/narrativa;
- distribución por perfil y tramo de edad;
- decisiones por `offer.reason` y acción;
- aceptadas/rechazadas;
- IDs de oferta únicos/duplicados;
- fechas de oferta únicas;
- máximo de decisiones en una misma fecha;
- primera/última fecha de oferta.

`market_cadence_review` es solo señal de revisión. Defaults: al menos 30 carreras observadas, ejemplo >= 50 decisiones y ejemplo >= 10× la mediana. El smoke de 15 no puede disparar esta señal por defecto.

### Issue #70

Una muestra T5 previa observó `loyal / seed 512000 / marketDecisions=484`, frente a 6–14 en las otras ocho carreras. Se abrió issue #70 para reproducción dirigida.

La hipótesis estática principal es retry de renovaciones tras rechazo: contrato en 0–5 meses, evaluación semanal, probabilidad de renovación hasta 0.68, rechazo que limpia `pending` pero conserva el contrato viejo y ausencia de cooldown/last-renewal guard. El orden de magnitud `14 años × 52 semanas × 0.68 ≈ 495` es compatible con 484, pero no demuestra causalidad ni constituye un veredicto de balance. QA/owner debe confirmar distribución por `reason` y decidir cualquier regla productiva.

## Reglas de interpretación

1. Cero cobertura en muestra pequeña no prueba contenido muerto.
2. Frecuencia baja/alta no es automáticamente incorrecta.
3. Umbrales son filtros de revisión, no canon.
4. Conservar denominadores y tamaño de muestra.
5. Comparaciones causales razonables usan la misma muestra `profile:seed`.
6. No consumir RNG adicional para instrumentación.
7. No mutar `GameState` fuera del flujo normal.
8. Fallback alto no se arregla con IDs concretos.
9. Occurrence-rate y career reach-rate son métricas distintas.
10. Igual número de escenas no implica mismo catálogo; conservar fingerprint + IDs.
11. Diferentes `samplingDesign` no son equivalentes.
12. Divergencia pareada no se interpreta con cohortes inválidas.
13. Señales de mercado/elecciones/cierre son handoffs descriptivos hasta reproducción suficiente.

## Herramientas

- `t6-profiles.mjs` / `test-t6-profiles.mjs`
- `t6-profile-audit.mjs`
- `t6-profile-diversity-core.mjs` / `t6-profile-diversity.mjs` / `test-t6-profile-diversity.mjs`
- `t6-run-plan.mjs` / `test-t6-run-plan.mjs`
- `t6-sim.mjs`
- `t6-metrics.mjs` / `test-t6-metrics.mjs`
- `t6-paired-metrics.mjs` / `test-t6-paired-metrics.mjs`
- `t6-market-metrics.mjs` / `test-t6-market-metrics.mjs`
- `t6-market-comparison-core.mjs` / `t6-market-compare.mjs` / `test-t6-market-comparison.mjs`
- `t6-market-telemetry.mjs` / `test-t6-market-telemetry.mjs`
- `t6-merge-reports.mjs`
- `t6-report-utils.mjs` / `test-t6-report-utils.mjs`
- `t6-compare-reports.mjs`
- `t6-diagnostics-core.mjs` / `t6-diagnose-report.mjs` / `test-t6-diagnostics.mjs`
- `test-t6-choice-eligibility.mjs`

## Escalado

1. smoke: 15 carreras;
2. diagnóstico: 150;
3. medio: 1.500;
4. candidata: 9.990 o 10.005, shardeable, fuera del CI normal.

No interpretar rare/missing coverage ni cadencia de mercado a partir del smoke.

## Pendiente antes de cerrar T6.1

1. Repository Integrity verde en el HEAD exacto final de esta pasada.
2. Ejecutar suite pura T6 completa en un checkout-capable runner, incluida la regresión de eligibility.
3. Ejecutar auditoría compilada de vocabulario.
4. Ejecutar auditoría compilada de diversidad.
5. Ejecutar smoke pareado 1 seed × 15 perfiles.
6. Diagnosticar smoke solo como plumbing/reproducción.
7. Ejecutar >=150 carreras antes de interpretar distribuciones.
8. Re-medir issue #70 con telemetría por razón/tramo.
9. Mantener 1.500/~10k fuera de CI normal.
10. No acreditar T6 oficial hasta que T5 entregue candidata apta para alfa.

## Relación con QA T5

`qa-t5-sim.mjs` sigue siendo gate adversarial T5. T6 no sustituye sus criterios. Cuando T6 encuentra una señal técnica reproducible, la entrega a QA/owner; cuando encuentra una distribución, la presenta como evidencia para revisión humana.
