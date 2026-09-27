# PLAYER_ACTIONS_FINAL_QA — A6

**Estado:** CERTIFIED  
**Recomendación técnica actual:** MERGE  
**Repositorio:** `capitanps02/Juego-Multihistoria`  
**BASE_SHA pre-feature:** `2cc068cb705214ba827677ab02d8d1668e8677ec`  
**Release candidate A6:** `a6/player-actions-release-qa@3963b6197884009e56552d3625e84960efda22fb`  
**Full integration base:** PR #813 / `05754957010aa14d987070e93c926e6accaf6a76`  
**Frozen certification:** PR #817 / run `36328869866` — SUCCESS  
**A6 QA PR:** #805 — QA-only, no auto-merge  
**Fecha:** 2026-09-27

> Cierre A6: los 15 gates de release están PASS y el stress full-career de §44 también está cerrado con 24/24 carreras completas, 0 crashes y las seis políticas cubiertas sobre el mismo release candidate.

## 1. Resumen ejecutivo

Player Actions V1 ha completado la integración A0–A6.

Superficie final:

- **20/20 Player Actions runtime**;
- **31/31 opciones runtime**;
- 7 categorías: career, training, health, representative, relationships, image, life;
- targets públicos authority-backed;
- facts A3 con scopes/lifecycles;
- UI Preview/Web/PlayCanvas;
- shared cooldown groups;
- contextual eligibility;
- closed effect registry;
- save/load y legacy save;
- auto-simulation gating;
- anti-grind y market-abuse controls.

Candidato final bajo QA:

`a6/player-actions-release-qa@3963b6197884009e56552d3625e84960efda22fb`

El delta A6 respecto a #813 es acotado:

- fix UI de `Volver a carrera` tras resultado;
- assertion A4 que lo bloquea;
- artefactos PlayCanvas regenerados/versionados.

No hay cambios A6 en balance, catálogo, autoridad, mercado, contratos, RNG, selección, retirement ni simulación.

### Resultado congelado #817

Workflow:

`Player Actions final QA — run 36328869866 — SUCCESS`

Jobs:

- refresh_integrated_artifacts — PASS
- integrated_safety — PASS
- artifact_freshness — PASS
- browser_e2e — PASS
- open_contract_gaps — PASS
- balance_market_performance — PASS

### Findings abiertos

- P0: **0**
- P1: **0**
- P2 injustificados: **0**
- P3: **0 bloqueantes**

Los P2 históricos de targets, catálogo parcial, training/rest grind, eligibility, bundle stale y result-back UI están corregidos y re-testados.

## 2. Inventario A0–A5

| Agente | Estado final A6 | Evidencia |
|---|---|---|
| A0 | COMPLETE | Arquitectura, invariantes, ownership y ZERO_ACTION contract. |
| A1 | COMPLETE | Core + closed V1 effect registry; 31 registered option routes; no arbitrary path/callback authority. |
| A2 | COMPLETE | GameSession, revision/fingerprint, replay, persistence, rollback, public targets/history, legacy save. |
| A3 | COMPLETE | Facts, historical/live, scopes, position change, withdraw transfer, career priority, market/narrative consumers. |
| A4 | COMPLETE | Preview/Web/PlayCanvas target-aware UI, optionality, responsive/mobile, result-back wiring. |
| A5 | COMPLETE / BACKEND V1 CERTIFIED | 20/20 actions, 31/31 options, eligibility, groups, balance, copy, effects; exact-head workflow green. |

A5 exact-head certification:

- PR #802;
- certified HEAD `fd273cbde555623ec71ccd79646da72d873656eb`;
- Player Actions A5 Content run `36327065144` — SUCCESS.

Full integration:

- PR #813;
- head `05754957010aa14d987070e93c926e6accaf6a76`;
- Full Integration run `36327330528` — SUCCESS.

## 3. Baseline / existing regression

Baseline pre-feature:

`main@2cc068cb705214ba827677ab02d8d1668e8677ec`

Frozen safety #817:

- integrated product suites: **183/183 PASS**;
- persistence regression: **3/3 PASS**, incluyendo 100-cycle persistence loop;
- A6 cross-system probes: all selected probes PASS;
- PlayCanvas/A19: **11/11 PASS**.

Full integration #813:

- A1–A5/A2/A4 contracts: **171/171 PASS** en ese integration head;
- one-year anti-grind PASS;
- PlayCanvas build/regression PASS.

**PA-GATE-01 BUILD = PASS**  
**PA-GATE-02 EXISTING REGRESSION = PASS**

## 4. ZERO_ACTION_EQUIVALENCE

Final integrated gate ejecutado en #817.

Seeds:

`1, 2, 7, 42, 77, 125, 777, 2026, 424242`

Ventanas:

- 28 días;
- 84 días;
- 365 días.

Metodología:

