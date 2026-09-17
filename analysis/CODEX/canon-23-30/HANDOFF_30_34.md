# Handoff 30–34

Este documento define únicamente el estado que el bloque 30–34 debe poder consumir. No autoriza a crear escenas 30–34 desde este workstream.

## Estado esperado al entrar en 30

### Club y contrato

- `club`, `professional.ownerClub` y `professional.registrationClub` deben reflejar únicamente transiciones aplicadas por la autoridad contractual.
- Toda transferencia/retorno formal debe proceder de una `CareerOffer` aceptada por `respondToOffer()`.
- `contract.monthsRemaining`, salario y release clause deben describir el contrato real vigente; counter/defer/reject no deben haberlos alterado.
- No heredar la mutación sintética legacy de `EVT_29_HOME_001` como hecho canónico.

### Rol deportivo y trayectoria

- conservar rol real, role security/adaptability, minutos y trayectoria observada;
- conservar decisiones de reinvención táctica (`SEED_POSITIONAL_REINVENTION`) y su efecto causal;
- distinguir estrella/capitán/líder/veterano/influencia;
- si hubo cambio de club, resolver de nuevo actores institucionales y locker slots del club actual.

### Agente

- conservar la relación causal con el agente activo si existe una autoridad explícita de identidad;
- conservar estado sin agente cuando corresponda;
- no reconstruir agente desde `agentControl`, trust, última conversación o seed aislada;
- transportar conflictos/negociaciones paralelas relevantes, especialmente `SEED_AGENT_CONFLICT_PEAK` / `SEED_PARALLEL_NEGOTIATION` si siguen abiertos.

### Selección

- conservar `nationalCaps`, `nationalRole` y standing como estado de apoyo;
- transportar además el historial autoritativo de convocatorias/minutos/torneos cuando esa authority esté integrada;
- distinguir primera convocatoria, consolidación, suplencia, exclusión y regreso;
- no inferir selección a los 30 desde reputación.

### Cuerpo e lesiones

- conservar historial de lesiones, recurrencias, missed time y returns;
- conservar load/recovery y decisiones de gestión del cuerpo;
- transportar `SEED_PEAK_LOAD` u otras body seeds abiertas;
- no convertir copy narrativa previa en diagnóstico médico factual.

### Relaciones y conocimiento

- NPC personales persistentes pueden conservar memoria cuando exista vía causal;
- captain/director/teammate de un club anterior no mantienen automáticamente el rol institucional después de un traspaso;
- conocimiento público y privado debe conservar su provenance;
- documental/media: únicamente lo publicado/conocido puede propagarse.

## Seeds/facts que 30–34 puede necesitar

Familias prioritarias, solo si fueron realmente creadas y siguen live/historical según su contrato:

- identidad de pico: `SEED_PEAK_IDENTITY`;
- grandes noches/finales: `SEED_BIG_GAME_BENCH`, `SEED_FINAL_BENCH`;
- récord: `SEED_RECORD_CHASE`, `SEED_RECORD_PUBLIC_TONE`;
- vestuario/capitanía: `SEED_LOCKER_ENDORSEMENT`, `SEED_MANAGER_POWER`;
- cuerpo: `SEED_PEAK_LOAD`, chronic/body/load memories aplicables;
- media: `SEED_DOCUMENTARY_ACCESS`, `SEED_DOCUMENTARY_FALLOUT`;
- rivalidades: `SEED_PUBLIC_RIVALRY`;
- mentor/sucesión: `SEED_MENTOR_ADVICE`, `SEED_SUCCESSOR_PEAK`, `SEED_SUCCESSION_DECISION`;
- selección: `SEED_NATIONAL_ROLE` y hechos reales de selección;
- agente: `SEED_AGENT_CONFLICT_PEAK`, `SEED_PARALLEL_NEGOTIATION`;
- táctica: `SEED_POSITIONAL_REINVENTION`;
- patrimonio: `SEED_WEALTH_STRUCTURE`;
- casa/familia/legacy: decisiones vigentes de home/family/public reputation;
- prioridad de transición: `SEED_AGE30_PRIORITY` cuando el canon de `EVT_29_FIN_001` la produzca.

`seedsRead` no equivale a consumo. El bloque siguiente debe usar la semántica live/historical/terminal integrada por T5.2.

## Principales bifurcaciones que deben llegar intactas

1. estabilidad en un club vs gran traspaso vs retorno/mercado alternativo;
2. poder contractual vs trampa de contrato;
3. capitanía formal vs liderazgo informal;
4. cuerpo sostenible vs carga/recurrencias;
5. selección consolidada vs fringe/exclusión/regreso;
6. reinvención táctica vs dependencia de atributos físicos;
7. agente alineado vs conflicto/negociación paralela;
8. patrimonio/seguridad económica vs priorización deportiva;
9. familia/home pull vs movilidad profesional;
10. reputación pública/documental/rivalidades vs privacidad y control;
11. legado de club y vestuario vs sucesión por jugadores más jóvenes.

## Invariantes para el agente 30–34

- no reinterpretar hechos históricos por el nuevo significado de un mismo event ID;
- no reescribir `SeedInstance.originEvent` de partidas antiguas;
- no asumir que una seed histórica sigue live;
- no asumir que un NPC conoce una decisión privada;
- no usar `reputation` como sustituto de selección, oferta o resultado deportivo;
- no mover al jugador de club con effects narrativos;
- no inventar fixtures/resultados;
- recalcular targets institucionales tras cada cambio de club;
- conservar determinismo y compatibilidad save/load.
