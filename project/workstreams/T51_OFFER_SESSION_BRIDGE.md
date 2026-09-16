# T5.1 — Offer / contract / session authority bridge

## Objetivo

Desbloquear escenas canónicas en las que una **oferta formal real** necesita presentarse como una decisión narrativa rica sin crear una segunda vía de firma contractual.

Casos que motivan el contrato:

- `EVT_23_MKT_001`;
- `EVT_23_CON_001`;
- `EVT_25_CON_001`.

Este contrato no implementa todavía esas tres escenas. Proporciona la frontera segura que sus owners pueden consumir.

## Autoridad única

`CareerOffer` y `respondToOffer()` siguen siendo la única autoridad que puede aplicar `CareerTerms`.

Una escena narrativa marcada como `offerBridge`:

1. solo puede aparecer si existe `state.market.pending`;
2. puede leer los términos visibles de esa oferta mediante el ViewModel ya existente;
3. no puede firmar, renovar, transferir, modificar salario, duración o cláusula mediante `Effect`;
4. al resolver una elección, `GameSession` comprueba que los `CareerTerms` siguen intactos antes de llamar a `respondToOffer()`;
5. si la escena intentó cambiar términos por efectos, el comando falla completo y el snapshot publicado no cambia.

## Disposiciones narrativas

Cada choice del bridge debe mapearse exactamente una vez a una disposición:

- `accept`;
- `reject`;
- `delegate`;
- `counter`;
- `defer`.

El save schema 8 conserva su enum histórico en `market.history.action`:

- `accept` → `accept`;
- `reject` → `reject`;
- `delegate` → `delegate`;
- `counter` → `reject` + `source.disposition = counter`;
- `defer` → `reject` + `source.disposition = defer`.

Así `counter/defer` cierran la propuesta concreta sin aplicar términos ni fingir que el jugador firmó. Una futura contraoferta debe llegar como una nueva `CareerOffer`; no se modifica silenciosamente la oferta consumida.

## Trigger y scheduling

Una oferta es un trigger externo ya materializado. Por ello los offer bridges **no compiten en el scheduler narrativo normal** y no consumen un sorteo extra.

Cuando `market.pending` existe, `GameSession` busca únicamente bridges elegibles y aplica de forma determinista:

- edad y fase;
- `timeWindow`;
- gates comunes y `gateAlternatives`;
- exclusiones;
- requisitos de conocimiento T5.3;
- `SEEN` / cooldown;
- choice eligibility.

No aplica ritmo, presupuesto de escenas ni ponderación RNG. Si más de un bridge resulta elegible, el comando falla cerrado por ambigüedad y no publica cambios.

Si no existe ningún bridge elegible, la oferta conserva la pantalla `offer` histórica y los comandos `accept/reject/delegate` funcionan como antes.

## Pantallas y persistencia

La única coexistencia nueva permitida es:

`market.pending + pendingDecision(offerBridge)`

No se permite:

- oferta + decisión ordinaria;
- oferta + resultado;
- oferta + carrera cerrada.

Al elegir una opción del bridge, la oferta queda consumida dentro de la misma transacción que la decisión. El `market.history` registra una `source` causal:

- `kind = narrative_choice`;
- `historyIndex`;
- `eventId`;
- `choiceId`;
- `disposition`.

`validate-session` comprueba que esa procedencia corresponde exactamente al `HistoryEntry` y al recibo `choose` real. Una decisión narrativa no necesita fabricar un recibo `offer` adicional.

## Journal y contenido canónico

La resolución contractual añade una explicación dinámica al resultado visible. Para mantener verificable el contenido canónico:

- los mensajes canónicos de la escena siguen sujetos al `journalSemanticsFingerprint` del catálogo;
- la explicación contractual es un único mensaje final extra;
- el validador exige que ese mensaje coincida exactamente con `market.history[].explanation`;
- el digest canónico se calcula sobre los mensajes previos, no sobre el texto dinámico derivado de la oferta.

## Idempotencia y rollback

El bridge reutiliza el boundary transaccional de `GameSession`:

- doble pulsación del mismo `choose` → replay del mismo receipt;
- reload → la decisión y la oferta pendientes se conservan;
- replay tras firma → no aplica términos una segunda vez;
- fallo de validación/commit → no se publica contrato, history, journal ni RNG parciales;
- una escena no puede saltarse el bridge enviando directamente un comando `offer` mientras `pendingDecision` existe.

## RNG

Promover una oferta ya existente a una escena bridge consume **cero RNG adicional**.

La resolución narrativa puede usar su RNG normal para escoger un outcome si la escena lo define; ese RNG no sustituye a la autoridad contractual. El bridge no introduce un stream nuevo.

## Compatibilidad

- Session continúa en v3;
- GameState/save schema continúa en 8;
- `MarketState.version` continúa en 1;
- `market.history.action` mantiene el enum existente;
- ofertas ordinarias siguen usando el flujo histórico;
- no hay cambios de contenido activo en esta pasada, por lo que no se requiere una nueva ruta de `contentIdentity` por este contrato aislado.

## Criterio de cierre

S5 puede cerrarse cuando:

1. build TypeScript verde;
2. tests dirigidos prueben promoción sin RNG, save/reload, aceptación idempotente, counter/defer sin firma, autoridad contractual, tampering y ambigüedad;
3. `scripts/test-offers.mjs` siga verde;
4. `qa:t5:saves` y `Repository integrity` estén verdes sobre el HEAD exacto re-groundeado en `main`.

Después de S5, T5.13 puede implementar sus tres escenas canónicas usando ofertas reales, sin introducir setters contractuales narrativos.