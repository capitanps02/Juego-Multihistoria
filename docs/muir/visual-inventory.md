# MUIR P1 — Visual inventory and continuity audit

Authority: `web/game-ui.css`, `web/game-ui.js` and P0 evidence on certified base `c5b6d0d6d18802a62d174bf450c95ebf1d0403c0`.

P1 purpose: describe the existing visual language before normalizing it. This document is not a screen redesign and creates no new gameplay/data authority.

## Classification vocabulary

- **INTENTIONAL** — visibly repeated or semantically anchored in the current product.
- **ACCIDENTAL** — near-duplicate values with no demonstrated semantic distinction.
- **UNKNOWN** — may encode a useful hierarchy, but current production has no named contract proving that hierarchy. Must not be normalized without a VDR or component-level justification.

## Current identity — INTENTIONAL

| Family | Current evidence | Classification | P1 rule |
|---|---|---|---|
| Dark foundation | `#000`, `#09090b`, `#111`, `#141416`, `#202023` | INTENTIONAL | Preserve dark depth; do not flatten to generic light/gray UI. |
| Primary interactive blue | `#409cff`, `#0a84ff`, `#2594ff → #087aee` | INTENTIONAL family; individual values partly accidental | Preserve blue as action/focus emphasis. Normalize semantic roles later. |
| Prestige gold | `#d6b86a` + alpha variants | INTENTIONAL | Reserve for prestige, milestones, brand and selective career emphasis. |
| Positive semantic | `#30d158`, `#7ddf9a` | INTENTIONAL family | Green remains positive/fitness/progress, never primary navigation. |
| Negative/error semantic | `#ff453a80`, `#ff8a82`, `#382224` | INTENTIONAL family | Red remains error/unfavorable only. |
| Rounded geometry | common 14 / 24 / 25 / 27 px families | INTENTIONAL | Preserve broad rounded geometry while reducing unowned variants. |
| Glass/depth | translucent charcoal + blur | INTENTIONAL concept | Preserve depth; exact blur strengths remain adaptable. |
| Narrative scale | large display headings + cinematic sheets | INTENTIONAL | Preserve narrative emphasis over spreadsheet density. |
| Motion | button transition `.18s`, reduced-motion hard override | INTENTIONAL | Keep restrained feedback; reduced-motion remains authoritative. |
| Icon geometry | inline SVG, 20 px, stroke 1.6, round caps/joins | INTENTIONAL | Becomes P1 icon contract; no emoji/mixed packs. |

## Value proliferation — ACCIDENTAL unless later justified

### Radius inventory

Distinct production radii:

`8, 9, 10, 12, 13, 14, 16, 18, 19, 20, 24, 25, 27 px`, plus `999px` pill and `50%` circle.

The semantic product hierarchy does not name thirteen rectangular radii. P1 treats the proliferation as **ACCIDENTAL** while preserving the visual character. Token normalization may map existing components to a smaller set without changing screen structure.

### Neutral/overlay inventory

Production contains many near-adjacent overlays:
`#ffffff06, 08, 09, 0b, 0c, 0d, 0f, 10, 12, 16, 18, 1f, 20, 22, 24, 25, 26, 30, 40`.

The existence of translucent layering is intentional; the number of distinct stops is **ACCIDENTAL** unless a component contract proves otherwise.

### Blue inventory

`#409cff`, `#0a84ff`, `#2594ff`, `#087aee` plus alpha variants currently represent focus, active nav, primary buttons and choice states.

Blue as a family is intentional; exact duplication is **ACCIDENTAL/UNKNOWN** until P1 tokens assign semantic roles.

### Spacing inventory

Observed gaps include `5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 18, 20 px`; padding uses a similarly granular set.

This granularity is **ACCIDENTAL** at system level. Component-specific exceptions may remain only when documented.

## UNKNOWN hierarchy requiring later decision

| Area | Current values | Why UNKNOWN | Required mechanism |
|---|---|---|---|
| Glass strength | blur 20 / 26 / 30 px; backdrop blur 8 px | Could represent elevation, but no semantic naming exists | VDR-GLASS-001 + surface tokens |
| Hero height | 360 desktop, 380 mobile, 430 wide, 350 profile mobile | Product may depend on composition; no density objective is named | VDR-HERO-001 |
| Immersive navigation | navigation remains present at reduced opacity | Intent is visible but not formalized | VDR-IMMERSIVE-001 |
| Six primary destinations | Home, Carrera, Mundo, Relaciones, Perfil, Tu partida | Real product has six; design alternatives discuss five | VDR-NAV-001 |
| Topbar/nav glass distinction | blur 26 vs 30 | May encode hierarchy, may be drift | VDR-GLASS-001 |
| 25/27 px large radii | topbar/world vs navigation/hero | Could be deliberate optical tuning | token normalization record |

## Accessibility/performance debt observed in P0 baseline

P0 exact-head browser evidence recorded:

- 69 / 69 deterministic screenshots;
- 0 horizontal overflow findings;
- 23 undersized touch-target findings across the complete capture matrix;
- render p50 ≈ 0.20 ms;
- render p95 ≈ 64.20 ms;
- max DOM nodes 154;
- max Long Task 159 ms;
- auto-sim UI update rate ≈ 5.90 Hz.

Known static risk consistent with that evidence: mobile `.cinema-top button` has `min-height:39px`, below the 44 px baseline criterion. P1 records the debt; later visual implementation passes may fix it. P1 itself does not modify production CSS.

Navigation labels are 9 px at <=820 px and 8 px at <=390 px. This is a readability risk and must be considered by VDR-NAV-001 / later implementation, not silently changed here.

## Typography inventory

Current family is system-first:
`-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif`.

Observed sizes span 8–52 px plus three display clamps. The system has recognizable roles but no semantic names. P1 will define display/title/heading/body/body-small/label/caption tokens from these current values rather than import an external type scale.

## Current reusable presentation primitives

Production already has implicit primitives:

- `.panel`
- `.hero`
- `.primary`, `.secondary`, `.glass`, `.ghost`
- `.data-row`
- `.eyebrow`
- `.navigation`, `.nav-button`
- `.decision-sheet`
- `.dialog`
- `.alert`
- `.milestone-chip`
- `.player-action-card`
- `.period-summary`
- `.retirement-panel`

P1 will name semantic component contracts around existing public data. It will not create a generic framework detached from Multihistoria.

## Continuity guard

P1 normalization must preserve at least 70–80% of the current identity:

1. dark cinematic foundation;
2. rounded depth;
3. blue interaction emphasis;
4. restrained prestige gold;
5. narrative-first composition;
6. current public information hierarchy;
7. shared Web / PlayCanvas / Android authority.

A normalization is only permitted when it has: current value, proposed semantic token/contract, affected components, reason, risk and rollback.

## Scope evidence

At P1 start, `web/game-ui.css` and `web/game-ui.js` are byte-identical to the P0 certified product authority. P1 pass 1 adds documentation only and redesigns no complete screen.