- baseline y candidate con misma seed/session config;
- baseline decide comando canónico;
- mismo comando se reproduce en candidate;
- snapshot completo comparado tras cada comando;
- incluye rngState, history, seeds, market, sport, professional, retirement, age milestones y pending state;
- zero-action candidate no materializa PlayerActionState.

Final:

- checkpoints: **27/27 PASS**;
- diferencias causales: **0**;
- candidate vs pre-feature: exact equivalence.

**PA-GATE-03 ZERO_ACTION_EQUIVALENCE = PASS**

## 5. GETVIEW / read purity

A6:

- `getView()` ×1000;
- availability/facts reads ×1000;
- snapshot antes/después idéntico;
- no cooldown nuevo;
- no facts expirados/limpiados;
- no seeds;
- no RNG;
- no materialización del store cuando no procede.

**PASS**

## 6. Determinismo / RNG

Cubierto por:

- A6-003 deterministic command/action sequence;
- A6-004 immediate RNG preservation;
- A6-019 future narrative RNG equivalence;
- A3-010 / A3-020 no extra RNG;
- final zero-action cross-version gate.

Extra narrative draws atribuibles a Player Actions:

**0**

**PA-GATE-04 RNG = PASS**

## 7. Session atomicity / command protocol

A6 cubre:

- commandId;
- fingerprint;
- expectedRevision;
- replay;
- command ID reuse;
- concurrent same-revision dispatch;
- stale revision;
- decision collision;
- offer collision;
- retirement collision.

Double click:

- 20 same-revision commands;
- 1 fulfilled;
- 19 `STALE_REVISION`;
- 1 history row;
- 1 cooldown;
- 1 revision advance.

Replay:

- `replayed=true`;
- no second effect/history/fact/cooldown.

**PA-GATE-05 SESSION_ATOMICITY = PASS**

## 8. Persistence / save compatibility

A6 evidence:

- persistence failure → total rollback;
- revision/state/history/facts/cooldown remain unchanged;
- save → load → continuation exact;
- legacy save without `playerActions` loads read-pure and materializes lazily on first action;
- malformed stores fail closed;
- invalid dates/history/facts/sequence rejected.

Frozen #817 persistence:

**3/3 PASS**

**LEGACY SAVE = PASS**  
**PA-GATE-06 SAVE_COMPATIBILITY = PASS**

## 9. Authority matrix

Player Actions cannot directly mutate:

- club;
- ownerClub;
- registrationClub;
- contract terms;
- salary;
- release clause;
- market.pending;
- national caps/role;
- appearances/results;
- captaincy;
- retirement;
- narrative event history;
- seeds.

Adversarial unknown effect key:

- fail closed;
- no mutation.

Specific causal actions:

- transfer request → fact/intention, not offer;
- renewal request → fact/intention, not contract mutation;
- more minutes → no appearances/starter/result mutation;
- agent market query → no synthetic CareerOffer.

Authority violations:

**0**

**PA-GATE-07 AUTHORITY = PASS**

## 10. Fact scope / historical vs live / privacy

A3 final suite: **20 tests**.

Certified:

- coach scope;
- club scope;
- contract resolution;
- representation scope;
- historical vs live;
- transfer withdrawal closes live request but preserves history;
- position-change fact is coach/club scoped;
- career priority representative-scoped;
- no global NPC knowledge leak;
- no fake offer proxy;
- no extra RNG;
- save/load derived facts identical.

Player Actions do not create fake EventDefinitions or synthetic seeds.

**PA-GATE-08 FACT_SCOPE = PASS**

## 11. Auto-simulation / state machine

Covered states:

- idle;
- auto_simulating;
- paused/stop;
- decision;
- result;
- offer;
- season flow;
- retirement/closed.

Auto-sim regression is part of frozen product suites and is green.

No duplicate week / lost week / hidden RNG advance found.

**PA-GATE-09 AUTO_SIM = PASS**

## 12. Content validation

Runtime final:

- **20 actions**;
- **31 options**;
- **7 categories**.

A5 final content suite contains **77 content tests**, including:

- unique IDs/categories/options;
- closed effect registry;
- valid facts;
- target contract;
- no forbidden authority;
- no narrative RNG;
- age validity;
- full copy/spec/balance/eligibility coverage;
- canonical 24-month renewal horizon;
- shared cooldown groups;
- anti-target-cycling;
- body-context gates;
- transfer request/withdraw mutual exclusion;
- exact registered runtime subset;
- all 20 actions/31 options exposed;
- A3 fact routing/lifecycle.

A6-015/015A/020/021:

**4/4 PASS** on frozen candidate.

**PA-GATE-10 CONTENT = PASS**

## 13. Cooldowns / calendar / conflicting actions

A6-010 validates:

- day 0 blocked;
- N-1 blocked;
- N available;
- year rollover;
- leap-day handling.

