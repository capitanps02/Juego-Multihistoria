# T5.1 · Contrato compartido: elegibilidad por opción

**Rama:** `integration/t51-shared-contracts`  
**Propiedad:** coordinación/integración; no sustituye los workstreams canónicos por edades.  
**Objetivo:** resolver el bloqueo transversal `CHOICE_ELIGIBILITY` sin duplicar los contratos de migración, seeds o conocimiento ya integrados en `main`.

## Principios

- No modificar contenido canónico que pertenezca a otro workstream.
- No relajar `contentIdentity`, saves ni gates para hacer pasar una implementación.
- Mantener compatibilidad por defecto con contenido histórico.
- Integrarse con T5.2 seed lifecycle y T5.3 NPC knowledge sin sustituir su lógica.

## S1 · Choice eligibility

Estado: **implementado; pendiente únicamente del gate final de integración del PR**.

Problema resuelto: algunas decisiones canónicas solo deben existir cuando hay una alternativa real. Ejemplos de consumidores posteriores: cesión, traspaso o petición de salida condicionadas por estado de mercado/club.

Implementación:

- `src/narrative/choice-eligibility.ts` añade `eligibility` como extensión aditiva sobre `ChoiceDefinition`.
- Una opción sin `eligibility` conserva exactamente el comportamiento histórico.
- El scheduler mantiene todos los gates existentes, incluidos los requisitos de conocimiento T5.3, y además descarta una escena si no queda ninguna opción elegible.
- La escena entregada a sesión/UI/simulación contiene únicamente las opciones válidas para ese estado.
- La definición canónica original no se muta.
- `ambiguousEvent()` propaga `eligibility` para el contenido 18–20 sin obligar a usarla.
- No se consume RNG adicional para calcular disponibilidad.

Cobertura dirigida: `scripts/test-t51-shared-contracts.mjs`.

Casos:

1. una opción imposible queda oculta;
2. aparece cuando existe su causa;
3. una escena sin opciones seleccionables no se agenda;
4. contenido histórico sin `eligibility` sigue igual;
5. el helper 18–20 conserva el contrato.

## S2 · SESSION_CONTENT_MIGRATION

**No pertenece ya a este PR.** Durante el desarrollo, `main` integró el contrato oficial en `a4a4c8df98bb1a3e88d9a7e0a19b48571af99074` (`T5.1: integrate contentIdentity migration on consolidated T5`).

Ese runtime oficial incorpora Session v3, fingerprint/provenance por decisión, pending legacy congelado, rutas de migración explícitas, compatibilidad con mixed history y protección de `SEEN`/cooldown en colisiones semánticas. Para evitar dos fuentes de verdad, la implementación experimental S2 de esta rama fue retirada del árbol final.

## S3 · siguiente hueco transversal

### OR gates / facts causales

Bloqueo conocido: el contrato histórico `Condition[]` es AND-only, mientras varias escenas canónicas admiten rutas causales alternativas.

Casos ya identificados por el workstream 18–23:

- `EVT_18_PRS_002`;
- `CEVT_19_SOCIAL_01`;
- `CEVT_21_MEDIA_01`.

La siguiente pasada debe resolver `A OR B` de forma explícita, auditable, determinista y compatible con T5.2/T5.3. No debe aproximarse como `A AND B` ni ensanchar la escena incondicionalmente.

## S4 · ENGINE_ONLY_HISTORY

El runtime oficial de migración ya cubre buena parte de este problema mediante provenance y rutas. Antes de abrir trabajo adicional se debe auditar qué deuda permanece realmente fuera de `T51_CONTENT_MIGRATION` para no duplicarla.

## Estado de pasadas

La previsión se recalcula contra el plan global y el progreso paralelo de otros equipos; no se descuenta una pasada hasta que el cambio correspondiente tiene gate verde sobre el `main` vigente.
