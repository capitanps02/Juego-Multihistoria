# Codex implementation queue — Canon 30–34

Estado re-grounded sobre `main@06762a0557c4e92b189e52151c71d6c1af831ee5`.

Este documento no convierte blockers en hechos. Si una autoridad compartida devuelve `null` / `unavailable`, Codex debe fallar cerrado y dejar la escena bloqueada.

## Ya implementado y protegido

### EVT_30_CON_001 — renovación

Trigger autoritativo ya implementado:

- `contract.monthsRemaining <= 18`
- **OR** `facts.clubWantsRenewal === true`

No volver a introducir proxies de intención del club. La escena sigue `technical_adaptation`: tener trigger correcto no demuestra identidad canónica completa ni continuidad de save.

### CareerOffer / contrato

El catálogo activo 30–34 aplica un guard que elimina efectos narrativos sobre estado propiedad de `CareerOffer/respondToOffer`:

- `club`;
- `tier`;
- `world.ownerClub`;
- `professional.ownerClub`;
- `professional.registrationClub`;
- `professional.leagueTier`;
- `professional.clubPrestigeTier`;
- `professional.clubPrestigeScore`;
- `professional.route`;
- `contract.*`;
- `ABROAD_ROUTE`;
- `LOAN_ACTIVE`;
- `BIG_CLUB`.

Tres escenas consumen ya una `CareerOffer` formal mediante `offerBridge`:

1. `EVT_31_HOME_001` — solo cuando `market.pending.terms.club === "UDV"`.
2. `EVT_32_HOME_001` — solo cuando `market.pending.terms.club === "UDV"`.
3. `EVT_32_CON_001` — solo `reason === "Renovación de contrato"` y `terms.months === 12`.

Tests focales deben conservar casos positivos y negativos para impedir que una oferta distinta sea capturada por estas escenas.

## Tareas Codex ejecutables ahora

### C30-34-CODEX-001 — mantener authority guard

Objetivo: impedir regresiones donde contenido 30–34 vuelva a firmar, transferir, prestar o renovar mediante `Effect` narrativo.

Archivos permitidos:

- `src/content/events/30_34/**`;
- `scripts/test-t51-30-34-*.mjs`.

Aceptación:

- ningún evento activo `phase === "30_34"` contiene efectos sobre las rutas/flags authority-owned listadas arriba;
- las escenas que necesiten un cambio contractual usan una oferta formal o permanecen sin mutar contrato/club.

### C30-34-CODEX-002 — endurecer bridges sin ampliar autoridad

Objetivo: ampliar pruebas de elegibilidad, provenance y save/restore de los tres bridges ya introducidos.

Reglas:

- una oferta de otro club no puede activar escenas UDV;
- una renovación que no sea anual no puede activar `EVT_32_CON_001`;
- `counter` y `defer` no aplican `CareerTerms`;
- `accept` solo aplica exactamente los términos de la `CareerOffer` pendiente;
- no crear una segunda fuente de verdad contractual.

### C30-34-CODEX-003 — caracterizar deuda deportiva escena a escena

Usar `facts.sport` / `facts.match` como única read surface para hechos concretos de partido.

Para cada escena 30–34 con semántica como:

- titular/suplente;
- convocatoria;
- minutos concretos;
- gol/asistencia;
- resultado;
- final/semifinal/competición;
- dos partidos en 72 horas;
- racha de partidos;
- retorno en un partido;

registrar el hecho autoritativo que falta. No hacer pasar la escena mientras ese hecho sea `null`/`unavailable`.

## Blockers duros — no implementar con proxies

### Sporting authority

El `main` actual expone `getSportContext()` y `getCurrentMatchContext()`, pero todavía no existe store autoritativo de fixture/competición/partido/convocatoria/once/minutos por partido.

Por tanto el número de escenas 30–34 completamente desbloqueadas por esta autoridad deportiva es actualmente **0**.

Prohibido reconstruir esos hechos desde:

- edad;
- `roleScore`;
- forma;
- reputación;
- confianza del entrenador;
- `seasonDay`;
- mes;
- flags narrativos.

### EVT_31_MKT_001 — dos ofertas simultáneas

El canon compara dos propuestas simultáneas. El runtime persiste una única `CareerOffer` pendiente.

No convertirla en `offerBridge` hasta que la autoridad de mercado pueda representar la comparación sin perder identidad/provenance. Mientras tanto el guard de autoridad debe impedir que la escena cambie contratos directamente.

### 18 identidades desplazadas

Requieren decisión explícita de identidad + migración. No renombrar, no alias por título y no reescribir historia silenciosamente.

### 5 principales missing

- `EVT_30_CCH_001`
- `EVT_30_PRS_001`
- `EVT_30_NAT_002`
- `EVT_30_JAN_001`
- `EVT_31_ROLE_001`

Añadirlos cambia el catálogo/content identity. Su alta debe ir en batch coordinado con freeze y ruta de migración.

### Condicionales

Los 26 condicionales del motor siguen sin inventario condicional canónico autoritativo. No certificar identidad por parecido.

### Bridge 30→34

La infraestructura de transition priority existe, pero `EVT_30_BRIDGE_001` sigue desplazado frente a `EVT_30_IDN_001`. No convertir el legacy en obligatorio antes de resolver identidad/migración.

### Seeds

No resolver/consumir una seed solo para “cerrar” auditoría. Hace falta lector o transición terminal demostrable por canon/downstream owner.

## Ownership de integración

Este workstream **no** debe:

- crear el target freeze global de content identity;
- registrar o certificar `CONTENT_MIGRATION_ROUTES`;
- modificar save schema global;
- modificar scheduler global;
- resolver la state machine de retirada;
- inventar fixture/match/squad stores.

Esos handoffs pertenecen a coordinación/integración o al owner correspondiente.

## Invariantes

- edad cronológica no fuerza retirada;
- retirada internacional != retirada de club;
- no aliases silenciosos;
- no renombrados destructivos;
- Documento Maestro prevalece;
- hechos deportivos concretos solo desde autoridad deportiva real;
- empleo/contrato solo desde `CareerOffer/respondToOffer`.
