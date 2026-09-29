# VDR-GLASS-001 — Glass/blur performance level

**VDR_ID:** VDR-GLASS-001  
**TITLE:** Glass strength and mobile performance  
**STATUS:** PROPOSED  
**DATE:** 2026-09-29  
**BASE_SHA:** c5b6d0d6d18802a62d174bf450c95ebf1d0403c0  
**SURFACE:** topbar, navigation, glass buttons, cinematic sheet/backdrop

## PROBLEM

Current UI uses backdrop blur 20/26/30 px plus 8 px dialog backdrop blur. The concept is intentional, but semantic hierarchy and mobile cost are not formally proven.

## BASELINE

P0: render p50 ~0.20 ms; p95 ~64.20 ms; max Long Task 159 ms. Current blur values are part of that baseline.

## OPTIONS

- **A — Preserve current blur strengths.**
- **B — Reduce/standardize blur by semantic surface while preserving translucent depth.**
- **C — Conditional lower blur at narrow/mobile breakpoints.**

## METRICS

Rubric emphasis: continuity, visual consistency, accessibility/performance. Compare render/Long Task evidence on the same fixtures.

## DECISION

Pending.

## JUSTIFICATION

Pending evidence.

## RISKS

Lower blur may flatten premium/cinematic feel; high blur may cost performance/readability.

## A11Y

Maintain text/background contrast and focus visibility.

## PERFORMANCE

Must be measured, not assumed. No candidate may regress P0 performance materially without a documented tradeoff.

## PLATFORM

One shared rule set; no separate Android visual implementation.

## ROLLBACK

Restore exact current blur declarations.

## EVIDENCE

P0 performance metrics + later A/B captures/metrics.
