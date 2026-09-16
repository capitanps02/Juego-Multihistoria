# T5.1 · Batch 02A · candidatos por título 26–30

Issue: #4

## Objetivo

Resolver los tres únicos casos de la fase `26_30` en los que la auditoría T5.1 encontró un evento técnico con exactamente el mismo título que un evento canónico ausente.

La coincidencia de título **no** se acepta como alias. Los tres casos son adaptaciones técnicas de una idea relacionada que necesitan escena canónica explícita, retirada del ID técnico del catálogo activo y migración controlada de metadata de seeds.

Vocabulario de crosswalk T5.1 para los tres IDs técnicos:

`retire_technical_keep_history_only`

Esto significa:
- el ID técnico se retira del catálogo principal activo una vez integrado el canónico;
- el historial ya jugado conserva el ID técnico;
- un pending técnico no se sustituye directamente por el canónico;
- no se traduce `SEEN_old` a `SEEN_canonical`;
- el origen **futuro** de la seed en catálogo sí se mueve a la escena canónica;
- mover metadata de catálogo no autoriza reescribir `seed.originEvent` histórico sin una regla de migración revisada.

## 1. Dos estrellas, un foco

### Canon

- ID: `EVT_27_STAR_001`
- Edad: 27
- Ventana/disparador: mundo elite/project face + otra estrella plausible.
- Visible: roles declarados y propuesta comercial.
- Incertidumbre: jerarquía que impondrá el técnico y reacción de afición a la comparación.
- Estado relevante: `PROJECT_FACE`, `EGO`, `PUBLIC_MYTH`, `STAR_COMPETITION`.
- Opciones:
  1. abrazar la dupla públicamente;
  2. separar marca y competir solo en campo;
  3. pedir reparto claro de penaltis/balón parado;
  4. no discutir jerarquía y dejar que el rendimiento decida.
- Memoria: crear `SEED_SECOND_STAR`; conectar con `SEED_PENALTY_HIERARCHY`.

### Adaptación técnica actual

- ID: `EVT_28_TEAM_001`
- Edad: 28
- Título idéntico.
- Seed: `SEED_SECOND_STAR`.
- Gate: `professional.clubPrestigeTier >= 4`.
- Usa las cuatro decisiones genéricas de `make(row)` para familia `team`.
- `SEED_SECOND_STAR` figura en catálogo con `originEvents:["EVT_28_TEAM_001"]` y `ageWindow:[28,36]`.

### Decisión final de planning

Legacy disposition: `retire_technical_keep_history_only`.

No hay equivalencia de escena suficiente para migrar historial/pending. Implementar `EVT_27_STAR_001` explícitamente y mover la metadata futura de `SEED_SECOND_STAR` al origen canónico, con ventana desde 27.

## 2. La gala

### Canon

- ID: `EVT_27_AWARD_001`
- Edad: 27
- Trigger: puerta de premio superada.
- Visible: nominados, logros públicos y preguntas.
- Incertidumbre: votación y reacción del vestuario a una campaña individual.
- Estado relevante: `PEAK_STATUS`, `PUBLIC_MYTH`, `LOCKER_POWER`, `RECORD_DRIVE`.
- Opciones:
  1. defender abiertamente la candidatura;
  2. priorizar mérito del equipo;
  3. elogiar al compañero y señalar tus números;
  4. rechazar entrevista.
- La victoria/derrota del premio es independiente de la respuesta.
- Memoria: crear `SEED_GLOBAL_AWARD_BEHAVIOR`; relacionar con `SEED_RECORD_CHASE`.

### Adaptación técnica actual

- ID: `EVT_28_GALA_001`
- Edad: 28
- Título idéntico.
- Seed: `SEED_GLOBAL_AWARD_BEHAVIOR`.
- Gates: `peakStatus >= 58` y `publicMyth >= 45`.
- Marcado actualmente `verified:true`.
- Aun así usa decisiones, mensajes y efectos genéricos de familia `image`.
- `SEED_GLOBAL_AWARD_BEHAVIOR` figura en catálogo con `originEvents:["EVT_28_GALA_001"]` y `ageWindow:[28,null]`.

