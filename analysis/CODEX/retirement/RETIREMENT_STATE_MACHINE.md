# Retirement state machine

Runtime source: `src/simulation/late-career-engine.ts`.

## States

- `playing`: professional career active. Retirement context may exist but no terminal decision is committed.
- `decided`: private explicit player decision to retire. Career is still active and the announcement has not happened.
- `announced`: public retirement announcement exists. Career is still active until closure.
- `closed`: terminal professional state. Epilogue may be generated; professional activity must not resume.

The runtime intentionally does not persist a separate `considering` or `continue_decided` state. Contemplation is represented by context flags/events while status stays `playing`; choosing to continue therefore remains `playing` and event cooldowns prevent immediate repetition. This is valid only while it remains explicit and does not auto-retire.

## Diagram

```text
playing
  | explicit retirement choice
  v
decided
  | explicit public announcement            explicit pre-announcement reconsideration
  |-------------------------------------> announced
  |                                             |
  +---------------------> playing              | factual final phase / authorized close
                                                v
                                              closed
```

Legacy compatibility only:

```text
playing -- EARLY_RETIRED_30_34 + reason=early_retirement_30_34 --> decided --> announced --> closed
```

This bridge reconstructs an already-established legacy terminal fact. It is not a normal new-game shortcut.

## Valid transitions

| From | To | Preconditions | Authority/effect |
| --- | --- | --- | --- |
| playing | decided | explicit terminal choice | retirement-owned event + `syncRetirementState` |
| decided | announced | explicit announcement choice | `EVT_RET_ANNOUNCE_001` |
| decided | playing | `RECONSIDERATION_WINDOW` and an explicit valid reason | `CEVT_RET_RECONSIDER` / `reverseRetirement` |
| announced | closed | authorized close | `closeCareer` or inventoried terminal event reconciled through `syncRetirementState` |
| closed | closed | idempotent call | no-op |

## Prohibited transitions

- `playing -> announced` in normal current gameplay.
- `playing -> closed` in normal current gameplay.
- `announced -> playing`.
- `closed -> playing`.
- automatic retirement because of age, zero offers, contract expiry or injury.
- public announcement from a timer/fallback without an explicit choice.

## Side effects

### decided

- sets decision date/age and optional reason;
- marks private retirement context;
- does not set `RETIRED`;
- does not generate epilogue.

### announced

- sets announcement date;
- sets public announcement flags;
- snapshots aggregate appearances at announcement;
- starts observing post-announcement appearance deltas;
- does not close career.

### closed

- sets closed date and closure type;
- sets `RETIRED=true`;
- prevents normal late-career simulation from continuing;
- generates epilogue idempotently.

## Invariants

1. `closed` is terminal.
2. `generateEpilogue()` is idempotent.
3. retirement closure consumes 0 RNG by design.
4. no terminal event increments appearances or creates a goal/result.
5. no-market is context until the player explicitly chooses retirement.
6. post-announcement offers cannot reopen the public announcement.
7. save migration must not retire an active legacy save merely because of age.
8. pending legacy decisions resolve against their frozen definition/fingerprint.

## Known provisional edge

Current automatic administrative closure still relies on coarse contract/time information because authoritative remaining-fixture/season-end facts do not exist on `main`. Do not strengthen or reinterpret this as fixture authority. The final fixture-aware close must wait for the sport authority workstream.
