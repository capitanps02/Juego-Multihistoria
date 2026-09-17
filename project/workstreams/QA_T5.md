# QA T5 — regresión y auditoría independiente

Rama: `qa/t5-regression`  
Re-ground actual: `main@782b92c9a496293aeb33ad8b39f522a927374d6f`  
Owner: QA independiente

QA intenta falsar invariantes. No reescribe canon ni corrige silenciosamente runtime de otros workstreams. Los defectos de runtime se convierten en reproducciones, issues y tareas acotadas para Codex.

## Estado verificado 2026-09-17

- T5-QA-016 — **OPEN / P1** — retirada puede reabrirse desde `announced`, autoanunciarse por tiempo y autodecidirse por agotamiento de mercado. Issue #61.
- T5-QA-021 — **RESOLVED** — baseline histórica de NPC knowledge v1 integrada; issue #92 cerrado.
- T5-QA-022 — **OPEN / P1 / candidate PR blocker** — #93 no debe integrarse hasta validar `world.footballMomentResults` en load/save. Issue #100.
- T5-QA-023 — **OPEN / P2** — PRS23 no debe interpretar la seed genérica como promesa de minutos. Issue #109.
- T5-QA-025 — **RESOLVED** — cierre de catálogo para historical seed consumers integrado; issue #131 cerrado.
- T5-QA-027 — **OPEN / P2 / candidate PR blocker** — LOCK23 choice D sigue sin eligibility de captain en PR #122. Issue #133.
- T5-QA-028 — **OPEN / P1 / design-blocked** — contract expiry zombie. Issue #130. Exact replay on `main@782b92c9`: run `35214465940`, job `105179515812`, artifact `10494278670`.

## T5-QA-028 evidence

`loyal / seed 512000`:
- first 0 months: `2029-06-01`, age 20;
- last observed 0 months: `2049-09-01`, age 41;
- 6669 total days at 0 months;
- 5694-day maximum continuous zero streak;
- 6669 days preserving same club/owner/registration/salary;
- 0 employment changes while at zero;
- 419 appearances added while contract remained at zero;
- narrative free-agency seed memory exists, but explicit employment/free-agent signal does not.

`contractEmploymentStatus()` now reports `expired_pending_resolution`, which is a useful classifier but does not itself resolve registration/football/employment semantics. QA forbids a route-only or synthetic fix.

## Gates

- `qa:t5:fast`: determinismo/RNG, cruces de edad, carreras largas y regresiones cerradas.
- `qa:t5:content`: cierre referencial + ratchet de `seedsRead`.
- `qa:t5:freeze` / `qa:t5:saves`: contentIdentity, lineage, freeze y compatibilidad.
- `qa:t5:integration`: probes cross-workstream.
- `qa:t5:simulation`: 9 perfiles estratificados.
- `qa:t5:known-bugs`: reproducciones dirigidas de defectos abiertos; no debe maquillarse como gate verde.
- `scripts/test-t5-contract-expiry-known-bug.mjs`: reproducción reducida de T5-QA-028; deliberadamente fuera del gate verde hasta owner fix.
- `qa:t5:expensive`: 25 × 9 = 225 carreras; fuera del CI normal.

## Política de integración

QA no mergea su propio PR. Un fix externo pasa a `resolved` solo después de integración real, reproducción original/regresión owner-side verde y verificación del HEAD exacto disponible. Repository Integrity debe evaluarse sobre el nuevo HEAD de QA antes de recomendar integración.
