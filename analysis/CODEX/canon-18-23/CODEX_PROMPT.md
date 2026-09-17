# CODEX PROMPT — CANON 18–23

Actúa como desarrollador TypeScript del repositorio `capitanps02/Juego-Multihistoria` para continuar exclusivamente el canon inicio / 18–20 / 20–23.

## Inicio obligatorio

1. Lee el `main` real más reciente; no uses el SHA de este documento como autoridad futura.
2. Lee:
   - `analysis/CODEX/canon-18-23/CANON_STATUS.json`
   - `analysis/CODEX/canon-18-23/implementation-ready.json`
   - `analysis/CODEX/canon-18-23/BLOCKERS.md`
   - `analysis/CODEX/canon-18-23/CONTINUITY_CHAINS.md`
3. Comprueba PR #155 y no dupliques eventos ya integrados.
4. Trabaja en una rama funcional nueva/re-grounded desde el `main` vigente. Nunca sobre `main`. Nunca auto-merge.

## Lote 1 — ready principals

Implementa, en este orden y sin investigar nueva arquitectura:

1. `EVT_20_BRIDGE_001`
2. `EVT_20_CCH_001`
3. `EVT_21_SOC_001`
4. `EVT_21_PRS_002`

Usa las APIs y acceptance tests exactos de `implementation-ready.json`.

Reglas:
- active agent = resolver autoritativo, nunca último contacto/trust/seed;
- current-club institutional NPC = resolver autoritativo, nunca `NPC_DIR_02` fijo tras cambio de club;
- Clara sabe solo por canal explícito/publicación;
- un interés de mercado no es CareerOffer;
- no mutar contrato/club desde narrativa cuando la operación pertenece a CareerOffer;
- same string ID no demuestra same scene.

## Lote 2 — ready conditional

Implementa `CEVT_18_PLAYOFF_01` como consecuencia diferida explícita de retención-vs-mercado. No inventes una seed decorativa: cualquier memoria nueva debe tener consumidor futuro documentado. Debe sobrevivir save/restore y conservar determinismo.

## Lote 3 — cleanup

Después de los cinco ready:
- recalcula `CANON_STATUS.json`;
- elimina labels/stale comments falsos solo dentro del ownership;
- no retires engine-only legacy rows sin el handoff de history/pending;
- no añadas aliases;
- no implementes escenas de `BLOCKERS.md` si el contrato nombrado sigue sin productor real.

## Autoridades compartidas

NPC: consume `src/narrative/npc-authority.ts`, target slots y reglas de conocimiento.
Seeds: consume `src/narrative/seed-memory.ts` y facts del condition root. `seedsRead` no es causalidad.
Market: consume CareerOffer/contract/loan authorities. `marketHeat` no es una oferta.
Sport: consume sport/match context. `null`/`unavailable` falla cerrado; edad, roleScore, mes o mediaHeat no sustituyen fixture/call-up/resultado.

## Archivos prohibidos salvo autorización explícita del integrador

- migración global/contentIdentity final;
- schema global por comodidad;
- RNG core;
- catálogos NPC/seed globales para fabricar facts;
- 23–26, 26–30, 30–34, 34+ o retirada excepto lectura de continuidad.

## Identidad y saves

Para una reescritura semántica bajo el mismo ID usa `distinct_scene`. Preserva pending/history por source contentIdentity + fingerprint. No limpies SEEN/cooldown globalmente. No crees rutas PRE→latest. El coordinador serializa la siguiente generación adyacente.

Si cambias EVENTS, declara textualmente: `content generation requires coordinator integration.`

## QA por escena

Mínimo:
- trigger positivo y negativo;
- choices válidas e inválidas;
- effect principal;
- seed create/read cuando aplique;
- NPC knowledge cuando aplique;
- mismo state/seed determinista;
- gates/eligibility 0 RNG;
- save/load cuando sea relevante;
- secuencia causal si existe producer→consumer.

Al final ejecuta:
- `npm run build`
- `npm test`
- Repository Integrity vigente
- focused 18–20
- focused 20–23
- saves/migrations relevantes

## Entrega

Reporta base/HEAD, archivos, eventos exactos, APIs consumidas, si cambian EVENTS/contentIdentity/schema/RNG, tests exactos, blockers restantes y estado de CI. No merges.
