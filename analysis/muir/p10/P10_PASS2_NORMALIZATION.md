# MUIR P10 — Pass 2 normalization record

Authority: P1 design contract + P9 certified product line.

| ID | ANTES | DESPUÉS | COMPONENTES | RAZÓN | RIESGO | ROLLBACK |
|---|---|---|---|---|---|---|
| P10-RADIUS-001 | 25 px | radius-panel 24 px | topbar, world banner, dialog | remove 1 px drift against P1 panel token | subtle optical compactness | restore local 25 px |
| P10-RADIUS-002 | 19/16 px | radius-medium 18 px | compact topbar/navigation | one compact-shell radius | compact landscape may feel rounder | restore breakpoint-local value |
| P10-RADIUS-003 | 13/12 px | radius-control 14 px | nav button, input, pause status, offer loan state | common control geometry | small footprint change | restore component-local value |
| P10-RADIUS-004 | 9/13 px | radius-small 10 px / control 14 px | choice key, news thumb, glossary/retirement detail | remove unowned variants while keeping semantic role | optical shift | restore component-local radius |
| P10-RADIUS-005 | 16 px | radius-medium 18 px | match/consequence/save support/prologue compact sub-surfaces | align compact surfaces | slightly softer corners | restore 16 px |
| P10-RADIUS-006 | 20/21 px | radius-medium 18 px | compact cinema/Decision/Offer | one compact immersive surface radius | immersive sheet looks marginally tighter | restore breakpoint-local value |
| P10-RADIUS-007 | 25 px | radius-immersive 27 px | desktop Decision sheet | align immersive shell token | slightly rounder desktop sheet | restore 25 px |
| P10-PROGRESS-001 | 8 px | radius-pill 999 px | standard progress meter | match semantic progress treatment used by auto-sim | visual end-cap change | restore 8 px |
| P10-SPACE-001 | 7 px | space-2 8 px | desktop navigation | canonical compact group gap | +1 px footprint | restore 7 px |
| P10-SPACE-002 | 13 px | space-4 12 px | desktop nav icon/label | canonical control spacing | -1 px separation | restore 13 px |
| P10-SPACE-003 | 11 px | space-4 12 px | meter | remove unowned spacing | +1 px | restore 11 px |
| P10-SPACE-004 | 15 px | space-6 16 px | cinema top | canonical block spacing | +1 px | restore 15 px |
| P10-SPACE-005 | 18 px | space-7 20 px | wide Home grid | canonical major separation | +2 px at wide desktop | restore 18 px |
| P10-SPACE-006 | 9 px | space-3 10 px | compact people grid / choices | canonical compact spacing | +1 px may alter wrap threshold | restore 9 px |
| P10-TYPE-001 | visible 8/9 px | caption 10 px | nav supporting copy, Home eyebrow, save status, compact brand/cinema eyebrow | meet P1 caption floor | compact labels wrap sooner | restore only with explicit evidence |
| P10-FOCUS-001 | focus contract missing on anchors/main; timeline used 2 px prestige focus | shared 3 px blue outline + halo + 5 px offset | anchors, main, timeline, buttons, summaries, inputs | consistent visible focus | halo may be visually stronger in dense areas | restore component rule only if clipping is proven |
| P10-DIS-001 | global disabled cursor = wait | global disabled cursor = not-allowed; busy remains role=status | buttons | distinguish disabled from loading | none expected | restore only if a true pending control needs a component-local busy cursor |
| P10-ICON-001 | coherent SVG family but no family marker/focusable hint | same paths + `.muir-icon` + semantic data key + `focusable=false` | nav + Player Actions icon-bearing controls | make one pack machine-auditable without adding decorative icons | DOM snapshot changes | revert icon helper only |

## Explicit exceptions retained

- `result-choice: 0 14px 14px 0`: asymmetric geometry conveys the selected-choice marker.
- 3/4/5 px micro-gaps: retained only inside tightly coupled micro-content (nav compact icon/label, auto-sim metadata, semantic row/card internals).
- 999 px: pills/progress.
- 50%: avatars.
- text-only actions remain text-only; P10 does not add decorative icons merely to increase icon coverage.

## Static post-change audit

- visible font sizes below 10 px: 0
- prohibited 8/9/12/13/16/19/20/21/25 px standalone radii: 0
- high-confidence 7/9/11/13/15/18 px system gap drift: 0
- global cursor:wait: 0
- emoji functional/system icons: 0
- focus-visible contract: anchors + main + controls + timeline present
- reduced-motion media query preserved

Browser/AXE/functional evidence is required before this pass can be promoted to PASS.
