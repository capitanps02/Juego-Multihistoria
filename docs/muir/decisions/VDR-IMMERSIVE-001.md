# VDR-IMMERSIVE-001 — Navigation in immersive scenes

**VDR_ID:** VDR-IMMERSIVE-001  
**TITLE:** Navigation visible vs hidden in immersive decision/result scenes  
**STATUS:** PROPOSED  
**DATE:** 2026-09-29  
**BASE_SHA:** c5b6d0d6d18802a62d174bf450c95ebf1d0403c0  
**SURFACE:** cinematic decision/result/offer

## PROBLEM

Current immersive mode keeps navigation present at reduced opacity. This preserves escape/discoverability but competes with narrative focus.

## BASELINE

`.immersive .navigation { opacity: .65 }`; canonical Back/Home actions also exist in cinematic content.

## OPTIONS

- **A — Keep visible navigation with reduced emphasis.**
- **B — Hide/collapse global navigation only while an immersive sheet is active, preserving an explicit accessible route back.**

## METRICS

Rubric emphasis: continuity, next-step clarity, scanability, one-hand ergonomics, narrative weight, accessibility.

## DECISION

Pending.

## JUSTIFICATION

Pending evidence.

## RISKS

Hidden nav may trap/confuse users; visible nav may dilute decisions.

## A11Y

Escape/back/focus path must remain obvious and keyboard-accessible.

## PERFORMANCE

No measurable regression expected; verify layout churn.

## PLATFORM

Behavior must match shared UI on all platforms.

## ROLLBACK

Restore current opacity-based immersive treatment.

## EVIDENCE

P0 decision/result captures + later A/B.
