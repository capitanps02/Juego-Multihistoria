# T5.2 — Evidencia de seed lifecycle

Workstream: `t5/seed-lifecycle`  
Integración base: PR #8, fusionado en `main` el 2026-09-16  
Follow-up de handoff/hardening: PR #19  
Snapshot de coordinación: `main@802dfd13a9d1b73b5131a0fb1ff3c740137aad54`

Este directorio conserva la evidencia reproducible del ciclo de vida de seeds.

```bash
npm run audit:t52
```

genera:

- `analysis/T5.2/seed-lifecycle.json`: inventario lifecycle global;
- `analysis/T5.2/seed-handoff.json`: reparto exacto por bloque canónico y backlog de conexión.

La readiness para convertir ese backlog en cambios de contenido se documenta en `analysis/T5.2/CANONICAL_READINESS.md`.

## Baseline lifecycle

El último baseline runtime comparable mantiene:

- **210** seeds únicas;
- **388** eventos = 254 principales + 134 condicionales;
- **138** seeds con productor runtime y **72** sin productor;
- **57** con algún consumidor detectable y **153** sin consumidor;
- **48** con `ageWindow` finito;
- **5** con scope local de club y **0** locales de temporada;
- transiciones declaradas: **1236 create**, 0 activate, 0 intensify, 0 transform, **2 resolve**, 0 expire;
- 0 `expiresAfter` canónicos;
- **1** seed con cierre terminal explícito (`SEED_NANO_SHADOW`);
- 0 referencias a seed desconocida;
- 0 mismatches `seedsWrite` vs transiciones.

Los merges recientes #12, #23 y #17 son auditoría/QA y **no cambian el contenido runtime de seeds**, por lo que no deben reducir esos números. El siguiente descenso legítimo de deuda tendrá que proceder de una integración funcional canónica posterior.

## Handoff canónico 210/210

| Propietario | Seeds | Con productor | Sin productor | Con consumidor | Sin consumidor | Terminal explícito | Open-ended | Huérfanas productor+consumidor |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `t51/canon-18-23` | 31 | 31 | 0 | 21 | 10 | 1 | 7 | 0 |
| `t51/canon-23-30` | 59 | 59 | 0 | 29 | 30 | 0 | 35 | 0 |
| `t51/canon-30-34` | 52 | 48 | 4 | 7 | 45 | 0 | 52 | 4 |
| `t51/canon-34plus` | 68 | 0 | 68 | 0 | 68 | 0 | 68 | 68 |

La partición es exacta: **210 entradas, 210 IDs únicos, 0 duplicados, 0 sin propietario y 0 IDs desconocidos**.

Las cuatro huérfanas 30–34 son:

- `SEED_ROLE_COMMUNICATION`;
- `SEED_FALSE_ULTIMATUM`;
- `SEED_NATIONAL_ABSENCE`;
- `SEED_SPECIALIST_BIGCLUB`.

Los `originEvents` editoriales `PASADA_6_30_34` y `PASADA_7_34_PLUS` siguen tratándose como procedencia, no como eventos runtime inventados.

## Readiness actualizada

La regla sigue siendo **canon first, wiring second**.

### 18–23

#10 mantiene una deuda grande de reimplementación/ausencias y contratos compartidos. Las 10 seeds sin consumidor son backlog, no autorización para añadir cierres contra shells actuales.

### 23–30

#12 ya está integrado y mejora sustancialmente la trazabilidad sin tocar runtime:

- 44/44 condicionales tienen planning semántico revisado;
- 0/44 están certificadas como implementación runtime canónica completa;
- 23–26 conserva 15 principales a reimplementar: 10 son candidatas scene-level después de resolver migración de sesiones y 5 tienen dependencias transversales adicionales;
- por tanto, las 30 seeds sin consumidor y 35 open-ended siguen vigentes hasta que entre implementación funcional real.

### 30–34

#13 sigue abierto. No existe base para conectar las cuatro huérfanas a escenas genéricas actuales; deben incorporarse en la identidad canónica correcta y con compatibilidad de history/pending.