Causal cooldowns:

- must be strictly later than inclusive fact lifecycle;
- A6-023 PASS.

A5 shared cooldown groups prevent target cycling / family alternation.

Transfer request vs withdrawal:

- mutually exclusive live contexts;
- withdrawal preserves immutable request history;
- does not reset original request cooldown.

**PASS**

## 14. Anti-grind / balance

Frozen #817 exact-candidate result:

**PA-GATE-11 ANTI_GRIND = PASS**

10-seed A6 cross-check:

Training:
- average actions: 11/year;
- baseline technique: 62;
- final average: 63.65;
- delta: **+1.65**;
- budget: <= +6.

Rest:
- average actions: 2/year;
- fitness: **81.03**;
- fatigue: **18.32**;
- budgets: fitness <=94, fatigue >=7.

Mixed:
- average actions: 17.8/year;
- fitness: **80.375**;
- fatigue: **21.07**;
- budgets: fitness <=95, fatigue >=5.

A5 official one-year stress:

- 20 seeds;
- 80 careers;
- 0 anti-grind gate failures.

Old REST/TRAINING exploit is closed.

## 15. Market exploit

1000-seed A6 probe:

- baseline transfer rate: 0.381;
- requested transfer rate: 0.499;
- baseline threshold: 38;
- requested threshold: 50;
- repeated request threshold: **50** — no stacking;
- immediate synthetic offers: **0**;
- result: PASS.

Request changes an existing authorized producer threshold but never fabricates an offer.

## 16. Performance / save size

Frozen benchmark:

- `getView`: ~**0.356 ms** mean;
- availability projection: ~**0.049 ms**;
- save serialization: ~**0.148 ms**;
- Player Action execution: ~**0.257 ms**.

One-year final-candidate save sizes:

- none average ~92 KB;
- training-heavy average ~103 KB;
- rest-heavy average ~96 KB;
- mixed average ~104 KB;
- mixed max ~108 KB.

No release-level performance regression detected.

Full-career save-size evidence remains the only supplemental stress still executing.

## 17. Preview E2E

Frozen browser certification:

Flow:

career → manage → Carrera → coach target → more minutes → result → back to career/simulation.

Result:

**PASS**

Result-back regression fixed:

`Volver a carrera -> simulation home / Simular visible`

**PA-GATE-12 PREVIEW = PASS**

## 18. PlayCanvas

Final release artifact:

- modules: **161**;
- bytes: **17,536,811**;
- SHA-256: `50dc06e51289898b638b7cf0c5157ce1e212f7762a4a922b22ce3a0cd9603d21`.

Frozen #817:

- rebuild PASS;
- artifact freshness PASS;
- PlayCanvas/A19 regression **11/11 PASS**.

**PA-GATE-13 PLAYCANVAS = PASS**

## 19. Mobile / accessibility / optionality

Real Chromium E2E:

- **360×800 PASS**
- **390×844 PASS**
- **430×932 PASS**

Checks include:

- no horizontal overflow;
- target selector;
- action execution/result;
- back navigation;
- Simular recovered;
- disabled button semantics/basic accessibility.

Optionality:

- SIMULAR remains primary;
- Player Actions entry secondary;
- explicit optionality copy;
- no 3/3;
- no mandatory-task warning;
- no incomplete bar.

**PA-GATE-14 MOBILE = PASS**  
**PA-GATE-15 OPTIONALITY_UX = PASS**

## 20. Gate table

| Gate | Final release result |
|---|---|
| PA-GATE-01 BUILD | PASS |
| PA-GATE-02 EXISTING REGRESSION | PASS |
| PA-GATE-03 ZERO_ACTION_EQUIVALENCE | PASS |
| PA-GATE-04 RNG | PASS |
| PA-GATE-05 SESSION_ATOMICITY | PASS |
| PA-GATE-06 SAVE_COMPATIBILITY | PASS |
| PA-GATE-07 AUTHORITY | PASS |
| PA-GATE-08 FACT_SCOPE | PASS |
| PA-GATE-09 AUTO_SIM | PASS |
| PA-GATE-10 CONTENT | PASS |
| PA-GATE-11 ANTI_GRIND | PASS |
| PA-GATE-12 PREVIEW | PASS |
| PA-GATE-13 PLAYCANVAS | PASS |
| PA-GATE-14 MOBILE | PASS |
| PA-GATE-15 OPTIONALITY_UX | PASS |

**Release gates: 15 PASS / 0 FAIL / 0 BLOCKED**

## 21. Test evidence summary

Frozen safety/product path:

- integrated product tests: **183/183 PASS**;
- persistence: **3/3 PASS**;
- A6 probes: 24 unique probes, all executed across safety + contract jobs with **0 FAIL**;
- PlayCanvas/A19: **11/11 PASS**;
- public-target/authority-change contract: PASS;
- ZERO_ACTION: 27/27 checkpoints PASS.

