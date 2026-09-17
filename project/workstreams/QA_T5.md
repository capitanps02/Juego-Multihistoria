# QA T5 — regresión y auditoría independiente

Rama: `qa/t5-regression`  
Re-ground actual: `main@fa3c8bae524fef62e4eb9802e895df88588998c4`  
Owner: QA independiente

QA intenta falsar invariantes. No reescribe canon ni corrige silenciosamente runtime de otros workstreams. Los defectos de runtime se convierten en reproducciones, issues y handoffs acotados; no se pide a Codex duplicar un fix ya existente en la rama propietaria.

## Estado verificado 2026-09-17

- T5-QA-016 — **OPEN / P1 / owner-fix exists** — `main` conserva los bypasses de retirada; PR #118 implementa el fix dirigido y queda pendiente de re-ground/integración compatible con lineage. Issue #61. No duplicar desde Codex.
- T5-QA-021 — **RESOLVED** — baseline histórica de NPC knowledge v1 integrada; issue #92 cerrado.
- T5-QA-022 — **RESOLVED** — `footballMomentResults` se valida en el boundary de `loadSave`; issue #100 cerrado; probe QA usa un moment id registrado.
- T5-QA-023 — **RESOLVED** — PRS23 usa `facts.roleGuaranteeAt23` + `facts.roleDropSince23` con regresiones negativas; issue #109 cerrado.
- T5-QA-025 — **RESOLVED** — cierre de catálogo para historical seed consumers integrado; issue #131 cerrado.
- T5-QA-027 — **OPEN / P2 / future H owner implementation** — historical PR #122 está cerrado/no integrable; issue #133 exige que la futura LOCK23 H falle cerrado si no existe capitán autoritativo.
- T5-QA-028 — **OPEN / P1 / sequencing-blocked** — contract expiry zombie. Issue #130. Exact replay: run `35214465940`, job `105179515812`, artifact `10494278670`. `main@fa3c8b` integra hechos exactos de CareerOffer, no la transición autoritativa a empleo unattached; PR #156 debe fijar primero la frontera final de world simulation.

## T5-QA-028 evidence

`loyal / seed 512000`:
- first 0 months: `2029-06-01`, age 20;
- last observed 0 months: `2049-09-01`, age 41;
- 6669 total days at 0 months;
- 5694-day maximum continuous zero streak;
- 6669 days preserving same club/owner/registration/salary;
- 0 employment changes while at zero;
- 419 appearances added while contract remained at zero;
- narrative free-agency seed memory exists, but explicit employment authority does not prevent ordinary registered play.

El contrato de implementación ya está fijado en #130: `monthsRemaining=0` debe implicar empleo no activo/unattached como autoridad derivada; los strings del último club son provenance, no empleo vivo; football e institutional NPC deben fallar cerrado; los reads son 0 RNG; aceptar una nueva oferta formal reactiva empleo a través de la autoridad CareerOffer. No se introduce sentinel club ni una solución route-only.

PR #156 sigue abierto/draft y ya está re-groundado sobre `main@fa3c8b`; mueve el body del simulador a `world-simulator-core.ts`. Por eso Pass A debe aplicarse después sobre el boundary definitivo y no duplicarse en el layout anterior.

## Codex-ready QA

`analysis/CODEX/qa/implementation-ready.json` contiene **0 tareas ready** en este snapshot. Esto es intencional: #61 ya tiene owner fix, #130 espera #156 y #133 pertenece al owner LOCK23.

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
