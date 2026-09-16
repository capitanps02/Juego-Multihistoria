# T5.3 — Provenance-safe protagonist contact introductions

## Objetivo

Cerrar el guard de evolución T5-QA-014 documentado en issue #53 sin cambiar el significado actual de los contactos públicos.

El contrato de #45 ya separa correctamente:

- los 20 NPC persistentes del motor;
- los NPC que el protagonista conoce;
- conocimiento privado, relaciones, access, seeds y `npcRefs` de una introducción pública.

El hueco restante era histórico: `knownPlayerContactIds(state)` reconstruía introducciones usando solo `history.eventId/choiceId/outcomeId`. Una futura exact-ID semantic collision podía hacer que una decisión legacy activase una regla de introducción perteneciente a una definición nueva.

## Política de provenance por regla

Cada `PlayerContactRule` debe declarar obligatoriamente una de dos políticas:

### `invariant`

La introducción tiene la misma semántica en todas las fuentes de contenido soportadas.

No es una etiqueta gratuita: QA compara el fingerprint del evento activo con el de todas las fuentes históricas registradas que contienen ese evento. Si una futura generación cambia la definición, el test falla y obliga a retirar `invariant`.

El único piloto actual:

`EVT_18_PRE_001 / CALL_RIVAS -> NPC_ACA_01`

permanece `invariant` mientras ese ratchet siga verde.

### `exact_sources`

La regla solo puede activarse cuando la fila 1:1 de `decisionProvenance` coincide exactamente en:

- `sourceContentIdentity`;
- `eventFingerprint`.

Sin provenance, con identidad distinta o con fingerprint distinto, la regla falla cerrado aunque `eventId/choiceId/outcomeId` sean idénticos.

## Adaptador de sesión

`getKnownPlayerContacts(session)` pasa ahora conjuntamente:

- `snapshot.state.history`;
- `snapshot.decisionProvenance`.

Por tanto las futuras reglas source-bound pueden reconstruirse correctamente después de save/resume y migraciones de contenido.

Las funciones core conservan el parámetro de provenance opcional para compatibilidad. Una regla `invariant` puede seguir reconstruirse desde un `GameState` puro; una regla `exact_sources` nunca se activa sin evidencia de provenance.

## Privacidad e invariantes

Sin cambios:

- no se infieren contactos desde knowledge privado;
- no se infieren desde relaciones, trust, access, seeds o `npcRefs`;
- la proyección pública sigue siendo solo `{id,name,role}`;
- leer contactos consume 0 RNG y no muta estado;
- no cambia save schema;
- no cambia `EVENTS` ni `contentIdentity`;
- no reescribe history ni decisionProvenance.

## PlayerView legacy

`PlayerView.contacts` legacy no se modifica en esta pasada. #45 dejó explícitamente esa superficie para compatibilidad mientras presentación migraba al adaptador seguro, y PR #14 ya consume dicho adaptador. Este hardening protege el adaptador y su expansión futura.

## QA

`scripts/test-t53-contacts.mjs` pasa de 7 a 10 invariantes e incorpora:

1. todas las reglas declaran política de provenance;
2. `exact_sources` exige identity + fingerprint exactos y falla cerrado sin provenance;
3. todo `invariant` conserva fingerprint entre fuentes legacy soportadas y catálogo activo;
4. una sesión real `CALL_RIVAS` conserva la introducción mediante `decisionProvenance` tras resume, sin RNG drift.
