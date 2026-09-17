# T5.36 / T5.37 — Retirada, cierre y epílogos

Rama propietaria: `t5/retirement-epilogues`

Base al iniciar el workstream: `main@6866ed7710bf317e8633b67a78d477a5be952349`.

> Este workstream no es propietario de la carrera veterana ordinaria 34+. Su frontera empieza cuando existe una decisión válida de cierre o un contexto terminal. La integración final de `contentIdentity` queda bloqueada hasta recibir la generación 34+ activa real del Agente 13.

## T5.36 — máquina de retirada

Máquina permitida:

```text
playing -> decided -> announced -> closed
              |
              +------> playing   (solo reconsideración explícita pre-anuncio)
```

Transiciones prohibidas:

```text
announced -> playing
closed    -> playing
playing   -> announced
playing   -> closed   (salvo bridge legacy explícito 30–34 ya existente)
```

### Autoridad por estado

| Estado | Quién/qué puede producirlo | Evidencia mínima |
| --- | --- | --- |
| `playing` | estado normal; o escena explícita de reconsideración | `decided`, ventana pre-anuncio y decisión `RETURN` |
| `decided` | elección del protagonista en una escena terminal | choice que escribe `retirement.status=decided` |
| `announced` | `EVT_RET_ANNOUNCE_001` | choice pública explícita; nunca timer |
| `closed` | cierre narrativo/administrativo desde `announced` | anuncio previo + tipo de cierre factual |

`closeCareer()` no puede usar edad, ausencia de oferta o RNG como sustitutos de una decisión. El único bridge directo conservado es compatibilidad con el flag histórico `EARLY_RETIRED_30_34`, que ya representaba una retirada ejecutada por el bloque anterior.

## Reconsideración

`decided -> playing` exige simultáneamente:

- estado `decided`;
- `RECONSIDERATION_WINDOW=true`;
- razón narrativa persistida (por ejemplo anuncio pospuesto);
- decisión explícita del jugador.

Una oferta, RNG o scheduler no abren por sí mismos la transición.

`CEVT_RET_RECONSIDER` conserva su ID físico por compatibilidad de catálogo, pero su semántica nueva es **pre-anuncio**. La definición legacy que reaccionaba después del anuncio es una escena distinta a efectos de migración.

## Anuncio y conocimiento

`EVT_RET_ANNOUNCE_001` distingue:

- decisión privada todavía no anunciada;
- anuncio público persistente (`RETIREMENT_PUBLIC`, `RETIREMENT_WAS_ANNOUNCED`);
- posibilidad de `WAIT`, que mantiene `decided` y abre una ventana explícita de reconsideración.

### Handoff T5.3

No se modifica aquí la arquitectura global de conocimiento NPC.

El coordinador/T5.3 debe conectar el anuncio público con el registry dinámico de conocimiento del `main` actual:

1. decisiones `decided` y `WAIT` permanecen privadas salvo comunicación explícita;
2. choices públicas de `EVT_RET_ANNOUNCE_001` deben usar `source: public` para NPC con acceso al canal público;
3. `npcRefs` nunca equivale a conocimiento;
4. el cierre factual puede conocerse por vía pública, pero no debe reescribir cuándo supieron la decisión privada.

## Mercado y familia

### Mercado agotado

`lateCareerPreseason()` puede crear:

- `NO_MARKET_END_CONTEXT`;
- `NO_MARKET_DECISION_PENDING`.

Nunca cambia el estado de retirada.

`EVT_38_MKT_001` ofrece concesiones, espera, contacto directo o retirada. Solo la elección `RETIRE` produce `decided` y deja `NO_MARKET_RETIREMENT_CHOSEN` como evidencia.

### Familia

`EVT_RET_HOME_001` / alias canónico `EVT_RET_FAM_001` permite hablar de última temporada, retirarse, seguir sin fecha o esperar ofertas. La familia influye; no ejecuta la retirada.

## Último partido

Canon P12 / `EVT_RET_LASTMATCH_001`:

- pedir jugar si hay alta;
- aceptar decisión técnica;
- pedir minutos condicionados al marcador;
- proteger el cuerpo.

