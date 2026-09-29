# VDR-NAV-001 — Five vs six primary destinations

**VDR_ID:** VDR-NAV-001  
**TITLE:** Five vs six primary navigation destinations  
**STATUS:** PROPOSED  
**DATE:** 2026-09-29  
**BASE_SHA:** c5b6d0d6d18802a62d174bf450c95ebf1d0403c0  
**SURFACE:** global navigation

## PROBLEM

Current product has six real destinations: Inicio, Carrera, Mundo, Relaciones, Perfil, Tu partida. Mobile labels render at 9 px and 8 px at the narrowest breakpoint. A five-destination concept could reduce density, but removing/merging a destination risks discoverability and functional regression.

## BASELINE

Six destinations are implemented and public. `Tu partida` contains save/import/new-story actions and cannot simply disappear.

## OPTIONS

- **A — Six destinations:** preserve current information architecture; improve spacing/type/icon treatment only.
- **B — Five visible destinations:** one current destination becomes accessible through another real surface/overflow pattern without losing functionality.

No option may create a new destination or hide save/recovery access.

## METRICS

Use all ten A/B criteria, with emphasis on next-step clarity, vertical density, scanability, one-hand ergonomics, continuity and accessibility.

## DECISION

Pending.

## JUSTIFICATION

Pending evidence.

## RISKS

Five destinations may reduce direct access; six may continue small labels/crowding.

## A11Y

Compare label size, touch targets, focus order and discoverability.

## PERFORMANCE

Negligible runtime effect expected; verify no extra navigation layer causes churn.

## PLATFORM

Must remain one shared information architecture across Web/PlayCanvas/Android.

## ROLLBACK

Restore six direct destinations.

## EVIDENCE

P0 nav geometry/typography metrics + later A/B captures.