### 34+

#15 ha mejorado retirada/mercado y acredita 4 identidades + 3 aliases, pero mantiene 43/50 principales sin implementación canónica completa y difiere el shared seed wiring. Las 68 seeds sin productor/consumidor siguen siendo backlog canónico, no fallo del mecanismo T5.2.

## Lifecycle implementado

El runtime conserva `dormant | active | transformed | resolved | expired`.

Invariantes T5.2:

- una sola instancia viva por seed; una nueva creación tras terminal conserva el histórico y abre nueva instancia;
- `resolve` y `expire` son terminales e idempotentes;
- `ageWindow` finito y `expiresAfter` producen caducidad determinista;
- temporada y club no resetean memoria por defecto;
- cinco seeds de vestuario/jerarquía usan `origin_club`;
- `syncSeedPresenceFlagsInPlace` limpia `HAS_SEED_*` fantasma para todos los IDs conocidos, incluso sin `SeedInstance` viva;
- seeds desconocidas ya presentes en saves se preservan;
- contenido nuevo no puede crear IDs inexistentes;
- lifecycle no consume RNG;
- retry/doble click pertenece a `GameSession.commandId` + receipts, no a una deduplicación narrativa por evento/choice/fecha.

## Saves y content identity

Schema permanece en **8** y T5.2 no añade campos obligatorios. Los metadatos T5.2 siguen dentro de `payload`.

PR #23 está integrado y `npm test` incluye ya `test-saves`, que protege:

- schema 8;
- history;
- seeds;
- streams RNG preexistentes;
- round-trip de serialización/restauración.

PR #17 está integrado y añade además `qa:t5:freeze`, `qa:t5:saves` y `qa:t5:integration`. Esto convierte save/contentIdentity y la composición T5.2/T5.3 en gates de coordinación explícitos.

El freeze pre-T5.1 no equivale a una migración de sesiones. Cambiar semántica de eventos puede cambiar `contentIdentity`; cualquier implementación funcional T5.1 debe resolver esa frontera antes de reinterpretar pending/history.

## Frontera con T5.3

Seed viva, `HAS_SEED_*` y `npcRefs` **no equivalen a conocimiento NPC**.

T5.3 posee la adquisición epistemológica. Resolver una seed no informa silenciosamente a un NPC y aprender un hecho no resuelve una seed salvo que la escena canónica declare ambas consecuencias.

QA integrado mantiene T5-QA-006 como composición transversal. El resolver final debe preservar a la vez:

- lifecycle/scope de seed;
- limpieza de flags fantasma de #19;
- adquisición causal de conocimiento T5.3;
- club/contexto de aprendizaje;
- determinismo.

T5-QA-008, relativo a conocimiento persistido malformado, pertenece a T5.3/save validation y no debe resolverse deformando el lifecycle de seeds.

## Gates actuales

En la rama de #19, el `package.json` re-groundeado sobre `main` conserva todos los gates actuales y compone T5.2 con ellos:

- `npm test`: gate v0.8 + auditor T5.2 + tests T5.2 + handoff T5.2 + `test-saves`;
- `npm run audit:t52`: lifecycle + handoff;
- `npm run test:t52`: lifecycle + handoff + suites dirigidas;
- `qa:t5:freeze`;
- `qa:t5:saves`;
- `qa:t5:integration`;
- determinismo/RNG, edades, referencias, carreras largas y simulación estratificada en `Repository integrity`.

## Criterio de cierre

T5.2 permanece `in_progress` hasta que las 210 seeds puedan clasificarse con evidencia en una de estas categorías:

1. productor + consumidor/cierre canónico implementados;
2. memoria intencionalmente persistente/open-ended con razón canónica;
3. caducidad por edad/fecha/scope canónicamente justificada;
4. retirada/deprecación compatible con saves/history.

No se acepta como cierre añadir `resolve`/`expire` arbitrarios, conectar seeds a `engine_only_noncanonical`, reinterpretar history antigua o usar conocimiento NPC implícito.
