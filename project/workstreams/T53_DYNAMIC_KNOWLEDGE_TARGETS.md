# T5.3 — destinatarios dinámicos de conocimiento NPC

## Problema

T5.3 modela conocimiento causal mediante `NPC_EVENT_KNOWLEDGE_RULES`. Hasta ahora toda regla declaraba `npcIds` estáticos. Eso es correcto para escenas donde la identidad del testigo/informado está fijada por canon, pero no para decisiones cuyo destinatario depende de una autoridad runtime explícita.

El primer consumidor previsto es el handoff T5.14 de `EVT_23_LOCK_001`: la opción de avisar al capitán debe informar al **capitán autoritativo de ese club/fase**, no a un ID hardcodeado ni a cualquier NPC con relación alta.

Issue de coordinación: #104. El contrato de slots de #84 ya está integrado en `main` como `ddf46fed010521c5969bac26e29920945793f709`.

## Contrato live

`NpcEventKnowledgeRule` conserva `npcIds` y añade opcionalmente:

```ts
targetSlots?: ("captain" | "star")[]
```

Las reglas dinámicas son deliberadamente estrechas:

- deben declarar al menos una choice concreta;
- deben declarar al menos un outcome concreto;
- un slot desconocido o duplicado falla los tests;
- si el slot no se puede resolver, aporta cero destinatarios: nunca se inventa uno;
- `npcRefs`, seeds, texto de rol, `lockerPower` y magnitud de relaciones no resuelven destinatarios.

Actualmente **ninguna regla productiva usa `targetSlots`**. Esta pasada entrega infraestructura y QA, no contenido canónico LOCK23.

## Momento de resolución

`captureNpcKnowledgeTargetContext(state)` resuelve `captain/star` al entrar en la resolución de la escena, antes de efectos inmediatos o del outcome.

Esto evita un fallo causal importante: si una elección cambia de club, el receptor sigue siendo el líder que existía en el contexto donde ocurrió la conversación, no un hipotético líder del club de destino.

El `club` guardado en `NpcKnowledgeRecord` sigue siendo el club de adquisición previo a la transición.

## Evidencia durable

Cuando una regla dinámica coincide con `eventId + choiceId + outcomeId`:

1. se resuelve el `npcId` real;
2. el conocimiento se escribe únicamente a ese NPC;
3. el `npcId` resuelto se incorpora a `HistoryEntry.snapshot.npcRefs` junto a las refs estáticas del evento.

Esto no convierte `npcRefs` en una fuente de conocimiento. El sentido causal sigue siendo el inverso: la regla explícita causa el conocimiento y el snapshot conserva quién participó realmente para trazabilidad/novelty/QA.

Las seeds creadas por la escena **no** heredan automáticamente estos destinatarios dinámicos. Seed refs y knowledge continúan siendo contratos distintos.

## Choice eligibility

El contrato integrado de locker leadership añade a `narrativeConditionRoot(state)` facts derivados read-only, entre ellos:

- `facts.clubWantsRenewal`;
- `facts.lockerCaptainAffinity`;
- `facts.lockerStarAffinity`.

Los event gates ya usan esa raíz. #104 exige que una opción como «avisar al capitán» también desaparezca/falle cerrado cuando no existe un captain autoritativo.

`isChoiceEligible()` / `eligibleChoices()` evalúan ahora `choice.eligibility` contra **la misma** `narrativeConditionRoot(state)` que usan los event gates. Por ejemplo, una futura choice de LOCK23 puede exigir:

```ts
{ path: "facts.lockerCaptainAffinity", op: "exists" }
```

La afinidad solo existe cuando `resolveLockerSlot(state, "captain")` resuelve un NPC activo del club/fase certificado y existe su relación persistente; club/fase sin captain devuelve `null` y la choice falla cerrado.

La proyección es read-only, no se persiste y no consume RNG.

## Frontera histórica

Este contrato es **live-only**. No modifica la baseline histórica v1 propuesta en PR #96.

Una futura regla dinámica de T5.14 no debe añadirse retroactivamente a `NPC_KNOWLEDGE_BACKFILL_RULES_V1`. Si en el futuro se desea reconstruir esa semántica para saves que ya contengan la decisión pero no la memoria, hará falta una versión de backfill posterior y evidencia suficiente para resolver el receptor histórico de forma determinista.

## QA permanente

`scripts/test-t53-dynamic-targets.mjs`, importado desde la suite permanente de transmisión T5.3, prueba:

1. ratchet de declaraciones: targets válidos y toda regla dinámica limitada a choice+outcome;
2. una ruta coincidente informa exactamente al capitán autoritativo y persiste su ref histórica;
3. una choice no coincidente no crea omnisciencia;
4. un slot ausente falla cerrado y no inventa receptor;
5. resolver el rol no consume RNG adicional;
6. un cambio de club durante la elección conserva como receptor al capitán del contexto de entrada y el club original de aprendizaje;
7. choice eligibility ve los mismos locker facts que event gates, es read-only y no consume RNG.

## Integración

#97 ya está integrado en `main`. Este workstream debe re-groundearse sobre ese `main` y, si PR #96 entra antes de su integración, componerse también con la baseline histórica T5-QA-020.

No cambia `EVENTS`, `contentIdentity`, save schema ni seeds. No auto-mergear.