El ID legacy `EVT_RET_LAST_001` se conserva como alias del ID canónico, pero ninguna choice escribe `LAST_MATCH_PLAYED`.

### Fuente factual

El simulador de fútbol ya incrementa `sport.appearances` cuando realmente se produce una aparición. Al anunciarse la retirada se captura un baseline. Mientras el estado es `announced`, T5.36 solo observa el delta:

```text
sport.appearances > retirementObservedAppearances
```

Solo entonces se registra:

- `LAST_MATCH_PLAYED=true`;
- `world.retirementLastAppearanceDate`.

El workstream no inventa minutos, titularidad, resultado o ceremonia.

### Último gol

El motor actual no simula goles individuales con un hecho persistente suficiente. Por tanto:

- `STORYBOOK_LAST_GOAL` legacy NO es evidencia;
- ningún evento terminal crea `LAST_MATCH_GOAL_FACT`;
- `CEVT_RET_STORYBOOK_LAST_GOAL` solo es elegible si un futuro subsistema de partido ya ha escrito `LAST_MATCH_GOAL_FACT=true` junto con una aparición real.

## Cierre sin partido

`CEVT_RET_NO_LAST_MATCH` permite cerrar desde `announced` cuando no existe una aparición posterior al anuncio.

El cierre administrativo del runtime usa:

- `last_match_played` si se observó una aparición real;
- `no_last_match` si no se observó.

Cerrar no modifica retrospectivamente `sport.appearances` ni crea eventos deportivos.

## Retirada internacional

`NATIONAL_RETIRED` es independiente de `retirement.status`.

El jugador puede cerrar selección y seguir en `playing` a nivel de club. T5.37 lo refleja como una etapa separada cuando genera texto factual.

# T5.37 — 20 familias de epílogo

La selección es determinista y se hace en este orden:

1. requisito factual positivo;
2. requisito negativo/hard conflict;
3. prioridad de saliencia;
4. fallback factual si no domina un arquetipo fuerte.

El número de familias ya no depende del RNG. Se conserva el contrato histórico 2–5 para no romper saves/gates actuales.

| Familia | Evidencia positiva mínima | Bloqueo principal |
| --- | --- | --- |
| `END_WORLD_LEGEND` | victoria/título + mito/trophy/legacy altos | sin victoria/título |
| `END_ONE_CLUB_MYTH` | un club + permanencia larga/icon + legado | >1 club |
| `END_HOME_PRODIGAL` | `HOME_RETURN_30`, UDV final y club exterior previo | carrera de un club |
| `END_GREAT_PRO` | carrera cerrada y trayectoria/historial prolongado | carrera abierta |
| `END_TACTICAL_SECOND_CAREER` | reinvención registrada | sin reinvención |
| `END_JOURNEYMAN_VETERAN` | >=3 clubes o tag canónico | un club |
| `END_MARKET_SILENCE` | `NO_MARKET_RETIREMENT_CHOSEN` | simple falta temporal de oferta |
| `END_BODY_CLOSED_DOOR` | razón health + evidencia física | estabilidad física sin decisión médica |
| `END_ELITE_SPECIALIST` | tag o especialista con contexto élite | sin contexto élite/especialista |
| `END_NEW_MARKET_ICON` | ruta transatlántica/rich league | ruta inexistente |
| `END_EARLY_VOLUNTARY` | decisión voluntaria temprana explícita | retirada tardía/forzada |
| `END_TOO_LONG` | 41+ + rol/mercado/motivación bajos | edad sola |
| `END_RETIRE_ON_HIGH` | elección explícita + victoria/título | ganar sin elegir retirarse |
| `END_COMEBACK_FINAL` | comeback o reconsideración pre-anuncio | duda post-anuncio |
| `END_POLARIZING_WINNER` | victoria/título + trophy + polarización | polarización sin éxito |
| `END_WEALTH_OVER_GLORY` | ruta económica explícita | salario aislado |
| `END_UNFINISHED_FEELING` | retire-low, no-last-match o ausencia objetiva de dimensión dominante | final factual alto/storybook |
| `END_STORYBOOK_FAREWELL` | aparición real + `LAST_MATCH_GOAL_FACT` + cierre factual | cualquier flag legacy sintético |
| `END_NATIONAL_CAPTAIN` | capitanía confirmada por flag/seed | caps sin capitanía |
| `END_CONTRACT_KING` | tag canónico o contractPower/careerControl altos | contrato rico aislado |

