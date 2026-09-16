# T5.2 — polaridad de condiciones `HAS_SEED_*`

Estado: corrección dirigida de T5-QA-012 / issue #57.

## Problema

El auditor de consecuencias diferidas trataba cualquier condición cuyo `path` fuera `flags.HAS_SEED_*` como consumidor positivo. Eso era correcto para requisitos de presencia, pero incorrecto para requisitos de ausencia: producir una seed puede bloquear una ruta en vez de habilitarla.

## Contrato

Para cada condición booleana `HAS_SEED_*`, el auditor evalúa el mismo comparador con presencia `true` y ausencia `false`:

- **positive**: pasa con `true` y falla con `false`; puede crear un edge productor→consumidor;
- **negative**: falla con `true` y pasa con `false`; se registra como dependencia de supresión y nunca crea un edge positivo;
- **neutral**: ambos valores pasan o ambos fallan; se conserva como dependencia observada, pero no prueba consumo positivo.

La clasificación reutiliza la semántica de comparadores del motor (`eq`, `neq`, `in`, `notIn`, `exists`, etc.) sin coerciones booleano→número.

## Superficies cubiertas

La misma polaridad se aplica a condiciones `HAS_SEED_*` en:

- `event.gates`;
- `event.exclusions`;
- cada ruta de `event.gateAlternatives`;
- `choice.eligibility`;
- `outcome.conditions`;
- `modifier.conditions`.

Las transiciones `resolve` / `expire` continúan siendo consumidores positivos explícitos.

## Invariantes QA

- `eq true`, `neq false`, `in [true]`, `notIn [false]` son positivos;
- `eq false`, `neq true`, `in [false]`, `notIn [true]` son negativos;
- comparadores que no distinguen presencia de ausencia no generan edge positivo;
- una dependencia negativa declarada en `seedsRead` no se degrada a `metadataOnlyReader`;
- una dependencia negativa dentro de `gateAlternatives` conserva exactamente la misma semántica;
- el hard gate de factibilidad temporal usa únicamente consumidores positivos.

## Límites

Este cambio no modifica scheduler, resolver, lifecycle de seeds, contenido canónico, saves, `contentIdentity`, RNG ni conocimiento NPC. Solo corrige la interpretación estática del auditor T5.2.
