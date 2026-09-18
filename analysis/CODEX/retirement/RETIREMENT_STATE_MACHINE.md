# Retirement state machine

Runtime source: `src/simulation/late-career-engine.ts`.

## States

- `playing`: professional career active. Retirement context may exist but no terminal decision is committed.
- `decided`: private explicit player decision to retire. Career is still active and the announcement has not happened.
- `announced`: public retirement announcement exists. Career is still active until closure.
- `closed`: terminal professional state. Epilogue may be generated; professional activity must not resume.

The runtime intentionally does not persist a separate `considering` or `continue_decided` state. Contemplation is represented by context flags/events while status stays `playing`; choosing to continue therefore remains `playing` and event cooldowns prevent immediate repetition.

## Implemented diagram

```text
playing
  | explicit retirement choice
  v
decided
  | explicit public announcement            explicit private reconsideration
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

## Implemented transitions

| From | To | Preconditions | Authority/effect |
| --- | --- | --- | --- |
| playing | decided | explicit terminal choice | retirement-owned event + `syncRetirementState` |
| decided | announced | explicit announcement choice | `EVT_RET_ANNOUNCE_001` |
| decided | playing | `RECONSIDERATION_WINDOW` + explicit valid private reason | legacy `CEVT_RET_RECONSIDER` / `reverseRetirement` |
| announced | closed | authorized close | `closeCareer` or inventoried terminal event reconciled through `syncRetirementState` |
| closed | closed | idempotent call | no-op |

## Current prohibited transitions

- `playing -> announced` in normal gameplay.
- `playing -> closed` in normal gameplay.
- ordinary `announced -> playing`.
- every `closed -> playing`.
- automatic retirement because of age, zero offers, contract expiry or injury.
- public announcement from a timer/fallback without an explicit choice.

## Canonical exceptional reversal — planned, not implemented

The master 34+ canon contains **`CEVT_38_RETIREMENT_REVERSAL`**, which is distinct from the legacy private `CEVT_RET_RECONSIDER`.

Canon describes an exceptional comeback after a prior public announcement, caused by a concrete offer and carrying loss of rhythm, reputation and control. The current runtime must not reinterpret that as permission for arbitrary `announced -> playing`.

Because `closed` immediately terminates the headless simulation and generates an epilogue, the compatible planned model is a **narrow event-authorized `announced -> playing` exception before closure**. `closed` remains terminal.

This exception is blocked until #176 supplies an authoritative post-announcement CareerOffer producer/provenance that can distinguish the initial post-announcement contact from a later concrete comeback offer without ambiguous offer-bridge selection.

Exact implementation/QA contract:

`analysis/CODEX/retirement/CANONICAL_REVERSAL_CONTRACT.md`

Do not add `announced -> playing` to the ordinary transition table before that contract is satisfied.

## Side effects

### decided

- sets decision date/age and optional reason;
- marks private retirement context;
- does not set `RETIRED`;
- does not generate epilogue.

### announced

- sets announcement date;
- sets public announcement flags;
- snapshots aggregate appearances at announcement for legacy/current-main observation;
- does not close career.

### playing after private reconsideration

- increments reversal history once;
- records reconsideration date;
- removes private retirement-decision/announcement context;
- does not rewrite historical events.

### closed

- sets closed date and closure type;
- sets `RETIRED=true`;
- prevents normal late-career simulation from continuing;
- generates epilogue idempotently.

## Invariants

1. `closed` is terminal.
2. `generateEpilogue()` is idempotent; a generated epilogue is never erased to simulate a comeback.
3. retirement closure consumes 0 RNG by design.
4. no terminal event increments appearances or creates a goal/result.
5. no-market is context until the player explicitly chooses retirement.
6. an ordinary post-announcement offer does not itself reopen the career.
7. legacy `CEVT_RET_RECONSIDER` never becomes canonical `CEVT_38_RETIREMENT_REVERSAL` by ID remap or migration.
8. save migration must not retire or reopen an active legacy save merely because of age/history.
9. pending legacy decisions resolve against their frozen definition/fingerprint.
10. a future canonical reversal may apply contract terms only through `respondToOffer()` / offer bridge, never narrative direct writes.

## Sporting closure authority

RET-007 is already implemented against the shared `SportContext` contract:

- known `remainingOfficialMatches > 0` suppresses administrative closure;
- known `remainingOfficialMatches === 0` permits closure;
- unavailable authority keeps only the historical administrative fallback.

Current `main` does not yet contain the producer, but PR #156 head `bbb491fac05fe4d981ae9e6c518c0a2c5aa57de7` is now fully Repository-Integrity certified (run `35259511375`). Stacked PR #202 provides the focused-green public latest-player-appearance query. Do not copy either producer-private store into retirement; consume the public read API only after integration.
