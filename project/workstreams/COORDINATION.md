# Multihistoria / Carrera de Futbolista — Panel de coordinación

**Última revisión:** 2026-09-16  
**Autoridad:** conversación coordinadora principal / integrador de `main`  
**Repositorio:** `capitanps02/Juego-Multihistoria`  
**Rama de integración:** `main`

> GitHub, código ejecutable y CI prevalecen sobre resúmenes históricos. Auditoría, planificación o un PR verde no equivalen por sí solos a una pasada cerrada.

## Estado de `main`

SHA actual tras los últimos merges coordinados:

`27755444abeb55e9886c24facad97e67df28a180`

Integrado recientemente:

- PR #11 — QA T5 independiente.
- PR #16 — freeze exacto pre-T5.1.
- PR #8 — infraestructura base T5.2 seed lifecycle.
- PR #20 — sincronización del roadmap/tracking.
- PR #23 — baseline schema-8 corregido + `test-saves` dentro del gate normal.
- PR #12 — auditoría canónica 23–30, condicionales, fichas y readiness; sin runtime.

No se acredita porcentaje adicional por estas integraciones mientras las pasadas T5 no cumplan su criterio completo.

## Base funcional y progreso

- 388 eventos estructurados = 254 principales + 134 condicionales.
- 210 seeds.
- 20 NPC persistentes.
- 20 familias de epílogo.
- save schema 8.
- session version 2 actual; una migración T5.1 puede requerir versionado explícito nuevo.
- RNG separado: `narrative`, `football`, `microfeed`, `qa`.

Estado de pasadas:

- T1 completa.
- T2.1–T2.5 completas.
- T3.1–T3.3 completas.
- T3.4 abierta: falta evidencia en teléfono Android físico.
- T4.1–T4.6 completas.
- T4.7/T4.8 omitidas por alcance; no ganan peso.
- T5.1 en curso.
- T5.2 infraestructura base integrada, pasada todavía `in_progress` hasta reconciliar destino de las 210 seeds.
- T5.3 en PR #9, pendiente de integración consolidada.

**Progreso ponderado acreditado: 33,51 %.**  
**Pasadas cerradas: 15.**

## Freeze pre-T5.1

Baseline integrado:

- build `0.8.0-t2.5`;
- session v2;
- save/GameState schema 8;
- 388 eventos = 254 + 134;
- `contentIdentity = 2e07efd2ea99c4e9ec4c2b20ae89664204f76db2c55a72d567208799c01bccff`.

Artefactos:

- `qa/fixtures/t5.1/pre-t51-event-catalog.json`;
- `qa/fixtures/t5.1/pre-t51-content-manifest.json`;
- `scripts/freeze-t51-baseline.mjs`.

El freeze es evidencia/compatibilidad; no entra en scheduling y no resuelve la migración.

## Auditoría canónica

### 18–23 — PR #10

Auditoría completa preparada y audit-only:

- 63 principales: 18 `verified_same_identity`, 39 `needs_reimplementation`, 6 `canonical_missing`.
- 32 condicionales: 10 `needs_reimplementation`, 15 `canonical_missing`, 7 `requires_manual_review`.
- blockers compartidos formalizados: `SESSION_CONTENT_MIGRATION`, `CHOICE_ELIGIBILITY`, gates OR/derived facts, legacy history y certificación final de callbacks.

PR #10 debe re-groundearse sobre el main actual y pasar CI exacto antes de integrar la auditoría.

### 23–30 — INTEGRADO por PR #12

- 91/91 principales clasificados.
- 23–26: 25 verified + 15 reimplementación.
- 26–30: 25 reimplementación + 22 canonical missing + 4 candidatos no aprobados.
- 44/44 condicionales con planning semántico revisado; ninguno certificado full-canonical en runtime.
- 15 fichas 23–26 preparadas; 10 scene-level waiting identity y 5 dependencias transversales.

### 30–34 — PR #13

- 50/50 principales clasificados.
- 45 `needs_reimplementation`.
- 5 `canonical_missing`.
- 0 `verified_same_identity` bajo comparación estricta.
- 26 condicionales todavía con deuda de reconciliación/certificación.

PR contiene contenido activo y queda bloqueado por migración #24/#25.

### 34+ — PR #15

- 50 principales clasificados.
- 4 `verified_same_identity`.
- 3 aliases aprobados y preservados por seguridad histórica.
- 13 `needs_reimplementation`.
- 30 `canonical_missing`.
- 43/50 todavía no acreditan implementación canónica completa.

También contiene cambios runtime y queda bloqueado por #24/#25. Retirada post-anuncio sigue siendo una decisión canónica separada: no aprobar `closed -> playing`; cualquier reconsideración pre-cierre debe ser explícita y probada.

## T5.2 — Seeds

Infraestructura base integrada.

PR #19 contiene follow-up pendiente:

- limpia `HAS_SEED_*` fantasma;
- asigna 210/210 seeds a exactamente un owner canónico;
- 18–23: 31 seeds, 10 sin consumidor;
- 23–30: 59 seeds, 30 sin consumidor;
- 30–34: 52 seeds, 4 sin productor y 45 sin consumidor;
- 34+: 68 seeds, 68 sin productor y 68 sin consumidor.

Regla: **canon first, wiring second**. No conectar consumers/terminales a shells genéricos solo para mejorar métricas.

