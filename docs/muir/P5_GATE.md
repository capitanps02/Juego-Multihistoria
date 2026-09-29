# MUIR P5 — Auto-simulation / Period Summary gate

**P5_GATE: PASS**

## Authority

- P4 certified predecessor: `45371a41908e2ecdac71cfc5f2bf855f086f7866`
- P4 exact-head workflow `36565579642`: **SUCCESS**
- P3 certified predecessor retained: `3bb551e0701626d909cd42ffaa35b74e41d159b5`
- P5 branch: `ui-a3/muir-p5-autosim`
- P5 PR: `#877`
- Candidate certification SHA: `c104d292b0f168ff913d746e9635e52dc6799757`
- Candidate exact-head workflow: `36571220138` = **SUCCESS**
- Candidate evidence artifact: `muir-p5-c104d292b0f168ff913d746e9635e52dc6799757`
- Candidate artifact digest: `sha256:c09cf8c57a82c35920c187cd2a9a51df4ba691de3a9e8fab750e88c8c8f96621`
- Gameplay changes: **NONE**
- RNG changes: **NONE**
- Simulation logic changes: **NONE**
- Persistence authority changes: **NONE**

The final exact-head workflow on the documentation-closing commit is authoritative for the final certified P5 SHA.

## Public contract audited

Real auto commands remain exactly:

- `start`
- `step`
- `pause`
- `resume`
- `stop`

`PublicAutoSimulationState` remains the authority for `mode`, `maxWeeks`, `elapsedDays`, public `summary` and public `interruption`.

No private interruption provenance, private baseline, invented internal phases, invented season percentage, or non-public goals/assists are exposed by P5.

Presentation progress is derived only as:

`clamp(elapsedDays / (maxWeeks * 7), 0, 1)`

when the public values make that relation valid. It is never persisted.

## Auto-simulation / summary

- START: **PASS**
- RUNNING: **PASS**
- PAUSE: **PASS**
- RESUME: **PASS**
- STOP: **PASS** — real runtime semantics retained; stop remains paused-only
- INTERRUPTION: **PASS**
- DECISION INTERRUPTION: **PASS**
- PERIOD SUMMARY: **PASS**
- CONTINUE SIMULATION: **PASS**
- RETURN / HOME FLOW: **PASS**
- Period report regression: **PASS**

Critical transitions bypass the normal-tick presentation throttle and render immediately.

## Render telemetry

Dedicated predecessor probe at 390×844:

- logical ticks: 2
- days advanced: 14
- measured logical throughput: **3.821169277799049 Hz**
- visual full-shell updates: 4
- visual rate: **7.642338555598098 Hz**
- DOM full-shell replacements: **4**
- focus churn: **3**
- focused Pause control preserved: **NO**
- scroll: **320 → 0**

P5 candidate at 390×844:

- logical ticks: 5
- days advanced: 35
- measured logical throughput: **7.110352673492635 Hz**
- visual partial updates: 2
- visual rate: **2.844141069397054 Hz**
- DOM full-shell replacements during normal ticks: **0**
- focus churn: **0**
- focused Pause control preserved: **YES**
- scroll: **320 → 320**
- visual target `≤4 Hz`: **PASS**

The logical scheduler request remains exactly **140 ms** before and after P5. Higher measured logical throughput after P5 comes from removing blocking full-shell presentation work; command order/count, final snapshot and RNG/result state remain equivalent.

Across the three required portrait viewports, the candidate normal-tick visual rate is approximately **2.84–2.85 Hz**, with zero full-shell replacements, zero focus churn and preserved scroll.

## Equivalence

Evidence: `analysis/muir/p5/evidence/p5-equivalence.json`

- COMMAND EQUIVALENCE: **PASS**
- SNAPSHOT EQUIVALENCE: **PASS**
- RNG / RESULT STATE EQUIVALENCE: **PASS**
- SAVE / LOAD: **PASS**
- UI command sequence: 7 real `auto.step` commands with sequential expected revisions 1→7
- Final public boundary: `showing_summary`, `elapsedDays=56`, interruption `max_auto_weeks`

The compared runtime files `src/session/auto-simulation.ts` and `src/session/game-session.ts` remain byte-identical to the P4 certified predecessor.

## Viewports / accessibility

Evidence: `analysis/muir/p5/evidence/p5-states-a11y.json`

The 16 state/viewport checks passed for:

- RUNNING
- PAUSED
- PERIOD SUMMARY
- DECISION INTERRUPTION

at:

- 360×800: **PASS**
- 390×844: **PASS**
- 412×915: **PASS**
- 844×390 landscape: **PASS**

Additional exact-head candidate checks:

- deterministic viewport regression matrix: **PASS**
- P3 Home regression: **PASS**
- P2 shell regression: **PASS**
- serious/critical AXE findings in P5 state matrix: **0**
- accessible progress: **PASS**
- pause/resume/stop touch targets: **PASS**
- reduced motion: **PASS**
- live status does not announce each elapsed day: **PASS**
- normal-tick focus stability: **PASS**

## Background / resume

Evidence: `analysis/muir/p5/evidence/p5-background-resume.json`

Playwright Chromium lifecycle smoke (`frozen → active`):

- running simulation resumes without duplicate/stale command revisions: **PASS**
- paused simulation stays paused and emits no commands: **PASS**

This is browser lifecycle evidence, not physical Android lifecycle certification.

- Android offline package build: **PASS**
- Android offline regression: **PASS**
- Physical Android background/resume smoke: **DEFERRED to P11/P12**

## Shared-platform parity

Candidate workflow `36571220138`:

- shared package graph: **PASS**
- PlayCanvas package/tests: **PASS**
- Android offline clean package: **PASS**
- Android offline regression: **PASS**

P5 does not fork platform presentation authority; Web / PlayCanvas / Android continue to consume the shared web UI.

## Reproducible evidence

- `analysis/muir/p5/P5_BASELINE.md`
- `analysis/muir/p5/evidence/p5-autosim-probe.json`
- `analysis/muir/p5/evidence/p5-equivalence.json`
- `analysis/muir/p5/evidence/p5-states-a11y.json`
- `analysis/muir/p5/evidence/p5-background-resume.json`
- `analysis/muir/evidence/browser-baseline.json`
- `analysis/muir/screenshots/*.png`
- workflow artifact `muir-p5-c104d292b0f168ff913d746e9635e52dc6799757`

## Rollback

Revert P5 rather than changing `GameSession` if any later verification finds drift in command ordering, snapshot, RNG/result state, dates, interruptions, decision blocking, save/load, timer multiplicity or auto-simulation results.
