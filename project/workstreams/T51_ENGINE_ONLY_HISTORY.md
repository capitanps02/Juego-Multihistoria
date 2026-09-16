# T5.1 — ENGINE_ONLY_HISTORY

## Estado

`ENGINE_ONLY_HISTORY` no necesita un segundo subsistema de migración.

El contrato queda absorbido por la infraestructura `T51_CONTENT_MIGRATION` / Session v3 ya integrada en `main`:

- `contentIdentity` estricto para el catálogo activo;
- `decisionProvenance` por decisión;
- definición completa y fingerprint de una escena pendiente legacy;
- rutas de migración explícitas;
- historial/journal legacy validables aunque su `eventId` ya no exista en `EventIndex`;
- el catálogo legacy sirve para evidencia/compatibilidad, nunca para scheduling.

## Semántica certificada

Cuando una escena técnica deja el catálogo activo:

1. su historial ya resuelto permanece literal;
2. su journal no se reescribe;
3. su provenance sigue apuntando al catálogo que realmente la produjo;
4. el ID retirado no vuelve a entrar en `EventIndex`;
5. una escena legacy ya presentada y pendiente conserva exactamente la definición que vio el jugador;
6. esa escena pendiente puede resolverse después de migrar aunque su ID sea source-only;
7. al terminar, la programación continúa exclusivamente con el catálogo activo;
8. la migración por sí sola no consume RNG, no resuelve la escena y no fabrica `SEEN` canónico;
9. seeds, NPC, mercado, receipts, revisión y estado factual se conservan salvo mappings explícitamente aprobados;
10. un origen de seed legacy no se renombra por similitud de IDs.

## Cobertura previa reutilizada

`scripts/test-t51-content-migration.mjs` ya cubría, entre otros:

- colisión exact-ID y liberación de suppressión canónica;
- pending exact-ID congelado;
- evento técnico retirado ya resuelto, presente en history pero ausente del scheduler activo;
- mixed legacy/current history;
- tampering de pending legacy;
- preservación de seeds/NPC/market/receipts/RNG;
- replay idempotente de receipts.

## Gap certificado en esta pasada

Se añade un caso dirigido que combina las dos fronteras más delicadas:

**pending legacy + evento source-only retirado**.

El test exige que:

- la migración cambie al catálogo destino sin alterar RNG;
- `pendingDecision.event` siga siendo byte-semánticamente la definición legacy mostrada;
- la provenance pendiente permanezca en `PRE_T51_CONTENT_IDENTITY`;
- el ID retirado no exista en el `EventIndex` destino;
- la decisión pueda resolverse usando la definición congelada;
- history y decisionProvenance registren el ID/origen legacy real;
- tras acknowledge/continue, el ID retirado no pueda reaparecer.

## Límites

- no se añade runtime nuevo;
- no se modifica `GameSession`, `content-migration.ts` ni el save schema;
- no se autoriza ningún alias o equivalencia semántica;
- retirar IDs concretos sigue siendo responsabilidad del owner canónico y de su ruta de migración;
- los mappings de seeds solo pueden existir con evidencia explícita.

## Criterio de cierre

S4 puede cerrarse cuando el test dirigido de pending source-only y `Repository integrity` estén verdes sobre el `main` vigente. A partir de ahí, los workstreams canónicos pueden retirar eventos técnicos usando el contrato oficial de Session v3 sin mantener definiciones legacy schedulables.
