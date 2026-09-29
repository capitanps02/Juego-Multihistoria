# MUIR P5 — Auto-simulation / Period Summary gate

**P5_GATE: IN_PROGRESS**

## Authority

- P4 certified predecessor: `45371a41908e2ecdac71cfc5f2bf855f086f7866`
- P4 exact-head workflow `36565579642`: **SUCCESS**
- P3 certified predecessor retained: `3bb551e0701626d909cd42ffaa35b74e41d159b5`
- P5 branch: `ui-a3/muir-p5-autosim`
- Gameplay changes: **NONE**
- RNG changes: **NONE**
- Simulation logic changes: **NONE**

## Pass 1 state

- Runtime/public auto-simulation contract audited.
- Existing P4/P0 browser artifact recovered from exact certified predecessor.
- Current primary auto-sim visual update rate: **6.9646441886189265 Hz**.
- Current product scheduler requests the next auto step after **140 ms**.
- Current normal auto step ends in a full `shell.replaceChildren()` render.
- Dedicated P5 cadence/focus/scroll probe added; exact-head execution pending.

## Gate requirements

P5 cannot become PASS until all of the following are executable and green on the exact P5 head:

- public state/command audit;
- no invented progress/phases;
- running / pause / resume / stop;
- interruption and decision interruption;
- period summary and follow-up actions;
- visual refresh <= 4 Hz except critical forced transitions;
- zero focus churn on normal ticks;
- zero scroll reset on normal ticks;
- command equivalence;
- snapshot equivalence;
- RNG/result equivalence;
- save/load regression;
- 360×800 / 390×844 / 412×915 + landscape;
- accessibility;
- P4/P3/P2 regressions;
- PlayCanvas;
- reproducible evidence.

## Rollback

Any logical command, snapshot, RNG, result, date, interruption, save/load or pending-state drift requires reverting the P5 presentation change rather than altering `GameSession`.
