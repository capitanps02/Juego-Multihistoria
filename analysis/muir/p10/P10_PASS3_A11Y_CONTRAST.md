# MUIR P10 — Pass 3 A11Y / contrast audit

Status: IMPLEMENTED, executable browser/AXE verification pending.

## Static contrast findings

WCAG AA normal-text target used for small operational copy: 4.5:1.

### Corrected in P10

| Surface | Before | After | Ratio after | Status |
|---|---|---|---:|---|
| Primary CTA white text / gradient start | #2594ff | #0a6dcc | 5.16:1 | PASS static |
| Primary CTA white text / gradient end | #087aee | #075fbd | 6.21:1 | PASS static |
| Small muted text / surface-1 | #626267 / #77777d variants | #8b8b90 | 5.43:1 | PASS static |
| Small muted text / surface-2 | #626267 / #77777d variants | #8b8b90 | 4.79:1 | PASS static |

The blue family remains the primary interaction identity; this is an accessibility darkening, not a generic recolor.

### Existing semantic colors retained

- prestige gold #d6b86a on dark surface: high contrast;
- danger #ff8a82 on dark surface: high contrast;
- success #7ddf9a on dark surface: high contrast;
- warning/fallback warm copy remains textually identified and does not rely on color alone.

## Semantics

Static source audit confirms:
- global error feedback retains role=alert;
- loading/busy retains role=status;
- auto-sim status retains polite live semantics;
- paired SVG icons remain aria-hidden and non-focusable;
- controls retain native button/input/summary semantics;
- P10 adds no ARIA solely to silence AXE.

## Fresh AXE requirement

The P10 workflow must rerun:
- Shell/Home
- Player Actions
- Auto-sim
- Mundo
- Carrera
- Relaciones
- Perfil
- Tu partida
- Decision
- Result
- Offer
- Cinematic/fallback

P10 does not promote AXE to PASS from predecessor evidence alone.

## Severity gate

Required for final gate:
- CRITICAL new = 0
- any SERIOUS/MODERATE/MINOR finding must be recorded if produced by the fresh probes
- exceptions require issue/owner/justification/impact/plan

## Focus

Implemented:
- button/summary/input/anchor/main share the P1 focus outline + halo contract;
- timeline programmatic target uses focus-visible rather than a separate prestige-only outline;
- focus is not removed from main without replacement.

Fresh keyboard/focus browser verification is still required.

## TalkBack

Status: MANUAL_REQUIRED.

Browser/AXE/ARIA evidence is not represented as physical TalkBack evidence. If not executable during P10, ownership is explicitly deferred to P12 and P10 will not claim TalkBack PASS.
