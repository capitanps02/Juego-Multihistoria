# Active-agent canonical gap — 18–23

Fecha: 2026-09-17

Estado: **blocker canónico confirmado; no es un blocker de runtime**.

La autoridad nominal de agente ya existe en `main` tras PR #144:

- `resolveActiveAgent(state)`;
- `certifyActiveAgentInPlace(state, npcId)`;
- `clearActiveAgentInPlace(state)`;
- target dinámico `activeAgent`;
- persistencia fail-closed en saves antiguos sin autoridad.

## Cadena canónica auditada

### 18 años — `EVT_18_AGT_001`

El canon/runtime certificado dice explícitamente: **«No hay contrato firmado.»**

Las cuatro rutas son contactos o permisos limitados:

- Héctor: consulta sin exclusividad;
- Lucía/Prisma: informe de mercado;
- ambos: comparación sin autorizar contactos;
- esperar: rechazar representación por ahora.

Ninguna ruta acredita una contratación.

### 19 años — `EVT_19_AGENT_001`

La escena ya habla de **«tu representante»** y se gatea históricamente por `AGENT_ACTIVE`, pero no contiene la acción previa que eligió qué NPC fue contratado.

La opción `BREAK` puede terminar una relación si existe, pero tampoco reconstruye de forma segura quién era el representante.

### 20 años — `EVT_20_AGT_001`

La ficha canónica reconciliada exige **Agente activo** y define alcance de permisos:

- control amplio;
- informar antes de responder;
- separar prensa/imagen del jugador y mercado del agente;
- no centralizar.

Es una escena de gobernanza de una relación ya existente, no una contratación inicial.

### 21 años — `EVT_21_AGT_001`

La ficha canónica presupone un **contrato del agente revisable** y permite negociar comisión/servicios, sondear otra agencia o separar áreas. De nuevo, presupone representación previa.

## Conclusión

Hay un salto canónico real entre el contacto de 18 años y las escenas que presuponen representación desde los 19–21.

Por tanto, hoy **ningún evento existente puede escribir de forma segura**:

```ts
certifyActiveAgentInPlace(state, "NPC_AGT_01")
// o
certifyActiveAgentInPlace(state, "NPC_AGT_02")
```

sin inventar canon.

## Prohibido como sustituto

No derivar identidad desde:

- `AGENT_ACTIVE`;
- `AGENT_CONTACT_HECTOR`;
- `AGENT_CONTACT_PRISMA`;
- `SEED_FIRST_AGENT`;
- trust/affinity/leverage;
- `professional.agentControl`;
- `npcRefs`;
- último agente mencionado;
- mayor acceso o fiabilidad.

## Decisión necesaria del owner canónico

Solo hay dos salidas correctas:

1. **Añadir/certificar una acción canónica explícita de contratación** que elija Héctor, Lucía o nadie y sea el único productor de `activeAgentNpcId`; o
2. **Reclasificar canónicamente como actor genérico/no persistente** las escenas que hoy dicen «tu representante/tu agente», eliminando su necesidad de memoria nominal.

La opción 1 permite continuidad fuerte de agente. La opción 2 conserva fail-closed pero renuncia a atribución nominal hasta una contratación posterior.

Este workstream no elige entre ambas porque sería una decisión narrativa nueva, no una corrección técnica.

## Contenido bloqueado por este hueco

- `EVT_20_BRUNO_001`;
- `EVT_20_AGT_001`;
- `EVT_21_SOC_001`;
- `EVT_21_AGT_001`.

## Condición para pasar a READY

El blocker solo se considera resuelto cuando exista evidencia canónica + implementación que:

- certifique exactamente un agente o `null`;
- persista save/resume;
- permita cambio/rescisión explícitos;
- no consuma RNG al resolver;
- informe mediante `targetSlots:["activeAgent"]` únicamente al NPC certificado;
- mantenga saves antiguos sin backfill heurístico.
