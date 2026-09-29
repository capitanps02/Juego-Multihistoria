# MUIR P5 — Auto-simulation / Period Summary — baseline audit

## Exact predecessor

- P4 certified SHA: `45371a41908e2ecdac71cfc5f2bf855f086f7866`
- P4 exact-head workflow: `MUIR P4 Microcopy` run `36565579642` = **SUCCESS**
- P3 certified SHA: `3bb551e0701626d909cd42ffaa35b74e41d159b5`
- P5 branch: `ui-a3/muir-p5-autosim`
- P5 branch created directly from the exact P4 certified SHA.
- Gameplay / RNG / persistence / market / contracts changes in this baseline pass: **NONE**

## Real runtime contract audited

`SessionCommand` exposes only these auto-simulation actions:

- `start`
- `step`
- `pause`
- `resume`
- `stop`

`PublicAutoSimulationState` exposes:

- `mode`
- `maxWeeks`
- `elapsedDays`
- `summary`
- `interruption`

Public modes are:

- `idle`
- `auto_simulating`
- `paused`
- `waiting_for_decision`
- `showing_summary`
- `season_transition`
- `retirement`

Public interruption types are:

- `decision`
- `offer`
- `important_injury`
- `national_selection`
- `role_change`
- `career_change`
- `season_complete`
- `season_transition`
- `retirement`
- `max_auto_weeks`

`PublicPeriodSummary` contains the public period dates/weeks, days/weeks simulated, appearances, form/fatigue/fitness deltas, club/role before+after, public world highlights, optional public period report, and a sanitized interruption (`type` + `requiresPlayerInput`). Internal interruption `source`, `priority`, `payload` and the private baseline do not cross the presentation boundary.

## Real loop

Production web UI currently schedules the next auto `step` with a `140 ms` timeout after a completed command.

Each `start` immediately invokes one logical auto step inside `GameSession`. Each subsequent UI `step` invokes the same `#runAutoStep`; the step advances at most seven simulation days and never changes the logical cadence because of presentation.

The current production `run()` path ends in `render(true)`. The current `render()` starts with `shell.replaceChildren()`, rebuilding the shell after each normal auto step.

## Certified P4 browser baseline reused by P5

Source: artifact `muir-p4-45371a41908e2ecdac71cfc5f2bf855f086f7866` from exact-head run `36565579642`.

Primary viewport `390×844`, `auto-running`:

- measured auto-sim UI mutation/update rate: **6.9646441886189265 Hz**
- render sample count in the P0/P4 probe window: **20**
- render P50: **0.3000000000029104 ms**
- render P95: **51.19999999999709 ms**
- focus changes recorded by the existing probe: **8**
- scroll events recorded by the existing probe: **0**
- UI mutation batches: **17**
- UI mutation records: **110**

The existing scroll metric is not enough to prove scroll stability because replacing `<main>` can discard `scrollTop` without generating a scroll event. P5 therefore adds a direct scroll-position preservation probe.

## Unsupported mockup concepts

P5 MUST NOT display these unless the public contract changes in a separately authorized scope:

- internal pipeline phases such as “Entrenamiento → Partido → Eventos → Estadísticas”;
- invented season percentages;
- invented goals/assists for the period;
- private interruption provenance (`source`, `priority`, `payload`);
- private simulation baseline values.

## Progress formula

The current runtime semantics make total configured auto days equal to:

`totalDays = maxWeeks * 7`

and `#runAutoStep` computes remaining days from exactly that relation. Presentation may therefore derive:

`progress = clamp(elapsedDays / (maxWeeks * 7), 0, 1)`

only when `maxWeeks` is a positive finite integer and `elapsedDays` is finite. This is presentation-only and MUST NOT be persisted.

## Baseline risks

1. Full shell rebuild per normal auto step.
2. Visual cadence tracks logical dispatch cadence (~140 ms scheduler plus command/persistence cost).
3. Focus can be moved by `render(true)` on normal ticks.
4. Replacing `main` can silently reset scroll position even when no scroll event is observed.
5. Preview and production web have separate auto-loop presentation code and require parity checks.
6. Critical transitions (pause/resume/interruption/decision/offer/summary/error) must bypass any later visual throttle.
