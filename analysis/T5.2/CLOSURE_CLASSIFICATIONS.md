# T5.2 — Clasificaciones canónicas de cierre de seeds

Fecha: 2026-09-16

## Principio

`closure-readiness` aporta evidencia estructural. La decisión final de que una seed está canónicamente cerrada pertenece al owner de su bloque y **nunca** se deduce automáticamente de una métrica.

El registro persistente es:

`analysis/T5.2/seed-closure-classifications.json`

Empieza vacío. Añadir una fila es una afirmación canónica explícita y debe viajar junto con evidencia revisable.

## Disposiciones permitidas

### `canonical_chain`

La seed posee una cadena productor→consumer/cierre canónica.

Requisitos automáticos:

- owner exacto según `seed-handoff.json`;
- `producerEventId` y `consumerEventId` explícitos;
- ambos endpoints deben tener `canonStatus: verified`;
- la pareja debe ser temporalmente viable en `deferred-consequences`;
- rationale y `evidenceRefs` no vacíos.

Una escena `technical_adaptation` no puede certificar esta disposición.

### `intentional_persistent`

La seed representa una memoria que deliberadamente permanece abierta.

Requisitos automáticos:

- la evidencia lifecycle debe marcarla `openEndedWithoutTerminalTransition`;
- rationale canónica explícita;
- al menos una referencia de evidencia.

Esto evita convertir accidentalmente la ausencia de consumer en diseño intencional.

### `canonical_expiry`

La seed se cierra por una política de expiración canónica.

`expiryBasis` debe ser exactamente uno de:

- `age` — solo si existe age window finita;
- `date` — solo si runtime asigna expiry explícito;
- `club` — solo si la seed es `origin_club` **y existe una prueba de scope registrada**;
- `season` — solo si la seed es `origin_season` **y existe una prueba de scope registrada**.

El registry no puede inventar un basis que el runtime no implemente. Además, el simple metadato `origin_club` / `origin_season` no demuestra por sí solo continuidad causal: las clasificaciones `club`/`season` fallan con `canonical_expiry_scope_proof_required` hasta que exista evidencia de scope registrada.

El audit real consume por defecto `SEED_SCOPE_PROOFS` desde `scripts/t52-seed-scope-proofs.mjs`, integrado en `main` mediante el workstream de scope proofs. Esto permite usar pruebas runtime reales sin relajar el guard. A fecha de esta revisión existe una prueba integrada para `SEED_PRIVATE_CHAT` con scope `origin_club`; esa evidencia habilita la validación técnica del basis `club`, pero **no** clasifica la seed por sí sola. El owner canónico sigue teniendo que añadir una entrada explícita y justificable al registry de clasificaciones.

La API del validator conserva `scopeProofs` inyectables para tests y futuras composiciones; pasar una lista vacía demuestra que el simple scope metadata sigue siendo insuficiente.

La suite mantiene ambos lados del contrato: una clasificación `club` sin proof explícito falla cerrado, mientras que `SEED_PRIVATE_CHAT` puede validar técnicamente ese basis cuando `buildClosureReadinessReport()` consume el registry integrado por defecto. Ninguna de esas pruebas crea una clasificación real en `seed-closure-classifications.json`.

### `retired_compatible`

La identidad se retira/depreca preservando compatibilidad con saves/history/provenance.

El validador inicial es deliberadamente conservador:

- la seed debe estar `unwired` en el catálogo activo;
- se requieren al menos dos `evidenceRefs`, de forma que exista evidencia tanto de decisión canónica como de compatibilidad/migración.

Casos más complejos deben ampliar primero el contrato de validación; no se relaja el guard por excepción manual.

## Campos comunes

Cada entrada exige:

- `seedId`;
- `owner` exacto;
- `disposition`;
- `rationale` sustantiva;
- `evidenceRefs` no vacíos.

Ejemplo documental — no añadirlo al registry salvo que el owner lo apruebe realmente:

```json
{
  "seedId": "SEED_EXAMPLE",
  "owner": "t51/canon-example",
  "disposition": "canonical_chain",
  "producerEventId": "EVT_EXAMPLE_A",
  "consumerEventId": "CEVT_EXAMPLE_B",
  "rationale": "El owner certifica que B es la consecuencia canónica diferida de A.",
  "evidenceRefs": ["analysis/T5.1/example-audit.json#SEED_EXAMPLE"]
}
```

## Fail-closed

Una entrada invalida `structuralPass` si:

- la seed no existe;
- el owner no coincide;
- hay duplicados;
- la disposición no está soportada;
- falta rationale/evidencia;
- una `canonical_chain` no coincide con una pareja verified viable;
- una persistencia no es realmente open-ended;
- un expiry usa un basis no implementado;
- un expiry `club`/`season` carece de prueba de scope registrada;
- un retiro no está unwired o carece de evidencia mínima.

## Progreso

`closure-readiness.json` calcula dinámicamente:

- `canonicalClosureClassified`;
- `canonicalClosurePending`;
- `ownerSummary.*.closureClassified`;
- `canonicalClosureComplete`;
- `integratedScopeProofs`.

El gate estructural puede permanecer verde con clasificaciones pendientes. `canonicalClosureComplete=true` solo será posible cuando las 210 seeds tengan una entrada válida.

Este mecanismo permite progreso incremental sin confundir ausencia de errores técnicos con cierre canónico.