### Decisión final de planning

Legacy disposition: `retire_technical_keep_history_only`.

El `verified:true` técnico no prueba fidelidad. Implementar `EVT_27_AWARD_001` explícitamente, mover el origen/ventana futura de la seed a edad 27 y conservar cualquier historia/pending técnico como contenido legacy.

## 3. La oferta financieramente absurda

### Canon

- ID: `EVT_28_RICH_001`
- Edad: 28
- Trigger: `WEALTHY_EXIT` gate + mercado.
- Visible: dinero, duración, ciudad, competiciones y cláusulas.
- Incertidumbre: impacto en selección, marca y posibilidad de volver al máximo nivel.
- Estado relevante: `TROPHY_HUNGER`, `WEALTHY_EXIT`, `NT_STANDING`, familia y `LEGACY_PRESSURE`.
- Opciones:
  1. aceptar;
  2. rechazar por nivel deportivo;
  3. pedir contrato corto;
  4. usar la oferta para subir salario en Europa/entorno principal.
- Memoria: crear `SEED_WEALTHY_PEAK_EXIT`; conectar con `SEED_WEALTHY_EXIT`.

### Adaptación técnica actual

- ID: `EVT_29_MKT_001`
- Edad: 29
- Título idéntico.
- Seed: `SEED_WEALTHY_PEAK_EXIT`, creado únicamente con choice A.
- Gate: `reputation.marketHeat >= 55`.
- Labels técnicos difieren en C/D del contrato canónico.
- Marcado `verified:true`.
- La seed tiene consumidores reales en condicionales de 29 y `state30-classifier.ts`.

### Decisión final de planning

Legacy disposition: `retire_technical_keep_history_only`.

Es el precursor más próximo, pero edad, trigger, información y opciones no son equivalentes. Implementar `EVT_28_RICH_001` explícitamente, mover el origen futuro de `SEED_WEALTHY_PEAK_EXIT` a edad 28 y conservar determinísticamente sus consumidores posteriores.

## Regla común de migración

Para los tres casos:

- retirar el ID técnico del conjunto principal activo una vez integrado el canónico;
- conservar registros históricos del ID antiguo como verdad de lo jugado;
- no traducir `SEEN_old` a `SEEN_new`;
- no sustituir pending técnico por la nueva escena canónica;
- resolver pending legacy mediante compatibilidad de contenido o fallar explícitamente si la identidad fuente no es compatible;
- actualizar `originEvents`/`ageWindow` de seeds para **contenido futuro**;
- no reescribir `seed.originEvent` histórico solo por coincidencia de concepto/título;
- mantener dependencias aguas abajo por seed, no por ID técnico;
- cambiar `canonStatus` a `verified` solo después de comparar la definición canónica final campo por campo.

## Pruebas necesarias

1. Cada ID canónico nuevo existe exactamente una vez y el técnico retirado no está en el catálogo principal activo.
2. Elecciones, visible/uncertain y seeds coinciden con la fuente.
3. `SEED_SECOND_STAR` puede originarse a los 27.
4. `SEED_GLOBAL_AWARD_BEHAVIOR` puede originarse a los 27.
5. `SEED_WEALTHY_PEAK_EXIT` puede originarse a los 28 y sus consumidores de edad 29/30 siguen reaccionando correctamente.
6. La misma seed de partida sigue siendo determinista tras la migración de contenido dentro de la nueva versión.
7. Saves anteriores no se reinterpretan como si hubieran jugado la escena canónica nueva.
8. Pending legacy conserva exactamente su contrato de decisión o falla compatibilidad explícitamente.
9. `npm run build`, `npm run validate`, `npm run test:session`, `npm run test:saves`, `npm run audit:t51`, `npm run test:t51`.

## Fuera de alcance

Los otros IDs canónicos ausentes de la fase `26_30`; se preparan en sublotes posteriores agrupados por arco/seed.