## Hard conflicts

Como mínimo:

- one-club × journeyman;
- one-club × home-prodigal;
- early-voluntary × too-long;
- market-silence × storybook;
- body-closed-door × storybook;
- retire-on-high × unfinished;
- storybook × unfinished.

## Texto final

`buildEpilogueText()` solo formula frases que puede probar con estado/historial:

- edad y fecha de cierre;
- clubes registrados;
- retirada internacional y caps;
- lesiones largas registradas;
- razón factual de retirada;
- aparición real posterior al anuncio o ausencia de ella;
- gol final solo con `LAST_MATCH_GOAL_FACT`.

El objeto persistido `epilogue` añade, sin romper schema 8:

- `evidence`: evidencias por familia;
- `finalText`: frases factuales finales.

Los validadores actuales toleran campos adicionales y continúan validando los campos históricos requeridos.

# Seeds — handoff T5.2/T5.4

T5.36 no hace mass-resolve/mass-expire al cerrar una carrera.

La terminación debe distinguir en el workstream propietario:

- `resolved`;
- `expired`;
- terminalmente irrelevante;
- abierta pero no accionable;
- histórica ya consumida.

T5.36 incluye una prueba que confirma que `closeCareer()` no modifica el array de seeds por defecto.

# Saves

QA cubre `playing`, `decided`, `announced`, `closed`.

Cargar/serializar no debe:

- consumir RNG;
- anunciar;
- cerrar;
- programar escenas;
- reescribir history.

La migración schema 7 -> 8 sigue produciendo un estado `playing` salvo la compatibilidad legacy explícita ya existente para early retirement 30–34.

# Content identity / migration lineage

## Bloqueo actual

A 2026-09-16 la rama `t51/canon-34plus-career` contiene `T5.29: canonicalize veteran career entry` (`3d726c3...`), pero solo añade `t529-career-events.ts` y aún no constituye una generación 34+ activa completa.

Por tanto T5.36/T5.37 **NO registra todavía** una identidad final ni un edge de migración.

Orden obligatorio:

```text
... -> 30–34 -> 34+ carrera activa del Agente 13 -> retirada/epílogo
```

No se permite `PRE -> retirada`.

### IDs que requieren identidad semántica separada

- `CEVT_RET_RECONSIDER`: legacy post-anuncio vs target pre-anuncio; `distinct_scene`/frozen definition.
- `EVT_RET_LAST_001` / `EVT_RET_LASTMATCH_001`: alias físico no implica equivalencia con la vieja escena que fabricaba aparición.
- `CEVT_RET_STORYBOOK_LAST_GOAL`: legacy sintético no equivale al target factual.
- `CEVT_38_OFFER_AFTER_RETIREMENT_ANNOUNCED`: la nueva semántica no reabre el anuncio.

Cuando el Agente 13 publique su source real, el coordinador debe:

1. congelar esa source según T5.1;
2. rebase/sincronizar este workstream;
3. aplicar el terminal layer;
4. calcular el nuevo `contentIdentity`;
5. congelar la definición target;
6. registrar exactamente un edge source→target;
7. ejecutar gates de lineage y migración sin RNG.

# QA local

Después de compilar:

```bash
npm run build
node --test scripts/test-t536-t537-retirement.mjs
npm run qa:t5
```

La suite específica cubre las 18 pruebas exigidas por T5.36/T5.37 y un gate extra de no-mass-close de seeds.

# Estado de integración

- Runtime terminal: implementado en la rama.
- Contenido terminal: implementado en la rama.
- Epílogos factuales: implementados en la rama.
- QA específico: implementado en la rama.
- NPC public propagation: handoff a T5.3; no invadido.
- Seed terminal classification: handoff a T5.2/T5.4; no invadido.
- `contentIdentity` definitiva: bloqueada correctamente por dependencia del Agente 13.
- Merge a `main`: no realizado.
