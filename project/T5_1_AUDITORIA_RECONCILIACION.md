# T5.1 · auditoría de reconciliación e identidad

## Estado

En curso. T4.7 y T4.8 quedan omitidas por decisión de alcance; el trabajo continúa por la vía técnica de contenido.

## Resultado de la auditoría

La fuente conserva 254 eventos principales. El motor también contiene 254 principales y 134 condicionales, pero la igualdad de conteos no demuestra equivalencia semántica.

- 167 principales tienen el mismo ID literal.
- 87 principales no tienen correspondencia aprobada.
- Solo 7 de esos 87 presentan una coincidencia exacta de título con otro evento del motor; ninguna es ambigua.
- Los 134 condicionales quedan explícitamente como `count_only_not_semantically_reconciled` porque el inventario canónico de sus IDs no está disponible en la auditoría actual.
- No se registra ningún alias automático.

El informe completo y reproducible está en [`analysis/2026-09-15/T5.1-reconciliation.json`](../analysis/2026-09-15/T5.1-reconciliation.json). Se genera con `npm run audit:t51` —o con el runtime local equivalente si `npm` no está disponible— y la prueba es `npm run test:t51`.

## Regla de identidad

Una coincidencia de título, edad o tema no cambia la identidad de un evento. Un alias solo podrá añadirse junto con revisión semántica explícita de disparador, información visible, incertidumbre, opciones, consecuencias, memoria y continuidad de guardados. Hasta entonces, el ID canónico permanece sin resolver y no se presenta como reconciliado.

Siguiente trabajo: resolver por lotes los 87 casos con fichas de fuente y pruebas de migración; después construir el inventario canónico de condicionales.