Additional:

- A5 content tests: 77 authored;
- browser Preview/Mobile: PASS;
- anti-grind: PASS;
- 1000-seed market abuse: PASS;
- artifact freshness: PASS.

## 22. Findings / fixes

Closed P2 findings:

1. public target actions unreachable — FIXED;
2. catalog 6/20 — FIXED → 20/20;
3. training grind — FIXED;
4. rest/recovery exploit — FIXED;
5. active-employment eligibility — FIXED;
6. renewal-window eligibility — FIXED;
7. stale committed PlayCanvas bundle — FIXED;
8. result-back navigation — FIXED.

QA harness-only false reds corrected:

- invalid retirement snapshot;
- invalid future-RNG snapshot;
- ambiguous mobile category selector;
- benchmark cooldown setup;
- old target/agent authority snapshot receipts.

No product regression was hidden as a harness failure.

## 23. Full-career stress — PASS

QA-only sharded stress final:

- PR #823;
- workflow `Player Actions long-career stress parallel`;
- run `36329871587`;
- product base exacta: `a6/player-actions-release-qa@3963b6197884009e56552d3625e84960efda22fb`;
- el delta QA sólo añade harness/workflow de stress.

Cobertura:

- **24 unique seeds**;
- **24/24 carreras llegaron a epílogo**;
- **0 crashes**;
- 6 políticas;
- 4 carreras por política;
- cadencia de resiliencia full-career: bloques de 28 días;
- el stress agresivo semanal separado ya está cubierto por PA-GATE-11.

Políticas y resultados:

| Política | Carreras | Acciones totales | Media acciones | Max save | Max history | Max facts | Max cooldowns |
|---|---:|---:|---:|---:|---:|---:|---:|
| none | 4 | 0 | 0 | 417,698 B | 0 | 0 | 0 |
| training-heavy | 4 | 320 | 80.00 | 486,197 B | 108 | 43 | 3 |
| career-aggressive | 4 | 185 | 46.25 | 449,881 B | 51 | 51 | 7 |
| rest-heavy | 4 | 325 | 81.25 | 384,210 B | 85 | 45 | 5 |
| mixed | 4 | 1,637 | 409.25 | **572,697 B** | **424** | **158** | 13 |
| random-valid-action | 4 | 1,479 | 369.75 | 543,483 B | 376 | 101 | **25** |

Consolidado:

- carreras completas: **24**
- unique seeds: **24**
- Player Actions ejecutadas: **3,946**
- crashes: **0**
- max save: **572,697 bytes**
- max history entries: **424**
- max fact entries: **158**
- max cooldown entries: **25**
- runtime medio aproximado: **7,489 días/carrera**
- save medio aproximado: **438,970 bytes/carrera**

Conclusión:

- ninguna política impide llegar a retirement/epilogue;
- no aparecen invalid states;
- el crecimiento de save sigue siendo lineal y acotado en esta muestra;
- el máximo observado (~0.57 MB) no justifica compactación pre-release;
- el sistema resiste uso repetido durante carreras de ~20 años.

**§44 LONG CAREER STRESS = PASS**

## 24. Residual risks

No quedan P0/P1/P2 release blockers.

Riesgos residuales no bloqueantes:

1. history/facts crecen linealmente con acciones; el peor full-career observado es ~0.57 MB, aceptable para V1;
2. el harness original semanal monolítico #820 puede seguir ejecutándose como evidencia extra, pero ya no es necesario para certificación porque #823 cubre 24 full careers sobre el mismo producto base;
3. warnings de deprecación Node/Actions observados pertenecen a tooling, no a Player Actions runtime.

No se recomienda compactación ni refactor preventivo antes de disponer de evidencia de un problema real.

## 25. Technical recommendation

**MERGE**

Condiciones cumplidas:

- 15/15 PA gates PASS;
- 24/24 full careers PASS;
- P0 = 0;
- P1 = 0;
- P2 injustificados = 0;
- ZERO_ACTION = 0 diferencias;
- RNG = PASS;
- rollback/replay/concurrency = PASS;
- legacy/malformed saves = PASS;
- authority/scope = PASS;
- auto-sim = PASS;
- content 20/20 + 31/31 = PASS;
- anti-grind = PASS;
- Preview/PlayCanvas/mobile = PASS;
- optionality UX = PASS;
- documentación A6 completa.

### A6 closure

**Estado final: CERTIFIED / RELEASE-READY**

Progreso A6: **100%**

Trabajo restante A6:

- **0 tareas**
- **~0 horas-agente equivalentes**

No mergear PRs QA-only (#817, #820, #823).  
Mergear únicamente la ruta de integración/release real que incorpore el release candidate certificado hacia `main`.
