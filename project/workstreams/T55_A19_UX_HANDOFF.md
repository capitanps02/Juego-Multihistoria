# T5.5 A19 — UX / gameplay UI handoff

## Ownership

A19 owns presentation and player comprehension only. It does **not** own sports simulation, consequences calculation, auto-simulation state, retirement eligibility, save semantics, scheduler rules or narrative canon.

## Implemented

- onboarding explains that matches are simulated and decisions drive the career;
- Forma / Estado físico / Fatiga have player-facing definitions;
- Carrera consumes A15 factual season records and latest-match output;
- meaningful empty state before debut;
- Mundo communicates continuous simulation even without a decision;
- Relaciones uses `knownPlayerContacts(...)` and displays a bond category without exposing relationship axes;
- player-facing `Código de historia` replaces technical “Semilla” wording;
- Partida actual / Copia anterior / retry copy is explicit;
- loading, saving and import verification use distinct progress copy;
- the date control visibly advertises that it opens Partida;
- A14 `simulation.summary` is presentation-ready when its runtime is integrated;
- A16 `visibleEffects / narrativeEffects / hiddenEffects` are rendered when present, without remapping;
- retirement `decided / announced / closed` states are presented from real runtime state;
- closed careers expose final factual totals plus Ver carrera / Empezar otra historia CTAs;
- responsive rules cover phone (390), tablet (<=820) and bounded desktop (~1440).

## Dependencies / merge order

1. #740 — injury/debut blocker
2. #741 — A15 sports-core
3. #745 — A14 integration candidate
4. #743 — A16 consequences
5. #748 — A17 invariants/terminality
6. #746 — A19 UX, restacked after upstream contracts stabilize

A19 was originally stacked on an earlier #741 head. #741 has continued moving. **Do not merge #746 as-is ahead of the final A15 head.** Restack A19-owned files after the upstream merge train stabilizes.

## A17 retirement limitation

#748 currently guarantees retirement terminality and canonical guards but does not expose a player-facing eligibility predicate or a GameSession command for initiating retirement. A19 therefore does not invent `canRetire` or a second state machine. The requested “Considerar retirada” control remains blocked on an explicit upstream contract.

## A19-owned files

- `web/game-ui.js`
- `web/game-ui.css`
- `src/session/game-session.ts` (presentation projection only)
- `scripts/test-t55-a19-ui.mjs`
- `scripts/test-playcanvas.mjs` (public-view expectation)
- `package.json` (test wiring)
- `.github/workflows/t55-a19-ui.yml`

When restacking, preserve upstream changes in shared files and reapply only the A19 presentation deltas.

## Certification

Dedicated gate: **T5.5 A19 UX**

- `node --check web/game-ui.js`
- `npm run build`
- `node --test scripts/test-t55-a19-ui.mjs`

Global Repository Integrity remains authoritative for the final integrated branch.