PR #21 fue cerrado como duplicado/superseded por #19.

PR #19 debe re-groundearse sobre el main actual y conservar el gate de save de #23.

## T5.3 — NPC / conocimiento

PR #9 implementa:

- conocimiento deny-by-default;
- vías explícitas `witnessed/informed/public/reported`;
- memoria strong/temporary/practical;
- gates `know.*`;
- persistencia de relaciones y conocimiento;
- protección contra fuente NPC que no conoce el hecho;
- no inferencia desde `npcRefs`;
- privacidad del ViewModel.

Pendiente antes de merge:

1. integrar primero QA #17 + seed hardening #19;
2. re-ground #9 sobre ese main;
3. resolver T5-QA-008: knowledge persistido malformado no puede satisfacer `npcKnows`;
4. conservar lifecycle T5.2 + flags + knowledge + QA en un único resolver;
5. ejecutar gates T5.2/T5.3/QA juntos.

## QA T5

PR #17 añade la segunda capa adversarial:

- `qa:t5:integration`;
- `qa:t5:saves`;
- freeze sentinel;
- probes T5.2/T5.3;
- malformed knowledge;
- correcciones del harness.

Debe re-groundearse sobre `main` posterior a #23/#12 y eliminar duplicación del fix v8 ya integrado, conservando únicamente los probes/gates QA.

Orden preferido:

`#17 -> #19 -> #9`

Cada paso debe re-groundear y revalidar el siguiente.

## Migración contentIdentity — NUEVO CRITICAL PATH

Issue #24:

`T5 integration: explicit session/contentIdentity migration from frozen pre-T5.1 catalog`

Rama:

`integration/content-migration-t51`

PR draft:

#25 `T5.1 integration: explicit session/contentIdentity migration`

Contrato versionado:

`project/workstreams/T51_CONTENT_MIGRATION.md`

Principios:

- no relajar `contentIdentity`;
- identities desconocidas se rechazan;
- history/journal se preservan como verdad histórica;
- pending legacy conserva la definición que el jugador vio;
- legacy definitions sirven para compatibilidad, nunca scheduler;
- exact-ID semantic collisions requieren procedencia/fingerprint;
- migración consume cero RNG y agenda cero escenas;
- receipts/revision/market/seeds/NPC/retirement/epilogue factual se preservan;
- migración determinista e idempotente.

Existe diseño histórico útil en la rama archivada `chore/chatgpt-codex-workflow` (`SESSION_CONTENT_MIGRATION_CONTRACT`, runtime audit, Session v3 spec, test matrix). Reutilizar selectivamente; PR #1 no debe mergearse completo.

#25 debe integrarse antes de cualquier PR que cambie el catálogo activo (#13/#15 y futuros T5.5–T5.35).

## Presentación / Android — PR #14

Puede avanzar en paralelo si:

- no toca canon;
- UI solo consume contrato público;
- no expone seeds/flags/agendas/memoria interna;
- mantiene offline + IndexedDB;
- conserva QA T5 del main.

PR #23 ya resolvió el baseline v8 que bloqueaba su gate. Próximos pasos de #14:

1. re-ground sobre main nuevo;
2. Repository Integrity verde;
3. Android presentation candidate verde;
4. resolver contrato público de contactos tras T5.3.

T3.4 seguirá abierta hasta evidencia física real.

## PRs archivados/superseded

- #1 cerrado: rama histórica de planning, no mergear wholesale.
- #3 cerrado: superseded por #10 + #24/#25.
- #5 cerrado: superseded por #12 + #24/#25.
- #7 cerrado: superseded por #12 + #24/#25.
- #21 cerrado: duplicado de #19.

Las ramas archivadas pueden conservarse como evidencia/documentación.

## Orden de integración vigente

1. Re-ground e integrar #17 (QA transversal) cuando exact HEAD quede verde.
2. Re-ground #19 sobre ese main, ejecutar T5.2 + QA, integrar si verde.
3. Re-ground #9 sobre #17+#19, resolver malformed knowledge y ejecutar T5.2/T5.3/QA; integrar si verde.
4. Re-ground #14 sobre el main consolidado; integrar únicamente capa de presentación si workflows verdes. T3.4 sigue abierta.
5. Implementar e integrar #25 (content migration).
6. Tras #25, re-ground #13/#15 y futuros lotes de contenido; activar escenas por batches pequeños con migration mappings explícitos.
7. Resolver contratos transversales adicionales (`CHOICE_ELIGIBILITY`, OR/derived gates, offer/session bridges, football outcome hooks) cuando bloqueen el siguiente lote real.

## Reglas de integración

- usar `expected_head_sha` al mergear;
- no integrar branches en movimiento sin revisar HEAD exacto;
- no debilitar tests para hacer pasar un PR;
- no regenerar el freeze para aceptar contenido nuevo;
- no usar igualdad de ID/título como prueba de canon;
- no fusionar runtime content antes de #25;
- no acreditar porcentaje por auditorías/QA parciales.

## Siguiente cuello de botella

**Consolidar #17 -> #19 -> #9 mientras se implementa en paralelo #25.**

Después de #25, el cuello de botella pasa a ser la ejecución masiva de los lotes canónicos T5.5–T5.35 con seeds/NPC/migración ya estabilizados.
