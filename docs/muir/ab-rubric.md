# MUIR P1 — A/B evaluation rubric

Exactly one rubric governs visual A/B decisions in later MUIR passes. It evaluates evidence, not taste.

| # | Criterion | What to measure/inspect | Acceptance rule |
|---:|---|---|---|
| 1 | Continuity | protected dark/blue/gold/rounded/narrative identity | **No worse.** A candidate that breaks protected identity fails regardless of other gains. |
| 2 | Next-step clarity | time to identify primary next action; ambiguity/errors | **Improve when this is the target**, otherwise no regression. |
| 3 | Football-game feel | recognizable career/sport hierarchy without invented data | **Improve** versus baseline for a targeted redesign. |
| 4 | Vertical density | useful public information visible per viewport; scroll burden | **Improve without essential information loss.** |
| 5 | Scanability | heading/label/value grouping, action recognition, clutter | **Improve.** |
| 6 | One-hand ergonomics | reach/touch size/primary action placement on phone | **No worse.** |
| 7 | Youthful, not infantilized | typography/icon/copy maturity and energy | **Maintain or improve.** |
| 8 | Visual consistency | token/component adherence; accidental variance | **Improve.** |
| 9 | Narrative weight | prominence/readability of story/decision/result moments | **No worse.** |
| 10 | Accessibility/performance | focus, reduced motion, touch, overflow, Long Tasks, render metrics | **No worse.** |

## Evidence rules

- Use the same content/state/viewport for A and B.
- Compare at minimum 360×800, 390×844 and 412×915 when mobile is affected.
- Use P0 metrics as reference where relevant.
- Record the measured/observed difference, not “I like B more”.
- A visual candidate cannot win by hiding required public information.
- A candidate cannot pass if it introduces unsupported functionality.
- Any criterion marked worse contrary to its acceptance rule rejects the candidate or requires a documented VDR exception.

## Decision record

A/B evidence should state:
- baseline/candidate refs;
- fixtures and viewport;
- which criteria were targeted;
- observed/metric deltas;
- regressions;
- resulting VDR or implementation decision.

No aggregate taste score is required; pass/fail is determined criterion by criterion.
