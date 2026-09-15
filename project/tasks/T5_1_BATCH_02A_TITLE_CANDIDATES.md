# T5.1 · Batch 02A · candidatos por título 26–30

Issue: #4

## Objetivo

Resolver los tres únicos casos de la fase `26_30` en los que la auditoría T5.1 encontró un evento técnico con exactamente el mismo título que un evento canónico ausente.

La coincidencia de título **no** se acepta como alias. Los tres casos se consideran adaptaciones técnicas de la misma idea que necesitan reparación semántica, cambio al ID/edad canónicos y migración explícita de metadata/seeds.

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

### Decisión

`same_scene_concept_requires_semantic_rewrite_and_id_migration`

No conservar el evento técnico como alias. Implementar el canónico explícitamente y mover la metadata de `SEED_SECOND_STAR` a `EVT_27_STAR_001`, con ventana desde 27. El histórico `SEEN_EVT_28_TEAM_001` no debe convertirse automáticamente en `SEEN_EVT_27_STAR_001`.

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

### Decisión

`same_scene_concept_requires_semantic_rewrite_and_id_migration`

El `verified:true` actual no es suficiente y debe desaparecer junto con la adaptación técnica o quedar degradado hasta que la escena canónica esté realmente revisada. Implementar `EVT_27_AWARD_001` explícitamente y mover origen/ventana del seed a edad 27. No convertir flags históricos de seen entre ambos IDs.

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
- Seed: `SEED_WEALTHY_PEAK_EXIT`, creado únicamente con choice A mediante `seedChoices:["A"]`.
- Gate: `reputation.marketHeat >= 55`.
- Labels técnicos:
  1. aceptar y salir del máximo escaparate;
  2. rechazar para mantener nivel competitivo;
  3. negociar estructura que preserve salida futura;
  4. no cerrar nada todavía.
- Marcado `verified:true`.
- `SEED_WEALTHY_PEAK_EXIT` está catalogado con origen `EVT_29_MKT_001` y ventana desde 29.
- El seed tiene dependencias reales: condicionales de 29 y `state30-classifier.ts` consultan `HAS_SEED_WEALTHY_PEAK_EXIT`.

### Decisión

`close_semantic_precursor_requires_rewrite_and_id_migration`

Es el candidato más próximo, pero no un alias directo: edad, trigger, opción D, memoria secundaria y contexto visible/oculto divergen. Implementar `EVT_28_RICH_001` explícitamente. Actualizar el catálogo para que `SEED_WEALTHY_PEAK_EXIT` nazca desde 28 y verificar que los consumidores posteriores siguen funcionando determinísticamente.

## Regla común de migración

Para los tres casos:

- retirar el ID técnico del conjunto principal una vez integrado el canónico;
- conservar registros históricos del ID antiguo como historia técnica válida;
- no traducir `SEEN_old` a `SEEN_new` salvo equivalencia semántica total (no aprobada aquí);
- actualizar `originEvents`/`ageWindow` de seeds;
- mantener las dependencias aguas abajo por seed, no por ID técnico;
- cambiar `canonStatus` a `verified` solo después de comparar la definición final con la ficha canónica campo por campo.

## Pruebas necesarias

1. Cada ID canónico nuevo existe exactamente una vez y el técnico retirado no está en el catálogo principal activo.
2. Elecciones, visible/uncertain y seeds coinciden con la fuente.
3. `SEED_SECOND_STAR` puede originarse a los 27.
4. `SEED_GLOBAL_AWARD_BEHAVIOR` puede originarse a los 27.
5. `SEED_WEALTHY_PEAK_EXIT` puede originarse a los 28 y sus consumidores de edad 29/30 siguen reaccionando correctamente.
6. La misma seed de partida sigue siendo determinista tras la migración de contenido dentro de la nueva versión.
7. Saves anteriores no se reinterpretan como si hubieran jugado la escena canónica nueva.
8. `npm run build`, `npm run validate`, `npm run test:session`, `npm run test:saves`, `npm run audit:t51`, `npm run test:t51`.

## Fuera de alcance

Los otros 23 IDs canónicos ausentes de la fase `26_30`; se prepararán en sublotes posteriores agrupados por arco/seed.
